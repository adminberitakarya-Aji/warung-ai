'use client'

import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCharacters, useSession } from '@/hooks/use-warung'
import type { AspectRatio } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/stores/workspace-store'

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1']
const DURATIONS = [4, 6, 8, 10] as const

export function ParameterPanel() {
  const draft = useWorkspaceStore((s) => s.createDraft)
  const patchDraft = useWorkspaceStore((s) => s.patchCreateDraft)
  const activeModelId = useWorkspaceStore((s) => s.activeModelId)
  const { data: session } = useSession()
  const { data: charactersData } = useCharacters()

  const characters = charactersData?.characters ?? []
  const activeModel =
    session?.models.find((m) => m.type === draft.type && m.id === activeModelId) ??
    session?.models.find((m) => m.type === draft.type)

  return (
    <aside className="flex w-full flex-col gap-6 border-border md:w-72 md:shrink-0 md:border-l md:pl-6">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Rasio aspek</FieldLegend>
          <FieldDescription>Format bingkai keluaran.</FieldDescription>
          <ToggleGroup
            value={[draft.aspectRatio]}
            onValueChange={(value) => {
              const next = ASPECT_RATIOS.find((ratio) => ratio === value[0])
              if (next) patchDraft({ aspectRatio: next })
            }}
            variant="outline"
            size="sm"
            className="flex-wrap"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <ToggleGroupItem key={ratio} value={ratio} className="font-mono text-[11px]">
                {ratio}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>

        {draft.type === 'VIDEO' && (
          <FieldSet>
            <FieldLegend variant="label">Durasi</FieldLegend>
            <FieldDescription>Panjang klip dalam detik.</FieldDescription>
            <ToggleGroup
              value={[String(draft.duration)]}
              onValueChange={(value) => {
                if (value[0]) patchDraft({ duration: Number(value[0]) })
              }}
              variant="outline"
              size="sm"
            >
              {DURATIONS.map((duration) => (
                <ToggleGroupItem
                  key={duration}
                  value={String(duration)}
                  className="font-mono text-[11px]"
                >
                  {duration}s
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FieldSet>
        )}

        <Field>
          <FieldLabel>Karakter referensi</FieldLabel>
          <FieldDescription>
            Pilih karakter agar wajah dan pakaian tetap konsisten antar adegan.
          </FieldDescription>
          {characters.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Belum ada karakter di proyek ini.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {characters.map((character) => {
                const selected = draft.characterIds.includes(character.id)
                return (
                  <button
                    key={character.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      patchDraft({
                        characterIds: selected
                          ? draft.characterIds.filter((id) => id !== character.id)
                          : [...draft.characterIds, character.id],
                      })
                    }
                    className={cn(
                      'flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors',
                      selected
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
                      {character.references[0]?.thumbnailUrl && (
                        <Image
                          src={character.references[0].thumbnailUrl}
                          alt=""
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    {character.name}
                  </button>
                )
              })}
            </div>
          )}
        </Field>
      </FieldGroup>

      {activeModel && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{activeModel.label}</span>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {activeModel.credits} kredit
            </Badge>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {activeModel.description}
          </p>
        </div>
      )}
    </aside>
  )
}
