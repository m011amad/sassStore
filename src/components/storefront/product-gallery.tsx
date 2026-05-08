'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border bg-muted">
        <Package className="size-16 text-muted-foreground opacity-20" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={selected}
            src={images[selected]}
            alt={`${name} — image ${selected + 1}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-150 ${
                i === selected
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
