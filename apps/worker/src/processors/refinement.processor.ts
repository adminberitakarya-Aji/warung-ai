import { Job } from 'bullmq'
import { prisma } from '@warungai/database'
import type { RefinementJobPayload } from '../queues'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processRefinementJob(job: Job<RefinementJobPayload>) {
  const { generationId, userId, instruction, tags } = job.data

  console.log(`🎨 [Worker] Memproses job refinement ${generationId} (${instruction})`)

  try {
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING', progress: 20 },
    })
    await sleep(1500)

    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'GENERATING', progress: 60 },
    })
    await sleep(2000)

    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING_MEDIA', progress: 85 },
    })
    await sleep(1000)

    const resultAsset = await prisma.asset.create({
      data: {
        userId,
        name: `Refine: ${instruction.slice(0, 30)}`,
        type: 'IMAGE',
        url: '/scenes/scene-03.svg',
        thumbnailUrl: '/scenes/scene-03.svg',
        mimeType: 'image/png',
        width: 1920,
        height: 1080,
        metadata: { tags: (tags || []).join(',') },
      },
    })

    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultAssetId: resultAsset.id,
      },
    })

    console.log(`✅ [Worker] Refinement job ${generationId} selesai. Asset: ${resultAsset.id}`)
  } catch (error) {
    console.error(`❌ [Worker] Refinement job ${generationId} gagal:`, error)
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Refinement gagal',
      },
    })
    throw error
  }
}
