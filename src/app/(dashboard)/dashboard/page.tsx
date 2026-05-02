import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react'

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

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

  const [productsResult, ordersResult, customersResult] = await Promise.all([
    supabase.from('products').select('id').eq('tenant_id', merchant.id),
    supabase.from('orders').select('total').eq('tenant_id', merchant.id),
    supabase.from('customers').select('id').eq('tenant_id', merchant.id),
  ])

  const totalRevenue = (ordersResult.data ?? []).reduce((sum, o) => sum + o.total, 0)
  const productCount = productsResult.data?.length ?? 0
  const orderCount = ordersResult.data?.length ?? 0
  const customerCount = customersResult.data?.length ?? 0

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
    },
    {
      label: 'Orders',
      value: orderCount.toString(),
      icon: ShoppingCart,
    },
    {
      label: 'Products',
      value: productCount.toString(),
      icon: Package,
    },
    {
      label: 'Customers',
      value: customerCount.toString(),
      icon: Users,
    },
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
