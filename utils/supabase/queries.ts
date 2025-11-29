import { createClient as createBrowserClient } from "@/lib/supabase/client"

/**
 * Database query utility functions for Supabase (Client Components)
 *
 * These functions use the Browser Client and are designed for Client Components.
 *
 * For Server Components, you should:
 * 1. Import `createClient` directly from `@/lib/supabase/server`
 * 2. Call the database methods directly on the server client
 *
 * @example Server Component (Recommended)
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data: teams } = await supabase
 *     .from('team_members')
 *     .select('*, team:teams(*)')
 *     .eq('user_id', userId)
 *
 *   return <div>{teams?.map(...)}</div>
 * }
 * ```
 *
 * @example Client Component (Use these utility functions)
 * ```tsx
 * 'use client'
 * import { getTeamsByUserId } from '@/utils/supabase/queries'
 *
 * export default function Component() {
 *   useEffect(() => {
 *     async function fetchTeams() {
 *       const { data: teams } = await getTeamsByUserId(userId)
 *     }
 *   }, [])
 * }
 * ```
 *
 * These functions provide a consistent interface for database operations
 * in Client Components and handle common patterns like error handling and type safety.
 */

/**
 * Generic fetch function for client-side data fetching
 *
 * @param table - Table name
 * @param columns - Columns to select (default: '*')
 * @param filters - Optional filters object
 *
 * @example
 * ```tsx
 * import { fetchData } from '@/utils/supabase/queries'
 *
 * const projects = await fetchData('projects', '*', { user_id: userId })
 * ```
 */
export async function fetchData<T>(
  table: string,
  columns = "*",
  filters?: Record<string, unknown>
) {
  const supabase = createBrowserClient()
  let query = supabase.from(table).select(columns)

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    return { data: null, error }
  }

  return { data: data as T[], error: null }
}

/**
 * Generic fetch single record function for client-side
 *
 * @param table - Table name
 * @param id - Record ID
 * @param columns - Columns to select (default: '*')
 *
 * @example
 * ```tsx
 * import { fetchById } from '@/utils/supabase/queries'
 *
 * const project = await fetchById('projects', projectId)
 * ```
 */
export async function fetchById<T>(
  table: string,
  id: string,
  columns = "*"
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching ${table} by ID:`, error)
    return { data: null, error }
  }

  return { data: data as T, error: null }
}

/**
 * Generic insert function for client-side mutations
 *
 * @param table - Table name
 * @param values - Values to insert
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { insertData } from '@/utils/supabase/queries'
 *
 * const { data, error } = await insertData('projects', {
 *   name: 'New Project',
 *   description: 'Project description'
 * })
 * ```
 */
export async function insertData<T>(table: string, values: Partial<T>) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from(table).insert(values).select()

  if (error) {
    console.error(`Error inserting into ${table}:`, error)
    return { data: null, error }
  }

  return { data: data as T[], error: null }
}

/**
 * Generic update function for client-side mutations
 *
 * @param table - Table name
 * @param id - Record ID to update
 * @param values - Values to update
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updateData } from '@/utils/supabase/queries'
 *
 * const { data, error } = await updateData('projects', projectId, {
 *   name: 'Updated Project Name'
 * })
 * ```
 */
export async function updateData<T>(
  table: string,
  id: string,
  values: Partial<T>
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating ${table}:`, error)
    return { data: null, error }
  }

  return { data: data as T[], error: null }
}

/**
 * Generic delete function for client-side mutations
 *
 * @param table - Table name
 * @param id - Record ID to delete
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { deleteData } from '@/utils/supabase/queries'
 *
 * const { error } = await deleteData('projects', projectId)
 * ```
 */
export async function deleteData(table: string, id: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error deleting from ${table}:`, error)
    return { error }
  }

  return { error: null }
}

/**
 * Batch insert function for multiple records
 *
 * @param table - Table name
 * @param values - Array of values to insert
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { batchInsert } from '@/utils/supabase/queries'
 *
 * const { data, error } = await batchInsert('tasks', [
 *   { title: 'Task 1', project_id: projectId },
 *   { title: 'Task 2', project_id: projectId }
 * ])
 * ```
 */
export async function batchInsert<T>(table: string, values: Partial<T>[]) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from(table).insert(values).select()

  if (error) {
    console.error(`Error batch inserting into ${table}:`, error)
    return { data: null, error }
  }

  return { data: data as T[], error: null }
}

/**
 * Count records in a table with optional filters
 *
 * @param table - Table name
 * @param filters - Optional filters object
 *
 * @example
 * ```tsx
 * import { countRecords } from '@/utils/supabase/queries'
 *
 * const { count } = await countRecords('tasks', { project_id: projectId })
 * ```
 */
export async function countRecords(
  table: string,
  filters?: Record<string, unknown>
) {
  const supabase = createBrowserClient()
  let query = supabase.from(table).select("*", { count: "exact", head: true })

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  const { count, error } = await query

  if (error) {
    console.error(`Error counting ${table}:`, error)
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
}

// ============================================================================
// TEAMS QUERIES
// ============================================================================

/**
 * Get all teams where user is a member (Isomorphic)
 *
 * @param userId - User ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * import { getTeamsByUserId } from '@/utils/supabase/queries'
 *
 * export default async function Page() {
 *   const { data: teams } = await getTeamsByUserId(userId, { serverSide: true })
 *   return <div>{teams?.map(...)}</div>
 * }
 * ```
 *
 * @example Client Component
 * ```tsx
 * 'use client'
 * const { data: teams } = await getTeamsByUserId(userId)
 * ```
 */
export async function getTeamsByUserId(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      role,
      team:teams (
        id,
        name,
        description,
        owner_id,
        created_at,
        updated_at
      )
    `
    )
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching teams:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Get all members of a team (Isomorphic)
 *
 * @param teamId - Team ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * const { data: members } = await getTeamMembers(teamId, { serverSide: true })
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: members } = await getTeamMembers(teamId)
 * ```
 */
export async function getTeamMembers(teamId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      role,
      created_at,
      user:users (
        id,
        email,
        display_name,
        avatar_url
      )
    `
    )
    .eq("team_id", teamId)

  if (error) {
    console.error("Error fetching team members:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Add a member to a team
 *
 * @param teamId - Team ID
 * @param userId - User ID to add
 * @param role - Team role (default: 'member')
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { addTeamMember } from '@/utils/supabase/queries'
 *
 * const { data, error } = await addTeamMember(teamId, userId, 'member')
 * ```
 */
export async function addTeamMember(
  teamId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "member"
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: userId, role })
    .select()

  if (error) {
    console.error("Error adding team member:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Remove a member from a team
 *
 * @param teamMemberId - Team member ID
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { removeTeamMember } from '@/utils/supabase/queries'
 *
 * const { error } = await removeTeamMember(teamMemberId)
 * ```
 */
export async function removeTeamMember(teamMemberId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", teamMemberId)

  if (error) {
    console.error("Error removing team member:", error)
    return { error }
  }

  return { error: null }
}

// ============================================================================
// PROJECTS QUERIES
// ============================================================================

/**
 * Get all projects for a team (Isomorphic)
 *
 * @param teamId - Team ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * import { getProjectsByTeamId } from '@/utils/supabase/queries'
 *
 * export default async function Page() {
 *   const { data: projects } = await getProjectsByTeamId(teamId, { serverSide: true })
 *   return <div>{projects?.map(...)}</div>
 * }
 * ```
 *
 * @example Client Component
 * ```tsx
 * 'use client'
 * const { data: projects } = await getProjectsByTeamId(teamId)
 * ```
 */
export async function getProjectsByTeamId(
  teamId: string,
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Get all statuses for a project (Isomorphic)
 *
 * @param projectId - Project ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * const { data: statuses } = await getProjectStatuses(projectId, { serverSide: true })
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: statuses } = await getProjectStatuses(projectId)
 * ```
 */
export async function getProjectStatuses(
  projectId: string,
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("statuses")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true })

  if (error) {
    console.error("Error fetching project statuses:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Create default statuses for a new project
 *
 * @param projectId - Project ID
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createDefaultStatuses } from '@/utils/supabase/queries'
 *
 * const { data, error } = await createDefaultStatuses(projectId)
 * ```
 */
export async function createDefaultStatuses(projectId: string) {
  const supabase = createBrowserClient()

  const defaultStatuses = [
    { project_id: projectId, name: "To Do", color: "#94a3b8", order: 0 },
    { project_id: projectId, name: "In Progress", color: "#3b82f6", order: 1 },
    { project_id: projectId, name: "Done", color: "#22c55e", order: 2 },
  ]

  const { data, error } = await supabase
    .from("statuses")
    .insert(defaultStatuses)
    .select()

  if (error) {
    console.error("Error creating default statuses:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ============================================================================
// ISSUES QUERIES
// ============================================================================

/**
 * Get all issues for a project with relations (Isomorphic)
 *
 * @param projectId - Project ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * const { data: issues } = await getIssuesByProjectId(projectId, { serverSide: true })
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: issues } = await getIssuesByProjectId(projectId)
 * ```
 */
export async function getIssuesByProjectId(
  projectId: string,
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("issues")
    .select(
      `
      *,
      status:statuses (
        id,
        name,
        color,
        order
      ),
      assignee:users!issues_assignee_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      reporter:users!issues_reporter_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("project_id", projectId)
    .order("order", { ascending: true })

  if (error) {
    console.error("Error fetching issues:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Get issues grouped by status for kanban board (Isomorphic)
 *
 * @param projectId - Project ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * const { data: issuesByStatus } = await getIssuesByStatusId(projectId, { serverSide: true })
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: issuesByStatus } = await getIssuesByStatusId(projectId)
 * ```
 */
export async function getIssuesByStatusId(
  projectId: string,
  
) {
  const supabase = createBrowserClient()

  const { data: issues, error } = await supabase
    .from("issues")
    .select(
      `
      *,
      status:statuses (
        id,
        name,
        color,
        order
      ),
      assignee:users!issues_assignee_id_fkey (
        id,
        display_name,
        avatar_url
      ),
      reporter:users!issues_reporter_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("project_id", projectId)
    .order("order", { ascending: true })

  if (error) {
    console.error("Error fetching issues by status:", error)
    return { data: null, error }
  }

  // Group issues by status
  const grouped =
    issues?.reduce(
      (acc, issue) => {
        const statusId = issue.status_id
        if (!acc[statusId]) {
          acc[statusId] = []
        }
        acc[statusId].push(issue)
        return acc
      },
      {} as Record<string, typeof issues>
    ) || {}

  return { data: grouped, error: null }
}

/**
 * Move issue to different status
 *
 * @param issueId - Issue ID
 * @param statusId - New status ID
 * @param order - New order position
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { moveIssue } from '@/utils/supabase/queries'
 *
 * const { data, error } = await moveIssue(issueId, newStatusId, newOrder)
 * ```
 */
export async function moveIssue(
  issueId: string,
  statusId: string,
  order: string
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("issues")
    .update({ status_id: statusId, order })
    .eq("id", issueId)
    .select()

  if (error) {
    console.error("Error moving issue:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update issue order within same status
 *
 * @param issueId - Issue ID
 * @param order - New order position
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updateIssueOrder } from '@/utils/supabase/queries'
 *
 * const { data, error } = await updateIssueOrder(issueId, newOrder)
 * ```
 */
export async function updateIssueOrder(issueId: string, order: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("issues")
    .update({ order })
    .eq("id", issueId)
    .select()

  if (error) {
    console.error("Error updating issue order:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ============================================================================
// COMMENTS QUERIES
// ============================================================================

/**
 * Get all comments for an issue (Isomorphic)
 *
 * @param issueId - Issue ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * const { data: comments } = await getCommentsByIssueId(issueId, { serverSide: true })
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: comments } = await getCommentsByIssueId(issueId)
 * ```
 */
export async function getCommentsByIssueId(
  issueId: string,
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:users (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Add a comment to an issue
 *
 * @param issueId - Issue ID
 * @param userId - User ID
 * @param content - Comment content
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { addComment } from '@/utils/supabase/queries'
 *
 * const { data, error } = await addComment(issueId, userId, 'Comment text')
 * ```
 */
export async function addComment(
  issueId: string,
  userId: string,
  content: string
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("comments")
    .insert({ issue_id: issueId, user_id: userId, content })
    .select(
      `
      *,
      user:users (
        id,
        display_name,
        avatar_url
      )
    `
    )

  if (error) {
    console.error("Error adding comment:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update a comment
 *
 * @param commentId - Comment ID
 * @param content - Updated content
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updateComment } from '@/utils/supabase/queries'
 *
 * const { data, error } = await updateComment(commentId, 'Updated text')
 * ```
 */
export async function updateComment(commentId: string, content: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .select()

  if (error) {
    console.error("Error updating comment:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Delete a comment
 *
 * @param commentId - Comment ID
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { deleteComment } from '@/utils/supabase/queries'
 *
 * const { error } = await deleteComment(commentId)
 * ```
 */
export async function deleteComment(commentId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("comments").delete().eq("id", commentId)

  if (error) {
    console.error("Error deleting comment:", error)
    return { error }
  }

  return { error: null }
}

// ============================================================================
// RPC FUNCTIONS (Database Functions)
// ============================================================================

/**
 * Get project statistics using RPC function (Isomorphic)
 *
 * @param projectId - Project ID
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * import { getProjectStats } from '@/utils/supabase/queries'
 *
 * const { data: stats } = await getProjectStats(projectId, { serverSide: true })
 * // {
 * //   total_issues: 45,
 * //   open_issues: 20,
 * //   in_progress_issues: 15,
 * //   closed_issues: 10,
 * //   total_members: 8
 * // }
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: stats } = await getProjectStats(projectId)
 * ```
 */
export async function getProjectStats(
  projectId: string,
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("get_project_stats", {
    p_project_id: projectId,
  })

  if (error) {
    console.error("Error fetching project stats:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Accept team invitation using RPC function
 *
 * @param token - Invitation token
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { acceptTeamInvitation } from '@/utils/supabase/queries'
 *
 * const { data, error } = await acceptTeamInvitation('secure-token')
 * ```
 */
export async function acceptTeamInvitation(token: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("accept_team_invitation", {
    p_token: token,
  })

  if (error) {
    console.error("Error accepting team invitation:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Search issues using RPC function with full-text search (Isomorphic)
 *
 * @param projectId - Project ID
 * @param query - Search query string
 * @param filters - Optional filters (status, priority, assignee)
 * @param options - Query options (serverSide: true for Server Components)
 *
 * @example Server Component
 * ```tsx
 * import { searchIssues } from '@/utils/supabase/queries'
 *
 * const { data: results } = await searchIssues(
 *   projectId,
 *   'authentication',
 *   { status: ['open', 'in_progress'], priority: ['high', 'critical'] },
 *   { serverSide: true }
 * )
 * ```
 *
 * @example Client Component
 * ```tsx
 * const { data: results } = await searchIssues(projectId, 'authentication', {
 *   status: ['open', 'in_progress'],
 *   priority: ['high', 'critical']
 * })
 * ```
 */
export async function searchIssues(
  projectId: string,
  query: string,
  filters?: {
    status?: string[]
    priority?: string[]
    assignee_id?: string
  },
  
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("search_issues", {
    p_project_id: projectId,
    p_query: query,
    p_filters: filters || {},
  })

  if (error) {
    console.error("Error searching issues:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update issue status using RPC function (with activity logging)
 *
 * @param issueId - Issue ID
 * @param newStatus - New status value
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updateIssueStatus } from '@/utils/supabase/queries'
 *
 * const { data, error } = await updateIssueStatus(issueId, 'in_progress')
 * ```
 */
export async function updateIssueStatus(issueId: string, newStatus: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("update_issue_status", {
    p_issue_id: issueId,
    p_new_status: newStatus,
  })

  if (error) {
    console.error("Error updating issue status:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Assign issue to user using RPC function (with notification)
 *
 * @param issueId - Issue ID
 * @param assigneeId - User ID to assign to
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { assignIssue } from '@/utils/supabase/queries'
 *
 * const { data, error } = await assignIssue(issueId, userId)
 * ```
 */
export async function assignIssue(issueId: string, assigneeId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc("assign_issue", {
    p_issue_id: issueId,
    p_assignee_id: assigneeId,
  })

  if (error) {
    console.error("Error assigning issue:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Mark all notifications as read for current user
 *
 * @param userId - User ID
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { markAllNotificationsRead } from '@/utils/supabase/queries'
 *
 * const { error } = await markAllNotificationsRead(userId)
 * ```
 */
export async function markAllNotificationsRead(userId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.rpc("mark_all_notifications_read", {
    p_user_id: userId,
  })

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { error }
  }

  return { error: null }
}
