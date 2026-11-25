// The tilemap (map.json) marks where the grass and trees are, in a 2x3 sheet of 16px tiles: 1 grass,
// 2 pine, 3 grass, 4 round tree, 5 dark tree, 6 bush. The tiles themselves are never shown: the world
// scene paints the ground (art/ground.js) and stands painted trees on the tree tiles, which still
// block the way. So the sheet is only a blank texture of the right size

// Small deterministic random generator, so the map looks the same every time a floor is visited
export const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// decorations scattered over the grass (paintings, see art/paintings/mapArt.js) and how often each
// one is picked
export const DECORATION_KINDS = [
  ['deco-tuft', 9],
  ['deco-flowers', 6],
  ['deco-bush', 4],
  ['deco-rock', 3],
  ['deco-mushrooms', 2],
]

export const createWorld = (scene) => {
  if (!scene.textures.exists('tiles'))
    scene.textures.createCanvas('tiles', 32, 48)
}
