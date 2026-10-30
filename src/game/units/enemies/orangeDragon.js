import Phaser from 'phaser'
import { Enemy } from '../../units'
// Orange Dragon: hard scales block weapons, magic gets through
export let orangeDragon = new Phaser.Class({
  Extends: Enemy,
  initialize: function orangeDragon(scene, x, y) {
    Enemy.call(this, scene, x, y, orangeDragon.sprite, orangeDragon.stats)
  },
})
orangeDragon.minFloor = 3
orangeDragon.sprite = {
  texture: 'dragon-orange',
  world: 'dragon-orange-mini',
  scale: 1,
  worldScale: 0.8,
}
orangeDragon.stats = {
  name: 'O. Dragon',
  hp: 70,
  damage: 9,
  magic: 10,
  defense: 4,
  magicDefense: 1,
  xp: 26,
  loot: [
    { item: 'Potion', chance: 0.4 },
    { item: 'Chain Mail', chance: 0.06 },
  ],
  skills: [
    {
      name: 'Scorch',
      power: 1.1,
      type: 'magic',
      element: 'fire',
      target: 'all',
    },
  ],
}
