import { Equipment } from '../game/equipment.js'
import { Inventory } from '../game/inventory.js'
import { Unit } from '../game/units.js'
import Phaser from 'phaser'

const makeInventory = (items) =>
  new Inventory({
    get: () => items,
    set: jest.fn(),
  })

describe('Equipment', () => {
  test('equipping moves the item from the inventory to the hero', () => {
    const hero = { type: 'Warrior', equipment: { weapon: null, armor: null } }
    const inventory = makeInventory([{ name: 'Iron Sword', qty: 1 }])

    expect(Equipment.equip(hero, 'Iron Sword', inventory)).toBe(true)

    expect(hero.equipment.weapon).toBe('Iron Sword')
    expect(inventory.items).toEqual([])
  })

  test('replacing equipment returns the old item to the inventory', () => {
    const hero = { equipment: { weapon: 'Oak Staff', armor: null } }
    const inventory = makeInventory([{ name: 'Iron Sword', qty: 1 }])

    Equipment.equip(hero, 'Iron Sword', inventory)

    expect(hero.equipment.weapon).toBe('Iron Sword')
    expect(inventory.items).toEqual([{ name: 'Oak Staff', qty: 1 }])
  })

  test('consumables and items not in the inventory cannot be equipped', () => {
    const hero = { equipment: { weapon: null, armor: null } }
    const inventory = makeInventory([{ name: 'Potion', qty: 1 }])

    expect(Equipment.equip(hero, 'Potion', inventory)).toBe(false)
    expect(Equipment.equip(hero, 'Chain Mail', inventory)).toBe(false)
    expect(hero.equipment).toEqual({ weapon: null, armor: null })
  })

  test('heroes from old saves without equipment can still equip items', () => {
    const hero = { type: 'Mage' }
    const inventory = makeInventory([{ name: 'Chain Mail', qty: 1 }])

    Equipment.equip(hero, 'Chain Mail', inventory)

    expect(hero.equipment).toEqual({ weapon: null, armor: 'Chain Mail' })
  })

  test('bonuses are summed from equipped items', () => {
    const hero = { equipment: { weapon: 'Iron Sword', armor: 'Chain Mail' } }

    expect(Equipment.getBonus(hero, 'attack')).toBe(4)
    expect(Equipment.getBonus(hero, 'defense')).toBe(3)
    expect(Equipment.getBonus({}, 'attack')).toBe(0)
  })

  test('gain is compared against the item currently in that slot', () => {
    const unarmed = { equipment: { weapon: null, armor: null } }
    const withStaff = { equipment: { weapon: 'Oak Staff', armor: null } }
    const withSword = { equipment: { weapon: 'Iron Sword', armor: null } }

    expect(Equipment.getGain(unarmed, 'Iron Sword')).toEqual({
      attack: 4,
      magic: 0,
      defense: 0,
      magicDefense: 0,
    })
    // swapping a sword for a staff trades attack for magic
    expect(Equipment.getGain(withSword, 'Oak Staff')).toMatchObject({
      attack: -4,
      magic: 3,
    })
    expect(Equipment.getGain(withStaff, 'Iron Sword')).toMatchObject({
      attack: 4,
      magic: -3,
    })
    expect(Equipment.getGain({}, 'Chain Mail').defense).toBe(3)
  })

  test('magic damage is reduced by magic defense, not physical defense', () => {
    const knight = {
      hp: 50,
      defense: 3,
      magicDefense: 0,
      updateStatusBar: jest.fn(),
    }
    const wizard = {
      hp: 50,
      defense: 0,
      magicDefense: 3,
      updateStatusBar: jest.fn(),
    }

    expect(Unit.prototype.takeDamage.call(knight, 10, 'magic')).toBe(10)
    expect(Unit.prototype.takeDamage.call(wizard, 10, 'magic')).toBe(7)
    expect(Unit.prototype.takeDamage.call(wizard, 10, 'physical')).toBe(10)
  })

  test('attacks add the bonus matching their damage type', () => {
    const target = { hp: 100, living: true, defense: 0, magicDefense: 0 }
    target.takeDamage = Unit.prototype.takeDamage
    target.updateStatusBar = jest.fn()
    const mage = { damage: 8, attackBonus: 0, magicBonus: 3 }

    // basic attack: own damage, no staff bonus
    expect(Unit.prototype.attack.call(mage, target)).toBe(8)
    // Fireball: skill damage plus the staff's magic bonus
    expect(Unit.prototype.attack.call(mage, target, 20, 'magic')).toBe(23)
  })

  test('defense reduces damage taken but never below 1', () => {
    const unit = { hp: 50, defense: 3, updateStatusBar: jest.fn() }

    expect(Unit.prototype.takeDamage.call(unit, 10)).toBe(7)
    expect(unit.hp).toBe(43)

    expect(Unit.prototype.takeDamage.call(unit, 2)).toBe(1)
    expect(unit.hp).toBe(42)
  })
})
