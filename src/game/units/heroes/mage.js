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
      'battler-mage',
      null,
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
    this.magic = Mage.baseStats.magic
    this.speed = Mage.baseStats.speed
  },
  levelUp: function () {
    this.gainLevel(Mage.growth)
    this.checkSkills()
  },
  // AI suggested syntax, checks which skills are available based on level
  checkSkills: function () {
    this.skills = mageSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
// stats gained per level, also used to recruit heroes at higher levels and upgrade old saves
Mage.growth = { hp: 6, mp: 8, damage: 2, magic: 3, speed: 1 }
// shown on the party selection screen
Mage.description = 'Spellcaster'
Mage.sprite = { texture: 'hero-mage', frame: 'down0' }
Mage.baseStats = {
  type: 'Mage',
  hp: 80,
  maxHp: 80,
  mp: 50,
  maxMp: 50,
  xp: 0,
  level: 1,
  damage: 8,
  magic: 8,
  speed: 9,
  skills: mageSkills.filter((s) => s.levelReq <= 1),
  equipment: { weapon: null, armor: null },
}
