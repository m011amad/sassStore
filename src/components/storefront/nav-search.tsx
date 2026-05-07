'use client'

import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export function NavSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Preserve _tenant param (dev) or path-based tenantId (prod direct access)
  const tenantParam = searchParams.get('_tenant')
  const parts = pathname.split('/').filter(Boolean)
  const tenantInPath = !tenantParam && parts.length > 0

  function handleChange(value: string) {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // Build params preserving all current params, then set/clear q
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set('q', value.trim())
      else params.delete('q')

      // Navigate to the shop root (not /products) to avoid the redirect roundtrip
      const base = tenantInPath ? `/${parts[0]}` : '/'
      router.replace(`${base}?${params.toString()}`, { scroll: false })
    }, 350)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search products…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-ring focus:bg-background transition-colors"
      />
    </div>
  )
}
