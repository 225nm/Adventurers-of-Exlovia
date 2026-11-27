import { HD, hdTexture } from '../../hd'
import { warrior } from './warrior'
import { mage } from './mage'
import { ranger } from './ranger'
import { slime, bat, wispFire, wispIce } from './monsters'
import { goblin, darkMage, ogre, dragonOrange, dragonBlue } from './brutes'
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

// Battle sprites are painted larger than their layout size, so the fighters fill the field. Menus
// that show a battle sprite scale it back by this
export const BATTLE_SCALE = 1.3
const B = BATTLE_SCALE

// Every painting, by the texture keys it is loaded as. Each painting is rasterized once per key, at
// `size` times its layout size (sharp at that size, instead of scaling one picture down):
//   battle sprites at BATTLE_SCALE (big monsters a little less), the title figures twice as big, and small copies for the map
//   (map-<hero> for the leader, <monster>-mini for the monsters roaming the map)
const PAINTINGS = [
  {
    paint: warrior,
    keys: { 'battler-warrior': B, 'title-knight': 2, 'map-warrior': 0.45 },
  },
  {
    paint: mage,
    keys: { 'battler-mage': B, 'title-mage': 2, 'map-mage': 0.45 },
  },
  { paint: ranger, keys: { 'battler-ranger': B, 'map-ranger': 0.45 } },
  { paint: slime, keys: { slime: B, 'slime-mini': 0.45 } },
  { paint: bat, keys: { bat: B, 'bat-mini': 0.38 } },
  { paint: goblin, keys: { goblin: B, 'goblin-mini': 0.42 } },
  { paint: wispFire, keys: { 'wisp-fire': B, 'wisp-fire-mini': 0.45 } },
  { paint: wispIce, keys: { 'wisp-ice': B, 'wisp-ice-mini': 0.45 } },
  { paint: darkMage, keys: { 'dark-mage': B, 'dark-mage-mini': 0.4 } },
  { paint: ogre, keys: { ogre: 1.15, 'ogre-mini': 0.36 } },
  {
    paint: dragonOrange,
    keys: { 'dragon-orange': 1.15, 'dragon-orange-mini': 0.3 },
  },
  { paint: dragonBlue, keys: { 'dragon-blue': 1.15, 'dragon-blue-mini': 0.3 } },
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
