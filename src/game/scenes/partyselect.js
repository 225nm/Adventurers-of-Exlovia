import Phaser from 'phaser'
import { heroesIndex } from '../units/heroes/heroesIndex'
import { Party } from '../party'
import { Progression } from '../progression'
import { Sfx } from '../audio/sfx'
import { Ui } from '../ui'
import { Fx } from '../fx'
import { Scenery } from '../fx/scenery'

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

    // the title's moonlit castle, dimmed behind the cards, with its mist and fireflies
    this.add.image(0, 0, 'title-bg').setOrigin(0, 0)
    Scenery.moonlitNight(this)
    this.add.rectangle(0, 0, 320, 240, 0x05041a, 0.55).setOrigin(0, 0)
    Fx.fireflies(this, 6, 5, 0xe8ff9a, { x: 0, y: 150, width: 320, height: 90 })

    // everything from here on is the menu, on a camera of its own (see Fx.uiCamera)
    const firstUi = this.children.list.length
    this.add.pixelText(160, 14, 'CHOOSE YOUR PARTY').setFont('pressstarty')
    this.add
      .pixelText(
        160,
        28,
        `Pick ${PARTY_SIZE}, the other joins on floor ${Progression.recruitFloor}`
      )
      .setFont('pressstartg')

    this.cards = this.classes.map((type, i) => this.createCard(type, CARD_X[i]))

    this.add.pixelText(160, 215, 'Z: PICK   X: BACK')
    Fx.uiCamera(this, this.children.list.slice(firstUi))

    this.updateVisuals()
    this.input.keyboard.off('keydown', this.handleInput, this)
    this.input.keyboard.on('keydown', this.handleInput, this)
  },

  // A card with the hero's battle sprite, role and level 1 stats. The card is a window with a silver
  // frame, swapped for a gold one while the cursor is on it
  createCard: function (type, x) {
    const HeroClass = heroesIndex[type]
    const stats = HeroClass.baseStats
    const left = x - CARD_W / 2
    const frames = {
      silver: Ui.window(this, left, CARD_TOP, CARD_W, CARD_H),
      gold: Ui.window(this, left, CARD_TOP, CARD_W, CARD_H, { frame: 'gold' }),
    }

    // a warm light behind the hero under the cursor, and a glowing spot under picked heroes
    const glow = this.add
      .image(x, 82, 'fx-glow')
      .setScale(1.7)
      .setTint(0xffe2a0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0)
    const pedestal = this.add
      .image(x, 104, 'fx-glow')
      .setScale(1.4, 0.35)
      .setTint(0xffd060)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(false)
    this.add.ellipse(x, 104, 30, 6, 0x05041a, 0.5)
    const hero = this.add.image(x, 80, `battler-${type.toLowerCase()}`)
    this.add.pixelText(x, 116, type.toUpperCase())
    this.add.pixelText(x, 128, HeroClass.description).setFont('pressstartb')
    ;[
      `HP  ${stats.maxHp}`,
      `MP  ${stats.maxMp}`,
      `ATK ${stats.damage}`,
      `MAG ${stats.magic}`,
      `SPD ${stats.speed}`,
    ].forEach((line, row) => {
      this.add.pixelText(x - 30, 144 + row * 11, line).setOrigin(0, 0.5)
    })
    // shows the pick order, [1] or [2]
    return {
      frames,
      glow,
      pedestal,
      hero,
      x,
      badge: this.add
        .pixelText(left + 18, CARD_TOP + 12, '')
        .setFont('pressstarty'),
    }
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
    this.pickBurst(this.cards[this.classes.indexOf(type)])
    if (this.picks.length === PARTY_SIZE) {
      this.showConfirm()
    }
  },

  // The card under the cursor gets a gold frame and its hero steps into a warm light, bobbing
  // gently. Picked heroes show their pick number and stand on a glowing spot
  updateVisuals: function () {
    this.classes.forEach((type, i) => {
      const card = this.cards[i]
      const pickIndex = this.picks.indexOf(type)
      const current = i === this.cursor
      card.frames.gold.setVisible(current)
      card.frames.silver.setVisible(!current)
      card.badge.setText(pickIndex >= 0 ? `${pickIndex + 1}` : '')
      card.pedestal.setVisible(pickIndex >= 0)

      if (current === card.current) return
      card.current = current
      this.tweens.killTweensOf([card.glow, card.hero])
      card.hero.y = 80
      this.tweens.add({
        targets: card.glow,
        alpha: current ? 0.4 : 0,
        duration: 200,
      })
      if (current) {
        this.tweens.add({
          targets: card.hero,
          y: 78,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
      }
    })
  },

  // A burst of golden sparks and a ring of light around a hero who has just been picked
  pickBurst: function (card) {
    const sparks = this.add.particles(card.x, 84, 'fx-mote', {
      speed: { min: 25, max: 70 },
      lifespan: 500,
      alpha: { start: 1, end: 0 },
      tint: [0xffffff, 0xfff0a0, 0xffc040],
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    })
    const ring = this.add
      .circle(card.x, 84, 10)
      .setStrokeStyle(2, 0xfff0a0)
      .setBlendMode(Phaser.BlendModes.ADD)
    Fx.toUi(this, [sparks, ring])
    sparks.explode(20)
    this.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    })
    this.time.delayedCall(700, () => sparks.destroy())
  },

  showConfirm: function () {
    let overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, 320, 240)
    let box = Ui.window(this, 50, 80, 220, 70)
    let text = this.add
      .pixelText(
        160,
        115,
        `${this.picks.join(' & ')}\n\nBEGIN THE ADVENTURE?\n\n(Z) YES  (X) NO`
      )
      .setCenterAlign()
    this.confirmBox = this.add.container(0, 0, [overlay, box, text])
    Fx.toUi(this, [this.confirmBox])
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
