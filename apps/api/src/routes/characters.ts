import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '@warungai/database'
import { z } from 'zod'

export const charactersRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/characters - List characters with search filter
  app.get('/', async (request, reply) => {
    const { q } = request.query as { q?: string }
    const query = q?.toLowerCase().trim()

    const characters = await prisma.character.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { role: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        references: {
          include: { asset: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ characters })
  })

  // POST /api/v1/characters - Create a new character
  app.post('/', async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1, 'Nama karakter wajib diisi'),
      role: z.string().optional().default('Pendukung'),
      description: z.string().optional().default(''),
      appearance: z.string().optional().default(''),
      clothing: z.string().optional().default(''),
      personality: z.string().optional().default(''),
      userId: z.string().optional().default('usr_1'),
      references: z
        .array(
          z.object({
            assetId: z.string(),
            type: z.enum(['FACE', 'BODY', 'OUTFIT', 'EXPRESSION']).default('FACE'),
          }),
        )
        .optional()
        .default([]),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const { references, ...charData } = parsed.data

    const character = await prisma.character.create({
      data: {
        ...charData,
        name: charData.name.trim(),
        references: {
          create: references.map((ref) => ({
            assetId: ref.assetId,
            type: ref.type,
          })),
        },
      },
      include: {
        references: {
          include: { asset: true },
        },
      },
    })

    return reply.status(201).send({ character })
  })

  // GET /api/v1/characters/:id - Get character detail with references
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        references: {
          include: { asset: true },
        },
      },
    })

    if (!character) {
      return reply.status(404).send({ error: 'Karakter tidak ditemukan' })
    }

    return reply.send({ character })
  })

  // PATCH /api/v1/characters/:id - Update character
  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const schema = z.object({
      name: z.string().min(1).optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      appearance: z.string().optional(),
      clothing: z.string().optional(),
      personality: z.string().optional(),
      references: z
        .array(
          z.object({
            assetId: z.string(),
            type: z.enum(['FACE', 'BODY', 'OUTFIT', 'EXPRESSION']),
          }),
        )
        .optional(),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' })
    }

    const { references, ...charData } = parsed.data

    // If references were supplied, replace them
    if (references) {
      await prisma.characterReference.deleteMany({
        where: { characterId: id },
      })
      await prisma.characterReference.createMany({
        data: references.map((ref) => ({
          characterId: id,
          assetId: ref.assetId,
          type: ref.type,
        })),
      })
    }

    const character = await prisma.character.update({
      where: { id },
      data: charData,
      include: {
        references: {
          include: { asset: true },
        },
      },
    })

    return reply.send({ character })
  })

  // DELETE /api/v1/characters/:id - Delete character
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.character.delete({
      where: { id },
    })

    return reply.send({ success: true })
  })
}
