import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer } from '@/types'

export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(customer.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
