import Phaser from 'phaser'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'
import { Progression } from '../progression.js'
import { Loot } from '../loot.js'
import { Party } from '../party.js'
import { saveSystem } from '../save.js'
import { enemiesIndex } from '../units/enemies/enemiesIndex.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'

export var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' })
  },

  preload: function () {},

  create: function () {
    // create the map
    var map = this.make.tilemap({ key: 'map' })

    // first parameter is the name of the tilemap in tiled
    var tiles = map.addTilesetImage('spritesheet', 'tiles')

    // creating the layers
    var grass = map.createLayer('Grass', tiles, 0, 0)
    var obstacles = map.createLayer('Obstacles', tiles, 0, 0)

    // make all tiles in obstacles collidable
    obstacles.setCollisionByExclusion([-1])

    // Clean up old listeners
    this.input.keyboard.off('keydown-C')
    this.input.keyboard.off('keydown-ESC')

    // Input listener for the pause menu on C key
    this.input.keyboard.on('keydown-C', () => {
      if (
        this.scene.isActive('WorldMenuScene') ||
        this.scene.isActive('ItemScene') ||
        this.scene.isActive('PartyScene')
      )
        return
      if (this.scene.isActive('WorldMenuScene')) return
      if (this.transitioning) return
      Sfx.confirm()
      this.scene.pause()
      this.scene.launch('WorldMenuScene')
    })
    // Input listener for escape to open menu
    this.input.keyboard.on('keydown-ESC', () => {
      if (
        this.scene.isActive('WorldMenuScene') ||
        this.scene.isActive('ItemScene') ||
        this.scene.isActive('PartyScene')
      )
        return
      if (this.transitioning) return
      Sfx.confirm()
      this.scene.pause()
      this.scene.launch('WorldMenuScene')
    })

    //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [1, 7, 1, 13],
      }),
      frameRate: 10,
      repeat: -1,
    })

    // animation with key 'right'
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [1, 7, 1, 13],
      }),
      frameRate: 10,
      repeat: -1,
    })
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [2, 8, 2, 14],
      }),
      frameRate: 10,
      repeat: -1,
    })
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', {
        frames: [0, 6, 0, 12],
      }),
      frameRate: 10,
      repeat: -1,
    })

    // our player sprite created through the phycis system
    this.player = this.physics.add.sprite(50, 100, 'player', 6)

    // Spawn radius where enemies will not spawn. In pixels.
    const spawnRadius = 120

    // don't go out of the map
    this.physics.world.bounds.width = map.widthInPixels
    this.physics.world.bounds.height = map.heightInPixels
    this.player.setCollideWorldBounds(true)

    // don't walk on trees
    this.physics.add.collider(this.player, obstacles)

    // limit camera to map and zoom map
    //this.cameras.main.setZoom(2)
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.startFollow(this.player)
    this.cameras.main.roundPixels = true // avoid tile bleed

    // --------------------------- MAP OBJECTS ----------------------------------------------------------------

    // current dungeon floor, decides enemies and loot
    this.floor = this.registry.get('floor') || 1

    // Chests
    this.chests = this.physics.add.staticGroup()
    // Amount of chests
    let chestAmount = Phaser.Math.RND.between(2, 4)
    // Spawn logic for chests
    for (let i = 0; i < chestAmount; i++) {
      let x, y, distance, isBlocked
      do {
        x = Phaser.Math.RND.between(20, this.physics.world.bounds.width - 20)
        y = Phaser.Math.RND.between(20, this.physics.world.bounds.height - 20)
        distance = Phaser.Math.Distance.Between(
          x,
          y,
          this.player.x,
          this.player.y
        )

        let tile = obstacles.getTileAtWorldXY(x, y)
        isBlocked = tile !== null
      } while (distance < spawnRadius || isBlocked)
      // Load asset
      let chest = this.add.sprite(x, y, 'chest')
      // chest contents get better on deeper floors
      chest.itemName = Loot.rollChest(this.floor)
      chest.setScale(1)
      this.chests.add(chest)
    }
    // Chest collider physics
    this.physics.add.overlap(
      this.player,
      this.chests,
      this.onOpenChest,
      null,
      this
    )

    // Stairs
    let stairs
    // Spawn logic for stairs
    let stairsX, stairsY, stairsDistance, isBlockedStairs
    do {
      stairsX = Phaser.Math.RND.between(
        40,
        this.physics.world.bounds.width - 40
      )
      stairsY = Phaser.Math.RND.between(
        40,
        this.physics.world.bounds.height - 40
      )
      stairsDistance = Phaser.Math.Distance.Between(
        stairsX,
        stairsY,
        this.player.x,
        this.player.y
      )
      let stairsTile = obstacles.getTileAtWorldXY(stairsX, stairsY)
      isBlockedStairs = stairsTile !== null
    } while (stairsDistance < spawnRadius || isBlockedStairs)
    this.stairs = this.physics.add.staticSprite(stairsX, stairsY, 'stairs')
    this.physics.add.overlap(
      this.player,
      this.stairs,
      this.onTakeStairs,
      null,
      this
    )

    //--------------------------------------- user input --------------------------------------------
    this.cursors = this.input.keyboard.createCursorKeys()

    //--------------------------------- Enemy overworld logic -----------------------------------------
    this.spawns = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    })
    // more enemies roam deeper floors
    let enemyAmount = Math.min(8 + this.floor, 14)
    for (var i = 0; i < enemyAmount; i++) {
      let x
      let y
      let distance
      let enemyBlocked
      // check that enemies spawn minimum 120 pixels away from player spawn
      // parameters are x, y, width, height
      do {
        x = Phaser.Math.RND.between(0, this.physics.world.bounds.width)
        y = Phaser.Math.RND.between(0, this.physics.world.bounds.height)
        distance = Phaser.Math.Distance.Between(
          x,
          y,
          this.player.x,
          this.player.y
        )
        let tile = obstacles.getTileAtWorldXY(x, y)
        enemyBlocked = tile !== null
      } while (distance < spawnRadius || enemyBlocked)

      // each roaming enemy shows the enemy type that leads the battle when touched
      let enemyType = Progression.pickEnemy(this.floor)
      let sprite = enemiesIndex[enemyType].sprite
      let enemy = this.spawns.create(x, y, sprite.texture, sprite.frame)
      enemy.enemyType = enemyType
      enemy.setScale(sprite.worldScale || 1)
      enemy.flipX = !!sprite.flipX

      enemy.setCollideWorldBounds(true)
      enemy.setBounce(1)
      enemy.setVelocity(
        Phaser.Math.RND.between(-20, 20),
        Phaser.Math.RND.between(-20, 20)
      )
    }
    // more colliders for enemies
    this.physics.add.collider(this.spawns, obstacles)
    this.physics.add.collider(this.spawns, this.spawns)
    this.physics.add.collider(this.spawns, this.chests)
    this.physics.add.collider(this.spawns, this.stairs)
    // add collider
    this.physics.add.overlap(
      this.player,
      this.spawns,
      this.onMeetEnemy,
      false,
      this
    )
    // we listen for 'wake' event
    // remove the listener from before a restart (stairs), or wake would run once per floor visited
    this.sys.events.off('wake', this.wake, this)
    this.sys.events.on('wake', this.wake, this)

    this.transitioning = false
    this.invulnerable = false
    this.graceBlink = null
    this.graceTimer = null
    this.descending = false
    Music.play('overworld')

    this.createFloorHud()
  },

  // Floor number in the corner, and a banner announcing the floor when it starts
  createFloorHud: function () {
    this.add
      .pixelText(6, 6, `FLOOR ${this.floor}`)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100)

    let banner = this.add
      .pixelText(160, 100, `FLOOR ${this.floor}`, 16)
      .setScrollFactor(0)
      .setDepth(100)
    let parts = [banner]
    // set when taking the stairs, e.g. resting or a new hero joining
    let message = this.registry.get('floorMessage')
    if (message) {
      parts.push(
        this.add
          .colorText(160, 125, message, '#f8ff38')
          .setScrollFactor(0)
          .setDepth(100)
      )
      this.registry.set('floorMessage', null)
    }
    this.tweens.add({
      targets: parts,
      alpha: 0,
      delay: 1800,
      duration: 600,
      onComplete: () => parts.forEach((part) => part.destroy()),
    })
  },

  // ------------------------------     END OF CREATE ---------------------------------------------------------------

  wake: function () {
    this.cursors.left.reset()
    this.cursors.right.reset()
    this.cursors.up.reset()
    this.cursors.down.reset()

    this.input.keyboard.clearCaptures()

    // undo the battle transition and fade back in
    this.transitioning = false
    const cam = this.cameras.main
    // the battle starts when the fade ends, which can be a frame before the swirl tween ends,
    // and a paused tween would resume on wake and zoom/rotate the camera again
    this.tweens.killTweensOf(cam)
    cam.resetFX()
    cam.setZoom(1)
    cam.setRotation(0)
    cam.fadeIn(400)
    Music.play('overworld')

    this.startGracePeriod()
  },
  // After a battle the player can't be attacked for a moment and blinks to show it
  startGracePeriod: function () {
    const duration = 2000
    this.invulnerable = true
    // restart cleanly if a grace period is already running
    if (this.graceBlink) this.graceBlink.stop()
    if (this.graceTimer) this.graceTimer.remove()
    this.graceBlink = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 125,
      yoyo: true,
      repeat: -1,
    })
    this.graceTimer = this.time.delayedCall(duration, () => {
      this.invulnerable = false
      this.graceBlink.stop()
      this.graceBlink = null
      this.graceTimer = null
      this.player.alpha = 1
    })
  },
  // When an enemy object is touched by the player
  onMeetEnemy: function (player, zone) {
    // ignore enemies touched while the transition plays or during the grace period after a battle
    if (this.transitioning || this.invulnerable || this.descending) return
    this.transitioning = true
    const safeRadius = 80
    let newX
    let newY
    let distanceRespawn
    do {
      newX = Phaser.Math.RND.between(0, this.physics.world.bounds.width)
      newY = Phaser.Math.RND.between(0, this.physics.world.bounds.height)
      distanceRespawn = Phaser.Math.Distance.Between(
        newX,
        newY,
        player.x,
        player.y
      )
    } while (distanceRespawn < safeRadius)
    zone.x = newX
    zone.y = newY

    // the touched enemy's type leads the battle
    this.registry.set('encounter', zone.enemyType)

    // SNES-style battle transition: flash, then the screen swirls and zooms into darkness
    Music.stop()
    Sfx.encounter()
    this.player.body.setVelocity(0)
    this.player.anims.stop()

    const cam = this.cameras.main
    cam.flash(150, 255, 255, 255)
    this.tweens.add({
      targets: cam,
      zoom: 4,
      rotation: Math.PI * 1.5,
      duration: 700,
      ease: 'Cubic.easeIn',
    })
    cam.fadeOut(700, 0, 0, 0)
    // start battle once the screen is black
    cam.once('camerafadeoutcomplete', () => {
      this.scene.switch('BattleScene')
    })
  },

  // Logic when player collides with chest object, add item to inventory and show message
  onOpenChest: function (player, chest) {
    if (this.game.inventory) {
      this.game.inventory.addItem(chest.itemName, 1)
    }
    Sfx.itemGet()
    // AI generated message animation
    let msg = this.add.pixelText(
      chest.x,
      chest.y - 8,
      `Found one ${chest.itemName}!`
    )
    msg.setOrigin(0.5)
    this.tweens.add({
      targets: msg,
      y: chest.y - 40, // Move 24 pixels upwards
      alpha: 0, // Fade out to completely transparent
      duration: 1500, // Animation takes 1.5 seconds
      ease: 'Linear',
      onComplete: function () {
        msg.destroy()
      },
    })
    chest.destroy()
  },

  // Going down the stairs: next floor with stronger enemies and better loot.
  // The party rests (recovers half their HP and MP), new heroes may join, and the game autosaves
  onTakeStairs: function (player, stairs) {
    if (this.descending || this.transitioning) return
    this.descending = true

    let floor = this.floor + 1
    let partyData = this.registry.get('partyData')
    let message = 'Your party rests and recovers'

    partyData.forEach((hero) => {
      hero.hp = Math.min(hero.maxHp, hero.hp + Math.ceil(hero.maxHp / 2))
      hero.mp = Math.min(hero.maxMp, hero.mp + Math.ceil(hero.maxMp / 2))
    })

    // the hero class not picked at the start joins, at the party's average level so they can keep up
    let recruit = Object.keys(heroesIndex).find(
      (type) => !partyData.some((hero) => hero.type === type)
    )
    if (floor >= Progression.recruitFloor && recruit) {
      let averageLevel = Math.round(
        partyData.reduce((sum, hero) => sum + hero.level, 0) / partyData.length
      )
      partyData.push(Party.createHero(recruit, averageLevel))
      message = `The ${recruit} joins your party!`
    }

    this.registry.set('partyData', partyData)
    this.registry.set('floor', floor)
    this.registry.set('floorMessage', message)
    saveSystem.saveGame(this.registry)

    Sfx.descend()
    this.player.body.setVelocity(0)
    this.cameras.main.fadeOut(500, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart())
  },
  update: function (time, delta) {
    this.player.body.setVelocity(0)
    // player can't move during the battle transition or while going down the stairs
    if (this.transitioning || this.descending) return

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80)
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80)
    }
    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80)
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80)
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true)
      this.player.flipX = true
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true)
      this.player.flipX = false
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('up', true)
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('down', true)
    } else {
      this.player.anims.stop()
    }
  },
})
