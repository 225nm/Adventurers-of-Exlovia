import Phaser from 'phaser'
import { Warrior } from './warrior.js'
import { Mage } from './mage.js'

// individual exports
export { Warrior, Mage }

// list export
export const heroesIndex = {
  Warrior,
  Mage,
}
