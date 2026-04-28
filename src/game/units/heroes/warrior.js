import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { warriorSkills } from '../../skills/warriorSkills.js'

export let Warrior = new Phaser.Class({
  Extends: PlayerCharacter,
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
    PlayerCharacter.call(this, scene, x, y, 'player', 1, 'Warrior', 100, 20, 0, 20)
    this.skills = warriorSkills
    this.flipX = true
    this.setScale(2)
  },
})
