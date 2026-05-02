import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductsTable } from '@/components/dashboard/products-table'
import { AddProductButton } from '@/components/dashboard/add-product-button'

export default async function ProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store&apos;s products</p>
        </div>
        <AddProductButton />
      </div>

      <Card>
        {products && products.length > 0 ? (
          <ProductsTable products={products} />
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No products yet. Click &quot;Add Product&quot; to get started.
          </div>
        )}
      </Card>
    </div>
  )
}

// shadcn Card used as the table wrapper
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card">{children}</div>
}
