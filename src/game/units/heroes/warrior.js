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
      'battler-warrior',
      null,
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
    this.magic = Warrior.baseStats.magic
  },
  levelUp: function () {
    this.gainLevel(Warrior.growth)
    // check for new skills on level up
    this.checkSkills()
  },
  checkSkills: function () {
    this.skills = warriorSkills.filter((skill) => this.level >= skill.levelReq)
  },
})
// stats gained per level, also used to recruit heroes at higher levels and upgrade old saves
Warrior.growth = { hp: 10, mp: 5, damage: 4, magic: 1 }
// shown on the party selection screen
Warrior.description = 'Melee tank'
Warrior.sprite = { texture: 'hero-warrior', frame: 'down0' }
Warrior.baseStats = {
  type: 'Warrior',
  hp: 100,
  maxHp: 100,
  mp: 20,
  maxMp: 20,
  xp: 0,
  level: 1,
  damage: 20,
  magic: 2,
  skills: warriorSkills.filter((s) => s.levelReq <= 1),
  equipment: { weapon: null, armor: null },
}
