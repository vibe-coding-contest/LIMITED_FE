import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 *
 * @returns Supabase client instance for server-side usage with cookie-based auth
 *
 * @example
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function ServerComponent() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   return <div>Hello {user?.email}</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server'
 *
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function fetchProjects() {
 *   const supabase = await createClient()
 *   const { data, error } = await supabase.from('projects').select('*')
 *   return data
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
