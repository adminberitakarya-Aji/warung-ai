import { S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

export const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || 'http://localhost:9000'
export const STORAGE_REGION = process.env.STORAGE_REGION || 'auto'
export const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'warungai-media'
export const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY || 'minioadmin'
export const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY || 'minioadmin'
export const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}`

export const s3Client = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  region: STORAGE_REGION,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO and local S3 emulators
})
