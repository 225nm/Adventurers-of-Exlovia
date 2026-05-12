import Phaser from 'phaser'

export let PartyScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PartyScene() {
    Phaser.Scene.call(this, { key: 'PartyScene' })
  },

  create: function () {
    // Menu graphic box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 0.9)
    this.graphics.fillRect(50, 20, 250, 200)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 250, 200)

    // Title
    this.add
      .text(160, 30, '--- PARTY ---', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
      })
      .setOrigin(0.5)

    let partyData = this.registry.get('partyData')

    // Party stats
    partyData.forEach((hero, index) => {
      let yPos = 60 + index * 60

      this.add.text(70, yPos, `${hero.type} LVL:${hero.level}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
      })

      this.add.text(
        70,
        yPos + 15,
        `HP: ${hero.hp}/${hero.maxHp} MP: ${hero.mp}/${hero.maxMp}`,
        {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: '#00ff00',
        }
      )
    })

    this.add.text(110, 200, 'Press X to close menu', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
    })

    // Input listeners to close the menu
    this.input.keyboard.on('keydown-X', () => {
      this.scene.launch('WorldMenuScene')
      this.scene.stop()
    })
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('WorldMenuScene')
      this.scene.stop()
    })
  },
})
