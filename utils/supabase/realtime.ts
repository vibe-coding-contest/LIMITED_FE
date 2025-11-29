/**
 * Supabase Realtime Subscription Helpers
 *
 * Provides reusable utilities for Realtime subscriptions and optimistic updates
 */

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from "@supabase/supabase-js"

/**
 * Realtime event types
 */
export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

/**
 * Subscription configuration
 */
export interface SubscriptionConfig {
  schema: string
  table: string
  filter?: string
  event?: RealtimeEvent
}

/**
 * Creates a Realtime channel with proper cleanup
 *
 * @param supabase - Supabase client instance
 * @param channelName - Unique channel identifier
 * @returns RealtimeChannel instance
 *
 * @example
 * ```ts
 * const channel = createRealtimeChannel(supabase, 'issues:project_id=123')
 * ```
 */
export function createRealtimeChannel(
  supabase: SupabaseClient,
  channelName: string
): RealtimeChannel {
  return supabase.channel(channelName)
}

/**
 * Subscribes to postgres changes with type safety
 *
 * @param channel - Realtime channel
 * @param config - Subscription configuration
 * @param callback - Change event handler
 * @returns RealtimeChannel for chaining
 *
 * @example
 * ```ts
 * const channel = createRealtimeChannel(supabase, 'issues')
 * subscribeToChanges(channel, {
 *   schema: 'public',
 *   table: 'issues',
 *   filter: 'project_id=eq.123',
 *   event: 'INSERT'
 * }, (payload) => {
 *   console.log('New issue:', payload.new)
 * })
 * ```
 */
export function subscribeToChanges(
  channel: RealtimeChannel,
  config: SubscriptionConfig,
  callback: (payload: any) => void
): RealtimeChannel {
  return channel.on(
    "postgres_changes" as any,
    {
      event: config.event || "*",
      schema: config.schema,
      table: config.table,
      ...(config.filter && { filter: config.filter }),
    } as any,
    callback
  )
}

/**
 * Unsubscribes and removes a Realtime channel
 *
 * @param supabase - Supabase client instance
 * @param channel - Channel to cleanup
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   const channel = createRealtimeChannel(supabase, 'my-channel')
 *   // ... setup subscriptions
 *   channel.subscribe()
 *
 *   return () => {
 *     cleanupChannel(supabase, channel)
 *   }
 * }, [])
 * ```
 */
export function cleanupChannel(
  supabase: SupabaseClient,
  channel: RealtimeChannel
): void {
  channel.unsubscribe()
  supabase.removeChannel(channel)
}

/**
 * Optimistic update helper for local state
 *
 * @param items - Current items array
 * @param newItem - Item to add optimistically
 * @returns Updated items array
 *
 * @example
 * ```ts
 * // Add new issue optimistically
 * const optimisticIssues = optimisticAdd(issues, newIssue)
 * setIssues(optimisticIssues)
 * ```
 */
export function optimisticAdd<T extends { id: string }>(
  items: T[],
  newItem: T
): T[] {
  return [...items, newItem]
}

/**
 * Optimistic update helper for updating an item
 *
 * @param items - Current items array
 * @param itemId - ID of item to update
 * @param updates - Partial updates to apply
 * @returns Updated items array
 *
 * @example
 * ```ts
 * // Update issue optimistically
 * const optimisticIssues = optimisticUpdate(issues, issueId, { title: 'New Title' })
 * setIssues(optimisticIssues)
 * ```
 */
export function optimisticUpdate<T extends { id: string }>(
  items: T[],
  itemId: string,
  updates: Partial<T>
): T[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, ...updates } : item
  )
}

/**
 * Optimistic delete helper
 *
 * @param items - Current items array
 * @param itemId - ID of item to delete
 * @returns Updated items array
 *
 * @example
 * ```ts
 * // Delete issue optimistically
 * const optimisticIssues = optimisticDelete(issues, issueId)
 * setIssues(optimisticIssues)
 * ```
 */
export function optimisticDelete<T extends { id: string }>(
  items: T[],
  itemId: string
): T[] {
  return items.filter((item) => item.id !== itemId)
}

/**
 * Rollback helper for failed optimistic updates
 *
 * @param setItems - State setter function
 * @param previousItems - Previous items state to restore
 *
 * @example
 * ```ts
 * const previousIssues = [...issues]
 * setIssues(optimisticAdd(issues, newIssue))
 *
 * try {
 *   await supabase.from('issues').insert(newIssue)
 * } catch (error) {
 *   rollbackOptimistic(setIssues, previousIssues)
 * }
 * ```
 */
export function rollbackOptimistic<T>(
  setItems: (items: T[]) => void,
  previousItems: T[]
): void {
  setItems(previousItems)
}

/**
 * Creates a filter string for Realtime subscriptions
 *
 * @param field - Field name
 * @param operator - Comparison operator
 * @param value - Filter value
 * @returns Filter string
 *
 * @example
 * ```ts
 * const filter = createFilter('project_id', 'eq', '123')
 * // Returns: 'project_id=eq.123'
 * ```
 */
export function createFilter(
  field: string,
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in",
  value: string | number
): string {
  return `${field}=${operator}.${value}`
}

/**
 * Debounced Realtime handler to prevent rapid updates
 *
 * @param callback - Handler function
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Debounced callback
 *
 * @example
 * ```ts
 * const debouncedHandler = debounceRealtimeHandler((payload) => {
 *   console.log('Debounced update:', payload)
 * }, 500)
 * ```
 */
export function debounceRealtimeHandler<T>(
  callback: (payload: T) => void,
  delay: number = 300
): (payload: T) => void {
  let timeoutId: NodeJS.Timeout

  return (payload: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => callback(payload), delay)
  }
}

/**
 * Batch Realtime updates to reduce re-renders
 *
 * @param callback - Handler function
 * @param delay - Batch delay in milliseconds (default: 100ms)
 * @returns Batched callback
 *
 * @example
 * ```ts
 * const batchedHandler = batchRealtimeUpdates((payloads) => {
 *   console.log('Batch of updates:', payloads)
 * }, 200)
 * ```
 */
export function batchRealtimeUpdates<T>(
  callback: (payloads: T[]) => void,
  delay: number = 100
): (payload: T) => void {
  let batch: T[] = []
  let timeoutId: NodeJS.Timeout

  return (payload: T) => {
    batch.push(payload)
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      callback([...batch])
      batch = []
    }, delay)
  }
}
