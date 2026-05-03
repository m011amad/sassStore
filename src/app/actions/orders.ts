'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/resend'
import { revalidatePath } from 'next/cache'
import type { CartItem } from '@/store/cart-store'
import type { OrderStatus, ShippingAddress } from '@/types'

export async function createOrder(
  tenantId: string,
  items: CartItem[],
  formData: FormData
) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const shipping_address: ShippingAddress = {
    street: formData.get('street') as string,
    suburb: formData.get('suburb') as string,
    state: formData.get('state') as string,
    postcode: formData.get('postcode') as string,
    country: 'Australia',
  }

  const { data: customer, error: upsertError } = await supabaseAdmin
    .from('customers')
    .upsert({ tenant_id: tenantId, email, name }, { onConflict: 'tenant_id,email' })
    .select('id')
    .single()

  if (upsertError || !customer) throw new Error('Failed to create customer')

  const orderItems = items.map((i) => ({
    productId: i.product.id,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
  }))

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({ tenant_id: tenantId, customer_id: customer.id, total, items: orderItems, shipping_address })
    .select('id')
    .single()

  if (orderError || !order) throw new Error('Failed to create order')

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('branding, subdomain')
    .eq('id', tenantId)
    .single()

  const storeName =
    (merchant?.branding as { storeName?: string } | null)?.storeName ??
    merchant?.subdomain ??
    'Store'

  try {
    await sendOrderConfirmation({
      to: email,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      storeName,
      total,
      shippingAddress: shipping_address,
    })
  } catch {}

  return order.id
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) throw new Error('Merchant not found')

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('tenant_id', merchant.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/orders')
}
