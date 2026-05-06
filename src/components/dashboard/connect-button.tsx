'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ConnectButton({ label, variant = 'default' }: { label: string; variant?: 'default' | 'outline' }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/connect/onboard', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} onClick={handleClick} disabled={loading}>
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {label}
    </Button>
  )
}
