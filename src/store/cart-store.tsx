'use client'

import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { createContext, useContext, useRef } from 'react'
import type { Product } from '@/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

type CartStore = ReturnType<typeof createCartStore>

function createCartStore(tenantId: string) {
  return createStore<CartState>()(
    persist(
      (set) => ({
        items: [],
        addItem: (product, qty = 1) =>
          set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id)
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
                ),
              }
            }
            return { items: [...state.items, { product, quantity: qty }] }
          }),
        removeItem: (productId) =>
          set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
        updateQuantity: (productId, quantity) =>
          set((state) => ({
            items:
              quantity <= 0
                ? state.items.filter((i) => i.product.id !== productId)
                : state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
          })),
        clearCart: () => set({ items: [] }),
      }),
      // Each tenant gets its own localStorage key — carts never bleed across stores.
      { name: `cart-${tenantId}` }
    )
  )
}

const CartContext = createContext<CartStore | null>(null)

export function CartProvider({
  tenantId,
  children,
}: {
  tenantId: string
  children: React.ReactNode
}) {
  const storeRef = useRef<CartStore>(null)
  if (!storeRef.current) {
    storeRef.current = createCartStore(tenantId)
  }
  return <CartContext.Provider value={storeRef.current}>{children}</CartContext.Provider>
}

export function useCartStore(): CartState
export function useCartStore<T>(selector: (state: CartState) => T): T
export function useCartStore<T>(selector?: (state: CartState) => T): T | CartState {
  const store = useContext(CartContext)
  if (!store) throw new Error('useCartStore must be used inside CartProvider')
  return useStore(store, selector ?? ((s) => s as unknown as T)) as T | CartState
}
