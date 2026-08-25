import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisConnection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
});
redisConnection.on('error', (err) => {
    console.warn('⚠️ Redis connection warning:', err.message);
});
redisConnection.on('connect', () => {
    console.log('🔌 Terhubung ke Redis:', REDIS_URL);
});
//# sourceMappingURL=redis.js.map