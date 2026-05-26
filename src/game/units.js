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

    // background
    this.statusBar.fillStyle(0x000000)
    // posx, posy, width, height
    this.statusBar.fillRect(this.x - 28, this.y + 18, 56, 8)

    // health bar
    this.statusBar.fillStyle(0xff0000)
    this.statusBar.fillRect(
      this.x - 28,
      this.y + 18,
      (this.hp / this.maxHp) * 56,
      8
    )
    this.statusText.setText(this.hp + '/' + this.maxHp)

    // AI suggested fix for blurry text
    let roundedX = Math.round(this.x)
    let roundedY = Math.round(this.y)
    this.statusText.setPosition(roundedX, roundedY + 22)

    // mana bar
    if (this.mp !== undefined) {
      this.manaText.setAlpha(1)
      this.statusBar.fillStyle(0x000000)
      this.statusBar.fillRect(this.x - 28, this.y + 27, 56, 8)
      this.statusBar.fillStyle(0x0000ff)
      this.statusBar.fillRect(
        this.x - 28,
        this.y + 27,
        (this.mp / this.maxMp) * 56,
        8
      )
      this.manaText.setText(this.mp + '/' + this.maxMp)
      this.manaText.setPosition(this.x, this.y + 31)
    }
  },
  // we will use this to notify the menu item when the unit is dead
  setMenuItem: function (item) {
    this.menuItem = item
  },
  // attack the target unit
  attack: function (target, modifiedDamage) {
    if (target.living) {
      let finalDamage = modifiedDamage || this.damage
      target.takeDamage(finalDamage)
      if (!modifiedDamage) {
        this.scene.events.emit(
          'Message',
          this.type +
            ' attacks ' +
            target.type +
            ' for ' +
            finalDamage +
            ' damage'
        )
      }
    }
  },
  takeDamage: function (damage) {
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

// Base enemy class
export var Enemy = new Phaser.Class({
  Extends: Unit,

  initialize: function Enemy(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage,
    xpDrop,
    lootTable
  ) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage)
    this.xpDrop = xpDrop || 0
    this.lootTable = lootTable || []
    this.skills = []
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
})
