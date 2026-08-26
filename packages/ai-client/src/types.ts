// Shared type contracts between @warungai/ai-client and services/ai

export interface GenerateImagePayload {
  generation_id: string
  prompt: string
  model?: string
  negative_prompt?: string
  width?: number
  height?: number
  steps?: number
  cfg_scale?: number
  seed?: number | null
  style_preset?: string | null
  parameters?: Record<string, unknown>
}

export interface GenerateVideoPayload {
  generation_id: string
  prompt: string
  model?: string
  reference_image_url?: string | null
  duration_seconds?: number
  fps?: number
  width?: number
  height?: number
  parameters?: Record<string, unknown>
}

export interface RefinementPayload {
  generation_id: string
  source_asset_url: string
  instruction: string
  tags?: string[]
  model?: string
  parameters?: Record<string, unknown>
}

export interface RemoveBackgroundPayload {
  source_asset_url: string
}

export interface ExtractFramePayload {
  video_url: string
  timestamp_seconds?: number
  output_format?: 'jpeg' | 'png' | 'webp'
}

export interface UpscalePayload {
  source_asset_url: string
  scale_factor?: number
}

export interface ColorGradePayload {
  source_asset_url: string
  lut_name?: string | null
  temperature?: number
  saturation?: number
  contrast?: number
}

export interface GenerationResult {
  generation_id: string
  status: 'completed' | 'failed'
  asset_url?: string | null
  thumbnail_url?: string | null
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
  error?: string | null
  processing_time_ms: number
  created_at: string
}

export interface ToolResult {
  task_id: string
  status: 'completed' | 'failed'
  output_url?: string | null
  error?: string | null
  processing_time_ms: number
}
