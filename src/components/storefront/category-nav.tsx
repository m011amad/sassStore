'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

interface CategoryNavProps {
  categories: string[]
  variant?: 'sidebar' | 'pills'
}

export function CategoryNav({ categories, variant = 'sidebar' }: CategoryNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const currentCategory = searchParams.get('category') ?? ''

  function navigate(category: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (category) params.set('category', category)
    else params.delete('category')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  if (categories.length === 0) return null

  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2 lg:hidden">
        <button
          onClick={() => navigate('')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            !currentCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              currentCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Categories
      </h3>
      <ul className="space-y-0.5">
        <li>
          <button
            onClick={() => navigate('')}
            className={cn(
              'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
              !currentCategory
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => navigate(cat)}
              className={cn(
                'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                currentCategory === cat
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
