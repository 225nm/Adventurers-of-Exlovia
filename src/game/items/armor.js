// Armor with defense reduces physical damage, magicDefense reduces magic damage
// tier 1 from floor 1, tier 2 from floor 3, tier 3 from floor 6

// ---- tier 1 ----
export const LeatherArmor = {
  name: 'Leather Armor',
  description: 'Defense +1',
  slot: 'armor',
  defense: 1,
  tier: 1,
}

export const ChainMail = {
  name: 'Chain Mail',
  description: 'Defense +3',
  slot: 'armor',
  defense: 3,
  tier: 1,
}

export const MageRobe = {
  name: 'Mage Robe',
  description: 'Magic Defense +3',
  slot: 'armor',
  magicDefense: 3,
  tier: 1,
}

// ---- tier 2 ----
export const IronPlate = {
  name: 'Iron Plate',
  description: 'Defense +6',
  slot: 'armor',
  defense: 6,
  tier: 2,
}

export const SilkRobe = {
  name: 'Silk Robe',
  description: 'M.Def +6, Defense +1',
  slot: 'armor',
  magicDefense: 6,
  defense: 1,
  tier: 2,
}

// ---- tier 3 ----
export const MythrilMail = {
  name: 'Mythril Mail',
  description: 'Defense +10, M.Def +2',
  slot: 'armor',
  defense: 10,
  magicDefense: 2,
  tier: 3,
}

export const SageRobe = {
  name: 'Sage Robe',
  description: 'M.Def +10, Magic +3',
  slot: 'armor',
  magicDefense: 10,
  magic: 3,
  tier: 3,
}
