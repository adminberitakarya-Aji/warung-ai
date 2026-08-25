import { Worker } from 'bullmq'
import dotenv from 'dotenv'
import { redisConnection } from './redis'
import {
  GENERATION_QUEUE_NAME,
  REFINEMENT_QUEUE_NAME,
  MEDIA_QUEUE_NAME,
} from './queues'
import { processGenerationJob } from './processors/generation.processor'
import { processRefinementJob } from './processors/refinement.processor'
import { processMediaJob } from './processors/media.processor'

dotenv.config()

async function startWorkers() {
  console.log('⚡ Menjalankan WarungAI Background Worker Service...')

  const generationWorker = new Worker(
    GENERATION_QUEUE_NAME,
    processGenerationJob,
    {
      connection: redisConnection,
      concurrency: 5,
    },
  )

  const refinementWorker = new Worker(
    REFINEMENT_QUEUE_NAME,
    processRefinementJob,
    {
      connection: redisConnection,
      concurrency: 3,
    },
  )

  const mediaWorker = new Worker(
    MEDIA_QUEUE_NAME,
    processMediaJob,
    {
      connection: redisConnection,
      concurrency: 2,
    },
  )

  generationWorker.on('completed', (job) => {
    console.log(`🎉 [GenerationWorker] Job ${job.id} selesai!`)
  })

  generationWorker.on('failed', (job, err) => {
    console.error(`💥 [GenerationWorker] Job ${job?.id} gagal: ${err.message}`)
  })

  console.log('🚀 Worker aktif dan siap memproses antrean job!')

  // Graceful shutdown
  const shutdown = async () => {
    console.log('🛑 Menghentikan workers secara aman...')
    await generationWorker.close()
    await refinementWorker.close()
    await mediaWorker.close()
    await redisConnection.quit()
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

startWorkers().catch((err) => {
  console.error('❌ Gagal menjalankan workers:', err)
  process.exit(1)
})
