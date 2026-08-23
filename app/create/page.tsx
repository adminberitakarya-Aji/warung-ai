'use client'

import Image from 'next/image'
import { Download, Layers, Play, Sparkles, Wand } from 'lucide-react'
import { toast } from 'sonner'

import { GenerationCard } from '@/components/generation-card'
import { PageHeader } from '@/components/page-header'
import { ParameterPanel } from '@/components/create/parameter-panel'
import { PromptComposer } from '@/components/prompt-composer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateRefinement, useGenerations } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

const REFINEMENTS = [
  { id: 'UPSCALE', label: 'Perbesar', hint: 'Naikkan resolusi 2x' },
  { id: 'EXTEND', label: 'Perpanjang', hint: 'Tambah 4 detik' },
  { id: 'VARIATION', label: 'Variasi', hint: 'Buat alternatif' },
] as const

export default function CreatePage() {
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId)
  const activeGenerationId = useWorkspaceStore((s) => s.activeGenerationId)
  const setActiveGenerationId = useWorkspaceStore((s) => s.setActiveGenerationId)
  const { data, isLoading } = useGenerations()
  const refine = useCreateRefinement()

  // Project-less generations (tools, ad-hoc refinements) stay visible everywhere.
  const generations = (data?.generations ?? []).filter(
    (generation) =>
      !activeProjectId ||
      generation.projectId === null ||
      generation.projectId === activeProjectId,
  )
  const selected =
    generations.find((generation) => generation.id === activeGenerationId) ?? generations[0] ?? null
  const asset = selected?.resultAsset ?? null
  const busy = selected?.status === 'QUEUED' || selected?.status === 'PROCESSING'

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Studio"
        title="Buat adegan"
        description="Tulis prompt, atur parameter, lalu hasilkan gambar atau video sinematik."
      />

      <div className="flex flex-col gap-8 px-4 py-8 md:flex-row md:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <PromptComposer />

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Pratinjau</h2>
              {selected && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {selected.model}
                </Badge>
              )}
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-card">
              {isLoading ? (
                <Skeleton className="size-full rounded-none" />
              ) : asset && asset.mimeType.startsWith('video/') ? (
                <video
                  key={asset.id}
                  src={asset.url}
                  poster={asset.thumbnailUrl ?? undefined}
                  controls
                  loop
                  playsInline
                  className="size-full object-cover"
                />
              ) : asset ? (
                <>
                  <Image
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                  />
                  {asset.type === 'VIDEO' && (
                    <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-background/80 px-2 py-1 font-mono text-[11px] backdrop-blur">
                      <Play className="size-3 fill-current" />
                      {asset.duration ? `${asset.duration}s` : 'video'} · bingkai kunci
                    </span>
                  )}
                </>
              ) : (
                <div className="film-grid flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
                  {busy ? (
                    <>
                      <span className="font-mono text-2xl tabular-nums">
                        {selected?.progress}%
                      </span>
                      <Progress value={selected?.progress ?? 0} className="h-1 w-40" />
                      <p className="text-xs text-muted-foreground">
                        Sedang merender adegan Anda…
                      </p>
                    </>
                  ) : (
                    <Empty className="border-0 bg-transparent">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Sparkles />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada hasil</EmptyTitle>
                        <EmptyDescription>
                          Tulis prompt di atas untuk membuat adegan pertama Anda.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              )}
            </div>

            {selected && (
              <div className="flex flex-wrap items-center gap-2">
                {REFINEMENTS.map((refinement) => (
                  <Button
                    key={refinement.id}
                    variant="outline"
                    size="sm"
                    disabled={!asset || refine.isPending}
                    onClick={() =>
                      refine.mutate(
                        {
                          prompt: refinement.hint,
                          assetId: asset?.id,
                          sceneId: selected.sceneId,
                          refinementTags: [refinement.label],
                        },
                        {
                          onSuccess: ({ generation }) => {
                            setActiveGenerationId(generation.id)
                            toast.success(`${refinement.label} dimulai — ${refinement.hint}`)
                          },
                          onError: (error) => toast.error(error.message),
                        },
                      )
                    }
                  >
                    <Wand data-icon="inline-start" />
                    {refinement.label}
                  </Button>
                ))}
                {asset && (
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href={asset.url} download />}
                  >
                    <Download data-icon="inline-start" />
                    Unduh
                  </Button>
                )}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Riwayat generasi</h2>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-video rounded-lg" />
                ))}
              </div>
            ) : generations.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers />
                  </EmptyMedia>
                  <EmptyTitle>Riwayat masih kosong</EmptyTitle>
                  <EmptyDescription>
                    Setiap generasi akan muncul di sini agar mudah dibandingkan.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generations.map((generation) => (
                  <GenerationCard
                    key={generation.id}
                    generation={generation}
                    onSelect={(next) => setActiveGenerationId(next.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <ParameterPanel />
      </div>
    </div>
  )
}
