import { mirror, paint, paintFlat, createTexture } from './pixelArt'

// Original map tiles, chest and stairs.
// The tilemap (map.json) expects a 2x3 sheet of 16px tiles: 1 grass, 2 pine, 3 grass, 4 round tree, 5 dark tree, 6 bush

// Small deterministic random generator, so generated art looks the same every time
export const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Grass with scattered tufts and highlights, flowers on the variant tile
const grassTile = (seed, flowers) => {
  const random = seededRandom(seed)
  const rows = Array.from({ length: 16 }, () => Array(16).fill('g'))
  // sparse, low-contrast detail: the map repeats these two tiles hundreds of times
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(random() * 15)
    const y = 1 + Math.floor(random() * 15)
    // little "v" shaped tuft
    rows[y][x] = 'd'
    rows[y - 1][x + 1] = 'd'
  }
  for (let i = 0; i < 5; i++) {
    rows[Math.floor(random() * 16)][Math.floor(random() * 16)] = 'l'
  }
  if (flowers) {
    for (let i = 0; i < 1; i++) {
      const x = 1 + Math.floor(random() * 14)
      const y = 1 + Math.floor(random() * 14)
      rows[y][x] = i % 2 ? 'f' : 'F'
      rows[y + 1][x] = 'y'
    }
  }
  return rows.map((row) => row.join(''))
}
const GRASS_PALETTE = {
  g: '#5aa83a',
  d: '#4c9432',
  l: '#6cb848',
  f: '#e8e8d8',
  F: '#e88aa0',
  y: '#d8c050',
}

const PINE = mirror([
  '.......o',
  '......ot',
  '.....otT',
  '.....ott',
  '....otTt',
  '....ottt',
  '...otTtt',
  '...otttt',
  '..otTttt',
  '..otttTt',
  '.otTtttt',
  '.ottttTt',
  '.ooooooo',
  '......ok',
  '......ok',
  '.....ooo',
])

const ROUND_TREE = mirror([
  '........',
  '.....ooo',
  '...ooLLl',
  '..oLLlll',
  '.oLlllll',
  '.oLllfll',
  'olllllll',
  'ollfllll',
  'olllllll',
  '.olllldd',
  '.olddddd',
  '..oddddd',
  '...ooook',
  '......ok',
  '......ok',
  '.....ooo',
])

const BUSH = mirror([
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
  '.....ooo',
  '...ooLLl',
  '..oLllll',
  '.oLlllll',
  '.olllldd',
  '.olddddd',
  '..oooooo',
  '........',
  '........',
  '........',
])

const TREE_PALETTE = {
  o: '#10301a',
  t: '#2a7a3a',
  T: '#4aa04a',
  l: '#3a8a3a',
  L: '#6ac050',
  d: '#2a6a2a',
  f: '#e04a3a',
  k: '#6a4428',
}
const DARK_TREE_PALETTE = {
  ...TREE_PALETTE,
  l: '#2a6a40',
  L: '#4a9a5a',
  d: '#1a4a2a',
  f: '#f0c040',
}

const CHEST = mirror([
  '........',
  '........',
  '........',
  '..oooooo',
  '.oWWWWWg',
  '.owwwwwg',
  '.owwwwwg',
  '.oGGGGGG',
  '.owwwwgk',
  '.owwwwgk',
  '.owwwwwg',
  '.oWwwwwg',
  '.owwwwwg',
  '.oGGGGGG',
  '..oooooo',
  '........',
])

const STAIRS = mirror([
  'oooooooo',
  'oSSSSSSS',
  'osssssss',
  'osoooooo',
  'osoSSSSS',
  'osodssss',
  'osodoooo',
  'osodoSSS',
  'osododss',
  'osododdd',
  'osododDD',
  'osododDD',
  'osododDD',
  'osododDD',
  'osososss',
  'oooooooo',
])

export const createWorld = (scene) => {
  // tile sheet in the layout map.json expects
  const tiles = [
    [grassTile(7, false), GRASS_PALETTE],
    [PINE, TREE_PALETTE],
    [grassTile(21, true), GRASS_PALETTE],
    [ROUND_TREE, TREE_PALETTE],
    [ROUND_TREE, DARK_TREE_PALETTE],
    [BUSH, TREE_PALETTE],
  ]
  const sheet = scene.textures.createCanvas('tiles', 32, 48)
  const ctx = sheet.getContext()
  // grass already has its detail colors, shading would outline every tuft
  tiles.forEach(([rows, palette], i) =>
    (palette === GRASS_PALETTE ? paintFlat : paint)(
      ctx,
      rows,
      palette,
      (i % 2) * 16,
      Math.floor(i / 2) * 16
    )
  )
  sheet.refresh()

  createTexture(scene, 'chest', CHEST, {
    o: '#20120a',
    w: '#a0602a',
    W: '#c88040',
    g: '#f0c040',
    G: '#b08020',
    k: '#303030',
  })
  createTexture(scene, 'stairs', STAIRS, {
    o: '#101018',
    s: '#8a8a9a',
    S: '#b8b8c8',
    d: '#3a3a4a',
    D: '#15151f',
  })
}
