import Phaser from 'phaser'
import { itemIndex } from '../items/itemIndex'

export let ItemScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function ItemScene() {
    Phaser.Scene.call(this, { key: 'ItemScene' })
  },

  create: function () {
    this.inventory = this.game.inventory
    this.menuIndex = 0
    this.menuItems = []

    // Menu graphic box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 0.9)
    this.graphics.fillRect(50, 20, 250, 200)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 250, 200)

    // Title
    this.add
      .text(160, 30, '--- INVENTORY ---', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
      })
      .setOrigin(0.5)

    this.updateItemList()
    this.setupInput()
    this.sys.events.on('wake', () => {
      this.updateItemList()
      this.setupInput()
    })
  },
  // input handler
  handleInput: function (event) {
    if (this.menuItems.length === 0) {
      if (event.code === 'KeyX' || event.code === 'Escape') this.exitMenu()
      return
    }
    if (event.code === 'ArrowDown') {
      this.menuItems[this.menuIndex].setColor('#ffffff')
      this.menuIndex = (this.menuIndex + 1) % this.menuItems.length
      this.menuItems[this.menuIndex].setColor('#f8ff38')
    } else if (event.code === 'ArrowUp') {
      this.menuItems[this.menuIndex].setColor('#ffffff')
      this.menuIndex =
        (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length
      this.menuItems[this.menuIndex].setColor('#f8ff38')
    } else if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.confirmSelection()
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      this.exitMenu()
    }
  },
  confirmSelection: function () {
    if (this.menuItems.length === 0) return
    let selectedItem = this.menuItems[this.menuIndex]
    let itemName = selectedItem.itemName
    let itemData = itemIndex[itemName]
    // Logic for using healing items out of battle scene
    if (itemData.healValue) {
      this.registry.set('usedItem', itemName)
      this.scene.sleep()
      this.scene.launch('PartyScene', { mode: 'SELECT' })
    }
  },
  updateItemList: function () {
    this.menuItems.forEach((item) => item.destroy())
    this.menuItems = []

    this.inventory.items.forEach((item, index) => {
      let yPos = 60 + index * 20
      let itemObj = this.add.text(80, yPos, `${item.name} x${item.qty}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
      })
      itemObj.itemName = item.name
      this.menuItems.push(itemObj)
    })

    if (this.menuItems.length > 0) {
      if (this.menuIndex >= this.menuItems.length)
        this.menuIndex = this.menuItems.length - 1
      this.menuItems[this.menuIndex].setColor('#f8ff38')
    }
  },
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
  setupInput: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
  },
})
