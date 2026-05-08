import Link from 'next/link'
import { CartSheet } from './cart-sheet'
import { NavSearch } from './nav-search'
import { MobileMenu } from './mobile-menu'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { Suspense } from 'react'
import { ShoppingBag } from 'lucide-react'

interface StorefrontNavProps {
  storeName: string
  logoUrl?: string
  tagline?: string
  tenantId: string
}

export function StorefrontNav({ storeName, logoUrl, tagline, tenantId }: StorefrontNavProps) {
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo + store name */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="size-4 text-primary" />
            </div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">{storeName}</span>
            {tagline && (
              <span className="hidden text-[11px] text-muted-foreground sm:block">{tagline}</span>
            )}
          </div>
        </Link>

        {/* Desktop search — hidden on mobile */}
        <div className="hidden flex-1 justify-center sm:flex">
          <Suspense>
            <NavSearch />
          </Suspense>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <ThemeToggle />
          <CartSheet tenantId={tenantId} />
          {/* Mobile search toggle — sm:hidden is inside MobileMenu */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
