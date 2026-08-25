import { Job } from 'bullmq'
import type { MediaJobPayload } from '../queues'

export async function processMediaJob(job: Job<MediaJobPayload>) {
  const { taskId, operation, inputUrls } = job.data

  console.log(`🎞️ [Worker] Memproses task media ${taskId} (${operation}) dengan ${inputUrls.length} file`)

  // Stub media pipeline (will connect to Python FastAPI service in Phase 6)
  await job.updateProgress(50)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  await job.updateProgress(100)

  console.log(`✅ [Worker] Task media ${taskId} selesai.`)
  return { success: true, taskId }
}
