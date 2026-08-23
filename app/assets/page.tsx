'use client'

import { useState } from 'react'
import { Images, Play, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { AssetThumb } from '@/components/asset-thumb'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAssets, useDeleteAsset } from '@/hooks/use-warung'
import type { AssetType } from '@/lib/types'

const FILTERS: { value: AssetType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'IMAGE', label: 'Gambar' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'REFERENCE', label: 'Referensi' },
]

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<AssetType | 'ALL'>('ALL')

  const { data, isLoading } = useAssets(query, type)
  const remove = useDeleteAsset()

  const assets = data?.assets ?? []

  async function destroy(id: string) {
    try {
      await remove.mutateAsync(id)
      toast.success('Aset dihapus')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus aset')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Pustaka"
        title="Aset"
        description="Semua hasil generasi dan berkas referensi Anda, tersimpan di satu tempat."
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
                  ? 'Coba ubah kata kunci atau filter.'
                  : 'Hasil generasi Anda akan muncul di sini.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset, index) => (
              <figure
                key={asset.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
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
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {asset.type}
                    {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
