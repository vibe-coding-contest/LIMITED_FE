"use client"

import { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import {
  changePassword,
  deleteAccount,
  getUserAuthProvider,
} from "@/utils/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Lock, Trash2, Shield } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isOAuthUser, setIsOAuthUser] = useState(false)

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Account deletion state
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      // Check if user signed up with OAuth
      const authProvider = await getUserAuthProvider()
      setIsOAuthUser(authProvider === "google")
    } catch (error) {
      console.error("Error loading user:", error)
      toast({
        title: "오류",
        description: "사용자 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (newPassword.length < 6 || newPassword.length > 100) {
      toast({
        title: "유효성 오류",
        description: "새 비밀번호는 6자 이상, 100자 이하여야 합니다.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    setSavingPassword(true)

    try {
      const { error } = await changePassword(currentPassword, newPassword)

      if (error) {
        throw error
      }

      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "비밀번호 변경 실패",
        description:
          error instanceof Error
            ? error.message
            : "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    // Verify password for non-OAuth users
    if (!isOAuthUser && !deleteConfirmPassword) {
      toast({
        title: "비밀번호 필요",
        description: "계정 삭제를 위해 비밀번호를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setDeleting(true)

    try {
      // For non-OAuth users, verify password first
      if (!isOAuthUser) {
        const supabase = createClient()
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user?.email || "",
          password: deleteConfirmPassword,
        })

        if (verifyError) {
          throw new Error("비밀번호가 올바르지 않습니다.")
        }
      }

      // Delete account
      const { error, ownedTeams } = await deleteAccount()

      if (error) {
        // Check if it's owned teams error
        if (ownedTeams && ownedTeams.length > 0) {
          const teamNames = ownedTeams.map((t: { name: string }) => t.name).join(", ")
          toast({
            title: "계정 삭제 불가",
            description: `소유한 팀(${teamNames})을 먼저 삭제하거나 소유권을 이전해주세요.`,
            variant: "destructive",
          })
          setShowDeleteDialog(false)
          return
        }

        throw error
      }

      toast({
        title: "계정 삭제 완료",
        description: "계정이 성공적으로 삭제되었습니다.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "계정 삭제 실패",
        description:
          error instanceof Error ? error.message : "계정 삭제에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteConfirmPassword("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-2">
          계정 보안 및 개인정보 설정을 관리합니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>비밀번호 변경</CardTitle>
            </div>
            <CardDescription>
              {isOAuthUser
                ? "Google 계정으로 로그인했습니다. 비밀번호 변경이 불가능합니다."
                : "계정 보안을 위해 비밀번호를 변경할 수 있습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOAuthUser ? (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>OAuth 로그인</AlertTitle>
                <AlertDescription>
                  Google OAuth를 통해 가입한 계정은 비밀번호 변경이
                  불가능합니다. Google 계정 설정에서 비밀번호를 관리하세요.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    현재 비밀번호 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    required
                    disabled={savingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    새 비밀번호 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (6~100자)"
                    minLength={6}
                    maxLength={100}
                    required
                    disabled={savingPassword}
                  />
                  <p className="text-sm text-muted-foreground">
                    {newPassword.length}/100자
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    새 비밀번호 확인 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                    disabled={savingPassword}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {savingPassword ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      변경 중...
                    </>
                  ) : (
                    "비밀번호 변경"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Account Deletion Section */}
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">위험 영역</CardTitle>
            </div>
            <CardDescription>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>주의!</AlertTitle>
              <AlertDescription>
                계정 삭제는 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가
                삭제됩니다.
                <br />
                소유한 팀이 있는 경우, 먼저 팀을 삭제하거나 소유권을
                이전해야 합니다.
              </AlertDescription>
            </Alert>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  계정 삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p>
                      이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가
                      영구적으로 삭제됩니다:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>프로필 정보</li>
                      <li>팀 멤버십</li>
                      <li>생성한 프로젝트 및 이슈</li>
                      <li>작성한 댓글</li>
                    </ul>

                    {!isOAuthUser && (
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="deleteConfirmPassword">
                          비밀번호 확인 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="deleteConfirmPassword"
                          type="password"
                          value={deleteConfirmPassword}
                          onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                          placeholder="비밀번호를 입력하세요"
                          disabled={deleting}
                        />
                      </div>
                    )}

                    {isOAuthUser && (
                      <p className="text-sm text-muted-foreground pt-4">
                        Google OAuth로 로그인한 계정입니다. 확인 버튼을 클릭하여
                        계정을 삭제할 수 있습니다.
                      </p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteAccount()
                    }}
                    disabled={deleting || (!isOAuthUser && !deleteConfirmPassword)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        삭제 중...
                      </>
                    ) : (
                      "계정 삭제"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
