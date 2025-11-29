"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TeamForm } from "./TeamForm"
import { useTeams } from "@/hooks/use-teams"
import { createClient } from "@/lib/supabase/client"
import type { CreateTeamInput, UpdateTeamInput } from "@/types/models"

interface CreateTeamDialogProps {
  /**
   * Custom trigger button (optional)
   */
  trigger?: React.ReactNode
  /**
   * Callback when team is created successfully
   */
  onTeamCreated?: () => void
}

/**
 * CreateTeamDialog Component
 *
 * Modal dialog for creating new teams.
 *
 * @example
 * ```tsx
 * <CreateTeamDialog onTeamCreated={() => console.log('Team created!')} />
 * ```
 */
export function CreateTeamDialog({
  trigger,
  onTeamCreated,
}: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { createTeam } = useTeams(userId || undefined)

  // Get current user on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  const handleSubmit = async (data: CreateTeamInput | UpdateTeamInput) => {
    if (!userId) {
      throw new Error("사용자 인증이 필요합니다")
    }

    // For create mode, name is required
    if (!("name" in data) || !data.name) {
      throw new Error("팀 이름은 필수입니다")
    }

    try {
      await createTeam(data.name, data.description)
      setOpen(false)
      onTeamCreated?.()
    } catch (error) {
      // Error will be handled by TeamForm
      throw error
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>+ 새 팀 만들기</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>
            새로운 팀을 만들고 멤버를 초대하여 프로젝트를 함께 관리하세요.
          </DialogDescription>
        </DialogHeader>
        <TeamForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}