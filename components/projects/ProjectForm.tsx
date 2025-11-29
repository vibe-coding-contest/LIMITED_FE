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
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/models"

// Project form validation schema
const projectSchema = z.object({
  name: z
    .string()
    .min(2, "프로젝트 이름은 최소 2자 이상이어야 합니다")
    .max(100, "프로젝트 이름은 최대 100자까지 입력 가능합니다"),
  key: z
    .string()
    .min(2, "프로젝트 키는 최소 2자 이상이어야 합니다")
    .max(10, "프로젝트 키는 최대 10자까지 입력 가능합니다")
    .regex(/^[A-Z]+$/, "프로젝트 키는 대문자 영문만 입력 가능합니다"),
  description: z
    .string()
    .max(1000, "설명은 최대 1000자까지 입력 가능합니다")
    .optional(),
  icon: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  teamId: string
  project?: Project
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>
  onCancel?: () => void
  submitText?: string
}

/**
 * ProjectForm Component
 *
 * Form for creating or editing projects.
 *
 * @example
 * ```tsx
 * <ProjectForm
 *   teamId={team.id}
 *   onSubmit={handleCreateProject}
 *   onCancel={handleClose}
 * />
 * ```
 */
export function ProjectForm({
  teamId,
  project,
  onSubmit,
  onCancel,
  submitText,
}: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditMode = !!project

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          key: project.key,
          description: project.description || "",
          icon: project.icon || "",
        }
      : undefined,
  })

  const handleFormSubmit = async (formData: ProjectFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (isEditMode) {
        await onSubmit(formData)
      } else {
        await onSubmit({
          ...formData,
          team_id: teamId,
        })
      }
    } catch (err) {
      console.error("Project form submission error:", err)
      setError(
        err instanceof Error ? err.message : "프로젝트 저장에 실패했습니다"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">
            프로젝트 이름 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="웹사이트 리뉴얼"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Project Key */}
        <div className="space-y-2">
          <Label htmlFor="key">
            프로젝트 키 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="key"
            placeholder="WEB"
            disabled={isLoading || isEditMode}
            {...register("key")}
          />
          {errors.key && (
            <p className="text-sm text-destructive">{errors.key.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            대문자 영문만 (예: WEB, MOBILE)
          </p>
        </div>

        {/* Project Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">아이콘 (이모지)</Label>
          <Input
            id="icon"
            placeholder="🚀"
            maxLength={2}
            disabled={isLoading}
            {...register("icon")}
          />
          {errors.icon && (
            <p className="text-sm text-destructive">{errors.icon.message}</p>
          )}
        </div>
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
          rows={4}
          disabled={isLoading}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
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
            submitText || (isEditMode ? "프로젝트 수정" : "프로젝트 만들기")
          )}
        </Button>
      </div>
    </form>
  )
}
