'use client'

import { useCartStore } from '@/store/cart-store'
import { createOrder } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function CheckoutForm({ tenantId }: { tenantId: string }) {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState('')

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
      formData.set('state', state)
      const orderId = await createOrder(tenantId, items, formData)
      clearCart()
      router.push(`order-confirmation/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Contact information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Delivery address</h2>
          <div className="space-y-1">
            <Label htmlFor="street">Street address</Label>
            <Input id="street" name="street" required placeholder="123 Main Street" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-1">
              <Label htmlFor="suburb">Suburb</Label>
              <Input id="suburb" name="suburb" required placeholder="Sydney" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={setState} required>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {AU_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                name="postcode"
                required
                placeholder="2000"
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Australia only. Delivery in 3–7 business days.</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={pending || !state}>
          {pending ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
        </Button>
      </form>

      {/* Order summary */}
      <div className="lg:sticky lg:top-24 self-start">
        <h2 className="mb-4 font-semibold">Order summary</h2>
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <ul className="space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-start gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {product.images[0] && (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {quantity}</p>
                </div>
                <span className="text-sm shrink-0">{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
