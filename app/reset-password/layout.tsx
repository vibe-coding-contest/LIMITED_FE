export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md">
        {/* Auth Card Container */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Jira Lite</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-Powered Project Management
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
