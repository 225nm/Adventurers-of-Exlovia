import { slime } from './slime'
import { bat } from './bat'
import { ogre } from './ogre'
import { goblin } from './goblin'
import { fireWisp } from './fireWisp'
import { frostWisp } from './frostWisp'
import { orangeDragon } from './orangeDragon'
import { darkMage } from './darkMage'
import { blueDragon } from './blueDragon'

// individual exports
export {
  slime,
  bat,
  ogre,
  goblin,
  fireWisp,
  frostWisp,
  orangeDragon,
  darkMage,
  blueDragon,
}

// list export, each enemy's minFloor decides where it starts appearing (see progression.js)
export const enemiesIndex = {
  slime,
  bat,
  ogre,
  goblin,
  fireWisp,
  frostWisp,
  orangeDragon,
  darkMage,
  blueDragon,
}
