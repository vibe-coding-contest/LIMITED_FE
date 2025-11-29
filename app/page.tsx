import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  KanbanSquare,
  Users,
  Zap,
  CheckCircle2,
  BarChart3,
} from "lucide-react"

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">IssueFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>시작하기</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container flex flex-col items-center justify-center gap-8 py-24 md:py-32">
          <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>AI 기반 이슈 트래킹</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              스마트한 팀 협업,
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI가 함께합니다
              </span>
            </h1>
            <p className="max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
              AI가 이슈를 요약하고, 해결책을 제안하며, 자동으로 분류합니다.
              <br />
              더 스마트한 프로젝트 관리로 팀의 생산성을 높이세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <Zap className="mr-2 h-4 w-4" />
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  로그인
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative mt-8 w-full max-w-5xl rounded-xl border bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-1">
            <div className="rounded-lg bg-background p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Backlog</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded border bg-muted/50" />
                    <div className="h-16 rounded border bg-muted/50" />
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded border bg-muted/50" />
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Done</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded border bg-muted/50" />
                    <div className="h-16 rounded border bg-muted/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              강력한 기능들
            </h2>
            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
              프로젝트 관리에 필요한 모든 것을 한곳에서
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">AI 요약 & 제안</h3>
              <p className="text-muted-foreground">
                이슈 설명을 자동으로 요약하고, 해결 전략을 제안받으세요.
                AI가 당신의 업무를 더 효율적으로 만듭니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <KanbanSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">칸반 보드</h3>
              <p className="text-muted-foreground">
                직관적인 드래그 앤 드롭으로 이슈를 관리하세요.
                커스텀 상태와 WIP 제한으로 워크플로우를 최적화합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">팀 협업</h3>
              <p className="text-muted-foreground">
                팀원을 초대하고, 역할을 관리하며, 실시간으로 협업하세요.
                멤버별 권한 관리로 안전하게 작업합니다.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">스마트 분류</h3>
              <p className="text-muted-foreground">
                AI가 이슈를 자동으로 분류하고 라벨을 추천합니다.
                중복 이슈도 사전에 감지하여 작업 효율을 높입니다.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">대시보드 & 통계</h3>
              <p className="text-muted-foreground">
                프로젝트 진행 상황을 한눈에 파악하세요.
                팀 성과와 개인 작업량을 시각화된 차트로 확인합니다.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">실시간 알림</h3>
              <p className="text-muted-foreground">
                담당자 지정, 댓글, 마감일 등 중요한 이벤트를
                놓치지 마세요. 인앱 알림으로 즉시 확인합니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-12 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
              이메일 가입 또는 Google 계정으로 간편하게 시작할 수 있습니다.
              <br />
              신용카드 정보 없이 무료로 모든 기능을 사용해보세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-primary" />
            <span className="font-bold">IssueFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 IssueFlow. AI 기반 이슈 트래킹 시스템.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="hover:text-primary transition-colors">
              회원가입
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
