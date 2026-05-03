'use client'

import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Check, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { useState } from 'react'

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product)
    setAdded(true)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Button
      className="w-full gap-2"
      size="lg"
      disabled={product.stock === 0}
      onClick={handleAdd}
      variant={added ? 'outline' : 'default'}
    >
      {product.stock === 0 ? (
        'Out of stock'
      ) : added ? (
        <>
          <Check className="size-4" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          Add to cart
        </>
      )}
    </Button>
  )
}
