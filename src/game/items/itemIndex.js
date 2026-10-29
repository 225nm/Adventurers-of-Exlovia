import Phaser from 'phaser'
import * as potions from './potion'
import * as elixirs from './elixir'
import * as weapons from './weapons'
import * as armor from './armor'
// individual exports
export * from './potion'
export * from './elixir'
export * from './weapons'
export * from './armor'

// list export, keyed by the item names stored in the inventory
export const itemIndex = {}
;[potions, elixirs, weapons, armor].forEach((group) =>
  Object.values(group).forEach((item) => {
    itemIndex[item.name] = item
  })
)
