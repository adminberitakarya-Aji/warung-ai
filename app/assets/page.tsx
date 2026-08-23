'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  FileAudio,
  FileImage,
  FileVideo,
  Images,
  Play,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { AssetThumb } from '@/components/asset-thumb'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAssets, useCreateAsset, useDeleteAsset } from '@/hooks/use-warung'
import type { AssetType } from '@/lib/types'
import { cn } from '@/lib/utils'

const FILTERS: { value: AssetType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'IMAGE', label: 'Gambar' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'REFERENCE', label: 'Referensi' },
]

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<AssetType | 'ALL'>('ALL')
  const [uploadOpen, setUploadOpen] = useState(false)

  // Upload Form State
  const [fileData, setFileData] = useState<{
    name: string
    url: string
    mimeType: string
    type: AssetType
    size: number
  } | null>(null)
  const [customName, setCustomName] = useState('')
  const [selectedType, setSelectedType] = useState<AssetType>('IMAGE')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useAssets(query, type)
  const createAsset = useCreateAsset()
  const remove = useDeleteAsset()

  const assets = data?.assets ?? []

  function handleFileSelect(file: File) {
    let detectedType: AssetType = 'IMAGE'
    if (file.type.startsWith('video/')) detectedType = 'VIDEO'
    else if (file.type.startsWith('audio/')) detectedType = 'AUDIO'
    else if (file.name.toLowerCase().includes('ref') || file.name.toLowerCase().includes('char')) {
      detectedType = 'REFERENCE'
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setFileData({
        name: file.name,
        url,
        mimeType: file.type || 'application/octet-stream',
        type: detectedType,
        size: file.size,
      })
      setCustomName(file.name.replace(/\.[^/.]+$/, ''))
      setSelectedType(detectedType)
    }
    reader.readAsDataURL(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function handleUploadSubmit() {
    if (!fileData || !customName.trim()) {
      toast.error('Nama dan berkas aset wajib diisi')
      return
    }

    try {
      await createAsset.mutateAsync({
        name: customName.trim(),
        type: selectedType,
        url: fileData.url,
        thumbnailUrl: fileData.url,
        mimeType: fileData.mimeType,
        width: selectedType === 'IMAGE' || selectedType === 'REFERENCE' ? 1920 : null,
        height: selectedType === 'IMAGE' || selectedType === 'REFERENCE' ? 1080 : null,
        duration: selectedType === 'VIDEO' ? 5 : selectedType === 'AUDIO' ? 30 : null,
      })
      toast.success('Aset berhasil diunggah ke pustaka')
      setUploadOpen(false)
      setFileData(null)
      setCustomName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunggah aset')
    }
  }

  async function destroy(id: string) {
    try {
      await remove.mutateAsync(id)
      toast.success('Aset dihapus')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus aset')
    }
  }

  return (
    <div className="flex flex-col pb-16">
      <PageHeader
        eyebrow="Pustaka Media"
        title="Aset"
        description="Semua hasil generasi studio, rekaman audio, dan berkas referensi gambar Anda (§21 spec)."
        actions={
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus data-icon="inline-start" />
            Unggah Aset
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama aset…"
              aria-label="Cari aset"
            />
          </InputGroup>

          <ToggleGroup
            value={[type]}
            onValueChange={(value) => setType((value[0] as AssetType | 'ALL') ?? 'ALL')}
            variant="outline"
            size="sm"
          >
            {FILTERS.map((filter) => (
              <ToggleGroupItem key={filter.value} value={filter.value}>
                {filter.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[16/10] rounded-lg" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Images />
              </EmptyMedia>
              <EmptyTitle>Tidak ada aset</EmptyTitle>
              <EmptyDescription>
                {query || type !== 'ALL'
                  ? 'Coba ubah kata kunci atau filter tipe aset.'
                  : 'Unggah berkas pertama Anda atau buat adegan di Studio Generasi.'}
              </EmptyDescription>
            </EmptyHeader>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setUploadOpen(true)}>
              <Plus data-icon="inline-start" />
              Unggah Aset Sekarang
            </Button>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset, index) => (
              <figure
                key={asset.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-colors hover:border-primary/40"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <AssetThumb
                    asset={asset}
                    alt={asset.name}
                    priority={index < 4}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {asset.type === 'VIDEO' && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur">
                      <Play className="size-2.5 fill-current" />
                      {asset.duration ? `${asset.duration}s` : 'video'}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Hapus ${asset.name}`}
                    onClick={() => destroy(asset.id)}
                    disabled={remove.isPending}
                    className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <figcaption className="flex flex-col gap-1 p-3">
                  <span className="truncate text-xs font-medium">{asset.name}</span>
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-[0.14em] text-primary">{asset.type}</span>
                    <span>
                      {asset.width && asset.height ? `${asset.width}×${asset.height}` : ''}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog / Modal (§21 wireframe) */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Unggah Aset Baru</DialogTitle>
            <DialogDescription>
              Tambahkan gambar referensi, storyboard still, klip video, atau audio ambience ke pustaka proyek.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />

            {!fileData ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/60 hover:bg-muted/30',
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <UploadCloud className="size-6 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Tarik & lepas berkas ke sini</span>
                  <span className="text-xs text-muted-foreground">
                    atau klik untuk memilih berkas dari komputer (PNG, JPG, SVG, MP4, MP3)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                    {fileData.type === 'IMAGE' || fileData.type === 'REFERENCE' ? (
                      <Image
                        src={fileData.url}
                        alt="Pratinjau"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : fileData.type === 'VIDEO' ? (
                      <div className="flex size-full items-center justify-center bg-card">
                        <FileVideo className="size-6 text-primary" />
                      </div>
                    ) : (
                      <div className="flex size-full items-center justify-center bg-card">
                        <FileAudio className="size-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">{fileData.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {(fileData.size / 1024).toFixed(1)} KB · {fileData.mimeType}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setFileData(null)
                      setCustomName('')
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="asset-name">Nama Aset</FieldLabel>
                    <Input
                      id="asset-name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Nama aset..."
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Tipe Aset</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {(['IMAGE', 'VIDEO', 'AUDIO', 'REFERENCE'] as AssetType[]).map((t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={selectedType === t ? 'default' : 'outline'}
                          size="xs"
                          onClick={() => setSelectedType(t)}
                        >
                          {t === 'IMAGE'
                            ? 'Gambar'
                            : t === 'VIDEO'
                              ? 'Video'
                              : t === 'AUDIO'
                                ? 'Audio'
                                : 'Referensi'}
                        </Button>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadOpen(false)
                setFileData(null)
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleUploadSubmit}
              disabled={!fileData || !customName.trim() || createAsset.isPending}
            >
              Simpan ke Pustaka
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
