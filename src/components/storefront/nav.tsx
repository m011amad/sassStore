import Link from 'next/link'
import { CartSheet } from './cart-sheet'
import { NavSearch } from './nav-search'
import { MobileMenu } from './mobile-menu'
import { Suspense } from 'react'

interface StorefrontNavProps {
  storeName: string
  logoUrl?: string
  tenantId: string
}

export function StorefrontNav({ storeName, logoUrl, tenantId }: StorefrontNavProps) {
  return (
    <nav className="relative sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile hamburger */}
        <MobileMenu />

        {/* Logo */}
        <Link href="." className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-lg font-semibold">{storeName}</span>
          )}
        </Link>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <Suspense>
            <NavSearch />
          </Suspense>
        </div>

        {/* Desktop nav + cart */}
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="products"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Products
          </Link>
          <CartSheet tenantId={tenantId} />
        </div>
      </div>
    </nav>
  )
}
