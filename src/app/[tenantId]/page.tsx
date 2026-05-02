import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {(!products || products.length === 0) && (
          <p className="col-span-full py-16 text-center text-muted-foreground">
            No products available yet.
          </p>
        )}
      </div>
    </div>
  )
}
