import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
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

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

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
