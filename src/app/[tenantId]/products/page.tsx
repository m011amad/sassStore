import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'
import { SearchSort } from '@/components/storefront/search-sort'
import { Suspense } from 'react'

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const SORT_MAP: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  name_asc: { column: 'name', ascending: true },
}

export default async function AllProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ q?: string; sort?: string }>
}) {
  const [{ tenantId }, { q, sort }] = await Promise.all([params, searchParams])
  const supabase = await createClient()

  const sortKey = (sort as SortKey) ?? 'newest'
  const { column, ascending } = SORT_MAP[sortKey] ?? SORT_MAP.newest

  let query = supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order(column, { ascending })

  if (q?.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  const { data: products } = await query

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        {q && (
          <p className="mt-1 text-muted-foreground">
            Results for <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
          </p>
        )}
      </div>

      <Suspense>
        <SearchSort total={products?.length ?? 0} />
      </Suspense>

      {products && products.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            {q ? `No products found for "${q}".` : 'No products available yet.'}
          </p>
          {q && (
            <a
              href="."
              className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
            >
              Clear search
            </a>
          )}
        </div>
      )}
    </div>
  )
}
