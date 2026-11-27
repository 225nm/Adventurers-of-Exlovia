import Phaser from 'phaser'
import { hdTexture, HD } from '../../hd'
import { warriorSprite } from './warrior'
import { mageSprite } from './mage'
import { rangerSprite } from './ranger'
import {
  slimeSprite,
  batSprite,
  wispFireSprite,
  wispIceSprite,
  goblinSprite,
  darkMageSprite,
  ogreSprite,
  dragonOrangeSprite,
  dragonBlueSprite,
} from './monsters'

// screen pixels per sprite pixel in battle, menus showing a battle sprite scale it from this
export const BATTLE_PIXEL = 6
// on the map: the leader and the monsters roaming it
const MAP_PIXEL = 2

// The pixel sprites, by the texture keys they are made as and how many screen pixels each sprite
// pixel takes there. Whole numbers keep every pixel the same size on the 1920x1080 screen. Keys
// made here replace the paintings of the same name (see paintings/index.js)
const SPRITES = [
  {
    make: warriorSprite,
    keys: {
      'battler-warrior': BATTLE_PIXEL,
      'map-warrior': MAP_PIXEL,
      'title-knight': 10,
    },
  },
  {
    make: mageSprite,
    keys: {
      'battler-mage': BATTLE_PIXEL,
      'map-mage': MAP_PIXEL,
      'title-mage': 10,
    },
  },
  {
    make: rangerSprite,
    keys: { 'battler-ranger': BATTLE_PIXEL, 'map-ranger': MAP_PIXEL },
  },
  ...[
    ['slime', slimeSprite],
    ['bat', batSprite],
    ['goblin', goblinSprite],
    ['wisp-fire', wispFireSprite],
    ['wisp-ice', wispIceSprite],
    ['dark-mage', darkMageSprite],
    ['ogre', ogreSprite],
    ['dragon-orange', dragonOrangeSprite],
    ['dragon-blue', dragonBlueSprite],
  ].map(([key, make]) => ({
    make,
    keys: { [key]: BATTLE_PIXEL, [`${key}-mini`]: MAP_PIXEL },
  })),
]

export const PixelSprites = {
  keys: function () {
    return SPRITES.flatMap(({ keys }) => Object.keys(keys))
  },

  // Draws every sprite into a texture per key, called once by the boot scene
  create: function (scene) {
    SPRITES.forEach(({ make, keys }) => {
      const sprite = make()
      Object.entries(keys).forEach(([key, size]) => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
        const texture = scene.textures.createCanvas(
          key,
          sprite.w * size,
          sprite.h * size
        )
        sprite.draw(texture.getContext(), size)
        texture.refresh()
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
        hdTexture(texture, HD.ZOOM)
      })
    })
  },
}
