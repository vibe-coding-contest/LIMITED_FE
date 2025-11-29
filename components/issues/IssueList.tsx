"use client"

import { IssueCard } from "./IssueCard"
import type { IssueWithDetails } from "@/types/models"

interface IssueListProps {
  issues: IssueWithDetails[]
  showProject?: boolean
  emptyMessage?: string
}

/**
 * IssueList Component
 *
 * Displays a list of issues.
 */
export function IssueList({
  issues,
  showProject = false,
  emptyMessage = "이슈가 없습니다",
}: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showProject={showProject} />
      ))}
    </div>
  )
}
