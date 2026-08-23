import { NextResponse } from 'next/server'

import { db, newId } from '@/lib/server/db'
import { serializeCharacter } from '@/lib/server/serialize'
import type { Character } from '@/lib/types'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.toLowerCase().trim()

  const characters = db.characters
    .filter((character) =>
      query
        ? character.name.toLowerCase().includes(query) ||
          character.role.toLowerCase().includes(query) ||
          character.description.toLowerCase().includes(query)
        : true,
    )
    .map(serializeCharacter)

  return NextResponse.json({ characters })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Character>
  const name = body.name?.trim()

  if (!name) {
    return NextResponse.json({ error: 'Nama karakter wajib diisi.' }, { status: 400 })
  }

  const timestamp = new Date().toISOString()
  const character: Character = {
    id: newId('chr'),
    userId: db.user.id,
    name,
    role: body.role?.trim() || 'Pendukung',
    description: body.description?.trim() ?? '',
    appearance: body.appearance?.trim() ?? '',
    clothing: body.clothing?.trim() ?? '',
    personality: body.personality?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  db.characters.push(character)

  return NextResponse.json({ character: serializeCharacter(character) }, { status: 201 })
}
