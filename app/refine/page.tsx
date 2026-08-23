'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Images, Sparkles, Wand } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAssets, useCreateRefinement, useGeneration } from '@/hooks/use-warung'
import { STATUS_LABEL } from '@/lib/generation-labels'
import { isActiveGeneration } from '@/lib/types'

const TAGS = [
  'Perbaiki wajah',
  'Tingkatkan resolusi',
  'Perbaiki pencahayaan',
  'Kurangi noise',
  'Perkuat warna',
  'Perhalus gerakan',
]

export default function RefinePage() {
  const { data, isLoading } = useAssets('', 'ALL')
  // Only visual assets can be refined, so audio is filtered out of the picker.
  const assets = (data?.assets ?? []).filter((asset) => asset.type !== 'AUDIO')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null)

  const refine = useCreateRefinement()
  const { data: generationData } = useGeneration(activeGenerationId)
  const generation = generationData?.generation

  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0] ?? null

  useEffect(() => {
    if (!selectedId && assets[0]) setSelectedId(assets[0].id)
  }, [assets, selectedId])

  const isRunning = isActiveGeneration(generation?.status)
  const result = generation?.status === 'COMPLETED' ? generation.resultAsset : null

  async function submit() {
    if (!selected) return
    if (!prompt.trim() && tags.length === 0) {
      toast.error('Pilih perbaikan atau tulis instruksi terlebih dahulu')
      return
    }

    try {
      const response = await refine.mutateAsync({
        assetId: selected.id,
        prompt: prompt.trim() || tags.join(', '),
        refinementTags: tags,
      })
      setActiveGenerationId(response.generation.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memulai perbaikan')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Penyempurnaan"
        title="Perbaiki"
        description="Pilih aset, tentukan perbaikan yang diinginkan, lalu jalankan ulang generasi."
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Pilih aset
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-video rounded" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Images />
                </EmptyMedia>
                <EmptyTitle>Belum ada aset</EmptyTitle>
                <EmptyDescription>Buat generasi terlebih dahulu.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedId(asset.id)}
                  aria-pressed={selected?.id === asset.id}
                  className={`relative aspect-video overflow-hidden rounded border bg-muted transition-colors ${
                    selected?.id === asset.id
                      ? 'border-primary'
                      : 'border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <Image
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.name}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-5">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            {isRunning ? (
              <div className="flex size-full flex-col items-center justify-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {generation ? STATUS_LABEL[generation.status] : 'Memproses perbaikan'}
                </span>
                <Progress value={generation?.progress ?? 0} className="w-56" />
              </div>
            ) : (result ?? selected) ? (
              <Image
                src={
                  (result ?? selected)!.thumbnailUrl || (result ?? selected)!.url
                }
                alt={(result ?? selected)!.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="film-grid flex size-full items-center justify-center">
                <Wand className="size-5 text-muted-foreground" />
              </div>
            )}

            {result && (
              <Badge className="absolute left-3 top-3">Hasil perbaikan</Badge>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <Field>
              <FieldLabel>Jenis perbaikan</FieldLabel>
              <ToggleGroup
                value={tags}
                onValueChange={(value) => setTags(value as string[])}
                variant="outline"
                size="sm"
                className="flex-wrap"
              >
                {TAGS.map((tag) => (
                  <ToggleGroupItem key={tag} value={tag}>
                    {tag}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="refine-prompt">Instruksi tambahan</FieldLabel>
              <Textarea
                id="refine-prompt"
                rows={3}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Contoh: buat cahaya lampu lebih hangat dan kurangi bayangan di wajah…"
              />
            </Field>

            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {selected ? selected.name : 'Belum ada aset dipilih'}
              </span>
              <Button onClick={submit} disabled={!selected || refine.isPending || isRunning}>
                <Sparkles data-icon="inline-start" />
                Perbaiki
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
