import { Suspense } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface IssueDetailPageProps {
  params: Promise<{
    issueId: string
  }>
}

/**
 * Issue Detail Page
 *
 * Full issue details with comments and attachments.
 */
export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { issueId } = await params

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/projects">← 프로젝트로 돌아가기</Link>
          </Button>
          <Button>이슈 수정</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Issue Detail */}
          <div className="md:col-span-2">
            <Suspense
              fallback={
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              }
            >
              <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                  IssueDetail 컴포넌트로 교체 예정 (ID: {issueId})
                </p>
              </Card>
            </Suspense>

            {/* Comments */}
            <Card className="mt-6 p-6">
              <h2 className="mb-4 text-xl font-semibold">댓글</h2>
              <p className="text-sm text-muted-foreground">
                CommentList 컴포넌트로 교체 예정
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">상세 정보</h3>
              <p className="text-sm text-muted-foreground">
                IssueSidebar 컴포넌트로 교체 예정
              </p>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
