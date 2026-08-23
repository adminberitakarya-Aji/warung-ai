import { NextResponse } from 'next/server'

import { db } from '@/lib/server/db'
import { serializeScene } from '@/lib/server/serialize'

export async function POST(request: Request) {
  const body = (await request.json()) as { projectId?: string; orderedIds?: string[] }

  if (!body.projectId || !Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: 'projectId dan orderedIds wajib diisi.' }, { status: 400 })
  }

  body.orderedIds.forEach((sceneId, index) => {
    const scene = db.scenes.find((item) => item.id === sceneId)
    if (scene && scene.projectId === body.projectId) {
      scene.order = index + 1
      scene.updatedAt = new Date().toISOString()
    }
  })

  const scenes = db.scenes
    .filter((scene) => scene.projectId === body.projectId)
    .sort((a, b) => a.order - b.order)
    .map(serializeScene)

  return NextResponse.json({ scenes })
}
