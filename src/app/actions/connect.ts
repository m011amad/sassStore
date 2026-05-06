'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function openPayoutsDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabaseAdmin
    .from('merchants')
    .select('stripe_connect_id')
    .eq('user_id', user.id)
    .single()

  if (!merchant?.stripe_connect_id) redirect('/dashboard/settings')

  const loginLink = await stripe.accounts.createLoginLink(merchant.stripe_connect_id)
  redirect(loginLink.url)
}
