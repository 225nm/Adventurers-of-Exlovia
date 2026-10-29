// power multiplies the user's attack (physical skills) or magic (magic skills),
// so skills grow stronger as the hero levels up and finds better equipment
export const warriorSkills = [
  {
    name: 'Heavy Strike',
    power: 1.6,
    mpCost: 4,
    levelReq: 1,
    type: 'physical',
  },
  {
    name: 'Whirlwind',
    power: 1.0,
    mpCost: 8,
    levelReq: 3,
    target: 'all',
    type: 'physical',
  },
  { name: 'Cleave', power: 2.4, mpCost: 10, levelReq: 5, type: 'physical' },
  {
    name: 'Quake',
    power: 1.8,
    mpCost: 16,
    levelReq: 8,
    target: 'all',
    type: 'physical',
  },
]
