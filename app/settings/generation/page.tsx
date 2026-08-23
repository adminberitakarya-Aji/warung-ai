'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

export default function SettingsGenerationPage() {
  const { data, isLoading } = useSession()
  const activeModelId = useWorkspaceStore((s) => s.activeModelId)
  const setActiveModelId = useWorkspaceStore((s) => s.setActiveModelId)

  const user = data?.user
  const models = data?.models ?? []

  const totalCredits = user ? user.credits + user.creditsUsed : 0
  const usedPercent = totalCredits > 0 ? Math.round(((user?.creditsUsed ?? 0) / totalCredits) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Credit Quota & Usage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Kuota Kredit Generasi</CardTitle>
            {user && (
              <Badge variant="outline" className="font-mono text-xs">
                {user.plan}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Kredit digunakan setiap kali Anda menghasilkan gambar atau merender klip video.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !user ? (
            <Skeleton className="h-20" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                    {user.credits}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">kredit tersisa</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {user.creditsUsed} / {totalCredits} terpakai ({usedPercent}%)
                </span>
              </div>
              <Progress value={usedPercent} className="h-2" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Generasi gambar membutuhkan 1–2 kredit, sedangkan video 5–10 detik membutuhkan 8–14 kredit
                tergantung resolusi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Model Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Model Bawaan Studio</CardTitle>
          <CardDescription className="text-xs">
            Model yang akan otomatis terpilih saat Anda membuka halaman Buat Adegan atau Studio Cepat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {models.map((model) => {
                const isActive = activeModelId === model.id
                return (
                  <div
                    key={model.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{model.label}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {model.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {model.credits} kredit
                      </span>
                      {isActive ? (
                        <Badge variant="default" className="text-[11px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setActiveModelId(model.id)}
                        >
                          Pilih
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
