import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ tenantId: string; orderId: string }>
}) {
  const { tenantId, orderId } = await params

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, customers(name, email)')
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .single()

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="size-16 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Order confirmed!</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you for your order. We&apos;ll send a confirmation to{' '}
        <span className="font-medium">
          {(order.customers as { email?: string } | null)?.email}
        </span>
        .
      </p>

      <div className="mt-8 rounded-xl border bg-card p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order number</span>
          <span className="font-mono font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Button asChild className="mt-8 w-full" variant="outline">
        <Link href="../../">Continue shopping</Link>
      </Button>
    </div>
  )
}
