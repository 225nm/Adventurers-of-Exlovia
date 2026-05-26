import Phaser from 'phaser'
import { itemIndex } from '../items/itemIndex'

// Party menu scene for world menu
export let PartyScene = new Phaser.Class({
  Extends: Phaser.Scene,
  // Initializes the scene
  initialize: function PartyScene() {
    Phaser.Scene.call(this, { key: 'PartyScene' })
  },
  // Initializes the scene with mode and previous index for menu navigation
  init: function (data) {
    this.mode = data.mode || 'VIEW'
    this.menuIndex = data.previousIndex || 0
    this.menuItems = []
  },

  // Creates the party menu and sets up input handling
  create: function () {
    // clear listeners to avoid bugs
    this.input.keyboard.off('keydown', this.handleInput, this)

    // Menu graphic box
    this.graphics = this.add.graphics()
    this.graphics.fillStyle(0x031f4c, 0.9)
    this.graphics.fillRect(50, 20, 250, 200)
    this.graphics.lineStyle(2, 0xffffff, 1)
    this.graphics.strokeRect(50, 20, 250, 200)

    // Title - centered neatly at X: 175
    this.add.pixelText(175, 33, '--- PARTY ---')

    let partyData = this.registry.get('partyData')
    this.partyData = this.registry.get('partyData')
    this.menuItems = []

    // Party stats
    partyData.forEach((hero, index) => {
      let yPos = 65 + index * 45

      // Hero name & level (Interactive menu selection target)

      let nameText = this.add.pixelText(
        175,
        yPos,
        `${hero.type} LVL:${hero.level}`
      )
      this.menuItems.push(nameText)

      // Hero statistics display layout
      let statsText = this.add.pixelText(
        175,
        yPos + 15,
        `HP: ${hero.hp}/${hero.maxHp} MP: ${hero.mp}/${hero.maxMp}`
      )
      statsText.setTint(0x00ff00)
    })

    // Footer closing prompt
    this.add.pixelText(175, 205, 'Press X to close menu')

    // Input Setup
    this.input.keyboard.on('keydown', this.handleInput, this)
    this.updateSelection()
  },

  // Handles input for navigating the party menu
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

  // Highlights the selected hero in the menu
  updateSelection: function () {
    this.menuItems.forEach((text, index) => {
      if (index === this.menuIndex) {
        text.setTint(0xf8ff38)
        text.setFont('pressstarty')
      } else {
        text.clearTint()
        text.setFont('pressstart')
      }
    })
  },
  // Handles confirming a selection in the party menu, either applying an item effect or viewing hero stats
  confirmSelection: function () {
    if (this.mode === 'SELECT') {
      this.applyItemEffect()
    } else if (this.mode === 'VIEW') {
      const selectedHero = this.partyData[this.menuIndex]
      this.input.keyboard.off('keydown', this.handleInput, this)
      this.scene.start('StatsScene', {
        hero: selectedHero,
        previousIndex: this.menuIndex,
      })
    }
  },
  // Uses an item and applies the effect
  applyItemEffect: function () {
    const itemName = this.registry.get('usedItem')
    const itemData = itemIndex[itemName]
    const targetHero = this.partyData[this.menuIndex]

    const healValue = itemData.healValue || 0
    const manaValue = itemData.manaValue || 0

    let canHeal = healValue > 0 && targetHero.hp < targetHero.maxHp
    let canRestoreMana = manaValue > 0 && targetHero.mp < targetHero.maxMp

    if (!canHeal && !canRestoreMana) {
      return
    }
    if (canRestoreMana) {
      targetHero.mp += manaValue
      if (targetHero.mp > targetHero.maxMp) {
        targetHero.mp = targetHero.maxMp
      }
    }
    if (canHeal) {
      targetHero.hp += healValue
      if (targetHero.hp > targetHero.maxHp) {
        targetHero.hp = targetHero.maxHp
      }
    }
    this.game.inventory.removeItem(itemName, 1)
    this.registry.set('partyData', this.partyData)
    this.closeMenu()
  },

  // Closes the menu and returns to the appropriate scene based on the current mode
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
