import Phaser from 'phaser'

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

    // Chests
    this.chests = this.physics.add.staticGroup()
    // Amount of chests
    let chestAmount = Phaser.Math.RND.between(1, 5)
    // Loot contained in chests
    let chestLoot = ['Potion', 'Elixir']
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
      // Randomly assign chest item from loot table
      chest.itemName = Phaser.Math.RND.pick(chestLoot)
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
    for (var i = 0; i < 10; i++) {
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

      // TODO add array of enemies here later
      let enemy = this.spawns.create(x, y, 'dragonblue')

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
    this.sys.events.on('wake', this.wake, this)
  },

  // ------------------------------     END OF CREATE ---------------------------------------------------------------

  wake: function () {
    this.cursors.left.reset()
    this.cursors.right.reset()
    this.cursors.up.reset()
    this.cursors.down.reset()

    this.input.keyboard.clearCaptures()
  },
  // When an enemy object is touched by the player
  onMeetEnemy: function (player, zone) {
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

    // TODO implement battle scene transition
    // shake the world
    //this.cameras.main.shake(300)

    // start battle
    this.scene.switch('BattleScene')
  },

  // Logic when player collides with chest object, add item to inventory and show message
  onOpenChest: function (player, chest) {
    if (this.game.inventory) {
      this.game.inventory.addItem(chest.itemName, 1)
    }
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

  // Logic when player collides with stairs object, creates a new map
  onTakeStairs: function (player, stairs) {
    // TODO add more game logic to this feature
    this.scene.restart()
  },
  update: function (time, delta) {
    this.player.body.setVelocity(0)

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
