'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProject } from '@/hooks/use-warung'
import { useWorkspaceStore } from '@/stores/workspace-store'

export function NewProjectDialog() {
  const open = useWorkspaceStore((s) => s.newProjectOpen)
  const setOpen = useWorkspaceStore((s) => s.setNewProjectOpen)
  const setActiveProjectId = useWorkspaceStore((s) => s.setActiveProjectId)
  const createProject = useCreateProject()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function submit() {
    if (!title.trim()) {
      toast.error('Judul proyek wajib diisi.')
      return
    }
    createProject.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: ({ project }) => {
          setActiveProjectId(project.id)
          setTitle('')
          setDescription('')
          setOpen(false)
          toast.success(`Proyek "${project.title}" dibuat.`)
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proyek baru</DialogTitle>
          <DialogDescription>
            Setiap proyek menyimpan storyboard, adegan, dan aset hasil generasinya sendiri.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="project-title">Judul</FieldLabel>
            <Input
              id="project-title"
              value={title}
              placeholder="Malam di Warung Sari"
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="project-description">Deskripsi</FieldLabel>
            <Textarea
              id="project-description"
              value={description}
              rows={3}
              placeholder="Drama pendek tentang sebuah warung yang bertahan setelah hujan."
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={createProject.isPending}>
            {createProject.isPending && <Spinner data-icon="inline-start" />}
            Buat proyek
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
