import { createHeroes } from './heroes'
import { createEnemies } from './enemies'
import { createWorld } from './world'
import { createBackdrops } from './backdrops'
import { createBattlers } from './battlers'

// All of the game's art is original and drawn in code at boot, only the font is loaded from files
export const Art = {
  createAll: function (scene) {
    createHeroes(scene)
    createEnemies(scene)
    createBattlers(scene)
    createWorld(scene)
    createBackdrops(scene)
  },
}
