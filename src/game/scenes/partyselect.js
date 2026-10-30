import Phaser from 'phaser'
import { heroesIndex } from '../units/heroes/heroesIndex'
import { Party } from '../party'
import { Progression } from '../progression'
import { Sfx } from '../audio/sfx'

// Number of heroes picked at the start, the rest join later (see Progression.recruitFloor)
const PARTY_SIZE = 2
// card centers and size
const CARD_X = [56, 160, 264]
const CARD_W = 96
const CARD_TOP = 42
const CARD_H = 156

// New game party selection: pick the starting heroes from the hero classes
export let PartySelectScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PartySelectScene() {
    Phaser.Scene.call(this, { key: 'PartySelectScene' })
  },

  create: function () {
    this.classes = Object.keys(heroesIndex)
    this.cursor = 0
    this.picks = []
    this.confirmBox = null

    this.cameras.main.setBackgroundColor('#031f4c')
    this.add.pixelText(160, 14, 'CHOOSE YOUR PARTY')
    this.add.colorText(
      160,
      28,
      `Pick ${PARTY_SIZE}, the other joins on floor ${Progression.recruitFloor}`,
      '#9fb3d9'
    )

    this.cards = this.classes.map((type, i) => this.createCard(type, CARD_X[i]))
    this.frames = this.add.graphics()

    this.add.pixelText(160, 215, 'Z: PICK   X: BACK')

    this.updateVisuals()
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
  },

  // A card with the hero's sprite, role and level 1 stats
  createCard: function (type, x) {
    const HeroClass = heroesIndex[type]
    const stats = HeroClass.baseStats
    const sprite = HeroClass.sprite

    this.add.sprite(x, 78, sprite.texture, sprite.frame).setScale(2)
    this.add.pixelText(x, 106, type.toUpperCase())
    this.add.colorText(x, 120, HeroClass.description, '#9fb3d9')
    ;[
      `HP  ${stats.maxHp}`,
      `MP  ${stats.maxMp}`,
      `ATK ${stats.damage}`,
      `MAG ${stats.magic}`,
    ].forEach((line, row) => {
      this.add.pixelText(x - 30, 140 + row * 13, line).setOrigin(0, 0.5)
    })
    // shows the pick order, [1] or [2]
    return { badge: this.add.pixelText(x, 54, '').setFont('pressstarty') }
  },

  handleInput: function (event) {
    if (this.confirmBox) {
      if (event.code === 'KeyZ' || event.code === 'Enter') {
        this.beginAdventure()
      } else if (event.code === 'KeyX' || event.code === 'Escape') {
        // back to picking, the last pick is undone so it can be changed
        Sfx.cancel()
        this.confirmBox.destroy()
        this.confirmBox = null
        this.picks.pop()
        this.updateVisuals()
      }
      return
    }

    if (event.code === 'ArrowRight') {
      Sfx.cursor()
      this.cursor = (this.cursor + 1) % this.classes.length
    } else if (event.code === 'ArrowLeft') {
      Sfx.cursor()
      this.cursor =
        (this.cursor - 1 + this.classes.length) % this.classes.length
    } else if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.togglePick(this.classes[this.cursor])
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      Sfx.cancel()
      if (this.picks.length > 0) {
        this.picks.pop()
      } else {
        this.input.keyboard.off('keydown', this.handleInput, this)
        this.scene.start('TitleScene')
        return
      }
    }
    this.updateVisuals()
  },

  togglePick: function (type) {
    if (this.picks.includes(type)) {
      Sfx.cancel()
      this.picks = this.picks.filter((pick) => pick !== type)
      return
    }
    if (this.picks.length >= PARTY_SIZE) {
      return
    }
    Sfx.confirm()
    this.picks.push(type)
    if (this.picks.length === PARTY_SIZE) {
      this.showConfirm()
    }
  },

  // Cursor is a yellow frame, picked heroes get a white frame and their pick number
  updateVisuals: function () {
    this.frames.clear()
    this.classes.forEach((type, i) => {
      const left = CARD_X[i] - CARD_W / 2
      const pickIndex = this.picks.indexOf(type)
      if (pickIndex >= 0) {
        this.frames.fillStyle(0x0b3a7a, 1)
        this.frames.fillRect(left, CARD_TOP, CARD_W, CARD_H)
      }
      this.frames.lineStyle(2, i === this.cursor ? 0xf8ff38 : 0x5a6f99, 1)
      this.frames.strokeRect(left, CARD_TOP, CARD_W, CARD_H)
      this.cards[i].badge.setText(pickIndex >= 0 ? `[${pickIndex + 1}]` : '')
    })
    // the card backgrounds go behind the card contents
    this.frames.setDepth(-1)
  },

  showConfirm: function () {
    let overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, 320, 240)
    let box = this.add.graphics()
    box.fillStyle(0x031f4c, 1)
    box.lineStyle(2, 0xffffff, 1)
    box.fillRect(50, 80, 220, 70)
    box.strokeRect(50, 80, 220, 70)
    let text = this.add
      .pixelText(
        160,
        115,
        `${this.picks.join(' & ')}\n\nBEGIN THE ADVENTURE?\n\n(Z) YES  (X) NO`
      )
      .setCenterAlign()
    this.confirmBox = this.add.container(0, 0, [overlay, box, text])
  },

  // Starts a fresh game with the chosen heroes. The old save is only cleared now,
  // so backing out to the title keeps it
  beginAdventure: function () {
    Sfx.confirm()
    this.input.keyboard.off('keydown', this.handleInput, this)
    localStorage.removeItem('party_data')
    this.registry.set('inventory', [])
    this.game.inventory.items = []
    this.registry.set(
      'partyData',
      this.picks.map((type) => Party.createHero(type, 1))
    )
    this.registry.set('floor', 1)
    this.scene.start('WorldScene')
  },
})
