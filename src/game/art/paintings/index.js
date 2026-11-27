import { HD, hdTexture } from '../../hd'
import { battlefield } from './battlefield'
import { nightCastle } from './nightCastle'
import {
  treeRound,
  treeDark,
  treePine,
  tuft,
  flowers,
  bush,
  rock,
  mushrooms,
  chest,
  stairs,
} from './mapArt'

// Every painting, by the texture keys it is loaded as. Each painting is rasterized once per key, at
// `size` times its layout size (sharp at that size, instead of scaling one picture down). The
// heroes and monsters are pixel sprites instead (see art/pixel)
const PAINTINGS = [
  // the map's trees, decorations, chests and stairs
  { paint: treeRound, keys: { 'tree-round': 1.35 } },
  { paint: treeDark, keys: { 'tree-dark': 1.35 } },
  { paint: treePine, keys: { 'tree-pine': 1.35 } },
  { paint: tuft, keys: { 'deco-tuft': 1 } },
  { paint: flowers, keys: { 'deco-flowers': 1 } },
  { paint: bush, keys: { 'deco-bush': 1 } },
  { paint: rock, keys: { 'deco-rock': 1 } },
  { paint: mushrooms, keys: { 'deco-mushrooms': 1 } },
  { paint: chest, keys: { chest: 1 } },
  { paint: stairs, keys: { stairs: 1 } },
  // backdrops, as wide as the screen
  { paint: battlefield, keys: { 'battle-bg': 1 } },
  { paint: nightCastle, keys: { 'title-bg': 1 } },
]

export const Paintings = {
  // Queues every painting in the loader as an SVG file, rasterized at screen resolution
  load: function (scene) {
    this.loaded = []
    PAINTINGS.forEach(({ paint, keys }) => {
      const svg = paint()
      const url = URL.createObjectURL(
        new Blob([svg], { type: 'image/svg+xml' })
      )
      Object.entries(keys).forEach(([key, size]) => {
        scene.load.svg(key, url, { scale: HD.ZOOM * size })
        this.loaded.push(key)
      })
    })
  },

  // Marks the loaded paintings as HD textures, so each shows at its intended size in layout units
  register: function (scene) {
    this.loaded.forEach((key) => hdTexture(scene.textures.get(key), HD.ZOOM))
  },
}
