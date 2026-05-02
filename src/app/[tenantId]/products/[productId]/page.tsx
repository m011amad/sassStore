import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ tenantId: string; productId: string }>
}) {
  const { tenantId, productId } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('tenant_id', tenantId)
    .single()

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{product.stock} in stock</p>
        </div>
      </div>
    </div>
  )
}
