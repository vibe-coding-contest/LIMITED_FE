"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

// Team invite validation schema
const inviteSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  role: z.enum(["member", "admin"]),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface TeamInviteFormProps {
  teamId: string
  /**
   * Callback when invitation is sent successfully
   */
  onInvite: (data: InviteFormData & { teamId: string }) => Promise<void>
  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void
}

/**
 * TeamInviteForm Component
 *
 * Form for inviting new members to a team.
 *
 * @example
 * ```tsx
 * <TeamInviteForm
 *   teamId={team.id}
 *   onInvite={handleSendInvite}
 *   onCancel={handleClose}
 * />
 * ```
 */
export function TeamInviteForm({
  teamId,
  onInvite,
  onCancel,
}: TeamInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "member",
    },
  })

  const selectedRole = watch("role")

  const handleFormSubmit = async (formData: InviteFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await onInvite({
        ...formData,
        teamId,
      })

      setSuccess(true)
      reset()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Team invite error:", err)
      setError(
        err instanceof Error ? err.message : "초대 발송에 실패했습니다"
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

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          초대 이메일이 성공적으로 발송되었습니다
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">
          이메일 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="member@example.com"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          초대할 멤버의 이메일 주소를 입력하세요
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">
          역할 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedRole}
          onValueChange={(value) =>
            setValue("role", value as "member" | "admin")
          }
          disabled={isLoading}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="역할 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">멤버</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium">역할 권한:</p>
          <ul className="ml-4 list-disc space-y-0.5">
            <li>
              <strong>멤버:</strong> 프로젝트 및 이슈 읽기/쓰기
            </li>
            <li>
              <strong>관리자:</strong> 멤버 + 팀 설정 및 멤버 관리
            </li>
          </ul>
        </div>
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
              발송 중...
            </>
          ) : (
            "초대 발송"
          )}
        </Button>
      </div>
    </form>
  )
}
