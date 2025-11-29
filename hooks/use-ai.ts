"use client"

import { useState } from "react"
import {
  analyzeIssue,
  enhanceDescription,
  suggestWorkflow,
  findSimilarIssues,
  estimateTime,
  type AnalyzeIssueRequest,
  type EnhanceDescriptionRequest,
  type SuggestWorkflowRequest,
  type FindSimilarIssuesRequest,
  type EstimateTimeRequest,
} from "@/utils/supabase/ai"

/**
 * Custom hook for AI-powered features using Supabase Edge Functions
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { useAI } from '@/hooks/use-ai'
 *
 * function IssueForm() {
 *   const ai = useAI()
 *
 *   const handleAnalyze = async () => {
 *     const result = await ai.analyzeIssue({
 *       title: 'Bug in login',
 *       description: 'Users cannot login'
 *     })
 *     console.log(result)
 *   }
 * }
 * ```
 */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Analyze issue to get AI suggestions
   */
  const analyzeIssueWithAI = async (data: AnalyzeIssueRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: aiError } = await analyzeIssue(data)

      if (aiError) {
        throw new Error(aiError.message || "Failed to analyze issue")
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Enhance issue description with AI
   */
  const enhanceDescriptionWithAI = async (data: EnhanceDescriptionRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: aiError } = await enhanceDescription(data)

      if (aiError) {
        throw new Error(aiError.message || "Failed to enhance description")
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get AI-powered workflow suggestions
   */
  const suggestWorkflowWithAI = async (data: SuggestWorkflowRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: aiError } = await suggestWorkflow(data)

      if (aiError) {
        throw new Error(aiError.message || "Failed to suggest workflow")
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Find similar issues using AI
   */
  const findSimilarIssuesWithAI = async (data: FindSimilarIssuesRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: aiError } = await findSimilarIssues(data)

      if (aiError) {
        throw new Error(aiError.message || "Failed to find similar issues")
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Estimate time for issue completion
   */
  const estimateTimeWithAI = async (data: EstimateTimeRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: aiError } = await estimateTime(data)

      if (aiError) {
        throw new Error(aiError.message || "Failed to estimate time")
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Legacy function for backward compatibility
   * @deprecated Use enhanceDescriptionWithAI instead
   */
  const generateDescription = async ({
    title,
    context,
  }: {
    title: string
    context?: string
  }): Promise<string> => {
    const result = await enhanceDescriptionWithAI({
      title,
      description: context || "",
    })

    return result?.enhanced_description || ""
  }

  return {
    // AI functions
    analyzeIssue: analyzeIssueWithAI,
    enhanceDescription: enhanceDescriptionWithAI,
    suggestWorkflow: suggestWorkflowWithAI,
    findSimilarIssues: findSimilarIssuesWithAI,
    estimateTime: estimateTimeWithAI,

    // Legacy function (deprecated)
    generateDescription,

    // State
    isLoading,
    error,

    // Aliases for backward compatibility
    isGenerating: isLoading,
  }
}
