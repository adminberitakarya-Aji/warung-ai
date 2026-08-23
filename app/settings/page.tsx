'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession, useUpdateAccount } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

const PLAN_LABEL: Record<string, string> = {
  FREE: 'Gratis',
  PRO: 'Pro',
  STUDIO: 'Studio',
}

export default function SettingsPage() {
  const { data, isLoading } = useSession()
  const update = useUpdateAccount()

  const activeModelId = useWorkspaceStore((s) => s.activeModelId)
  const setActiveModelId = useWorkspaceStore((s) => s.setActiveModelId)

  const user = data?.user
  const models = data?.models ?? []

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
  }, [user?.name, user?.email])

  const totalCredits = user ? user.credits + user.creditsUsed : 0
  const usedPercent = totalCredits > 0 ? ((user?.creditsUsed ?? 0) / totalCredits) * 100 : 0

  async function save() {
    if (!name.trim() || !email.includes('@')) {
      toast.error('Nama dan email harus valid')
      return
    }

    try {
      await update.mutateAsync({ name: name.trim(), email: email.trim() })
      toast.success('Profil disimpan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan profil')
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Akun"
        title="Pengaturan"
        description="Kelola profil, kuota kredit, dan model generasi bawaan Anda."
      />

      <div className="flex max-w-3xl flex-col gap-8 px-4 py-6 md:px-8">
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Profil</h2>
            {user && <Badge variant="secondary">{PLAN_LABEL[user.plan] ?? user.plan}</Badge>}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="account-name">Nama</FieldLabel>
                <Input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="account-email">Email</FieldLabel>
                <Input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <FieldDescription>
                  Digunakan untuk notifikasi hasil generasi.
                </FieldDescription>
              </Field>
            </FieldGroup>
          )}

          <div className="flex justify-end">
            <Button onClick={save} disabled={isLoading || update.isPending}>
              Simpan perubahan
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Kredit</h2>

          {isLoading || !user ? (
            <Skeleton className="h-16" />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <span className="font-mono text-2xl tabular-nums">{user.credits}</span>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {user.creditsUsed} / {totalCredits} terpakai
                </span>
              </div>
              <Progress value={usedPercent} />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Setiap generasi video menggunakan kredit lebih banyak daripada gambar diam.
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Model bawaan</h2>

          {isLoading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="flex flex-col">
              {models.map((model, index) => {
                const isActive = activeModelId === model.id
                return (
                  <div key={model.id} className="flex flex-col">
                    {index > 0 && <Separator />}
                    <button
                      type="button"
                      onClick={() => setActiveModelId(model.id)}
                      aria-pressed={isActive}
                      className="flex items-center justify-between gap-4 py-3 text-left"
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm">{model.label}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {model.type}
                          </Badge>
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {model.credits} kredit
                        </span>
                      </span>
                      {isActive ? (
                        <Badge>Aktif</Badge>
                      ) : (
                        <span className="font-mono text-[11px] text-muted-foreground">Pilih</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
