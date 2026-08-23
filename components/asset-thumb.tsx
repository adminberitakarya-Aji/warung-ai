import Image from 'next/image'
import { AudioWaveform, ImageOff } from 'lucide-react'

import type { Asset } from '@/lib/types'

interface AssetThumbProps {
  asset: Asset
  alt: string
  sizes: string
  className?: string
  /** Loads eagerly — set on above-the-fold tiles to improve LCP. */
  priority?: boolean
}

/**
 * Renders an asset's preview frame. AUDIO assets (and anything missing a
 * usable source) fall back to an icon tile instead of an empty <Image>.
 */
export function AssetThumb({ asset, alt, sizes, className, priority }: AssetThumbProps) {
  const src = asset.thumbnailUrl || asset.url

  if (!src) {
    return (
      <div className="film-grid flex size-full flex-col items-center justify-center gap-1.5">
        {asset.type === 'AUDIO' ? (
          <AudioWaveform className="size-5 text-primary" />
        ) : (
          <ImageOff className="size-5 text-muted-foreground" />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {asset.type === 'AUDIO' ? (asset.duration ? `${asset.duration}s audio` : 'audio') : 'tanpa pratinjau'}
        </span>
      </div>
    )
  }

  return (
    <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />
  )
}
