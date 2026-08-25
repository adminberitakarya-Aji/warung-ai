import { Queue } from 'bullmq';
import { redisConnection } from './redis';
export const GENERATION_QUEUE_NAME = 'warungai-generations';
export const REFINEMENT_QUEUE_NAME = 'warungai-refinements';
export const MEDIA_QUEUE_NAME = 'warungai-media';
export const generationQueue = new Queue(GENERATION_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
export const refinementQueue = new Queue(REFINEMENT_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
    },
});
export const mediaQueue = new Queue(MEDIA_QUEUE_NAME, {
    connection: redisConnection,
});
//# sourceMappingURL=queues.js.map