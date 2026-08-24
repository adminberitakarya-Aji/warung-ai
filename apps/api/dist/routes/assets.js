import { prisma } from '@warungai/database';
import { z } from 'zod';
const ASSET_TYPES = ['IMAGE', 'VIDEO', 'AUDIO', 'REFERENCE'];
export const assetsRoutes = async (app) => {
    // GET /api/v1/assets - List assets with search & type filtering
    app.get('/', async (request, reply) => {
        const { q, type } = request.query;
        const query = q?.toLowerCase().trim();
        const upperType = type?.toUpperCase();
        const assets = await prisma.asset.findMany({
            where: {
                AND: [
                    query ? { name: { contains: query, mode: 'insensitive' } } : {},
                    upperType && ASSET_TYPES.includes(upperType)
                        ? { type: upperType }
                        : {},
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return reply.send({ assets });
    });
    // POST /api/v1/assets - Create / Upload asset record
    app.post('/', async (request, reply) => {
        const schema = z.object({
            name: z.string().min(1, 'Nama aset wajib diisi'),
            type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'REFERENCE']).default('IMAGE'),
            url: z.string().min(1, 'URL aset wajib diisi'),
            thumbnailUrl: z.string().optional(),
            mimeType: z.string().optional().default('image/png'),
            width: z.number().nullable().optional(),
            height: z.number().nullable().optional(),
            duration: z.number().nullable().optional(),
            metadata: z.record(z.any()).optional().default({}),
            projectId: z.string().nullable().optional().default('prj_1'),
            userId: z.string().optional().default('usr_1'),
        });
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' });
        }
        const asset = await prisma.asset.create({
            data: {
                ...parsed.data,
                thumbnailUrl: parsed.data.thumbnailUrl || parsed.data.url,
            },
        });
        return reply.status(201).send({ asset });
    });
    // GET /api/v1/assets/:id - Get asset detail
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const asset = await prisma.asset.findUnique({
            where: { id },
        });
        if (!asset) {
            return reply.status(404).send({ error: 'Aset tidak ditemukan' });
        }
        return reply.send({ asset });
    });
    // DELETE /api/v1/assets/:id - Delete asset
    app.delete('/:id', async (request, reply) => {
        const { id } = request.params;
        await prisma.asset.delete({
            where: { id },
        });
        return reply.send({ success: true });
    });
};
//# sourceMappingURL=assets.js.map