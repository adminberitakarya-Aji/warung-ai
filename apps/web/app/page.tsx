'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clapperboard, Users, Wand, Wrench } from 'lucide-react'

import { GenerationCard } from '@/components/generation-card'
import { PromptComposer } from '@/components/prompt-composer'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useGenerations, useProjects, useSession } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

const SHORTCUTS = [
  {
    href: '/plan',
    label: 'Rancang cerita',
    description: 'Ubah ide jadi daftar adegan',
    icon: Wand,
  },
  {
    href: '/characters',
    label: 'Karakter',
    description: 'Jaga wajah tetap konsisten',
    icon: Users,
  },
  {
    href: '/storyboard',
    label: 'Storyboard',
    description: 'Susun urutan adegan',
    icon: Clapperboard,
  },
  {
    href: '/tools',
    label: 'Alat',
    description: 'Upscale, hapus objek, perpanjang',
    icon: Wrench,
  },
]

export default function HomePage() {
  const { data: session } = useSession()
  const { data: projectData, isLoading: projectsLoading } = useProjects()
  const { data: generationData, isLoading: generationsLoading } = useGenerations()
  const setActiveProjectId = useWorkspaceStore((s) => s.setActiveProjectId)

  const projects = projectData?.projects ?? []
  const generations = (generationData?.generations ?? []).slice(0, 6)
  const firstName = session?.user.name.split(' ')[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:px-8 md:py-14">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {firstName ? `Selamat datang, ${firstName}` : 'Ruang kerja'}
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Apa yang ingin Anda buat?
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Tulis satu adegan, WarungAI mengurus sinematografi, konsistensi karakter, dan hasil
            akhirnya.
          </p>
        </div>

        <PromptComposer />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Mulai cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon
            return (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <Icon className="size-4 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    {shortcut.label}
                    <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {shortcut.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Proyek</h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/storyboard" />}
          >
            Buka storyboard
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {projectsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="aspect-[16/10] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href="/storyboard"
                onClick={() => setActiveProjectId(project.id)}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  {project.thumbnailUrl ? (
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="film-grid flex size-full items-center justify-center">
                      <Clapperboard className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 p-4">
                  <span className="truncate text-sm font-medium">{project.title}</span>
                  <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {project.description || 'Tanpa deskripsi'}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {project.sceneCount} adegan · {project.totalDuration}s
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Generasi terakhir</h2>

        {generationsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <Empty className="rounded-lg border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wand />
              </EmptyMedia>
              <EmptyTitle>Belum ada generasi</EmptyTitle>
              <EmptyDescription>
                Tulis adegan pertama Anda di kolom di atas untuk memulai.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generations.map((generation) => (
              <GenerationCard key={generation.id} generation={generation} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
