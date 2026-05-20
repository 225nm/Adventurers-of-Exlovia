import { Inventory } from '../game/inventory.js'
import Phaser from 'phaser'

describe("Inventory class", () => {
  test('should return empty array if null', () => {
    const emptyInventory = {
      get: () => null
    }
    const inventory = new Inventory(emptyInventory)
    expect(inventory.items).toEqual([])
  }) 
})