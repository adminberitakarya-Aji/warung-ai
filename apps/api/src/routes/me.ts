import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '@warungai/database'
import { z } from 'zod'

export const meRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/me - Get current user profile, plan, and credits
  app.get('/', async (request, reply) => {
    let user = await prisma.user.findUnique({
      where: { id: 'usr_1' },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'usr_1',
          name: 'Rani Prasetyo',
          email: 'rani@warungai.id',
          avatarUrl: '/placeholder-user.jpg',
          plan: 'CREATOR',
          credits: 250,
          creditsUsed: 50,
        },
      })
    }

    return reply.send({ user })
  })

  // PATCH /api/v1/me - Update user profile
  app.patch('/', async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      avatarUrl: z.string().nullable().optional(),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const user = await prisma.user.update({
      where: { id: 'usr_1' },
      data: parsed.data,
    })

    return reply.send({ user })
  })
}
