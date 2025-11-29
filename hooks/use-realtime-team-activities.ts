"use client"

/**
 * useRealtimeTeamActivities Hook
 *
 * Tracks real-time team activities including:
 * - Team member changes (added, removed, role updated)
 * - Project changes (created, updated, deleted)
 * - Team updates (name, description changes)
 *
 * Provides a live activity feed for team dashboards
 */

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  createRealtimeChannel,
  subscribeToChanges,
  cleanupChannel,
} from "@/utils/supabase/realtime"
import type { Tables } from "@/types/database.types"
import type { RealtimeChannel } from "@supabase/supabase-js"

/**
 * Activity types for team activities
 */
export type ActivityType =
  | "member_added"
  | "member_removed"
  | "member_role_updated"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "team_updated"

/**
 * Team activity event
 */
export interface TeamActivity {
  id: string
  type: ActivityType
  teamId: string
  userId?: string
  userName?: string
  projectId?: string
  projectName?: string
  metadata?: Record<string, any>
  timestamp: string
}

/**
 * Team member with user details
 */
interface TeamMemberWithUser {
  id: string
  team_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  created_at: string
  user: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

/**
 * Project with basic details
 */
interface ProjectWithDetails {
  id: string
  name: string
  key: string
  team_id: string
}

/**
 * Team with basic details
 */
interface TeamWithDetails {
  id: string
  name: string
  description: string | null
}

/**
 * Hook configuration
 */
interface UseRealtimeTeamActivitiesOptions {
  maxActivities?: number
  includeMembers?: boolean
  includeProjects?: boolean
  includeTeamUpdates?: boolean
}

/**
 * Real-time team activities tracker
 *
 * @param teamId - Team ID to track
 * @param options - Configuration options
 * @returns Team activities state and loading status
 *
 * @example
 * ```tsx
 * function TeamDashboard({ teamId }) {
 *   const { activities, loading } = useRealtimeTeamActivities(teamId, {
 *     maxActivities: 50,
 *     includeMembers: true,
 *     includeProjects: true
 *   })
 *
 *   return (
 *     <div>
 *       {activities.map(activity => (
 *         <ActivityItem key={activity.id} activity={activity} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeTeamActivities(
  teamId?: string,
  options: UseRealtimeTeamActivitiesOptions = {}
) {
  const {
    maxActivities = 100,
    includeMembers = true,
    includeProjects = true,
    includeTeamUpdates = true,
  } = options

  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const channels: RealtimeChannel[] = []

    // Initialize activities array
    setActivities([])
    setLoading(false)

    // Helper function to add activity
    const addActivity = (activity: TeamActivity) => {
      setActivities((prev) => {
        const updated = [activity, ...prev]
        return updated.slice(0, maxActivities)
      })
    }

    // Subscribe to team_members changes
    if (includeMembers) {
      const membersChannel = createRealtimeChannel(
        supabase,
        `team_members:team_id=eq.${teamId}`
      )

      // Member added
      subscribeToChanges(
        membersChannel,
        {
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
          event: "INSERT",
        },
        async (payload) => {
          const newMember = payload.new as any
          // Fetch user details
          const { data: member } = await supabase
            .from("team_members")
            .select(
              `
              id,
              team_id,
              user_id,
              role,
              created_at,
              user:users (
                id,
                display_name,
                avatar_url
              )
            `
            )
            .eq("id", newMember.id)
            .single()

          if (member) {
            const typedMember = member as unknown as TeamMemberWithUser
            addActivity({
              id: `member-add-${typedMember.id}`,
              type: "member_added",
              teamId,
              userId: typedMember.user_id,
              userName: typedMember.user.display_name,
              metadata: { role: typedMember.role },
              timestamp: typedMember.created_at,
            })
          }
        }
      )

      // Member removed
      subscribeToChanges(
        membersChannel,
        {
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
          event: "DELETE",
        },
        (payload) => {
          const oldMember = payload.old as any
          addActivity({
            id: `member-remove-${oldMember.id}`,
            type: "member_removed",
            teamId,
            userId: oldMember.user_id,
            timestamp: new Date().toISOString(),
          })
        }
      )

      // Member role updated
      subscribeToChanges(
        membersChannel,
        {
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
          event: "UPDATE",
        },
        async (payload) => {
          const oldMember = payload.old as any
          const newMember = payload.new as any
          // Only track role changes
          if (oldMember.role !== newMember.role) {
            const { data: member } = await supabase
              .from("team_members")
              .select(
                `
                id,
                user:users (
                  display_name
                )
              `
              )
              .eq("id", newMember.id)
              .single()

            if (member) {
              const typedMember = member as unknown as {
                id: string
                user: { display_name: string }
              }
              addActivity({
                id: `member-role-${newMember.id}-${Date.now()}`,
                type: "member_role_updated",
                teamId,
                userId: newMember.user_id,
                userName: typedMember.user.display_name,
                metadata: {
                  oldRole: oldMember.role,
                  newRole: newMember.role,
                },
                timestamp: new Date().toISOString(),
              })
            }
          }
        }
      )

      membersChannel.subscribe()
      channels.push(membersChannel)
    }

    // Subscribe to projects changes
    if (includeProjects) {
      const projectsChannel = createRealtimeChannel(
        supabase,
        `projects:team_id=eq.${teamId}`
      )

      // Project created
      subscribeToChanges(
        projectsChannel,
        {
          schema: "public",
          table: "projects",
          filter: `team_id=eq.${teamId}`,
          event: "INSERT",
        },
        (payload) => {
          const newProject = payload.new as any
          addActivity({
            id: `project-create-${newProject.id}`,
            type: "project_created",
            teamId,
            projectId: newProject.id,
            projectName: newProject.name,
            metadata: { key: newProject.key },
            timestamp: new Date().toISOString(),
          })
        }
      )

      // Project updated
      subscribeToChanges(
        projectsChannel,
        {
          schema: "public",
          table: "projects",
          filter: `team_id=eq.${teamId}`,
          event: "UPDATE",
        },
        (payload) => {
          const oldProject = payload.old as any
          const newProject = payload.new as any
          // Only track name/key changes
          if (
            oldProject.name !== newProject.name ||
            oldProject.key !== newProject.key
          ) {
            addActivity({
              id: `project-update-${newProject.id}-${Date.now()}`,
              type: "project_updated",
              teamId,
              projectId: newProject.id,
              projectName: newProject.name,
              metadata: {
                oldName: oldProject.name,
                newName: newProject.name,
                oldKey: oldProject.key,
                newKey: newProject.key,
              },
              timestamp: new Date().toISOString(),
            })
          }
        }
      )

      // Project deleted
      subscribeToChanges(
        projectsChannel,
        {
          schema: "public",
          table: "projects",
          filter: `team_id=eq.${teamId}`,
          event: "DELETE",
        },
        (payload) => {
          const oldProject = payload.old as any
          addActivity({
            id: `project-delete-${oldProject.id}`,
            type: "project_deleted",
            teamId,
            projectId: oldProject.id,
            projectName: oldProject.name,
            timestamp: new Date().toISOString(),
          })
        }
      )

      projectsChannel.subscribe()
      channels.push(projectsChannel)
    }

    // Subscribe to team changes
    if (includeTeamUpdates) {
      const teamChannel = createRealtimeChannel(
        supabase,
        `teams:id=eq.${teamId}`
      )

      subscribeToChanges(
        teamChannel,
        {
          schema: "public",
          table: "teams",
          filter: `id=eq.${teamId}`,
          event: "UPDATE",
        },
        (payload) => {
          const oldTeam = payload.old as any
          const newTeam = payload.new as any
          // Only track name/description changes
          if (
            oldTeam.name !== newTeam.name ||
            oldTeam.description !== newTeam.description
          ) {
            addActivity({
              id: `team-update-${teamId}-${Date.now()}`,
              type: "team_updated",
              teamId,
              metadata: {
                oldName: oldTeam.name,
                newName: newTeam.name,
                oldDescription: oldTeam.description,
                newDescription: newTeam.description,
              },
              timestamp: new Date().toISOString(),
            })
          }
        }
      )

      teamChannel.subscribe()
      channels.push(teamChannel)
    }

    return () => {
      channels.forEach((channel) => cleanupChannel(supabase, channel))
    }
  }, [teamId, maxActivities, includeMembers, includeProjects, includeTeamUpdates])

  return {
    activities,
    loading,
    error,
  }
}

/**
 * Helper function to format activity message
 *
 * @param activity - Team activity
 * @returns Formatted activity message
 *
 * @example
 * ```tsx
 * const message = formatActivityMessage(activity)
 * // Returns: "John Doe was added to the team as member"
 * ```
 */
export function formatActivityMessage(activity: TeamActivity): string {
  switch (activity.type) {
    case "member_added":
      return `${activity.userName} was added to the team as ${activity.metadata?.role}`

    case "member_removed":
      return `A member was removed from the team`

    case "member_role_updated":
      return `${activity.userName}'s role was changed from ${activity.metadata?.oldRole} to ${activity.metadata?.newRole}`

    case "project_created":
      return `Project "${activity.projectName}" (${activity.metadata?.key}) was created`

    case "project_updated":
      if (activity.metadata?.oldName !== activity.metadata?.newName) {
        return `Project "${activity.metadata?.oldName}" was renamed to "${activity.metadata?.newName}"`
      }
      if (activity.metadata?.oldKey !== activity.metadata?.newKey) {
        return `Project key was changed from ${activity.metadata?.oldKey} to ${activity.metadata?.newKey}`
      }
      return `Project "${activity.projectName}" was updated`

    case "project_deleted":
      return `Project "${activity.projectName}" was deleted`

    case "team_updated":
      if (activity.metadata?.oldName !== activity.metadata?.newName) {
        return `Team name was changed from "${activity.metadata?.oldName}" to "${activity.metadata?.newName}"`
      }
      return `Team settings were updated`

    default:
      return "Team activity occurred"
  }
}
