/**
 * API Request and Response Types
 *
 * These types define the structure of API requests and responses
 * for server actions and API routes.
 */

import {
  User,
  Team,
  Project,
  Issue,
  Status,
  Comment,
  Attachment,
  TeamWithMembers,
  ProjectWithDetails,
  IssueWithDetails,
  StatusWithIssues,
} from "./models"

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Auth API types
export interface SignUpRequest {
  email: string
  password: string
  display_name: string
}

export interface SignUpResponse extends ApiResponse<User> {}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse extends ApiResponse<{ user: User; session: Session }> {}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

// Team API types
export interface CreateTeamRequest {
  name: string
  description?: string
}

export interface CreateTeamResponse extends ApiResponse<Team> {}

export interface GetTeamResponse extends ApiResponse<TeamWithMembers> {}

export interface ListTeamsResponse extends ApiResponse<Team[]> {}

export interface UpdateTeamRequest {
  name?: string
  description?: string
}

export interface UpdateTeamResponse extends ApiResponse<Team> {}

export interface InviteTeamMemberRequest {
  email: string
  role?: "admin" | "member"
}

export interface InviteTeamMemberResponse extends ApiResponse<{ invited: boolean }> {}

// Project API types
export interface CreateProjectRequest {
  team_id: string
  name: string
  key: string
  description?: string
  icon?: string
}

export interface CreateProjectResponse extends ApiResponse<Project> {}

export interface GetProjectResponse extends ApiResponse<ProjectWithDetails> {}

export interface ListProjectsRequest {
  team_id?: string
}

export interface ListProjectsResponse extends ApiResponse<Project[]> {}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  icon?: string
}

export interface UpdateProjectResponse extends ApiResponse<Project> {}

// Status API types
export interface CreateStatusRequest {
  project_id: string
  name: string
  color: string
  order: number
}

export interface CreateStatusResponse extends ApiResponse<Status> {}

export interface ListStatusesRequest {
  project_id: string
}

export interface ListStatusesResponse extends ApiResponse<StatusWithIssues[]> {}

export interface UpdateStatusRequest {
  name?: string
  color?: string
  order?: number
}

export interface UpdateStatusResponse extends ApiResponse<Status> {}

export interface ReorderStatusesRequest {
  status_ids: string[]
}

export interface ReorderStatusesResponse extends ApiResponse<Status[]> {}

// Issue API types
export interface CreateIssueRequest {
  project_id: string
  title: string
  description?: string
  status_id: string
  priority?: "low" | "medium" | "high" | "urgent"
  assignee_id?: string
}

export interface CreateIssueResponse extends ApiResponse<Issue> {}

export interface GetIssueResponse extends ApiResponse<IssueWithDetails> {}

export interface ListIssuesRequest {
  project_id?: string
  status_id?: string
  assignee_id?: string
  reporter_id?: string
  priority?: string[]
  search?: string
  pagination?: PaginationParams
}

export interface ListIssuesResponse extends ApiResponse<PaginatedResponse<IssueWithDetails>> {}

export interface UpdateIssueRequest {
  title?: string
  description?: string
  status_id?: string
  priority?: "low" | "medium" | "high" | "urgent"
  assignee_id?: string | null
}

export interface UpdateIssueResponse extends ApiResponse<Issue> {}

export interface MoveIssueRequest {
  destination_status_id: string
  destination_order: string
}

export interface MoveIssueResponse extends ApiResponse<Issue> {}

// Comment API types
export interface CreateCommentRequest {
  issue_id: string
  content: string
}

export interface CreateCommentResponse extends ApiResponse<Comment> {}

export interface ListCommentsRequest {
  issue_id: string
}

export interface ListCommentsResponse extends ApiResponse<Comment[]> {}

export interface UpdateCommentRequest {
  content: string
}

export interface UpdateCommentResponse extends ApiResponse<Comment> {}

// Attachment API types
export interface UploadAttachmentRequest {
  issue_id: string
  file: File
}

export interface UploadAttachmentResponse extends ApiResponse<Attachment> {}

export interface ListAttachmentsRequest {
  issue_id: string
}

export interface ListAttachmentsResponse extends ApiResponse<Attachment[]> {}

export interface DeleteAttachmentRequest {
  id: string
}

export interface DeleteAttachmentResponse extends ApiResponse<{ deleted: boolean }> {}

// Utility types for server actions
export type ServerActionResponse<T> = Promise<ApiResponse<T>>

export type ServerActionHandler<TRequest, TResponse> = (
  request: TRequest
) => ServerActionResponse<TResponse>
