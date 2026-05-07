'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface LogoUploadProps {
  initialUrl?: string
  merchantId: string
}

export function LogoUpload({ initialUrl, merchantId }: LogoUploadProps) {
  const [url, setUrl] = useState(initialUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('merchantId', merchantId)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Upload failed')
      const { url: uploaded } = await res.json()
      setUrl(uploaded)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {url ? (
          <>
            <img src={url} alt="Logo preview" className="h-full w-full object-contain p-2" />
            <button
              type="button"
              onClick={() => setUrl('')}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </>
        ) : (
          <ImageIcon className="size-7 text-muted-foreground/30" />
        )}
      </div>

      {/* Upload button + hint */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {url ? 'Change logo' : 'Upload logo'}
        </button>
        <p className="text-xs text-muted-foreground">
          PNG, SVG or WebP recommended. Displayed at 32px height in the nav.
        </p>
      </div>

      {/* Hidden input so the value is included in the parent form */}
      <input type="hidden" name="logoUrl" value={url} />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
