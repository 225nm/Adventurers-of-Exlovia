import Phaser from 'phaser'

const save_key = 'party_data'

// Saves game data
export const saveSystem = {
  saveGame: function (registry) {
    const partyData = registry.get('partyData')
    if (partyData) {
      localStorage.setItem(save_key, JSON.stringify(partyData))
    }
  },
  // Loads game data
  loadGame: function (registry) {
    const saveData = localStorage.getItem(save_key)

    if (saveData) {
      const jsonData = JSON.parse(saveData)
      registry.set('partyData', jsonData)
    }
  },
  // Resets game data
  resetGame: function (registry) {
    localStorage.removeItem(save_key)
    window.location.reload()
  },
}
