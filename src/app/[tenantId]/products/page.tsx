import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// The shop moved to the root [tenantId] page. Redirect old /products links back.
export default async function ProductsRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const [{ tenantId }, sp] = await Promise.all([params, searchParams])
  const supabase = await createClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('subdomain')
    .eq('id', tenantId)
    .single()

  const extra = new URLSearchParams(sp)
  extra.delete('_tenant')
  const qs = extra.toString()

  redirect(`/?_tenant=${merchant?.subdomain ?? tenantId}${qs ? `&${qs}` : ''}`)
}
