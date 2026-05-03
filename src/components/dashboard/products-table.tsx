'use client'

import { useState, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductDialog } from './product-dialog'
import { deleteProduct } from '@/app/actions/products'
import type { Product } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteProduct(id)
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Delete failed')
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    {product.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
              <TableCell>
                <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                  {product.stock === 0 ? 'Out of stock' : product.stock}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setEditProduct(product)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={deletingId === product.id}
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        product={editProduct ?? undefined}
      />
    </>
  )
}
