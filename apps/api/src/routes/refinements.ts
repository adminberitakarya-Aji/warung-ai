import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '@warungai/database'
import { z } from 'zod'
import { dispatchRefinementJob } from '../queue'

export const refinementsRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/refinements - Submit refinement task (upscale, inpaint, outpaint, color grade)
  app.post('/', async (request, reply) => {
    const schema = z.object({
      assetId: z.string().min(1, 'assetId wajib diisi'),
      instruction: z.string().min(1, 'Instruksi refinement wajib diisi'),
      tags: z.array(z.string()).optional().default([]),
      model: z.string().optional().default('warung-vision-v2'),
      projectId: z.string().nullable().optional().default('prj_1'),
      userId: z.string().optional().default('usr_1'),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const { assetId, instruction, tags, model, projectId, userId } = parsed.data

    const generation = await prisma.generation.create({
      data: {
        userId,
        projectId,
        type: 'REFINEMENT',
        model,
        prompt: instruction,
        parameters: {
          sourceAssetId: assetId,
          refinementTags: tags,
        },
        status: 'QUEUED',
        progress: 0,
      },
    })

    await dispatchRefinementJob({
      generationId: generation.id,
      userId: generation.userId,
      sourceAssetId: assetId,
      instruction,
      tags,
    })

    return reply.status(201).send({ generation })
  })
}
