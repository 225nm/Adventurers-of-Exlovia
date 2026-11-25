import { HD, hdTexture } from '../../hd'
import { warrior } from './warrior'
import { mage } from './mage'
import { ranger } from './ranger'
import { slime, bat, wispFire, wispIce } from './monsters'
import { goblin, darkMage, ogre, dragonOrange, dragonBlue } from './brutes'

// Every painting, by the texture keys it is loaded as. Each painting is rasterized once per key, at
// `size` times its layout size (sharp at that size, instead of scaling one picture down):
//   battle sprites at their full size, the title figures twice as big, and small copies for the map
//   (map-<hero> for the leader, <monster>-mini for the monsters roaming the map)
const PAINTINGS = [
  {
    paint: warrior,
    keys: { 'battler-warrior': 1, 'title-knight': 2, 'map-warrior': 0.45 },
  },
  {
    paint: mage,
    keys: { 'battler-mage': 1, 'title-mage': 2, 'map-mage': 0.45 },
  },
  { paint: ranger, keys: { 'battler-ranger': 1, 'map-ranger': 0.45 } },
  { paint: slime, keys: { slime: 1, 'slime-mini': 0.45 } },
  { paint: bat, keys: { bat: 1, 'bat-mini': 0.38 } },
  { paint: goblin, keys: { goblin: 1, 'goblin-mini': 0.42 } },
  { paint: wispFire, keys: { 'wisp-fire': 1, 'wisp-fire-mini': 0.45 } },
  { paint: wispIce, keys: { 'wisp-ice': 1, 'wisp-ice-mini': 0.45 } },
  { paint: darkMage, keys: { 'dark-mage': 1, 'dark-mage-mini': 0.4 } },
  { paint: ogre, keys: { ogre: 1, 'ogre-mini': 0.36 } },
  {
    paint: dragonOrange,
    keys: { 'dragon-orange': 1, 'dragon-orange-mini': 0.3 },
  },
  { paint: dragonBlue, keys: { 'dragon-blue': 1, 'dragon-blue-mini': 0.3 } },
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
