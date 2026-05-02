'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Store className="size-4 text-sidebar-primary" />
        <span className="text-sm font-semibold text-sidebar-foreground">YourPlatform</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
