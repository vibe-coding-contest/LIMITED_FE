import { createClient as createBrowserClient } from "@/lib/supabase/client"

/**
 * Auth utility functions for Supabase authentication operations (Client Components)
 *
 * These functions use the Browser Client and are designed for Client Components.
 * For Server Components, import and use @/lib/supabase/server directly.
 */

export interface SignUpCredentials {
  email: string
  password: string
  displayName?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

/**
 * Sign up a new user with email and password
 *
 * @param credentials - User signup credentials
 * @returns User data or error
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { signUp } from '@/utils/supabase/auth'
 *
 * const { data, error } = await signUp({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   displayName: 'John Doe'
 * })
 * ```
 */
export async function signUp(credentials: SignUpCredentials) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.displayName,
      },
    },
  })

  return { data, error }
}

/**
 * Sign in an existing user with email and password
 *
 * @param credentials - User signin credentials
 * @returns Session data or error
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { signIn } from '@/utils/supabase/auth'
 *
 * const { data, error } = await signIn({
 *   email: 'user@example.com',
 *   password: 'securepassword'
 * })
 * ```
 */
export async function signIn(credentials: SignInCredentials) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  return { data, error }
}

/**
 * Sign out the current user
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { signOut } from '@/utils/supabase/auth'
 *
 * await signOut()
 * ```
 */
export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Send password reset email
 *
 * @param email - User email address
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { resetPassword } from '@/utils/supabase/auth'
 *
 * const { error } = await resetPassword('user@example.com')
 * ```
 */
export async function resetPassword(email: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  })

  return { error }
}

/**
 * Update user password
 *
 * @param newPassword - New password
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updatePassword } from '@/utils/supabase/auth'
 *
 * const { error } = await updatePassword('newSecurePassword')
 * ```
 */
export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error }
}

/**
 * Update user profile metadata
 *
 * @param metadata - User metadata object
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { updateUserMetadata } from '@/utils/supabase/auth'
 *
 * const { error } = await updateUserMetadata({
 *   display_name: 'Jane Doe',
 *   avatar_url: 'https://example.com/avatar.jpg'
 * })
 * ```
 */
export async function updateUserMetadata(metadata: Record<string, unknown>) {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.updateUser({
    data: metadata,
  })

  return { error }
}

/**
 * Verify current password by attempting to sign in
 *
 * @param currentPassword - Current password to verify
 * @returns Success or error
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { verifyCurrentPassword } from '@/utils/supabase/auth'
 *
 * const { error } = await verifyCurrentPassword('currentPassword')
 * if (!error) {
 *   // Password is correct
 * }
 * ```
 */
export async function verifyCurrentPassword(currentPassword: string) {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: new Error("User not found") }
  }

  // Try to sign in with current credentials to verify password
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  return { error }
}

/**
 * Change user password (requires current password verification)
 *
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success or error
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { changePassword } from '@/utils/supabase/auth'
 *
 * const { error } = await changePassword('oldPassword', 'newPassword')
 * ```
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  // First verify current password
  const { error: verifyError } = await verifyCurrentPassword(currentPassword)

  if (verifyError) {
    return { error: new Error("현재 비밀번호가 올바르지 않습니다.") }
  }

  // Update to new password
  const { error } = await updatePassword(newPassword)

  return { error }
}

/**
 * Delete user account (soft delete)
 *
 * Note: This function should call a backend API endpoint that handles:
 * - Checking team ownership
 * - Soft deleting the user and related data
 * - Setting deletedAt timestamp
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { deleteAccount } from '@/utils/supabase/auth'
 *
 * const { error } = await deleteAccount()
 * ```
 */
export async function deleteAccount() {
  const supabase = createBrowserClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: new Error("User not found") }
  }

  // Call backend API to handle soft delete
  // This should be implemented as a server action or API route
  // For now, we'll use Supabase admin API (requires RLS policies)
  try {
    // First, check if user owns any teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("owner_id", user.id)
      .is("deleted_at", null)

    if (teamsError) throw teamsError

    if (teams && teams.length > 0) {
      return {
        error: new Error(
          "소유한 팀을 먼저 삭제하거나 소유권을 이전해주세요."
        ),
        ownedTeams: teams,
      }
    }

    // Soft delete user by updating metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        deleted_at: new Date().toISOString(),
      },
    })

    if (updateError) throw updateError

    // Sign out after deletion
    await signOut()

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Sign in with Google OAuth
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { signInWithGoogle } from '@/utils/supabase/auth'
 *
 * const handleGoogleLogin = async () => {
 *   await signInWithGoogle()
 * }
 * ```
 */
export async function signInWithGoogle() {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  return { data, error }
}
