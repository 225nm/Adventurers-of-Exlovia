import { createWorld } from './world'
import { createLogo } from './logo'

// Tiles and the title logo are drawn in code at boot. Heroes and monsters are paintings (see
// paintings/index.js), loaded by BootScene
export const Art = {
  createAll: function (scene) {
    createWorld(scene)
    createLogo(scene)
  },
}
