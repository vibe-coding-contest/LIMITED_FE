"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

// Issue form validation schema
const issueSchema = z.object({
  title: z
    .string()
    .min(5, "제목은 최소 5자 이상이어야 합니다")
    .max(200, "제목은 최대 200자까지 입력 가능합니다"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee_id: z.string().optional(),
})

type IssueFormData = z.infer<typeof issueSchema>

interface IssueFormProps {
  projectId: string
  statusId: string
  onSubmit: (data: IssueFormData) => Promise<void>
  onCancel?: () => void
}

/**
 * IssueForm Component
 *
 * Form for creating or editing issues.
 */
export function IssueForm({
  projectId,
  statusId,
  onSubmit,
  onCancel,
}: IssueFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "medium",
    },
  })

  const selectedPriority = watch("priority")

  const handleFormSubmit = async (formData: IssueFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Issue form submission error:", err)
      setError(
        err instanceof Error ? err.message : "이슈 생성에 실패했습니다"
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

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="이슈 제목을 입력하세요"
          disabled={isLoading}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="이슈에 대한 자세한 설명을 입력하세요"
          rows={6}
          disabled={isLoading}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">
          우선순위 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedPriority}
          onValueChange={(value) =>
            setValue("priority", value as "low" | "medium" | "high" | "urgent")
          }
          disabled={isLoading}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">낮음</SelectItem>
            <SelectItem value="medium">보통</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="urgent">긴급</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
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
              생성 중...
            </>
          ) : (
            "이슈 만들기"
          )}
        </Button>
      </div>
    </form>
  )
}
