"use client"

/**
 * IssueHistory Component
 *
 * Displays chronological history of issue changes and activities
 * - Status changes
 * - Assignee changes
 * - Priority changes
 * - Comments
 * - Attachments
 */

import React, { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { PRIORITY_LABELS } from "@/types/models"

interface HistoryEntry {
  id: string
  type: "status_change" | "assignee_change" | "priority_change" | "comment" | "attachment" | "created"
  user: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  timestamp: string
  old_value?: string
  new_value?: string
  content?: string
  metadata?: Record<string, any>
}

interface IssueHistoryProps {
  issueId: string
}

export function IssueHistory({ issueId }: IssueHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch issue creation
        const { data: issue } = await supabase
          .from("issues")
          .select(
            `
            created_at,
            reporter:users!issues_reporter_id_fkey (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("id", issueId)
          .single()

        // Fetch comments
        const { data: comments } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            user:users (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true })

        // Fetch attachments
        const { data: attachments } = await supabase
          .from("attachments")
          .select(
            `
            id,
            filename,
            created_at,
            user:users (
              id,
              display_name,
              avatar_url
            )
          `
          )
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true })

        // Build timeline
        const timeline: HistoryEntry[] = []

        // Add issue creation
        if (issue) {
          timeline.push({
            id: "created",
            type: "created",
            user: issue.reporter as any,
            timestamp: issue.created_at,
          })
        }

        // Add comments
        comments?.forEach((comment: any) => {
          timeline.push({
            id: comment.id,
            type: "comment",
            user: comment.user,
            timestamp: comment.created_at,
            content: comment.content,
          })
        })

        // Add attachments
        attachments?.forEach((attachment: any) => {
          timeline.push({
            id: attachment.id,
            type: "attachment",
            user: attachment.user,
            timestamp: attachment.created_at,
            metadata: { filename: attachment.filename },
          })
        })

        // Sort by timestamp
        timeline.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        setHistory(timeline)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [issueId])

  const getActivityIcon = (type: HistoryEntry["type"]) => {
    switch (type) {
      case "created":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        )
      case "status_change":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        )
      case "assignee_change":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )
      case "priority_change":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-orange-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
        )
      case "comment":
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>
        )
      case "attachment":
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-indigo-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
              />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const renderActivity = (entry: HistoryEntry) => {
    switch (entry.type) {
      case "created":
        return (
          <div>
            <span className="font-medium">{entry.user.display_name}</span>{" "}
            <span className="text-gray-600">created this issue</span>
          </div>
        )
      case "status_change":
        return (
          <div>
            <span className="font-medium">{entry.user.display_name}</span>{" "}
            <span className="text-gray-600">changed status from</span>{" "}
            <Badge variant="outline">{entry.old_value}</Badge>{" "}
            <span className="text-gray-600">to</span>{" "}
            <Badge variant="outline">{entry.new_value}</Badge>
          </div>
        )
      case "assignee_change":
        return (
          <div>
            <span className="font-medium">{entry.user.display_name}</span>{" "}
            <span className="text-gray-600">
              {entry.new_value
                ? `assigned this to ${entry.new_value}`
                : "unassigned this issue"}
            </span>
          </div>
        )
      case "priority_change":
        return (
          <div>
            <span className="font-medium">{entry.user.display_name}</span>{" "}
            <span className="text-gray-600">changed priority from</span>{" "}
            <Badge variant="secondary">{entry.old_value}</Badge>{" "}
            <span className="text-gray-600">to</span>{" "}
            <Badge variant="secondary">{entry.new_value}</Badge>
          </div>
        )
      case "comment":
        return (
          <div>
            <div className="mb-1">
              <span className="font-medium">{entry.user.display_name}</span>{" "}
              <span className="text-gray-600">commented</span>
            </div>
            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              {entry.content}
            </div>
          </div>
        )
      case "attachment":
        return (
          <div>
            <span className="font-medium">{entry.user.display_name}</span>{" "}
            <span className="text-gray-600">added attachment</span>{" "}
            <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">
              {entry.metadata?.filename}
            </code>
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
          Error loading history: {error.message}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>

      <div className="space-y-4">
        {history.map((entry, index) => (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              {getActivityIcon(entry.type)}
              {index < history.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{renderActivity(entry)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No activity yet
        </div>
      )}
    </Card>
  )
}
