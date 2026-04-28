import { Enemy } from '../../units'

export let orangeDragon = new Phaser.Class({
  Extends: Enemy,
  initialize: function orangeDragon(scene, x, y) {
    // Parameters: scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable
    // leave orrange typo in i guess
    Enemy.call(
      this,
      scene,
      x,
      y,
      'dragonorrange',
      null,
      'O. Dragon',
      50,
      3,
      20,
      ['loottable orng']
    )
  },
})
