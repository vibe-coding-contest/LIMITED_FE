import { Suspense } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/**
 * Projects List Page
 *
 * Displays all projects across all teams the user has access to.
 */
export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
            <p className="mt-2 text-muted-foreground">
              모든 팀의 프로젝트를 한눈에 확인하세요
            </p>
          </div>
          <Button>+ 새 프로젝트</Button>
        </div>

        {/* Projects List */}
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          {/* TODO: Replace with ProjectList component */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="font-semibold">프로젝트 목록이 여기 표시됩니다</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ProjectList 컴포넌트로 교체 예정
              </p>
            </Card>
          </div>
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
