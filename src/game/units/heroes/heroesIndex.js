import Phaser from 'phaser'
import { Warrior } from './warrior.js'
import { Mage } from './mage.js'
import { Ranger } from './ranger.js'
// individual exports
export { Warrior, Mage, Ranger }

// list export
export const heroesIndex = {
  Warrior,
  Mage,
  Ranger
}
