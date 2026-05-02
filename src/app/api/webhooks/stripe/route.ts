import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
