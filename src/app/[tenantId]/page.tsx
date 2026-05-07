export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/storefront/product-card'
import { SearchSort } from '@/components/storefront/search-sort'
import { BannerCarousel } from '@/components/storefront/banner-carousel'
import { ShoppingBag, TrendingUp, Sparkles, Star } from 'lucide-react'
import { Suspense } from 'react'
import Link from 'next/link'
import type { Product, MerchantBranding, OrderItem } from '@/types'
import { CategoryNav } from '@/components/storefront/category-nav'

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const SORT_MAP: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  name_asc: { column: 'name', ascending: true },
}

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="size-5 text-primary" />
      <h2 className="text-xl font-bold tracking-tight">{label}</h2>
    </div>
  )
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>
}) {
  const [{ tenantId }, { q, sort, category }] = await Promise.all([params, searchParams])
  const supabase = await createClient()

  const sortKey = (sort as SortKey) ?? 'newest'
  const { column, ascending } = SORT_MAP[sortKey] ?? SORT_MAP.newest

  const [merchantResult, allProductsResult, filteredResult, ordersResult] = await Promise.all([
    supabase.from('merchants').select('id, branding').eq('id', tenantId).single(),
    (supabase as any)
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    (() => {
      let query = (supabase as any)
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .order(column, { ascending })
      if (q?.trim()) query = query.ilike('name', `%${q.trim()}%`)
      if (category?.trim()) query = query.eq('category', category.trim())
      return query
    })(),
    supabase.from('orders').select('items, created_at').eq('tenant_id', tenantId),
  ])

  const branding = (merchantResult.data?.branding ?? {}) as MerchantBranding
  const bannerImages = branding.bannerImages ?? []

  const allProducts = (allProductsResult.data ?? []) as Product[]
  const filteredProducts = (filteredResult.data ?? []) as Product[]

  const categories: string[] = [
    ...new Set<string>(allProducts.map((p: Product) => p.category ?? '').filter(Boolean)),
  ].sort()

  // Aggregate order counts per product
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const allTimeCount = new Map<string, number>()
  const recentCount = new Map<string, number>()

  for (const order of ordersResult.data ?? []) {
    const items = (order.items as OrderItem[]) ?? []
    const isRecent = new Date(order.created_at) >= thirtyDaysAgo
    for (const item of items) {
      allTimeCount.set(item.productId, (allTimeCount.get(item.productId) ?? 0) + item.quantity)
      if (isRecent) {
        recentCount.set(item.productId, (recentCount.get(item.productId) ?? 0) + item.quantity)
      }
    }
  }

  const newArrivals = allProducts.slice(0, 8)

  const trending = [...allProducts]
    .filter((p) => recentCount.has(p.id))
    .sort((a, b) => (recentCount.get(b.id) ?? 0) - (recentCount.get(a.id) ?? 0))
    .slice(0, 8)

  const bestSellers = [...allProducts]
    .filter((p) => allTimeCount.has(p.id))
    .sort((a, b) => (allTimeCount.get(b.id) ?? 0) - (allTimeCount.get(a.id) ?? 0))
    .slice(0, 5)

  const hasFilters = !!(q?.trim() || category?.trim())

  return (
    <div>
      {/* Banner carousel */}
      {bannerImages.length > 0 && <BannerCarousel images={bannerImages} />}

      {/* Search/sort bar */}
      <div className="border-b bg-background/95">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Suspense>
            <SearchSort total={filteredProducts.length} categories={categories} />
          </Suspense>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-10">

          {/* Left sidebar (desktop only) */}
          <aside className="hidden lg:flex w-52 shrink-0 flex-col gap-8">
            {categories.length > 0 && (
              <Suspense>
                <CategoryNav categories={categories} variant="sidebar" />
              </Suspense>
            )}

            {bestSellers.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Best Sellers
                </h3>
                <ul className="space-y-3">
                  {bestSellers.map((product, i) => (
                    <li key={product.id}>
                      <Link
                        href={`products/${product.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(product.price / 100)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 space-y-12">

            {/* Mobile category pills */}
            {categories.length > 0 && (
              <Suspense>
                <CategoryNav categories={categories} variant="pills" />
              </Suspense>
            )}

            {/* New Arrivals — hidden when filtering */}
            {!hasFilters && newArrivals.length > 0 && (
              <section>
                <SectionHeading icon={Sparkles} label="New Arrivals" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {newArrivals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Trending — hidden when filtering */}
            {!hasFilters && trending.length > 0 && (
              <section>
                <SectionHeading icon={TrendingUp} label="Trending" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {trending.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* All Products */}
            <section>
              <SectionHeading icon={Star} label={hasFilters ? 'Results' : 'All Products'} />
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                    <ShoppingBag className="size-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold">No products found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hasFilters
                        ? 'Try a different search or filter.'
                        : 'This store has no products yet.'}
                    </p>
                  </div>
                  {hasFilters && (
                    <a href="." className="text-sm text-primary underline-offset-4 hover:underline">
                      Clear filters
                    </a>
                  )}
                </div>
              )}
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
