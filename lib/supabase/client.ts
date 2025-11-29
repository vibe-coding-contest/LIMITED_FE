import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase client for use in Client Components and Client-side operations
 *
 * @returns Supabase client instance for browser/client-side usage
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export default function ClientComponent() {
 *   const supabase = createClient()
 *
 *   const handleSignOut = async () => {
 *     await supabase.auth.signOut()
 *   }
 *
 *   return <button onClick={handleSignOut}>Sign Out</button>
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
