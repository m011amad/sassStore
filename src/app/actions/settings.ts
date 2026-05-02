'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MerchantBranding } from '@/types'

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const storeName = (formData.get('storeName') as string).trim()
  const primaryColor = formData.get('primaryColor') as string
  const logoUrl = (formData.get('logoUrl') as string).trim()
  const customDomain = (formData.get('customDomain') as string).trim() || null

  const branding: MerchantBranding = {
    ...(storeName && { storeName }),
    ...(primaryColor && { primaryColor }),
    ...(logoUrl && { logoUrl }),
  }

  const { error } = await supabase
    .from('merchants')
    .update({ branding, custom_domain: customDomain })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}
