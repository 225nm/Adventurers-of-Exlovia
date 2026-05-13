import Phaser from 'phaser'

const save_key = 'party_data'

// Saves game data
export const saveSystem = {
  saveGame: function (registry) {
    const partyData = registry.get('partyData')
    const inventoryData = registry.get('inventory')
    const fullSaveData = {
      party: partyData,
      inventory: inventoryData,
    }
    if (partyData) {
      localStorage.setItem(save_key, JSON.stringify(fullSaveData))
    }
  },
  // Loads game data
  loadGame: function (registry) {
    const saveData = localStorage.getItem(save_key)

    if (saveData) {
      const jsonData = JSON.parse(saveData)

      if (jsonData.party) {
        registry.set('partyData', jsonData.party)
      }
      if (jsonData.inventory) {
        registry.set('inventory', jsonData.inventory)
      }
    }
  },
  // Resets game data
  resetGame: function (registry) {
    localStorage.removeItem(save_key)
    window.location.reload()
  },
}
