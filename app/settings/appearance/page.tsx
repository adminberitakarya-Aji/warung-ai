'use client'

import { useState } from 'react'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const THEMES = [
  {
    id: 'dark',
    name: 'Gelap Sinematik',
    description: 'Tema gelap khas studio film dengan kontras tinggi (Bawaan).',
    icon: Moon,
  },
  {
    id: 'light',
    name: 'Terang',
    description: 'Tampilan terang untuk lingkungan pencahayaan tinggi.',
    icon: Sun,
  },
  {
    id: 'system',
    name: 'Sistem',
    description: 'Menyesuaikan otomatis dengan preferensi sistem operasi.',
    icon: Monitor,
  },
]

export default function SettingsAppearancePage() {
  const [selectedTheme, setSelectedTheme] = useState('dark')
  const [density, setDensity] = useState<'standard' | 'compact'>('standard')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highQualityPreview, setHighQualityPreview] = useState(true)

  function save() {
    toast.success('Preferensi tampilan berhasil disimpan')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Tema Antarmuka</CardTitle>
          <CardDescription className="text-xs">
            Pilih skema warna antarmuka ruang kerja WarungAI (§28 Dark Cinematic).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {THEMES.map((theme) => {
              const active = selectedTheme === theme.id
              const Icon = theme.icon

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/[0.04]'
                      : 'border-border bg-card hover:border-muted-foreground/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={cn('size-4', active ? 'text-primary' : 'text-muted-foreground')} />
                    {active && (
                      <Badge variant="secondary" className="font-mono text-[9px]">
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{theme.name}</span>
                    <span className="text-[11px] leading-relaxed text-muted-foreground">
                      {theme.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Preferensi Kanvas & Layout</CardTitle>
          <CardDescription className="text-xs">
            Sesuaikan kenyamanan visual dan kinerja render media di browser Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">Pratinjau Kualitas Penuh (1080p)</span>
              <span className="text-[11px] text-muted-foreground">
                Tampilkan hasil video dan still image dalam resolusi native tanpa kompresi cepat.
              </span>
            </div>
            <Switch
              checked={highQualityPreview}
              onCheckedChange={setHighQualityPreview}
              aria-label="Toggle pratinjau kualitas penuh"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">Kurangi Gerakan & Animasi</span>
              <span className="text-[11px] text-muted-foreground">
                Minimalkan transisi animasi antar-halaman untuk pengalaman yang lebih hemat daya.
              </span>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              aria-label="Toggle reduksi gerakan"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">Kerapatan Ruang Kerja</span>
              <span className="text-[11px] text-muted-foreground">
                Atur margin dan padding pada panel storyboard dan daftar aset.
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted p-1">
              <Button
                variant={density === 'standard' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setDensity('standard')}
              >
                Standar
              </Button>
              <Button
                variant={density === 'compact' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setDensity('compact')}
              >
                Kompak
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={save}>Simpan Pengaturan Tampilan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
