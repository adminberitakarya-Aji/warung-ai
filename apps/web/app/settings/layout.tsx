'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Key, Palette, Sliders, User } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  {
    href: '/settings/account',
    label: 'Akun',
    description: 'Profil & info penagihan',
    icon: User,
  },
  {
    href: '/settings/appearance',
    label: 'Tampilan',
    description: 'Tema, kontras & tata letak',
    icon: Palette,
  },
  {
    href: '/settings/generation',
    label: 'Generasi',
    description: 'Kredit & model bawaan',
    icon: Sliders,
  },
  {
    href: '/settings/notifications',
    label: 'Notifikasi',
    description: 'Pemberitahuan render & email',
    icon: Bell,
  },
  {
    href: '/settings/api',
    label: 'API',
    description: 'Kunci akses & integrasi SDK',
    icon: Key,
  },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col pb-16">
      <PageHeader
        eyebrow="Preferensi"
        title="Pengaturan"
        description="Kelola akun, preferensi visual, kuota generasi model, dan integrasi workspace Anda."
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 md:flex-row md:px-8">
        {/* Left Sub-nav Column */}
        <aside className="w-full shrink-0 md:w-56">
          <nav
            aria-label="Navigasi Pengaturan"
            className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0"
          >
            {SETTINGS_NAV.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap md:text-sm',
                    active
                      ? 'bg-accent text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Right Content Column */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
