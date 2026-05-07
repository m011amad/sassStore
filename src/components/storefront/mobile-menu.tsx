'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        className="rounded-md p-1.5 transition-colors hover:bg-muted sm:hidden"
        aria-label="Menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </button>
    )
  }

  return (
    <>
      <button
        className="rounded-md p-1.5 transition-colors hover:bg-muted sm:hidden"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      >
        <X className="size-5" />
      </button>

      <AnimatePresence>
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-x-0 top-16 z-50 border-b bg-card px-4 py-4 shadow-lg sm:hidden"
        >
          <p className="px-3 text-xs text-muted-foreground">Use the search bar to find products.</p>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
