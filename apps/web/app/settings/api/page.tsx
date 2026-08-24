'use client'

import { Code2, Key, Lock, Sparkles, Terminal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsApiPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-primary/[0.02]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-primary" />
              <CardTitle className="text-base">Kunci API & Akses Pengembang</CardTitle>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px] uppercase">
              Belum Tersedia
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Integrasikan pipeline pembuatan video dan generasi karakter WarungAI langsung ke aplikasi atau skrip eksternal Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-medium">Akses API Sedang Dalam Pengembangan</h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              Fitur manajemen API Key, webhooks generasi media, dan token akses SDK TypeScript/Python
              akan hadir pada fase integrasi backend dan AI provider berikutnya sesuai roadmap spec (§6 & §10).
            </p>
            <Button variant="outline" size="sm" disabled className="mt-4">
              Buat Kunci API Baru (Segera Hadir)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <CardTitle className="text-base">Pratinjau Endpoint Mendatang</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Dokumentasi rute API yang akan dapat diakses secara terprogram (§10 spec).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 rounded-md bg-muted/60 p-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                POST
              </span>
              <span>/api/v1/generations</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                GET
              </span>
              <span>/api/v1/generations/:id</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                POST
              </span>
              <span>/api/v1/refinements</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
