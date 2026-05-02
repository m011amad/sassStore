'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductDialog } from './product-dialog'

export function AddProductButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add Product
      </Button>
      <ProductDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
