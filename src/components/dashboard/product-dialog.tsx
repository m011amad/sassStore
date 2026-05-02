'use client'

import { useTransition, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/app/actions/products'
import type { Product } from '@/types'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, formData)
        } else {
          await createProduct(formData)
        }
        onOpenChange(false)
        formRef.current?.reset()
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={product?.description ?? ''}
              placeholder="Optional product description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={product ? (product.price / 100).toFixed(2) : ''}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product?.stock ?? 0}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              defaultValue={product?.images[0] ?? ''}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : product ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
