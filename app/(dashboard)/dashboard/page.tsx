import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard"

export const metadata = {
  title: "Dashboard - Jira Lite",
  description: "Your personal dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here&apos;s your personal overview.
        </p>
      </div>

      <PersonalDashboard userId={user.id} />
    </div>
  )
}
