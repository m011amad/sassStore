import type { Database } from './supabase'

export type Merchant = Database['public']['Tables']['merchants']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']

export type MerchantBranding = {
  storeName?: string
  logoUrl?: string
  primaryColor?: string
  primaryForegroundColor?: string
  secondaryColor?: string
  fontFamily?: string
}

export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type OrderStatus = Order['status']
