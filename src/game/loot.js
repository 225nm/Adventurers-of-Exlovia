import { itemIndex } from './items/itemIndex'

// First floor each item tier can be found on
const TIER_FLOORS = { 1: 1, 2: 3, 3: 6 }
// Chance that a chest holds a consumable instead of equipment
const CONSUMABLE_CHANCE = 0.6
// Chance that equipment is from the best unlocked tier instead of an older one
const TOP_TIER_CHANCE = 0.65

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const isEquipment = (item) => !!item.slot

export const Loot = {
  // Best item tier available on a floor
  maxTier: function (floor) {
    return Object.keys(TIER_FLOORS)
      .map(Number)
      .filter((tier) => floor >= TIER_FLOORS[tier])
      .reduce((best, tier) => Math.max(best, tier), 1)
  },

  // Item name for a chest on this floor: mostly consumables, sometimes equipment, better on deeper floors
  rollChest: function (floor) {
    const maxTier = this.maxTier(floor)
    const items = Object.values(itemIndex).filter((i) => i.tier <= maxTier)

    if (Math.random() < CONSUMABLE_CHANCE) {
      const consumables = items.filter((i) => !isEquipment(i))
      // stronger potions replace weaker ones as the floors go on, but both can show up
      const best = consumables.filter((i) => i.tier === maxTier)
      return pick(Math.random() < 0.5 && best.length ? best : consumables).name
    }

    const tier =
      maxTier === 1 || Math.random() < TOP_TIER_CHANCE
        ? maxTier
        : 1 + Math.floor(Math.random() * (maxTier - 1))
    return pick(items.filter((i) => isEquipment(i) && i.tier === tier)).name
  },

  // Items dropped by a defeated enemy, each loot table entry rolls on its own
  rollDrops: function (enemy) {
    return enemy.lootTable
      .filter((drop) => Math.random() < drop.chance)
      .map((drop) => drop.item)
  },
}
