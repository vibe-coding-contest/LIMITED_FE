"use client"

/**
 * ProjectDashboard Component
 *
 * Displays project-level statistics and insights
 * - Issue distribution by status
 * - Priority breakdown
 * - Team member workload
 * - Recent activity
 */

import React, { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { SimpleChart, SimplePieChart } from "./SimpleChart"
import { useIssues } from "@/hooks/use-issues"
import { useProjectStatuses } from "@/hooks/use-projects"
import { Spinner } from "@/components/ui/spinner"
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/types/models"
import type { Tables } from "@/types/database.types"

type Issue = Tables<"issues"> & {
  status: Tables<"statuses">
  assignee: Pick<Tables<"users">, "id" | "display_name" | "avatar_url"> | null
  reporter: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

interface ProjectDashboardProps {
  projectId: string
  projectName: string
}

export function ProjectDashboard({
  projectId,
  projectName,
}: ProjectDashboardProps) {
  const { issues, loading: issuesLoading } = useIssues(projectId)
  const { statuses, loading: statusesLoading } = useProjectStatuses(projectId)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!issues) return null

    // Issues by status
    const byStatus = statuses.map((status) => ({
      label: status.name,
      value: issues.filter((issue) => issue.status_id === status.id).length,
      color: status.color,
    }))

    // Issues by priority
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

    // Assignee workload
    const assigneeMap = new Map<string, { name: string; count: number; avatar: string | null }>()
    issues.forEach((issue) => {
      if (issue.assignee) {
        const current = assigneeMap.get(issue.assignee.id) || {
          name: issue.assignee.display_name,
          count: 0,
          avatar: issue.assignee.avatar_url,
        }
        assigneeMap.set(issue.assignee.id, {
          ...current,
          count: current.count + 1,
        })
      }
    })

    const workload = Array.from(assigneeMap.entries())
      .map(([id, data]) => ({
        id,
        ...data,
      }))
      .sort((a, b) => b.count - a.count)

    // Unassigned issues
    const unassigned = issues.filter((i) => !i.assignee_id).length

    return {
      total: issues.length,
      byStatus,
      byPriority,
      workload,
      unassigned,
      completed: issues.filter((i) => i.status.name.toLowerCase() === "done").length,
    }
  }, [issues, statuses])

  if (issuesLoading || statusesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
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

  const completionRate = stats.total > 0
    ? ((stats.completed / stats.total) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Issues</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {completionRate}% completion rate
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.total - stats.completed - stats.unassigned}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Unassigned</div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.unassigned}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Issues by Status
          </h3>
          {stats.byStatus.length > 0 ? (
            <SimpleChart data={stats.byStatus} height={200} />
          ) : (
            <div className="text-center py-8 text-gray-500">No issues yet</div>
          )}
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Breakdown
          </h3>
          {stats.byPriority.length > 0 ? (
            <SimplePieChart data={stats.byPriority} size={160} />
          ) : (
            <div className="text-center py-8 text-gray-500">No issues yet</div>
          )}
        </Card>
      </div>

      {/* Team Workload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Workload
        </h3>
        {stats.workload.length > 0 ? (
          <div className="space-y-4">
            {stats.workload.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">
                    {member.count} {member.count === 1 ? "issue" : "issues"} assigned
                  </div>
                </div>
                <Badge variant="secondary">{member.count}</Badge>
              </div>
            ))}
            {stats.unassigned > 0 && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-orange-50">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                  ?
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Unassigned</div>
                  <div className="text-sm text-gray-500">
                    {stats.unassigned} {stats.unassigned === 1 ? "issue" : "issues"} need assignment
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700">
                  {stats.unassigned}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No team members assigned yet
          </div>
        )}
      </Card>
    </div>
  )
}
