import { Enemy } from '../../units'
// Ogre enemy class with specific stats and skills
export let ogre = new Phaser.Class({
  Extends: Enemy,
  initialize: function ogre(scene, x, y) {
    // Parameters: scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable
    Enemy.call(this, scene, x, y, 'ogre', null, 'Ogre', 10, 1, 15, ['Potion'])
    this.skills = [{ name: 'Smash', damage: 6, mpCost: 0, levelReq: 1 }]
  },
})
