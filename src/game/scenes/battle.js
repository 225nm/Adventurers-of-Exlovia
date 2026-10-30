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
import { Ui } from '../ui.js'

// Where 1-3 units stand on each side: [x, y of their feet], kept above the menu windows at y 152.
// Units further down the screen are closer and drawn in front, every other one steps forward
const ENEMY_SLOTS = {
  1: [[76, 128]],
  2: [
    [52, 108],
    [114, 140],
  ],
  3: [
    [46, 96],
    [118, 116],
    [60, 142],
  ],
}
const HERO_SLOTS = {
  1: [[256, 120]],
  2: [
    [240, 106],
    [282, 136],
  ],
  3: [
    [236, 94],
    [282, 118],
    [246, 142],
  ],
}
// Stands a unit on its slot: feet on the ground line (flying enemies a little above it), nearer units
// in front, all below the attack effects
const placeUnit = (unit, [x, feetY]) => {
  unit.x = x
  unit.y = Math.round(feetY - (unit.hovering ? 9 : 0) - unit.displayHeight / 2)
  unit.groundY = feetY - 1
  unit.setDepth(1 + feetY / 1000)
}

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
      let hero = new heroesIndex[partyData[i].type](this, 0, 0)
      placeUnit(hero, HERO_SLOTS[partyData.length][i])
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
      let enemy = new enemiesIndex[type](this, 0, 0)
      placeUnit(enemy, ENEMY_SLOTS[enemyAmount][i])
      enemy.startHover()
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
  // Yellow numbers above the targets showing the damage the attacker's skill (null = basic attack) would deal
  showDamagePreview: function (attacker, skill, targets) {
    this.clearDamagePreview()
    this.previewLabels = targets
      .filter((target) => target.living)
      .map((target) =>
        this.add
          .colorText(
            target.x,
            target.y - target.displayHeight / 2 - 6,
            `${attacker.previewDamage(target, skill)}`,
            '#f8ff38'
          )
          .setDepth(100)
      )
  },
  clearDamagePreview: function () {
    ;(this.previewLabels || []).forEach((label) => label.destroy())
    this.previewLabels = []
    this.setTargetBlink(null)
  },
  // The enemy being targeted pulses gently so it's clear who will be hit, null stops it
  setTargetBlink: function (target) {
    if (this.targetBlink) {
      this.targetBlink.tween.stop()
      this.targetBlink.target.alpha = 1
      this.targetBlink = null
    }
    if (target && target.living) {
      this.targetBlink = {
        target,
        tween: this.tweens.add({
          targets: target,
          alpha: 0.45,
          duration: 220,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        }),
      }
    }
  },
  // Plays the attack animation and deals damage to each target when the hit lands, skill is null for basic attacks
  performAction: function (attacker, targets, skill) {
    this.clearDamagePreview()
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
    this.clearDamagePreview()
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
      partyData[i].speed = hero.speed
      partyData[i].xp = hero.xp
      partyData[i].skills = hero.skills
    }
    this.registry.set('partyData', partyData)
    saveSystem.saveGame(this.registry)
    return levelUps
  },
})

// ----------------------------------- MENUS ---------------------------------------
// Windows along the bottom: enemy names on the left (the command list opens over them), the party's
// HP and MP on the right, and the skill list covering both while a skill is picked
const UI_TOP = 152
const UI_H = 88
const LEFT_W = 100
const TEXT_Y = UI_TOP + 15
const HERO_ROW = 22
const HP_RIGHT = 244
const MP_RIGHT = 308

// Base menu item class
var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.BitmapText,

  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.BitmapText.call(this, scene, x, y, 'pressstart', text, 8)

    this.setOrigin(0, 0.5)
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)
    // greyed out: a skill the hero can't afford, a fallen hero
    this.disabled = false
  },

  select: function () {
    this.setFont('pressstarty')
  },

  deselect: function () {
    this.setFont(this.disabled ? 'pressstartg' : 'pressstart')
  },

  setDisabled: function (disabled) {
    this.disabled = disabled
    if (this.font !== 'pressstarty') this.deselect()
  },

  unitKilled: function () {
    this.active = false
    this.visible = false
  },
})

// Base menu class
var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, spacing) {
    Phaser.GameObjects.Container.call(this, scene, x, y)
    this.menuItems = []
    this.menuItemIndex = 0
    this.x = x
    this.y = y
    // pixels between rows
    this.spacing = spacing || 15
    this.selected = false
  },
  addMenuItem: function (unit) {
    var menuItem = new MenuItem(
      0,
      this.menuItems.length * this.spacing,
      unit,
      this.scene
    )
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

  // Remap skills for the skills menu based on the selected hero's skills, the ones the hero can't
  // afford are greyed out
  remapSkills: function (skills, mp) {
    this.clear()
    for (let i = 0; i < skills.length; i++) {
      let skill = skills[i]
      // name and MP cost in two columns, the font is monospaced
      let skillMenuItem = this.addMenuItem(
        skill.name.padEnd(12) + ' ' + String(skill.mpCost).padStart(2)
      )
      skillMenuItem.skillName = skill.name
      skillMenuItem.setDisabled(mp < skill.mpCost)
    }
  },
})
// Menu for selecting skills, inherits from base Menu class. Its window covers the whole bottom of the
// screen, with the hero's MP and what the highlighted skill hits on the right
let SkillsMenu = new Phaser.Class({
  Extends: Menu,
  initialize: function SkillsMenu(x, y, scene) {
    Menu.call(this, x, y, scene, 12)
    this.add(Ui.window(scene, -x, UI_TOP - y, 320, UI_H))
    this.infoLines = [
      'pressstarty',
      'pressstartb',
      'pressstart',
      'pressstartg',
    ].map((font, i) => {
      let line = scene.add
        .bitmapText(178 - x, 2 + i * 15, font, '', 8)
        .setOrigin(0, 0.5)
      this.add(line)
      return line
    })
  },

  confirm: function () {
    let skillName = this.menuItems[this.menuItemIndex].skillName
    this.scene.events.emit('SkillSelected', skillName)
  },

  showInfo: function (hero, skill) {
    this.infoLines[0].setText(hero.type)
    this.infoLines[1].setText(`MP ${hero.mp}/${hero.maxMp}`)
    this.infoLines[2].setText(skill.target === 'all' ? 'All foes' : 'One foe')
    this.infoLines[3].setText(skill.type === 'magic' ? 'Magic' : 'Physical')
  },
})
// Menu for selecting heroes, inherits from base Menu class. Shows the party in the party window,
// where a fallen hero stays, greyed out
var HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene, HERO_ROW)
  },
  remap: function (units) {
    Menu.prototype.remap.call(this, units)
    this.menuItems.forEach((item) => {
      item.unitKilled = function () {
        this.active = false
        this.setDisabled(true)
      }
    })
  },
})
// Menu for selecting actions, inherits from base Menu class. Its window opens over the enemy list
var ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene)
    this.add(Ui.window(scene, -x, UI_TOP - y, LEFT_W, UI_H))
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

// HP and MP of each hero beside their name in the party window, with gauges under the numbers.
// Low HP turns yellow and a fallen hero's red
var PartyStatus = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function PartyStatus(scene) {
    Phaser.GameObjects.Container.call(this, scene, 0, 0)
    this.gauges = scene.add.graphics()
    this.add(this.gauges)
    this.rows = []
  },
  remap: function (heroes) {
    this.rows.forEach((row) => {
      row.hp.destroy()
      row.mp.destroy()
    })
    this.rows = heroes.map((hero, i) => {
      let y = TEXT_Y + i * HERO_ROW
      let hp = this.scene.add
        .bitmapText(HP_RIGHT, y, 'pressstart', '', 8)
        .setOrigin(1, 0.5)
      let mp = this.scene.add
        .bitmapText(MP_RIGHT, y, 'pressstartb', '', 8)
        .setOrigin(1, 0.5)
      this.add([hp, mp])
      return { hero, hp, mp, y }
    })
    this.refresh(true)
  },
  // Called every frame, only redraws when a number has changed
  refresh: function (force) {
    let state = this.rows.map((row) => `${row.hero.hp}/${row.hero.mp}`).join()
    if (!force && state === this.state) return
    this.state = state
    this.gauges.clear()
    this.rows.forEach((row) => {
      let hero = row.hero
      row.hp.setText(`${hero.hp}/${hero.maxHp}`)
      row.hp.setFont(
        hero.hp <= 0
          ? 'pressstartr'
          : hero.hp < hero.maxHp / 4
            ? 'pressstarty'
            : 'pressstart'
      )
      row.mp.setText(`${hero.mp}/${hero.maxMp}`)
      this.gauge(
        HP_RIGHT - 56,
        row.y + 6,
        56,
        hero.hp / hero.maxHp,
        [0xc8f878, 0x40b038]
      )
      this.gauge(
        MP_RIGHT - 48,
        row.y + 6,
        48,
        hero.mp / hero.maxMp,
        [0xb8e8ff, 0x3a84e8]
      )
    })
  },
  gauge: function (x, y, width, ratio, [light, base]) {
    let fill = Math.round(width * Math.max(0, Math.min(1, ratio)))
    this.gauges.fillStyle(0x080a2c, 1).fillRect(x, y, width, 2)
    this.gauges.fillStyle(base, 1).fillRect(x, y, fill, 2)
    this.gauges.fillStyle(light, 1).fillRect(x, y, fill, 1)
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
    // the enemy and party windows are always open, the others open over them
    Ui.window(this, 0, UI_TOP, LEFT_W, UI_H)
    Ui.window(this, LEFT_W, UI_TOP, 320 - LEFT_W, UI_H)

    this.menus = this.add.container()

    this.enemiesMenu = new EnemiesMenu(18, TEXT_Y, this)
    this.heroesMenu = new HeroesMenu(LEFT_W + 16, TEXT_Y, this)
    this.partyStatus = new PartyStatus(this)
    this.actionsMenu = new ActionsMenu(18, TEXT_Y, this)
    this.skillsMenu = new SkillsMenu(18, UI_TOP + 14, this)
    // the command list opens when a hero's turn comes
    this.actionsMenu.visible = false
    this.skillsMenu.visible = false

    this.currentMenu = this.actionsMenu

    this.menus.add([
      this.enemiesMenu,
      this.heroesMenu,
      this.partyStatus,
      this.actionsMenu,
      this.skillsMenu,
    ])
    // hand cursor beside the highlighted entry of the menu in use
    this.pointer = Ui.pointer(this).setVisible(false)

    this.battleScene = this.scene.get('BattleScene')

    this.input.keyboard.off('keydown')
    this.input.keyboard.on('keydown', this.onKeyInput, this)

    this.battleScene.events.off('PlayerSelect')
    this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this)

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
  // Keeps the party window's numbers current and moves the hand cursor to the highlighted entry
  update: function () {
    this.partyStatus.refresh()
    let menu = this.currentMenu
    let item =
      menu &&
      menu.selected &&
      menu.visible &&
      menu.menuItems[menu.menuItemIndex]
    this.pointer.setVisible(!!item)
    if (item) this.pointer.pointAt(menu.x + item.x, menu.y + item.y)
  },
  // Handle enemy selection and emit the selected action and target to the battle scene, then reset menus if not using a skill that targets all enemies
  onEnemy: function (index) {
    this.clearPreview()
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
  // Handle action selection: the command window closes so the enemy list can be used to pick a target
  onSelectedAction: function () {
    // a basic attack, even after backing out of a skill's targeting
    this.selectedAction = null
    this.actionsMenu.visible = false
    this.enemiesMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.enemiesMenu
    this.enemiesMenu.select(0)
    this.showTargetPreview()
  },
  // Handle skills selection, show skills menu
  onSelectedSkills: function () {
    let currentHero = this.battleScene.heroes[this.heroesMenu.menuItemIndex]
    this.skillsMenu.remapSkills(currentHero.skills, currentHero.mp)
    this.actionsMenu.visible = false
    this.skillsMenu.visible = true
    this.skillsMenu.previousMenu = this.actionsMenu
    this.currentMenu = this.skillsMenu
    this.skillsMenu.select(0)
    this.showSkillInfo()
  },
  // Shows the highlighted skill's description in the message box at the top
  showSkillInfo: function () {
    let hero = this.battleScene.heroes[this.heroesMenu.menuItemIndex]
    let item = this.skillsMenu.menuItems[this.skillsMenu.menuItemIndex]
    let skill =
      hero && item && hero.skills.find((s) => s.name === item.skillName)
    if (skill) {
      this.message.showInfo(skill.description || skill.name)
      this.skillsMenu.showInfo(hero, skill)
      // what this skill would do to each enemy
      this.battleScene.showDamagePreview(hero, skill, this.battleScene.enemies)
    }
  },
  // While picking a target: the target's HP and the damage the chosen attack or skill would deal to it
  showTargetPreview: function () {
    let battle = this.battleScene
    let attacker = battle.units[battle.index]
    let target = battle.enemies[this.enemiesMenu.menuItemIndex]
    if (!attacker || !target) return
    let skill = this.selectedAction
      ? attacker.skills.find((s) => s.name === this.selectedAction)
      : null
    battle.showDamagePreview(attacker, skill, [target])
    battle.setTargetBlink(target)
    let name = skill ? skill.name : 'Attack'
    this.message.showInfo(
      `${target.type}  HP ${target.hp}/${target.maxHp}\n${name}: ${attacker.previewDamage(target, skill)} damage`
    )
  },
  // Removes damage numbers and the info text when the player leaves target or skill selection
  clearPreview: function () {
    this.battleScene.clearDamagePreview()
    this.message.hideMessage()
  },
  // Handle skill targetting
  onSkillSelected: function (skillName) {
    this.clearPreview()
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
      this.showTargetPreview()
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
    this.partyStatus.remap(heroes)
  },
  remapEnemies: function () {
    var enemies = this.battleScene.enemies
    this.enemiesMenu.remap(enemies)
  },
  // Handle key input for menu navigation and selection
  onKeyInput: function (event) {
    if (this.currentMenu && this.currentMenu.selected) {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        Sfx.cursor()
        if (event.code === 'ArrowUp') this.currentMenu.moveSelectionUp()
        else this.currentMenu.moveSelectionDown()
        if (this.currentMenu === this.skillsMenu) this.showSkillInfo()
        if (this.currentMenu === this.enemiesMenu) this.showTargetPreview()
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
      this.clearPreview()
      this.currentMenu = this.currentMenu.previousMenu
      this.currentMenu.select(0)
      // only the window of the menu in use is open
      this.actionsMenu.visible = this.currentMenu === this.actionsMenu
      this.skillsMenu.visible = this.currentMenu === this.skillsMenu
      // back from picking a target: show the skill's description again
      if (this.currentMenu === this.skillsMenu) this.showSkillInfo()
    }
  },
})

// Message window across the top of the screen
var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Message(scene, events) {
    Phaser.GameObjects.Container.call(this, scene, 160, 20)
    this.add(Ui.window(scene, -152, -15, 304, 30))

    this.text = this.scene.add.pixelText(0, 0, '')
    this.text.setMaxWidth(288)
    this.text.setCenterAlign()

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
  // Text that stays until hidden, used for skill descriptions while browsing the skill list
  showInfo: function (text) {
    if (this.hideEvent) this.hideEvent.remove(false)
    this.hideEvent = null
    this.text.setText(text)
    this.visible = true
  },
  hideMessage: function () {
    this.hideEvent = null
    this.visible = false
  },
})
