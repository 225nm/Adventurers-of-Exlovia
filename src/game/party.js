import Phaser from 'phaser'
import { skillsIndex } from './skills/skillsIndex'
import { heroesIndex } from './units/heroes/heroesIndex'

// AI generated party creator
export const Party = {
  /**
   * Generates a fresh party based on the hero classes' baseStats.
   */
  getStartingParty: function() {
    // starting lineup
    const lineup = ['Warrior', 'Mage']; 
    
    return lineup.map(className => {
      const HeroClass = heroesIndex[className];
      
      if (HeroClass && HeroClass.baseStats) {
        // Return a copy of the baseStats
        return { ...HeroClass.baseStats };
      }
      
      return null;
    }).filter(h => h !== null);
  }
};
//Party with warrior and mage
/* export let Party = {
  Heroes: [
    {
      type: 'Warrior',
      name: 'todowar',
      hp: 100,
      damage: 20,
      mp: 20,
      maxMp: 20,
      xp: 0,
      level: 1,
      skills: skillsIndex.warriorSkills,
    },
    {
      type: 'Mage',
      name: 'todomage',
      hp: 80,
      damage: 8,
      mp: 50,
      maxMp: 50,
      xp: 0,
      level: 1,
      skills: skillsIndex.mageSkills,
    },
  ],
}
 */
/* 
//Party with warrior and ranger
export let Party = {
  Heroes: [
    {
      type: 'Warrior',
      name: 'todowar',
      hp: 100,
      damage: 20,
      mp: 20,
      maxMp: 20,
      xp: 0,
      level: 1,
      skills: skillsIndex.warriorSkills,
    },
    {
      type: 'Ranger',
      name: 'todoranger',
      hp: 70,
      damage: 12,
      mp: 50,
      maxMp: 50,
      xp: 0,
      level: 1,
      skills: skillsIndex.rangerSkills,
    },
  ],
} */
