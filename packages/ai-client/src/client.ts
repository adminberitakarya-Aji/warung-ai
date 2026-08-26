import type {
  GenerateImagePayload,
  GenerateVideoPayload,
  RefinementPayload,
  RemoveBackgroundPayload,
  ExtractFramePayload,
  UpscalePayload,
  ColorGradePayload,
  GenerationResult,
  ToolResult,
} from './types'

const AI_SERVICE_URL =
  typeof process !== 'undefined' && process.env.AI_SERVICE_URL
    ? process.env.AI_SERVICE_URL
    : 'http://localhost:8000'

const INTERNAL_SECRET =
  typeof process !== 'undefined' && process.env.INTERNAL_API_SECRET
    ? process.env.INTERNAL_API_SECRET
    : 'warungai-internal-secret'

async function request<T>(path: string, body: unknown): Promise<T> {
  const url = `${AI_SERVICE_URL}${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-secret': INTERNAL_SECRET,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(detail?.detail ?? `AI service error (${res.status}): ${path}`)
  }

  return res.json() as Promise<T>
}

export const aiClient = {
  /** Generate a cinematic still image. */
  generateImage: (payload: GenerateImagePayload) =>
    request<GenerationResult>('/generate/image', payload),

  /** Generate a short video clip. */
  generateVideo: (payload: GenerateVideoPayload) =>
    request<GenerationResult>('/generate/video', payload),

  /** Apply refinement (upscale, outpaint, color grade) to an existing asset. */
  runRefinement: (payload: RefinementPayload) =>
    request<GenerationResult>('/generate/refinement', payload),

  /** Remove background from an image asset. */
  removeBackground: (payload: RemoveBackgroundPayload) =>
    request<ToolResult>('/tools/remove-background', payload),

  /** Extract a single frame from a video. */
  extractFrame: (payload: ExtractFramePayload) =>
    request<ToolResult>('/tools/extract-frame', payload),

  /** Upscale an image by a given scale factor. */
  upscale: (payload: UpscalePayload) =>
    request<ToolResult>('/tools/upscale', payload),

  /** Apply colour grading to an image. */
  colorGrade: (payload: ColorGradePayload) =>
    request<ToolResult>('/tools/color-grade', payload),

  /** Health check — returns true if AI service is reachable. */
  isHealthy: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${AI_SERVICE_URL}/health`, { method: 'GET' })
      return res.ok
    } catch {
      return false
    }
  },
}
