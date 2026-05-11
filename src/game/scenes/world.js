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

    // user input
    this.cursors = this.input.keyboard.createCursorKeys()

    // where the enemies will be
    this.spawns = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
    })
    for (var i = 0; i < 20; i++) {
      let x
      let y
      let distance
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
      } while (distance < spawnRadius)

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
  wake: function () {
    this.cursors.left.reset()
    this.cursors.right.reset()
    this.cursors.up.reset()
    this.cursors.down.reset()
  },
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

    this.input.stopPropagation()
    // start battle
    this.scene.switch('BattleScene')
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
