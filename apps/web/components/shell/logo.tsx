import { cn } from '@/lib/utils'

export function Logo({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className="relative flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10"
      >
        <span className="absolute inset-x-1 top-1 h-px bg-primary/50" />
        <span className="absolute inset-x-1 bottom-1 h-px bg-primary/50" />
        <span className="size-2 rounded-[2px] bg-primary" />
      </span>
      {showLabel ? (
        <span className="text-sm font-semibold tracking-tight">
          Warung<span className="text-primary">AI</span>
        </span>
      ) : (
        <span className="sr-only">WarungAI</span>
      )}
    </div>
  )
}
