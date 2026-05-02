'use client'

import { useMemo } from 'react'

// Reads the tenantId injected by the [tenantId]/layout.tsx server component
// via a data attribute on the root storefront wrapper.
export function useTenant() {
  const tenantId = useMemo(() => {
    if (typeof document === 'undefined') return null
    return document.documentElement.dataset.tenantId ?? null
  }, [])

  return { tenantId }
}
