import { NextResponse } from 'next/server'

import { getGeneration } from '@/lib/server/mock-provider'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const generation = getGeneration(id)

  if (!generation) {
    return NextResponse.json({ error: 'Generasi tidak ditemukan.' }, { status: 404 })
  }

  return NextResponse.json({ generation })
}
