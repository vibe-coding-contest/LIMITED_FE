"use client"

import { useComments } from "@/hooks/use-comments"
import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import { Skeleton } from "@/components/ui/skeleton"

interface CommentListProps {
  issueId: string
  currentUserId: string
}

export function CommentList({ issueId, currentUserId }: CommentListProps) {
  const { comments, loading, error, createComment, editComment, removeComment } =
    useComments(issueId)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load comments: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onEdit={editComment}
            onDelete={removeComment}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      <CommentForm
        onSubmit={(content) => createComment(currentUserId, content)}
      />
    </div>
  )
}
