'use client'

import { useState } from 'react'
import { Bell, Info, Mail, Volume2, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function SettingsNotificationsPage() {
  const [emailOnComplete, setEmailOnComplete] = useState(true)
  const [soundAlert, setSoundAlert] = useState(true)
  const [lowCreditAlert, setLowCreditAlert] = useState(true)
  const [productUpdates, setProductUpdates] = useState(false)

  function save() {
    toast.success('Preferensi notifikasi berhasil disimpan')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notifikasi Generasi & Render</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px]">
              Klien & Email
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Atur bagaimana Anda ingin diberitahu saat pemrosesan video atau batch gambar selesai.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Kirim Email Saat Render Selesai</span>
                <span className="text-[11px] text-muted-foreground">
                  Kirim ringkasan dan tautan unduhan langsung ke email saat generasi video berdurasi panjang rampung.
                </span>
              </div>
            </div>
            <Switch
              checked={emailOnComplete}
              onCheckedChange={setEmailOnComplete}
              aria-label="Toggle email saat render selesai"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div className="flex items-start gap-3">
              <Volume2 className="mt-0.5 size-4 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Suara Pemberitahuan di Browser</span>
                <span className="text-[11px] text-muted-foreground">
                  Bunyikan nada halus di tab browser saat antrean pembuatan media mencapai 100%.
                </span>
              </div>
            </div>
            <Switch
              checked={soundAlert}
              onCheckedChange={setSoundAlert}
              aria-label="Toggle suara pemberitahuan"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Peringatan Kuota & Sistem</CardTitle>
          <CardDescription className="text-xs">
            Informasi penting terkait kapasitas kredit dan pembaruan platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 size-4 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Peringatan Kuota Kredit Menipis</span>
                <span className="text-[11px] text-muted-foreground">
                  Tampilkan peringatan saat sisa kuota kredit generasi berada di bawah 15 kredit.
                </span>
              </div>
            </div>
            <Switch
              checked={lowCreditAlert}
              onCheckedChange={setLowCreditAlert}
              aria-label="Toggle peringatan kuota kredit"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 size-4 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Berita Fitur & Model AI Baru</span>
                <span className="text-[11px] text-muted-foreground">
                  Dapatkan buletin tentang peluncuran model generative vision & motion terbaru.
                </span>
              </div>
            </div>
            <Switch
              checked={productUpdates}
              onCheckedChange={setProductUpdates}
              aria-label="Toggle berita fitur baru"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="size-4 text-primary shrink-0" />
            <span>
              Preferensi tersimpan — notifikasi aktual menyusul setelah backend notification service tersedia.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={save}>Simpan Pengaturan Notifikasi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
