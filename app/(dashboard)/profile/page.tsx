"use client"

import { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { updateUserMetadata } from "@/utils/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link as LinkIcon } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageUploadMode, setImageUploadMode] = useState<"url" | "file">("url")

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
      setDisplayName(user.user_metadata?.display_name || "")
      setImageUrl(user.user_metadata?.avatar_url || "")
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지 파일은 5MB 이하여야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) throw error

      // Public URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath)

      setImageUrl(publicUrl)

      toast({
        title: "업로드 완료",
        description: "이미지가 성공적으로 업로드되었습니다.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "업로드 실패",
        description: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 이름 유효성 검증
    if (displayName.trim().length < 1 || displayName.trim().length > 50) {
      toast({
        title: "유효성 오류",
        description: "이름은 1~50자 사이여야 합니다.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const metadata: Record<string, unknown> = {
        display_name: displayName.trim(),
      }

      if (imageUrl) {
        metadata.avatar_url = imageUrl
      }

      const { error } = await updateUserMetadata(metadata)

      if (error) throw error

      // 사용자 정보 새로고침
      await loadUser()

      toast({
        title: "저장 완료",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      })

      // 헤더 업데이트를 위해 페이지 새로고침
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "저장 실패",
        description: "프로필 업데이트에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground mt-2">
          프로필 정보를 관리하고 수정할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>
            이름과 프로필 이미지를 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로필 이미지 미리보기 */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imageUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(displayName || user?.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label className="text-base font-semibold">프로필 이미지</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  URL을 입력하거나 파일을 업로드하세요 (최대 5MB)
                </p>
              </div>
            </div>

            {/* 이미지 업로드 탭 */}
            <Tabs
              value={imageUploadMode}
              onValueChange={(value) => setImageUploadMode(value as "url" | "file")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  URL 입력
                </TabsTrigger>
                <TabsTrigger value="file">
                  <Upload className="mr-2 h-4 w-4" />
                  파일 업로드
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 팁: 이미지 우클릭 → &ldquo;이미지 주소 복사&rdquo;로 직접 URL을 얻으세요.
                  <br />
                  ❌ Google 검색 결과 URL은 작동하지 않습니다.
                </p>
              </TabsContent>

              <TabsContent value="file" className="space-y-2">
                <Label htmlFor="imageFile">이미지 파일</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Spinner size="sm" />
                    업로드 중...
                  </p>
                )}
              </TabsContent>
            </Tabs>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="이름을 입력하세요"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                required
              />
              <p className="text-sm text-muted-foreground">
                {displayName.length}/50자
              </p>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                취소
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
