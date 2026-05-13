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
      this.continueText = this.add
        .text(160, menuY, 'Continue', {
          fontSize: '8px',
          fontFamily: '"Press Start 2P", cursive',
          fill: '#ffffff',
          stroke: '#000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
      this.menus.push({
        textObject: this.continueText,
        action: this.continueGame,
      })
      menuY += 20
    }

    this.newGameText = this.add
      .text(160, menuY, 'New Game', {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", cursive',
        fill: '#ffffff',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
    this.menus.push({
      textObject: this.newGameText,
      action: this.startNewGame,
    })

    this.add
      .text(
        160,
        215,
        'Use the arrow keys to move \n Z to confirm \n X to cancel \n C to open the menu',
        {
          fontSize: '8px',
          fontFamily: '"Press Start 2P", cursive',
          fill: '#fff',
          align: 'center',
          stroke: '#000',
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5)

    /*     this.add
      .text(160, 240, 'Press Z to start the game', {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", cursive',
        fill: '#f5d400',
        border: '1px solid black',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5) */
    // Key listeners
    this.cursors = this.input.keyboard.createCursorKeys()
    this.confirmKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    )
    // old input todo delete if no issues
    //this.input.keyboard.on('keydown-Z', this.confirmSelection, this)

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
        option.textObject.setFill('#f5d400') // Yellow highlight
      } else {
        option.textObject.setFill('#ffffff') // Plain white
      }
    })
  },

  confirmSelection: function () {
    // Run whichever function is tied to the selected menu item
    this.menus[this.selectedIndex].action.call(this)
  },

  continueGame: function () {
    // Load data straight into the registry
    saveSystem.loadGame(this.registry)
    this.game.inventory.items = this.registry.get('inventory') || []
    this.scene.start('WorldScene')
  },
  // Start a new game
  startNewGame: function () {
    localStorage.removeItem('party_data')
    this.registry.set('inventory', [])
    this.game.inventory.items = []
    const defaultParty = Party.getStartingParty()

    this.registry.set('partyData', defaultParty)
    // Start world scene
    this.scene.start('WorldScene')
  },
  // start the WorldScene, todo delete if no issues
  /* startGame: function () {
    // set save data for party
    if (!this.registry.get('partyData')) {
      this.registry.set('partyData', Party.Heroes)
    }
    this.scene.start('WorldScene')
  }, */
})
