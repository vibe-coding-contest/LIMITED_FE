"use client"

import { Suspense, use } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface ProjectSettingsPageProps {
  params: Promise<{
    projectId: string
  }>
}

/**
 * Project Settings Page
 *
 * Configure project settings, statuses, and manage access.
 */
export default function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { projectId } = use(params)

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">프로젝트 설정</h1>
            <p className="mt-2 text-muted-foreground">
              프로젝트 정보와 워크플로우를 관리하세요
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}`}>프로젝트로 돌아가기</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Project Settings Form */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">프로젝트 정보</h2>
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                ProjectSettings 컴포넌트로 교체 예정
              </p>
            </Suspense>
          </Card>

          {/* Status Management */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">상태 관리</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              프로젝트 보드에서 사용할 상태를 관리하세요
            </p>
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                StatusList 컴포넌트로 교체 예정
              </p>
            </Suspense>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-destructive">
              위험 구역
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              프로젝트를 삭제하면 모든 이슈와 데이터가 영구적으로 삭제됩니다.
            </p>
            <Button variant="destructive">프로젝트 삭제</Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
