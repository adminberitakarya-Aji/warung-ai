import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '@warungai/database'
import { z } from 'zod'

export const toolsRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/tools/:tool - Execute specialized utility tool
  app.post('/:tool', async (request, reply) => {
    const { tool } = request.params as { tool: string }

    const schema = z.object({
      assetId: z.string().optional(),
      prompt: z.string().optional(),
      options: z.record(z.any()).optional().default({}),
      projectId: z.string().nullable().optional().default('prj_1'),
      userId: z.string().optional().default('usr_1'),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const { assetId, prompt, options, projectId, userId } = parsed.data

    const generation = await prisma.generation.create({
      data: {
        userId,
        projectId,
        type: 'TOOL',
        model: `tool-${tool}`,
        prompt: prompt || `Jalankan alat: ${tool}`,
        parameters: {
          tool,
          sourceAssetId: assetId,
          options,
        },
        status: 'QUEUED',
        progress: 0,
      },
    })

    return reply.status(201).send({ generation })
  })
}
