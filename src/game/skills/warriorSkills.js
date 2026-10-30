// power multiplies the user's attack (physical skills) or magic (magic skills),
// so skills grow stronger as the hero levels up and finds better equipment
export const warriorSkills = [
  {
    name: 'Heavy Strike',
    description: 'A crushing blow on one foe',
    power: 1.6,
    mpCost: 4,
    levelReq: 1,
    type: 'physical',
  },
  {
    name: 'Whirlwind',
    description: 'Spin and slash at every foe',
    power: 1.0,
    mpCost: 8,
    levelReq: 3,
    target: 'all',
    type: 'physical',
  },
  {
    name: 'Cleave',
    description: 'A mighty strike that splits armor',
    power: 2.4,
    mpCost: 10,
    levelReq: 5,
    type: 'physical',
  },
  {
    name: 'Quake',
    description: 'Shake the earth under all foes',
    power: 1.8,
    mpCost: 16,
    levelReq: 8,
    target: 'all',
    type: 'physical',
  },
]
