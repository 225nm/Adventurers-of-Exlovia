import Phaser from 'phaser'
import { Unit } from '../../units.js'
import { warriorSkills } from '../../skills/warriorSkills.js'

export let Warrior = new Phaser.Class({
  Extends: Unit,
  initialize: function Warrior(
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
    Unit.call(this, scene, x, y, 'player', 1, 'Warrior', 100, 20, 0, 20)
    this.skills = warriorSkills
    this.flipX = true
    this.setScale(2)
  },
})
