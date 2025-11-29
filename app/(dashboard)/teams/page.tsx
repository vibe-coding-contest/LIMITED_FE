"use client"

import { Suspense, useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Spinner } from "@/components/ui/spinner"
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog"
import { TeamList } from "@/components/teams/TeamList"
import { createClient } from "@/lib/supabase/client"
import { useTeams } from "@/hooks/use-teams"

/**
 * Teams List Page
 *
 * Displays all teams the user is a member of.
 * Allows creating new teams and managing existing ones.
 */
export default function TeamsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  const handleTeamCreated = () => {
    // Force re-fetch teams by changing key
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">팀</h1>
            <p className="mt-2 text-muted-foreground">
              프로젝트를 관리할 팀을 만들고 멤버를 초대하세요
            </p>
          </div>
          <CreateTeamDialog onTeamCreated={handleTeamCreated} />
        </div>

        {/* Teams List */}
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          {userId ? (
            <TeamsContent key={refreshKey} userId={userId} />
          ) : (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

/**
 * TeamsContent Component
 *
 * Separate component to handle teams data fetching
 */
function TeamsContent({ userId }: { userId: string }) {
  const { teams, loading, error } = useTeams(userId)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">
          팀 목록을 불러오는 중 오류가 발생했습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return <TeamList teams={teams} />
}
