import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = await supabase
    .from('merchants')
    .select('stripe_id')
    .eq('user_id', user.id)
    .single()

  if (!merchant?.stripe_id) {
    // Create a Stripe customer if one doesn't exist yet
    const customer = await stripe.customers.create({ email: user.email })
    await supabase
      .from('merchants')
      .update({ stripe_id: customer.id })
      .eq('user_id', user.id)

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })
    return NextResponse.json({ url: session.url })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: merchant.stripe_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return NextResponse.json({ url: session.url })
}
