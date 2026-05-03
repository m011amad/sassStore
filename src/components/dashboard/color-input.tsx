'use client'

import { Input } from '@/components/ui/input'
import { useRef } from 'react'

export function ColorInput({ defaultValue }: { defaultValue?: string }) {
  const textRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLInputElement>(null)

  function syncFromPicker(value: string) {
    if (textRef.current) textRef.current.value = value
  }

  function syncFromText(value: string) {
    if (pickerRef.current && /^#[0-9a-fA-F]{6}$/.test(value)) {
      pickerRef.current.value = value
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={pickerRef}
        type="color"
        defaultValue={/^#/.test(defaultValue ?? '') ? defaultValue : '#000000'}
        onChange={(e) => syncFromPicker(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
      />
      <Input
        ref={textRef}
        name="primaryColor"
        defaultValue={defaultValue ?? ''}
        placeholder="#000000 or oklch(…)"
        onChange={(e) => syncFromText(e.target.value)}
        className="max-w-xs font-mono text-sm"
      />
    </div>
  )
}
