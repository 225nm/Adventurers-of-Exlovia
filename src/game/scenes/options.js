import Phaser from 'phaser'
import { Settings } from '../audio/settings'
import { AudioEngine } from '../audio/audioEngine'
import { Sfx } from '../audio/sfx'
import { Ui } from '../ui'

// Options menu with volume controls, opened from the title screen and the world menu.
// The scene that opens it pauses itself and passes its key as returnTo
export let OptionsScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function OptionsScene() {
    Phaser.Scene.call(this, { key: 'OptionsScene' })
  },

  init: function (data) {
    this.returnTo = data.returnTo || 'TitleScene'
    this.menuIndex = 0
  },

  create: function () {
    // Menu box
    this.graphics = Ui.window(this, 50, 50, 220, 130)

    this.add.pixelText(160, 65, 'OPTIONS').setFont('pressstarty')

    // rows with a setting key get a volume bar
    this.rows = [
      { label: 'MUSIC', key: 'musicVolume', y: 95 },
      { label: 'SOUND', key: 'sfxVolume', y: 120 },
      { label: 'BACK', y: 145 },
    ]
    this.rows.forEach((row) => {
      row.text = this.add.pixelText(70, row.y, row.label).setOrigin(0, 0.5)
    })
    this.bars = this.add.graphics()

    this.add.pixelText(160, 168, 'LEFT/RIGHT TO ADJUST')

    this.updateVisuals()
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
  },

  handleInput: function (event) {
    const row = this.rows[this.menuIndex]

    if (event.code === 'ArrowDown') {
      this.menuIndex = (this.menuIndex + 1) % this.rows.length
      Sfx.cursor()
    } else if (event.code === 'ArrowUp') {
      this.menuIndex =
        (this.menuIndex - 1 + this.rows.length) % this.rows.length
      Sfx.cursor()
    } else if (row.key && event.code === 'ArrowRight') {
      this.changeVolume(row.key, 0.1)
    } else if (row.key && event.code === 'ArrowLeft') {
      this.changeVolume(row.key, -0.1)
    } else if (
      event.code === 'KeyX' ||
      event.code === 'Escape' ||
      (!row.key && (event.code === 'KeyZ' || event.code === 'Enter'))
    ) {
      this.close()
      return
    }
    this.updateVisuals()
  },

  // Volumes go from 0 to 1 in steps of 0.1, shown as 10 blocks
  changeVolume: function (key, step) {
    const value = Phaser.Math.Clamp(
      Math.round((Settings.get()[key] + step) * 10) / 10,
      0,
      1
    )
    Settings.set({ [key]: value })
    AudioEngine.applyVolumes()
    // plays at the new volume so the player hears the change
    Sfx.cursor()
  },

  updateVisuals: function () {
    this.rows.forEach((row, i) => {
      row.text.setFont(i === this.menuIndex ? 'pressstarty' : 'pressstart')
    })

    this.bars.clear()
    this.rows
      .filter((row) => row.key)
      .forEach((row) => {
        const filled = Math.round(Settings.get()[row.key] * 10)
        for (let i = 0; i < 10; i++) {
          this.bars.fillStyle(i < filled ? 0xf8ff38 : 0x3a4a6b, 1)
          this.bars.fillRect(145 + i * 11, row.y - 4, 8, 8)
        }
      })
  },

  close: function () {
    Sfx.cancel()
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.scene.stop()
    this.scene.resume(this.returnTo)
  },
})
