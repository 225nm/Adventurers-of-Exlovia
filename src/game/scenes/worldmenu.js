import Phaser from 'phaser'
import { saveSystem } from '../save'
// World menu class
export let WorldMenuScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function WorldMenuScene() {
    Phaser.Scene.call(this, { key: 'WorldMenuScene' })
  },
  // Create method to set up the world menu, including menu options, input handling, and state management
  create: function () {
    // State handling in order to handle submenus/confirmation menus
    this.menuState = 'main'

    // Menu box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 1)
    this.graphics.fillRect(50, 20, 100, 150)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 100, 150)

    // Menu options
    this.menuItems = []

    this.setupMenuItem(100, 40, 'PARTY', 'PartyMenu')
    this.setupMenuItem(100, 70, 'ITEMS', 'ItemMenu')
    this.setupMenuItem(100, 100, 'SAVE', 'SaveGame')
    this.setupMenuItem(100, 130, 'QUIT', 'TitleScene')

    this.menuIndex = 0
    this.updateMenuVisuals()

    // Delay input handler to prevent input crashes
    this.time.delayedCall(100, () => {
      this.setupInput()
    })
    this.sys.events.on('wake', this.setupInput, this)
  },
  // Clean up input listeners when the scene is stopped to prevent bugs
  setupInput: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
    this.updateMenuVisuals()
  },

  // Helper method to create menu items with text and associated actions
  setupMenuItem: function (x, y, text, action) {
    let item = this.add.pixelText(x, y, text)
    item.action = action
    this.menuItems.push(item)
  },
  // Updates the visual state of menu items to indicate which one is currently selected
  updateMenuVisuals: function () {
    this.menuItems.forEach((item, i) => {
      if (i === this.menuIndex) {
        item.setTint(0xf8ff38)
        item.setFont('pressstarty')
      } else {
        item.clearTint()
        item.setFont('pressstart')
      }
    })
  },
  // Logic for handling menu navigation and selection based on keyboard input
  handleInput: function (event) {
    if (this.menuState === 'confirm') {
      this.handleConfirmInput(event)
      return
    }

    if (event.code === 'ArrowDown') {
      this.menuIndex = (this.menuIndex + 1) % this.menuItems.length
      this.updateMenuVisuals()
    } else if (event.code === 'ArrowUp') {
      this.menuIndex =
        (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length
      this.updateMenuVisuals()
    } else if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.confirmSelection()
    } else if (event.code === 'Escape' || event.code === 'KeyX') {
      this.input.keyboard.off('keydown', this.handleInput, this)
      this.scene.resume('WorldScene')
      this.scene.stop()
    }
  },
  // Logic for confirming a menu selection, either navigating to a submenu, saving the game, or showing a quit confirmation
  confirmSelection: function () {
    let selection = this.menuItems[this.menuIndex].action
    this.scene.stop('ItemScene')
    this.scene.stop('PartyScene')

    if (selection === 'PartyMenu') {
      this.scene.stop('ItemScene')
      this.input.keyboard.off('keydown', this.handleInput, this)
      this.scene.stop('WorldMenuScene')
      this.scene.start('PartyScene')
    } else if (selection === 'TitleScene') {
      this.showQuitConfirm()
    } else if (selection === 'SaveGame') {
      saveSystem.saveGame(this.registry)

      let saveText = this.add.pixelText(100, 175, 'GAME SAVED!')
      this.time.delayedCall(1500, () => saveText.destroy())
    } else if (selection === 'ItemMenu') {
      this.scene.stop('PartyScene')
      this.input.keyboard.off('keydown', this.handleInput, this)
      this.scene.stop('WorldMenuScene')
      this.scene.start('ItemScene')
    }
  },
  // Logic for showing a quit confirmation menu when the player selects the quit option
  showQuitConfirm: function () {
    this.menuState = 'confirm'

    this.confirmBox = this.add.container(0, 0)
    let overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, 320, 240)

    let box = this.add.graphics()
    box.fillStyle(0x031f4c, 1)
    box.lineStyle(2, 0xffffff, 1)
    box.fillRect(80, 70, 160, 50)
    box.strokeRect(80, 70, 160, 50)

    let msg = this.add.pixelText(160, 95, 'QUIT TO TITLE?\n\n(Z) YES  (X) NO')

    this.confirmBox.add([overlay, box, msg])
  },
  // Logic for handling input in the quit confirmation menu, either confirming the quit action or returning to the main menu
  handleConfirmInput: function (event) {
    if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.scene.stop('WorldScene')
      this.scene.start('TitleScene')
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      this.confirmBox.destroy()
      this.menuState = 'main'
    }
  },
  // Logic for showing feedback messages in the world menu, such as confirming a save action or invalid input
  showFeedback: function (text) {
    let feed = this.add.pixelText(100, 175, text)
    feed.setTint(0xf8ff38)
    this.time.delayedCall(1500, () => feed.destroy())
  },
})
