"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getTeamsByUserId,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
} from "@/utils/supabase/queries"
import type { Tables } from "@/types/database.types"
import type { TeamWithRole } from "@/types/models"

type Team = Tables<"teams">
type TeamMember = {
  id: string
  role: "owner" | "admin" | "member"
  created_at: string
  user: Pick<Tables<"users">, "id" | "email" | "display_name" | "avatar_url">
}

export function useTeams(userId?: string) {
  const [teams, setTeams] = useState<TeamWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchTeams() {
      try {
        setLoading(true)
        const { data, error } = await getTeamsByUserId(userId!)

        if (error) throw error

        // Extract teams from team_members relation and include role
        const teamsWithRole = data?.map((tm: any) => ({
          ...tm.team,
          role: tm.role,
        })).filter(Boolean) as TeamWithRole[]
        setTeams(teamsWithRole)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [userId])

  const createTeam = async (name: string, description?: string) => {
    if (!userId) throw new Error("User ID is required")

    const supabase = createClient()

    // Get access token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error("No valid session found")
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables not configured")
    }

    // Create team using direct fetch to Supabase REST API
    // POST https://{NEXT_PUBLIC_SUPABASE_URL}/rest/v1/teams
    const teamResponse = await fetch(`${supabaseUrl}/rest/v1/teams`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name,
        description: description || null,
        owner_id: userId,
      }),
    })

    if (!teamResponse.ok) {
      const error = await teamResponse.json()
      throw new Error(error.message || "Failed to create team")
    }

    const [team] = await teamResponse.json()

    // Add creator as team owner
    // POST https://{NEXT_PUBLIC_SUPABASE_URL}/rest/v1/team_members
    const memberResponse = await fetch(`${supabaseUrl}/rest/v1/team_members`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: team.id,
        user_id: userId,
        role: "owner",
      }),
    })

    if (!memberResponse.ok) {
      // Rollback team creation if adding member fails
      await fetch(`${supabaseUrl}/rest/v1/teams?id=eq.${team.id}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const error = await memberResponse.json()
      throw new Error(error.message || "Failed to add team member")
    }

    // Add team with role to state
    const teamWithRole: TeamWithRole = {
      ...team,
      role: "owner",
    }
    setTeams((prev) => [...prev, teamWithRole])
    return teamWithRole
  }

  const updateTeam = async (
    teamId: string,
    updates: Partial<Pick<Team, "name" | "description">>
  ) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select()
      .single()

    if (error) throw error

    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? data : team))
    )
    return data
  }

  const deleteTeam = async (teamId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").delete().eq("id", teamId)

    if (error) throw error

    setTeams((prev) => prev.filter((team) => team.id !== teamId))
  }

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
  }
}

export function useTeamMembers(teamId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }

    async function fetchMembers() {
      try {
        setLoading(true)
        const { data, error } = await getTeamMembers(teamId!)

        if (error) throw error

        setMembers(data as any as TeamMember[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [teamId])

  const addMember = async (
    userId: string,
    role: "owner" | "admin" | "member" = "member"
  ) => {
    if (!teamId) throw new Error("Team ID is required")

    const { data, error } = await addTeamMember(teamId, userId, role)
    if (error) throw error

    // Refetch members to get updated list
    const { data: updatedMembers } = await getTeamMembers(teamId)
    setMembers(updatedMembers as any as TeamMember[])

    return data
  }

  const removeMember = async (memberId: string) => {
    const { error } = await removeTeamMember(memberId)
    if (error) throw error

    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const updateMemberRole = async (
    memberId: string,
    role: "owner" | "admin" | "member"
  ) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", memberId)
      .select()
      .single()

    if (error) throw error

    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role } : member
      )
    )
    return data
  }

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    updateMemberRole,
  }
}
