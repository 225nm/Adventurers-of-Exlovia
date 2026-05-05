import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { warriorSkills } from '../../skills/warriorSkills.js'
import { skillsIndex } from '../../skills/skillsIndex.js'

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
      1,
      'Warrior',
      hp || 100, //hp
      damage || 20, //dmg
      xp || 0, //xp
      mp || 20, //mp
      maxMp || 20, //maxmp
      level || 1, //level
      maxHp || 100 //maxhp
    )
    //this.skills = [...warriorSkills]
    this.checkSkills()
    this.flipX = true
    this.setScale(2)
  },
  levelUp: function () {
    this.level += 1
    this.hp += 10
    this.maxHp += 10
    this.damage += 4
    this.mp += 5
    this.maxMp += 5
    // check for new skills on level up
    this.checkSkills()
  },
  checkSkills: function () {
    this.skills = warriorSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
Warrior.baseStats = {
  type: 'Warrior',
  hp: 100,
  maxHp: 100,
  mp: 20,
  maxMp: 20,
  xp: 0,
  level: 1,
  damage: 20,
  skills: warriorSkills.filter(s => s.levelReq <= 1)
}
