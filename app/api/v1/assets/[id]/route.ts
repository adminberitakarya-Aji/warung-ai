import { NextResponse } from 'next/server'

import { db } from '@/lib/server/db'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const index = db.assets.findIndex((item) => item.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 })
  }

  db.assets.splice(index, 1)

  db.scenes.forEach((scene) => {
    if (scene.currentAssetId === id) {
      scene.currentAssetId = null
      scene.status = 'EMPTY'
    }
  })

  // Drop any character reference pointing at the deleted asset.
  for (let index = db.characterReferences.length - 1; index >= 0; index -= 1) {
    if (db.characterReferences[index].assetId === id) {
      db.characterReferences.splice(index, 1)
    }
  }

  return NextResponse.json({ ok: true })
}
