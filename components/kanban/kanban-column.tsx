"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Tables } from "@/types/database.types"

type Issue = Tables<"issues"> & {
  status: Tables<"statuses">
  assignee: Pick<Tables<"users">, "id" | "display_name" | "avatar_url"> | null
  reporter: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

type Status = Tables<"statuses">

interface KanbanColumnProps {
  status: Status
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function KanbanColumn({ status, issues, onIssueClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `status-${status.id}`,
  })

  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <h3 className="font-semibold">{status.name}</h3>
          </div>
          <Badge variant="secondary" className="ml-2">
            {issues.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="min-h-[200px] space-y-2"
        >
          <SortableContext
            items={issues.map((issue) => issue.id)}
            strategy={verticalListSortingStrategy}
          >
            {issues.map((issue) => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
              />
            ))}
          </SortableContext>

          {issues.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
              Drop issues here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
