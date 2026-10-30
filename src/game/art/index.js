import { createHeroes } from './heroes'
import { createEnemies } from './enemies'
import { createWorld } from './world'
import { createBackdrops } from './backdrops'

// Map sprites, tiles and backgrounds are drawn in code at boot. Battle and title sprites are PNGs
// rendered from SVG sources by tools/sprites/render.mjs and loaded in BootScene.preload
export const Art = {
  createAll: function (scene) {
    createHeroes(scene)
    createEnemies(scene)
    createWorld(scene)
    createBackdrops(scene)
  },
}
