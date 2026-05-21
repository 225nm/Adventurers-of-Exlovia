import { saveSystem } from '../game/save'

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

  expect(registryMock.get('partyData')).toEqual(testParty)
})
