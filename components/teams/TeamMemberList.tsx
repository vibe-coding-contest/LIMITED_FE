"use client"

import { Avatar } from "@/components/ui/avatar"
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
import type { TeamMemberWithUser } from "@/types/models"

interface TeamMemberListProps {
  members: TeamMemberWithUser[]
  currentUserId?: string
  canManageMembers?: boolean
  onChangeRole?: (memberId: string, newRole: string) => void
  onRemoveMember?: (memberId: string) => void
}

/**
 * TeamMemberList Component
 *
 * Displays list of team members with roles and management actions.
 *
 * @example
 * ```tsx
 * <TeamMemberList
 *   members={teamMembers}
 *   currentUserId={user.id}
 *   canManageMembers={isAdmin}
 *   onChangeRole={handleRoleChange}
 *   onRemoveMember={handleRemoveMember}
 * />
 * ```
 */
export function TeamMemberList({
  members,
  currentUserId,
  canManageMembers = false,
  onChangeRole,
  onRemoveMember,
}: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">팀 멤버가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.user_id === currentUserId
        const isOwner = member.role === "owner"
        const canManage = canManageMembers && !isOwner && !isCurrentUser

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            {/* Member Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium">
                  {member.user.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {member.user.display_name || member.user.email}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      나
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
            </div>

            {/* Role & Actions */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  member.role === "owner"
                    ? "default"
                    : member.role === "admin"
                      ? "secondary"
                      : "outline"
                }
              >
                {member.role === "owner"
                  ? "소유자"
                  : member.role === "admin"
                    ? "관리자"
                    : "멤버"}
              </Badge>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <DotsHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">멤버 메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onChangeRole && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onChangeRole(member.id, "admin")}
                          disabled={member.role === "admin"}
                        >
                          관리자로 변경
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onChangeRole(member.id, "member")}
                          disabled={member.role === "member"}
                        >
                          멤버로 변경
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {onRemoveMember && (
                      <DropdownMenuItem
                        onClick={() => onRemoveMember(member.id)}
                        className="text-destructive"
                      >
                        팀에서 제거
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
