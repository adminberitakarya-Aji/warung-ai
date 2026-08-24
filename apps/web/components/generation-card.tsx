'use client'

import { AlertTriangle, Ban, Play } from 'lucide-react'

import { AssetThumb } from '@/components/asset-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCancelGeneration } from '@/hooks/use-warung'
import { STATUS_LABEL } from '@/lib/generation-labels'
import { isActiveGeneration } from '@/lib/types'
import type { Generation } from '@/lib/types'
import { cn } from '@/lib/utils'

export function GenerationCard({
  generation,
  onSelect,
}: {
  generation: Generation
  onSelect?: (generation: Generation) => void
}) {
  const cancel = useCancelGeneration()
  const active = isActiveGeneration(generation.status)
  const asset = generation.resultAsset

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors',
        onSelect && 'cursor-pointer hover:border-primary/50',
      )}
      onClick={onSelect ? () => onSelect(generation) : undefined}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {asset ? (
          <AssetThumb
            asset={asset}
            alt={asset.name}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="film-grid flex size-full items-center justify-center">
            {generation.status === 'FAILED' ? (
              <AlertTriangle className="size-5 text-destructive" />
            ) : generation.status === 'CANCELLED' ? (
              <Ban className="size-5 text-muted-foreground" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {generation.progress}%
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {STATUS_LABEL[generation.status]}
                </span>
              </div>
            )}
          </div>
        )}

        {asset?.type === 'VIDEO' && (
          <span
            aria-hidden
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur"
          >
            <Play className="size-2.5 fill-current" />
            {asset.duration ? `${asset.duration}s` : 'video'}
          </span>
        )}

        <Badge
          variant={
            generation.status === 'FAILED'
              ? 'destructive'
              : generation.status === 'COMPLETED'
                ? 'secondary'
                : 'outline'
          }
          className="absolute right-2 top-2 bg-background/80 text-[10px] backdrop-blur"
        >
          {STATUS_LABEL[generation.status]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {generation.prompt}
        </p>

        {active && (
          <div className="flex flex-col gap-2">
            <Progress value={generation.progress} className="h-1" />
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-xs"
              onClick={(event) => {
                event.stopPropagation()
                cancel.mutate(generation.id)
              }}
            >
              Batalkan
            </Button>
          </div>
        )}

        {generation.status === 'FAILED' && generation.error && (
          <p className="text-xs text-destructive">{generation.error}</p>
        )}
      </div>
    </article>
  )
}
