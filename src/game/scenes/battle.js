import Phaser from 'phaser'
import { PlayerCharacter, Enemy, Unit } from '../units'
import { skillsIndex } from '../skills/skillsIndex.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { enemiesIndex } from '../units/enemies/enemiesIndex.js'
import { saveSystem } from '../save.js'
import { Equipment } from '../equipment.js'
import { BattleAnimations } from '../battleAnimations.js'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'
import { Progression } from '../progression.js'
import { Loot } from '../loot.js'

// y positions for 1-3 units on each side, kept above the menu boxes at y 150
const ROWS = { 1: [79], 2: [55, 100], 3: [44, 79, 114] }
// every other row is shifted sideways (a staggered formation),
// so a unit's sprite doesn't cover the HP/MP bars of the unit above it
const STAGGER = 48
const HERO_X = 236
const ENEMY_X = 40
const formation = (baseX, shift, i, count) => ({
  x: baseX + (i % 2 ? shift : 0),
  y: ROWS[count][i],
})

// Battle scene where the player fights enemies
export var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BattleScene() {
    Phaser.Scene.call(this, { key: 'BattleScene' })
  },
  // Initialize the battle scene, set up event listeners
  create: function () {
    this.cameras.main.roundPixels = true
    // change the background to green
    this.cameras.main.setBackgroundColor('#1a2a1a')
    // field backdrop above the menus, created once and kept between battles
    this.add.image(0, 0, 'battle-bg').setOrigin(0, 0).setDepth(-10)

    // on wake event we call startBattle too
    this.sys.events.off('wake')
    this.sys.events.on('wake', this.startBattle, this)

    this.startBattle()
  },
  // Start the battle, initialize heroes and enemies based on saved data, and set up the turn order
  startBattle: function () {
    // Clear any previous battle data to avoid bugs
    this.units = []
    this.heroes = []
    this.enemies = []
    this.index = -1
    this.time.removeAllEvents()
    this.scene.stop('UIScene')
    this.events.off('PlayerSelect')

    // fade in from the black of the world map's transition
    this.cameras.main.fadeIn(400, 0, 0, 0)
    Music.play('battle')

    // (scene, x, y, texture, frame, type, hp, damage, xp)
    // saved data
    let partyData = this.registry.get('partyData')
    this.heroes = []

    // populate hero array with save data
    for (let i = 0; i < partyData.length; i++) {
      let pos = formation(HERO_X, STAGGER, i, partyData.length)
      let hero = new heroesIndex[partyData[i].type](this, pos.x, pos.y)
      hero.level = partyData[i].level
      hero.maxHp = partyData[i].maxHp || hero.maxHp
      hero.hp = partyData[i].hp
      hero.mp = partyData[i].mp
      hero.xp = partyData[i].xp
      hero.maxMp = partyData[i].maxMp
      hero.damage = partyData[i].damage
      hero.magic = partyData[i].magic ?? hero.magic
      hero.speed = partyData[i].speed ?? hero.speed
      // equipment bonuses are kept separate from base damage so they are never saved into it
      hero.attackBonus = Equipment.getBonus(partyData[i], 'attack')
      hero.magicBonus = Equipment.getBonus(partyData[i], 'magic')
      hero.speedBonus = Equipment.getBonus(partyData[i], 'speed')
      hero.defense = Equipment.getBonus(partyData[i], 'defense')
      hero.magicDefense = Equipment.getBonus(partyData[i], 'magicDefense')
      if (hero.checkSkills) {
        hero.checkSkills()
      }
      this.heroes.push(hero)
      this.add.existing(hero)
      hero.updateStatusBar()
    }

    // array with enemies: the one touched on the map leads, the rest come from the floor's pool,
    // all scaled to the current floor
    this.enemies = []
    let floor = this.registry.get('floor') || 1
    let encounter = this.registry.get('encounter')
    let enemyAmount = Progression.enemyCount(floor)

    for (let i = 0; i < enemyAmount; i++) {
      let type =
        i === 0 && enemiesIndex[encounter]
          ? encounter
          : Progression.pickEnemy(floor)
      let pos = formation(ENEMY_X, STAGGER, i, enemyAmount)
      let enemy = new enemiesIndex[type](this, pos.x, pos.y)
      Progression.scaleEnemy(enemy, floor)
      this.add.existing(enemy)
      this.enemies.push(enemy)
    }
    // array with both parties, who will attack
    this.units = this.heroes.concat(this.enemies)

    this.index = -1 // currently active unit
    this.turnQueue = [] // units still to act this round, fastest first

    this.scene.run('UIScene')

    // Small delay to let things load
    this.time.addEvent({
      delay: 100,
      callback: this.nextTurn,
      callbackScope: this,
    })
  },
  // Handle the logic for the next turn, including checking for end conditions, determining the active unit, and executing enemy actions
  nextTurn: function () {
    // if we have victory or game over
    if (this.checkEndBattle()) {
      let defeat = this.heroes.every((hero) => !hero.living)
      this.endBattle()
      if (defeat) {
        this.gameOver()
      }
      return
    }
    // next unit in speed order, a new round starts when everyone has acted
    let unit
    do {
      if (this.turnQueue.length === 0) {
        this.turnQueue = this.turnOrder()
      }
      unit = this.turnQueue.shift()
    } while (!unit.living)
    // currently active unit
    this.index = this.units.indexOf(unit)
    // if its player hero
    if (this.heroes.includes(this.units[this.index])) {
      // we need the player to select action and then enemy
      this.events.emit('PlayerSelect', this.index)
    } else {
      // else if its enemy unit
      // pick random living hero to be attacked
      var r
      do {
        r = Math.floor(Math.random() * this.heroes.length)
      } while (!this.heroes[r].living)
      let enemy = this.units[this.index]
      let victim = this.heroes[r]

      // Skill logic for enemies, percentage chance to use a skill instead of a normal attack
      let skill = null
      const useSkillChance = 0.33
      if (
        enemy.skills &&
        enemy.skills.length > 0 &&
        Math.random() < useSkillChance
      ) {
        skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)]
      }
      // ENEMY AOE logic
      let targets =
        skill && skill.target === 'all'
          ? this.heroes.filter((hero) => hero.living)
          : [victim]
      this.performAction(enemy, targets, skill)

      // add timer for the next turn, so will have smooth gameplay
      this.time.addEvent({
        delay: 2000,
        callback: this.nextTurn,
        callbackScope: this,
      })
    }
  },
  // Order for a round: fastest first, with a small random roll so similar speeds can swap places
  turnOrder: function () {
    return this.units
      .filter((unit) => unit.living)
      .map((unit) => ({
        unit,
        roll: unit.speed + unit.speedBonus + Math.random() * 3,
      }))
      .sort((a, b) => b.roll - a.roll)
      .map((entry) => entry.unit)
  },
  // check for game over or victory
  checkEndBattle: function () {
    var victory = true
    // if all enemies are dead we have victory
    for (var i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].living) victory = false
    }
    var gameOver = true
    // if all heroes are dead we have game over
    for (i = 0; i < this.heroes.length; i++) {
      if (this.heroes[i].living) gameOver = false
    }
    if (victory) {
      this.endBattleVictory()
      return true
    }
    return gameOver
  },
  // when the player has selected the enemy to be attacked
  receivePlayerSelection: function (action, target) {
    this.time.removeAllEvents()
    let attacker = this.units[this.index]
    // AoE attacks target all living enemies
    let targets =
      target === 'all'
        ? this.enemies.filter((enemy) => enemy.living)
        : [this.enemies[target]]

    if (action == 'attack') {
      this.performAction(attacker, targets, null)
    } else {
      let skill = attacker.skills.find((s) => s.name === action)

      if (skill) {
        let mpCost = skill.mpCost || 0
        if (attacker.mp < mpCost) {
          this.events.emit('noMana')
          return
        }
        // Deduct mana before the animation, the attacker's bars must not redraw mid-dash
        attacker.mp -= mpCost
        attacker.updateStatusBar()

        this.performAction(attacker, targets, skill)
      }
    }
    // next turn in x/1000 seconds
    this.time.addEvent({
      delay: 1000,
      callback: this.nextTurn,
      callbackScope: this,
    })
  },
  // Plays the attack animation and deals damage to each target when the hit lands, skill is null for basic attacks
  performAction: function (attacker, targets, skill) {
    let color = BattleAnimations.colorFor(skill)
    let results = []

    BattleAnimations.play(this, attacker, targets, skill, (target) => {
      let dealt = attacker.attack(target, skill)
      BattleAnimations.damageNumber(this, target, dealt, color)
      if (!target.living) {
        BattleAnimations.death(this, target)
      }
      results.push(dealt)
      // report once every target has been hit
      if (results.length === targets.length) {
        this.reportAction(attacker, targets, skill, results)
      }
    })
  },
  // Shows the battle message for a finished action
  reportAction: function (attacker, targets, skill, results) {
    let message
    if (!skill) {
      message = `${attacker.type} attacks ${targets[0].type} for ${results[0]} damage`
    } else if (skill.target === 'all') {
      // damage differs per target because of defenses, so no number here
      let side = this.heroes.includes(attacker) ? 'enemies' : 'heroes'
      message = `${attacker.type} uses ${skill.name} on all ${side}!`
    } else {
      message = `${attacker.type} uses ${skill.name} on ${targets[0].type} for ${results[0]} damage!`
    }
    this.events.emit('Message', message)
  },
  // End battle, clean up data
  endBattle: function () {
    // clear state, remove sprites
    this.time.removeAllEvents()
    this.heroes.length = 0
    this.enemies.length = 0
    for (var i = 0; i < this.units.length; i++) {
      this.units[i].destroy()
    }
    // clear arrays
    this.heroes = []
    this.enemies = []
    this.units = []
    // sleep the UI
    this.scene.stop('UIScene')
  },

  // Handle victory, give xp and loot and show victory scene
  endBattleVictory: function () {
    let totalXp = 0
    let totalLoot = []
    // add enemies xp and loot to totals, every loot table entry has its own drop chance
    for (let i = 0; i < this.enemies.length; i++) {
      let enemy = this.enemies[i]
      totalXp += enemy.xpDrop
      totalLoot.push(...Loot.rollDrops(enemy))
    }
    if (this.game.inventory) {
      totalLoot.forEach((drop) => this.game.inventory.addItem(drop, 1))
    }
    for (let i = 0; i < this.heroes.length; i++) {
      this.heroes[i].xp += totalXp
    }

    const lootData = {
      xp: totalXp,
      loot: totalLoot,
      levelUps: this.saveHeroData() || [],
    }
    Music.play('victory')
    this.scene.sleep('UIScene')
    this.scene.pause()
    this.scene.launch('VictoryScene', lootData)
  },
  // Every hero has fallen, the run ends at the game over screen
  gameOver: function () {
    Music.stop()
    this.scene.stop('UIScene')
    this.cameras.main.fadeOut(800, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.launch('GameOverScene')
      this.scene.pause()
    })
  },
  // Save hero data after battle to preserve progress, returns the heroes that leveled up
  saveHeroData: function () {
    let partyData = this.registry.get('partyData')
    let levelUps = []
    for (let i = 0; i < partyData.length; i++) {
      let hero = this.heroes[i]
      let xpReq = Progression.xpToNext(hero.level)
      let startLevel = hero.level

      while (hero.xp >= xpReq) {
        hero.xp -= xpReq
        hero.levelUp()
        xpReq = Progression.xpToNext(hero.level)
      }
      if (hero.level > startLevel) {
        levelUps.push({ type: hero.type, level: hero.level })
      }

      // heroes knocked out during a won battle get back up with 1 HP
      partyData[i].hp = Math.max(hero.hp, 1)
      partyData[i].maxHp = hero.maxHp
      partyData[i].mp = hero.mp
      partyData[i].maxMp = hero.maxMp
      partyData[i].level = hero.level
      partyData[i].damage = hero.damage
      partyData[i].magic = hero.magic
      partyData[i].xp = hero.xp
      partyData[i].skills = hero.skills
    }
    this.registry.set('partyData', partyData)
    saveSystem.saveGame(this.registry)
    return levelUps
  },
})

// ----------------------------------- MENUS ---------------------------------------
// Base menu item class
var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.BitmapText,

  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.BitmapText.call(this, scene, x, y, 'pressstart', text, 8)

    this.setOrigin(0, 0.5)
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)
  },

  select: function () {
    this.setTint(0xf8ff38)
    this.setFont('pressstarty')
  },

  deselect: function () {
    this.clearTint()
    this.setFont('pressstart')
  },

  unitKilled: function () {
    this.active = false
    this.visible = false
  },
})

// Base menu class
var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y)
      partyData[i].speed = hero.speed
    this.menuItems = []
    this.menuItemIndex = 0
    this.x = x
    this.y = y
    this.selected = false
  },
  addMenuItem: function (unit) {
    var menuItem = new MenuItem(0, this.menuItems.length * 15, unit, this.scene)
    this.menuItems.push(menuItem)
    this.add(menuItem)
    return menuItem
  },
  moveSelectionUp: function () {
    this.menuItems[this.menuItemIndex].deselect()
    do {
      this.menuItemIndex--
      if (this.menuItemIndex < 0) this.menuItemIndex = this.menuItems.length - 1
    } while (!this.menuItems[this.menuItemIndex].active)
    this.menuItems[this.menuItemIndex].select()
  },
  moveSelectionDown: function () {
    this.menuItems[this.menuItemIndex].deselect()
    do {
      this.menuItemIndex++
      if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0
    } while (!this.menuItems[this.menuItemIndex].active)
    this.menuItems[this.menuItemIndex].select()
  },
  select: function (index) {
    if (!index) index = 0
    this.menuItems[this.menuItemIndex].deselect()
    this.menuItemIndex = index
    while (!this.menuItems[this.menuItemIndex].active) {
      this.menuItemIndex++
      if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0
      if (this.menuItemIndex == index) return
    }
    this.menuItems[this.menuItemIndex].select()
    this.selected = true
  },
  deselect: function () {
    this.menuItems[this.menuItemIndex].deselect()
    this.menuItemIndex = 0
    this.selected = false
  },
  confirm: function () {},
  clear: function () {
    for (var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy()
    }
    this.menuItems.length = 0
    this.menuItemIndex = 0
  },
  remap: function (units) {
    this.clear()
    for (var i = 0; i < units.length; i++) {
      var unit = units[i]
      unit.setMenuItem(this.addMenuItem(unit.type))
    }
    this.menuItemIndex = 0
  },

  // Remap skills for the skills menu based on the selected hero's skills
  remapSkills: function (skills) {
    this.clear()
    for (let i = 0; i < skills.length; i++) {
      let skill = skills[i]
      let skillMenuItem = this.addMenuItem(skill.name + ' ' + skill.mpCost)
      skillMenuItem.skillName = skill.name
    }
  },
})
// Menu for selecting skills, inherits from base Menu class
let SkillsMenu = new Phaser.Class({
  Extends: Menu,
  initialize: function SkillsMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
  },

  confirm: function () {
    let skillName = this.menuItems[this.menuItemIndex].skillName
    this.scene.events.emit('SkillSelected', skillName)
  },
})
// Menu for selecting heroes, inherits from base Menu class
var HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
  },
})
// Menu for selecting actions, inherits from base Menu class
var ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
    this.addMenuItem('Attack')
    this.addMenuItem('Skills')
  },
  confirm: function () {
    if (this.menuItemIndex == 0) {
      this.scene.events.emit('SelectedAction')
    } else if (this.menuItemIndex == 1) {
      this.scene.events.emit('SelectedSkills')
    }
  },
})
// Menu for selecting enemies, inherits from base Menu class
var EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
  },
  confirm: function () {
    this.scene.events.emit('Enemy', this.menuItemIndex)
  },
})

// ------------------------------ UI SCENE ----------------------------
// UI scene to handle menus and player input during battle
export var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function UIScene() {
    Phaser.Scene.call(this, { key: 'UIScene' })
  },

  create: function () {
    this.graphics = this.add.graphics()
    this.graphics.lineStyle(1, 0xffffff)
    this.graphics.fillStyle(0x031f4c, 1)

    // Box dimensions layout remain exact
    this.graphics.strokeRect(2, 150, 90, 100)
    this.graphics.fillRect(2, 150, 90, 100)
    this.graphics.strokeRect(95, 150, 120, 100)
    this.graphics.fillRect(95, 150, 120, 100)
    this.graphics.strokeRect(218, 150, 130, 100)
    this.graphics.fillRect(218, 150, 130, 100)

    this.menus = this.add.container()

    // Position modifications shifted slightly right to account for origin 0
    this.heroesMenu = new HeroesMenu(224, 158, this)
    this.actionsMenu = new ActionsMenu(101, 158, this)
    this.enemiesMenu = new EnemiesMenu(8, 158, this)
    this.skillsMenu = new SkillsMenu(101, 158, this)

    this.currentMenu = this.actionsMenu

    this.menus.add(this.heroesMenu)
    this.menus.add(this.actionsMenu)
    this.menus.add(this.enemiesMenu)

    this.battleScene = this.scene.get('BattleScene')

    this.input.keyboard.off('keydown')
    this.input.keyboard.on('keydown', this.onKeyInput, this)

    this.battleScene.events.off('PlayerSelect')
    this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this)

    this.skillsMenu = new SkillsMenu(101, 158, this)
    this.menus.add(this.skillsMenu)
    this.skillsMenu.visible = false

    this.events.off('SelectedAction')
    this.events.on('SelectedAction', this.onSelectedAction, this)
    this.events.off('SelectedSkills')
    this.events.on('SelectedSkills', this.onSelectedSkills, this)
    this.events.off('SkillSelected')
    this.events.on('SkillSelected', this.onSkillSelected, this)

    this.events.off('Enemy')
    this.events.on('Enemy', this.onEnemy, this)

    this.battleScene.events.off('noMana')
    this.battleScene.events.on('noMana', this.onNoMana, this)

    this.sys.events.on('wake', this.createMenu, this)

    this.message = new Message(this, this.battleScene.events)
    this.add.existing(this.message)

    this.createMenu()
  },
  createMenu: function () {
    this.remapHeroes()
    this.remapEnemies()
  },
  // Handle enemy selection and emit the selected action and target to the battle scene, then reset menus if not using a skill that targets all enemies
  onEnemy: function (index) {
    let action = this.selectedAction || 'attack'
    this.battleScene.receivePlayerSelection(action, index)
    if (this.currentMenu !== this.skillsMenu) {
      this.currentMenu = null
      this.selectedAction = null
      this.heroesMenu.deselect()
      this.actionsMenu.deselect()
      this.enemiesMenu.deselect()
    }
  },
  // Handle player selection of a hero, show action menu
  onPlayerSelect: function (id) {
    this.heroesMenu.select(id)
    this.actionsMenu.select(0)
    this.actionsMenu.visible = true
    this.skillsMenu.visible = false
    this.currentMenu = this.actionsMenu
  },
  // Handle action selection, show enemy menu if attack selected, show skills menu if skills selected
  onSelectedAction: function () {
    this.enemiesMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.enemiesMenu
    this.enemiesMenu.select(0)
  },
  // Handle skills selection, show skills menu
  onSelectedSkills: function () {
    let currentHero = this.battleScene.heroes[this.heroesMenu.menuItemIndex]
    this.skillsMenu.remapSkills(currentHero.skills)
    this.actionsMenu.visible = false
    this.skillsMenu.visible = true
    this.skillsMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.skillsMenu
    this.skillsMenu.select(0)
  },
  // Handle skill targetting
  onSkillSelected: function (skillName) {
    let currentHero = this.battleScene.heroes[this.heroesMenu.menuItemIndex]
    let skill = currentHero.skills.find((s) => s.name === skillName)

    if (skill && skill.target === 'all') {
      this.currentMenu = null
      this.skillsMenu.visible = false
      this.actionsMenu.visible = false
      this.battleScene.receivePlayerSelection(skillName, 'all')
    } else {
      this.selectedAction = skillName
      this.skillsMenu.visible = false
      this.actionsMenu.visible = false
      this.enemiesMenu.previousMenu = this.skillsMenu
      this.currentMenu = this.enemiesMenu
      this.enemiesMenu.select(0)
    }
  },
  // Handle case when player tries to use a skill without enough mana
  onNoMana: function () {
    Sfx.error()
    this.battleScene.events.emit('Message', 'Not enough MP!')
    this.enemiesMenu.deselect()
    this.selectedAction = null
    this.actionsMenu.visible = false
    this.skillsMenu.visible = true
    this.currentMenu = this.skillsMenu
    this.currentMenu.selected = true
  },
  remapHeroes: function () {
    var heroes = this.battleScene.heroes
    this.heroesMenu.remap(heroes)
  },
  remapEnemies: function () {
    var enemies = this.battleScene.enemies
    this.enemiesMenu.remap(enemies)
  },
  // Handle key input for menu navigation and selection
  onKeyInput: function (event) {
    if (this.currentMenu && this.currentMenu.selected) {
      if (event.code === 'ArrowUp') {
        Sfx.cursor()
        this.currentMenu.moveSelectionUp()
      } else if (event.code === 'ArrowDown') {
        Sfx.cursor()
        this.currentMenu.moveSelectionDown()
      } else if (
        event.code === 'ArrowRight' ||
        event.code === 'KeyX' ||
        event.code === 'Escape'
      ) {
        Sfx.cancel()
        this.menuBack()
      } else if (
        event.code === 'KeyZ' ||
        event.code === 'ArrowLeft' ||
        event.code === 'Enter'
      ) {
        Sfx.confirm()
        this.currentMenu.confirm()
      }
    }
  },
  // Handle going back in the menu, return to previous menu or deselect if already in action menu
  menuBack: function () {
    if (this.currentMenu && this.currentMenu.previousMenu) {
      this.currentMenu.deselect()

      if (this.currentMenu === this.skillsMenu) {
        this.skillsMenu.visible = false
        this.actionsMenu.visible = true
      }
      this.currentMenu = this.currentMenu.previousMenu
      this.currentMenu.select(0)
    }
  },
})

// Message box
var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Message(scene, events) {
    Phaser.GameObjects.Container.call(this, scene, 160, 30)
    var graphics = this.scene.add.graphics()
    this.add(graphics)
    graphics.lineStyle(1, 0xffffff, 0.8)
    graphics.fillStyle(0x031f4c, 0.3)
    graphics.strokeRect(-90, -15, 180, 30)
    graphics.fillRect(-90, -15, 180, 30)

    this.text = this.scene.add.pixelText(0, 0, '')
    this.text.setMaxWidth(170)

    this.add(this.text)

    events.off('Message')
    events.on('Message', this.showMessage, this)
    this.visible = false
  },
  showMessage: function (text) {
    this.text.setText(text)
    this.visible = true
    if (this.hideEvent) this.hideEvent.remove(false)
    this.hideEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: this.hideMessage,
      callbackScope: this,
    })
  },
  hideMessage: function () {
    this.hideEvent = null
    this.visible = false
  },
})
