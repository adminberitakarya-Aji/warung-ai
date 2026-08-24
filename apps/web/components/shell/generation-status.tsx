'use client'

import { useGenerations } from '@/hooks/use-warung'
import { STATUS_LABEL } from '@/lib/generation-labels'
import { isActiveGeneration } from '@/lib/types'
import { cn } from '@/lib/utils'

export function GenerationStatus() {
  const { data } = useGenerations()
  const generations = data?.generations ?? []
  const active = generations.filter((item) => isActiveGeneration(item.status))
  const failed = generations.some((item) => item.status === 'FAILED')

  // With one job running, its phase is more useful than a count.
  const label =
    active.length === 1
      ? STATUS_LABEL[active[0].status]
      : active.length > 1
        ? `Memproses ${active.length}`
        : failed
          ? 'Perlu perhatian'
          : 'Siap'

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-xs text-muted-foreground"
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          active.length
            ? 'animate-pulse bg-primary'
            : failed
              ? 'bg-destructive'
              : 'bg-muted-foreground',
        )}
      />
      <span className="tabular-nums">{label}</span>
    </div>
  )
}
