'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteCharacter, useUpdateCharacter } from '@/hooks/use-warung'
import type { CharacterWithReferences } from '@/lib/api/client'
import type { CharacterReferenceType } from '@/lib/types'

const REFERENCE_TYPE_LABELS: Record<CharacterReferenceType, string> = {
  FACE: 'wajah',
  BODY: 'tubuh',
  OUTFIT: 'pakaian',
  EXPRESSION: 'ekspresi',
}

const EMPTY = {
  name: '',
  role: '',
  description: '',
  appearance: '',
  clothing: '',
  personality: '',
}

export function CharacterSheet({
  character,
  open,
  onOpenChange,
}: {
  character: CharacterWithReferences | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [draft, setDraft] = useState(EMPTY)
  const update = useUpdateCharacter(character?.id ?? '')
  const remove = useDeleteCharacter()

  useEffect(() => {
    if (!character) return
    setDraft({
      name: character.name,
      role: character.role,
      description: character.description,
      appearance: character.appearance,
      clothing: character.clothing,
      personality: character.personality,
    })
  }, [character])

  if (!character) return null

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    try {
      await update.mutateAsync(draft)
      toast.success('Karakter diperbarui')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan')
    }
  }

  const characterId = character.id

  async function destroy() {
    try {
      await remove.mutateAsync(characterId)
      toast.success('Karakter dihapus')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{character.name}</SheetTitle>
          <SheetDescription>
            Detail ini dikirim ke model setiap kali karakter dipakai, menjaga wajah dan gaya tetap
            konsisten antar adegan.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {character.references.length > 0 && (
            <div className="flex flex-col gap-2 pb-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Referensi
              </span>
              <div className="flex flex-wrap gap-2">
                {character.references.map((reference) => (
                  <figure key={reference.id} className="flex flex-col gap-1">
                    <div className="relative size-20 overflow-hidden rounded-md border border-border">
                      <Image
                        src={reference.asset.thumbnailUrl || reference.asset.url}
                        alt={reference.asset.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {REFERENCE_TYPE_LABELS[reference.type]}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="char-name">Nama</FieldLabel>
              <Input
                id="char-name"
                value={draft.name}
                onChange={(event) => set('name', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="char-role">Peran</FieldLabel>
              <Input
                id="char-role"
                value={draft.role}
                onChange={(event) => set('role', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="char-appearance">Penampilan</FieldLabel>
              <Textarea
                id="char-appearance"
                rows={3}
                value={draft.appearance}
                onChange={(event) => set('appearance', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="char-clothing">Pakaian</FieldLabel>
              <Textarea
                id="char-clothing"
                rows={2}
                value={draft.clothing}
                onChange={(event) => set('clothing', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="char-personality">Kepribadian</FieldLabel>
              <Textarea
                id="char-personality"
                rows={2}
                value={draft.personality}
                onChange={(event) => set('personality', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="char-description">Catatan</FieldLabel>
              <Textarea
                id="char-description"
                rows={3}
                value={draft.description}
                onChange={(event) => set('description', event.target.value)}
              />
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t border-border">
          <Button variant="ghost" size="sm" onClick={destroy} disabled={remove.isPending}>
            <Trash2 data-icon="inline-start" />
            Hapus
          </Button>
          <div className="flex items-center gap-2">
            <SheetClose render={<Button variant="ghost" size="sm" nativeButton={false} />}>
              Batal
            </SheetClose>
            <Button size="sm" onClick={save} disabled={update.isPending || !draft.name.trim()}>
              Simpan
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
