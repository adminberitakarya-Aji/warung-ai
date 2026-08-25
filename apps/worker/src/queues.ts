import { Queue } from 'bullmq'
import { redisConnection } from './redis'

export interface GenerationJobPayload {
  generationId: string
  userId: string
  projectId?: string | null
  sceneId?: string | null
  type: 'IMAGE' | 'VIDEO' | 'REFINEMENT' | 'TOOL'
  model: string
  prompt: string
  parameters?: Record<string, unknown>
}

export interface RefinementJobPayload {
  generationId: string
  userId: string
  sourceAssetId: string
  instruction: string
  tags?: string[]
}

export interface MediaJobPayload {
  taskId: string
  operation: 'stitch_video' | 'extract_frame' | 'merge_audio' | 'upscale'
  inputUrls: string[]
  outputFormat?: string
}

export const GENERATION_QUEUE_NAME = 'warungai-generations'
export const REFINEMENT_QUEUE_NAME = 'warungai-refinements'
export const MEDIA_QUEUE_NAME = 'warungai-media'

export const generationQueue = new Queue<GenerationJobPayload>(GENERATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

export const refinementQueue = new Queue<RefinementJobPayload>(REFINEMENT_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

export const mediaQueue = new Queue<MediaJobPayload>(MEDIA_QUEUE_NAME, {
  connection: redisConnection,
})
