"use client"

import { Suspense, use } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface ProjectBoardPageProps {
  params: Promise<{
    projectId: string
  }>
}

/**
 * Project Board Page
 *
 * Kanban-style board for managing project issues.
 * This is the main workspace for the project.
 */
export default function ProjectBoardPage({ params }: ProjectBoardPageProps) {
  const { projectId } = use(params)

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">프로젝트 보드</h1>
            <p className="mt-2 text-muted-foreground">
              드래그 앤 드롭으로 이슈를 관리하세요
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}`}>개요</Link>
            </Button>
            <Button>+ 새 이슈</Button>
          </div>
        </div>

        {/* Kanban Board */}
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          {/* TODO: Replace with KanbanBoard component */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {["To Do", "In Progress", "Done"].map((status) => (
              <div
                key={status}
                className="min-w-[300px] rounded-lg border bg-muted/30 p-4"
              >
                <h3 className="mb-4 font-semibold">{status}</h3>
                <p className="text-sm text-muted-foreground">
                  KanbanBoard 컴포넌트로 교체 예정
                </p>
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
