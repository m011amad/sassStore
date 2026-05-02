import Link from 'next/link'
import { CartSheet } from './cart-sheet'

interface StorefrontNavProps {
  storeName: string
  logoUrl?: string
}

export function StorefrontNav({ storeName, logoUrl }: StorefrontNavProps) {
  return (
    <nav className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="." className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-lg font-semibold">{storeName}</span>
          )}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <CartSheet />
        </div>
      </div>
    </nav>
  )
}
