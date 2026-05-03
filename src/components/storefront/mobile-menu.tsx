'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="rounded-md p-1.5 transition-colors hover:bg-muted sm:hidden"
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-16 z-50 border-b bg-card px-4 py-4 shadow-lg sm:hidden"
          >
            <nav className="flex flex-col gap-1">
              <Link
                href="."
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Home
              </Link>
              <Link
                href="products"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                All Products
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
