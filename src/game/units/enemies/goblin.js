import Phaser from 'phaser'
import { Enemy } from '../../units'
// Goblin: spear fighter with sturdy armor
export let goblin = new Phaser.Class({
  Extends: Enemy,
  initialize: function goblin(scene, x, y) {
    Enemy.call(this, scene, x, y, goblin.sprite, goblin.stats)
  },
})
goblin.minFloor = 2
// the sprite faces left, flipped to face the heroes
goblin.sprite = {
  texture: 'monsters',
  frame: 'goblin',
  scale: 1.2,
  worldScale: 0.7,
  flipX: true,
}
goblin.stats = {
  name: 'Goblin',
  hp: 32,
  damage: 8,
  defense: 2,
  xp: 12,
  loot: [
    { item: 'Potion', chance: 0.3 },
    { item: 'Iron Sword', chance: 0.06 },
    { item: 'Hunting Bow', chance: 0.06 },
  ],
  skills: [{ name: 'Spear Thrust', power: 1.7, type: 'physical' }],
}
