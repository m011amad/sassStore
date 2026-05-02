'use client'

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
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function CartSheet() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Shopping cart" className="relative">
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cart ({count})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-medium leading-tight">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(product.price)}
                      </span>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="rounded border p-0.5 hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="rounded border p-0.5 hover:bg-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Separator />
              <Button asChild className="w-full" size="lg">
                <Link href="checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
