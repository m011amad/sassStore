'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/types'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Check, ShoppingCart, RotateCcw, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [flipped, setFlipped] = useState(false)
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    setAdded(true)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    // perspective container — must have fixed height so back face aligns
    <div
      className="group relative cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative aspect-[3/4]"
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-muted"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="size-10 opacity-30" />
            </div>
          )}

          {/* bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-20">
            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
            <p className="mt-0.5 text-base font-bold text-white">{formatPrice(product.price)}</p>

            {/* Add to cart — always visible on the front */}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/20 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-50"
            >
              {added ? (
                <><Check className="size-3.5" /> Added to cart</>
              ) : product.stock === 0 ? (
                'Out of stock'
              ) : (
                <><ShoppingCart className="size-3.5" /> Add to cart</>
              )}
            </button>
          </div>

          {/* flip hint */}
          <div className="absolute right-3 top-3 rounded-full bg-white/20 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <RotateCcw className="size-3.5 text-white" />
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border bg-card p-5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          // prevent card click from propagating on the back side buttons
        >
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug">{product.name}</h3>
            <p className="mt-1 text-2xl font-bold text-primary">{formatPrice(product.price)}</p>

            {product.description ? (
              <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-muted-foreground">No description.</p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full gap-2"
              size="sm"
              disabled={product.stock === 0}
              variant={added ? 'outline' : 'default'}
              onClick={handleAdd}
            >
              {added ? (
                <><Check className="size-3.5" /> Added!</>
              ) : (
                <><ShoppingCart className="size-3.5" /> Add to cart</>
              )}
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full gap-1" onClick={(e) => e.stopPropagation()}>
              <Link href={`products/${product.id}`}>
                View details <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
