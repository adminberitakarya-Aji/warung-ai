import dotenv from 'dotenv';
import { buildServer } from './server';
dotenv.config();
const PORT = parseInt(process.env.API_PORT || '4000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';
async function start() {
    try {
        const server = await buildServer();
        await server.listen({ port: PORT, host: HOST });
        console.log(`🚀 WarungAI Fastify API berjalan di http://${HOST}:${PORT}`);
        console.log(`📚 Dokumentasi OpenAPI Swagger tersedia di http://${HOST}:${PORT}/docs`);
    }
    catch (err) {
        console.error('❌ Gagal menjalankan server API:', err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map