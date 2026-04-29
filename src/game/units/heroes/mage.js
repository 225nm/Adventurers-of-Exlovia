import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { mageSkills } from '../../skills/mageSkills.js'

export let Mage = new Phaser.Class({
  Extends: PlayerCharacter,
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
    mp,
    maxMp
  ) {
    PlayerCharacter.call(this, scene, x, y, 'player', 4, 'Mage', 80, 8, 0, 50, 50)
    this.skills = mageSkills
    this.flipX = true
    this.setScale(2)
  },
})
