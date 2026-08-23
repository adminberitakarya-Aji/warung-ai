// In-memory data store standing in for PostgreSQL.
// Everything the API layer reads or writes goes through here, so swapping in a
// real database only means reimplementing this module.

import type {
  Asset,
  Character,
  Generation,
  GenerationModel,
  Project,
  Scene,
  User,
} from '@/lib/types'

interface Database {
  user: User
  projects: Project[]
  scenes: Scene[]
  characters: Character[]
  assets: Asset[]
  generations: Generation[]
}

const now = new Date('2026-08-01T09:00:00.000Z').toISOString()

function seedAssets(): Asset[] {
  const sceneStills: Array<{ id: string; name: string; file: string }> = [
    { id: 'ast_scene_01', name: 'Dapur senja', file: 'scene-01' },
    { id: 'ast_scene_02', name: 'Memotong bawang', file: 'scene-02' },
    { id: 'ast_scene_03', name: 'Kuah mendidih', file: 'scene-03' },
    { id: 'ast_scene_04', name: 'Meja menunggu', file: 'scene-04' },
    { id: 'ast_scene_05', name: 'Gang setelah hujan', file: 'scene-05' },
    { id: 'ast_scene_06', name: 'Semangkuk soto', file: 'scene-06' },
  ]

  const characterStills: Array<{ id: string; name: string; file: string }> = [
    { id: 'ast_char_adi', name: 'Adi — referensi wajah', file: 'adi' },
    { id: 'ast_char_sari', name: 'Sari — referensi wajah', file: 'sari' },
    { id: 'ast_char_bagas', name: 'Bagas — referensi wajah', file: 'bagas' },
    { id: 'ast_char_maya', name: 'Maya — referensi wajah', file: 'maya' },
  ]

  const images: Asset[] = sceneStills.map((still, index) => ({
    id: still.id,
    userId: 'usr_1',
    projectId: 'prj_1',
    name: still.name,
    type: index === 2 || index === 4 ? 'VIDEO' : 'IMAGE',
    url: `/scenes/${still.file}.svg`,
    thumbnailUrl: `/scenes/${still.file}.svg`,
    // Seeded VIDEO assets are represented by their key frame, so the mime type
    // reflects the actual file until a real render pipeline is wired in.
    mimeType: 'image/svg+xml',
    width: 1920,
    height: 1080,
    duration: index === 2 || index === 4 ? 8 : null,
    metadata: { model: 'warung-vision-1', seed: 1000 + index },
    createdAt: now,
  }))

  const references: Asset[] = characterStills.map((still) => ({
    id: still.id,
    userId: 'usr_1',
    projectId: 'prj_1',
    name: still.name,
    type: 'REFERENCE',
    url: `/characters/${still.file}.svg`,
    thumbnailUrl: `/characters/${still.file}.svg`,
    mimeType: 'image/svg+xml',
    width: 1024,
    height: 1024,
    duration: null,
    metadata: { kind: 'character-reference' },
    createdAt: now,
  }))

  const audio: Asset[] = [
    {
      id: 'ast_audio_01',
      userId: 'usr_1',
      projectId: 'prj_1',
      name: 'Ambience dapur',
      type: 'AUDIO',
      url: '',
      thumbnailUrl: '',
      mimeType: 'audio/mpeg',
      width: null,
      height: null,
      duration: 42,
      metadata: { channels: 2 },
      createdAt: now,
    },
    {
      id: 'ast_audio_02',
      userId: 'usr_1',
      projectId: 'prj_1',
      name: 'Hujan di luar jendela',
      type: 'AUDIO',
      url: '',
      thumbnailUrl: '',
      mimeType: 'audio/mpeg',
      width: null,
      height: null,
      duration: 96,
      metadata: { channels: 2 },
      createdAt: now,
    },
  ]

  return [...images, ...references, ...audio]
}

function seedScenes(): Scene[] {
  const rows: Array<[string, string, number, string]> = [
    ['Dapur yang hangat', 'ast_scene_01', 5, 'Dapur rumah saat senja, uap mengambang di bawah lampu gantung.'],
    ['Memotong bahan', 'ast_scene_02', 8, 'Close-up tangan memotong bawang merah dan cabai di talenan kayu.'],
    ['Kuah mendidih', 'ast_scene_03', 6, 'Panci kuah mendidih di atas nyala api biru, uap naik ke kegelapan.'],
    ['Meja yang menunggu', 'ast_scene_04', 7, 'Meja makan untuk dua orang di bawah satu lampu, hujan di balik jendela.'],
    ['Gang setelah hujan', 'ast_scene_05', 9, 'Gang sempit malam hari, gerobak makanan bercahaya di kejauhan.'],
  ]

  return rows.map(([title, assetId, duration, prompt], index) => ({
    id: `scn_${index + 1}`,
    projectId: 'prj_1',
    title,
    order: index + 1,
    prompt,
    duration,
    aspectRatio: '16:9' as const,
    camera: index % 2 === 0 ? 'Static' : 'Slow push in',
    shotType: index === 1 ? 'Close-up' : index === 4 ? 'Wide' : 'Medium',
    lighting: 'Warm practical',
    style: 'Cinematic 35mm',
    status: 'READY' as const,
    currentAssetId: assetId,
    createdAt: now,
    updatedAt: now,
  }))
}

function seedCharacters(): Character[] {
  return [
    {
      id: 'chr_1',
      userId: 'usr_1',
      name: 'Adi',
      role: 'Tokoh utama',
      description: 'Anak laki-laki yang pulang setelah bertahun-tahun merantau.',
      appearance: 'Pria 30 tahun, rambut hitam pendek, sorot mata tenang.',
      clothing: 'Kemeja linen hijau zaitun yang sudah lusuh.',
      personality: 'Pendiam, penuh perhitungan, menahan banyak hal.',
      referenceAssetIds: ['ast_char_adi'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'chr_2',
      userId: 'usr_1',
      name: 'Sari',
      role: 'Pendukung',
      description: 'Ibu yang menjaga warung keluarga tetap hidup.',
      appearance: 'Perempuan 55 tahun, rambut disanggul, mata lelah namun hangat.',
      clothing: 'Blus batik pudar dengan celemek katun.',
      personality: 'Hangat, keras kepala, tak pernah meminta tolong.',
      referenceAssetIds: ['ast_char_sari'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'chr_3',
      userId: 'usr_1',
      name: 'Bagas',
      role: 'Antagonis',
      description: 'Pemilik lahan yang ingin menutup warung itu.',
      appearance: 'Pria 45 tahun, rambut klimis, kumis tipis.',
      clothing: 'Kemeja gelap berkancing rapi.',
      personality: 'Tenang, terukur, sulit dibaca.',
      referenceAssetIds: ['ast_char_bagas'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'chr_4',
      userId: 'usr_1',
      name: 'Maya',
      role: 'Pendukung',
      description: 'Keponakan Adi yang mengamati semuanya dari ambang pintu.',
      appearance: 'Anak perempuan 12 tahun, rambut dikepang dua.',
      clothing: 'Kaos bergaris sederhana.',
      personality: 'Penasaran, jujur, tak bisa menyimpan rahasia.',
      referenceAssetIds: ['ast_char_maya'],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function seedDatabase(): Database {
  return {
    user: {
      id: 'usr_1',
      name: 'Rani Prasetyo',
      email: 'rani@warungai.studio',
      avatarUrl: null,
      plan: 'FREE',
      credits: 100,
      creditsUsed: 42,
      createdAt: now,
      updatedAt: now,
    },
    projects: [
      {
        id: 'prj_1',
        userId: 'usr_1',
        title: 'Petang yang Tenang',
        description: 'Film pendek tentang seorang anak yang pulang ke warung ibunya.',
        thumbnailAssetId: 'ast_scene_01',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prj_2',
        userId: 'usr_1',
        title: 'Pasar Pagi',
        description: 'Rangkaian potret dokumenter di pasar subuh.',
        thumbnailAssetId: 'ast_scene_05',
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
      },
    ],
    scenes: seedScenes(),
    characters: seedCharacters(),
    assets: seedAssets(),
    generations: [],
  }
}

// Persist across hot reloads in development.
const globalForDb = globalThis as unknown as { __warungDb?: Database }

export const db: Database = (globalForDb.__warungDb ??= seedDatabase())

export const MODELS: GenerationModel[] = [
  {
    id: 'warung-vision-1',
    label: 'Warung Vision 1',
    type: 'IMAGE',
    description: 'Still sinematik, detail tinggi',
    credits: 2,
  },
  {
    id: 'warung-vision-1-turbo',
    label: 'Warung Vision Turbo',
    type: 'IMAGE',
    description: 'Draft cepat untuk eksplorasi',
    credits: 1,
  },
  {
    id: 'warung-motion-2',
    label: 'Warung Motion 2',
    type: 'VIDEO',
    description: 'Video hingga 10 detik, gerak kamera halus',
    credits: 8,
  },
  {
    id: 'warung-motion-2-hd',
    label: 'Warung Motion 2 HD',
    type: 'VIDEO',
    description: 'Video 1080p dengan konsistensi karakter',
    credits: 14,
  },
]

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
