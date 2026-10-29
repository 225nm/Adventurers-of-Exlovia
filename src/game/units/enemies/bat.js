import Phaser from 'phaser'
import { Enemy } from '../../units'
// Bat: fragile but bites hard for its size
export let bat = new Phaser.Class({
  Extends: Enemy,
  initialize: function bat(scene, x, y) {
    Enemy.call(this, scene, x, y, bat.sprite, bat.stats)
  },
})
bat.minFloor = 1
bat.sprite = { texture: 'bat', scale: 2, worldScale: 1 }
bat.stats = {
  name: 'Bat',
  hp: 14,
  damage: 5,
  magicDefense: 1,
  xp: 6,
  loot: [{ item: 'Potion', chance: 0.15 }],
  skills: [{ name: 'Bite', power: 1.5, type: 'physical' }],
}
