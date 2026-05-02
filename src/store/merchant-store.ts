'use client'

import { create } from 'zustand'
import type { Merchant, MerchantBranding } from '@/types'

interface MerchantState {
  merchant: Merchant | null
  branding: MerchantBranding | null
  setMerchant: (merchant: Merchant | null) => void
  setBranding: (branding: MerchantBranding | null) => void
}

export const useMerchantStore = create<MerchantState>((set) => ({
  merchant: null,
  branding: null,
  setMerchant: (merchant) => set({ merchant }),
  setBranding: (branding) => set({ branding }),
}))
