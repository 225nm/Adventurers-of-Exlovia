import Phaser from 'phaser'
import { PlayerCharacter, Enemy, Unit } from '../units'
import { skillsIndex } from '../skills/skillsIndex.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { enemiesIndex } from '../units/enemies/enemiesIndex.js'
import { saveSystem } from '../save.js'

export var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BattleScene() {
    Phaser.Scene.call(this, { key: 'BattleScene' })
  },
  create: function () {
    this.cameras.main.roundPixels = true
    // change the background to green
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)')

    // on wake event we call startBattle too
    this.sys.events.off('wake')
    this.sys.events.on('wake', this.startBattle, this)

    this.startBattle()
  },
  startBattle: function () {
    // Clear any previous battle data to avoid bugs
    this.units = []
    this.heroes = []
    this.enemies = []
    this.index = -1
    this.time.removeAllEvents()
    this.scene.stop('UIScene')
    this.events.off('PlayerSelect')

    // (scene, x, y, texture, frame, type, hp, damage, xp)
    // saved data
    let partyData = this.registry.get('partyData')
    this.heroes = []

    // populate hero array with save data
    for (let i = 0; i < partyData.length; i++) {
      let hero = new heroesIndex[partyData[i].type](this, 250, 50 + i * 50)
      hero.level = partyData[i].level
      hero.maxHp = partyData[i].maxHp || hero.maxHp
      hero.hp = partyData[i].hp
      hero.mp = partyData[i].mp
      hero.xp = partyData[i].xp
      hero.maxMp = partyData[i].maxMp
      hero.damage = partyData[i].damage
      if (hero.checkSkills) {
        hero.checkSkills()
      }
      this.heroes.push(hero)
      this.add.existing(hero)
      hero.updateStatusBar()
    }

    // array with enemies
    this.enemies = []
    const allEnemies = Object.keys(enemiesIndex)
    let enemyAmount = 2

    for (let i = 0; i < enemyAmount; i++) {
      const rnd = allEnemies[Math.floor(Math.random() * allEnemies.length)]

      let enemy = new enemiesIndex[rnd](this, 50, 50 + i * 50)
      this.add.existing(enemy)
      this.enemies.push(enemy)
    }
    // array with both parties, who will attack
    this.units = this.heroes.concat(this.enemies)

    this.index = -1 // currently active unit

    this.scene.run('UIScene')

    // Small delay to let things load, TODO check if needed.
    this.time.addEvent({
      delay: 100,
      callback: this.nextTurn,
      callbackScope: this,
    })
  },
  nextTurn: function () {
    // if we have victory or game over
    if (this.checkEndBattle()) {
      this.endBattle()
      return
    }
    do {
      // currently active unit
      this.index++
      // if there are no more units, we start again from the first one
      if (this.index >= this.units.length) {
        this.index = 0
      }
    } while (!this.units[this.index].living)
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
      // call the enemy's attack function
      this.units[this.index].attack(this.heroes[r])
      // add timer for the next turn, so will have smooth gameplay
      this.time.addEvent({
        delay: 3000,
        callback: this.nextTurn,
        callbackScope: this,
      })
    }
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
  // when the player have selected the enemy to be attacked
  receivePlayerSelection: function (action, target) {
    this.time.removeAllEvents()
    let attacker = this.units[this.index]
    let victim = this.enemies[target]

    if (action == 'attack') {
      attacker.attack(victim)
    } else {
      // AI suggested syntax
      let skill = this.units[this.index].skills.find((s) => s.name === action)

      if (skill) {
        let mpCost = skill.mpCost || 0
        if (attacker.mp < mpCost) {
          this.events.emit('noMana')
          return
        }
        if (attacker.mp >= mpCost) {
          attacker.mp -= mpCost
          attacker.updateStatusBar()
        }

        attacker.attack(victim, skill.damage)

        // TODO: make this fit into the box
        this.events.emit(
          'Message',
          attacker.type +
            ' uses ' +
            skill.name +
            ' on ' +
            victim.type +
            ' for ' +
            skill.damage +
            ' damage!'
        )
      }
    }
    // next turn in 3 seconds
    this.time.addEvent({
      delay: 3000,
      callback: this.nextTurn,
      callbackScope: this,
    })
  },
  endBattle: function () {
    // clear state, remove sprites
    this.time.removeAllEvents()
    this.heroes.length = 0
    this.enemies.length = 0
    for (var i = 0; i < this.units.length; i++) {
      // link item
      this.units[i].destroy()
    }
    // clear arrays
    this.heroes = []
    this.enemies = []
    this.units = []
    // sleep the UI
    this.scene.stop('UIScene')
    // return to WorldScene and sleep current BattleScene, todo delete later if no bugs
    //this.scene.switch('WorldScene')
  },

  // Handle victory, give xp and loot and show victory scene
  endBattleVictory: function () {
    // total values for xp and loot
    let totalXp = 0
    let totalLoot = []
    // add enemies xp and loot to totals
    for (let i = 0; i < this.enemies.length; i++) {
      let enemy = this.enemies[i]
      totalXp += this.enemies[i].xpDrop
      // todo add randomness and more loot to loot table
      if (this.enemies[i].lootTable.length > 0) {
        let drop = enemy.lootTable[0]
        totalLoot.push(drop)
        if (this.game.inventory) {
          this.game.inventory.addItem(drop, 1)
        }
      }
    }
    for (let i = 0; i < this.heroes.length; i++) {
      this.heroes[i].xp += totalXp
    }

    const lootData = {
      xp: totalXp,
      loot: totalLoot,
    }
    // save hero data
    this.saveHeroData()
    // Scene management
    this.scene.sleep('UIScene')
    this.scene.pause()
    this.scene.launch('VictoryScene', lootData)
  },
  saveHeroData: function () {
    // save hero data
    let partyData = this.registry.get('partyData')
    for (let i = 0; i < partyData.length; i++) {
      let hero = this.heroes[i]

      // todo improve xp requirement formula
      let xpReq = hero.level * 20

      // while allows for multiple level ups in case of big xp gains
      while (hero.xp >= xpReq) {
        hero.xp -= xpReq
        hero.levelUp()
        xpReq = hero.level * 20
      }

      partyData[i].hp = hero.hp
      partyData[i].maxHp = hero.maxHp
      partyData[i].mp = hero.mp
      partyData[i].maxMp = hero.maxMp
      partyData[i].level = hero.level
      partyData[i].damage = hero.damage
      partyData[i].xp = hero.xp
      partyData[i].skills = hero.skills
    }
    this.registry.set('partyData', partyData)
    saveSystem.saveGame(this.registry)
  },
})

// ----------------------------------- MENUS ---------------------------------------
// Maybe move to separate module later todo

var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, {
      color: '#ffffff',
      fontFamily: '"Press Start 2P", cursive',
      align: 'left',
      fontSize: '8px',
      stroke: '#000',
      strokeThickness: 1,
    })
  },

  select: function () {
    this.setColor('#f8ff38')
  },

  deselect: function () {
    this.setColor('#ffffff')
  },
  // when the associated enemy or player unit is killed
  unitKilled: function () {
    this.active = false
    this.visible = false
  },
})

// base menu class, container for menu items
var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y)
    this.menuItems = []
    this.menuItemIndex = 0
    this.x = x
    this.y = y
    this.selected = false
  },
  addMenuItem: function (unit) {
    var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene)
    this.menuItems.push(menuItem)
    this.add(menuItem)
    return menuItem
  },
  // menu navigation
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
  // select the menu as a whole and highlight the choosen element
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
  // deselect this menu
  deselect: function () {
    this.menuItems[this.menuItemIndex].deselect()
    this.menuItemIndex = 0
    this.selected = false
  },
  confirm: function () {
    // when the player confirms his slection, do the action
  },
  // clear menu and remove all menu items
  clear: function () {
    for (var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy()
    }
    this.menuItems.length = 0
    this.menuItemIndex = 0
  },
  // recreate the menu items
  remap: function (units) {
    this.clear()
    for (var i = 0; i < units.length; i++) {
      var unit = units[i]
      unit.setMenuItem(this.addMenuItem(unit.type))
    }
    this.menuItemIndex = 0
  },

  remapSkills: function (skills) {
    this.clear()
    for (let i = 0; i < skills.length; i++) {
      let skill = skills[i]
      let skillMenuItem = this.addMenuItem(skill.name + ' ' + skill.mpCost)
      skillMenuItem.skillName = skill.name
    }
  },
})

// Skills menu
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
var HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
  },
})

var ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
    this.addMenuItem('Attack')
    this.addMenuItem('Skills')
  },
  confirm: function () {
    // we select an action and go to the next menu and choose from the enemies to apply the action
    if (this.menuItemIndex == 0) {
      this.scene.events.emit('SelectedAction')
    } else if (this.menuItemIndex == 1) {
      this.scene.events.emit('SelectedSkills')
    }
  },
})

var EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
  },
  confirm: function () {
    // the player has selected the enemy and we send its id with the event
    this.scene.events.emit('Enemy', this.menuItemIndex)
  },
})

// ------------------------------ UI SCENE maybe move to own file todo ----------------------------
// User Interface scene
export var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function UIScene() {
    Phaser.Scene.call(this, { key: 'UIScene' })
  },

  create: function () {
    // draw some background for the menu
    this.graphics = this.add.graphics()
    this.graphics.lineStyle(1, 0xffffff)
    this.graphics.fillStyle(0x031f4c, 1)
    // Enemies box
    this.graphics.strokeRect(2, 150, 90, 100)
    this.graphics.fillRect(2, 150, 90, 100)
    // Actions box
    this.graphics.strokeRect(95, 150, 120, 100)
    this.graphics.fillRect(95, 150, 120, 100)
    // Heroes box
    this.graphics.strokeRect(218, 150, 130, 100)
    this.graphics.fillRect(218, 150, 130, 100)

    // basic container to hold all menus
    this.menus = this.add.container()

    this.heroesMenu = new HeroesMenu(225, 153, this)
    this.actionsMenu = new ActionsMenu(100, 153, this)
    this.enemiesMenu = new EnemiesMenu(8, 153, this)
    this.skillsMenu = new SkillsMenu(100, 153, this)

    // the currently selected menu
    this.currentMenu = this.actionsMenu

    // add menus to the container
    this.menus.add(this.heroesMenu)
    this.menus.add(this.actionsMenu)
    this.menus.add(this.enemiesMenu)

    this.battleScene = this.scene.get('BattleScene')

    // listen for keyboard events
    this.input.keyboard.off('keydown')
    this.input.keyboard.on('keydown', this.onKeyInput, this)

    // when its player cunit turn to move
    this.battleScene.events.off('PlayerSelect')
    this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this)

    // The skills menu
    this.skillsMenu = new SkillsMenu(100, 153, this)
    this.menus.add(this.skillsMenu)
    this.skillsMenu.visible = false

    // when the action on the menu is selected
    // for now we have only one action so we dont send and action id
    this.events.off('SelectedAction')
    this.events.on('SelectedAction', this.onSelectedAction, this)
    this.events.off('SelectedSkills')
    this.events.on('SelectedSkills', this.onSelectedSkills, this)
    this.events.off('SkillSelected')
    this.events.on('SkillSelected', this.onSkillSelected, this)

    // an enemy is selected
    this.events.off('Enemy')
    this.events.on('Enemy', this.onEnemy, this)

    // when the player doesn't have enough mana to use a skill
    this.battleScene.events.off('noMana')
    this.battleScene.events.on('noMana', this.onNoMana, this)

    // when the scene receives wake event
    this.sys.events.on('wake', this.createMenu, this)

    // the message describing the current action
    this.message = new Message(this, this.battleScene.events)
    this.add.existing(this.message)

    this.createMenu()
  },
  createMenu: function () {
    // map hero menu items to heroes
    this.remapHeroes()
    // map enemies menu items to enemies
    this.remapEnemies()
    // first move, TODO delete this if no bugs
    // this.battleScene.nextTurn()
  },
  onEnemy: function (index) {
    // when the enemy is selected, we deselect all menus and send event with the enemy id
    let action = this.selectedAction || 'attack'
    this.battleScene.receivePlayerSelection(action, index)
    // check to make nomana work
    if (this.currentMenu !== this.skillsMenu) {
      this.currentMenu = null
      this.selectedAction = null
      this.heroesMenu.deselect()
      this.actionsMenu.deselect()
      this.enemiesMenu.deselect()
    }
  },
  onPlayerSelect: function (id) {
    // when its player turn, we select the active hero item and the first action
    // then we make actions menu active
    this.heroesMenu.select(id)
    this.actionsMenu.select(0)
    this.actionsMenu.visible = true
    this.skillsMenu.visible = false
    this.currentMenu = this.actionsMenu
  },
  // we have action selected and we make the enemies menu active
  // the player needs to choose an enemy to attack
  onSelectedAction: function () {
    this.enemiesMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.enemiesMenu
    this.enemiesMenu.select(0)
  },
  onSelectedSkills: function () {
    let currentHero = this.battleScene.heroes[this.heroesMenu.menuItemIndex]
    this.skillsMenu.remapSkills(currentHero.skills)
    this.actionsMenu.visible = false
    this.skillsMenu.visible = true
    this.skillsMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.skillsMenu
    this.skillsMenu.select(0)
  },
  // TODO: add targetting message when selecting enemy, check if back works properly
  onSkillSelected: function (skillName) {
    this.selectedAction = skillName
    this.skillsMenu.visible = false
    this.actionsMenu.visible = false
    this.enemiesMenu.previousMenu = this.skillsMenu
    this.currentMenu = this.enemiesMenu
    this.enemiesMenu.select(0)
  },
  // When player doesnt have mana display a message and return to skill menu
  onNoMana: function () {
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
  onKeyInput: function (event) {
    if (this.currentMenu && this.currentMenu.selected) {
      if (event.code === 'ArrowUp') {
        this.currentMenu.moveSelectionUp()
      } else if (event.code === 'ArrowDown') {
        this.currentMenu.moveSelectionDown()
      } else if (
        event.code === 'ArrowRight' ||
        event.code === 'KeyX' ||
        event.code === 'Escape'
      ) {
        this.menuBack()
      } else if (
        event.code === 'KeyZ' ||
        event.code === 'ArrowLeft' ||
        event.code === 'Enter'
      ) {
        this.currentMenu.confirm()
      }
    }
  },
  // Returns to the previous menu in combat
  menuBack: function () {
    if (this.currentMenu && this.currentMenu.previousMenu) {
      this.currentMenu.deselect()

      // Hides skills menu if going back.
      if (this.currentMenu === this.skillsMenu) {
        this.skillsMenu.visible = false
        this.actionsMenu.visible = true
      }
      this.currentMenu = this.currentMenu.previousMenu
      this.currentMenu.select(0)
    }
  },
})

// the message class extends containter
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
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, '', {
      color: '#ffffff',
      align: 'center',
      fontSize: '8px',
      fontFamily: '"Press Start 2P", cursive',
      /*       stroke: '#000',
      strokeThickness: 1, */
      wordWrap: { width: 170, useAdvancedWrap: true },
    })
    this.add(this.text)
    this.text.setOrigin(0.5)
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
