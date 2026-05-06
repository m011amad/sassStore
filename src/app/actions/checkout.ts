'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CartItem } from '@/store/cart-store'

// Returns an error string on failure, or redirects to Stripe on success.
export async function createCheckoutSession(
  tenantId: string,
  items: CartItem[]
): Promise<string | null> {
  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('branding, subdomain')
    .eq('id', tenantId)
    .single()

  const storeName =
    (merchant?.branding as { storeName?: string } | null)?.storeName ??
    merchant?.subdomain ??
    'Store'

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

  let checkoutUrl: string

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // No payment_method_types = Stripe automatically uses all methods
      // enabled in the Dashboard (Apple Pay, Google Pay, WeChat Pay, etc.)
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
    })

    if (!session.url) throw new Error('Stripe did not return a checkout URL.')
    checkoutUrl = session.url
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[checkout] Stripe session creation failed:', message)
    return message
  }

  // redirect() outside try/catch — Next.js sends a proper HTTP redirect that
  // Safari follows natively (unlike window.location.href after an async call).
  redirect(checkoutUrl)
}
