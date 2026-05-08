'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense } from 'react'
import { NavSearch } from './nav-search'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-muted sm:hidden"
        aria-label={open ? 'Close search' : 'Search products'}
        onClick={() => setOpen((o) => !o)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-4" />
            </motion.span>
          ) : (
            <motion.span
              key="search"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Search className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-search-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-x-0 top-16 z-50 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md sm:hidden"
          >
            <Suspense>
              <NavSearch />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
