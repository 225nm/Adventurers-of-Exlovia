import Phaser from 'phaser'

export var VictoryScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function VictoryScene() {
    Phaser.Scene.call(this, { key: 'VictoryScene' })
  },

  create: function (lootData) {
    this.cameras.main.setBackgroundColor('#23d2de')

    // Victory text
    this.add
      .text(160, 20, 'Victory!', {
        fontSize: '16px',
        fontFamily: '"Press Start 2P", cursive',
        border: '1px solid black',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)

    // xp Text
    this.add
      .text(160, 60, `Your heroes gained ${lootData.xp} XP!`, {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", cursive',
        border: '1px solid black',
        stroke: '#000',
        strokeThickness: 1,
      })
      .setOrigin(0.5)

    // AI suggested syntax
    // loot Text
    if (lootData.loot.length > 0) {
      this.add
        .text(160, 100, `Your party found: ${lootData.loot.join(', ')}`, {
          fontSize: '8px',
          fontFamily: '"Press Start 2P", cursive',
          border: '1px solid black',
          stroke: '#000',
          strokeThickness: 1,
          align: 'center',
          wordWrap: {
            width: 200,
            useAdvancedWrap: true,
          },
        })
        .setOrigin(0.5)
    }

    // Return text
    this.add
      .text(160, 200, 'Press Z to return to the world map', {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", cursive',
        border: '1px solid black',
        stroke: '#000',
        strokeThickness: 1,
        fill: '#f5d400',
      })
      .setOrigin(0.5)

    this.input.keyboard.once('keydown-Z', this.returnWorld, this)
  },
  // Scene management
  returnWorld: function () {
    this.scene.stop('VictoryScene')
    this.scene.stop('BattleScene')
    this.scene.stop('UIScene')

    this.scene.wake('WorldScene')
  },
})
