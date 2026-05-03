import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { ProductCard } from '@/components/storefront/product-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ tenantId: string; productId: string }>
}) {
  const { tenantId, productId } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: related }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .single(),
    supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .neq('id', productId)
      .limit(4),
  ])

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="../products"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All products
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-3 text-4xl font-bold">{formatPrice(product.price)}</p>

            <div className="mt-4 flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  Out of stock
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <AddToCartButton product={product} />
            <p className="text-center text-xs text-muted-foreground">
              Free delivery across Australia · 3–7 business days
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 text-xl font-bold tracking-tight">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
