import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { projectsRoutes } from './routes/projects';
import { scenesRoutes } from './routes/scenes';
import { charactersRoutes } from './routes/characters';
import { assetsRoutes } from './routes/assets';
import { generationsRoutes } from './routes/generations';
import { refinementsRoutes } from './routes/refinements';
import { toolsRoutes } from './routes/tools';
import { meRoutes } from './routes/me';
export async function buildServer() {
    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
        },
    });
    // Register CORS
    await app.register(cors, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    // Register Swagger Docs
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'WarungAI API',
                description: 'RESTful API service for WarungAI cinematic generative film platform (§10 spec)',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:4000',
                    description: 'Local development server',
                },
            ],
        },
    });
    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
    });
    // Healthcheck endpoint
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    // Register API v1 routes
    await app.register(async (v1) => {
        await v1.register(projectsRoutes, { prefix: '/projects' });
        await v1.register(scenesRoutes, { prefix: '/scenes' });
        await v1.register(charactersRoutes, { prefix: '/characters' });
        await v1.register(assetsRoutes, { prefix: '/assets' });
        await v1.register(generationsRoutes, { prefix: '/generations' });
        await v1.register(refinementsRoutes, { prefix: '/refinements' });
        await v1.register(toolsRoutes, { prefix: '/tools' });
        await v1.register(meRoutes, { prefix: '/me' });
    }, { prefix: '/api/v1' });
    return app;
}
//# sourceMappingURL=server.js.map