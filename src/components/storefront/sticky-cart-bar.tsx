'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'
import type { Product } from '@/types'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

// Renders a sentinel div that the IntersectionObserver watches.
// When the sentinel (placed next to the main CTA) leaves the viewport,
// the sticky bar slides up from the bottom.
export function StickyCartBar({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('add-to-cart-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function handleAdd() {
    if (product.stock === 0) return
    addItem(product)
    setAdded(true)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
            <motion.button
              onClick={handleAdd}
              disabled={product.stock === 0}
              whileTap={{ scale: 0.96 }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {added ? (
                <><Check className="size-4" /> Added!</>
              ) : (
                <><ShoppingCart className="size-4" /> Add to cart</>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
