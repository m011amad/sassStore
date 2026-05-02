'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Merchant } from '@/types'

export function useMerchant(merchantId: string) {
  const supabase = createClient()

  return useQuery<Merchant>({
    queryKey: ['merchant', merchantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!merchantId,
  })
}
