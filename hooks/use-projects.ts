"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createDefaultStatuses } from "@/utils/supabase/queries"
import type { Tables } from "@/types/database.types"

type Project = Tables<"projects">
type Status = Tables<"statuses">

export function useProjects(teamId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }

    async function fetchProjects() {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setProjects(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [teamId])

  const createProject = async (
    projectData: Pick<Project, "name" | "key" | "description" | "icon">
  ) => {
    if (!teamId) throw new Error("Team ID is required")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("projects")
      .insert({
        team_id: teamId,
        ...projectData,
      })
      .select()
      .single()

    if (error) throw error

    // Create default statuses for new project
    await createDefaultStatuses(data.id)

    setProjects((prev) => [data, ...prev])
    return data
  }

  const updateProject = async (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "key" | "description" | "icon">>
  ) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select()
      .single()

    if (error) throw error

    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? data : project))
    )
    return data
  }

  const deleteProject = async (projectId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)

    if (error) throw error

    setProjects((prev) => prev.filter((project) => project.id !== projectId))
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  }
}

export function useProjectStatuses(projectId?: string) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    async function fetchStatuses() {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from("statuses")
          .select("*")
          .eq("project_id", projectId)
          .order("order", { ascending: true })

        if (error) throw error

        setStatuses(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatuses()
  }, [projectId])

  const createStatus = async (
    statusData: Pick<Status, "name" | "color" | "order">
  ) => {
    if (!projectId) throw new Error("Project ID is required")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("statuses")
      .insert({
        project_id: projectId,
        ...statusData,
      })
      .select()
      .single()

    if (error) throw error

    setStatuses((prev) => [...prev, data].sort((a, b) => a.order - b.order))
    return data
  }

  const updateStatus = async (
    statusId: string,
    updates: Partial<Pick<Status, "name" | "color" | "order">>
  ) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("statuses")
      .update(updates)
      .eq("id", statusId)
      .select()
      .single()

    if (error) throw error

    setStatuses((prev) =>
      prev
        .map((status) => (status.id === statusId ? data : status))
        .sort((a, b) => a.order - b.order)
    )
    return data
  }

  const deleteStatus = async (statusId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("statuses").delete().eq("id", statusId)

    if (error) throw error

    setStatuses((prev) => prev.filter((status) => status.id !== statusId))
  }

  return {
    statuses,
    loading,
    error,
    createStatus,
    updateStatus,
    deleteStatus,
  }
}
