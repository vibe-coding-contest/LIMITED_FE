import { Suspense } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface TeamDetailPageProps {
  params: Promise<{
    teamId: string
  }>
}

/**
 * Team Detail Page
 *
 * Displays team information, members, and associated projects.
 */
export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">팀 상세</h1>
            <p className="mt-2 text-muted-foreground">
              팀 ID: {teamId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/teams/${teamId}/settings`}>팀 설정</Link>
            </Button>
            <Button>+ 프로젝트 만들기</Button>
          </div>
        </div>

        {/* Team Info & Members */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Team Info */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold">팀 정보</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              팀 정보가 여기 표시됩니다
            </p>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold">팀 멤버</h2>
            <Suspense
              fallback={
                <div className="mt-4 flex justify-center">
                  <Spinner className="h-6 w-6" />
                </div>
              }
            >
              <p className="mt-2 text-sm text-muted-foreground">
                TeamMemberList 컴포넌트로 교체 예정
              </p>
            </Suspense>
          </Card>
        </div>

        {/* Projects */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">프로젝트</h2>
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              ProjectList 컴포넌트로 교체 예정
            </p>
          </Suspense>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
