import { NextResponse } from 'next/server'

import { db, newId } from '@/lib/server/db'
import type { Asset, AssetType } from '@/lib/types'

const TYPES: AssetType[] = ['IMAGE', 'VIDEO', 'AUDIO', 'REFERENCE']

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.toLowerCase().trim()
  const type = url.searchParams.get('type')?.toUpperCase()

  const assets = db.assets.filter((asset) => {
    const matchesType = type && TYPES.includes(type as AssetType) ? asset.type === type : true
    const matchesQuery = query ? asset.name.toLowerCase().includes(query) : true
    return matchesType && matchesQuery
  })

  return NextResponse.json({ assets })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Asset>

  if (!body.name?.trim() || !body.url) {
    return NextResponse.json({ error: 'Nama dan url aset wajib diisi.' }, { status: 400 })
  }

  const asset: Asset = {
    id: newId('ast'),
    userId: db.user.id,
    projectId: body.projectId ?? 'prj_1',
    name: body.name.trim(),
    type: body.type ?? 'IMAGE',
    url: body.url,
    thumbnailUrl: body.thumbnailUrl ?? body.url,
    mimeType: body.mimeType ?? 'image/png',
    width: body.width ?? null,
    height: body.height ?? null,
    duration: body.duration ?? null,
    metadata: body.metadata ?? {},
    createdAt: new Date().toISOString(),
  }

  db.assets.unshift(asset)

  return NextResponse.json({ asset }, { status: 201 })
}
