// Generates the placeholder cinematic stills and character reference plates
// used by the mock generation provider. These stand in for real model output:
// deterministic, palette-matched SVG frames so the UI has believable art
// direction without shipping ten identical grey PNGs.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const root = process.cwd()

// Each scene gets a distinct light setup so frames read as different shots.
const SCENES = [
  {
    file: 'scene-01',
    label: 'Dapur senja',
    sky: ['#2a1c0f', '#120d0a'],
    glow: { x: 62, y: 30, r: 46, color: '#f0b45f', strength: 0.72 },
    haze: 0.4,
    shapes: [
      { type: 'rect', x: 0, y: 68, w: 100, h: 32, fill: '#0d0a08', opacity: 0.95 },
      { type: 'rect', x: 6, y: 34, w: 32, h: 3.5, fill: '#1d1611', opacity: 1 },
      { type: 'rect', x: 10, y: 22, w: 24, h: 2.6, fill: '#1d1611', opacity: 1 },
      { type: 'circle', cx: 62, cy: 20, r: 3.2, fill: '#ffd894', opacity: 0.95 },
      { type: 'rect', x: 61.6, y: 0, w: 0.8, h: 17, fill: '#2b241c', opacity: 1 },
      { type: 'ellipse', cx: 20, cy: 30, rx: 5, ry: 6, fill: '#2b211a', opacity: 0.9 },
      { type: 'ellipse', cx: 30, cy: 31, rx: 4, ry: 5, fill: '#241c16', opacity: 0.9 },
    ],
  },
  {
    file: 'scene-02',
    label: 'Memotong bahan',
    sky: ['#241809', '#0e0a07'],
    glow: { x: 30, y: 24, r: 40, color: '#ffc873', strength: 0.62 },
    haze: 0.22,
    shapes: [
      { type: 'rect', x: 0, y: 58, w: 100, h: 42, fill: '#3a2616', opacity: 1 },
      { type: 'rect', x: 12, y: 54, w: 62, h: 8, fill: '#5b3c22', opacity: 1 },
      { type: 'rect', x: 30, y: 30, w: 44, h: 2.2, fill: '#cfd3d8', opacity: 0.85 },
      { type: 'rect', x: 68, y: 26, w: 8, h: 10, fill: '#2a2118', opacity: 1 },
      { type: 'circle', cx: 26, cy: 55, r: 3.4, fill: '#a8342a', opacity: 0.95 },
      { type: 'circle', cx: 34, cy: 56, r: 2.6, fill: '#8e2c24', opacity: 0.95 },
      { type: 'circle', cx: 44, cy: 55.5, r: 2.2, fill: '#b8452f', opacity: 0.9 },
      { type: 'circle', cx: 52, cy: 56, r: 2.8, fill: '#7d2a20', opacity: 0.9 },
    ],
  },
  {
    file: 'scene-03',
    label: 'Kuah mendidih',
    sky: ['#0f0d0c', '#050505'],
    glow: { x: 50, y: 62, r: 34, color: '#4f9fe0', strength: 0.5 },
    haze: 0.55,
    shapes: [
      { type: 'ellipse', cx: 50, cy: 58, rx: 22, ry: 6, fill: '#7d848c', opacity: 0.95 },
      { type: 'rect', x: 28, y: 58, w: 44, h: 24, fill: '#5f666e', opacity: 1 },
      { type: 'ellipse', cx: 50, cy: 82, rx: 22, ry: 5, fill: '#3f454b', opacity: 1 },
      { type: 'ellipse', cx: 50, cy: 88, rx: 15, ry: 4, fill: '#2b6ea8', opacity: 0.8 },
      { type: 'ellipse', cx: 44, cy: 90, rx: 6, ry: 2.6, fill: '#59a7dd', opacity: 0.85 },
      { type: 'ellipse', cx: 57, cy: 90, rx: 6, ry: 2.6, fill: '#59a7dd', opacity: 0.85 },
      { type: 'ellipse', cx: 50, cy: 40, rx: 13, ry: 15, fill: '#cfd6de', opacity: 0.12 },
      { type: 'ellipse', cx: 46, cy: 22, rx: 9, ry: 12, fill: '#cfd6de', opacity: 0.08 },
    ],
  },
  {
    file: 'scene-04',
    label: 'Meja menunggu',
    sky: ['#111a1f', '#080b0d'],
    glow: { x: 50, y: 26, r: 40, color: '#f2c07a', strength: 0.68 },
    haze: 0.3,
    shapes: [
      { type: 'rect', x: 66, y: 8, w: 30, h: 46, fill: '#1b2b34', opacity: 0.9 },
      { type: 'rect', x: 80, y: 8, w: 1, h: 46, fill: '#0d1418', opacity: 0.9 },
      { type: 'rect', x: 66, y: 30, w: 30, h: 1, fill: '#0d1418', opacity: 0.9 },
      { type: 'rect', x: 0, y: 62, w: 100, h: 38, fill: '#26190f', opacity: 1 },
      { type: 'rect', x: 14, y: 58, w: 58, h: 6, fill: '#3e2a18', opacity: 1 },
      { type: 'circle', cx: 50, cy: 16, r: 3, fill: '#ffdca0', opacity: 0.98 },
      { type: 'rect', x: 49.6, y: 0, w: 0.8, h: 13, fill: '#2a2620', opacity: 1 },
      { type: 'ellipse', cx: 33, cy: 57, rx: 5, ry: 1.8, fill: '#c8c2b4', opacity: 0.75 },
      { type: 'ellipse', cx: 56, cy: 57, rx: 5, ry: 1.8, fill: '#c8c2b4', opacity: 0.75 },
    ],
  },
  {
    file: 'scene-05',
    label: 'Gang setelah hujan',
    sky: ['#111b26', '#070a0e'],
    glow: { x: 52, y: 44, r: 26, color: '#ffbe63', strength: 0.85 },
    haze: 0.62,
    shapes: [
      { type: 'rect', x: 0, y: 0, w: 26, h: 74, fill: '#0d141c', opacity: 1 },
      { type: 'rect', x: 74, y: 0, w: 26, h: 74, fill: '#0b1118', opacity: 1 },
      { type: 'rect', x: 0, y: 70, w: 100, h: 30, fill: '#121a22', opacity: 1 },
      { type: 'rect', x: 44, y: 40, w: 14, h: 12, fill: '#f0ad55', opacity: 0.55 },
      { type: 'rect', x: 46, y: 52, w: 10, h: 18, fill: '#1a232c', opacity: 0.9 },
      { type: 'rect', x: 40, y: 74, w: 22, h: 22, fill: '#e2a054', opacity: 0.14 },
      { type: 'rect', x: 8, y: 18, w: 10, h: 1.4, fill: '#243040', opacity: 1 },
      { type: 'rect', x: 82, y: 24, w: 10, h: 1.4, fill: '#243040', opacity: 1 },
    ],
  },
  {
    file: 'scene-06',
    label: 'Semangkuk soto',
    sky: ['#22160b', '#0d0906'],
    glow: { x: 50, y: 50, r: 42, color: '#ffc978', strength: 0.7 },
    haze: 0.35,
    shapes: [
      { type: 'rect', x: 0, y: 0, w: 100, h: 100, fill: '#3b2715', opacity: 0.55 },
      { type: 'circle', cx: 50, cy: 52, r: 26, fill: '#e8e2d6', opacity: 0.96 },
      { type: 'circle', cx: 50, cy: 52, r: 21, fill: '#c8892f', opacity: 1 },
      { type: 'circle', cx: 50, cy: 52, r: 20, fill: '#d8a03d', opacity: 0.9 },
      { type: 'circle', cx: 43, cy: 47, r: 2.4, fill: '#f4d79a', opacity: 0.95 },
      { type: 'circle', cx: 55, cy: 50, r: 2, fill: '#f4d79a', opacity: 0.9 },
      { type: 'circle', cx: 49, cy: 58, r: 2.2, fill: '#eaca86', opacity: 0.9 },
      { type: 'ellipse', cx: 60, cy: 60, rx: 4.4, ry: 4.4, fill: '#7fae4a', opacity: 0.85 },
      { type: 'ellipse', cx: 50, cy: 26, rx: 11, ry: 12, fill: '#f6ead4', opacity: 0.1 },
    ],
  },
]

// Character plates: a soft key-lit silhouette over a neutral backdrop.
const CHARACTERS = [
  { file: 'adi', initial: 'A', skin: '#8a5c3b', hair: '#171310', cloth: '#4a5238', back: '#1d1b18' },
  { file: 'sari', initial: 'S', skin: '#8f6242', hair: '#2b2320', cloth: '#6b4a52', back: '#211c1a' },
  { file: 'bagas', initial: 'B', skin: '#7d5335', hair: '#100d0c', cloth: '#23262c', back: '#191a1d' },
  { file: 'maya', initial: 'M', skin: '#96684a', hair: '#1c1512', cloth: '#5b6470', back: '#1c1e21' },
]

function shapeToSvg(shape) {
  const o = shape.opacity ?? 1
  if (shape.type === 'rect') {
    return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" fill="${shape.fill}" opacity="${o}"/>`
  }
  if (shape.type === 'circle') {
    return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${shape.fill}" opacity="${o}"/>`
  }
  return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" opacity="${o}"/>`
}

function sceneSvg(scene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56.25" width="1920" height="1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${scene.sky[0]}"/>
      <stop offset="100%" stop-color="${scene.sky[1]}"/>
    </linearGradient>
    <radialGradient id="key" cx="${scene.glow.x}%" cy="${scene.glow.y}%" r="${scene.glow.r}%">
      <stop offset="0%" stop-color="${scene.glow.color}" stop-opacity="${scene.glow.strength}"/>
      <stop offset="55%" stop-color="${scene.glow.color}" stop-opacity="${scene.glow.strength * 0.22}"/>
      <stop offset="100%" stop-color="${scene.glow.color}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="100" height="56.25" fill="url(#sky)"/>
  <g transform="scale(1,0.5625)">
    ${scene.shapes.map(shapeToSvg).join('\n    ')}
  </g>
  <rect width="100" height="56.25" fill="url(#key)"/>
  <rect width="100" height="56.25" fill="#8fb4d8" opacity="${scene.haze * 0.06}"/>
  <rect width="100" height="56.25" fill="url(#vig)"/>
  <rect width="100" height="56.25" filter="url(#grain)" opacity="0.055"/>
</svg>
`
}

function characterSvg(character) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${character.back}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0b0a09" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="rim" cx="34%" cy="26%" r="52%">
      <stop offset="0%" stop-color="#ffd9a1" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#ffd9a1" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="0.7"/></filter>
    <filter id="grain2">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="100" height="100" fill="url(#bg)"/>
  <g filter="url(#soft)">
    <path d="M18 100 C18 76 32 66 50 66 C68 66 82 76 82 100 Z" fill="${character.cloth}"/>
    <rect x="42" y="56" width="16" height="14" rx="5" fill="${character.skin}" opacity="0.92"/>
    <ellipse cx="50" cy="42" rx="16" ry="19" fill="${character.skin}"/>
    <path d="M34 38 C34 24 44 20 50 20 C56 20 66 24 66 38 C66 30 58 27 50 27 C42 27 34 30 34 38 Z" fill="${character.hair}"/>
  </g>
  <rect width="100" height="100" fill="url(#rim)"/>
  <rect width="100" height="100" filter="url(#grain2)" opacity="0.05"/>
</svg>
`
}

async function write(path, contents) {
  const full = join(root, path)
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, contents, 'utf8')
  console.log('wrote', path)
}

for (const scene of SCENES) {
  await write(`public/scenes/${scene.file}.svg`, sceneSvg(scene))
}

for (const character of CHARACTERS) {
  await write(`public/characters/${character.file}.svg`, characterSvg(character))
}
