import Phaser from 'phaser'

export var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' })
  },

  create: function () {
    let bg = this.add.image(160, 120, 'title')
    bg.setDisplaySize(320, 240)

    this.add
      .text(
        160,
        180,
        'Use the arrow keys to move \n Z to confirm and X to cancel',
        {
                fontSize: '10px',
      fontFamily: '"Press Start 2P", cursive',
          fill: '#fff',
          align: 'center',
          stroke: '#000',
          strokeThickness: 4,
          lineSpacing: 4
        }
      )
      .setOrigin(0.5)

      this.add.text(160, 220, 'Press Z to start the game', {
        fontSize: '14px',
        fill: '#f5d400',
        border: '1px solid black',
        stroke: '#000',
          strokeThickness: 4,
      }).setOrigin(0.5)

    this.input.keyboard.on('keydown-Z', this.startGame, this)
  },

  // start the WorldScene
  startGame: function () {
    this.scene.start('WorldScene')
  },
})
