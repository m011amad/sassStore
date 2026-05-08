'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function AnnouncementBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(false)
  const duration = Math.max(30, message.length * 1.2)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="flex h-9 items-center">
            {/*
              motion.div is absolute inset-0 so its width = the container width.
              x: '100%'  → translated one full container-width to the RIGHT (off screen)
              x: '-100%' → translated one full container-width to the LEFT  (off screen)
              Pure % units so Framer Motion interpolates correctly on any screen size.
            */}
            <div className="relative flex-1 overflow-hidden h-full">
              <motion.div
                className="absolute inset-0 flex items-center"
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
              >
                <span className="whitespace-nowrap text-sm font-medium">
                  {message}
                </span>
              </motion.div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 flex h-full items-center px-3 transition-colors hover:bg-white/20"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
