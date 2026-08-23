'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Clapperboard, Film, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateScene,
  useDeleteScene,
  useProjects,
  useReorderScenes,
  useScenes,
  useUpdateScene,
} from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

export default function StoryboardPage() {
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId)
  const setActiveProjectId = useWorkspaceStore((s) => s.setActiveProjectId)
  const { data: projectsData } = useProjects()

  // Fall back to the first project so the page is never stranded without context.
  const projects = projectsData?.projects ?? []
  const projectId = activeProjectId ?? projects[0]?.id ?? ''

  useEffect(() => {
    if (!activeProjectId && projects[0]) setActiveProjectId(projects[0].id)
  }, [activeProjectId, projects, setActiveProjectId])

  const { data, isLoading } = useScenes(projectId)
  const createScene = useCreateScene(projectId)
  const updateScene = useUpdateScene(projectId)
  const deleteScene = useDeleteScene(projectId)
  const reorder = useReorderScenes(projectId)

  const scenes = data?.scenes ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = scenes.find((scene) => scene.id === selectedId) ?? scenes[0] ?? null

  const [draftPrompt, setDraftPrompt] = useState('')
  const [draftDuration, setDraftDuration] = useState(5)

  useEffect(() => {
    if (!selected) return
    setDraftPrompt(selected.prompt)
    setDraftDuration(selected.duration)
  }, [selected?.id, selected?.prompt, selected?.duration])

  const totalDuration = scenes.reduce((total, scene) => total + scene.duration, 0)

  function move(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= scenes.length) return
    const ordered = scenes.map((scene) => scene.id)
    ;[ordered[index], ordered[next]] = [ordered[next], ordered[index]]
    reorder.mutate(ordered, { onError: () => toast.error('Gagal mengubah urutan') })
  }

  async function addScene() {
    try {
      const result = await createScene.mutateAsync({ title: 'Adegan baru', duration: 5 })
      setSelectedId(result.scene.id)
      toast.success('Adegan ditambahkan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambah adegan')
    }
  }

  async function saveScene() {
    if (!selected) return
    try {
      await updateScene.mutateAsync({
        id: selected.id,
        prompt: draftPrompt,
        duration: draftDuration,
      })
      toast.success('Adegan disimpan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan adegan')
    }
  }

  async function removeScene(id: string) {
    try {
      await deleteScene.mutateAsync(id)
      if (selectedId === id) setSelectedId(null)
      toast.success('Adegan dihapus')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus adegan')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Alur cerita"
        title="Storyboard"
        description="Susun adegan, atur urutan, dan jaga durasi total tetap terkendali."
        actions={
          <>
            {scenes.length > 0 && (
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {scenes.length} adegan · {totalDuration}s
              </span>
            )}
            <Button size="sm" onClick={addScene} disabled={!projectId || createScene.isPending}>
              <Plus data-icon="inline-start" />
              Adegan
            </Button>
          </>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))
          ) : scenes.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Film />
                </EmptyMedia>
                <EmptyTitle>Storyboard masih kosong</EmptyTitle>
                <EmptyDescription>
                  Tambahkan adegan pertama untuk mulai menyusun alur cerita Anda.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            scenes.map((scene, index) => {
              const isActive = selected?.id === scene.id
              return (
                <article
                  key={scene.id}
                  className={`flex gap-4 rounded-lg border bg-card p-3 transition-colors ${
                    isActive ? 'border-primary' : 'border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(scene.id)}
                    className="relative aspect-video w-36 shrink-0 overflow-hidden rounded bg-muted text-left"
                    aria-label={`Pilih ${scene.title}`}
                  >
                    {scene.currentAsset ? (
                      <Image
                        src={scene.currentAsset.thumbnailUrl || scene.currentAsset.url}
                        alt={scene.title}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="film-grid flex size-full items-center justify-center">
                        <Clapperboard className="size-4 text-muted-foreground" />
                      </span>
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded bg-background/85 px-1.5 font-mono text-[10px] tabular-nums backdrop-blur">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{scene.title}</h3>
                      <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
                        {scene.duration}s
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {scene.prompt || 'Belum ada deskripsi adegan.'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Naikkan adegan"
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Turunkan adegan"
                      disabled={index === scenes.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Hapus ${scene.title}`}
                      onClick={() => removeScene(scene.id)}
                      disabled={deleteScene.isPending}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Detail adegan
          </h2>

          {selected ? (
            <>
              <Field>
                <FieldLabel htmlFor="scene-prompt">Deskripsi</FieldLabel>
                <Textarea
                  id="scene-prompt"
                  rows={6}
                  value={draftPrompt}
                  onChange={(event) => setDraftPrompt(event.target.value)}
                  placeholder="Jelaskan aksi, kamera, dan suasana adegan…"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="scene-duration">Durasi (detik)</FieldLabel>
                <Input
                  id="scene-duration"
                  type="number"
                  min={1}
                  max={60}
                  value={draftDuration}
                  onChange={(event) => setDraftDuration(Number(event.target.value) || 1)}
                />
              </Field>

              <Button onClick={saveScene} disabled={updateScene.isPending}>
                Simpan adegan
              </Button>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pilih adegan di sebelah kiri untuk mengubah deskripsi dan durasinya.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
