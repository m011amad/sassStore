'use client'

import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export function NavSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // In dev, the storefront is accessed via ?_tenant=subdomain on localhost.
  // The proxy rewrites internally but the browser URL stays at /?_tenant=...
  // so we must preserve that param when navigating to /products.
  const tenantParam = searchParams.get('_tenant')

  // In prod (subdomain/custom domain), the tenantId is the first path segment.
  // parts[0] is the UUID when accessed via e.g. yourplatform.com/{uuid}/...
  // but in dev mode it's absent — we use _tenant instead.
  const parts = pathname.split('/').filter(Boolean)
  const tenantInPath = !tenantParam && parts.length > 0

  function handleChange(value: string) {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set('q', value.trim())
      if (tenantParam) params.set('_tenant', tenantParam)

      const base = tenantInPath ? `/${parts[0]}/products` : '/products'
      router.push(`${base}?${params.toString()}`)
    }, 350)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search products…"
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
      />
    </div>
  )
}
