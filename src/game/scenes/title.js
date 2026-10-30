import Phaser from 'phaser'
import { saveSystem } from '../save.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'
import { Ui } from '../ui.js'

// Title screen class
export var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' })
  },
  // Create method to set up the title screen, including background, menu options, and input handling
  create: function () {
    this.add.image(0, 0, 'title-bg').setOrigin(0, 0)
    // the knight and the mage standing on the rocks in front
    this.add.image(2, 238, 'title-knight').setOrigin(0, 1)
    this.add.image(318, 238, 'title-mage').setOrigin(1, 1)
    // gold logo made from the game's own pixel font (see art/logo.js), with twinkles on its letters
    this.logo = this.add.image(160, 42, 'title-logo')
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: this.twinkle,
      callbackScope: this,
    })

    // check if save data is found
    const saveCheck = localStorage.getItem('party_data') !== null

    this.menus = []
    this.selectedIndex = 0

    // menu window below the castle
    let menuY = saveCheck ? 178 : 185
    let rows = saveCheck ? 3 : 2
    Ui.window(this, 108, menuY - 12, 104, rows * 15 + 9)

    // if save file exists add continue option
    if (saveCheck) {
      this.continueText = this.add.pixelText(160, menuY, 'Continue')
      this.menus.push({
        textObject: this.continueText,
        action: this.continueGame,
      })
      menuY += 15
    }

    this.newGameText = this.add.pixelText(160, menuY, 'New Game')

    this.menus.push({
      textObject: this.newGameText,
      action: this.startNewGame,
    })
    menuY += 15

    this.optionsText = this.add.pixelText(160, menuY, 'Options')
    this.menus.push({
      textObject: this.optionsText,
      action: this.openOptions,
    })

    Music.play('title')

    // short enough to fit between the knight and the mage
    this.add.pixelText(160, 231, 'Z confirm  X back  C menu')

    // Key listeners
    this.cursors = this.input.keyboard.createCursorKeys()
    this.confirmKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    )

    // hand cursor, it nudges back and forth on its own
    this.cursor = Ui.pointer(this)

    this.updateMenuVisuals()
  },
  // Update loop to handle menu navigation and selection
  update: function () {
    if (this.cursorTarget) {
      this.cursor.pointAt(
        this.cursorTarget.x - this.cursorTarget.width / 2,
        this.cursorTarget.y
      )
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.moveSelection(-1)
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.moveSelection(1)
    }
    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.confirmSelection()
    }
  },

  // A twinkle pops up on a random letter of the logo
  twinkle: function () {
    let logo = this.logo
    let x = logo.x + (Math.random() - 0.5) * (logo.width - 20)
    let y = logo.y + (Math.random() - 0.5) * (logo.height - 12)
    let star = this.add.image(Math.round(x), Math.round(y), 'ui-sparkle')
    star.setScale(0.2)
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 250,
      yoyo: true,
      onComplete: () => star.destroy(),
    })
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

        this.cursorTarget = option.textObject
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
