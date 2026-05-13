import Phaser from 'phaser'
import { itemIndex } from '../items/itemIndex'

export let PartyScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PartyScene() {
    Phaser.Scene.call(this, { key: 'PartyScene' })
  },
  // Mode selection for using items or viewing stats
  init: function (data) {
    this.mode = data.mode || 'VIEW'
    this.menuIndex = 0
    this.menuItems = []
  },

  create: function () {
    // clear listeners to avoid bugs
    this.input.keyboard.off('keydown', this.handleInput, this)
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
    this.partyData = this.registry.get('partyData')
    this.menuItems = []

    // Party stats
    partyData.forEach((hero, index) => {
      let yPos = 60 + index * 60

      let nameText = this.add.text(70, yPos, `${hero.type} LVL:${hero.level}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
      })
      this.menuItems.push(nameText)

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

    // Input Setup
    this.input.keyboard.on('keydown', this.handleInput, this)
    this.updateSelection()
  },

  handleInput: function (event) {
    if (event.code === 'ArrowDown') {
      this.menuIndex = (this.menuIndex + 1) % this.menuItems.length
      this.updateSelection()
    } else if (event.code === 'ArrowUp') {
      this.menuIndex =
        (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length
      this.updateSelection()
    } else if (event.code === 'KeyZ' || event.code === 'Enter') {
      this.confirmSelection()
    } else if (event.code === 'KeyX' || event.code === 'Escape') {
      this.closeMenu()
    }
  },

  updateSelection: function () {
    this.menuItems.forEach((text, index) => {
      text.setColor(index === this.menuIndex ? '#f8ff38' : '#ffffff')
    })
  },

  confirmSelection: function () {
    if (this.mode === 'SELECT') {
      this.applyItemEffect()
    }
  },
  applyItemEffect: function () {
    const itemName = this.registry.get('usedItem')
    const itemData = itemIndex[itemName]
    const targetHero = this.partyData[this.menuIndex]

    if (itemData.healValue) {
      if (targetHero.hp >= targetHero.maxHp) {
        return
      }
    }
    targetHero.hp += itemData.healValue
    if (targetHero.hp > targetHero.maxHp) {
      targetHero.hp = targetHero.maxHp
    }
    this.game.inventory.removeItem(itemName, 1)
    this.registry.set('partyData', this.partyData)
    this.closeMenu()
  },
  closeMenu: function () {
    this.input.keyboard.off('keydown', this.handleInput, this)
    if (this.mode === 'SELECT') {
      this.scene.stop()
      this.scene.start('ItemScene')
    } else if (this.mode === 'VIEW') {
      this.scene.stop()
      if (this.scene.get('WorldMenuScene').scene.isSleeping()) {
        this.scene.wake('WorldMenuScene')
      } else {
        this.scene.start('WorldMenuScene')
      }
    }
  },
})
