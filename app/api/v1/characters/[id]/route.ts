import { NextResponse } from 'next/server'

import { db } from '@/lib/server/db'
import { serializeCharacter } from '@/lib/server/serialize'
import type { Character } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const character = db.characters.find((item) => item.id === id)

  if (!character) {
    return NextResponse.json({ error: 'Karakter tidak ditemukan.' }, { status: 404 })
  }

  return NextResponse.json({ character: serializeCharacter(character) })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const character = db.characters.find((item) => item.id === id)

  if (!character) {
    return NextResponse.json({ error: 'Karakter tidak ditemukan.' }, { status: 404 })
  }

  const body = (await request.json()) as Partial<
    Pick<Character, 'name' | 'role' | 'description' | 'appearance' | 'clothing' | 'personality'>
  >

  Object.assign(character, body)
  character.updatedAt = new Date().toISOString()

  return NextResponse.json({ character: serializeCharacter(character) })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const index = db.characters.findIndex((item) => item.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Karakter tidak ditemukan.' }, { status: 404 })
  }

  db.characters.splice(index, 1)

  return NextResponse.json({ ok: true })
}
