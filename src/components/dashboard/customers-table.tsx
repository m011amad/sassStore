import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Customer } from '@/types'

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(customer.name, customer.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{customer.name ?? '—'}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{customer.email}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(customer.created_at).toLocaleDateString('en-AU')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
