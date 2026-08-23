import { NextResponse } from 'next/server'

import { createGeneration } from '@/lib/server/mock-provider'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prompt?: string
    assetId?: string
    sceneId?: string | null
    refinementTags?: string[]
    model?: string
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Jelaskan perubahan yang diinginkan.' }, { status: 400 })
  }

  const generation = createGeneration({
    type: 'REFINEMENT',
    prompt: body.prompt.trim(),
    model: body.model ?? 'warung-motion-2',
    sceneId: body.sceneId ?? null,
    parameters: {
      refinementTags: body.refinementTags ?? [],
      referenceAssetIds: body.assetId ? [body.assetId] : [],
    },
  })

  return NextResponse.json({ generation }, { status: 201 })
}
