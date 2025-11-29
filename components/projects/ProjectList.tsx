"use client"

import { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import type { ProjectWithDetails } from "@/types/models"

interface ProjectListProps {
  projects: ProjectWithDetails[]
  onEditProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
}

/**
 * ProjectList Component
 *
 * Displays a grid of project cards with filter options.
 *
 * @example
 * ```tsx
 * <ProjectList
 *   projects={projects}
 *   onEditProject={handleEdit}
 *   onDeleteProject={handleDelete}
 * />
 * ```
 */
export function ProjectList({
  projects,
  onEditProject,
  onDeleteProject,
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      project.key.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    )
  })

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">프로젝트가 없습니다</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          새 프로젝트를 만들어 이슈 관리를 시작하세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="프로젝트 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border px-4 py-2 text-sm"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            검색 결과가 없습니다
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <p className="text-center text-sm text-muted-foreground">
        {filteredProjects.length}개의 프로젝트
        {searchQuery && ` (${projects.length}개 중)`}
      </p>
    </div>
  )
}
