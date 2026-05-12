import Phaser from 'phaser'
import { saveSystem } from '../save'
export let WorldMenuScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function WorldMenuScene() {
    Phaser.Scene.call(this, { key: 'WorldMenuScene' })
  },

  create: function () {
    // State handling in order to handle submenus/confimration menus
    this.menuState = 'main'
    // Menu box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 1)
    this.graphics.fillRect(50, 20, 100, 150)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 100, 150)

    // Menu options
    this.menuItems = []
    this.setupMenuItem(70, 40, 'PARTY', 'PartyMenu')
    this.setupMenuItem(70, 70, 'ITEMS', 'ItemMenu')
    this.setupMenuItem(70, 100, 'SAVE', 'SaveGame')
    this.setupMenuItem(70, 130, 'QUIT', 'TitleScene')

    this.menuIndex = 0
    this.menuItems[this.menuIndex].setColor('#f8ff38')
    // Delay input handler to prevent input crashes
    this.time.delayedCall(100, () => {
      this.input.keyboard.on('keydown', this.handleInput, this)
    })
  },

  setupMenuItem: function (x, y, text, action) {
    let item = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
    })
    item.action = action
    this.menuItems.push(item)
  },

  handleInput: function (event) {
    // Handles state for submenus
    if (this.menuState === 'confirm') {
      this.handleConfirmInput(event)
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
    } else if (event.code === 'Escape' || event.code === 'KeyX') {
      this.scene.resume('WorldScene')
      this.scene.stop()
    }
  },

  confirmSelection: function () {
    let selection = this.menuItems[this.menuIndex].action

    if (selection === 'PartyMenu') {
      this.scene.stop()
      this.scene.launch('PartyScene')
    } else if (selection === 'TitleScene') {
      this.showQuitConfirm()
    } else if (selection === 'SaveGame') {
      saveSystem.saveGame(this.registry)
      let saveText = this.add.text(50, 175, 'GAME SAVED!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
      })
      this.time.delayedCall(1500, () => saveText.destroy())
    }
  },
  showQuitConfirm: function () {
    this.menuState = 'confirm'

    this.confirmBox = this.add.container(0, 0)
    let overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, 800, 600)

    let box = this.add.graphics()
    box.fillStyle(0x031f4c, 1)
    box.lineStyle(2, 0xffffff, 1)
    box.fillRect(80, 70, 160, 40)
    box.strokeRect(80, 70, 160, 40)

    let msg = this.add
      .text(160, 90, 'QUIT TO TITLE?\n\n (Z) YES  (X) NO', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        align: 'center',
      })
      .setOrigin(0.5)

    this.confirmBox.add([overlay, box, msg])
  },
  handleConfirmInput: function (event) {
    if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.scene.stop('WorldScene')
      this.scene.start('TitleScene')
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      this.confirmBox.destroy()
      this.menuState = 'main'
    }
  },
  showFeedback: function (text) {
    let feed = this.add.text(50, 175, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#f8ff38',
    })
    this.time.delayedCall(1500, () => feed.destroy())
  },
})
