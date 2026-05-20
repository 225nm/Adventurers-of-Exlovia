import { Inventory } from '../game/inventory.js'
import Phaser from 'phaser'

describe('Inventory class', () => {
  test('should return empty array if null', () => {
    const emptyInventory = {
      get: () => null,
    }
    const inventory = new Inventory(emptyInventory)
    expect(inventory.items).toEqual([])
  })
  // End of test 1
  test('should add an item to the inventory', () => {
    const emptyInventory = {
      get: () => null,
      set: jest.fn(),
    }

    const inventory = new Inventory(emptyInventory)

    inventory.addItem('Potion', 1)

    expect(inventory.items).toEqual([{ name: 'Potion', qty: 1 }])
  })
  // End of test 2
  test('item should be removed', () => {
    const fullInventory = {
      get: () => [{ name: 'Potion', qty: 10 }],
      set: jest.fn(),
    }

    const inventory = new Inventory(fullInventory)

    inventory.removeItem('Potion', 4)

    expect(inventory.items).toEqual([{ name: 'Potion', qty: 6 }])
  })
  // End of test 3
  test('Array should be empty when last item is removed', () => {
    const fullInventory = {
      get: () => [{ name: 'Potion', qty: 10 }],
      set: jest.fn(),
    }

    const inventory = new Inventory(fullInventory)

    inventory.removeItem('Potion', 10)

    expect(inventory.items).toEqual([])
  })
  // End of test 4
})
