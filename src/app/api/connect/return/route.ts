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

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('id, stripe_connect_id')
    .eq('user_id', user.id)
    .single()

  if (merchant?.stripe_connect_id) {
    const account = await stripe.accounts.retrieve(merchant.stripe_connect_id)
    if (account.charges_enabled && account.details_submitted) {
      await supabaseAdmin
        .from('merchants')
        .update({ stripe_connect_onboarded: true })
        .eq('id', merchant.id)
    }
  }

  return NextResponse.redirect(new URL('/dashboard/settings', request.url))
}
