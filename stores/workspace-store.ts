'use client'

// Client-only workspace UI state. Server data lives in TanStack Query.

import { create } from 'zustand'

import type { AspectRatio, GenerationType } from '@/lib/types'

interface WorkspaceState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  newProjectOpen: boolean
  activeProjectId: string
  activeModelId: string
  activeGenerationId: string | null
  createDraft: {
    type: Extract<GenerationType, 'IMAGE' | 'VIDEO'>
    prompt: string
    aspectRatio: AspectRatio
    duration: number
    characterIds: string[]
  }
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  setNewProjectOpen: (open: boolean) => void
  setActiveProjectId: (id: string) => void
  setActiveModelId: (id: string) => void
  setActiveGenerationId: (id: string | null) => void
  patchCreateDraft: (patch: Partial<WorkspaceState['createDraft']>) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  newProjectOpen: false,
  activeProjectId: 'prj_1',
  activeModelId: 'warung-motion-2',
  activeGenerationId: null,
  createDraft: {
    type: 'VIDEO',
    prompt: '',
    aspectRatio: '16:9',
    duration: 5,
    characterIds: [],
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setNewProjectOpen: (open) => set({ newProjectOpen: open }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveModelId: (id) => set({ activeModelId: id }),
  setActiveGenerationId: (id) => set({ activeGenerationId: id }),
  patchCreateDraft: (patch) =>
    set((state) => ({ createDraft: { ...state.createDraft, ...patch } })),
}))
