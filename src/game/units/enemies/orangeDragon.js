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
      60,
      4,
      20,
      ['Potion']
    )
    this.skills = [
      { name: 'Scorch', damage: 12, mpCost: 0, levelReq: 1 },
    ]
  },
})
