import Phaser from 'phaser'

export var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' })
  },

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

  returnWorld: function () {
    this.scene.stop('VictoryScene')
    this.scene.stop('BattleScene')
    this.scene.stop('UIScene')

    this.scene.wake('WorldScene')
  },
})
