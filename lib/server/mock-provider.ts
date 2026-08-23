// Mock generation provider.
//
// Stands in for the queue + worker + Python AI service described in the spec.
// Progress is derived from elapsed wall-clock time rather than a timer, so the
// simulated lifecycle survives module reloads and concurrent requests.
//
// The UI never imports this file — it only ever talks to /api/v1.

import { db, newId } from '@/lib/server/db'
import type {
  Asset,
  CreateGenerationInput,
  Generation,
  GenerationParameters,
} from '@/lib/types'

const QUEUE_MS = 1_200

const RESULT_POOL = [
  '/scenes/scene-01.svg',
  '/scenes/scene-02.svg',
  '/scenes/scene-03.svg',
  '/scenes/scene-04.svg',
  '/scenes/scene-05.svg',
  '/scenes/scene-06.svg',
]

interface MockRuntime {
  startedAt: number
  totalMs: number
  resultUrl: string
}

const runtimes = new Map<string, MockRuntime>()

function durationFor(type: Generation['type'], parameters: GenerationParameters) {
  if (type === 'VIDEO') return 9_000 + (parameters.duration ?? 5) * 300
  if (type === 'REFINEMENT') return 6_000
  if (type === 'TOOL') return 5_000
  return 7_000
}

function pickResult(prompt: string) {
  const index = Math.abs(hash(prompt)) % RESULT_POOL.length
  return RESULT_POOL[index]
}

function hash(value: string) {
  let out = 0
  for (let i = 0; i < value.length; i += 1) {
    out = (out << 5) - out + value.charCodeAt(i)
    out |= 0
  }
  return out
}

export function createGeneration(input: CreateGenerationInput): Generation {
  const timestamp = new Date().toISOString()
  const parameters = input.parameters ?? {}

  const generation: Generation = {
    id: newId('gen'),
    userId: db.user.id,
    projectId: input.projectId ?? 'prj_1',
    sceneId: input.sceneId ?? null,
    type: input.type,
    provider: 'mock',
    model: input.model,
    prompt: input.prompt,
    parameters,
    status: 'QUEUED',
    progress: 0,
    resultAssetId: null,
    resultAsset: null,
    error: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  runtimes.set(generation.id, {
    startedAt: Date.now(),
    totalMs: durationFor(input.type, parameters),
    resultUrl: pickResult(input.prompt),
  })

  db.generations.unshift(generation)

  if (generation.sceneId) {
    const scene = db.scenes.find((item) => item.id === generation.sceneId)
    if (scene) {
      scene.status = 'QUEUED'
      scene.updatedAt = timestamp
    }
  }

  return advance(generation)
}

function completeAsset(generation: Generation, runtime: MockRuntime): Asset {
  // The mock provider renders a still frame for every job, so a VIDEO asset is
  // represented by its poster frame until a real generation backend is wired in.
  const asset: Asset = {
    id: newId('ast'),
    userId: generation.userId,
    projectId: generation.projectId,
    name: generation.prompt.slice(0, 48) || 'Hasil generasi',
    type: generation.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    url: runtime.resultUrl,
    thumbnailUrl: runtime.resultUrl,
    mimeType: 'image/svg+xml',
    width: 1920,
    height: 1080,
    duration: generation.type === 'VIDEO' ? (generation.parameters.duration ?? 5) : null,
    metadata: { model: generation.model, provider: generation.provider },
    createdAt: new Date().toISOString(),
  }

  db.assets.unshift(asset)
  return asset
}

/** Recomputes the simulated lifecycle for a generation and persists the result. */
export function advance(generation: Generation): Generation {
  if (
    generation.status === 'COMPLETED' ||
    generation.status === 'FAILED' ||
    generation.status === 'CANCELLED'
  ) {
    return generation
  }

  const runtime = runtimes.get(generation.id)
  if (!runtime) {
    generation.status = 'COMPLETED'
    generation.progress = 100
    return generation
  }

  const elapsed = Date.now() - runtime.startedAt

  if (elapsed < QUEUE_MS) {
    generation.status = 'QUEUED'
    generation.progress = 0
    return generation
  }

  const ratio = (elapsed - QUEUE_MS) / runtime.totalMs

  if (ratio < 1) {
    generation.status = 'PROCESSING'
    generation.progress = Math.min(99, Math.round(ratio * 100))
    generation.updatedAt = new Date().toISOString()

    if (generation.sceneId) {
      const scene = db.scenes.find((item) => item.id === generation.sceneId)
      if (scene) scene.status = 'GENERATING'
    }

    return generation
  }

  const asset = completeAsset(generation, runtime)
  generation.status = 'COMPLETED'
  generation.progress = 100
  generation.resultAssetId = asset.id
  generation.resultAsset = asset
  generation.updatedAt = new Date().toISOString()
  runtimes.delete(generation.id)

  const cost = 2
  db.user.creditsUsed = Math.min(db.user.credits, db.user.creditsUsed + cost)

  if (generation.sceneId) {
    const scene = db.scenes.find((item) => item.id === generation.sceneId)
    if (scene) {
      scene.status = 'READY'
      scene.currentAssetId = asset.id
      scene.updatedAt = generation.updatedAt
    }
  }

  return generation
}

export function getGeneration(id: string): Generation | undefined {
  const generation = db.generations.find((item) => item.id === id)
  if (!generation) return undefined
  return advance(generation)
}

export function listGenerations(): Generation[] {
  return db.generations.map(advance)
}

export function cancelGeneration(id: string): Generation | undefined {
  const generation = db.generations.find((item) => item.id === id)
  if (!generation) return undefined

  if (generation.status === 'QUEUED' || generation.status === 'PROCESSING') {
    generation.status = 'CANCELLED'
    generation.updatedAt = new Date().toISOString()
    runtimes.delete(generation.id)

    if (generation.sceneId) {
      const scene = db.scenes.find((item) => item.id === generation.sceneId)
      if (scene) scene.status = scene.currentAssetId ? 'READY' : 'EMPTY'
    }
  }

  return generation
}
