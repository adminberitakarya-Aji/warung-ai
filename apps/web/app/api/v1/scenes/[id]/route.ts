import { NextResponse } from 'next/server'

import { db } from '@/lib/server/db'
import { serializeScene } from '@/lib/server/serialize'
import type { Scene } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const scene = db.scenes.find((item) => item.id === id)

  if (!scene) {
    return NextResponse.json({ error: 'Adegan tidak ditemukan.' }, { status: 404 })
  }

  const body = (await request.json()) as Partial<
    Pick<Scene, 'title' | 'prompt' | 'duration' | 'aspectRatio' | 'camera' | 'shotType' | 'lighting' | 'style'>
  >

  Object.assign(scene, body)
  scene.updatedAt = new Date().toISOString()

  return NextResponse.json({ scene: serializeScene(scene) })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const index = db.scenes.findIndex((item) => item.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Adegan tidak ditemukan.' }, { status: 404 })
  }

  const [removed] = db.scenes.splice(index, 1)

  db.scenes
    .filter((scene) => scene.projectId === removed.projectId)
    .sort((a, b) => a.order - b.order)
    .forEach((scene, position) => {
      scene.order = position + 1
    })

  return NextResponse.json({ ok: true })
}
