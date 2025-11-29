"use client"

import { useEffect, useState } from "react"
import {
  getCommentsByIssueId,
  addComment,
  updateComment,
  deleteComment,
} from "@/utils/supabase/queries"
import type { Tables } from "@/types/database.types"

type Comment = Tables<"comments"> & {
  user: Pick<Tables<"users">, "id" | "display_name" | "avatar_url">
}

export function useComments(issueId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!issueId) {
      setLoading(false)
      return
    }

    async function fetchComments() {
      try {
        setLoading(true)
        const { data, error } = await getCommentsByIssueId(issueId!)

        if (error) throw error

        setComments(data as Comment[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [issueId])

  const createComment = async (userId: string, content: string) => {
    if (!issueId) throw new Error("Issue ID is required")

    const { data, error } = await addComment(issueId, userId, content)
    if (error) throw error

    if (data && data[0]) {
      setComments((prev) => [...prev, data[0] as Comment])
    }

    return data?.[0]
  }

  const editComment = async (commentId: string, content: string) => {
    const { data, error } = await updateComment(commentId, content)
    if (error) throw error

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, content, updated_at: new Date().toISOString() }
          : comment
      )
    )

    return data?.[0]
  }

  const removeComment = async (commentId: string) => {
    const { error } = await deleteComment(commentId)
    if (error) throw error

    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  return {
    comments,
    loading,
    error,
    createComment,
    editComment,
    removeComment,
  }
}
