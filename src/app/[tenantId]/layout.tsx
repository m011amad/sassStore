import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { MerchantBranding } from '@/types'
import { StorefrontNav } from '@/components/storefront/nav'

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const supabase = await createClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, subdomain, branding')
    .eq('id', tenantId)
    .single()

  if (!merchant) notFound()

  const branding = (merchant.branding ?? {}) as MerchantBranding

  // CSS custom property overrides cascade to all children — this is how per-merchant
  // branding works without any Tailwind config changes.
  const cssVars = {
    ...(branding.primaryColor && { '--primary': branding.primaryColor }),
    ...(branding.primaryForegroundColor && {
      '--primary-foreground': branding.primaryForegroundColor,
    }),
    ...(branding.secondaryColor && { '--secondary': branding.secondaryColor }),
    ...(branding.fontFamily && { '--font-sans': `'${branding.fontFamily}', sans-serif` }),
  } as React.CSSProperties

  return (
    <div data-tenant-id={tenantId} style={cssVars}>
      <StorefrontNav
        storeName={branding.storeName ?? merchant.subdomain}
        logoUrl={branding.logoUrl}
      />
      <main className="min-h-screen">{children}</main>
    </div>
  )
}
