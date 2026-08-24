import { db } from '@/lib/server/db'
import type { Asset, Character, CharacterReference, Project, Scene } from '@/lib/types'

export interface SceneWithAsset extends Scene {
  currentAsset: Asset | null
}

export interface CharacterReferenceWithAsset extends CharacterReference {
  asset: Asset
}

export interface CharacterWithReferences extends Character {
  references: CharacterReferenceWithAsset[]
}

export interface ProjectWithMeta extends Project {
  thumbnailUrl: string | null
  sceneCount: number
  totalDuration: number
}

export function findAsset(id: string | null): Asset | null {
  if (!id) return null
  return db.assets.find((asset) => asset.id === id) ?? null
}

export function serializeScene(scene: Scene): SceneWithAsset {
  return { ...scene, currentAsset: findAsset(scene.currentAssetId) }
}

export function serializeProject(project: Project): ProjectWithMeta {
  const scenes = db.scenes.filter((scene) => scene.projectId === project.id)
  const fallbackAssetId =
    project.thumbnailAssetId ?? scenes.find((scene) => scene.currentAssetId)?.currentAssetId ?? null

  return {
    ...project,
    thumbnailUrl: findAsset(fallbackAssetId)?.thumbnailUrl ?? null,
    sceneCount: scenes.length,
    totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
  }
}

export function serializeCharacter(character: Character): CharacterWithReferences {
  const references = db.characterReferences
    .filter((reference) => reference.characterId === character.id)
    .map((reference) => {
      const asset = findAsset(reference.assetId)
      return asset ? { ...reference, asset } : null
    })
    .filter((reference): reference is CharacterReferenceWithAsset => reference !== null)

  return { ...character, references }
}
