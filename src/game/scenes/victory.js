import Phaser from 'phaser'
import { Sfx } from '../audio/sfx'
import { Ui } from '../ui'
import { HD } from '../hd'

const ADD = Phaser.BlendModes.ADD
// Victory screen class
export var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' })
  },
  // Create method to set up the victory screen, including background, loot display, and input handling.
  // Its windows open over the paused battlefield
  create: function (lootData) {
    // a flash of light, a slowly turning sunburst behind the banner and gold sparkles drifting down
    this.celebrate()

    // banner that pops in with the fanfare
    let banner = this.add.container(160, 30, [
      Ui.window(this, -60, -13, 120, 26),
      this.add.pixelText(0, 0, 'VICTORY!').setFont('pressstarty'),
    ])
    banner.setScale(0.2)
    this.tweens.add({
      targets: banner,
      scale: 1,
      duration: 260,
      ease: 'Back.easeOut',
    })

    // results: experience, loot and level ups
    Ui.window(this, 24, 52, 272, 116)

    // Experience award text
    this.add.pixelText(160, 70, `Your heroes gained ${lootData.xp} XP!`)

    // Loot awards logic display block
    if (lootData.loot && lootData.loot.length > 0) {
      let lootString = `Your party found: ${lootData.loot.join(', ')}`

      let lootText = this.add.pixelText(160, 96, lootString)

      // Handles wrapping cleanly across lines using bitmap font metrics
      lootText.setMaxWidth(248)
      lootText.setCenterAlign()
    }

    // Level ups pop in one by one after the fanfare has started
    let levelUps = lootData.levelUps || []
    levelUps.forEach((hero, i) => {
      let text = this.add
        .colorText(
          160,
          126 + i * 14,
          `${hero.type} reached LV ${hero.level}!`,
          '#f8ff38'
        )
        .setAlpha(0)
      // a band of gold light behind the line, and sparks when it appears
      let glow = this.add
        .image(160, text.y - 4, 'fx-glow')
        .setScale(4.5, 0.4)
        .setTint(0xffd040)
        .setBlendMode(ADD)
        .setAlpha(0)
      text.setDepth(1)
      this.tweens.add({
        targets: text,
        alpha: 1,
        y: text.y - 4,
        delay: 1200 + i * 300,
        duration: 250,
        onStart: () => {
          Sfx.levelUp()
          this.levelUpSparks(text.y - 4)
          this.tweens.add({
            targets: glow,
            alpha: { from: 0.9, to: 0.35 },
            duration: 600,
          })
        },
      })
    })

    // Return to map control prompt
    Ui.window(this, 34, 186, 252, 26)
    this.add.pixelText(160, 199, 'Press Z to return to the map')

    // Input configuration
    this.input.keyboard.once('keydown-Z', this.returnWorld, this)
  },
  // The battlefield flashes, rays of light turn slowly behind the banner and gold sparkles fall
  celebrate: function () {
    const flash = this.add
      .rectangle(-HD.OFFSET_X, 0, HD.VIEW_W, 240, 0xfff4d0, 0.55)
      .setOrigin(0, 0)
      .setBlendMode(ADD)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 450,
      onComplete: () => flash.destroy(),
    })

    const rays = []
    for (let i = 0; i < 12; i++) {
      rays.push(
        this.add
          .image(0, 0, 'fx-ray')
          .setOrigin(0.5, 0)
          .setAngle(i * 30)
          .setScale(i % 2 ? 0.6 : 1, i % 2 ? 0.4 : 0.55)
          .setTint(0xffe090)
          .setBlendMode(ADD)
      )
    }
    const burst = this.add.container(160, 30, rays).setAlpha(0).setScale(0.3)
    this.tweens.add({
      targets: burst,
      alpha: 0.75,
      scale: 1,
      duration: 500,
      ease: 'Quad.easeOut',
    })
    this.tweens.add({
      targets: burst,
      angle: 360,
      duration: 24000,
      repeat: -1,
    })

    this.add.particles(0, 0, 'fx-mote', {
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-HD.OFFSET_X, -6, HD.VIEW_W, 4),
      },
      speedY: { min: 18, max: 40 },
      speedX: { min: -8, max: 8 },
      lifespan: 7000,
      alpha: { start: 1, end: 0.2 },
      tint: [0xffffff, 0xfff0a0, 0xffd050],
      frequency: 90,
      blendMode: ADD,
    })
  },

  // Sparks fly out from a level up line
  levelUpSparks: function (y) {
    const sparks = this.add
      .particles(160, y, 'fx-mote', {
        x: { min: -70, max: 70 },
        speed: { min: 15, max: 55 },
        angle: { min: 200, max: 340 },
        lifespan: 600,
        alpha: { start: 1, end: 0 },
        tint: [0xffffff, 0xfff0a0],
        blendMode: ADD,
        emitting: false,
      })
      .setDepth(2)
    sparks.explode(24)
    this.time.delayedCall(800, () => sparks.destroy())
  },

  // Logic for returning to the world scene after victory, stops current scenes and wakes the world scene
  returnWorld: function () {
    Sfx.confirm()
    this.scene.stop('VictoryScene')
    this.scene.stop('BattleScene')
    this.scene.stop('UIScene')

    this.scene.wake('WorldScene')
  },
})
