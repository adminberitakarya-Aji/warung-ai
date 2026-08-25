export declare function dispatchGenerationJob(payload: {
    generationId: string;
    userId: string;
    projectId?: string | null;
    sceneId?: string | null;
    type: 'IMAGE' | 'VIDEO' | 'REFINEMENT' | 'TOOL';
    model: string;
    prompt: string;
    parameters?: Record<string, unknown>;
}): Promise<void>;
export declare function dispatchRefinementJob(payload: {
    generationId: string;
    userId: string;
    sourceAssetId: string;
    instruction: string;
    tags?: string[];
}): Promise<void>;
//# sourceMappingURL=queue.d.ts.map