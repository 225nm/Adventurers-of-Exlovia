import Phaser from 'phaser'
import { heroesIndex } from './units/heroes/heroesIndex'

const save_key = 'party_data'
// Version 1: no version field, heroes have no magic stat or equipment
// Version 2: heroes have magic and equipment
// Version 3: the dungeon floor is saved, older saves start on floor 1
// Version 4: heroes have speed
const SAVE_VERSION = 4

// Fills in stats that older saves don't have, as if the hero had them since level 1
export function migrateHero(hero) {
  const HeroClass = heroesIndex[hero.type] || {}
  const base = HeroClass.baseStats || {}
  const growth = HeroClass.growth || {}
  const levels = (hero.level || 1) - 1
  return {
    ...hero,
    magic: hero.magic ?? (base.magic || 0) + levels * (growth.magic || 0),
    speed: hero.speed ?? (base.speed || 10) + levels * (growth.speed || 0),
    equipment: hero.equipment || { weapon: null, armor: null },
  }
}

// Save system to handle saving and loading game data
export const saveSystem = {
  saveGame: function (registry) {
    const partyData = registry.get('partyData')
    const inventoryData = registry.get('inventory')
    const fullSaveData = {
      version: SAVE_VERSION,
      party: partyData,
      inventory: inventoryData,
      floor: registry.get('floor') || 1,
    }
    if (partyData) {
      localStorage.setItem(save_key, JSON.stringify(fullSaveData))
    }
  },
  // Loads game data, upgrading saves made by older versions of the game
  loadGame: function (registry) {
    const saveData = localStorage.getItem(save_key)

    if (saveData) {
      const jsonData = JSON.parse(saveData)

      if (jsonData.party) {
        registry.set('partyData', jsonData.party.map(migrateHero))
      }
      if (jsonData.inventory) {
        registry.set('inventory', jsonData.inventory)
      }
      registry.set('floor', jsonData.floor || 1)
    }
  },
  // Resets game data
  resetGame: function (registry) {
    localStorage.removeItem(save_key)
    window.location.reload()
  },
}
