import Phaser from 'phaser'

export class Inventory {
  constructor(registry) {
    this.registry = registry
    this.items = this.registry.get('inventory') || []
  }

  // Add item to inventory
  addItem(name, qty = 1) {
    let item = this.items.find((i) => i.name === name)
    if (item) {
      item.qty += qty
    } else {
      this.items.push({ name: name, qty: qty })
    }
    this.saveToRegistry()
  }

  // Remove item from inventory
  removeItem(name, qty = 1) {
    let itemIndex = this.items.findIndex((i) => i.name === name)
    if (itemIndex > -1) {
      this.items[itemIndex].qty -= qty
      if (this.items[itemIndex].qty <= 0) {
        this.items.splice(itemIndex, 1)
      }
      this.saveToRegistry()
      return true
    }
    return false
  }

  saveToRegistry() {
    this.registry.set('inventory', this.items)
  }
}
