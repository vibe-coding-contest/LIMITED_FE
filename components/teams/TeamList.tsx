"use client"

import { useState } from "react"
import { TeamCard } from "./TeamCard"
import type { TeamWithRole } from "@/types/models"

interface TeamListProps {
  teams: TeamWithRole[]
  onEditTeam?: (teamId: string) => void
  onDeleteTeam?: (teamId: string) => void
  onLeaveTeam?: (teamId: string) => void
}

/**
 * TeamList Component
 *
 * Displays a grid of team cards with filter and sort options.
 *
 * @example
 * ```tsx
 * <TeamList
 *   teams={teams}
 *   onEditTeam={handleEdit}
 *   onDeleteTeam={handleDelete}
 * />
 * ```
 */
export function TeamList({
  teams,
  onEditTeam,
  onDeleteTeam,
  onLeaveTeam,
}: TeamListProps) {
  const [filter, setFilter] = useState<"all" | "owner" | "member">("all")

  // Filter teams based on role
  const filteredTeams = teams.filter((team) => {
    if (filter === "all") return true
    if (filter === "owner") return team.role === "owner"
    if (filter === "member") return team.role !== "owner"
    return true
  })

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">팀이 없습니다</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          새 팀을 만들어 프로젝트 관리를 시작하세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          전체 ({teams.length})
        </button>
        <button
          onClick={() => setFilter("owner")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "owner"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          소유 ({teams.filter((t) => t.role === "owner").length})
        </button>
        <button
          onClick={() => setFilter("member")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "member"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          참여 ({teams.filter((t) => t.role !== "owner").length})
        </button>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            해당 조건의 팀이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={onEditTeam}
              onDelete={onDeleteTeam}
              onLeave={onLeaveTeam}
            />
          ))}
        </div>
      )}
    </div>
  )
}
