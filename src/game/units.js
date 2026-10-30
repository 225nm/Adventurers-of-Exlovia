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

    // HP gauge under enemies, heroes show their HP and MP in the battle's party window
    this.statusBar = scene.add.graphics().setDepth(50)
    // soft shadow on the ground, kept under the unit by preUpdate
    this.shadow = scene.add.ellipse(x, y, 20, 5, 0x0a1a08, 0.4).setDepth(0.5)
    // flying enemies float above their shadow
    this.hovering = false
    this.updateStatusBar()
  },

  // Keeps the shadow under the unit while it moves, blinks and fades. groundY is where its feet
  // stand, set when the battle places it
  preUpdate: function (time, delta) {
    Phaser.GameObjects.Sprite.prototype.preUpdate.call(this, time, delta)
    if (!this.shadow) return
    const width = Math.round(this.displayWidth * (this.hovering ? 0.5 : 0.7))
    if (this.shadow.width !== width) {
      this.shadow.setSize(width, Math.max(4, Math.round(width / 5)))
    }
    this.shadow.setPosition(
      this.x,
      this.groundY !== undefined
        ? this.groundY
        : this.y + this.displayHeight / 2
    )
    this.shadow.setVisible(this.visible)
    this.shadow.setAlpha(this.alpha)
  },

  // Flying enemies bob gently up and down
  startHover: function () {
    if (!this.hovering) return
    this.scene.tweens.add({
      targets: this,
      y: this.y - 3,
      duration: 700 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  },

  // Redraws the slim HP gauge under an enemy: green, yellow below half, red below a quarter
  updateStatusBar: function () {
    if (!this.statusBar || !this.statusBar.scene) {
      return
    }
    this.statusBar.clear()
    if (this.mp !== undefined) {
      return
    }
    const width = 30
    const x = Math.round(this.x - width / 2)
    // just below the unit's feet (or its shadow), whatever its size
    const y = Math.round(
      this.groundY !== undefined
        ? this.groundY + 3
        : this.y + this.displayHeight / 2 + 3
    )
    const ratio = Math.max(0, Math.min(1, this.hp / this.maxHp))
    const [light, base] =
      ratio > 0.5
        ? [0xc8f878, 0x40b038]
        : ratio > 0.25
          ? [0xfff090, 0xe0a820]
          : [0xffb090, 0xd83828]
    this.statusBar.fillStyle(0x0c0a1c, 1).fillRect(x - 1, y - 1, width + 2, 5)
    this.statusBar.fillStyle(0x3a1828, 1).fillRect(x, y, width, 3)
    const fill = Math.round(width * ratio)
    this.statusBar.fillStyle(base, 1).fillRect(x, y, fill, 3)
    this.statusBar.fillStyle(light, 1).fillRect(x, y, fill, 1)
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
    return target.takeDamage(this.rawDamage(skill), type)
  },
  // Damage before the target's defenses: physical uses attack plus weapon bonus, magic uses magic plus staff bonus
  rawDamage: function (skill) {
    let power = skill ? skill.power : 1
    let stat =
      skill && skill.type === 'magic'
        ? (this.magic || 0) + this.magicBonus
        : this.damage + this.attackBonus
    return Math.round(stat * power)
  },
  // Damage this unit would deal to the target with a skill (or a basic attack), without dealing it.
  // Uses the same formula as attack and takeDamage, so the preview always matches the real hit
  previewDamage: function (target, skill) {
    let type = (skill && skill.type) || 'physical'
    return target.reduceDamage(this.rawDamage(skill), type)
  },
  // armor reduces physical damage and robes reduce magic damage, but a hit always deals at least 1
  reduceDamage: function (damage, type) {
    let reduction = type === 'magic' ? this.magicDefense : this.defense
    return Math.max(1, damage - reduction)
  },
  takeDamage: function (damage, type = 'physical') {
    damage = this.reduceDamage(damage, type)
    this.hp -= damage
    if (this.hp <= 0) {
      this.hp = 0
      this.menuItem.unitKilled()
      this.living = false
      this.statusBar.visible = false
      this.visible = false
      this.menuItem = null
    }
    this.updateStatusBar()
    return damage
  },
  // removes unit, its gauge and shadow from screen
  destroy: function () {
    if (this.scene) {
      this.scene.tweens.killTweensOf(this)
    }
    if (this.statusBar) {
      this.statusBar.destroy()
    }
    if (this.shadow) {
      this.shadow.destroy()
    }
    Phaser.GameObjects.Sprite.prototype.destroy.call(this)
  },
})

// Base enemy class, built from an enemy file's sprite and stats data
// sprite: { texture, frame, scale, flipX, hover }, hover for flying enemies
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
    this.hovering = !!sprite.hover
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
