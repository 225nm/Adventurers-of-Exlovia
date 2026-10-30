import Phaser from 'phaser'
// base class for heroes and enemies
export var Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,

  initialize: function Unit(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage,
    maxHp
  ) {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
    this.type = type
    this.hp = hp
    this.maxHp = maxHp || hp
    this.damage = damage // default damage
    // magic power added to spells, heroes set their own
    this.magic = 0
    // faster units act earlier in each round
    this.speed = 10
    // bonuses from equipment, set by the battle scene for heroes
    this.attackBonus = 0
    this.magicBonus = 0
    this.speedBonus = 0
    this.defense = 0
    this.magicDefense = 0
    // ranged units shoot instead of running up to the target
    this.ranged = false
    this.living = true
    this.menuItem = null

    // hp bar text
    this.statusText = scene.add
      .text(this.x, this.y + 20, '', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
      })
      .setOrigin(0.5)
      .setScale(0.5)

    this.manaText = scene.add
      .text(this.x, this.y + 29, '', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,
      })
      .setOrigin(0.5)
      .setScale(0.5)
      // text above bar
      .setDepth(99)
      // hide mana text by default
      .setAlpha(0)

    // text above bar
    this.statusText.setDepth(99)

    // Status bars
    this.statusBar = scene.add.graphics()
    this.updateStatusBar()
  },

  // Updates status bars
  updateStatusBar: function () {
    // crash fix
    if (!this.statusText || !this.statusText.texture) {
      return
    }
    this.statusBar.clear()

    // bars sit just below the sprite, whatever its size (y + 18 for a 32px sprite)
    let barY = Math.round(this.y + this.displayHeight / 2 + 2)

    // background
    this.statusBar.fillStyle(0x000000)
    // posx, posy, width, height
    this.statusBar.fillRect(this.x - 28, barY, 56, 8)

    // health bar
    this.statusBar.fillStyle(0xff0000)
    this.statusBar.fillRect(this.x - 28, barY, (this.hp / this.maxHp) * 56, 8)
    this.statusText.setText(this.hp + '/' + this.maxHp)

    // AI suggested fix for blurry text
    let roundedX = Math.round(this.x)
    this.statusText.setPosition(roundedX, barY + 4)

    // mana bar
    if (this.mp !== undefined) {
      this.manaText.setAlpha(1)
      this.statusBar.fillStyle(0x000000)
      this.statusBar.fillRect(this.x - 28, barY + 9, 56, 8)
      this.statusBar.fillStyle(0x0000ff)
      this.statusBar.fillRect(
        this.x - 28,
        barY + 9,
        (this.mp / this.maxMp) * 56,
        8
      )
      this.manaText.setText(this.mp + '/' + this.maxMp)
      this.manaText.setPosition(roundedX, barY + 13)
    }
  },
  // we will use this to notify the menu item when the unit is dead
  setMenuItem: function (item) {
    this.menuItem = item
  },
  // attack the target unit, skill is left out for basic attacks. Returns the damage actually dealt
  attack: function (target, skill) {
    if (!target.living) {
      return 0
    }
    let type = (skill && skill.type) || 'physical'
    let power = skill ? skill.power : 1
    // physical uses attack plus weapon bonus, magic uses magic plus staff bonus
    let stat =
      type === 'magic'
        ? (this.magic || 0) + this.magicBonus
        : this.damage + this.attackBonus
    return target.takeDamage(Math.round(stat * power), type)
  },
  // armor reduces physical damage and robes reduce magic damage, but a hit always deals at least 1
  takeDamage: function (damage, type = 'physical') {
    let reduction = type === 'magic' ? this.magicDefense : this.defense
    damage = Math.max(1, damage - reduction)
    this.hp -= damage
    if (this.hp <= 0) {
      this.hp = 0
      this.menuItem.unitKilled()
      this.living = false
      this.statusBar.visible = false
      this.statusText.visible = false
      this.manaText.visible = false
      this.visible = false
      this.menuItem = null
    }
    this.updateStatusBar()
    return damage
  },
  // removes unit and text from screen
  destroy: function () {
    if (this.statusBar) {
      this.statusBar.destroy()
    }
    if (this.statusText) {
      this.statusText.destroy()
    }
    if (this.manaText) {
      this.manaText.destroy()
    }
    Phaser.GameObjects.Sprite.prototype.destroy.call(this)
  },
})

// Base enemy class, built from an enemy file's sprite and stats data
// sprite: { texture, frame, scale, flipX }
// stats: { name, hp, damage, magic, speed, defense, magicDefense, xp, loot, skills }
// Stats are the floor 1 values, the battle scene scales them for deeper floors
export var Enemy = new Phaser.Class({
  Extends: Unit,

  initialize: function Enemy(scene, x, y, sprite, stats) {
    Unit.call(
      this,
      scene,
      x,
      y,
      sprite.texture,
      sprite.frame,
      stats.name,
      stats.hp,
      stats.damage
    )
    this.setScale(sprite.scale || 1)
    this.flipX = !!sprite.flipX
    this.magic = stats.magic || 0
    this.speed = stats.speed || 10
    this.defense = stats.defense || 0
    this.magicDefense = stats.magicDefense || 0
    this.xpDrop = stats.xp || 0
    // [{ item, chance }], each entry rolls separately
    this.lootTable = stats.loot || []
    this.skills = stats.skills || []
  },
})
// Base player character class
export var PlayerCharacter = new Phaser.Class({
  Extends: Unit,

  initialize: function PlayerCharacter(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage,
    xp,
    mp,
    maxMp,
    level,
    maxHp
  ) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage)

    this.maxMp = maxMp || 0
    this.mp = mp || 0
    this.xp = xp || 0
    this.level = level || 1
    this.maxHp = maxHp || hp

    this.updateStatusBar()
  },
  // Raises the level and adds the hero class's growth ({ hp, mp, damage, magic }) to the stats
  gainLevel: function (growth) {
    this.level += 1
    this.maxHp += growth.hp
    this.hp += growth.hp
    this.maxMp += growth.mp
    this.mp += growth.mp
    this.damage += growth.damage
    this.magic += growth.magic
    this.speed += growth.speed || 0
  },
})
