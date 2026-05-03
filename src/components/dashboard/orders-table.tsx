'use client'

import { updateOrderStatus } from '@/app/actions/orders'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, Customer, OrderStatus } from '@/types'
import type { OrderItem } from '@/types'
import { useTransition } from 'react'

type OrderWithCustomer = Order & { customers: Pick<Customer, 'name' | 'email'> | null }

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      defaultValue={status}
      onValueChange={(value) => {
        startTransition(async () => {
          await updateOrderStatus(orderId, value as OrderStatus)
        })
      }}
      disabled={isPending}
    >
      <SelectTrigger className="h-7 w-32 text-xs">
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

export function OrdersTable({ orders }: { orders: OrderWithCustomer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const items = (order.items as OrderItem[] | null) ?? []
          return (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                #{order.id.slice(0, 8).toUpperCase()}
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.customers?.name ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{order.customers?.email}</div>
              </TableCell>
              <TableCell className="text-sm">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <StatusSelect orderId={order.id} status={order.status} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
