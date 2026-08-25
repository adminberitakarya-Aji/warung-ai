import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, STORAGE_BUCKET, STORAGE_PUBLIC_URL } from './client'

export interface GenerateUploadUrlOptions {
  userId: string
  filename: string
  mimeType: string
  folder?: 'uploads' | 'generations' | 'characters' | 'audio'
  expiresInSeconds?: number
}

export function generateStorageKey(
  userId: string,
  filename: string,
  folder: 'uploads' | 'generations' | 'characters' | 'audio' = 'uploads',
): string {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${folder}/${userId}/${timestamp}-${sanitized}`
}

export async function generatePresignedUploadUrl({
  userId,
  filename,
  mimeType,
  folder = 'uploads',
  expiresInSeconds = 300, // 5 minutes
}: GenerateUploadUrlOptions): Promise<{
  uploadUrl: string
  key: string
  publicUrl: string
}> {
  const key = generateStorageKey(userId, filename, folder)

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    ContentType: mimeType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  })

  const publicUrl = `${STORAGE_PUBLIC_URL}/${key}`

  return {
    uploadUrl,
    key,
    publicUrl,
  }
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600, // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds })
}
