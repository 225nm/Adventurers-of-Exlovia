import Phaser from 'phaser'
import { itemIndex } from '../items/itemIndex'
import { Equipment } from '../equipment'
import { Sfx } from '../audio/sfx'

// Short stat names that fit in the item description panel
const STAT_LABELS = {
  attack: 'ATK',
  magic: 'MAG',
  defense: 'DEF',
  magicDefense: 'MDF',
  speed: 'SPD',
}

// Inventory menu scene for world menu
export let ItemScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function ItemScene() {
    Phaser.Scene.call(this, { key: 'ItemScene' })
  },

  // Initializes the scene and sets up the inventory menu
  create: function () {
    this.inventory = this.game.inventory
    this.menuIndex = 0
    this.menuItems = []
    this.detailBox = null

    // Menu graphic box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 0.9)
    this.graphics.fillRect(50, 20, 250, 200)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 250, 200)

    this.add.pixelText(175, 33, '--- INVENTORY ---')

    this.updateItemList()
    this.setupInput()

    this.sys.events.on('wake', () => {
      this.updateItemList()
      this.setupInput()
    })
  },

  // Handles input for navigating the inventory menu
  handleInput: function (event) {
    // Description panel is open, Z uses the item and X goes back to the list
    if (this.detailBox) {
      if (event.code === 'KeyZ' || event.code === 'Enter') {
        Sfx.confirm()
        this.closeDetail()
        this.useItem()
      } else if (event.code === 'KeyX' || event.code === 'Escape') {
        Sfx.cancel()
        this.closeDetail()
      }
      return
    }

    if (this.menuItems.length === 0) {
      if (event.code === 'KeyX' || event.code === 'Escape') {
        Sfx.cancel()
        this.exitMenu()
      }
      return
    }

    if (event.code === 'ArrowDown') {
      Sfx.cursor()
      this.menuIndex = (this.menuIndex + 1) % this.menuItems.length
      this.updateSelection()
    } else if (event.code === 'ArrowUp') {
      Sfx.cursor()
      this.menuIndex =
        (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length
      this.updateSelection()
    } else if (event.code === 'KeyZ' || event.code === 'Enter') {
      Sfx.confirm()
      this.showDetail()
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      Sfx.cancel()
      this.exitMenu()
    }
  },

  // Shows a panel describing the selected item, equipment also lists the stat gain for each hero
  showDetail: function () {
    if (this.menuItems.length === 0) return
    let itemName = this.menuItems[this.menuIndex].itemName
    let itemData = itemIndex[itemName]

    let box = this.add.graphics()
    box.fillStyle(0x031f4c, 1)
    box.fillRect(60, 55, 230, 140)
    box.lineStyle(2, 0xffffff, 1)
    box.strokeRect(60, 55, 230, 140)

    // yellow font for the title, setTint does nothing with the Canvas renderer
    let title = this.add.pixelText(175, 70, itemName).setFont('pressstarty')
    let description = this.add.pixelText(175, 88, itemData.description)
    this.detailBox = this.add.container(0, 0, [box, title, description])

    if (itemData.slot) {
      this.detailBox.add(this.add.pixelText(175, 110, 'IF EQUIPPED:'))

      this.registry.get('partyData').forEach((hero, index) => {
        let gain = Equipment.getGain(hero, itemName)
        let changes = []
        let total = 0
        Equipment.stats.forEach((stat) => {
          if (gain[stat]) {
            changes.push(`${STAT_LABELS[stat]} ${this.formatGain(gain[stat])}`)
            total += gain[stat]
          }
        })

        // green for upgrades, red for downgrades
        let color = total > 0 ? '#5dff5d' : total < 0 ? '#ff5d5d' : '#ffffff'
        let line = this.add.colorText(
          175,
          126 + index * 14,
          `${hero.type}: ${changes.join(' ') || 'No change'}`,
          color
        )
        this.detailBox.add(line)
      })
    }

    let action = itemData.slot ? 'EQUIP' : 'USE'
    this.detailBox.add(this.add.pixelText(175, 180, `(Z) ${action}  (X) BACK`))
  },

  // Formats a stat change with its sign, e.g. +4 or -1
  formatGain: function (value) {
    return value > 0 ? `+${value}` : `${value}`
  },

  // Removes the item description panel
  closeDetail: function () {
    this.detailBox.destroy()
    this.detailBox = null
  },

  // Handles item usage in world menu
  useItem: function () {
    if (this.menuItems.length === 0) return
    let selectedItem = this.menuItems[this.menuIndex]
    let itemName = selectedItem.itemName
    let itemData = itemIndex[itemName]

    // Logic for using healing and mana restoring items out of battle scene
    if (itemData.healValue) {
      this.registry.set('usedItem', itemName)
      this.scene.stop()
      this.scene.start('PartyScene', { mode: 'SELECT' })
    } else if (itemData.manaValue) {
      this.registry.set('usedItem', itemName)
      this.scene.stop()
      this.scene.start('PartyScene', { mode: 'SELECT' })
    } else if (itemData.slot) {
      // weapons and armor, pick which hero equips it
      this.registry.set('usedItem', itemName)
      this.scene.stop()
      this.scene.start('PartyScene', { mode: 'EQUIP' })
    }
  },

  // Updates the inventory
  updateItemList: function () {
    this.menuItems.forEach((item) => item.destroy())
    this.menuItems = []

    this.inventory.items.forEach((item, index) => {
      let yPos = 65 + index * 20

      let itemObj = this.add.pixelText(175, yPos, `${item.name} x${item.qty}`)

      itemObj.itemName = item.name
      this.menuItems.push(itemObj)
    })

    if (this.menuItems.length > 0) {
      if (this.menuIndex >= this.menuItems.length) {
        this.menuIndex = this.menuItems.length - 1
      }
      this.updateSelection()
    }
  },

  // Highlights the selected item in the menu
  updateSelection: function () {
    this.menuItems.forEach((item, index) => {
      if (index === this.menuIndex) {
        item.setTint(0xf8ff38)
        item.setFont('pressstarty')
      } else {
        item.clearTint()
        item.setFont('pressstart')
      }
    })
  },

  // Exits the menu and returns to the world scene
  exitMenu: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)

    this.scene.stop('PartyScene')
    this.scene.stop()

    if (this.scene.isSleeping('WorldMenuScene')) {
      this.scene.wake('WorldMenuScene')
    } else {
      this.scene.resume('WorldScene')
    }
  },

  // Sets up input listeners for the menu
  setupInput: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
  },
})
