// Thin transport layer over the /api/v1 REST surface.
// The UI only ever calls these functions — never the mock provider directly.

import type {
  Asset,
  AssetType,
  Character,
  CharacterReference,
  CreateGenerationInput,
  Generation,
  GenerationModel,
  GenerationParameters,
  Project,
  Scene,
  User,
} from '@/lib/types'

export interface SceneWithAsset extends Scene {
  currentAsset: Asset | null
}

export interface CharacterReferenceWithAsset extends CharacterReference {
  asset: Asset
}

export interface CharacterWithReferences extends Character {
  references: CharacterReferenceWithAsset[]
}

export interface ProjectWithMeta extends Project {
  thumbnailUrl: string | null
  sceneCount: number
  totalDuration: number
}

const BASE = '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json', ...init?.headers } : init?.headers,
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? `Permintaan gagal (${response.status})`)
  }

  return (await response.json()) as T
}

export const api = {
  getSession: () => request<{ user: User; models: GenerationModel[] }>('/me'),

  updateAccount: (body: { name?: string; email?: string }) =>
    request<{ user: User }>('/me', { method: 'PATCH', body: JSON.stringify(body) }),

  listProjects: () => request<{ projects: ProjectWithMeta[] }>('/projects'),

  createProject: (body: { title: string; description?: string }) =>
    request<{ project: ProjectWithMeta }>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteProject: (id: string) => request<{ ok: true }>(`/projects/${id}`, { method: 'DELETE' }),

  listScenes: (projectId: string) =>
    request<{ scenes: SceneWithAsset[] }>(`/projects/${projectId}/scenes`),

  createScene: (projectId: string, body: { title?: string; prompt?: string; duration?: number }) =>
    request<{ scene: SceneWithAsset }>(`/projects/${projectId}/scenes`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateScene: (id: string, body: Partial<Scene>) =>
    request<{ scene: SceneWithAsset }>(`/scenes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteScene: (id: string) => request<{ ok: true }>(`/scenes/${id}`, { method: 'DELETE' }),

  reorderScenes: (projectId: string, orderedIds: string[]) =>
    request<{ scenes: SceneWithAsset[] }>('/scenes/reorder', {
      method: 'POST',
      body: JSON.stringify({ projectId, orderedIds }),
    }),

  listCharacters: (query?: string) =>
    request<{ characters: CharacterWithReferences[] }>(
      `/characters${query ? `?q=${encodeURIComponent(query)}` : ''}`,
    ),

  getCharacter: (id: string) =>
    request<{ character: CharacterWithReferences }>(`/characters/${id}`),

  createCharacter: (body: Partial<Character>) =>
    request<{ character: CharacterWithReferences }>('/characters', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateCharacter: (id: string, body: Partial<Character>) =>
    request<{ character: CharacterWithReferences }>(`/characters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteCharacter: (id: string) => request<{ ok: true }>(`/characters/${id}`, { method: 'DELETE' }),

  listAssets: (options?: { query?: string; type?: AssetType | 'ALL' }) => {
    const params = new URLSearchParams()
    if (options?.query) params.set('q', options.query)
    if (options?.type && options.type !== 'ALL') params.set('type', options.type)
    const suffix = params.toString()
    return request<{ assets: Asset[] }>(`/assets${suffix ? `?${suffix}` : ''}`)
  },

  createAsset: (body: Partial<Asset>) =>
    request<{ asset: Asset }>('/assets', { method: 'POST', body: JSON.stringify(body) }),

  deleteAsset: (id: string) => request<{ ok: true }>(`/assets/${id}`, { method: 'DELETE' }),

  listGenerations: () => request<{ generations: Generation[] }>('/generations'),

  createGeneration: (body: CreateGenerationInput) =>
    request<{ generation: Generation }>('/generations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getGeneration: (id: string) => request<{ generation: Generation }>(`/generations/${id}`),

  cancelGeneration: (id: string) =>
    request<{ generation: Generation }>(`/generations/${id}/cancel`, { method: 'POST' }),

  createRefinement: (body: {
    prompt: string
    assetId?: string
    sceneId?: string | null
    refinementTags?: string[]
    model?: string
  }) =>
    request<{ generation: Generation }>('/refinements', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  runTool: (tool: string, body?: { prompt?: string; assetId?: string }) =>
    request<{ generation: Generation }>(`/tools/${tool}`, {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),
}

export type { GenerationParameters }
