import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, ExternalLink } from 'lucide-react'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { Separator } from '@/components/ui/separator'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function DashboardHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: merchant } = user
    ? await supabase
        .from('merchants')
        .select('subdomain, custom_domain')
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  const storeUrl = merchant
    ? process.env.NODE_ENV === 'development'
      ? `http://localhost:3000?_tenant=${merchant.subdomain}`
      : merchant.custom_domain
        ? `https://${merchant.custom_domain}`
        : `${appUrl}?_tenant=${merchant.subdomain}`
    : null

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div />
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {storeUrl && (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-3.5" />
            Visit Store
          </a>
        )}

        <Separator orientation="vertical" className="mx-1 h-5" />

        <span className="hidden text-xs text-muted-foreground sm:block">{user?.email}</span>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  )
}
