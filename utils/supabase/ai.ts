import { createClient as createBrowserClient } from "@/lib/supabase/client"

/**
 * AI Assistant utility functions for Supabase Edge Functions
 *
 * These functions call the Supabase Edge Function for AI-powered features.
 * Edge Function URL: /functions/v1/ai-assistant
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AnalyzeIssueRequest {
  title: string
  description: string
}

export interface AnalyzeIssueResponse {
  type: "bug" | "story" | "task" | "epic"
  priority: "low" | "medium" | "high" | "critical"
  labels: string[]
  estimated_hours: number
  reasoning: string
}

export interface EnhanceDescriptionRequest {
  title: string
  description: string
}

export interface EnhanceDescriptionResponse {
  enhanced_description: string
}

export interface SuggestWorkflowRequest {
  project_type: string
  team_size: number
  methodology: string
}

export interface SuggestWorkflowResponse {
  workflow_name: string
  statuses: Array<{
    name: string
    color: string
    order: number
  }>
  description: string
}

export interface FindSimilarIssuesRequest {
  project_id: string
  title: string
  description: string
}

export interface FindSimilarIssuesResponse {
  similar_issues: Array<{
    id: string
    title: string
    similarity_score: number
  }>
}

export interface EstimateTimeRequest {
  title: string
  description: string
  type: "bug" | "story" | "task" | "epic"
}

export interface EstimateTimeResponse {
  estimated_hours: number
  confidence: "low" | "medium" | "high"
  reasoning: string
}

// ============================================================================
// AI ASSISTANT FUNCTIONS
// ============================================================================

/**
 * Analyze issue to suggest type, priority, labels, and time estimate
 *
 * @param data - Issue data to analyze
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { analyzeIssue } from '@/utils/supabase/ai'
 *
 * const { data, error } = await analyzeIssue({
 *   title: 'Login page not responsive on mobile',
 *   description: 'Layout breaks on iOS Safari and Android Chrome'
 * })
 *
 * // Returns:
 * // {
 * //   type: 'bug',
 * //   priority: 'high',
 * //   labels: ['mobile', 'ui', 'responsive'],
 * //   estimated_hours: 4,
 * //   reasoning: '...'
 * // }
 * ```
 */
export async function analyzeIssue(data: AnalyzeIssueRequest) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation: "analyze_issue",
        data,
      },
    }
  )

  if (error) {
    console.error("Error analyzing issue:", error)
    return { data: null, error }
  }

  return { data: result?.result as AnalyzeIssueResponse, error: null }
}

/**
 * Enhance issue description with AI-generated improvements
 *
 * @param data - Issue data to enhance
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { enhanceDescription } from '@/utils/supabase/ai'
 *
 * const { data, error } = await enhanceDescription({
 *   title: 'Add user profile',
 *   description: 'Users need profile page'
 * })
 *
 * // Returns enhanced description with:
 * // - User Story format
 * // - Acceptance Criteria
 * // - Technical Notes
 * ```
 */
export async function enhanceDescription(data: EnhanceDescriptionRequest) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation: "enhance_description",
        data,
      },
    }
  )

  if (error) {
    console.error("Error enhancing description:", error)
    return { data: null, error }
  }

  return { data: result?.result as EnhanceDescriptionResponse, error: null }
}

/**
 * Suggest workflow based on project type and team
 *
 * @param data - Project information
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { suggestWorkflow } from '@/utils/supabase/ai'
 *
 * const { data, error } = await suggestWorkflow({
 *   project_type: 'web_development',
 *   team_size: 5,
 *   methodology: 'agile'
 * })
 *
 * // Returns recommended workflow with statuses
 * ```
 */
export async function suggestWorkflow(data: SuggestWorkflowRequest) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation: "suggest_workflow",
        data,
      },
    }
  )

  if (error) {
    console.error("Error suggesting workflow:", error)
    return { data: null, error }
  }

  return { data: result?.result as SuggestWorkflowResponse, error: null }
}

/**
 * Find similar issues using AI-powered similarity search
 *
 * @param data - Issue data for similarity search
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { findSimilarIssues } from '@/utils/supabase/ai'
 *
 * const { data, error } = await findSimilarIssues({
 *   project_id: 'project-uuid',
 *   title: 'Login authentication error',
 *   description: 'Users cannot log in with correct credentials'
 * })
 *
 * // Returns list of similar issues with similarity scores
 * ```
 */
export async function findSimilarIssues(data: FindSimilarIssuesRequest) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation: "find_similar_issues",
        data,
      },
    }
  )

  if (error) {
    console.error("Error finding similar issues:", error)
    return { data: null, error }
  }

  return { data: result?.result as FindSimilarIssuesResponse, error: null }
}

/**
 * Estimate time required for an issue
 *
 * @param data - Issue data for time estimation
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { estimateTime } from '@/utils/supabase/ai'
 *
 * const { data, error } = await estimateTime({
 *   title: 'Implement real-time notifications',
 *   description: 'Add WebSocket support for real-time updates',
 *   type: 'story'
 * })
 *
 * // Returns:
 * // {
 * //   estimated_hours: 16,
 * //   confidence: 'medium',
 * //   reasoning: '...'
 * // }
 * ```
 */
export async function estimateTime(data: EstimateTimeRequest) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation: "estimate_time",
        data,
      },
    }
  )

  if (error) {
    console.error("Error estimating time:", error)
    return { data: null, error }
  }

  return { data: result?.result as EstimateTimeResponse, error: null }
}

/**
 * Generic function to call AI Assistant Edge Function
 *
 * @param operation - Operation name
 * @param data - Operation-specific data
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { callAIAssistant } from '@/utils/supabase/ai'
 *
 * const { data, error } = await callAIAssistant('custom_operation', {
 *   // custom data
 * })
 * ```
 */
export async function callAIAssistant<T = unknown>(
  operation: string,
  data: unknown
) {
  const supabase = createBrowserClient()

  const { data: result, error } = await supabase.functions.invoke(
    "ai-assistant",
    {
      body: {
        operation,
        data,
      },
    }
  )

  if (error) {
    console.error(`Error calling AI Assistant (${operation}):`, error)
    return { data: null, error }
  }

  return { data: result as T, error: null }
}
