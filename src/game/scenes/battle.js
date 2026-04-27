import Phaser from 'phaser'
import { PlayerCharacter, Enemy, Unit } from '../units'
import { warriorSkills } from '../skills/warriorSkills'
import { mageSkills } from '../skills/mageSkills'

export var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BattleScene() {
    Phaser.Scene.call(this, { key: 'BattleScene' })
  },
  create: function () {
    // this.cameras.main.setZoom(2)
    // change the background to green
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)')
    this.startBattle()
    // on wake event we call startBattle too
    this.sys.events.on('wake', this.startBattle, this)
  },
  startBattle: function () {
    // (scene, x, y, texture, frame, type, hp, damage)
    // player character - warrior
    var warrior = new PlayerCharacter(
      this,
      250,
      50,
      'player',
      1,
      'Warrior',
      100,
      20
    )
    warrior.skills = warriorSkills
    this.add.existing(warrior)

    // player character - mage
    var mage = new PlayerCharacter(this, 250, 100, 'player', 4, 'Mage', 80, 8)
    mage.skills = mageSkills
    this.add.existing(mage)

    var dragonblue = new Enemy(
      this,
      50,
      50,
      'dragonblue',
      null,
      'Dragon',
      50,
      3
    )
    this.add.existing(dragonblue)

    var dragonOrange = new Enemy(
      this,
      50,
      100,
      'dragonorrange',
      null,
      'Dragon2',
      50,
      3
    )
    this.add.existing(dragonOrange)

    // array with heroes
    this.heroes = [warrior, mage]
    // array with enemies
    this.enemies = [dragonblue, dragonOrange]
    // array with both parties, who will attack
    this.units = this.heroes.concat(this.enemies)

    this.index = -1 // currently active unit

    this.scene.run('UIScene')
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
    if (this.units[this.index] instanceof PlayerCharacter) {
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
    return victory || gameOver
  },
  // when the player have selected the enemy to be attacked
  receivePlayerSelection: function (action, target) {
    let attacker = this.units[this.index]
    let victim = this.enemies[target]

    if (action == 'attack') {
      attacker.attack(victim)
    } else {
      // AI suggested syntax
      let skill = this.units[this.index].skills.find((s) => s.name === action)

      if (skill) {
        this.units[this.index].damage = skill.damage
        let oldDamage = attacker.damage
        attacker.damage = skill.damage
        attacker.attack(victim)

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

        // resets the damage value after skill usage
        attacker.damage = oldDamage
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
    this.heroes.length = 0
    this.enemies.length = 0
    for (var i = 0; i < this.units.length; i++) {
      // link item
      this.units[i].destroy()
    }
    this.units.length = 0
    // sleep the UI
    this.scene.sleep('UIScene')
    // return to WorldScene and sleep current BattleScene
    this.scene.switch('WorldScene')
  },
})

// ----------------------------------- MENUS ---------------------------------------
// Maybe move to separate module later

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
      this.addMenuItem(skill.name)
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
    let skillName = this.menuItems[this.menuItemIndex].text
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

// ------------------------------ UI SCENE maybe move to own file ----------------------------
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
    this.input.keyboard.on('keydown', this.onKeyInput, this)

    // when its player cunit turn to move
    this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this)

    // The skills menu
    this.skillsMenu = new SkillsMenu(100, 153, this)
    this.menus.add(this.skillsMenu)
    this.skillsMenu.visible = false

    // when the action on the menu is selected
    // for now we have only one action so we dont send and action id
    this.events.on('SelectedAction', this.onSelectedAction, this)
    this.events.on('SelectedSkills', this.onSelectedSkills, this)
    this.events.on('SkillSelected', this.onSkillSelected, this)

    // an enemy is selected
    this.events.on('Enemy', this.onEnemy, this)

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
    // first move
    this.battleScene.nextTurn()
  },
  onEnemy: function (index) {
    // when the enemy is selected, we deselect all menus and send event with the enemy id
    this.heroesMenu.deselect()
    this.actionsMenu.deselect()
    this.enemiesMenu.deselect()

    let action = this.selectedAction || 'attack'
    this.battleScene.receivePlayerSelection(action, index)
    this.currentMenu = null
    this.selectedAction = null
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
      } else if (event.code === 'ArrowRight' || event.code === 'KeyX') {
        this.menuBack()
      } else if (event.code === 'KeyZ' || event.code === 'ArrowLeft') {
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
