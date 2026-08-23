import { NextResponse } from 'next/server'

import { db, newId } from '@/lib/server/db'
import { serializeProject } from '@/lib/server/serialize'
import type { Project } from '@/lib/types'

export async function GET() {
  return NextResponse.json({ projects: db.projects.map(serializeProject) })
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string; description?: string }
  const title = body.title?.trim()

  if (!title) {
    return NextResponse.json({ error: 'Judul proyek wajib diisi.' }, { status: 400 })
  }

  const timestamp = new Date().toISOString()
  const project: Project = {
    id: newId('prj'),
    userId: db.user.id,
    title,
    description: body.description?.trim() ?? '',
    thumbnailAssetId: null,
    status: 'DRAFT',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  db.projects.unshift(project)

  return NextResponse.json({ project: serializeProject(project) }, { status: 201 })
}
