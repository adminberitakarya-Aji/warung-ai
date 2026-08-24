import {
  Clapperboard,
  Film,
  House,
  Images,
  Settings,
  Sparkles,
  Users,
  Wand,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const primaryNav: NavItem[] = [
  { href: '/', label: 'Beranda', icon: House },
  { href: '/plan', label: 'Paket', icon: Sparkles },
  { href: '/characters', label: 'Karakter', icon: Users },
  { href: '/assets', label: 'Aset', icon: Images },
  { href: '/create', label: 'Buat', icon: Wand },
  { href: '/storyboard', label: 'Storyboard', icon: Clapperboard },
  { href: '/refine', label: 'Perbaiki', icon: Film },
]

export const secondaryNav: NavItem[] = [
  { href: '/tools', label: 'Alat', icon: Wrench },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
]

