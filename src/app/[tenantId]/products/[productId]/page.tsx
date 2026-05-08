import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { ProductCard } from '@/components/storefront/product-card'
import { BackButton } from '@/components/storefront/back-button'
import { ProductGallery } from '@/components/storefront/product-gallery'
import { StickyCartBar } from '@/components/storefront/sticky-cart-bar'
import { Truck } from 'lucide-react'

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
    supabase.from('products').select('*').eq('id', productId).eq('tenant_id', tenantId).single(),
    supabase.from('products').select('*').eq('tenant_id', tenantId).neq('id', productId).limit(4),
  ])

  if (!product) notFound()

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BackButton label="All products" />

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image gallery */}
          <ProductGallery images={product.images ?? []} name={product.name} />

          {/* Info */}
          <div className="flex flex-col lg:py-4">
            {product.category && (
              <span className="mb-3 w-fit rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

            <p className="mt-4 text-4xl font-bold tracking-tight">{formatPrice(product.price)}</p>

            <div className="mt-4">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  {product.stock} in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                  <span className="size-1.5 rounded-full bg-red-500" />
                  Out of stock
                </span>
              )}
            </div>

            {product.description && (
              <>
                <div className="my-6 border-t" />
                <p className="leading-relaxed text-muted-foreground">{product.description}</p>
              </>
            )}

            <div className="mt-auto space-y-4 pt-8">
              {/* Sentinel — when this scrolls out of view the sticky bar appears */}
              <div id="add-to-cart-sentinel" aria-hidden className="h-px" />
              <AddToCartButton product={product} />
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Truck className="size-3.5 shrink-0" />
                Free delivery across Australia · 3–7 business days
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <div className="mt-24">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">You might also like</h2>
              <div className="flex-1 border-t" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky add-to-cart bar — appears when the sentinel leaves the viewport */}
      <StickyCartBar product={product} />
    </>
  )
}
