import Phaser from 'phaser'
import { Enemy } from '../../units'
// Ogre: thick hide shrugs off magic, but blades get through
export let ogre = new Phaser.Class({
  Extends: Enemy,
  initialize: function ogre(scene, x, y) {
    Enemy.call(this, scene, x, y, ogre.sprite, ogre.stats)
  },
})
ogre.minFloor = 2
ogre.sprite = {
  texture: 'ogre',
  world: 'ogre-mini',
  scale: 1,
  worldScale: 0.75,
}
ogre.stats = {
  name: 'Ogre',
  hp: 40,
  damage: 7,
  defense: 1,
  magicDefense: 3,
  xp: 14,
  loot: [
    { item: 'Potion', chance: 0.3 },
    { item: 'Leather Armor', chance: 0.05 },
  ],
  skills: [{ name: 'Smash', power: 1.8, type: 'physical' }],
}
