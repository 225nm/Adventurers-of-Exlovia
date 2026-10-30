import { mirror, padRows, paint, paintFlat, createTexture } from './pixelArt'

// Original map tiles, chest and stairs.
// The tilemap (map.json) expects a 2x3 sheet of 16px tiles: 1 grass, 2 pine, 3 grass, 4 round tree, 5 dark tree, 6 bush.
// Below those the sheet has grass variants (tiles 7-14) that the world scene scatters over the grass,
// and the trees are drawn as taller sprites over the tree tiles (see WorldScene.plantTrees)

// Small deterministic random generator, so generated art looks the same every time
export const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Grass: short blades (a dark stem with a lit tip) and specks of light and shade, all wrapping around
// the tile edges so the tiles join seamlessly. extra adds a detail: flowers, a stone or clover
const grassTile = (seed, extra) => {
  const random = seededRandom(seed)
  const rows = Array.from({ length: 16 }, () => Array(16).fill('g'))
  const put = (x, y, char) => {
    rows[(y + 16) % 16][(x + 16) % 16] = char
  }
  const spot = () => [Math.floor(random() * 16), Math.floor(random() * 16)]
  for (let i = 0; i < 6; i++) {
    const [x, y] = spot()
    put(x, y, 'd')
    put(x - 1, y - 1, 'd')
    put(x + 1, y - 1, 'l')
    put(x - 1, y - 2, 'h')
  }
  for (let i = 0; i < 5; i++) {
    const [x, y] = spot()
    put(x, y, random() < 0.5 ? 'l' : 'D')
  }
  if (extra) extra(put, spot, random)
  return rows.map((row) => row.join(''))
}
// small five pixel flowers: petals around a center
const flowers = (count, petal, center) => (put, spot) => {
  for (let i = 0; i < count; i++) {
    const [x, y] = spot()
    ;[
      [0, -1],
      [-1, 0],
      [1, 0],
      [0, 1],
    ].forEach(([dx, dy]) => put(x + dx, y + dy, petal))
    put(x, y, center)
  }
}
const stone = (put, spot) => {
  const [x, y] = spot()
  ;['.ss.', 'sSSS', 'SSSS', '.DDD'].forEach((row, dy) =>
    [...row].forEach((char, dx) => char !== '.' && put(x + dx, y + dy, char))
  )
}
const clover = (put, spot, random) => {
  const [x, y] = spot()
  for (let i = 0; i < 9; i++) {
    put(x + Math.floor(random() * 4), y + Math.floor(random() * 3), 'D')
  }
  put(x + 1, y + 1, 'h')
  put(x + 3, y, 'h')
}
const GRASS_PALETTE = {
  g: '#5ea83e',
  d: '#4a9234',
  D: '#3e7e2e',
  l: '#74ba4c',
  h: '#94d066',
  w: '#f6f4e4',
  y: '#f2d24a',
  p: '#f294b0',
  o: '#e8a030',
  s: '#c4c0b0',
  S: '#8a8676',
}
// grass tiles 7-14 and how often each one is picked when the world scene scatters them
export const GRASS_VARIANTS = [
  [7, 20],
  [8, 20],
  [9, 20],
  [10, 20],
  [11, 6],
  [12, 5],
  [13, 3],
  [14, 6],
]

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

// Small decorations scattered over the grass by the world scene (they don't block the way)
const DECORATIONS = {
  'deco-bush': {
    rows: mirror([
      '....oooo',
      '..ooLLll',
      '.oLLllll',
      'oLlllllf',
      'olllllll',
      'olllllld',
      '.oldddd.',
      '..oooooo',
    ]),
    palette: {
      o: '#14381a',
      l: '#3e8c38',
      L: '#78c050',
      d: '#2a6a2a',
      f: '#f0e060',
    },
  },
  'deco-rock': {
    rows: [
      '...oooo...',
      '..oLLsso..',
      '.oLssssso.',
      'oLsssssddo',
      'osssssdddo',
      '.oooooooo.',
    ],
    palette: { o: '#2a2a34', s: '#8a8a9a', L: '#c4c4d0', d: '#5c5c6c' },
  },
  'deco-flowers': {
    rows: [
      '.w....p...',
      'wyw..pyp..',
      '.w.g..p.w.',
      '..g.g..wyw',
      '.g...g..w.',
    ],
    palette: {
      w: { color: '#f8f6ea', flat: true },
      p: { color: '#f494b4', flat: true },
      y: { color: '#f2c83a', flat: true },
      g: { color: '#3e8a30', flat: true },
    },
  },
  'deco-mushrooms': {
    rows: [
      '.ooo....',
      'orrwo...',
      'orrrro..',
      '.osso.oo',
      '..ss.orw',
      '..ss.oro',
      '......s.',
    ],
    palette: { o: '#3a1010', r: '#d83a30', w: '#fff0e0', s: '#f0e0c0' },
  },
  'deco-tuft': {
    rows: ['.l...l..', '.l.l.l.l', 'dl.l.ldl', 'ddldldd.', '.dddddd.'],
    palette: {
      l: { color: '#8ccc5c', flat: true },
      d: { color: '#3e7e2e', flat: true },
    },
  },
}
// decorations and how often each one is picked
export const DECORATION_KINDS = [
  ['deco-tuft', 9],
  ['deco-flowers', 6],
  ['deco-bush', 4],
  ['deco-rock', 3],
  ['deco-mushrooms', 2],
]

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

// Stone stairway going down into the dark: a mossy rim around steps that fade into shadow
const STAIRS = mirror([
  '..oooooo',
  '.oSSmSSS',
  'oSsSSsSS',
  'oSoooooo',
  'oSoAAAAA',
  'oSoaaaaa',
  'oSoBBBBB',
  'oSobbbbb',
  'oSoCCCCC',
  'oSoccccc',
  'oSoDDDDD',
  'oSoKKKKK',
  'oSoKKKKK',
  'oSSsSSsS',
  '.oSSSmSS',
  '..oooooo',
])

export const createWorld = (scene) => {
  // tile sheet in the layout map.json expects, then the grass variants
  const tiles = [
    [grassTile(7), GRASS_PALETTE],
    [PINE, TREE_PALETTE],
    [grassTile(21), GRASS_PALETTE],
    [ROUND_TREE, TREE_PALETTE],
    [ROUND_TREE, DARK_TREE_PALETTE],
    [BUSH, TREE_PALETTE],
    [grassTile(31), GRASS_PALETTE],
    [grassTile(47), GRASS_PALETTE],
    [grassTile(53), GRASS_PALETTE],
    [grassTile(71), GRASS_PALETTE],
    [grassTile(83, flowers(2, 'w', 'y')), GRASS_PALETTE],
    [grassTile(97, flowers(1, 'p', 'y')), GRASS_PALETTE],
    [grassTile(101, stone), GRASS_PALETTE],
    [grassTile(113, clover), GRASS_PALETTE],
  ]
  const sheet = scene.textures.createCanvas('tiles', 32, 112)
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

  Object.entries(DECORATIONS).forEach(([key, art]) =>
    createTexture(scene, key, padRows(art.rows), art.palette)
  )

  createTexture(scene, 'chest', CHEST, {
    o: '#20120a',
    w: '#a0602a',
    W: '#c88040',
    g: '#f0c040',
    G: '#b08020',
    k: '#303030',
  })
  createTexture(scene, 'stairs', STAIRS, {
    o: '#14141e',
    S: '#a8a8b8',
    s: '#76768a',
    m: '#5a9a40',
    A: { color: '#b4b0a6', flat: true },
    a: { color: '#6c685e', flat: true },
    B: { color: '#8a867c', flat: true },
    b: { color: '#4c4842', flat: true },
    C: { color: '#605c56', flat: true },
    c: { color: '#34302c', flat: true },
    D: { color: '#3a3632', flat: true },
    K: { color: '#0c0a0a', flat: true },
  })
}
