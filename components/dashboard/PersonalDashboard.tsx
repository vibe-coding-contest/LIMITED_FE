"use client"

/**
 * PersonalDashboard Component
 *
 * Displays user-specific statistics and tasks
 * - My assigned issues
 * - Recent activity
 * - Priority tasks
 * - Quick stats
 */

import React, { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SimpleChart } from "./SimpleChart"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/types/models"
import type { Tables } from "@/types/database.types"
import { formatDistanceToNow } from "date-fns"

type Issue = Tables<"issues"> & {
  project: Tables<"projects">
  status: Tables<"statuses">
}

interface PersonalDashboardProps {
  userId: string
}

export function PersonalDashboard({ userId }: PersonalDashboardProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchMyIssues() {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from("issues")
          .select(
            `
            *,
            project:projects (
              id,
              name,
              key
            ),
            status:statuses (
              id,
              name,
              color
            )
          `
          )
          .eq("assignee_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setIssues(data as Issue[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyIssues()
  }, [userId])

  const stats = useMemo(() => {
    if (!issues) return null

    const total = issues.length
    const completed = issues.filter(
      (i) => i.status.name.toLowerCase() === "done"
    ).length
    const inProgress = issues.filter(
      (i) =>
        i.status.name.toLowerCase() !== "done" &&
        i.status.name.toLowerCase() !== "todo"
    ).length
    const todo = issues.filter((i) => i.status.name.toLowerCase() === "todo")
      .length

    // By priority
    const byPriority = [
      {
        label: "Urgent",
        value: issues.filter((i) => i.priority === "urgent").length,
        color: "#dc2626",
      },
      {
        label: "High",
        value: issues.filter((i) => i.priority === "high").length,
        color: "#f59e0b",
      },
      {
        label: "Medium",
        value: issues.filter((i) => i.priority === "medium").length,
        color: "#3b82f6",
      },
      {
        label: "Low",
        value: issues.filter((i) => i.priority === "low").length,
        color: "#6b7280",
      },
    ].filter((item) => item.value > 0)

    // By project
    const projectMap = new Map<string, { name: string; count: number }>()
    issues.forEach((issue) => {
      const current = projectMap.get(issue.project.id) || {
        name: issue.project.name,
        count: 0,
      }
      projectMap.set(issue.project.id, {
        ...current,
        count: current.count + 1,
      })
    })

    const byProject = Array.from(projectMap.entries())
      .map(([id, data]) => ({
        label: data.name,
        value: data.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Urgent issues
    const urgentIssues = issues
      .filter((i) => i.priority === "urgent" && i.status.name.toLowerCase() !== "done")
      .slice(0, 5)

    // Recent issues
    const recentIssues = issues.slice(0, 5)

    return {
      total,
      completed,
      inProgress,
      todo,
      byPriority,
      byProject,
      urgentIssues,
      recentIssues,
    }
  }, [issues])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Error loading dashboard: {error.message}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">My Issues</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">To Do</div>
          <div className="text-3xl font-bold text-blue-600">{stats.todo}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.inProgress}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.completed}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Tasks by Priority
          </h3>
          {stats.byPriority.length > 0 ? (
            <SimpleChart data={stats.byPriority} type="progress" />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tasks assigned
            </div>
          )}
        </Card>

        {/* Project Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Project
          </h3>
          {stats.byProject.length > 0 ? (
            <SimpleChart data={stats.byProject} height={200} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tasks assigned
            </div>
          )}
        </Card>
      </div>

      {/* Urgent Tasks */}
      {stats.urgentIssues.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🚨 Urgent Tasks
            </h3>
            <Badge className="bg-red-100 text-red-700">
              {stats.urgentIssues.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {stats.urgentIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {issue.project.key}
                      </span>
                      <Badge
                        className={PRIORITY_COLORS[issue.priority]}
                        variant="secondary"
                      >
                        {PRIORITY_LABELS[issue.priority]}
                      </Badge>
                    </div>
                    <div className="font-medium text-gray-900 truncate">
                      {issue.title}
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: issue.status.color,
                      color: "white",
                    }}
                  >
                    {issue.status.name}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        {stats.recentIssues.length > 0 ? (
          <div className="space-y-3">
            {stats.recentIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block p-4 rounded-lg border hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {issue.project.key}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(issue.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 truncate mb-1">
                      {issue.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={PRIORITY_COLORS[issue.priority]}
                        variant="secondary"
                      >
                        {PRIORITY_LABELS[issue.priority]}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {issue.project.name}
                      </span>
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: issue.status.color,
                      color: "white",
                    }}
                  >
                    {issue.status.name}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </Card>
    </div>
  )
}
