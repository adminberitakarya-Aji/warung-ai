import type { GenerationStatus } from '@/lib/types'

/**
 * Indonesian labels for every generation status, including the four working
 * phases from the spec lifecycle. Kept in one place so the top bar, the
 * generation card, and the Create/Refine previews never drift apart.
 */
export const STATUS_LABEL: Record<GenerationStatus, string> = {
  QUEUED: 'Menunggu',
  PROCESSING: 'Menyiapkan',
  GENERATING: 'Membuat',
  PROCESSING_MEDIA: 'Mengolah media',
  UPLOADING: 'Mengunggah',
  COMPLETED: 'Selesai',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
}
