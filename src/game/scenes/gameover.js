import Phaser from 'phaser'
import { Music } from '../audio/music'
import { Sfx } from '../audio/sfx'

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

    let floor = this.registry.get('floor') || 1
    this.add.pixelText(160, 90, 'GAME OVER', 16)
    this.add.pixelText(160, 125, 'Your party has fallen')
    this.add.pixelText(160, 140, `on floor ${floor}...`)

    let prompt = this.add
      .pixelText(160, 200, 'Press Z to return to the title')
      .setAlpha(0)
    this.tweens.add({ targets: prompt, alpha: 1, delay: 1500, duration: 500 })

    // input only after a moment, so a key held from the battle doesn't skip the screen
    this.time.delayedCall(1500, () => {
      this.input.keyboard.once('keydown-Z', this.returnToTitle, this)
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
