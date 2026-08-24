import { NextResponse } from 'next/server'

import { db, newId } from '@/lib/server/db'
import { serializeScene } from '@/lib/server/serialize'
import type { AspectRatio, Scene } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const scenes = db.scenes
    .filter((scene) => scene.projectId === id)
    .sort((a, b) => a.order - b.order)
    .map(serializeScene)

  return NextResponse.json({ scenes })
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const body = (await request.json()) as {
    title?: string
    prompt?: string
    duration?: number
    aspectRatio?: AspectRatio
  }

  const timestamp = new Date().toISOString()
  const order = db.scenes.filter((scene) => scene.projectId === id).length + 1

  const scene: Scene = {
    id: newId('scn'),
    projectId: id,
    title: body.title?.trim() || `Adegan ${String(order).padStart(2, '0')}`,
    order,
    prompt: body.prompt?.trim() ?? '',
    duration: body.duration ?? 5,
    aspectRatio: body.aspectRatio ?? '16:9',
    camera: 'Static',
    shotType: 'Medium',
    lighting: 'Warm practical',
    style: 'Cinematic 35mm',
    status: 'EMPTY',
    currentAssetId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  db.scenes.push(scene)

  return NextResponse.json({ scene: serializeScene(scene) }, { status: 201 })
}
