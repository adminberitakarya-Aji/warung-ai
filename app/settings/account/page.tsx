'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession, useUpdateAccount } from '@/hooks/use-warung'

const PLAN_LABEL: Record<string, string> = {
  FREE: 'Gratis',
  CREATOR: 'Kreator',
  STUDIO: 'Studio',
}

export default function SettingsAccountPage() {
  const { data, isLoading } = useSession()
  const update = useUpdateAccount()

  const user = data?.user
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
  }, [user?.name, user?.email])

  async function save() {
    if (!name.trim() || !email.includes('@')) {
      toast.error('Nama dan email harus valid')
      return
    }

    try {
      await update.mutateAsync({ name: name.trim(), email: email.trim() })
      toast.success('Profil akun berhasil diperbarui')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan profil')
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">Profil Pengguna</CardTitle>
            <CardDescription className="text-xs">
              Informasi identitas akun yang digunakan untuk proyek dan workspace studio.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            Paket {PLAN_LABEL[user.plan] ?? user.plan}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-name">Nama Lengkap</FieldLabel>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda..."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-email">Alamat Email</FieldLabel>
              <Input
                id="account-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
              />
              <FieldDescription>
                Digunakan untuk notifikasi penyelesaian render dan penagihan.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={update.isPending || !name.trim()}>
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
