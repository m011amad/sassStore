import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CartItem } from '@/store/cart-store'

export async function POST(request: NextRequest) {
  let tenantId: string
  let items: CartItem[]

  try {
    const body = await request.json()
    tenantId = body.tenantId
    items = body.items
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('branding, subdomain, stripe_connect_id, stripe_connect_onboarded')
    .eq('id', tenantId)
    .single()

  const storeName =
    (merchant?.branding as { storeName?: string } | null)?.storeName ??
    merchant?.subdomain ??
    'Store'

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

  const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? '2')

  const orderTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const applicationFee = Math.round(orderTotal * PLATFORM_FEE_PERCENT / 100)

  const serializedItems = JSON.stringify(
    items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }))
  )

  const useConnect =
    merchant?.stripe_connect_id && merchant?.stripe_connect_onboarded

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.product.name,
            ...(item.product.images[0]?.startsWith('https://') && {
              images: [item.product.images[0]],
            }),
          },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: { allowed_countries: ['AU'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'aud' },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      custom_text: {
        submit: { message: `Ordering from ${storeName}. Delivery in 3–7 business days.` },
      },
      metadata: { tenantId, items: serializedItems },
      success_url: `${baseUrl}/order-confirmation?_tenant=${merchant?.subdomain}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?_tenant=${merchant?.subdomain}`,
      ...(useConnect && {
        payment_intent_data: {
          application_fee_amount: applicationFee,
          transfer_data: { destination: merchant!.stripe_connect_id! },
        },
      }),
    })

    if (!session.url) throw new Error('Stripe did not return a checkout URL.')
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[checkout] Stripe session creation failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
