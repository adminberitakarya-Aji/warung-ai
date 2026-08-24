import { NextResponse } from 'next/server'

import { cancelGeneration } from '@/lib/server/mock-provider'

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  const generation = cancelGeneration(id)

  if (!generation) {
    return NextResponse.json({ error: 'Generasi tidak ditemukan.' }, { status: 404 })
  }

  return NextResponse.json({ generation })
}
