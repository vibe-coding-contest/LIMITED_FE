"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import type { Team, CreateTeamInput, UpdateTeamInput } from "@/types/models"

// Team form validation schema
const teamSchema = z.object({
  name: z
    .string()
    .min(2, "팀 이름은 최소 2자 이상이어야 합니다")
    .max(50, "팀 이름은 최대 50자까지 입력 가능합니다"),
  description: z
    .string()
    .max(500, "설명은 최대 500자까지 입력 가능합니다")
    .optional(),
})

type TeamFormData = z.infer<typeof teamSchema>

interface TeamFormProps {
  /**
   * Team data for editing (omit for create mode)
   */
  team?: Team
  /**
   * Callback when form is submitted successfully
   */
  onSubmit: (data: CreateTeamInput | UpdateTeamInput) => Promise<void>
  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void
  /**
   * Submit button text
   */
  submitText?: string
}

/**
 * TeamForm Component
 *
 * Form for creating or editing teams.
 *
 * @example
 * ```tsx
 * // Create mode
 * <TeamForm
 *   onSubmit={handleCreateTeam}
 *   onCancel={handleCancel}
 * />
 *
 * // Edit mode
 * <TeamForm
 *   team={existingTeam}
 *   onSubmit={handleUpdateTeam}
 *   submitText="수정 완료"
 * />
 * ```
 */
export function TeamForm({
  team,
  onSubmit,
  onCancel,
  submitText,
}: TeamFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditMode = !!team

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: team
      ? {
          name: team.name,
          description: team.description || "",
        }
      : undefined,
  })

  const handleFormSubmit = async (formData: TeamFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Team form submission error:", err)
      setError(
        err instanceof Error ? err.message : "팀 저장에 실패했습니다"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          팀 이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="개발팀"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Team Description */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="팀에 대한 간단한 설명을 입력하세요"
          rows={4}
          disabled={isLoading}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          팀의 목적과 역할을 설명해주세요
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {isEditMode ? "수정 중..." : "생성 중..."}
            </>
          ) : (
            submitText || (isEditMode ? "팀 수정" : "팀 만들기")
          )}
        </Button>
      </div>
    </form>
  )
}
