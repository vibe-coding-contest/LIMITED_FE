"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { GripVertical } from "lucide-react"
import type { Tables } from "@/types/database.types"

type Issue = Tables<"issues"> & {
  status: Tables<"statuses">
  assignee: Pick<Tables<"users">, "id" | "display_name" | "avatar_url"> | null
  reporter: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

interface KanbanCardProps {
  issue: Issue
  onClick: () => void
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function KanbanCard({ issue, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            className="mt-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium leading-snug line-clamp-2">
              {issue.title}
            </h4>

            {issue.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {issue.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className={priorityColors[issue.priority]}
              >
                {issue.priority}
              </Badge>

              {issue.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={issue.assignee.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {issue.assignee.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
