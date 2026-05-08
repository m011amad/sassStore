'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist-store'

export function WishlistButton({ productId }: { productId: string }) {
  const { toggle, has } = useWishlistStore()
  // Avoid hydration mismatch — wishlist is localStorage-backed
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const wishlisted = mounted && has(productId)

  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
      }}
      whileTap={{ scale: 0.8 }}
      animate={wishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      className="flex size-7 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
    >
      <Heart
        className={`size-3.5 transition-colors ${
          wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground/60'
        }`}
      />
    </motion.button>
  )
}
