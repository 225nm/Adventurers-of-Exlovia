import { Enemy } from '../../units'

export let ogre = new Phaser.Class({
  Extends: Enemy,
  initialize: function ogre(scene, x, y) {
    // Parameters: scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable
    Enemy.call(this, scene, x, y, 'ogre', null, 'Ogre', 10, 1, 20, ['Potion'])
  },
})
