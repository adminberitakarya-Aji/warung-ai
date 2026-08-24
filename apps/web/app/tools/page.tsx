'use client'

import { useState } from 'react'
import {
  Eraser,
  Image as ImageIcon,
  Maximize2,
  Scissors,
  Sparkles,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

import { GenerationCard } from '@/components/generation-card'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useGenerations, useRunTool } from '@/hooks/use-warung'

interface Tool {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  needsPrompt: boolean
}

const TOOLS: Tool[] = [
  {
    slug: 'image-generator',
    name: 'Generator Gambar',
    description: 'Buat gambar diam sinematik dari deskripsi teks.',
    icon: ImageIcon,
    needsPrompt: true,
  },
  {
    slug: 'image-to-video',
    name: 'Gambar ke Video',
    description: 'Hidupkan gambar diam menjadi klip bergerak.',
    icon: Video,
    needsPrompt: true,
  },
  {
    slug: 'extend-video',
    name: 'Perpanjang Video',
    description: 'Tambah durasi klip dengan lanjutan yang menyatu.',
    icon: Sparkles,
    needsPrompt: false,
  },
  {
    slug: 'remove-background',
    name: 'Hapus Latar',
    description: 'Pisahkan subjek dari latar belakangnya.',
    icon: Eraser,
    needsPrompt: false,
  },
  {
    slug: 'upscale-media',
    name: 'Tingkatkan Resolusi',
    description: 'Perbesar gambar atau video tanpa kehilangan detail.',
    icon: Maximize2,
    needsPrompt: false,
  },
  {
    slug: 'frame-extractor',
    name: 'Ambil Bingkai',
    description: 'Ekstrak bingkai kunci dari sebuah video.',
    icon: Scissors,
    needsPrompt: false,
  },
]

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [prompt, setPrompt] = useState('')

  const runTool = useRunTool()
  const { data } = useGenerations()

  const toolRuns = (data?.generations ?? []).filter((item) => item.type === 'TOOL').slice(0, 6)

  async function run(tool: Tool) {
    if (tool.needsPrompt && !prompt.trim()) {
      setActiveTool(tool)
      toast.error('Tulis deskripsi terlebih dahulu')
      return
    }

    try {
      await runTool.mutateAsync({ tool: tool.slug, prompt: prompt.trim() || undefined })
      toast.success(`${tool.name} dijalankan`)
      setPrompt('')
      setActiveTool(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menjalankan alat')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Utilitas"
        title="Alat"
        description="Alat mandiri untuk tugas cepat di luar alur produksi utama."
      />

      <div className="flex flex-col gap-8 px-4 py-6 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool?.slug === tool.slug

            return (
              <div
                key={tool.slug}
                className={`flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors ${
                  isActive ? 'border-primary' : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded border border-border bg-muted">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <h2 className="text-sm font-medium">{tool.name}</h2>
                </div>

                <p className="flex-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>

                {isActive && tool.needsPrompt && (
                  <Textarea
                    rows={3}
                    autoFocus
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Jelaskan hasil yang Anda inginkan…"
                    aria-label={`Deskripsi untuk ${tool.name}`}
                  />
                )}

                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  disabled={runTool.isPending}
                  onClick={() => {
                    if (tool.needsPrompt && !isActive) {
                      setActiveTool(tool)
                      return
                    }
                    run(tool)
                  }}
                >
                  {isActive || !tool.needsPrompt ? 'Jalankan' : 'Pilih'}
                </Button>
              </div>
            )
          })}
        </div>

        {toolRuns.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Riwayat alat
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {toolRuns.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
