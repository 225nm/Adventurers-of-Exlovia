import Phaser from 'phaser'
import { Equipment } from '../equipment'
import { Sfx } from '../audio/sfx'
import { Progression } from '../progression'
import { skillsIndex } from '../skills/skillsIndex'
import { Ui } from '../ui'

// readable names for skill types and elements on the skills page
const ELEMENT_NAMES = {
  fire: 'Fire',
  ice: 'Ice',
  lightning: 'Lightning',
  dark: 'Dark',
}

// Scene for a hero's stats in the party menu, with a second page listing the class's skills
export let StatsScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function StatsScene() {
    Phaser.Scene.call(this, { key: 'StatsScene' })
  },
  // Init method to receive hero data and previous menu index for navigation purposes
  init: function (data) {
    // load hero data
    this.hero = data.hero
    this.previousIndex = data.previousIndex || 0
  },
  // Create method to set up both pages, the layout box and input handling
  create: function () {
    // Clear inputs
    this.input.keyboard.off('keydown', this.handleInput, this)

    // Layout
    this.graphics = Ui.window(this, 40, 20, 240, 200)

    this.header = this.add.pixelText(160, 35, '')
    this.statsPage = this.createStatsPage()
    this.skillsPage = this.createSkillsPage()

    this.add.pixelText(160, 205, '< > PAGE   X BACK')

    this.showPage('stats')

    // Handle inputs
    this.input.keyboard.on('keydown', this.handleInput, this)
  },

  createStatsPage: function () {
    let startY = 52
    let spacing = 14
    let equipped = this.hero.equipment || {}
    let bonus = (stat) => Equipment.getBonus(this.hero, stat)
    let withBonus = (value, extra) => `${value}` + (extra ? ` +${extra}` : '')
    // defenses only come from equipment
    let lines = [
      `LEVEL:  ${this.hero.level}`,
      `XP:     ${this.hero.xp}/${Progression.xpToNext(this.hero.level)}`,
      `HP:     ${this.hero.hp}/${this.hero.maxHp}`,
      `MP:     ${this.hero.mp}/${this.hero.maxMp}`,
      `DAMAGE: ${withBonus(this.hero.damage, bonus('attack'))}`,
      `MAGIC:  ${withBonus(this.hero.magic || 0, bonus('magic'))}`,
      `SPEED:  ${withBonus(this.hero.speed || 0, bonus('speed'))}`,
      `DEFENSE:${bonus('defense')}`,
      `M.DEF:  ${bonus('magicDefense')}`,
      `WEAPON: ${equipped.weapon || 'None'}`,
      `ARMOR:  ${equipped.armor || 'None'}`,
    ]
    return this.add.container(
      0,
      0,
      lines.map((line, i) =>
        this.add.pixelText(70, startY + spacing * i, line).setOrigin(0, 0.5)
      )
    )
  },

  // Every skill of the hero's class, locked ones greyed out with the level they unlock at.
  // The highlighted skill's details are shown at the bottom of the page
  createSkillsPage: function () {
    this.skills = skillsIndex[`${this.hero.type.toLowerCase()}Skills`] || []
    this.skillCursor = 0
    let page = this.add.container(0, 0)

    this.skillRows = this.skills.map((skill, i) => {
      let y = 54 + i * 13
      let learned = this.hero.level >= skill.levelReq
      let color = learned ? '#ffffff' : '#7a86a8'
      let name = this.add.colorText(62, y, skill.name, color).setOrigin(0, 0.5)
      let cost = learned ? `${skill.mpCost} MP` : `LV ${skill.levelReq}`
      let right = this.add.colorText(262, y, cost, color).setOrigin(1, 0.5)
      page.add([name, right])
      return y
    })
    this.skillMarker = this.add.pixelText(52, 0, '>').setFont('pressstarty')
    page.add(this.skillMarker)

    // details box for the highlighted skill
    let box = Ui.window(this, 50, 136, 220, 58, { fill: 'dusk' })
    this.skillInfo = this.add.colorText(160, 146, '', '#9fd0ff')
    this.skillDescription = this.add
      .pixelText(160, 164, '')
      .setMaxWidth(206)
      .setLineSpacing(4)
      .setCenterAlign()
    this.skillPower = this.add.colorText(160, 185, '', '#9fb3d9')
    page.add([box, this.skillInfo, this.skillDescription, this.skillPower])

    this.updateSkillDetails()
    return page
  },

  updateSkillDetails: function () {
    let skill = this.skills[this.skillCursor]
    if (!skill) {
      this.skillMarker.visible = false
      return
    }
    this.skillMarker.setPosition(52, this.skillRows[this.skillCursor])

    let magic = skill.type === 'magic'
    let kind = magic
      ? `${ELEMENT_NAMES[skill.element] || 'Arcane'} magic`
      : 'Physical'
    let target = skill.target === 'all' ? 'All foes' : 'One foe'
    this.skillInfo.setText(`${kind} - ${target}`)
    this.skillDescription.setText(skill.description || '')
    this.skillPower.setText(
      this.hero.level >= skill.levelReq
        ? `Power: ${skill.power}x ${magic ? 'MAG' : 'DMG'}`
        : `Learned at level ${skill.levelReq}`
    )
  },

  showPage: function (page) {
    this.page = page
    this.statsPage.visible = page === 'stats'
    this.skillsPage.visible = page === 'skills'
    let title = page === 'stats' ? 'STATS' : 'SKILLS'
    this.header.setText(`${this.hero.type.toUpperCase()} ${title}`)
  },

  // Left/Right switch pages, Up/Down pick a skill on the skills page, X returns to the party menu
  handleInput: function (event) {
    if (event.code === 'KeyX' || event.code === 'Escape') {
      Sfx.cancel()
      this.closeStats()
    } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      Sfx.cursor()
      this.showPage(this.page === 'stats' ? 'skills' : 'stats')
    } else if (
      this.page === 'skills' &&
      this.skills.length > 0 &&
      (event.code === 'ArrowUp' || event.code === 'ArrowDown')
    ) {
      Sfx.cursor()
      let step = event.code === 'ArrowDown' ? 1 : -1
      this.skillCursor =
        (this.skillCursor + step + this.skills.length) % this.skills.length
      this.updateSkillDetails()
    }
  },
  // Logic for closing the stats screen and returning to the party menu, passing the previous index for navigation purposes
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
