import Phaser from 'phaser'
import { Unit } from '../../units.js'
import { mageSkills } from '../../skills/mageSkills.js'

export let Mage = new Phaser.Class({
  Extends: Unit,
  initialize: function Mage(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage,
    xp,
    mp
  ) {
    Unit.call(this, scene, x, y, 'player', 4, 'Mage', 80, 8, 0, 50)
    this.skills = mageSkills
    this.flipX = true
    this.setScale(2)
  },
})
