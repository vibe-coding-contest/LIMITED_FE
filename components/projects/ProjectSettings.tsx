"use client"

import { useState } from "react"
import { ProjectForm } from "./ProjectForm"
import type { Project, UpdateProjectInput } from "@/types/models"

interface ProjectSettingsProps {
  project: Project
  onUpdate: (data: UpdateProjectInput) => Promise<void>
  onDelete?: () => Promise<void>
}

/**
 * ProjectSettings Component
 *
 * Combined component for project settings management.
 * Includes project info editing and deletion.
 *
 * @example
 * ```tsx
 * <ProjectSettings
 *   project={project}
 *   onUpdate={handleUpdateProject}
 *   onDelete={handleDeleteProject}
 * />
 * ```
 */
export function ProjectSettings({
  project,
  onUpdate,
  onDelete,
}: ProjectSettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
    } catch (error) {
      console.error("Failed to delete project:", error)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Info Form */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">프로젝트 정보</h3>
        <ProjectForm
          teamId={project.team_id}
          project={project}
          onSubmit={onUpdate}
          submitText="변경사항 저장"
        />
      </div>

      {/* Danger Zone */}
      {onDelete && (
        <div className="rounded-lg border border-destructive/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            위험 구역
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            프로젝트를 삭제하면 모든 이슈, 코멘트, 첨부파일이 영구적으로
            삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              프로젝트 삭제
            </button>
          ) : (
            <div className="space-y-3 rounded-md border border-destructive p-4">
              <p className="text-sm font-medium">
                정말로 이 프로젝트를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-muted-foreground">
                확인하려면 아래 버튼을 클릭하세요.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isDeleting ? "삭제 중..." : "네, 삭제합니다"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
