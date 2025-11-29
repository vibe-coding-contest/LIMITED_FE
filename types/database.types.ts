/**
 * Supabase Database Types
 *
 * This file contains the database schema types for Supabase tables.
 * These types should match your actual Supabase schema.
 *
 * You can generate these types automatically using:
 * npx supabase gen types typescript --project-id your-project-ref --schema public > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: "owner" | "admin" | "member"
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: "owner" | "admin" | "member"
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: "owner" | "admin" | "member"
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          team_id: string
          name: string
          key: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          key: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          key?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      statuses: {
        Row: {
          id: string
          project_id: string
          name: string
          color: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          color: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          color?: string
          order?: number
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status_id: string
          priority: "low" | "medium" | "high" | "urgent"
          assignee_id: string | null
          reporter_id: string
          order: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status_id: string
          priority?: "low" | "medium" | "high" | "urgent"
          assignee_id?: string | null
          reporter_id: string
          order: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status_id?: string
          priority?: "low" | "medium" | "high" | "urgent"
          assignee_id?: string | null
          reporter_id?: string
          order?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          filename: string
          file_url: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          filename: string
          file_url: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          filename?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "issue_assigned" | "issue_commented" | "issue_updated" | "mention"
          title: string
          message: string
          issue_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "issue_assigned" | "issue_commented" | "issue_updated" | "mention"
          title: string
          message: string
          issue_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "issue_assigned" | "issue_commented" | "issue_updated" | "mention"
          title?: string
          message?: string
          issue_id?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority: "low" | "medium" | "high" | "urgent"
      team_role: "owner" | "admin" | "member"
    }
  }
}

// Helper types for working with database types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
