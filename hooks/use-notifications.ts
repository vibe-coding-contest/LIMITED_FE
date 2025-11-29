"use client"

/**
 * useNotifications Hook
 *
 * Manages user notifications with real-time updates via Supabase Realtime
 * - Fetches user notifications
 * - Subscribes to real-time updates
 * - Mark notifications as read
 * - Delete notifications
 */

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type Notification = Tables<"notifications">

export interface NotificationWithDetails extends Notification {
  issue?: {
    id: string
    title: string
    project: {
      key: string
    }
  }
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>(
    []
  )
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel

    async function fetchNotifications() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("notifications")
          .select(
            `
            *,
            issue:issues (
              id,
              title,
              project:projects (
                key
              )
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error

        const notifications = (data || []) as NotificationWithDetails[]
        setNotifications(notifications)
        setUnreadCount(notifications.filter((n) => !n.read).length)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchNotifications()

    // Subscribe to real-time updates
    channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the complete notification with relations
          const { data } = await supabase
            .from("notifications")
            .select(
              `
              *,
              issue:issues (
                id,
                title,
                project:projects (
                  key
                )
              )
            `
            )
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setNotifications((prev) => [
              data as NotificationWithDetails,
              ...prev,
            ])
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id
                ? { ...n, ...(payload.new as Notification) }
                : n
            )
          )

          // Update unread count if read status changed
          if (payload.new.read && !payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          } else if (!payload.new.read && payload.old.read) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))

          // Update unread count if deleted notification was unread
          if (!payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)

    if (error) throw error

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) throw error

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)

    if (error) throw error

    const notification = notifications.find((n) => n.id === notificationId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const deleteAllRead = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("read", true)

    if (error) throw error

    setNotifications((prev) => prev.filter((n) => !n.read))
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  }
}
