'use client'

import { Menu, Sparkles } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { GenerationStatus } from '@/components/shell/generation-status'
import { ProjectSelector } from '@/components/shell/project-selector'
import { useSession } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

export function TopBar() {
  const setMobileNavOpen = useWorkspaceStore((s) => s.setMobileNavOpen)
  const activeModelId = useWorkspaceStore((s) => s.activeModelId)
  const setActiveModelId = useWorkspaceStore((s) => s.setActiveModelId)
  const { data } = useSession()

  const models = data?.models ?? []
  const user = data?.user
  const activeModel = models.find((m) => m.id === activeModelId)

  return (
    <header className="flex h-16 shrink-0 items-center gap-1 border-b border-border bg-card/70 px-3 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Buka menu navigasi"
        className="lg:hidden"
      >
        <Menu />
      </Button>

      <ProjectSelector />

      <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="hidden h-9 gap-2 px-2 text-sm md:inline-flex">
              <Sparkles data-icon="inline-start" className="text-primary" />
              <span className="truncate">{activeModel?.label ?? 'Pilih model'}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>Model generasi</DropdownMenuLabel>
          <DropdownMenuGroup>
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setActiveModelId(model.id)}
                className="flex-col items-start gap-1"
              >
                <span className="flex w-full items-center gap-2">
                  <span className="flex-1 truncate font-medium">{model.label}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {model.credits} kredit
                  </Badge>
                </span>
                <span className="w-full truncate text-xs text-muted-foreground">
                  {model.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <GenerationStatus />

        <div className="hidden items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-xs sm:flex">
          <span className="text-muted-foreground">Kredit</span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {user ? user.credits : '—'}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Menu akun">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/15 text-[11px] text-primary">
                    {(user?.name ?? 'WA').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{user?.name ?? 'Pengguna'}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email ?? ''}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Paket {user?.plan ?? 'FREE'}</DropdownMenuItem>
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Keluar</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
