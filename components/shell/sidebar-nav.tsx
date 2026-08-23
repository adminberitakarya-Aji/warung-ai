'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { primaryNav, secondaryNav, type NavItem } from '@/lib/navigation'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 items-center rounded-md text-sm transition-colors',
        collapsed ? 'w-9 justify-center' : 'gap-3 px-3',
        active
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 h-4 w-0.5 rounded-full bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
          collapsed && 'left-[-6px]',
        )}
      />
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )

  if (!collapsed) return link

  // TooltipTrigger renders a <button> by default; the anchor stays the
  // interactive element so keyboard and screen-reader navigation is preserved.
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="contents" />}>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const setNewProjectOpen = useWorkspaceStore((state) => state.setNewProjectOpen)

  return (
    <nav aria-label="Navigasi utama" className="flex h-full flex-col gap-6 px-3 py-4">
      <Button
        variant="outline"
        onClick={() => {
          setNewProjectOpen(true)
          onNavigate?.()
        }}
        className={cn('justify-start', collapsed && 'w-9 justify-center px-0')}
      >
        <Plus data-icon={collapsed ? undefined : 'inline-start'} />
        {!collapsed && 'Proyek baru'}
        {collapsed && <span className="sr-only">Proyek baru</span>}
      </Button>

      <div className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <Separator className="mb-3" />
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    </nav>
  )
}
