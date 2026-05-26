import Phaser from 'phaser'
import { skillsIndex } from './skills/skillsIndex'
import { heroesIndex } from './units/heroes/heroesIndex'
// Party management module
export const Party = {
  /**
   * Generates a fresh party based on the hero classes' baseStats.
   */
  getStartingParty: function () {
    // starting lineup
    const lineup = ['Warrior', 'Mage']

    return lineup
      .map((className) => {
        const HeroClass = heroesIndex[className]

        if (HeroClass && HeroClass.baseStats) {
          // Return a copy of the baseStats
          return { ...HeroClass.baseStats }
        }

        return null
      })
      .filter((h) => h !== null)
  },
}
