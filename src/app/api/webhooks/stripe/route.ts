import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/resend'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { OrderItem, ShippingAddress } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const tenantId = session.metadata?.tenantId
      const itemsJson = session.metadata?.items

      if (!tenantId || !itemsJson) break

      const items: OrderItem[] = JSON.parse(itemsJson)
      const email = session.customer_details?.email ?? ''
      const name = session.customer_details?.name ?? ''

      const shipping = session.collected_information?.shipping_details
      const shipping_address: ShippingAddress | null = shipping?.address
        ? {
            street: shipping.address.line1 ?? '',
            suburb: shipping.address.city ?? '',
            state: shipping.address.state ?? '',
            postcode: shipping.address.postal_code ?? '',
            country: shipping.address.country ?? 'AU',
          }
        : null

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .upsert({ tenant_id: tenantId, email, name }, { onConflict: 'tenant_id,email' })
        .select('id')
        .single()

      if (customerError) { console.error('[webhook] customer upsert failed:', customerError); break }
      if (!customer) break

      const orderPayload = {
        tenant_id: tenantId,
        customer_id: customer.id,
        status: 'pending',
        total,
        items,
        shipping_address,
      }
      console.log('[webhook] inserting order:', JSON.stringify(orderPayload))

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single()

      if (orderError) { console.error('[webhook] order insert failed:', JSON.stringify(orderError)); break }
      if (!order) break

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
          shippingAddress: shipping_address ?? undefined,
        })
      } catch {}

      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as { customer: string; status: string }
      const plan = subscription.status === 'active' ? 'pro' : 'free'
      await supabaseAdmin
        .from('merchants')
        .update({ plan })
        .eq('stripe_id', subscription.customer)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as { customer: string }
      await supabaseAdmin
        .from('merchants')
        .update({ plan: 'free' })
        .eq('stripe_id', subscription.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}
