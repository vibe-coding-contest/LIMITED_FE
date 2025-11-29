import { Suspense } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface TeamSettingsPageProps {
  params: Promise<{
    teamId: string
  }>
}

/**
 * Team Settings Page
 *
 * Allows team owners/admins to manage team settings,
 * members, and permissions.
 */
export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { teamId } = await params

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">팀 설정</h1>
            <p className="mt-2 text-muted-foreground">
              팀 정보와 멤버를 관리하세요
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/teams/${teamId}`}>팀으로 돌아가기</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Team Settings Form */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">팀 정보</h2>
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                TeamForm 컴포넌트로 교체 예정 (수정 모드)
              </p>
            </Suspense>
          </Card>

          {/* Member Management */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">멤버 관리</h2>
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              }
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  TeamMemberList 및 TeamInviteForm 컴포넌트로 교체 예정
                </p>
              </div>
            </Suspense>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-destructive">
              위험 구역
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              팀을 삭제하면 모든 프로젝트와 이슈가 영구적으로 삭제됩니다.
            </p>
            <Button variant="destructive">팀 삭제</Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
