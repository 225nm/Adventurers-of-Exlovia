import Phaser from 'phaser'
import { Party } from '../party.js'
import { saveSystem } from '../save.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'

export var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' })
  },

  create: function () {
    let bg = this.add.image(160, 120, 'title')
    bg.setDisplaySize(320, 240)

    // check if save data is found
    const saveCheck = localStorage.getItem('party_data') !== null

    this.menus = []
    this.selectedIndex = 0

    let menuY = 160

    // if save file exists add continue option
    if (saveCheck) {
      this.continueText = this.add.pixelText(160, menuY, 'Continue')
      this.menus.push({
        textObject: this.continueText,
        action: this.continueGame,
      })
      menuY += 20
    }

    this.newGameText = this.add.pixelText(160, menuY, 'New Game')

    this.menus.push({
      textObject: this.newGameText,
      action: this.startNewGame,
    })

    this.add.pixelText(
      160,
      215,
      'Use the arrow keys to move \n Z to confirm \n X to cancel \n C to open the menu'
    )

    // Key listeners
    this.cursors = this.input.keyboard.createCursorKeys()
    this.confirmKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    )

    this.cursor = this.add.bitmapText(0, 0, 'pressstarty', '>', 8)
    this.cursor.setOrigin(0, 0.5)

    // Set up the movement tween loop once here so it doesn't infinitely multiply on keypress
    this.tweens.add({
      targets: this.cursor,
      x: '-=2',
      duration: 300,
      yoyo: true,
      repeat: -1,
    })

    this.updateMenuVisuals()
  },

  update: function () {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.moveSelection(-1)
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.moveSelection(1)
    }
    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.confirmSelection()
    }
  },

  moveSelection: function (direction) {
    this.selectedIndex += direction

    // Wrap around
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.menus.length - 1
    } else if (this.selectedIndex >= this.menus.length) {
      this.selectedIndex = 0
    }

    this.updateMenuVisuals()
  },

  updateMenuVisuals: function () {
    this.menus.forEach((option, idx) => {
      if (idx === this.selectedIndex) {
        option.textObject.setFont('pressstarty')

        this.cursor.x = Math.floor(
          option.textObject.x - option.textObject.width / 2 - 12
        )

        this.cursor.y = Math.floor(option.textObject.y)
      } else {
        option.textObject.setFont('pressstart')
      }
    })
  },
  confirmSelection: function () {
    this.menus[this.selectedIndex].action.call(this)
  },

  continueGame: function () {
    saveSystem.loadGame(this.registry)
    this.game.inventory.items = this.registry.get('inventory') || []
    this.scene.start('WorldScene')
  },

  startNewGame: function () {
    localStorage.removeItem('party_data')
    this.registry.set('inventory', [])
    this.game.inventory.items = []
    const defaultParty = Party.getStartingParty()

    this.registry.set('partyData', defaultParty)
    this.scene.start('WorldScene')
  },
})
