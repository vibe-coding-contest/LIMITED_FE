"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import type { Tables } from "@/types/database.types"

type Issue = Tables<"issues"> & {
  status: Tables<"statuses">
  assignee: Pick<Tables<"users">, "id" | "display_name" | "avatar_url"> | null
  reporter: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

type Status = Tables<"statuses">

interface KanbanBoardProps {
  statuses: Status[]
  issues: Issue[]
  onIssueMove: (issueId: string, statusId: string, order: string) => void
  onIssueClick: (issue: Issue) => void
}

export function KanbanBoard({
  statuses,
  issues: initialIssues,
  onIssueMove,
  onIssueClick,
}: KanbanBoardProps) {
  const [issues, setIssues] = useState(initialIssues)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group issues by status
  const issuesByStatus = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.status_id]) {
        acc[issue.status_id] = []
      }
      acc[issue.status_id].push(issue)
      return acc
    },
    {} as Record<string, Issue[]>
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag over (when dragging over a droppable area)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active and over issues
    const activeIssue = issues.find((issue) => issue.id === activeId)
    const overIssue = issues.find((issue) => issue.id === overId)

    if (!activeIssue) return

    // If dragging over a status column (not an issue)
    if (overId.startsWith("status-")) {
      const newStatusId = overId.replace("status-", "")

      if (activeIssue.status_id !== newStatusId) {
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === activeId ? { ...issue, status_id: newStatusId } : issue
          )
        )
      }
      return
    }

    // If dragging over another issue
    if (overIssue && activeIssue.status_id !== overIssue.status_id) {
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === activeId
            ? { ...issue, status_id: overIssue.status_id }
            : issue
        )
      )
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeIssue = issues.find((issue) => issue.id === activeId)

    if (!activeIssue) return

    // If dropped on a status column
    if (overId.startsWith("status-")) {
      const newStatusId = overId.replace("status-", "")
      const newStatusIssues = issuesByStatus[newStatusId] || []
      const newOrder = (newStatusIssues.length + 1).toString()

      onIssueMove(activeId, newStatusId, newOrder)
      return
    }

    // If dropped on another issue
    const overIssue = issues.find((issue) => issue.id === overId)

    if (!overIssue) return

    const activeStatusId = activeIssue.status_id
    const overStatusId = overIssue.status_id

    // If within the same status, reorder
    if (activeStatusId === overStatusId) {
      const statusIssues = issuesByStatus[activeStatusId] || []
      const oldIndex = statusIssues.findIndex((issue) => issue.id === activeId)
      const newIndex = statusIssues.findIndex((issue) => issue.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedIssues = arrayMove(statusIssues, oldIndex, newIndex)

        setIssues((prevIssues) => {
          const otherIssues = prevIssues.filter(
            (issue) => issue.status_id !== activeStatusId
          )
          return [...otherIssues, ...reorderedIssues]
        })

        // Update order in backend
        const newOrder = (newIndex + 1).toString()
        onIssueMove(activeId, activeStatusId, newOrder)
      }
    } else {
      // Moving to a different status
      const newStatusIssues = issuesByStatus[overStatusId] || []
      const overIndex = newStatusIssues.findIndex(
        (issue) => issue.id === overId
      )
      const newOrder = (overIndex + 1).toString()

      onIssueMove(activeId, overStatusId, newOrder)
    }
  }

  // Get the active issue for drag overlay
  const activeIssue = activeId
    ? issues.find((issue) => issue.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <SortableContext
            key={status.id}
            id={`status-${status.id}`}
            items={issuesByStatus[status.id]?.map((issue) => issue.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              status={status}
              issues={issuesByStatus[status.id] || []}
              onIssueClick={onIssueClick}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? (
          <div className="rotate-2 cursor-grabbing">
            <KanbanCard issue={activeIssue} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
