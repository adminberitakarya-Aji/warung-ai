'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { isActiveGeneration } from '@/lib/types'
import type { AssetType, Character, CreateGenerationInput, Scene } from '@/lib/types'

export const queryKeys = {
  session: ['session'] as const,
  projects: ['projects'] as const,
  scenes: (projectId: string) => ['scenes', projectId] as const,
  characters: (query?: string) => ['characters', query ?? ''] as const,
  character: (id: string) => ['character', id] as const,
  assets: (query: string, type: AssetType | 'ALL') => ['assets', query, type] as const,
  generations: ['generations'] as const,
  generation: (id: string) => ['generation', id] as const,
}

export function useSession() {
  return useQuery({ queryKey: queryKeys.session, queryFn: api.getSession })
}

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: api.listProjects })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; description?: string }) => api.createProject(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useScenes(projectId: string) {
  return useQuery({
    queryKey: queryKeys.scenes(projectId),
    queryFn: () => api.listScenes(projectId),
  })
}

export function useCreateScene(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { title?: string; prompt?: string; duration?: number }) =>
      api.createScene(projectId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenes(projectId) }),
  })
}

export function useUpdateScene(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Scene> & { id: string }) => api.updateScene(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenes(projectId) }),
  })
}

export function useDeleteScene(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteScene(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenes(projectId) }),
  })
}

export function useReorderScenes(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.reorderScenes(projectId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scenes(projectId) }),
  })
}

export function useCharacters(query?: string) {
  return useQuery({
    queryKey: queryKeys.characters(query),
    queryFn: () => api.listCharacters(query),
  })
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: queryKeys.character(id),
    queryFn: () => api.getCharacter(id),
  })
}

export function useCreateCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Character>) => api.createCharacter(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  })
}

export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Character>) => api.updateCharacter(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.character(id) })
      queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCharacter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  })
}

export function useAssets(query: string, type: AssetType | 'ALL') {
  return useQuery({
    queryKey: queryKeys.assets(query, type),
    queryFn: () => api.listAssets({ query, type }),
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAsset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  })
}

export function useGenerations() {
  return useQuery({
    queryKey: queryKeys.generations,
    queryFn: api.listGenerations,
    refetchInterval: (query) => {
      const generations = query.state.data?.generations ?? []
      const active = generations.some((item) => isActiveGeneration(item.status))
      return active ? 900 : false
    },
  })
}

/** Polls a single generation until it reaches a terminal state. */
export function useGeneration(id: string | null) {
  return useQuery({
    queryKey: queryKeys.generation(id ?? 'none'),
    queryFn: () => api.getGeneration(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      return isActiveGeneration(query.state.data?.generation.status) ? 700 : false
    },
  })
}

function useInvalidateAfterGeneration() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.generations })
    queryClient.invalidateQueries({ queryKey: ['assets'] })
    queryClient.invalidateQueries({ queryKey: ['scenes'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.session })
  }
}

export function useCreateGeneration() {
  const invalidate = useInvalidateAfterGeneration()
  return useMutation({
    mutationFn: (body: CreateGenerationInput) => api.createGeneration(body),
    onSuccess: invalidate,
  })
}

export function useCreateRefinement() {
  const invalidate = useInvalidateAfterGeneration()
  return useMutation({
    mutationFn: (body: {
      prompt: string
      assetId?: string
      sceneId?: string | null
      refinementTags?: string[]
      model?: string
    }) => api.createRefinement(body),
    onSuccess: invalidate,
  })
}

export function useRunTool() {
  const invalidate = useInvalidateAfterGeneration()
  return useMutation({
    mutationFn: ({ tool, prompt }: { tool: string; prompt?: string }) =>
      api.runTool(tool, { prompt }),
    onSuccess: invalidate,
  })
}

export function useCancelGeneration() {
  const invalidate = useInvalidateAfterGeneration()
  return useMutation({
    mutationFn: (id: string) => api.cancelGeneration(id),
    onSuccess: invalidate,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; email?: string }) => api.updateAccount(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session }),
  })
}
