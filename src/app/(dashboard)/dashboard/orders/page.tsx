import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrdersTable } from '@/components/dashboard/orders-table'
import { EmptyState } from '@/components/ui/empty-state'
import { ShoppingCart } from 'lucide-react'

export default async function OrdersPage() {
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

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(name, email)')
    .eq('tenant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      <div className="rounded-xl border bg-card">
        {orders && orders.length > 0 ? (
          <OrdersTable orders={orders as any} />
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders will appear here once customers start purchasing from your store."
          />
        )}
      </div>
    </div>
  )
}
