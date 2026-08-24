import { NextResponse } from 'next/server'

import { createGeneration } from '@/lib/server/mock-provider'

const SUPPORTED_TOOLS = [
  'image-generator',
  'image-to-video',
  'extend-video',
  'remove-background',
  'upscale-media',
  'frame-extractor',
]

type Params = { params: Promise<{ tool: string }> }

export async function POST(request: Request, { params }: Params) {
  const { tool } = await params

  if (!SUPPORTED_TOOLS.includes(tool)) {
    return NextResponse.json({ error: `Tool "${tool}" tidak tersedia.` }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string
    assetId?: string
  }

  const generation = createGeneration({
    type: 'TOOL',
    prompt: body.prompt?.trim() || tool.replace(/-/g, ' '),
    model: tool === 'image-generator' ? 'warung-vision-1' : 'warung-motion-2',
    parameters: {
      tool,
      referenceAssetIds: body.assetId ? [body.assetId] : [],
    },
  })

  return NextResponse.json({ generation }, { status: 201 })
}
