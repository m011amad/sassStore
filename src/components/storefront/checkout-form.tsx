'use client'

import { useCartStore } from '@/store/cart-store'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function CheckoutForm({ tenantId }: { tenantId: string }) {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Your cart is empty.{' '}
        <a href="." className="underline underline-offset-4 hover:text-foreground">
          Continue shopping
        </a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const orderId = await createOrder(tenantId, items, formData)
      clearCart()
      router.push(`order-confirmation/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Contact information</h2>
        <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required placeholder="Jane Smith" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
          </Button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <div className="rounded-xl border bg-card p-4">
          <ul className="space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span>
                  {product.name}{' '}
                  <span className="text-muted-foreground">× {quantity}</span>
                </span>
                <span>{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
