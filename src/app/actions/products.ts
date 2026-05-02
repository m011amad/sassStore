'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getMerchantId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) throw new Error('Merchant not found')
  return { supabase, merchantId: merchant.id }
}

function parseProductForm(formData: FormData) {
  return {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    price: Math.round(parseFloat(formData.get('price') as string) * 100),
    stock: parseInt((formData.get('stock') as string) || '0', 10),
    images: (formData.get('imageUrl') as string)
      ? [(formData.get('imageUrl') as string)]
      : [],
  }
}

export async function createProduct(formData: FormData) {
  const { supabase, merchantId } = await getMerchantId()
  const { error } = await supabase.from('products').insert({
    tenant_id: merchantId,
    ...parseProductForm(formData),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/products')
}

export async function updateProduct(productId: string, formData: FormData) {
  const { supabase, merchantId } = await getMerchantId()
  const { error } = await supabase
    .from('products')
    .update(parseProductForm(formData))
    .eq('id', productId)
    .eq('tenant_id', merchantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/products')
}

export async function deleteProduct(productId: string) {
  const { supabase, merchantId } = await getMerchantId()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', merchantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/products')
}
