import { Enemy } from '../../units'
// Ogre enemy class with specific stats and skills
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
    // hard scales block weapons, magic gets through
    this.defense = 4
    this.magicDefense = 1
    this.skills = [
      {
        name: 'Scorch',
        damage: 12,
        mpCost: 0,
        levelReq: 1,
        target: 'all',
        type: 'magic',
        element: 'fire',
      },
    ]
  },
})
