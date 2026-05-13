import { Enemy } from '../../units'

export let blueDragon = new Phaser.Class({
  Extends: Enemy,
  initialize: function blueDragon(scene, x, y) {
    // Parameters: scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable
    Enemy.call(this, scene, x, y, 'dragonblue', null, 'B. Dragon', 60, 4, 30, [
      'Potion',
    ])
  },
})
