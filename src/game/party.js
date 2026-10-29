import Phaser from 'phaser'
import { skillsIndex } from './skills/skillsIndex'
import { heroesIndex } from './units/heroes/heroesIndex'
// Party management module
// The starting party is chosen on PartySelectScene
export const Party = {
  /**
   * Creates a hero's party data at the given level, as if it had leveled up from 1.
   */
  createHero: function (className, level) {
    const HeroClass = heroesIndex[className]
    if (!HeroClass || !HeroClass.baseStats) {
      return null
    }
    const base = HeroClass.baseStats
    const growth = HeroClass.growth
    const levels = level - 1
    const maxHp = base.maxHp + growth.hp * levels
    const maxMp = base.maxMp + growth.mp * levels

    return {
      ...base,
      level: level,
      hp: maxHp,
      maxHp: maxHp,
      mp: maxMp,
      maxMp: maxMp,
      damage: base.damage + growth.damage * levels,
      magic: base.magic + growth.magic * levels,
      // own object, so equipping never changes the class's baseStats
      equipment: { weapon: null, armor: null },
    }
  },
}
