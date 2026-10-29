import { saveSystem, migrateHero } from '../game/save'

// REQ-2 FR-2 Game data must persist between sessions

// Character progress can be saved
test('Game data can be saved', () => {
  let mockRegistry
  let registryMock
  const save_key = 'party_data'
  const testParty = [
    {
      type: 'Warrior',
      hp: 110,
      maxHp: 110,
      mp: 25,
      maxMp: 25,
      xp: 20,
      level: 2,
      damage: 24,
    },
    {
      type: 'Mage',
      hp: 86,
      maxHp: 86,
      mp: 58,
      maxMp: 58,
      xp: 20,
      level: 2,
      damage: 10,
    },
  ]
  const testInventory = [{ name: 'Potion', qty: 7 }]

  registryMock = new Map()
  mockRegistry = {
    get: jest.fn((key) => registryMock.get(key)),
    set: jest.fn((key, value) => registryMock.set(key, value)),
  }

  localStorage.clear()

  registryMock.set('partyData', testParty)
  registryMock.set('inventory', testInventory)
  saveSystem.saveGame(mockRegistry)

  const data = localStorage.getItem(save_key)
  expect(data).not.toBeNull()
})
// End of test 1

// Game data can be loaded
test('Game data can be loaded', () => {
  localStorage.clear()
  let mockRegistry
  let registryMock
  const save_key = 'party_data'
  const testParty = [
    {
      type: 'Warrior',
      hp: 110,
      maxHp: 110,
      mp: 25,
      maxMp: 25,
      xp: 20,
      level: 2,
      damage: 24,
    },
    {
      type: 'Mage',
      hp: 86,
      maxHp: 86,
      mp: 58,
      maxMp: 58,
      xp: 20,
      level: 2,
      damage: 10,
    },
  ]
  registryMock = new Map()
  mockRegistry = {
    get: jest.fn((key) => registryMock.get(key)),
    set: jest.fn((key, value) => registryMock.set(key, value)),
  }

  localStorage.setItem(save_key, JSON.stringify({ party: testParty }))

  saveSystem.loadGame(mockRegistry)

  // old saves come back with every saved stat intact, plus the newer stats filled in
  expect(registryMock.get('partyData')).toMatchObject(testParty)
})

// Saves from before the magic stat and equipment existed are upgraded on load
test('Old saves get magic and equipment when loaded', () => {
  const oldMage = { type: 'Mage', level: 3, damage: 12, hp: 92, maxHp: 92 }
  const upgraded = migrateHero(oldMage)

  // base 8 magic plus 3 per level gained
  expect(upgraded.magic).toBe(14)
  expect(upgraded.equipment).toEqual({ weapon: null, armor: null })
  expect(upgraded.damage).toBe(12)

  // stats that already exist are never overwritten
  const newMage = {
    ...oldMage,
    magic: 20,
    equipment: { weapon: 'Oak Staff', armor: null },
  }
  expect(migrateHero(newMage)).toEqual(newMage)
})

test('Saves record their version', () => {
  localStorage.clear()
  const registry = new Map([['partyData', [{ type: 'Warrior', level: 1 }]]])
  saveSystem.saveGame({ get: (key) => registry.get(key) })

  expect(JSON.parse(localStorage.getItem('party_data')).version).toBe(2)
})
