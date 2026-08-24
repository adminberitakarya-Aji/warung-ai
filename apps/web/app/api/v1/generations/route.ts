import { NextResponse } from 'next/server'

import { createGeneration, listGenerations } from '@/lib/server/mock-provider'
import type { CreateGenerationInput } from '@/lib/types'

export async function GET() {
  return NextResponse.json({ generations: listGenerations() })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateGenerationInput>

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt wajib diisi.' }, { status: 400 })
  }

  const generation = createGeneration({
    type: body.type ?? 'IMAGE',
    prompt: body.prompt.trim(),
    model: body.model ?? 'warung-vision-1',
    projectId: body.projectId ?? null,
    sceneId: body.sceneId ?? null,
    parameters: body.parameters ?? {},
  })

  return NextResponse.json({ generation }, { status: 201 })
}
