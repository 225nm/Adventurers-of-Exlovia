import Phaser from 'phaser'
import { Potion } from './potion'
import { Elixir } from './elixir'
import { IronSword, HuntingBow, OakStaff } from './weapons'
import { LeatherArmor, ChainMail, MageRobe } from './armor'
// individual exports
export { Potion }
export { Elixir }
export { IronSword, HuntingBow, OakStaff }
export { LeatherArmor, ChainMail, MageRobe }
// list export, keys must match the item names stored in the inventory
export const itemIndex = {
  Potion,
  Elixir,
  'Iron Sword': IronSword,
  'Hunting Bow': HuntingBow,
  'Oak Staff': OakStaff,
  'Leather Armor': LeatherArmor,
  'Chain Mail': ChainMail,
  'Mage Robe': MageRobe,
}
