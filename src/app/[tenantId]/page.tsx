import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'
import type { MerchantBranding } from '@/types'


export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const supabase = await createClient()

  const [{ data: merchant }, { data: products }] = await Promise.all([
    supabase.from('merchants').select('subdomain, branding').eq('id', tenantId).single(),
    supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
  ])

  const branding = (merchant?.branding ?? {}) as MerchantBranding
  const storeName = branding.storeName ?? merchant?.subdomain ?? 'Store'

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{storeName}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Discover our collection. Click any card to learn more.
          </p>
        </div>
      </section>

      {/* All products */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {products && products.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <p className="py-24 text-center text-muted-foreground">No products available yet.</p>
        )}
      </div>
    </>
  )
}
