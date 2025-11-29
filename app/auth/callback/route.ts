import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  const supabase = await createClient()

  // Check for errors in URL hash or query params
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle errors (expired link, invalid token, etc.)
  if (error || errorCode) {
    const errorMessage =
      errorCode === "otp_expired"
        ? "비밀번호 재설정 링크가 만료되었습니다. 다시 요청해주세요."
        : errorDescription || "인증 중 오류가 발생했습니다."

    // Redirect to forgot-password with error message
    const redirectUrl = new URL("/forgot-password", request.url)
    redirectUrl.searchParams.set("error", errorMessage)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle PKCE code exchange
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    // Handle exchange error
    if (exchangeError) {
      const redirectUrl = new URL("/forgot-password", request.url)
      redirectUrl.searchParams.set("error", "링크가 유효하지 않습니다. 다시 요청해주세요.")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle token_hash for password recovery (email magic link)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (verifyError) {
      const redirectUrl = new URL("/forgot-password", request.url)
      redirectUrl.searchParams.set("error", "링크가 유효하지 않거나 만료되었습니다.")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no code or token_hash, check if session already exists
  if (!code && !token_hash) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // No session means invalid access to callback
    if (!session && next.includes("reset-password")) {
      const redirectUrl = new URL("/forgot-password", request.url)
      redirectUrl.searchParams.set("error", "유효한 인증 정보가 없습니다. 다시 시도해주세요.")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to the next URL or dashboard
  return NextResponse.redirect(new URL(next, request.url))
}
