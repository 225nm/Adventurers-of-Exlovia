import { createHeroes } from './heroes'
import { createEnemies } from './enemies'
import { createWorld } from './world'
import { createLogo } from './logo'

// Map sprites, tiles and the title logo are drawn in code at boot. Battle and title sprites and the
// backdrops are PNGs rendered from SVG sources by tools/sprites/render.mjs and loaded in BootScene.preload
export const Art = {
  createAll: function (scene) {
    createHeroes(scene)
    createEnemies(scene)
    createWorld(scene)
    createLogo(scene)
  },
}
