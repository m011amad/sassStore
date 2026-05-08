'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/types'
import { useCartStore } from '@/store/cart-store'
import { Check, ShoppingCart, Minus, Plus, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { WishlistButton } from './wishlist-button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [open, setOpen] = useState(false)

  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 0

  function handleQuickAdd() {
    if (product.stock === 0) return
    addItem(product, 1)
    setAdded(true)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBulkAdd() {
    if (product.stock === 0) return
    addItem(product, qty)
    setAdded(true)
    toast.success(`${qty > 1 ? `${qty}× ` : ''}${product.name} added to cart`)
    setOpen(false)
    setTimeout(() => {
      setAdded(false)
      setQty(1)
    }, 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.38, delay: index * 0.045, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
      >
        {/* ── Linked area: image + name navigate to product detail ── */}
        <Link href={`products/${product.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="size-8 text-muted-foreground opacity-20" />
              </div>
            )}

            {product.category && (
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-sm">
                {product.category}
              </span>
            )}

            <div className="absolute right-3 top-3">
              <WishlistButton productId={product.id} />
            </div>

            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
                <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  Out of stock
                </span>
              </div>
            )}
          </div>

          <div className="px-3.5 pt-3.5">
            <p className="truncate text-sm font-medium leading-snug">{product.name}</p>
          </div>
        </Link>

        {/* ── Non-linked area: price + add buttons (no Link wrapping) ── */}
        <div className="flex items-center justify-between gap-2 px-3.5 pb-3.5 pt-2">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>

          {/* Split button — left: instant add 1, right: qty popover */}
          <div className="flex shrink-0 overflow-hidden rounded-lg">
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-40"
            >
              {added ? (
                <><Check className="size-3" /> Added</>
              ) : (
                <><ShoppingCart className="size-3" /> Add</>
              )}
            </button>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  disabled={product.stock === 0}
                  className="flex items-center border-l border-primary-foreground/20 bg-primary px-1.5 py-1.5 text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-40"
                  aria-label="Choose quantity"
                >
                  <ChevronDown className="size-3" />
                </button>
              </PopoverTrigger>

              <PopoverContent side="top" align="end" className="w-44 p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-6"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {qty}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-6"
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <Button size="sm" className="w-full gap-1.5" onClick={handleBulkAdd}>
                    <ShoppingCart className="size-3.5" />
                    Add {qty} to cart
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
