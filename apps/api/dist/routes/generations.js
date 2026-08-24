import { prisma } from '@warungai/database';
import { z } from 'zod';
export const generationsRoutes = async (app) => {
    // GET /api/v1/generations - List recent generations
    app.get('/', async (request, reply) => {
        const generations = await prisma.generation.findMany({
            orderBy: { createdAt: 'desc' },
            include: { resultAsset: true },
            take: 50,
        });
        return reply.send({ generations });
    });
    // POST /api/v1/generations - Submit a new generation job
    app.post('/', async (request, reply) => {
        const schema = z.object({
            type: z.enum(['IMAGE', 'VIDEO', 'REFINEMENT', 'TOOL']).default('IMAGE'),
            model: z.string().min(1, 'Model wajib dipilih'),
            prompt: z.string().min(1, 'Prompt wajib diisi'),
            projectId: z.string().nullable().optional().default('prj_1'),
            sceneId: z.string().nullable().optional(),
            parameters: z.record(z.any()).optional().default({}),
            userId: z.string().optional().default('usr_1'),
            provider: z.string().optional().default('mock'),
        });
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' });
        }
        const generation = await prisma.generation.create({
            data: {
                ...parsed.data,
                status: 'QUEUED',
                progress: 0,
            },
            include: { resultAsset: true },
        });
        return reply.status(201).send({ generation });
    });
    // GET /api/v1/generations/:id - Get generation status / detail
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const generation = await prisma.generation.findUnique({
            where: { id },
            include: { resultAsset: true },
        });
        if (!generation) {
            return reply.status(404).send({ error: 'Generasi tidak ditemukan' });
        }
        return reply.send({ generation });
    });
    // POST /api/v1/generations/:id/cancel - Cancel an active generation
    app.post('/:id/cancel', async (request, reply) => {
        const { id } = request.params;
        const existing = await prisma.generation.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ error: 'Generasi tidak ditemukan' });
        }
        if (existing.status === 'COMPLETED' || existing.status === 'FAILED') {
            return reply.status(400).send({ error: 'Generasi sudah selesai dan tidak dapat dibatalkan' });
        }
        const generation = await prisma.generation.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
        });
        return reply.send({ generation });
    });
};
//# sourceMappingURL=generations.js.map