"use client"

import { Suspense, use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard"
import { createClient } from "@/lib/supabase/client"

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string
  }>
}

/**
 * Project Detail Page
 *
 * Overview page for a specific project with stats and recent activity.
 */
export default function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, key, description")
        .eq("id", projectId)
        .single()

      if (error || !data) {
        router.push("/projects")
        return
      }

      setProject(data)
      setLoading(false)
    }

    fetchProject()
  }, [projectId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {project.key}
              </span>
            </div>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/settings`}>설정</Link>
            </Button>
            <Button asChild>
              <Link href={`/projects/${projectId}/board`}>보드 보기</Link>
            </Button>
          </div>
        </div>

        {/* Project Dashboard */}
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          }
        >
          <ProjectDashboard projectId={projectId} projectName={project.name} />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
