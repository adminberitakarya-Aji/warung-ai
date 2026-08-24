import { prisma } from '@warungai/database';
import { z } from 'zod';
export const projectsRoutes = async (app) => {
    // GET /api/v1/projects - List all projects
    app.get('/', async (request, reply) => {
        // Default to user usr_1 if auth is mock
        const projects = await prisma.project.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { scenes: true, assets: true },
                },
            },
        });
        return reply.send({ projects });
    });
    // POST /api/v1/projects - Create a new project
    app.post('/', async (request, reply) => {
        const schema = z.object({
            title: z.string().min(1, 'Judul proyek wajib diisi'),
            description: z.string().optional().default(''),
            userId: z.string().optional().default('usr_1'),
        });
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' });
        }
        const project = await prisma.project.create({
            data: {
                title: parsed.data.title.trim(),
                description: parsed.data.description?.trim() || '',
                userId: parsed.data.userId,
            },
        });
        return reply.status(201).send({ project });
    });
    // GET /api/v1/projects/:id - Get project detail
    app.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                scenes: {
                    orderBy: { order: 'asc' },
                    include: { currentAsset: true },
                },
                assets: true,
            },
        });
        if (!project) {
            return reply.status(404).send({ error: 'Proyek tidak ditemukan' });
        }
        return reply.send({ project });
    });
    // PATCH /api/v1/projects/:id - Update project
    app.patch('/:id', async (request, reply) => {
        const { id } = request.params;
        const schema = z.object({
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
            thumbnailAssetId: z.string().nullable().optional(),
        });
        const parsed = schema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ error: parsed.error.issues[0]?.message || 'Data tidak valid' });
        }
        const project = await prisma.project.update({
            where: { id },
            data: parsed.data,
        });
        return reply.send({ project });
    });
    // DELETE /api/v1/projects/:id - Delete project
    app.delete('/:id', async (request, reply) => {
        const { id } = request.params;
        await prisma.project.delete({
            where: { id },
        });
        return reply.send({ success: true });
    });
    // GET /api/v1/projects/:id/scenes - List scenes for a project
    app.get('/:id/scenes', async (request, reply) => {
        const { id } = request.params;
        const scenes = await prisma.scene.findMany({
            where: { projectId: id },
            orderBy: { order: 'asc' },
            include: { currentAsset: true },
        });
        return reply.send({ scenes });
    });
};
//# sourceMappingURL=projects.js.map