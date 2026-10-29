// type decides which stats boost and reduce the damage, element decides the spell's color
export const mageSkills = [
  {
    name: 'Fireball',
    damage: 20,
    mpCost: 5,
    levelReq: 1,
    type: 'magic',
    element: 'fire',
  },
  {
    name: 'Firestorm',
    damage: 20,
    mpCost: 8,
    levelReq: 2,
    target: 'all',
    type: 'magic',
    element: 'fire',
  },
  { name: 'TODO kill', damage: 999, mpCost: 0, levelReq: 1 },
  {
    name: 'Icebolt',
    damage: 40,
    mpCost: 12,
    levelReq: 3,
    type: 'magic',
    element: 'ice',
  },
]
