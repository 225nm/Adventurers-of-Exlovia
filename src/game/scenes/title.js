import Phaser from 'phaser'
import { saveSystem } from '../save.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'
import { Ui } from '../ui.js'
import { Fx } from '../fx'

// where the moon sits on the title backdrop
const MOON = { x: 280, y: 95 }

// Title screen class
export var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' })
  },
  // Create method to set up the title screen, including background, menu options, and input handling
  create: function () {
    this.add.image(0, 0, 'title-bg').setOrigin(0, 0)
    // moonlit night: the moon and the castle's windows bloom, mist drifts past the castle's foot
    this.createNight()
    // the knight and the mage standing on the rocks in front
    this.add.image(2, 238, 'title-knight').setOrigin(0, 1)
    this.add.image(318, 238, 'title-mage').setOrigin(1, 1)
    // a thinner veil of mist in front of them, and fireflies around the rocks
    this.mist(196, 0.1, 0.012)
    Fx.fireflies(this, 7, 5, 0xe8ff9a, { x: 0, y: 150, width: 320, height: 80 })
    // gold logo made from the game's own pixel font (see art/logo.js), with twinkles on its letters
    // and a gleam sweeping across it
    this.logo = this.add.image(160, 42, 'title-logo')
    if (Fx.enabled(this)) this.logo.preFX.addShine(0.35, 0.18, 3)
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
    const menuWindow = Ui.window(this, 108, menuY - 12, 104, rows * 15 + 9)

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
    const help = this.add.pixelText(160, 231, 'Z confirm  X back  C menu')

    // Key listeners
    this.cursors = this.input.keyboard.createCursorKeys()
    this.confirmKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    )

    // hand cursor, it nudges back and forth on its own
    this.cursor = Ui.pointer(this)

    // the menu gets its own camera, so the night's bloom and vignette leave it crisp
    Fx.uiCamera(this, [
      menuWindow,
      help,
      this.cursor,
      ...this.menus.map((option) => option.textObject),
    ])

    this.updateMenuVisuals()
  },

  // The night sky's light: bloom on the moon and lit windows, a halo around the moon, a low bank of
  // mist drifting past the castle, and now and then a shooting star
  createNight: function () {
    Fx.look(this, {
      bloom: 0.95,
      threshold: 0.78,
      saturation: 1.08,
      contrast: 1.04,
      vignette: 0.45,
      shadowTint: [0.0, -0.01, 0.05],
      highlightTint: [0.04, 0.03, 0.0],
    })
    if (!Fx.enabled(this)) return
    const halo = this.add
      .image(MOON.x, MOON.y, 'fx-glow')
      .setScale(3.2)
      .setTint(0xfff0c0)
      .setAlpha(0.22)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({
      targets: halo,
      alpha: 0.3,
      scale: 3.4,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    this.mist(150, 0.24, 0.006)
    this.mist(166, 0.18, -0.004)
    this.time.addEvent({
      delay: 3800,
      loop: true,
      callback: this.shootingStar,
      callbackScope: this,
    })
  },

  // A band of mist at height y sliding sideways at speed pixels per millisecond
  mist: function (y, alpha, speed) {
    if (!Fx.enabled(this)) return
    const band = this.add
      .tileSprite(0, y, 320, 48, 'fx-mist')
      .setOrigin(0, 0.5)
      .setAlpha(alpha)
      .setTint(0xc8c0ff)
      .setBlendMode(Phaser.BlendModes.ADD)
    const drift = (time) => (band.tilePositionX = time * speed)
    this.events.on('update', drift)
    band.once('destroy', () => this.events.off('update', drift))
  },

  // A streak of light that falls across the sky and burns out
  shootingStar: function () {
    if (Math.random() < 0.35) return
    const x = Phaser.Math.Between(60, 300)
    const y = Phaser.Math.Between(4, 40)
    const head = this.add
      .image(x, y, 'fx-glow')
      .setScale(0.18)
      .setBlendMode(Phaser.BlendModes.ADD)
    const tail = this.add.particles(0, 0, 'fx-mote', {
      follow: head,
      lifespan: 260,
      alpha: { start: 0.9, end: 0 },
      tint: [0xffffff, 0xd8e0ff],
      frequency: 8,
      blendMode: Phaser.BlendModes.ADD,
    })
    this.tweens.add({
      targets: head,
      x: x - 70,
      y: y + 34,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeIn',
      onComplete: () => {
        head.destroy()
        tail.stop()
        this.time.delayedCall(300, () => tail.destroy())
      },
    })
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
