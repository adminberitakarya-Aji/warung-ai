'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clapperboard,
  Save,
  Smile,
  Shirt,
  Sparkles,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  useCharacter,
  useDeleteCharacter,
  useGenerations,
  useUpdateCharacter,
} from '@/hooks/use-warung'
import { GenerationCard } from '@/components/generation-card'
import type { CharacterReferenceType } from '@/lib/types'

const REFERENCE_GROUPS: Array<{
  type: CharacterReferenceType
  label: string
  description: string
  icon: typeof User
}> = [
  {
    type: 'FACE',
    label: 'Wajah',
    description: 'Referensi fitur wajah, mata, dan struktur muka.',
    icon: User,
  },
  {
    type: 'BODY',
    label: 'Tubuh & Postur',
    description: 'Referensi bentuk fisik, tinggi badan, dan siluet.',
    icon: Users,
  },
  {
    type: 'OUTFIT',
    label: 'Pakaian & Busana',
    description: 'Referensi kostum, tekstur kain, dan aksesoris khas.',
    icon: Shirt,
  },
  {
    type: 'EXPRESSION',
    label: 'Ekspresi & Emosi',
    description: 'Variasi ekspresi wajah, senyum, tatapan, atau amarah.',
    icon: Smile,
  },
]

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading } = useCharacter(id)
  const { data: genData } = useGenerations()
  const update = useUpdateCharacter(id)
  const remove = useDeleteCharacter()

  const character = data?.character
  const generations = genData?.generations ?? []

  // Filter generations that use this character ID or prompt contains character name
  const relatedGenerations = generations.filter((gen) => {
    const charIds = gen.parameters?.characterIds
    if (Array.isArray(charIds) && charIds.includes(id)) return true
    if (character?.name && gen.prompt.toLowerCase().includes(character.name.toLowerCase())) {
      return true
    }
    return false
  })

  const [draft, setDraft] = useState({
    name: '',
    role: '',
    description: '',
    appearance: '',
    clothing: '',
    personality: '',
  })

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

  function set<K extends keyof typeof draft>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      toast.error('Nama karakter wajib diisi')
      return
    }
    try {
      await update.mutateAsync(draft)
      toast.success('Perubahan karakter berhasil disimpan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan karakter')
    }
  }

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin menghapus karakter ini?')) return
    try {
      await remove.mutateAsync(id)
      toast.success('Karakter berhasil dihapus')
      router.push('/characters')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus karakter')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Karakter tidak ditemukan</EmptyTitle>
            <EmptyDescription>
              Karakter dengan ID tersebut mungkin sudah dihapus atau tidak tersedia.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <Button variant="outline" className="mt-4" render={<Link href="/characters" />}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke pustaka karakter
        </Button>
      </div>
    )
  }

  const primaryCover = character.references[0]?.asset

  return (
    <div className="flex flex-col pb-16">
      <PageHeader
        eyebrow={
          <Link
            href="/characters"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Pustaka Karakter
          </Link>
        }
        title={character.name}
        description={`Karakter ${character.role || 'tanpa peran'} — kelola bio, konsistensi fisik, dan pustaka referensi.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 data-icon="inline-start" />
              Hapus
            </Button>
            <Button size="sm" onClick={handleSave} disabled={update.isPending || !draft.name.trim()}>
              <Save data-icon="inline-start" />
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left Column: Character Card & Overview */}
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/5] w-full bg-muted">
                {primaryCover ? (
                  <Image
                    src={primaryCover.thumbnailUrl || primaryCover.url}
                    alt={character.name}
                    fill
                    sizes="320px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="film-grid flex size-full items-center justify-center">
                    <Users className="size-12 text-muted-foreground/50" />
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className="absolute bottom-3 left-3 bg-background/85 font-mono text-[10px] uppercase backdrop-blur"
                >
                  {character.role || 'Tokoh'}
                </Badge>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{character.name}</CardTitle>
                <CardDescription className="line-clamp-3 text-xs leading-relaxed">
                  {character.appearance || character.description || 'Belum ada ringkasan tampilan.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 border-t border-border p-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Referensi:</span>
                  <span className="font-mono font-medium text-foreground">
                    {character.references.length} gambar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Riwayat Pemakaian:</span>
                  <span className="font-mono font-medium text-foreground">
                    {relatedGenerations.length} generasi
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detail Tabs */}
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Profil & Konsistensi
                </TabsTrigger>
                <TabsTrigger
                  value="references"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Pustaka Referensi ({character.references.length})
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Riwayat Generasi ({relatedGenerations.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Profile & Consistency Details */}
              <TabsContent value="details" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Spesifikasi Karakter</CardTitle>
                    <CardDescription>
                      Prompt dan parameter ini disuntikkan secara otomatis saat Anda memilih karakter ini di
                      studio pembuatan gambar & video.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="char-name">Nama Karakter</FieldLabel>
                          <Input
                            id="char-name"
                            value={draft.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="Nama karakter..."
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="char-role">Peran</FieldLabel>
                          <Input
                            id="char-role"
                            value={draft.role}
                            onChange={(e) => set('role', e.target.value)}
                            placeholder="mis. Tokoh Utama, Antagonis, Pendukung..."
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="char-appearance">Ciri Fisik & Penampilan</FieldLabel>
                        <Textarea
                          id="char-appearance"
                          rows={3}
                          value={draft.appearance}
                          onChange={(e) => set('appearance', e.target.value)}
                          placeholder="Usia, warna rambut, potongan rambut, bentuk wajah, tatapan mata..."
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="char-clothing">Pakaian & Kostum Khas</FieldLabel>
                        <Textarea
                          id="char-clothing"
                          rows={2}
                          value={draft.clothing}
                          onChange={(e) => set('clothing', e.target.value)}
                          placeholder="Kemeja linen hijau zaitun, jaket kulit cokelat, celana denim..."
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="char-personality">Kepribadian & Gerak Tubuh</FieldLabel>
                        <Textarea
                          id="char-personality"
                          rows={2}
                          value={draft.personality}
                          onChange={(e) => set('personality', e.target.value)}
                          placeholder="Pendiam, berwibawa, sering tersenyum ramah, tegap..."
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="char-description">Catatan Latar Belakang / Cerita</FieldLabel>
                        <Textarea
                          id="char-description"
                          rows={3}
                          value={draft.description}
                          onChange={(e) => set('description', e.target.value)}
                          placeholder="Latar belakang karakter dalam alur film..."
                        />
                      </Field>
                    </FieldGroup>

                    <div className="flex justify-end pt-2">
                      <Button onClick={handleSave} disabled={update.isPending}>
                        <Save data-icon="inline-start" />
                        Simpan Spesifikasi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Reference Gallery Grouped by Type */}
              <TabsContent value="references" className="pt-6">
                <div className="flex flex-col gap-6">
                  {REFERENCE_GROUPS.map((group) => {
                    const refsInGroup = character.references.filter((r) => r.type === group.type)
                    const Icon = group.icon

                    return (
                      <Card key={group.type}>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-md border border-border bg-muted">
                              <Icon className="size-3.5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-semibold">{group.label}</CardTitle>
                              <CardDescription className="text-xs">{group.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {refsInGroup.length} referensi
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          {refsInGroup.length === 0 ? (
                            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                              <p className="text-xs text-muted-foreground">
                                Belum ada referensi gambar untuk kategori {group.label.toLowerCase()}.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                              {refsInGroup.map((ref) => (
                                <div
                                  key={ref.id}
                                  className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card"
                                >
                                  <div className="relative aspect-square w-full bg-muted">
                                    <Image
                                      src={ref.asset.thumbnailUrl || ref.asset.url}
                                      alt={ref.asset.name}
                                      fill
                                      sizes="(max-width: 768px) 50vw, 25vw"
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <Badge
                                      variant="secondary"
                                      className="absolute right-1.5 top-1.5 bg-background/80 font-mono text-[9px] backdrop-blur"
                                    >
                                      {ref.type}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-col gap-0.5 p-2">
                                    <span className="truncate text-xs font-medium">{ref.asset.name}</span>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {ref.asset.width && ref.asset.height
                                        ? `${ref.asset.width}×${ref.asset.height}`
                                        : 'SVG/Vektor'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Tab 3: Generation Usage History */}
              <TabsContent value="history" className="pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Riwayat Pemakaian di Studio</CardTitle>
                    <CardDescription>
                      Daftar generasi gambar dan video yang menggunakan karakter {character.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {relatedGenerations.length === 0 ? (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Clapperboard />
                          </EmptyMedia>
                          <EmptyTitle>Belum ada riwayat generasi</EmptyTitle>
                          <EmptyDescription>
                            Gunakan karakter ini di halaman Buat Adegan untuk melihat hasil generasinya di sini.
                          </EmptyDescription>
                        </EmptyHeader>
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href="/create" />}
                          className="mt-2"
                        >
                          <Sparkles data-icon="inline-start" />
                          Buka Studio Generasi
                        </Button>
                      </Empty>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {relatedGenerations.map((generation) => (
                          <GenerationCard key={generation.id} generation={generation} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
