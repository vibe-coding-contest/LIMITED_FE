import { Suspense } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

/**
 * New Issue Page
 *
 * Create a new issue for a project.
 */
export default function NewIssuePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">새 이슈 만들기</h1>
            <p className="mt-2 text-muted-foreground">
              프로젝트에 새 이슈를 추가하세요
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/projects">취소</Link>
          </Button>
        </div>

        {/* Issue Form */}
        <Card className="p-8">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              IssueForm 컴포넌트로 교체 예정
            </p>
          </Suspense>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
