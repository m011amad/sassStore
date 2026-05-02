import { CheckoutForm } from '@/components/storefront/checkout-form'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <CheckoutForm tenantId={tenantId} />
    </div>
  )
}
