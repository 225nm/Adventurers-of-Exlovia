import Phaser from 'phaser'
import { Enemy } from '../../units'
// Blue Dragon: the strongest dragon, hard scales block weapons, magic gets through
export let blueDragon = new Phaser.Class({
  Extends: Enemy,
  initialize: function blueDragon(scene, x, y) {
    Enemy.call(this, scene, x, y, blueDragon.sprite, blueDragon.stats)
  },
})
blueDragon.minFloor = 5
blueDragon.sprite = {
  texture: 'dragon-blue',
  world: 'dragon-blue-mini',
  scale: 1,
  worldScale: 0.8,
}
blueDragon.stats = {
  name: 'B. Dragon',
  hp: 110,
  damage: 11,
  speed: 8,
  magic: 12,
  defense: 5,
  magicDefense: 2,
  xp: 45,
  loot: [
    { item: 'Hi-Potion', chance: 0.3 },
    { item: 'Steel Sword', chance: 0.08 },
    { item: 'Iron Plate', chance: 0.06 },
  ],
  skills: [
    {
      name: 'Scorch',
      power: 1.1,
      type: 'magic',
      element: 'fire',
      target: 'all',
    },
    {
      name: 'Flame Breath',
      power: 1.4,
      type: 'magic',
      element: 'fire',
      target: 'all',
    },
  ],
}
