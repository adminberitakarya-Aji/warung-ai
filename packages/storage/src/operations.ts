import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'
import { s3Client, STORAGE_BUCKET, STORAGE_PUBLIC_URL } from './client'

export async function ensureBucketExists(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }))
  } catch {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: STORAGE_BUCKET }))
      console.log(`📦 S3 Bucket "${STORAGE_BUCKET}" berhasil dibuat.`)
    } catch (err) {
      console.warn(`⚠️ Gagal memastikan bucket "${STORAGE_BUCKET}":`, err)
    }
  }
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ key: string; publicUrl: string }> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  )

  return {
    key,
    publicUrl: `${STORAGE_PUBLIC_URL}/${key}`,
  }
}

export async function deleteObject(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: key,
      }),
    )
    return true
  } catch (err) {
    console.error(`❌ Gagal menghapus object S3 "${key}":`, err)
    return false
  }
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: key,
      }),
    )
    return true
  } catch {
    return false
  }
}
