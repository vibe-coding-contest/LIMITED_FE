"use client"

/**
 * TeamActivityLog Component
 *
 * Displays recent team activity and changes
 * - Project creations
 * - Issue creations
 * - Status changes
 * - Member activities
 */

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

interface ActivityEntry {
  id: string
  type: "project_created" | "issue_created" | "issue_updated" | "member_joined"
  user: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  timestamp: string
  metadata: {
    project_name?: string
    project_id?: string
    issue_title?: string
    issue_id?: string
    issue_key?: string
    member_name?: string
  }
}

interface TeamActivityLogProps {
  teamId: string
  limit?: number
}

export function TeamActivityLog({ teamId, limit = 20 }: TeamActivityLogProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch recent projects
        const { data: projects } = await supabase
          .from("projects")
          .select(
            `
            id,
            name,
            created_at,
            team_id
          `
          )
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })
          .limit(limit)

        // Fetch recent issues from team projects
        const { data: teamProjects } = await supabase
          .from("projects")
          .select("id")
          .eq("team_id", teamId)

        const projectIds = teamProjects?.map((p) => p.id) || []

        const { data: issues } = await supabase
          .from("issues")
          .select(
            `
            id,
            title,
            created_at,
            updated_at,
            project:projects (
              id,
              key,
              name
            ),
            reporter:users!issues_reporter_id_fkey (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(limit)

        // Fetch team member joins
        const { data: members } = await supabase
          .from("team_members")
          .select(
            `
            id,
            created_at,
            user:users (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })
          .limit(limit)

        // Build activity timeline
        const timeline: ActivityEntry[] = []

        // Add project creations
        projects?.forEach((project: any) => {
          timeline.push({
            id: `project-${project.id}`,
            type: "project_created",
            user: {
              id: "system",
              display_name: "System",
              avatar_url: null,
            },
            timestamp: project.created_at,
            metadata: {
              project_name: project.name,
              project_id: project.id,
            },
          })
        })

        // Add issue creations
        issues?.forEach((issue: any) => {
          timeline.push({
            id: `issue-${issue.id}`,
            type: "issue_created",
            user: issue.reporter,
            timestamp: issue.created_at,
            metadata: {
              issue_title: issue.title,
              issue_id: issue.id,
              issue_key: issue.project.key,
              project_name: issue.project.name,
            },
          })
        })

        // Add member joins
        members?.forEach((member: any) => {
          timeline.push({
            id: `member-${member.id}`,
            type: "member_joined",
            user: member.user,
            timestamp: member.created_at,
            metadata: {
              member_name: member.user.display_name,
            },
          })
        })

        // Sort by timestamp (most recent first)
        timeline.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setActivities(timeline.slice(0, limit))
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [teamId, limit])

  const getActivityIcon = (type: ActivityEntry["type"]) => {
    switch (type) {
      case "project_created":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
          </div>
        )
      case "issue_created":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
      case "issue_updated":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        )
      case "member_joined":
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-orange-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const renderActivity = (activity: ActivityEntry) => {
    switch (activity.type) {
      case "project_created":
        return (
          <div>
            <Link
              href={`/projects/${activity.metadata.project_id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {activity.metadata.project_name}
            </Link>
            <span className="text-gray-600"> project was created</span>
          </div>
        )
      case "issue_created":
        return (
          <div>
            <span className="font-medium">{activity.user.display_name}</span>
            <span className="text-gray-600"> created issue </span>
            <Link
              href={`/issues/${activity.metadata.issue_id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {activity.metadata.issue_key}
            </Link>
            <div className="text-sm text-gray-500 mt-1 truncate">
              {activity.metadata.issue_title}
            </div>
          </div>
        )
      case "issue_updated":
        return (
          <div>
            <span className="font-medium">{activity.user.display_name}</span>
            <span className="text-gray-600"> updated </span>
            <Link
              href={`/issues/${activity.metadata.issue_id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {activity.metadata.issue_key}
            </Link>
          </div>
        )
      case "member_joined":
        return (
          <div>
            <span className="font-medium">{activity.user.display_name}</span>
            <span className="text-gray-600"> joined the team</span>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-red-600">
          Error loading activity: {error.message}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 items-start">
            {getActivityIcon(activity.type)}

            <div className="flex-1 min-w-0">
              <div className="text-sm">{renderActivity(activity)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      )}
    </Card>
  )
}
