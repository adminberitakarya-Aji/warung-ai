import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '@warungai/database'
import { z } from 'zod'

export const scenesRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/scenes - Create a new scene
  app.post('/', async (request, reply) => {
    const schema = z.object({
      projectId: z.string().min(1, 'projectId wajib diisi'),
      userId: z.string().optional().default('usr_1'),
      title: z.string().optional().default(''),
      prompt: z.string().optional().default(''),
      duration: z.number().int().min(1).max(60).optional().default(5),
      aspectRatio: z.string().optional().default('16:9'),
      camera: z.string().optional().default(''),
      shotType: z.string().optional().default(''),
      lighting: z.string().optional().default(''),
      style: z.string().optional().default(''),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    // Determine next order number in this project
    const lastScene = await prisma.scene.findFirst({
      where: { projectId: parsed.data.projectId },
      orderBy: { order: 'desc' },
    })
    const nextOrder = (lastScene?.order ?? 0) + 1
    const title = parsed.data.title.trim() || `Adegan ${nextOrder}`

    const scene = await prisma.scene.create({
      data: {
        ...parsed.data,
        title,
        order: nextOrder,
      },
      include: { currentAsset: true },
    })

    return reply.status(201).send({ scene })
  })

  // GET /api/v1/scenes/:id - Get scene detail
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const scene = await prisma.scene.findUnique({
      where: { id },
      include: {
        currentAsset: true,
        generations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!scene) {
      return reply.status(404).send({ error: 'Adegan tidak ditemukan' })
    }

    return reply.send({ scene })
  })

  // PATCH /api/v1/scenes/:id - Update scene parameters / details
  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const schema = z.object({
      title: z.string().optional(),
      prompt: z.string().optional(),
      duration: z.number().int().min(1).max(60).optional(),
      aspectRatio: z.string().optional(),
      camera: z.string().optional(),
      shotType: z.string().optional(),
      lighting: z.string().optional(),
      style: z.string().optional(),
      status: z.enum(['EMPTY', 'QUEUED', 'GENERATING', 'READY', 'FAILED']).optional(),
      currentAssetId: z.string().nullable().optional(),
      order: z.number().int().optional(),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const scene = await prisma.scene.update({
      where: { id },
      data: parsed.data,
      include: { currentAsset: true },
    })

    return reply.send({ scene })
  })

  // DELETE /api/v1/scenes/:id - Delete scene
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.scene.delete({
      where: { id },
    })

    return reply.send({ success: true })
  })

  // POST /api/v1/scenes/reorder - Reorder scenes in a project
  app.post('/reorder', async (request, reply) => {
    const schema = z.object({
      projectId: z.string().min(1),
      sceneIds: z.array(z.string()).min(1),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const { projectId, sceneIds } = parsed.data

    await prisma.$transaction(
      sceneIds.map((id, index) =>
        prisma.scene.update({
          where: { id, projectId },
          data: { order: index + 1 },
        }),
      ),
    )

    const scenes = await prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: { currentAsset: true },
    })

    return reply.send({ scenes })
  })
}
