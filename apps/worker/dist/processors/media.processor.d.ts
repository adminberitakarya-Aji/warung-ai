import { Job } from 'bullmq';
import type { MediaJobPayload } from '../queues';
export declare function processMediaJob(job: Job<MediaJobPayload>): Promise<{
    success: boolean;
    taskId: string;
}>;
//# sourceMappingURL=media.processor.d.ts.map