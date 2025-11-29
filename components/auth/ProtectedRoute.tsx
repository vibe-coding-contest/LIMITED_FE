"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import type { User } from "@supabase/supabase-js"

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Redirect path when user is not authenticated
   * @default "/login"
   */
  redirectTo?: string
  /**
   * Optional loading component
   */
  loadingComponent?: React.ReactNode
  /**
   * Callback when authentication check is complete
   */
  onAuthStateChange?: (user: User | null) => void
}

/**
 * ProtectedRoute HOC
 *
 * Protects routes by checking authentication status.
 * Redirects to login page if user is not authenticated.
 *
 * @example
 * ```tsx
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
 *
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Protected Content</div>
 *     </ProtectedRoute>
 *   )
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
  loadingComponent,
  onAuthStateChange,
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Check initial session
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)
          onAuthStateChange?.(session.user)
        } else {
          setIsAuthenticated(false)
          onAuthStateChange?.(null)
          router.push(redirectTo)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false)
        onAuthStateChange?.(null)
        router.push(redirectTo)
      } else if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
        onAuthStateChange?.(session.user)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router, redirectTo, onAuthStateChange])

  // Show loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Spinner className="mx-auto h-8 w-8" />
            <p className="mt-4 text-sm text-muted-foreground">
              인증 확인 중...
            </p>
          </div>
        </div>
      )
    )
  }

  // Show content only when authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * withAuth HOC
 *
 * Higher-order component to wrap page components with authentication.
 *
 * @example
 * ```tsx
 * import { withAuth } from '@/components/auth/ProtectedRoute'
 *
 * function DashboardPage() {
 *   return <div>Protected Content</div>
 * }
 *
 * export default withAuth(DashboardPage)
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
