import Phaser from 'phaser'
import { saveSystem } from '../save.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'

// Title screen class
export var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' })
  },
  // Create method to set up the title screen, including background, menu options, and input handling
  create: function () {
    let bg = this.add.image(160, 120, 'title')
    bg.setDisplaySize(320, 240)

    // logo in the game's own pixel font, scaled up
    this.add.colorText(160, 32, 'ADVENTURERS OF', '#f0c860', 16)
    this.add.colorText(160, 60, 'EXLOVIA', '#f0c860', 24)

    // check if save data is found
    const saveCheck = localStorage.getItem('party_data') !== null

    this.menus = []
    this.selectedIndex = 0

    // starts higher to make room for Options above the controls text
    let menuY = 140

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
    menuY += 20

    this.optionsText = this.add.pixelText(160, menuY, 'Options')
    this.menus.push({
      textObject: this.optionsText,
      action: this.openOptions,
    })

    Music.play('title')

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
  // Update loop to handle menu navigation and selection
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

  // Moves the menu selection up or down based on the direction parameter
  moveSelection: function (direction) {
    this.selectedIndex += direction

    // Wrap around
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.menus.length - 1
    } else if (this.selectedIndex >= this.menus.length) {
      this.selectedIndex = 0
    }

    Sfx.cursor()
    this.updateMenuVisuals()
  },
  // Updates the visual state of the menu options based on the currently selected index
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
  // Confirms the selected menu
  confirmSelection: function () {
    Sfx.confirm()
    this.menus[this.selectedIndex].action.call(this)
  },

  // Opens the options menu on top of the title screen, which pauses until it closes
  openOptions: function () {
    this.scene.pause()
    this.scene.launch('OptionsScene', { returnTo: 'TitleScene' })
  },

  // Logic for continuing a game, loads save data and starts the world scene
  continueGame: function () {
    saveSystem.loadGame(this.registry)
    this.game.inventory.items = this.registry.get('inventory') || []
    this.scene.start('WorldScene')
  },

  // Starts a new game: the party selection screen sets up the party and clears the old save
  startNewGame: function () {
    this.scene.start('PartySelectScene')
  },
})
