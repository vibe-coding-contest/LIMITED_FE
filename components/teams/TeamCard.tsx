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
import type { TeamWithRole } from "@/types/models"

interface TeamCardProps {
  team: TeamWithRole
  onEdit?: (teamId: string) => void
  onDelete?: (teamId: string) => void
  onLeave?: (teamId: string) => void
}

/**
 * TeamCard Component
 *
 * Displays a single team card with basic info and actions.
 *
 * @example
 * ```tsx
 * <TeamCard
 *   team={team}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function TeamCard({ team, onEdit, onDelete, onLeave }: TeamCardProps) {
  const isOwner = team.role === "owner"
  const memberCount = team.member_count || 0

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/teams/${team.id}`} className="block p-6">
        {/* Team Info */}
        <div className="mb-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-semibold line-clamp-1">{team.name}</h3>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {team.role === "owner" ? "소유자" : team.role === "admin" ? "관리자" : "멤버"}
            </Badge>
          </div>

          {team.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          )}
        </div>

        {/* Team Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">{memberCount}</span>
            <span>멤버</span>
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
              <span className="sr-only">팀 메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/teams/${team.id}`}>팀 보기</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/teams/${team.id}/settings`}>팀 설정</Link>
            </DropdownMenuItem>
            {(isOwner || team.role === "admin") && onEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(team.id)}>
                  팀 수정
                </DropdownMenuItem>
              </>
            )}
            {isOwner && onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(team.id)}
                className="text-destructive"
              >
                팀 삭제
              </DropdownMenuItem>
            )}
            {!isOwner && onLeave && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onLeave(team.id)}
                  className="text-destructive"
                >
                  팀 나가기
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
