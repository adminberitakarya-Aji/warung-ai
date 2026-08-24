import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai database seeding WarungAI...')

  // 1. Clean existing records (in reverse dependency order)
  await prisma.creditTransaction.deleteMany()
  await prisma.generation.deleteMany()
  await prisma.characterReference.deleteMany()
  await prisma.character.deleteMany()
  await prisma.scene.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      id: 'usr_1',
      name: 'Rani Prasetyo',
      email: 'rani@warungai.id',
      avatarUrl: '/placeholder-user.jpg',
      plan: 'CREATOR',
      credits: 250,
      creditsUsed: 50,
    },
  })
  console.log(`✅ User dibuat: ${user.name} (${user.id})`)

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      id: 'prj_1',
      userId: user.id,
      title: 'Kisah Tanah Jawa',
      description: 'Film pendek atmosferik misteri berlatar pedesaan Jawa abad ke-19.',
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Project dibuat: ${project.title} (${project.id})`)

  // 4. Create Assets
  const assetsData = [
    {
      id: 'ast_1',
      userId: user.id,
      projectId: project.id,
      name: 'Adegan 1: Rumah Joglo Berkabut',
      type: 'IMAGE' as const,
      url: '/scenes/scene-01.svg',
      thumbnailUrl: '/scenes/scene-01.svg',
      mimeType: 'image/svg+xml',
      width: 1920,
      height: 1080,
    },
    {
      id: 'ast_2',
      userId: user.id,
      projectId: project.id,
      name: 'Adegan 2: Sosok di Ambang Pintu',
      type: 'IMAGE' as const,
      url: '/scenes/scene-02.svg',
      thumbnailUrl: '/scenes/scene-02.svg',
      mimeType: 'image/svg+xml',
      width: 1920,
      height: 1080,
    },
    {
      id: 'ast_3',
      userId: user.id,
      projectId: project.id,
      name: 'Adegan 3: Lentera Minyak di Meja Kayu',
      type: 'IMAGE' as const,
      url: '/scenes/scene-03.svg',
      thumbnailUrl: '/scenes/scene-03.svg',
      mimeType: 'image/svg+xml',
      width: 1920,
      height: 1080,
    },
    {
      id: 'ast_4',
      userId: user.id,
      projectId: project.id,
      name: 'Adegan 4: Hutan Bambu Menjelang Senja',
      type: 'IMAGE' as const,
      url: '/scenes/scene-04.svg',
      thumbnailUrl: '/scenes/scene-04.svg',
      mimeType: 'image/svg+xml',
      width: 1920,
      height: 1080,
    },
    {
      id: 'ast_5',
      userId: user.id,
      projectId: project.id,
      name: 'Adegan 5: Sumur Tua di Belakang Rumah',
      type: 'IMAGE' as const,
      url: '/scenes/scene-05.svg',
      thumbnailUrl: '/scenes/scene-05.svg',
      mimeType: 'image/svg+xml',
      width: 1920,
      height: 1080,
    },
    {
      id: 'ast_char_1',
      userId: user.id,
      projectId: project.id,
      name: 'Potret Adi',
      type: 'REFERENCE' as const,
      url: '/characters/adi.svg',
      thumbnailUrl: '/characters/adi.svg',
      mimeType: 'image/svg+xml',
      width: 1024,
      height: 1024,
    },
    {
      id: 'ast_char_2',
      userId: user.id,
      projectId: project.id,
      name: 'Potret Sari',
      type: 'REFERENCE' as const,
      url: '/characters/sari.svg',
      thumbnailUrl: '/characters/sari.svg',
      mimeType: 'image/svg+xml',
      width: 1024,
      height: 1024,
    },
    {
      id: 'ast_char_3',
      userId: user.id,
      projectId: project.id,
      name: 'Potret Bagas',
      type: 'REFERENCE' as const,
      url: '/characters/bagas.svg',
      thumbnailUrl: '/characters/bagas.svg',
      mimeType: 'image/svg+xml',
      width: 1024,
      height: 1024,
    },
    {
      id: 'ast_char_4',
      userId: user.id,
      projectId: project.id,
      name: 'Potret Maya',
      type: 'REFERENCE' as const,
      url: '/characters/maya.svg',
      thumbnailUrl: '/characters/maya.svg',
      mimeType: 'image/svg+xml',
      width: 1024,
      height: 1024,
    },
  ]

  for (const ast of assetsData) {
    await prisma.asset.create({ data: ast })
  }
  console.log(`✅ ${assetsData.length} Aset dibuat.`)

  // 5. Create Characters and Character References
  const charactersData = [
    {
      id: 'chr_1',
      userId: user.id,
      name: 'Adi',
      role: 'Protagonis Utama',
      description: 'Pemuda desa yang mencari jawaban atas rahasia keluarganya.',
      appearance: 'Pria Jawa usia 28 tahun, rahang tegas, tatapan tajam, rambut ikal pendek.',
      clothing: 'Kemeja lurik cokelat tua bergaris halus, celana katun hitam longgar.',
      personality: 'Pemberani, pendiam, penuh tekad, setia kawan.',
      refAssetId: 'ast_char_1',
    },
    {
      id: 'chr_2',
      userId: user.id,
      name: 'Sari',
      role: 'Sahabat & Tabib',
      description: 'Gadis cerdas yang memahami obat tradisional dan manuskrip kuno.',
      appearance: 'Wanita 25 tahun, rambut disanggul rapi dengan tusuk konde kayu sederhana, senyum hangat.',
      clothing: 'Kebaya kutubaru hijau lumut, kain jarik motif parang.',
      personality: 'Cermat, empatik, tenang di bawah tekanan.',
      refAssetId: 'ast_char_2',
    },
    {
      id: 'chr_3',
      userId: user.id,
      name: 'Bagas',
      role: 'Pendukung / Pemandu',
      description: 'Penjaga hutan yang mengenal seluk-beluk jalur malam lereng gunung.',
      appearance: 'Pria tegap usia 35 tahun, bekas luka kecil di alis kiri, kumis tipis.',
      clothing: 'Baju hitam polos tanpa kancing, udeng batik cokelat di kepala.',
      personality: 'Waspada, humoris di saat tak terduga, sangat mengenal alam.',
      refAssetId: 'ast_char_3',
    },
    {
      id: 'chr_4',
      userId: user.id,
      name: 'Maya',
      role: 'Antagonis Misterius',
      description: 'Sosok perempuan misterius yang sering terlihat di sekitar sumur tua saat purnama.',
      appearance: 'Wanita berwajah pucat anggun, tatapan dingin memikat, rambut panjang terurai.',
      clothing: 'Kebaya hitam beledu panjang berhias sulaman emas tipis.',
      personality: 'Misterius, licik, penuh rahasia masa lampau.',
      refAssetId: 'ast_char_4',
    },
  ]

  for (const char of charactersData) {
    const { refAssetId, ...charFields } = char
    const createdChar = await prisma.character.create({
      data: charFields,
    })

    await prisma.characterReference.create({
      data: {
        id: `ref_${createdChar.id}_face`,
        characterId: createdChar.id,
        assetId: refAssetId,
        type: 'FACE',
      },
    })
  }
  console.log(`✅ ${charactersData.length} Karakter & References dibuat.`)

  // 6. Create Scenes
  const scenesData = [
    {
      id: 'scn_1',
      projectId: project.id,
      userId: user.id,
      title: 'Adegan 1: Rumah Joglo Berkabut',
      order: 1,
      prompt: 'Rumah joglo tua beratap kayu di tengah kabut tebal subuh, lentera kecil menyala di teras depan, cinematic 35mm lens, atmospheric lighting.',
      duration: 5,
      aspectRatio: '16:9',
      camera: 'Wide shot, static tripod',
      shotType: 'Wide establishing',
      lighting: 'Dawn mist, warm lantern rim light',
      style: 'Cinematic film grain, 35mm Kodak 5207',
      status: 'READY' as const,
      currentAssetId: 'ast_1',
    },
    {
      id: 'scn_2',
      projectId: project.id,
      userId: user.id,
      title: 'Adegan 2: Sosok di Ambang Pintu',
      order: 2,
      prompt: 'Siluet Adi berdiri di ambang pintu joglo memandang ke luar ke arah kabut pekat, bayangan panjang di lantai kayu.',
      duration: 4,
      aspectRatio: '16:9',
      camera: 'Medium shot, slow push in',
      shotType: 'Medium silhouette',
      lighting: 'Moody interior backlight',
      style: 'Cinematic film grain, shallow depth of field',
      status: 'READY' as const,
      currentAssetId: 'ast_2',
    },
    {
      id: 'scn_3',
      projectId: project.id,
      userId: user.id,
      title: 'Adegan 3: Lentera Minyak di Meja Kayu',
      order: 3,
      prompt: 'Close-up lentera minyak tembaga di atas meja kayu jati usang dengan manuskrip lontar terbentang di sampingnya.',
      duration: 3,
      aspectRatio: '16:9',
      camera: 'Close-up, 50mm lens',
      shotType: 'Macro close-up',
      lighting: 'Flickering warm candle light',
      style: 'Warm amber tones, rich shadows',
      status: 'READY' as const,
      currentAssetId: 'ast_3',
    },
    {
      id: 'scn_4',
      projectId: project.id,
      userId: user.id,
      title: 'Adegan 4: Hutan Bambu Menjelang Senja',
      order: 4,
      prompt: 'Batang-batang bambu rapat bergoyang tertiup angin senja, sorot matahari keemasan menembus dedaunan lebat.',
      duration: 6,
      aspectRatio: '16:9',
      camera: 'Tracking shot, gimbal low angle',
      shotType: 'Medium wide tracking',
      lighting: 'Golden hour volumetric rays',
      style: 'Cinematic anamorphic, green-gold palette',
      status: 'READY' as const,
      currentAssetId: 'ast_4',
    },
    {
      id: 'scn_5',
      projectId: project.id,
      userId: user.id,
      title: 'Adegan 5: Sumur Tua di Belakang Rumah',
      order: 5,
      prompt: 'Sumur batu kuno berlumut di bawah pohon beringin besar, air sumur berkilau memantulkan cahaya bulan sabit.',
      duration: 5,
      aspectRatio: '16:9',
      camera: 'High angle crane down',
      shotType: 'High angle reveal',
      lighting: 'Cool blue moonlight with mystical mist',
      style: 'Night cinematic contrast, deep navy shadows',
      status: 'READY' as const,
      currentAssetId: 'ast_5',
    },
  ]

  for (const scn of scenesData) {
    await prisma.scene.create({ data: scn })
  }
  console.log(`✅ ${scenesData.length} Adegan dibuat.`)

  console.log('🎉 Database seeding selesai dengan sukses!')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
