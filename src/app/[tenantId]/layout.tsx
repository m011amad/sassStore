import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { MerchantBranding } from '@/types'
import { StorefrontNav } from '@/components/storefront/nav'
import { AnnouncementBanner } from '@/components/storefront/announcement-banner'
import { CartProvider } from '@/store/cart-store'

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

  const storeName = branding.storeName ?? merchant.subdomain

  return (
    <CartProvider tenantId={tenantId}>
      <div data-tenant-id={tenantId} style={cssVars} className="flex min-h-screen flex-col">
        {branding.announcementBanner && (
          <AnnouncementBanner message={branding.announcementBanner} />
        )}
        <StorefrontNav
          storeName={storeName}
          logoUrl={branding.logoUrl}
          tagline={branding.heroTagline}
          tenantId={tenantId}
        />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-muted/30 py-10 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm font-semibold tracking-tight">{storeName}</p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {storeName}. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by{' '}
                <span className="font-medium text-foreground">Digital Market</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
