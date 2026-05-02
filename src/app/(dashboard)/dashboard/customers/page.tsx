import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomersTable } from '@/components/dashboard/customers-table'

export default async function CustomersPage() {
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

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">People who have placed orders in your store</p>
      </div>

      <div className="rounded-xl border bg-card">
        {customers && customers.length > 0 ? (
          <CustomersTable customers={customers} />
        ) : (
          <div className="p-12 text-center text-muted-foreground">No customers yet.</div>
        )}
      </div>
    </div>
  )
}
