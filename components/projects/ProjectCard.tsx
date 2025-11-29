import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import type { ProjectWithDetails } from "@/types/models"

interface ProjectCardProps {
  project: ProjectWithDetails
  onEdit?: (projectId: string) => void
  onDelete?: (projectId: string) => void
}

/**
 * ProjectCard Component
 *
 * Displays a single project card with info and quick actions.
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const issueCount = project.issue_count || 0

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.id}/board`} className="block p-6">
        {/* Project Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Project Icon */}
            {project.icon ? (
              <div className="text-2xl">{project.icon}</div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                {project.key}
              </div>
            )}

            {/* Project Info */}
            <div>
              <h3 className="font-semibold line-clamp-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.key}</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs">
            {project.team.name}
          </Badge>
        </div>

        {/* Project Description */}
        {project.description && (
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Project Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">{issueCount}</span>
            <span>이슈</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{project.statuses?.length || 0}</span>
            <span>상태</span>
          </div>
        </div>
      </Link>

      {/* Actions Menu */}
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <DotsHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">프로젝트 메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/board`}>보드 보기</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>프로젝트 개요</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/settings`}>설정</Link>
            </DropdownMenuItem>
            {onEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(project.id)}>
                  프로젝트 수정
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(project.id)}
                className="text-destructive"
              >
                프로젝트 삭제
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
