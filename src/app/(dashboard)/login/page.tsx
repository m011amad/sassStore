import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function signIn(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/dashboard')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  // Already signed in — send to dashboard
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground">Access your merchant dashboard</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
