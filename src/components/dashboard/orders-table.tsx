'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, MapPin, Package } from 'lucide-react'
import type { Order, Customer, OrderItem, OrderStatus, ShippingAddress } from '@/types'
import { cn } from '@/lib/utils'

type OrderWithCustomer = Order & { customers: Pick<Customer, 'name' | 'email'> | null }

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      defaultValue={status}
      onValueChange={(value) =>
        startTransition(() => updateOrderStatus(orderId, value as OrderStatus))
      }
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function OrderRow({ order }: { order: OrderWithCustomer }) {
  const [open, setOpen] = useState(false)
  const items = (order.items as OrderItem[] | null) ?? []
  const address = order.shipping_address as ShippingAddress | null
  const customer = order.customers

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full text-left">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6 hover:bg-muted/40 transition-colors">
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180'
            )}
          />

          <span className="font-mono text-xs text-muted-foreground w-20 shrink-0">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{customer?.name ?? customer?.email ?? '—'}</p>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{customer?.email}</p>
          </div>

          <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
            {new Date(order.created_at).toLocaleDateString('en-AU')}
          </span>

          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize hidden sm:inline-block',
              statusColors[order.status] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {order.status}
          </span>

          <span className="text-sm font-semibold shrink-0 ml-auto sm:ml-0">
            {formatPrice(order.total)}
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200">
        <div className="border-t bg-muted/30 px-4 py-4 sm:px-6 space-y-4">

          {/* Items */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" /> Items ordered
            </p>
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-muted-foreground">× {item.quantity}</span>
                    )}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="mt-3 mb-2" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {address && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <MapPin className="size-3.5" /> Ship to
              </p>
              <address className="not-italic text-sm leading-relaxed">
                {customer?.name && <p className="font-medium">{customer.name}</p>}
                <p>{address.street}</p>
                <p>{[address.suburb, address.state, address.postcode].filter(Boolean).join(' ')}</p>
                <p>{address.country}</p>
              </address>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 pt-1 border-t">
            <span className="text-sm text-muted-foreground">Update status</span>
            <StatusSelect orderId={order.id} status={order.status} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function OrdersTable({ orders }: { orders: OrderWithCustomer[] }) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b px-4 py-2.5 sm:px-6 bg-muted/20">
        <span className="w-4 shrink-0" />
        <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">Order</span>
        <span className="flex-1 text-xs font-medium text-muted-foreground">Customer</span>
        <span className="text-xs font-medium text-muted-foreground hidden md:block">Date</span>
        <span className="text-xs font-medium text-muted-foreground hidden sm:block">Status</span>
        <span className="text-xs font-medium text-muted-foreground ml-auto sm:ml-0">Total</span>
      </div>

      <div className="divide-y">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}
