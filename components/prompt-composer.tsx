'use client'

import { useRouter } from 'next/navigation'
import { ArrowUp, Image as ImageIcon, Video } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCreateGeneration, useSession } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

const SUGGESTIONS = [
  'Warung soto di gang sempit saat hujan reda, lampu kuning menyala',
  'Sari menuang kuah panas ke dalam mangkuk, uap naik ke wajahnya',
  'Adi berdiri di depan warung yang tutup, kamera perlahan menjauh',
]

export function PromptComposer() {
  const router = useRouter()
  const draft = useWorkspaceStore((s) => s.createDraft)
  const patchDraft = useWorkspaceStore((s) => s.patchCreateDraft)
  const activeProjectId = useWorkspaceStore((s) => s.activeProjectId)
  const activeModelId = useWorkspaceStore((s) => s.activeModelId)
  const setActiveGenerationId = useWorkspaceStore((s) => s.setActiveGenerationId)
  const { data: session } = useSession()
  const createGeneration = useCreateGeneration()

  const models = session?.models ?? []
  const modelForType =
    models.find((m) => m.id === activeModelId && m.type === draft.type) ??
    models.find((m) => m.type === draft.type)

  function submit() {
    const prompt = draft.prompt.trim()
    if (!prompt) {
      toast.error('Tuliskan dulu adegan yang ingin Anda buat.')
      return
    }
    if (!modelForType) return

    createGeneration.mutate(
      {
        type: draft.type,
        prompt,
        model: modelForType.id,
        projectId: activeProjectId,
        parameters: {
          aspectRatio: draft.aspectRatio,
          duration: draft.type === 'VIDEO' ? draft.duration : undefined,
          characterIds: draft.characterIds,
        },
      },
      {
        onSuccess: ({ generation }) => {
          setActiveGenerationId(generation.id)
          router.push('/create')
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <InputGroup className="bg-card">
        <InputGroupTextarea
          value={draft.prompt}
          rows={3}
          aria-label="Deskripsi adegan"
          placeholder="Deskripsikan adegan: lokasi, karakter, cahaya, gerak kamera…"
          onChange={(event) => patchDraft({ prompt: event.target.value })}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <InputGroupAddon align="block-end" className="gap-2">
          <ToggleGroup
            value={[draft.type]}
            onValueChange={(value) => {
              const next = value[0]
              if (next === 'IMAGE' || next === 'VIDEO') patchDraft({ type: next })
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            <ToggleGroupItem value="VIDEO">
              <Video data-icon="inline-start" />
              Video
            </ToggleGroupItem>
            <ToggleGroupItem value="IMAGE">
              <ImageIcon data-icon="inline-start" />
              Gambar
            </ToggleGroupItem>
          </ToggleGroup>

          {modelForType && (
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
              {modelForType.label} · {modelForType.credits} kredit
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
              <Kbd>Enter</Kbd> kirim
            </span>
            <Button size="sm" onClick={submit} disabled={createGeneration.isPending}>
              {createGeneration.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ArrowUp data-icon="inline-start" />
              )}
              Buat
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => patchDraft({ prompt: suggestion })}
            className="max-w-full truncate rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
