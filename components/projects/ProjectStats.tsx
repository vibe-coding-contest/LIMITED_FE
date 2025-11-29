import { Card } from "@/components/ui/card"

interface ProjectStatsProps {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  completedIssues: number
  teamMemberCount?: number
}

/**
 * ProjectStats Component
 *
 * Displays key statistics for a project.
 *
 * @example
 * ```tsx
 * <ProjectStats
 *   totalIssues={45}
 *   openIssues={12}
 *   inProgressIssues={8}
 *   completedIssues={25}
 *   teamMemberCount={5}
 * />
 * ```
 */
export function ProjectStats({
  totalIssues,
  openIssues,
  inProgressIssues,
  completedIssues,
  teamMemberCount = 0,
}: ProjectStatsProps) {
  const completionRate =
    totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0

  const stats = [
    {
      label: "전체 이슈",
      value: totalIssues,
      color: "text-foreground",
    },
    {
      label: "열린 이슈",
      value: openIssues,
      color: "text-blue-600",
    },
    {
      label: "진행 중",
      value: inProgressIssues,
      color: "text-yellow-600",
    },
    {
      label: "완료됨",
      value: completedIssues,
      color: "text-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">프로젝트 진행률</p>
            <p className="text-sm font-bold text-green-600">
              {completionRate}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedIssues}개 완료 / {totalIssues}개 이슈
          </p>
        </div>
      </Card>

      {/* Additional Info */}
      {teamMemberCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">팀 멤버</p>
            <p className="text-2xl font-bold">{teamMemberCount}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
