'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { toast } from 'sonner'

import { CharacterSheet } from '@/components/characters/character-sheet'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { useCharacters, useCreateCharacter } from '@/hooks/use-warung'
import type { CharacterWithReferences } from '@/lib/api/client'

export default function CharactersPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<CharacterWithReferences | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data, isLoading } = useCharacters(query || undefined)
  const create = useCreateCharacter()

  const characters = data?.characters ?? []

  async function addCharacter() {
    try {
      const result = await create.mutateAsync({ name: 'Karakter baru', role: 'Pendukung' })
      setSelected(result.character)
      setSheetOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat karakter')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Pustaka"
        title="Karakter"
        description="Simpan wajah, pakaian, dan sifat setiap tokoh sekali saja. WarungAI memakainya ulang agar tampilan tetap konsisten di seluruh adegan."
        actions={
          <Button size="sm" onClick={addCharacter} disabled={create.isPending}>
            <Plus data-icon="inline-start" />
            Karakter baru
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau peran…"
            aria-label="Cari karakter"
          />
        </InputGroup>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Belum ada karakter</EmptyTitle>
              <EmptyDescription>
                {query
                  ? 'Tidak ada karakter yang cocok dengan pencarian.'
                  : 'Tambahkan tokoh pertama Anda agar wajahnya konsisten di setiap adegan.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {characters.map((character) => {
              const cover = character.references[0]?.asset
              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => {
                    setSelected(character)
                    setSheetOpen(true)
                  }}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary/50"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    {cover ? (
                      <Image
                        src={cover.thumbnailUrl || cover.url}
                        alt={character.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="film-grid flex size-full items-center justify-center">
                        <Users className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <span className="truncate text-sm font-medium">{character.name}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                      {character.role || 'tanpa peran'}
                    </span>
                    <span className="line-clamp-2 pt-1 text-xs leading-relaxed text-muted-foreground">
                      {character.appearance || character.description || 'Belum ada deskripsi.'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <CharacterSheet character={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
