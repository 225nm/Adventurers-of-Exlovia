import Phaser from 'phaser'
export let StatsScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function StatsScene() {
    Phaser.Scene.call(this, { key: 'StatsScene' })
  },

  init: function (data) {
    // load hero data
    this.hero = data.hero
    this.previousIndex = data.previousIndex || 0
  },

  create: function () {
    // Clear inputs
    this.input.keyboard.off('keydown', this.handleInput, this)

    // Layout
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 0.95)
    this.graphics.fillRect(40, 20, 240, 200)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(40, 20, 240, 200)

    // Header
    this.add.pixelText(160, 35, `${this.hero.type.toUpperCase()} STATS`)
    // text layout variables
    let startY = 60
    let spacing = 20
    // Stats display
    this.add
      .pixelText(75, startY, `LEVEL:  ${this.hero.level}`)
      .setOrigin(0, 0.5)
    this.add
      .pixelText(75, startY + spacing, `XP:     ${this.hero.xp}`)
      .setOrigin(0, 0.5)
    this.add
      .pixelText(
        75,
        startY + spacing * 2,
        `HP:     ${this.hero.hp}/${this.hero.maxHp}`
      )
      .setOrigin(0, 0.5)
    this.add
      .pixelText(
        75,
        startY + spacing * 3,
        `MP:     ${this.hero.mp}/${this.hero.maxMp}`
      )
      .setOrigin(0, 0.5)
    this.add
      .pixelText(75, startY + spacing * 4, `DAMAGE: ${this.hero.damage}`)
      .setOrigin(0, 0.5)

    //TODO Make skills fit in UI or turn to another menu
    /*      if (this.hero.skills && this.hero.skills.length > 0) {
      this.add.pixelText(60, startY + (spacing*5.5), `SKILLS:`)
      this.hero.skills.forEach((skill, i) => {
        this.add.pixelText(80, startY + (spacing*6.5) + (i * 15), `- ${skill.name || skill}`)
      })
    }  */

    let closePrompt = this.add.pixelText(160, 205, 'Press X to return')
    closePrompt.setTint(0xf8ff38)

    // Handle inputs
    this.input.keyboard.on('keydown', this.handleInput, this)
  },

  handleInput: function (event) {
    if (event.code === 'KeyX' || event.code === 'Escape') {
      this.closeStats()
    }
  },

  closeStats: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.scene.stop()

    // Boot PartyScene back
    this.scene.start('PartyScene', {
      mode: 'VIEW',
      previousIndex: this.previousIndex,
    })
  },
})
