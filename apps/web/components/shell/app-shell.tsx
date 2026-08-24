'use client'

import type { ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Logo } from '@/components/shell/logo'
import { NewProjectDialog } from '@/components/shell/new-project-dialog'
import { SidebarNav } from '@/components/shell/sidebar-nav'
import { TopBar } from '@/components/shell/top-bar'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useWorkspaceStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar)
  const mobileNavOpen = useWorkspaceStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useWorkspaceStore((s) => s.setMobileNavOpen)

  return (
    <div
      className={cn(
        'grid h-dvh w-full overflow-hidden bg-background',
        'grid-cols-1 grid-rows-[auto_1fr]',
        collapsed
          ? 'lg:grid-cols-[72px_minmax(0,1fr)] lg:grid-rows-1'
          : 'lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-1',
      )}
    >
      <aside
        className={cn(
          'hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-[240px]',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border px-3',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <Logo showLabel={!collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Lipat panel samping"
            >
              <PanelLeft />
            </Button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center pt-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Buka panel samping"
            >
              <PanelLeft />
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav collapsed={collapsed} />
        </div>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[240px] gap-0 bg-sidebar p-0">
          <SheetHeader className="h-16 border-b border-border px-3">
            <SheetTitle className="flex items-center">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid min-h-0 min-w-0 grid-rows-[64px_1fr] overflow-hidden">
        <TopBar />
        <main className="min-h-0 min-w-0 overflow-y-auto">{children}</main>
      </div>

      <NewProjectDialog />
    </div>
  )
}
