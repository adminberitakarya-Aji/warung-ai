import { Queue } from 'bullmq'
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let redisClient: Redis | null = null
let generationQueue: Queue | null = null
let refinementQueue: Queue | null = null

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 2000,
  })

  redisClient.on('error', () => {
    // Silent fail in dev if Redis is not running
  })

  generationQueue = new Queue('warungai-generations', { connection: redisClient })
  refinementQueue = new Queue('warungai-refinements', { connection: redisClient })
} catch {
  // Graceful fallback
}

export async function dispatchGenerationJob(payload: {
  generationId: string
  userId: string
  projectId?: string | null
  sceneId?: string | null
  type: 'IMAGE' | 'VIDEO' | 'REFINEMENT' | 'TOOL'
  model: string
  prompt: string
  parameters?: Record<string, unknown>
}) {
  try {
    if (generationQueue) {
      await generationQueue.add('generate', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      })
      console.log(`📡 [API] Job ${payload.generationId} dikirim ke antrean BullMQ`)
    }
  } catch (err) {
    console.warn(`⚠️ [API] Redis tidak aktif, job ${payload.generationId} tetap tersimpan di database`)
  }
}

export async function dispatchRefinementJob(payload: {
  generationId: string
  userId: string
  sourceAssetId: string
  instruction: string
  tags?: string[]
}) {
  try {
    if (refinementQueue) {
      await refinementQueue.add('refine', payload)
      console.log(`📡 [API] Job refinement ${payload.generationId} dikirim ke antrean BullMQ`)
    }
  } catch {
    // Silent fallback
  }
}
