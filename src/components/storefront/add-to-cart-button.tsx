'use client'

import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <Button
      className="w-full"
      size="lg"
      disabled={product.stock === 0}
      onClick={() => addItem(product)}
    >
      {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
    </Button>
  )
}
