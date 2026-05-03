'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function BillingButton() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={openPortal} disabled={loading}>
      {loading ? 'Redirecting…' : 'Manage billing'}
    </Button>
  )
}
