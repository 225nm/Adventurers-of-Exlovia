import Phaser from 'phaser'
import { Enemy } from '../../units'
// Slime: the weakest enemy, only found near the surface
export let slime = new Phaser.Class({
  Extends: Enemy,
  initialize: function slime(scene, x, y) {
    Enemy.call(this, scene, x, y, slime.sprite, slime.stats)
  },
})
slime.minFloor = 1
slime.sprite = {
  texture: 'slime',
  world: 'slime-mini',
  scale: 1,
  worldScale: 1,
}
slime.stats = {
  name: 'Slime',
  hp: 18,
  damage: 4,
  speed: 6,
  xp: 6,
  loot: [{ item: 'Potion', chance: 0.25 }],
  skills: [],
}
