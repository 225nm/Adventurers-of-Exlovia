import Phaser from 'phaser'
import { Music } from '../audio/music'
import { Sfx } from '../audio/sfx'
import { Fx } from '../fx'

// Shown when every hero has fallen. Returns to the title screen, where Continue loads the last save
export let GameOverScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function GameOverScene() {
    Phaser.Scene.call(this, { key: 'GameOverScene' })
  },

  create: function () {
    this.cameras.main.setBackgroundColor('#000000')
    this.cameras.main.fadeIn(1200, 0, 0, 0)
    Music.play('defeat')

    // the fallen party lies in a cold pool of light while ash drifts down
    this.createFallenParty()

    let floor = this.registry.get('floor') || 1
    const text = [
      this.add.pixelText(160, 52, 'GAME OVER', 16),
      this.add.pixelText(160, 84, 'Your party has fallen'),
      this.add.pixelText(160, 98, `on floor ${floor}...`),
    ]
    // a dim red glow behind the title, breathing slowly
    const glow = this.add
      .image(160, 52, 'fx-glow')
      .setScale(4.5, 0.9)
      .setTint(0xa01818)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.35)
      .setDepth(-1)
    this.tweens.add({
      targets: glow,
      alpha: 0.6,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    let prompt = this.add
      .pixelText(160, 216, 'Press Z to return to the title')
      .setAlpha(0)
    this.tweens.add({ targets: prompt, alpha: 1, delay: 1500, duration: 500 })
    // the words stay crisp, away from the scene's grading and vignette
    Fx.uiCamera(this, [...text, glow, prompt]).fadeIn(1200, 0, 0, 0)

    // input only after a moment, so a key held from the battle doesn't skip the screen
    this.time.delayedCall(1500, () => {
      this.input.keyboard.once('keydown-Z', this.returnToTitle, this)
    })
  },

  // The party's battle sprites lie on their sides, drained of color, in a pool of cold light.
  // Ash falls through the dark and a few embers rise from the ground
  createFallenParty: function () {
    Fx.look(this, {
      saturation: 0.6,
      contrast: 1.1,
      vignette: 0.8,
      bloom: 0.5,
      shadowTint: [0, 0, 0.04],
      highlightTint: [0, 0.01, 0.03],
    })
    const ADD = Phaser.BlendModes.ADD
    this.add
      .image(160, 156, 'fx-glow')
      .setScale(5, 1.3)
      .setTint(0x8aa0d8)
      .setAlpha(0.42)
      .setBlendMode(ADD)

    const party = this.registry.get('partyData') || []
    party.forEach((hero, i) => {
      const x = Math.round(160 + (i - (party.length - 1) / 2) * 62)
      Fx.shadow(this, x, 168, 46, 0.5)
      const body = this.add
        .image(x, 152, `battler-${hero.type.toLowerCase()}`)
        .setAngle(i % 2 ? 90 : -90)
        .setScale(0.85)
      if (Fx.enabled(this)) body.preFX.addColorMatrix().grayscale(0.6)
      body.setAlpha(0.95)
    })

    this.add.particles(0, 0, 'fx-mote', {
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-20, -6, 360, 4),
      },
      speedY: { min: 8, max: 20 },
      speedX: { min: -6, max: 10 },
      lifespan: 14000,
      alpha: { start: 0.6, end: 0 },
      tint: [0x8a8a90, 0x60606a, 0xb0b0b8],
      frequency: 140,
    })
    this.add.particles(0, 0, 'fx-mote', {
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(90, 160, 140, 10),
      },
      speedY: { min: -22, max: -10 },
      speedX: { min: -5, max: 5 },
      lifespan: 2600,
      alpha: { start: 0.9, end: 0 },
      tint: [0xff7a3a, 0xffb060],
      frequency: 420,
      blendMode: ADD,
    })
  },

  returnToTitle: function () {
    Sfx.confirm()
    this.scene.stop('BattleScene')
    this.scene.stop('UIScene')
    this.scene.stop('WorldScene')
    this.scene.start('TitleScene')
  },
})
