'use server'

import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CartItem } from '@/store/cart-store'

export async function createCheckoutSession(tenantId: string, items: CartItem[]) {
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('branding, subdomain')
    .eq('id', tenantId)
    .single()

  const storeName =
    (merchant?.branding as { storeName?: string } | null)?.storeName ??
    merchant?.subdomain ??
    'Store'

  // VERCEL_URL is set automatically by Vercel (e.g. sass-store.vercel.app).
  // Prefer it over NEXT_PUBLIC_APP_URL which may still point to a placeholder domain.
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

  const serializedItems = JSON.stringify(
    items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }))
  )

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // card covers Apple Pay + Google Pay automatically as wallet buttons.
      // wechat_pay requires client: 'web' for browser checkout.
      payment_method_types: ['card', 'wechat_pay'],
      payment_method_options: {
        wechat_pay: { client: 'web' },
      },
      line_items: items.map((item) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.product.name,
            // Stripe requires absolute https:// image URLs
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
      success_url: `${baseUrl}/${tenantId}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${tenantId}`,
    })

    if (!session.url) throw new Error('Stripe did not return a checkout URL.')
    return session.url
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[checkout] Stripe session creation failed:', message)
    throw new Error(message)
  }
}
