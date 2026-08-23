'use client'

import { ChevronDown, Film, Plus } from 'lucide-react'

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
import { useCreateProject, useProjects } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

export function ProjectSelector() {
  const { data } = useProjects()
  const projects = data?.projects ?? []
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId)
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProjectId)
  const createProject = useCreateProject()

  const active = projects.find((p) => p.id === activeProjectId) ?? projects[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-9 max-w-[240px] justify-start gap-2 px-2 text-sm">
            <Film data-icon="inline-start" className="text-primary" />
            <span className="truncate">{active?.title ?? 'Tanpa proyek'}</span>
            <ChevronDown data-icon="inline-end" className="opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Proyek</DropdownMenuLabel>
        <DropdownMenuGroup>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setActiveProject(project.id)}
              className="flex-col items-start gap-0.5"
            >
              <span className="w-full truncate font-medium">{project.title}</span>
              <span className="w-full truncate text-xs text-muted-foreground">
                {project.description || 'Tanpa deskripsi'}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              createProject.mutate(
                { title: `Proyek baru ${projects.length + 1}` },
                { onSuccess: ({ project }) => setActiveProject(project.id) },
              )
            }
          >
            <Plus />
            Proyek baru
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
