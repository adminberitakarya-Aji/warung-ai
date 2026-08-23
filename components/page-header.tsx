import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border px-4 py-6 md:flex-row md:items-end md:justify-between md:px-8',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        )}
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
