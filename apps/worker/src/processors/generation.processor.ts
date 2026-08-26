import { Job } from 'bullmq'
import { prisma } from '@warungai/database'
import { aiClient } from '@warungai/ai-client'
import type { GenerationJobPayload } from '../queues'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processGenerationJob(job: Job<GenerationJobPayload>) {
  const { generationId, userId, projectId, sceneId, type, model, prompt } = job.data

  console.log(`🎬 [Worker] Memproses job generasi ${generationId} (${type} - ${model})`)

  const generation = await prisma.generation.findUnique({ where: { id: generationId } })
  if (!generation) {
    throw new Error(`Generation ${generationId} tidak ditemukan di database.`)
  }

  if (generation.status === 'CANCELLED') {
    console.log(`⏹️ [Worker] Job ${generationId} telah dibatalkan pengguna.`)
    return
  }

  try {
    // 1. QUEUED -> PROCESSING
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING', progress: 15 },
    })
    await job.updateProgress(15)
    await sleep(1500)

    // 2. PROCESSING -> GENERATING
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'GENERATING', progress: 45 },
    })
    await job.updateProgress(45)
    await sleep(2000)

    // Check cancellation
    const current = await prisma.generation.findUnique({ where: { id: generationId } })
    if (current?.status === 'CANCELLED') return

    // 3. GENERATING -> PROCESSING_MEDIA
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'PROCESSING_MEDIA', progress: 75 },
    })
    await job.updateProgress(75)
    await sleep(1500)

    // 4. PROCESSING_MEDIA -> UPLOADING
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'UPLOADING', progress: 90 },
    })
    await job.updateProgress(90)

    // 5. Call AI service (with graceful fallback if offline)
    const assetName = prompt.slice(0, 40) || `Hasil Generasi ${new Date().toLocaleTimeString('id-ID')}`
    let aiUrl = type === 'VIDEO' ? '/scenes/scene-01.svg' : '/scenes/scene-02.svg'
    let aiWidth = 1920
    let aiHeight = 1080
    let aiDuration: number | null = type === 'VIDEO' ? 5 : null

    try {
      const aiResult = type === 'VIDEO'
        ? await aiClient.generateVideo({
            generation_id: generationId,
            prompt,
            model,
            duration_seconds: 5,
          })
        : await aiClient.generateImage({
            generation_id: generationId,
            prompt,
            model,
          })

      if (aiResult.status === 'completed' && aiResult.asset_url) {
        aiUrl = aiResult.asset_url
        aiWidth = aiResult.width ?? 1920
        aiHeight = aiResult.height ?? 1080
        aiDuration = aiResult.duration_seconds ?? aiDuration
      }
    } catch {
      console.warn(`⚠️ [Worker] AI service tidak tersedia, menggunakan placeholder untuk ${generationId}`)
    }

    // 6. Create Result Asset in database
    const resultAsset = await prisma.asset.create({
      data: {
        userId,
        projectId: projectId || 'prj_1',
        name: assetName,
        type: type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        url: aiUrl,
        thumbnailUrl: aiUrl,
        mimeType: type === 'VIDEO' ? 'video/mp4' : 'image/png',
        width: aiWidth,
        height: aiHeight,
        duration: aiDuration,
      },
    })

    // 6. Complete Generation & Link Result
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultAssetId: resultAsset.id,
      },
    })

    // If linked to a scene, update scene currentAssetId & status
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          currentAssetId: resultAsset.id,
          status: 'READY',
        },
      })
    }

    // Deduct credits
    const creditCost = type === 'VIDEO' ? 10 : 2
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: creditCost },
        creditsUsed: { increment: creditCost },
      },
    })

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -creditCost,
        description: `Generasi ${type.toLowerCase()} model ${model}`,
        type: 'USAGE',
      },
    })

    console.log(`✅ [Worker] Job generasi ${generationId} selesai. Result Asset: ${resultAsset.id}`)
  } catch (error) {
    console.error(`❌ [Worker] Job ${generationId} gagal:`, error)
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Kesalahan sistem saat pemrosesan generasi',
      },
    })
    throw error
  }
}
