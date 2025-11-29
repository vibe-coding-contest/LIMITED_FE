"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getIssuesByProjectId,
  getIssuesByStatusId,
  moveIssue,
  updateIssueOrder,
} from "@/utils/supabase/queries"
import {
  createRealtimeChannel,
  subscribeToChanges,
  cleanupChannel,
  optimisticAdd,
  optimisticUpdate,
  optimisticDelete,
  rollbackOptimistic,
} from "@/utils/supabase/realtime"
import type { Tables, Database } from "@/types/database.types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Issue = Tables<"issues"> & {
  status: Tables<"statuses">
  assignee: Pick<Tables<"users">, "id" | "display_name" | "avatar_url"> | null
  reporter: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

type IssueInsert = Database["public"]["Tables"]["issues"]["Insert"]

export function useIssues(projectId?: string) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel

    async function fetchIssues() {
      try {
        setLoading(true)
        const { data, error } = await getIssuesByProjectId(projectId!)

        if (error) throw error

        setIssues(data as Issue[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchIssues()

    // Subscribe to real-time updates
    channel = createRealtimeChannel(supabase, `issues:project_id=eq.${projectId}`)

    // Listen for INSERT events
    subscribeToChanges(
      channel,
      {
        schema: "public",
        table: "issues",
        filter: `project_id=eq.${projectId}`,
        event: "INSERT",
      },
      async (payload) => {
        // Fetch the complete issue with relations
        const { data } = await supabase
          .from("issues")
          .select(
            `
            *,
            status:statuses (
              id,
              name,
              color,
              order
            ),
            assignee:users!issues_assignee_id_fkey (
              id,
              display_name,
              avatar_url
            ),
            reporter:users!issues_reporter_id_fkey (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("id", (payload.new as any).id)
          .single()

        if (data) {
          setIssues((prev) => [...prev, data as Issue])
        }
      }
    )

    // Listen for UPDATE events
    subscribeToChanges(
      channel,
      {
        schema: "public",
        table: "issues",
        filter: `project_id=eq.${projectId}`,
        event: "UPDATE",
      },
      async (payload) => {
        // Fetch the complete issue with relations
        const { data } = await supabase
          .from("issues")
          .select(
            `
            *,
            status:statuses (
              id,
              name,
              color,
              order
            ),
            assignee:users!issues_assignee_id_fkey (
              id,
              display_name,
              avatar_url
            ),
            reporter:users!issues_reporter_id_fkey (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("id", (payload.new as any).id)
          .single()

        if (data) {
          setIssues((prev) =>
            prev.map((issue) => (issue.id === (payload.new as any).id ? (data as Issue) : issue))
          )
        }
      }
    )

    // Listen for DELETE events
    subscribeToChanges(
      channel,
      {
        schema: "public",
        table: "issues",
        filter: `project_id=eq.${projectId}`,
        event: "DELETE",
      },
      (payload) => {
        setIssues((prev) => prev.filter((issue) => issue.id !== (payload.old as any).id))
      }
    )

    channel.subscribe()

    return () => {
      cleanupChannel(supabase, channel)
    }
  }, [projectId])

  const createIssue = async (
    issueData: Pick<
      IssueInsert,
      "title" | "description" | "status_id" | "priority" | "assignee_id" | "reporter_id"
    >
  ) => {
    if (!projectId) throw new Error("Project ID is required")

    const supabase = createClient()

    // Get current max order for the status
    const { data: existingIssues } = await supabase
      .from("issues")
      .select("order")
      .eq("project_id", projectId)
      .eq("status_id", issueData.status_id)
      .order("order", { ascending: false })
      .limit(1)

    const maxOrder = existingIssues?.[0]?.order || "0"
    const newOrder = (parseInt(maxOrder) + 1).toString()

    // Create optimistic issue
    const optimisticIssue: Partial<Issue> = {
      id: `temp-${Date.now()}`,
      title: issueData.title,
      description: issueData.description,
      priority: issueData.priority,
      project_id: projectId,
      status_id: issueData.status_id,
      assignee_id: issueData.assignee_id,
      reporter_id: issueData.reporter_id,
      order: newOrder,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Save previous state for rollback
    const previousIssues = [...issues]

    // Optimistic update
    setIssues((prev) => optimisticAdd(prev, optimisticIssue as Issue))

    try {
      const { data, error } = await supabase
        .from("issues")
        .insert({
          project_id: projectId,
          ...issueData,
          order: newOrder,
        })
        .select(
          `
          *,
          status:statuses (
            id,
            name,
            color,
            order
          ),
          assignee:users!issues_assignee_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reporter:users!issues_reporter_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `
        )
        .single()

      if (error) throw error

      // Replace optimistic issue with real data
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === optimisticIssue.id ? (data as Issue) : issue
        )
      )

      return data as Issue
    } catch (error) {
      // Rollback on error
      rollbackOptimistic(setIssues, previousIssues)
      throw error
    }
  }

  const updateIssue = async (
    issueId: string,
    updates: Partial<
      Pick<
        IssueInsert,
        "title" | "description" | "status_id" | "priority" | "assignee_id"
      >
    >
  ) => {
    const supabase = createClient()

    // Save previous state for rollback
    const previousIssues = [...issues]

    // Optimistic update
    setIssues((prev) =>
      optimisticUpdate(prev, issueId, {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Partial<Issue>)
    )

    try {
      const { data, error } = await supabase
        .from("issues")
        .update(updates)
        .eq("id", issueId)
        .select(
          `
          *,
          status:statuses (
            id,
            name,
            color,
            order
          ),
          assignee:users!issues_assignee_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reporter:users!issues_reporter_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `
        )
        .single()

      if (error) throw error

      // Update with real data from server
      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? (data as Issue) : issue))
      )
      return data as Issue
    } catch (error) {
      // Rollback on error
      rollbackOptimistic(setIssues, previousIssues)
      throw error
    }
  }

  const deleteIssue = async (issueId: string) => {
    const supabase = createClient()

    // Save previous state for rollback
    const previousIssues = [...issues]

    // Optimistic delete
    setIssues((prev) => optimisticDelete(prev, issueId))

    try {
      const { error } = await supabase.from("issues").delete().eq("id", issueId)

      if (error) throw error
    } catch (error) {
      // Rollback on error
      rollbackOptimistic(setIssues, previousIssues)
      throw error
    }
  }

  const handleMoveIssue = async (
    issueId: string,
    statusId: string,
    order: string
  ) => {
    const { data, error } = await moveIssue(issueId, statusId, order)
    if (error) throw error

    // Refetch issues to get updated state
    if (projectId) {
      const { data: updatedIssues } = await getIssuesByProjectId(projectId)
      setIssues(updatedIssues as Issue[])
    }

    return data
  }

  const handleUpdateOrder = async (issueId: string, order: string) => {
    const { data, error } = await updateIssueOrder(issueId, order)
    if (error) throw error

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, order } : issue
      )
    )
    return data
  }

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue: handleMoveIssue,
    updateOrder: handleUpdateOrder,
  }
}

export function useIssuesByStatus(projectId?: string) {
  const [issuesByStatus, setIssuesByStatus] = useState<Record<string, Issue[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    async function fetchIssuesByStatus() {
      try {
        setLoading(true)
        const { data, error } = await getIssuesByStatusId(projectId!)

        if (error) throw error

        setIssuesByStatus(data as Record<string, Issue[]>)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchIssuesByStatus()
  }, [projectId])

  return {
    issuesByStatus,
    loading,
    error,
  }
}
