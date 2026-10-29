import Phaser from 'phaser'
import { Sfx } from '../audio/sfx'
// Victory screen class
export var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' })
  },
  // Create method to set up the victory screen, including background, loot display, and input handling
  create: function (lootData) {
    this.cameras.main.setBackgroundColor('#23d2de')

    // Victory header text
    this.add.pixelText(160, 30, 'Victory!')

    // Experience award text
    this.add.pixelText(160, 70, `Your heroes gained ${lootData.xp} XP!`)

    // Loot awards logic display block
    if (lootData.loot && lootData.loot.length > 0) {
      let lootString = `Your party found: ${lootData.loot.join(', ')}`

      let lootText = this.add.pixelText(160, 110, lootString)

      // Handles wrapping cleanly across lines using bitmap font metrics
      lootText.setMaxWidth(220)
    }

    // Level ups pop in one by one after the fanfare has started
    let levelUps = lootData.levelUps || []
    levelUps.forEach((hero, i) => {
      let text = this.add
        .colorText(
          160,
          150 + i * 14,
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
    let returnPrompt = this.add.pixelText(
      160,
      200,
      'Press Z to return to the world map'
    )
    returnPrompt.setTint(0xf5d400)

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
