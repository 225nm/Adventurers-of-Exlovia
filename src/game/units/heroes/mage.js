import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { mageSkills } from '../../skills/mageSkills.js'
import { skillsIndex } from '../../skills/skillsIndex.js'

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
    maxMp,
    level,
    maxHp
  ) {
    PlayerCharacter.call(
      this,
      scene,
      x,
      y,
      'player',
      4,
      'Mage',
      hp || 80,
      damage || 8,
      xp || 0,
      mp || 50,
      maxMp || 50,
      level || 1,
      maxHp || 80
    )
    this.checkSkills()
    this.flipX = true
    this.setScale(2)
  },
  levelUp: function () {
    this.level += 1
    this.hp += 6
    this.maxHp += 6
    this.damage += 2
    this.mp += 8
    this.maxMp += 8
    this.checkSkills()
  },
  // AI suggested syntax, checks which skills are available based on level
  checkSkills: function () {
    this.skills = mageSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
Mage.baseStats = {
    type: 'Mage',
    hp: 80,
    maxHp: 80,
    mp: 50,
    maxMp: 50,
    xp: 0,
    level: 1,
    damage: 8,
    skills: mageSkills.filter(s => s.levelReq <= 1)
};