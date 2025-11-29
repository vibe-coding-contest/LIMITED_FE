"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { resetPassword } from "@/utils/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Mail, ArrowLeft } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check for error from callback redirect
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(errorParam)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(formData.email)

      if (error) {
        setError(error.message || "비밀번호 재설정 요청에 실패했습니다")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      console.error("Password reset error:", err)
      setError("예상치 못한 오류가 발생했습니다")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-green-900">
            이메일을 확인해주세요
          </h2>
          <p className="text-sm text-green-700">
            비밀번호 재설정 링크가 이메일로 전송되었습니다.
            <br />
            링크는 <strong>1시간</strong> 동안 유효합니다.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-medium">이메일이 도착하지 않았나요?</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>스팸 메일함을 확인해주세요</li>
            <li>입력한 이메일 주소가 올바른지 확인해주세요</li>
            <li>몇 분 후에 다시 시도해주세요</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인 페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          비밀번호 찾기
        </h2>
        <p className="text-sm text-muted-foreground">
          가입하신 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              전송 중...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              재설정 링크 보내기
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  )
}
