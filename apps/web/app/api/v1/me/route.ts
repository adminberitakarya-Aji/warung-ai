import { NextResponse } from 'next/server'

import { MODELS, db } from '@/lib/server/db'

export async function GET() {
  return NextResponse.json({ user: db.user, models: MODELS })
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string }

  if (typeof body.name === 'string' && body.name.trim().length > 0) {
    db.user.name = body.name.trim()
  }
  if (typeof body.email === 'string' && body.email.includes('@')) {
    db.user.email = body.email.trim()
  }
  db.user.updatedAt = new Date().toISOString()

  return NextResponse.json({ user: db.user })
}
