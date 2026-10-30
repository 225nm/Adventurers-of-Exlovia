import Phaser from 'phaser'
import { Sfx } from '../audio/sfx'
import { Ui } from '../ui'
// Victory screen class
export var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' })
  },
  // Create method to set up the victory screen, including background, loot display, and input handling.
  // Its windows open over the paused battlefield
  create: function (lootData) {
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
      this.tweens.add({
        targets: text,
        alpha: 1,
        y: text.y - 4,
        delay: 1200 + i * 300,
        duration: 250,
        onStart: () => Sfx.levelUp(),
      })
    })

    // Return to map control prompt
    Ui.window(this, 34, 186, 252, 26)
    this.add.pixelText(160, 199, 'Press Z to return to the map')

    // Input configuration
    this.input.keyboard.once('keydown-Z', this.returnWorld, this)
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
