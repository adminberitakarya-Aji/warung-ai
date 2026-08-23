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
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[68px]' : 'w-60',
        )}
      >
        <div
          className={cn(
            'flex h-14 items-center border-b border-border px-3',
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
        <SidebarNav collapsed={collapsed} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 gap-0 bg-sidebar p-0">
          <SheetHeader className="h-14 border-b border-border px-3">
            <SheetTitle className="flex items-center">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <NewProjectDialog />
    </div>
  )
}
