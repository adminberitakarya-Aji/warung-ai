'use client'

import { Check } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/hooks/use-warung'
import type { Plan } from '@/lib/types'

const PLANS: Array<{
  id: Plan
  name: string
  price: string
  credits: string
  features: string[]
}> = [
  {
    id: 'FREE',
    name: 'Gratis',
    price: 'Rp 0',
    credits: '100 kredit / bulan',
    features: ['Generasi gambar', 'Generasi video 5s', 'Watermark WarungAI'],
  },
  {
    id: 'CREATOR',
    name: 'Kreator',
    price: 'Rp 149rb',
    credits: '2.000 kredit / bulan',
    features: [
      'Semua fitur Gratis',
      'Video hingga 10s, 1080p',
      'Konsistensi karakter',
      'Tanpa watermark',
    ],
  },
  {
    id: 'STUDIO',
    name: 'Studio',
    price: 'Rp 599rb',
    credits: '10.000 kredit / bulan',
    features: [
      'Semua fitur Kreator',
      'Antrean prioritas',
      'Ekspor storyboard',
      'Kolaborasi tim',
    ],
  },
]

export default function PlanPage() {
  const { data, isLoading } = useSession()
  const user = data?.user

  const quota = user ? user.credits + user.creditsUsed : 0
  const usedPercent = user && quota > 0 ? Math.round((user.creditsUsed / quota) * 100) : 0

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Langganan"
        title="Paket Anda"
        description="Kelola kuota kredit dan tingkatkan paket saat produksi Anda membutuhkan lebih banyak."
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 md:px-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Penggunaan</h2>
          {isLoading || !user ? (
            <Skeleton className="h-28 rounded-lg" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Kredit terpakai
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    Paket {user.plan}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Kredit direset setiap awal siklus penagihan.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between font-mono text-sm tabular-nums">
                  <span>
                    {user.creditsUsed} / {quota}
                  </span>
                  <span className="text-muted-foreground">{usedPercent}%</span>
                </div>
                <Progress value={usedPercent} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  Sisa {user.credits} kredit — cukup untuk sekitar{' '}
                  {Math.floor(user.credits / 8)} generasi video.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Pilihan paket</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const current = user?.plan === plan.id
              return (
                <Card
                  key={plan.id}
                  className={current ? 'border-primary/60 bg-primary/[0.04]' : undefined}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      {plan.name}
                      {current && (
                        <Badge variant="secondary" className="text-[10px]">
                          Aktif
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.credits}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="font-mono text-2xl font-semibold tracking-tight">
                      {plan.price}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">/bln</span>
                    </p>
                    <ul className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed">
                          <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={current ? 'outline' : plan.id === 'CREATOR' ? 'default' : 'outline'}
                      disabled={current}
                      className="w-full"
                    >
                      {current ? 'Paket aktif' : 'Tingkatkan'}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
