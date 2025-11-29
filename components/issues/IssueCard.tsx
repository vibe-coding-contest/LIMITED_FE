import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import type { IssueWithDetails } from "@/types/models"

interface IssueCardProps {
  issue: IssueWithDetails
  showProject?: boolean
}

/**
 * IssueCard Component
 *
 * Compact card displaying issue information.
 */
export function IssueCard({ issue, showProject = false }: IssueCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <Link href={`/issues/${issue.id}`} className="block p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {issue.project.key}-{issue.id.slice(-6).toUpperCase()}
            </span>
            <Badge variant="outline" className={priorityColors[issue.priority]}>
              {issue.priority}
            </Badge>
          </div>
          <Badge variant="secondary">{issue.status.name}</Badge>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-semibold line-clamp-2">{issue.title}</h3>

        {/* Description */}
        {issue.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {showProject && (
            <span className="text-xs text-muted-foreground">
              {issue.project.name}
            </span>
          )}
          {issue.assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium">
                  {issue.assignee.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {issue.assignee.display_name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}
