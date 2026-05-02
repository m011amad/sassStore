import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, ExternalLink } from 'lucide-react'

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

  const storeUrl = merchant
    ? process.env.NODE_ENV === 'development'
      ? `http://localhost:3000?_tenant=${merchant.subdomain}`
      : merchant.custom_domain
        ? `https://${merchant.custom_domain}`
        : `https://${merchant.subdomain}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : null

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-5">
        {storeUrl && (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            View Store
          </a>
        )}
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
