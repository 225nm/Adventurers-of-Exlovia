import Phaser from 'phaser'
import { PlayerCharacter } from '../../units.js'
import { rangerSkills } from '../../skills/rangerSkills.js'
import { skillsIndex } from '../../skills/skillsIndex.js'

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
      'battler-ranger',
      null,
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
    // shoots arrows instead of running up to the target
    this.ranged = true
    this.flipX = true
    this.magic = Ranger.baseStats.magic
  },
  levelUp: function () {
    this.gainLevel(Ranger.growth)
    this.checkSkills()
  },
  checkSkills: function () {
    this.skills = rangerSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
// stats gained per level, also used to recruit heroes at higher levels and upgrade old saves
Ranger.growth = { hp: 7, mp: 6, damage: 3, magic: 1 }
// shown on the party selection screen
Ranger.description = 'Fast archer'
Ranger.sprite = { texture: 'hero-ranger', frame: 'down0' }
Ranger.baseStats = {
  type: 'Ranger',
  hp: 70,
  maxHp: 70,
  mp: 50,
  maxMp: 50,
  xp: 0,
  level: 1,
  damage: 12,
  magic: 4,
  skills: rangerSkills.filter((s) => s.levelReq <= 1),
  equipment: { weapon: null, armor: null },
}
