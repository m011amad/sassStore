import Link from 'next/link'

export default function PlatformHomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">YourPlatform</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Launch your online store in minutes. No code required.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start for free
        </Link>
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          Sign in
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">
        Already have a store?{' '}
        <Link href="/dashboard" className="underline underline-offset-4 hover:text-foreground">
          Go to dashboard
        </Link>
      </p>
    </div>
  )
}
