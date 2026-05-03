import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import Link from 'next/link'

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function DashboardPage() {
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

  const [productsResult, ordersResult, customersResult, recentOrdersResult] = await Promise.all([
    supabase.from('products').select('id').eq('tenant_id', merchant.id),
    supabase.from('orders').select('total, created_at').eq('tenant_id', merchant.id),
    supabase.from('customers').select('id').eq('tenant_id', merchant.id),
    supabase
      .from('orders')
      .select('id, total, status, created_at, customers(name, email)')
      .eq('tenant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const allOrders = ordersResult.data ?? []
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0)
  const productCount = productsResult.data?.length ?? 0
  const orderCount = allOrders.length
  const customerCount = customersResult.data?.length ?? 0
  const recentOrders = recentOrdersResult.data ?? []

  // Build daily revenue for last 30 days
  const today = new Date()
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dayMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 })
  }
  for (const order of allOrders) {
    const day = order.created_at.slice(0, 10)
    if (dayMap.has(day)) {
      const entry = dayMap.get(day)!
      entry.revenue += order.total
      entry.orders += 1
    }
  }
  const chartData = Array.from(dayMap.entries()).map(([date, v]) => ({ date, ...v }))

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign },
    { label: 'Orders', value: orderCount.toString(), icon: ShoppingCart },
    { label: 'Products', value: productCount.toString(), icon: Package },
    { label: 'Customers', value: customerCount.toString(), icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <ul className="divide-y">
            {recentOrders.map((order) => {
              const customer = order.customers as { name?: string; email?: string } | null
              return (
                <li key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium">{customer?.name ?? customer?.email ?? '—'}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('en-AU')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
