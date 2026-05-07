import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { connectLimiter } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous'
    const { success } = await connectLimiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = (await supabaseAdmin
    .from('merchants')
    .select('id, stripe_connect_id')
    .eq('user_id', user.id)
    .single()) as unknown as { data: { id: string; stripe_connect_id: string | null } | null }

  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const baseUrl = new URL(request.url).origin

  let accountId = merchant.stripe_connect_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'AU',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })
    accountId = account.id
    await (supabaseAdmin as any)
      .from('merchants')
      .update({ stripe_connect_id: accountId })
      .eq('id', merchant.id)
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/api/connect/refresh`,
    return_url: `${baseUrl}/api/connect/return`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
