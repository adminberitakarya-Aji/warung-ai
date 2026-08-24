import { NextResponse } from 'next/server'

import { db } from '@/lib/server/db'
import type { Project } from '@/lib/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const project = db.projects.find((item) => item.id === id)

  if (!project) {
    return NextResponse.json({ error: 'Proyek tidak ditemukan.' }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const project = db.projects.find((item) => item.id === id)

  if (!project) {
    return NextResponse.json({ error: 'Proyek tidak ditemukan.' }, { status: 404 })
  }

  const body = (await request.json()) as Partial<Pick<Project, 'title' | 'description' | 'status'>>

  if (body.title?.trim()) project.title = body.title.trim()
  if (typeof body.description === 'string') project.description = body.description.trim()
  if (body.status) project.status = body.status
  project.updatedAt = new Date().toISOString()

  return NextResponse.json({ project })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const index = db.projects.findIndex((item) => item.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Proyek tidak ditemukan.' }, { status: 404 })
  }

  db.projects.splice(index, 1)

  return NextResponse.json({ ok: true })
}
