// power multiplies the ranger's attack
export const rangerSkills = [
  {
    name: 'Aimed Shot',
    description: 'A careful shot at a weak spot',
    power: 1.8,
    mpCost: 4,
    levelReq: 1,
    type: 'physical',
  },
  {
    name: 'Volley',
    description: 'Loose arrows at every foe',
    power: 0.9,
    mpCost: 7,
    levelReq: 2,
    target: 'all',
    type: 'physical',
  },
  {
    name: 'Arrow Rain',
    description: 'A storm of arrows on all foes',
    power: 1.6,
    mpCost: 14,
    levelReq: 5,
    target: 'all',
    type: 'physical',
  },
  {
    name: 'Snipe',
    description: 'A deadly shot from afar',
    power: 3.2,
    mpCost: 14,
    levelReq: 8,
    type: 'physical',
  },
]
