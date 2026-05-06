import { stripe } from '@/lib/stripe'
import { notFound } from 'next/navigation'
import { CheckCircle, MapPin, Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ClearCart } from './clear-cart'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ session_id?: string; _tenant?: string }>
}) {
  const [{ tenantId }, { session_id, _tenant }] = await Promise.all([params, searchParams])

  if (!session_id) notFound()

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items'],
  })

  if (!session || session.metadata?.tenantId !== tenantId) notFound()

  const customer = session.customer_details
  const shipping = session.collected_information?.shipping_details
  const lineItems = session.line_items?.data ?? []
  const total = session.amount_total ?? 0

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <ClearCart />
      <div className="mb-6 flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="size-10 text-green-500" />
        </div>
      </div>

      <h1 className="text-center text-3xl font-bold tracking-tight">Order confirmed!</h1>
      <p className="mt-2 text-center text-muted-foreground">
        A confirmation has been sent to{' '}
        <span className="font-medium text-foreground">{customer?.email}</span>
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border bg-card divide-y">
        {/* Items */}
        {lineItems.length > 0 && (
          <div className="px-5 py-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" /> Items ordered
            </p>
            <ul className="space-y-2">
              {lineItems.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.description}
                    {(item.quantity ?? 1) > 1 && (
                      <span className="text-muted-foreground"> × {item.quantity}</span>
                    )}
                  </span>
                  <span>{formatPrice(item.amount_total)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold">
              <span>Total paid</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {shipping?.address && (
          <div className="px-5 py-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <MapPin className="size-3.5" /> Delivery address
            </p>
            <address className="not-italic text-sm leading-relaxed">
              {customer?.name && <p className="font-medium">{customer.name}</p>}
              {shipping.address.line1 && <p>{shipping.address.line1}</p>}
              {shipping.address.line2 && <p>{shipping.address.line2}</p>}
              <p>
                {[shipping.address.city, shipping.address.state, shipping.address.postal_code]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              {shipping.address.country && <p>{shipping.address.country}</p>}
            </address>
          </div>
        )}

        {/* Estimated delivery */}
        <div className="px-5 py-3">
          <p className="text-sm text-muted-foreground">
            Estimated delivery: <span className="font-medium text-foreground">3–7 business days</span>
          </p>
        </div>
      </div>

      <Button asChild className="mt-6 w-full" variant="outline" size="lg">
        <Link href={_tenant ? `/?_tenant=${_tenant}` : '/'}>Continue shopping</Link>
      </Button>
    </div>
  )
}
