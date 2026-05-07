'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MerchantBranding } from '@/types'

export async function updateBannerImages(bannerImages: string[]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, branding')
    .eq('user_id', user.id)
    .single()
  if (!merchant) throw new Error('Merchant not found')

  const branding: MerchantBranding = { ...(merchant.branding as MerchantBranding ?? {}), bannerImages }
  await supabase.from('merchants').update({ branding }).eq('user_id', user.id)
  revalidatePath('/dashboard/settings')
}

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('branding')
    .eq('user_id', user.id)
    .single()

  const existing = (merchant?.branding ?? {}) as MerchantBranding

  const storeName = (formData.get('storeName') as string).trim()
  const primaryColor = formData.get('primaryColor') as string
  const logoUrl = (formData.get('logoUrl') as string).trim()
  const customDomain = (formData.get('customDomain') as string).trim() || null

  const tagline = (formData.get('tagline') as string).trim()

  const branding: MerchantBranding = {
    ...existing,
    ...(storeName && { storeName }),
    ...(primaryColor && { primaryColor }),
    ...(logoUrl && { logoUrl }),
    heroTagline: tagline || undefined,
  }

  const { error } = await supabase
    .from('merchants')
    .update({ branding, custom_domain: customDomain })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}
