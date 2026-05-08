'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function CartSheet({ tenantId }: { tenantId: string }) {
  const { items, updateQuantity, removeItem } = useCartStore()
  const [loading, setLoading] = useState(false)
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not start checkout.')
      window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Shopping cart"
          className="relative rounded-md p-1.5 transition-colors hover:bg-muted"
        >
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Cart
            {count > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {count} item{count !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some products to get started.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-5">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-4">
                    <div className="size-[72px] shrink-0 overflow-hidden rounded-xl bg-muted">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-semibold">{formatPrice(product.price)}</p>

                      <div className="mt-1 flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="flex size-7 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="flex size-7 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
                          aria-label="Increase"
                        >
                          <Plus className="size-3" />
                        </button>
                        {quantity > 1 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            = {formatPrice(product.price * quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t px-6 pb-8 pt-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  `Pay ${formatPrice(total)} →`
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Free delivery across Australia · Secure checkout via Stripe
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
