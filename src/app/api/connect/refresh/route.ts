import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: merchant } = (await supabaseAdmin
    .from('merchants')
    .select('id, stripe_connect_id')
    .eq('user_id', user.id)
    .single()) as unknown as { data: { id: string; stripe_connect_id: string | null } | null }

  if (!merchant?.stripe_connect_id) {
    return NextResponse.redirect(new URL('/dashboard/settings', request.url))
  }

  const baseUrl = new URL(request.url).origin

  const accountLink = await stripe.accountLinks.create({
    account: merchant.stripe_connect_id,
    refresh_url: `${baseUrl}/api/connect/refresh`,
    return_url: `${baseUrl}/api/connect/return`,
    type: 'account_onboarding',
  })

  return NextResponse.redirect(accountLink.url)
}
