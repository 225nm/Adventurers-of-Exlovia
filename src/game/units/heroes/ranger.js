import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { rangerSkills } from '../../skills/rangerSkills.js'

export let Ranger = new Phaser.Class({
  Extends: PlayerCharacter,
  initialize: function Ranger(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage,
    xp,
    mp,
    maxMp
  ) {
    PlayerCharacter.call(this, scene, x, y, 'ranger', 18, 'Ranger', 70, 12, 0, 50, 50)
    this.skills = rangerSkills
    this.flipX = true
    this.setScale(2)
  },
})
