import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function signUp(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const subdomain = (formData.get('subdomain') as string).toLowerCase().trim()

  if (!/^[a-z0-9-]{3,32}$/.test(subdomain)) {
    redirect('/signup?error=Subdomain must be 3-32 lowercase letters, numbers, or hyphens')
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError || !authData.user) {
    redirect(`/signup?error=${encodeURIComponent(authError?.message ?? 'Sign up failed')}`)
  }

  const { error: merchantError } = await supabase.from('merchants').insert({
    user_id: authData.user.id,
    subdomain,
  })

  if (merchantError) {
    redirect(`/signup?error=${encodeURIComponent(merchantError.message)}`)
  }

  redirect('/dashboard')
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Create your store</h1>
          <p className="text-sm text-muted-foreground">Start selling in minutes</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={signUp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="subdomain" className="text-sm font-medium">
              Store subdomain
            </label>
            <div className="flex items-center gap-1 rounded-lg border bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                placeholder="cool-kicks"
                pattern="[a-z0-9-]{3,32}"
                className="flex-1 bg-transparent outline-none"
              />
              <span className="text-muted-foreground">.yourplatform.com</span>
            </div>
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create store
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
