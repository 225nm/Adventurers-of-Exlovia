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
    maxMp,
    level,
    maxHp
  ) {
    PlayerCharacter.call(
      this,
      scene,
      x,
      y,
      'ranger',
      18,
      'Ranger',
      hp || 70,
      damage || 12,
      xp || 0,
      mp || 50,
      maxMp || 50,
      level || 1,
      maxHp || 70
    )
    this.checkSkills()
    this.flipX = true
    this.setScale(2)
  },
  levelUp: function () {
    this.level += 1
    this.hp += 7
    this.damage += 3
    this.mp += 6
    this.maxMp += 6
    this.checkSkills()
  },
  checkSkills: function () {
    this.skills = rangerSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
