// Shared domain types. These mirror the data model in the spec and are the
// contract between the UI and the /api/v1 layer. When the real TypeScript API
// replaces the route handlers, only the transport changes — not these types.

export type Plan = 'FREE' | 'CREATOR' | 'STUDIO'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  plan: Plan
  credits: number
  creditsUsed: number
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface Project {
  id: string
  userId: string
  title: string
  description: string
  thumbnailAssetId: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export type SceneStatus = 'EMPTY' | 'QUEUED' | 'GENERATING' | 'READY' | 'FAILED'

export interface Scene {
  id: string
  projectId: string
  title: string
  order: number
  prompt: string
  duration: number
  aspectRatio: AspectRatio
  camera: string
  shotType: string
  lighting: string
  style: string
  status: SceneStatus
  currentAssetId: string | null
  createdAt: string
  updatedAt: string
}

export interface Character {
  id: string
  userId: string
  name: string
  role: string
  description: string
  appearance: string
  clothing: string
  personality: string
  referenceAssetIds: string[]
  createdAt: string
  updatedAt: string
}

export type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'REFERENCE'

export interface Asset {
  id: string
  userId: string
  projectId: string | null
  name: string
  type: AssetType
  url: string
  thumbnailUrl: string
  mimeType: string
  width: number | null
  height: number | null
  duration: number | null
  metadata: Record<string, string | number>
  createdAt: string
}

export type GenerationType = 'IMAGE' | 'VIDEO' | 'REFINEMENT' | 'TOOL'

export type GenerationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export type AspectRatio = '16:9' | '9:16' | '1:1'

export interface GenerationParameters {
  aspectRatio?: AspectRatio
  duration?: number
  referenceAssetIds?: string[]
  characterIds?: string[]
  refinementTags?: string[]
  tool?: string
  [key: string]: unknown
}

export interface Generation {
  id: string
  userId: string
  projectId: string | null
  sceneId: string | null
  type: GenerationType
  provider: string
  model: string
  prompt: string
  parameters: GenerationParameters
  status: GenerationStatus
  progress: number
  resultAssetId: string | null
  resultAsset: Asset | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export interface GenerationModel {
  id: string
  label: string
  type: 'IMAGE' | 'VIDEO'
  description: string
  credits: number
}

export interface CreateGenerationInput {
  type: GenerationType
  prompt: string
  model: string
  projectId?: string | null
  sceneId?: string | null
  parameters?: GenerationParameters
}
