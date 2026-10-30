import { itemIndex } from './items/itemIndex'

// Equipment module, works on the plain hero objects stored in partyData
export const Equipment = {
  slots: ['weapon', 'armor'],
  stats: ['attack', 'magic', 'defense', 'magicDefense', 'speed'],

  // Sums a stat (one of the stats above) over everything the hero has equipped
  getBonus: function (hero, stat) {
    const equipped = hero.equipment || {}
    return this.slots.reduce((total, slot) => {
      const itemData = itemIndex[equipped[slot]]
      return total + ((itemData && itemData[stat]) || 0)
    }, 0)
  },

  // Stat change the hero would get from equipping the item, compared to what is in that slot now
  getGain: function (hero, itemName) {
    const itemData = itemIndex[itemName]
    const equipped = hero.equipment || {}
    const current = itemIndex[equipped[itemData.slot]] || {}
    const gain = {}
    this.stats.forEach((stat) => {
      gain[stat] = (itemData[stat] || 0) - (current[stat] || 0)
    })
    return gain
  },

  // Moves an item from the inventory to the hero, returning the old item to the inventory
  equip: function (hero, itemName, inventory) {
    const itemData = itemIndex[itemName]
    if (!itemData || !itemData.slot) {
      return false
    }
    if (!inventory.removeItem(itemName, 1)) {
      return false
    }
    // saves from before equipment existed have no equipment object
    const equipped = hero.equipment || { weapon: null, armor: null }

    const previous = equipped[itemData.slot]
    if (previous) {
      inventory.addItem(previous, 1)
    }
    // new object instead of mutating, the starting party shares it with the hero's baseStats
    hero.equipment = { ...equipped, [itemData.slot]: itemName }
    return true
  },
}
