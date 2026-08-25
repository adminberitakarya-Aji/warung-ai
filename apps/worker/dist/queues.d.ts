import { Queue } from 'bullmq';
export interface GenerationJobPayload {
    generationId: string;
    userId: string;
    projectId?: string | null;
    sceneId?: string | null;
    type: 'IMAGE' | 'VIDEO' | 'REFINEMENT' | 'TOOL';
    model: string;
    prompt: string;
    parameters?: Record<string, unknown>;
}
export interface RefinementJobPayload {
    generationId: string;
    userId: string;
    sourceAssetId: string;
    instruction: string;
    tags?: string[];
}
export interface MediaJobPayload {
    taskId: string;
    operation: 'stitch_video' | 'extract_frame' | 'merge_audio' | 'upscale';
    inputUrls: string[];
    outputFormat?: string;
}
export declare const GENERATION_QUEUE_NAME = "warungai-generations";
export declare const REFINEMENT_QUEUE_NAME = "warungai-refinements";
export declare const MEDIA_QUEUE_NAME = "warungai-media";
export declare const generationQueue: Queue<GenerationJobPayload, any, string, GenerationJobPayload, any, string>;
export declare const refinementQueue: Queue<RefinementJobPayload, any, string, RefinementJobPayload, any, string>;
export declare const mediaQueue: Queue<MediaJobPayload, any, string, MediaJobPayload, any, string>;
//# sourceMappingURL=queues.d.ts.map