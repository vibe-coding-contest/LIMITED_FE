/**
 * Application Model Types
 *
 * These types represent the application's domain models,
 * including relationships and computed properties.
 */

import { Tables } from "./database.types"

// Base types from database
export type User = Tables<"users">
export type Team = Tables<"teams">
export type TeamMember = Tables<"team_members">
export type Project = Tables<"projects">
export type Status = Tables<"statuses">
export type Issue = Tables<"issues">
export type Comment = Tables<"comments">
export type Attachment = Tables<"attachments">

// Extended types with relationships
export interface UserWithTeams extends User {
  teams: TeamWithRole[]
}

export interface TeamWithRole extends Team {
  role: TeamMember["role"]
  member_count?: number
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithUser[]
  owner: User
  project_count?: number
}

export interface TeamMemberWithUser extends TeamMember {
  user: User
}

export interface ProjectWithDetails extends Project {
  team: Team
  statuses: Status[]
  issue_count?: number
}

export interface StatusWithIssues extends Status {
  issues: IssueWithDetails[]
  issue_count: number
}

export interface IssueWithDetails extends Issue {
  project: Project
  status: Status
  assignee: User | null
  reporter: User
  comments?: CommentWithUser[]
  attachments?: Attachment[]
  comment_count?: number
  attachment_count?: number
}

export interface CommentWithUser extends Comment {
  user: User
}

// Form types for creating/updating records
export interface CreateTeamInput {
  name: string
  description?: string
}

export interface UpdateTeamInput {
  name?: string
  description?: string
}

export interface CreateProjectInput {
  team_id: string
  name: string
  key: string
  description?: string
  icon?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  icon?: string
}

export interface CreateStatusInput {
  project_id: string
  name: string
  color: string
  order: number
}

export interface UpdateStatusInput {
  name?: string
  color?: string
  order?: number
}

export interface CreateIssueInput {
  project_id: string
  title: string
  description?: string
  status_id: string
  priority?: Issue["priority"]
  assignee_id?: string
  order: string
}

export interface UpdateIssueInput {
  title?: string
  description?: string
  status_id?: string
  priority?: Issue["priority"]
  assignee_id?: string | null
  order?: string
}

export interface CreateCommentInput {
  issue_id: string
  content: string
}

export interface UpdateCommentInput {
  content: string
}

export interface CreateAttachmentInput {
  issue_id: string
  filename: string
  file_url: string
  file_size: number
  mime_type: string
}

// UI State types
export interface IssueFilters {
  search?: string
  status_ids?: string[]
  assignee_ids?: string[]
  priorities?: Issue["priority"][]
  reporter_ids?: string[]
}

export interface IssueSortOptions {
  field: "title" | "priority" | "created_at" | "updated_at" | "order"
  direction: "asc" | "desc"
}

export interface BoardView {
  type: "kanban" | "list"
  grouped_by: "status" | "assignee" | "priority"
  filters: IssueFilters
  sort: IssueSortOptions
}

// Drag and drop types
export interface DragItem {
  id: string
  type: "issue"
  data: Issue
}

export interface DropResult {
  source_status_id: string
  destination_status_id: string
  source_index: number
  destination_index: number
}

// Realtime subscription types
export interface RealtimePayload<T> {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: T
  old: T
}

export type IssueRealtimePayload = RealtimePayload<Issue>
export type CommentRealtimePayload = RealtimePayload<Comment>
export type StatusRealtimePayload = RealtimePayload<Status>

// Utility types
export type Priority = Issue["priority"]
export type TeamRole = TeamMember["role"]

export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"]
export const TEAM_ROLES: TeamRole[] = ["owner", "admin", "member"]

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-gray-600 bg-gray-100",
  medium: "text-blue-600 bg-blue-100",
  high: "text-orange-600 bg-orange-100",
  urgent: "text-red-600 bg-red-100",
}

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}
