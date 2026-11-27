import Phaser from 'phaser'
import { Music } from '../audio/music.js'
import { Sfx } from '../audio/sfx.js'
import { Progression } from '../progression.js'
import { Loot } from '../loot.js'
import { Party } from '../party.js'
import { saveSystem } from '../save.js'
import { enemiesIndex } from '../units/enemies/enemiesIndex.js'
import { heroesIndex } from '../units/heroes/heroesIndex.js'
import { seededRandom, DECORATION_KINDS } from '../art/world'
import { paintGround } from '../art/ground'
import { Ui } from '../ui'
import { Fx } from '../fx'
import { HD } from '../hd'

// map objects are drawn in order of their feet's y position, the HUD above all of them
const HUD_DEPTH = 10000
// ground shadows lie on the grass under everything standing on it, the air (clouds, sun shafts,
// pollen, fireflies) floats over everything on the map
const SHADOW_DEPTH = 0.5
const AIR_DEPTH = HUD_DEPTH - 10

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

    // the map only marks where grass and trees are: the grass is a meadow painted for each floor and
    // the trees are drawn as taller sprites, so their crowns overlap and the player can walk behind them
    this.floor = this.registry.get('floor') || 1
    // light and color of this depth of the dungeon: day on the first floors, night further down
    this.mood = Fx.mood(this.floor)
    Fx.look(this, this.mood.look)
    // the static shadows (trees, bushes, rocks) are stamped into one layer, so where they overlap
    // they don't get darker than a single shadow
    this.groundShadows = this.add
      .renderTexture(0, 0, map.widthInPixels, map.heightInPixels)
      .setOrigin(0, 0)
      .setDepth(SHADOW_DEPTH)
      .setAlpha(0.36)
    grass.setVisible(false)
    // the ground darkens into forest floor under the woods
    const woods = []
    obstacles.forEachTile((tile) => {
      if (tile.index > 0) woods.push([tile.pixelX + 8, tile.pixelY + 8])
    })
    this.add
      .image(
        0,
        0,
        paintGround(
          this,
          map.widthInPixels,
          map.heightInPixels,
          this.floor,
          woods
        )
      )
      .setOrigin(0, 0)
      .setDepth(-1)
    this.plantTrees(obstacles)
    this.scatterDecorations(obstacles)

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

    // the party leader walks the map: a small copy of their battle painting, facing right, flipped
    // to walk left, waddling as it goes (see walk)
    let leader = this.registry.get('partyData')[0].type
    this.player = this.physics.add.sprite(
      50,
      100,
      `map-${leader.toLowerCase()}`
    )
    // collide with the feet only, so the head can overlap trees above
    const { width, height } = this.player
    this.player.body.setSize(10, 6).setOffset((width - 10) / 2, height - 7)
    this.walkTime = 0

    // Spawn radius where enemies will not spawn. In pixels.
    const spawnRadius = 120

    // don't go out of the map
    this.physics.world.bounds.width = map.widthInPixels
    this.physics.world.bounds.height = map.heightInPixels
    this.player.setCollideWorldBounds(true)

    // don't walk on trees
    this.physics.add.collider(this.player, obstacles)

    // the camera follows the leader, kept inside the map (see followCamera)
    this.dive = null
    this.followCamera()

    // --------------------------- MAP OBJECTS ----------------------------------------------------------------

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
      let chest = this.add.sprite(x, y, 'chest').setDepth(y + 8)
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
      let enemy = this.spawns.create(x, y, sprite.world || sprite.texture)
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

    this.createAtmosphere()
    this.createFloorHud()
  },

  // Shadows under everything that moves, the lights (the party's lantern on dark floors, the stairs'
  // glow, glinting chests), and the air: drifting cloud shadows, sun shafts, pollen or fireflies
  createAtmosphere: function () {
    const mood = this.mood
    // 0 on bright floors, close to 1 on the darkest
    const dark = 1 - (mood.look.ambient ?? 1)

    this.movingShadows = []
    const addShadow = (target, width, lift = 0) => {
      const shadow = Fx.shadow(this, target.x, target.y, width).setDepth(
        SHADOW_DEPTH + 0.1
      )
      this.movingShadows.push({ target, shadow, lift })
      return shadow
    }
    addShadow(this.player, 13)
    this.spawns.getChildren().forEach((enemy) => {
      const hover = enemiesIndex[enemy.enemyType].sprite.hover
      addShadow(enemy, Math.max(10, enemy.displayWidth * 0.8), hover ? 5 : 0)
    })
    this.chests.getChildren().forEach((chest) => {
      chest.shadow = Fx.shadow(this, chest.x + 1, chest.y + 7, 18).setDepth(
        SHADOW_DEPTH + 0.1
      )
    })
    Fx.shadow(this, this.stairs.x, this.stairs.y + 6, 20).setDepth(
      SHADOW_DEPTH + 0.1
    )

    if (mood.lantern) {
      this.lantern = Fx.addLight(this, {
        follow: this.player,
        offsetY: -6,
        radius: 92,
        intensity: mood.lantern,
        color: [1, 0.78, 0.5],
        flicker: true,
        priority: 2,
      })
    }
    // the stairs shimmer blue so they can be found in the dark
    const stairsLight = Fx.addLight(this, {
      x: this.stairs.x,
      y: this.stairs.y,
      radius: 46,
      intensity: 0.25 + dark * 0.9,
      color: [0.45, 0.7, 1],
      priority: 1,
    })
    if (stairsLight) {
      this.tweens.add({
        targets: stairsLight,
        radius: 36,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
    if (dark > 0.2) {
      this.chests.getChildren().forEach((chest) => {
        chest.light = Fx.addLight(this, {
          x: chest.x,
          y: chest.y,
          radius: 22,
          intensity: 0.7 * dark,
          color: [1, 0.85, 0.4],
        })
      })
    }

    // wisps and the like glow in the dark
    this.spawns.getChildren().forEach((enemy) => {
      Fx.creatureGlow(this, enemy, enemiesIndex[enemy.enemyType].sprite.texture)
    })

    Fx.cloudShadows(this, mood.clouds, AIR_DEPTH)
    Fx.sunRays(this, mood.rays, mood.rayColor, AIR_DEPTH + 1)
    if (mood.motes === 'pollen') Fx.pollen(this, AIR_DEPTH + 2)
    if (mood.motes === 'fireflies') {
      Fx.fireflies(this, mood.fireflies, AIR_DEPTH + 2, mood.fireflyColor)
    }
    if (mood.rain) Fx.rain(this, AIR_DEPTH + 3, null, () => Sfx.thunder())

    // little puffs of dust kicked up by the leader's feet while walking
    if (Fx.enabled(this)) {
      this.dust = this.add.particles(0, 0, 'fx-mote', {
        lifespan: 380,
        speedX: { min: -10, max: 10 },
        speedY: { min: -10, max: -2 },
        scale: { start: 1.2, end: 0.4 },
        alpha: { start: 0.55, end: 0 },
        tint: [0xd8c8a0, 0xc0b088],
        emitting: false,
      })
      this.dustTimer = 0
    }
    // chests catch the light now and then
    this.time.addEvent({
      delay: 1300,
      loop: true,
      callback: () => {
        const chests = this.chests.getChildren()
        if (!chests.length) return
        const chest = Phaser.Utils.Array.GetRandom(chests)
        const glint = this.add
          .image(
            chest.x + Phaser.Math.Between(-5, 5),
            chest.y - Phaser.Math.Between(0, 5),
            'ui-sparkle'
          )
          .setScale(0.2)
          .setDepth(chest.depth + 1)
        this.tweens.add({
          targets: glint,
          scale: 0.9,
          duration: 220,
          yoyo: true,
          onComplete: () => glint.destroy(),
        })
      },
    })
  },

  // Puffs dust at the leader's feet every few steps while walking
  kickDust: function (delta) {
    if (!this.dust) return
    this.dustTimer -= delta
    if (this.dustTimer > 0) return
    this.dustTimer = 170
    this.dust.setDepth(this.player.depth - 0.5)
    this.dust.explode(2, this.player.x, this.player.y + 11)
  },

  // Floor number in the corner, and a banner announcing the floor when it starts
  createFloorHud: function () {
    const hud = [
      Ui.window(this, 2, 2, 76, 18).setScrollFactor(0).setDepth(HUD_DEPTH),
      this.add
        .pixelText(10, 11, `FLOOR ${this.floor}`)
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(HUD_DEPTH),
    ]

    let banner = this.add
      .pixelText(HD.VIEW_W / 2, 100, `FLOOR ${this.floor}`, 16)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH)
    let parts = [banner]
    // set when taking the stairs, e.g. resting or a new hero joining
    let message = this.registry.get('floorMessage')
    if (message) {
      parts.push(
        this.add
          .colorText(HD.VIEW_W / 2, 125, message, '#ffe27a')
          .setScrollFactor(0)
          .setDepth(HUD_DEPTH)
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
    // the HUD gets a camera of its own, so the map's lighting and effects leave it alone
    this.hudCam = Fx.uiCamera(this, hud.concat(parts))
  },

  // Fades the HUD along with the map during transitions, it has a camera of its own
  fadeHud: function (fadeIn, duration) {
    if (!this.hudCam) return
    if (fadeIn) {
      this.hudCam.resetFX()
      this.hudCam.fadeIn(duration)
    } else {
      this.hudCam.fadeOut(duration, 0, 0, 0)
    }
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
    if (this.dive) this.tweens.killTweensOf(this.dive)
    this.dive = null
    this.followCamera()
    cam.fadeIn(400)
    if (this.warp) {
      this.tweens.killTweensOf(this.warp)
      cam.postFX.remove(this.warp)
      this.warp = null
    }
    this.fadeHud(true, 400)
    Music.play('overworld')

    this.startGracePeriod()
  },
  // After a battle the player can't be attacked for a moment and blinks to show it
  startGracePeriod: function () {
    const duration = 1400
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
    this.walk(0)

    const cam = this.cameras.main
    Fx.flash(this, 0xffffff, 0.9, 180)
    // the camera dives toward the leader while the picture bulges and warps away
    this.dive = { t: 0 }
    this.tweens.add({
      targets: this.dive,
      t: 1,
      duration: 700,
      ease: 'Cubic.easeIn',
    })
    this.warp = cam.postFX.addBarrel(1)
    this.tweens.add({
      targets: this.warp,
      amount: 2.4,
      duration: 700,
      ease: 'Quad.easeIn',
    })
    cam.fadeOut(700, 0, 0, 0)
    this.fadeHud(false, 500)
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
    msg.setOrigin(0.5).setDepth(HUD_DEPTH)
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
    // a burst of golden light as the chest opens
    Fx.pulseLight(this, chest.x, chest.y, [1, 0.85, 0.4], 50, 600)
    Fx.removeLight(this, chest.light)
    if (chest.shadow) chest.shadow.destroy()
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
    this.fadeHud(false, 500)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart())
  },
  // Keeps the leader in the middle of the screen without showing past the map's edges. During the
  // battle transition the camera zooms in on them
  followCamera: function () {
    const cam = this.cameras.main
    const zoom = HD.ZOOM * (1 + 2.5 * (this.dive ? this.dive.t : 0))
    cam.setZoom(zoom)
    const viewW = cam.width / zoom
    const viewH = cam.height / zoom
    const { width, height } = this.physics.world.bounds
    cam.setScroll(
      Phaser.Math.Clamp(
        this.player.x - viewW / 2,
        0,
        Math.max(0, width - viewW)
      ),
      Phaser.Math.Clamp(
        this.player.y - 4 - viewH / 2,
        0,
        Math.max(0, height - viewH)
      )
    )
  },
  update: function (time, delta) {
    this.followCamera()
    // nearer things (further down the map) are drawn in front
    this.player.setDepth(this.player.y + 12)
    // shadows stay under the feet of whatever moves, flyers' shadows a little further down
    this.movingShadows.forEach(({ target, shadow, lift }) => {
      shadow.setPosition(
        Math.round(target.x + 1),
        Math.round(target.y + target.displayHeight / 2 - 1 + lift)
      )
      shadow.setVisible(target.visible).setAlpha(0.35 * target.alpha)
    })
    this.spawns
      .getChildren()
      .forEach((enemy) => enemy.setDepth(enemy.y + enemy.displayHeight / 2))
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
    const velocity = this.player.body.velocity
    if (velocity.x || velocity.y) this.kickDust(delta)

    // face the way they walk, and waddle while moving
    if (this.cursors.left.isDown) this.player.flipX = true
    else if (this.cursors.right.isDown) this.player.flipX = false
    this.walk(velocity.x || velocity.y ? delta : 0)
  },
  // Hides the tree tiles (they still block the way) and stands a tree sprite on each one, nudged,
  // sized and mirrored at random so a wood doesn't look like a grid. The tree paintings are made a
  // little bigger than a tile, so the crowns of a wood close into one canopy
  plantTrees: function (layer) {
    const kinds = {
      2: 'tree-pine',
      4: 'tree-round',
      5: 'tree-dark',
      6: 'tree-round',
    }
    const random = seededRandom(this.floor * 104729)
    layer.setVisible(false)
    layer.forEachTile((tile) => {
      const key = kinds[tile.index]
      if (!key) return
      const x = tile.pixelX + 8 + Math.round((random() - 0.5) * 4)
      const y = tile.pixelY + 15 + Math.round(random() * 2)
      const tree = Fx.sway(
        this,
        this.add
          .image(x, y, key)
          .setOrigin(0.5, 1)
          .setDepth(y)
          .setScale(0.74 + random() * 0.26)
          .setFlipX(random() < 0.5)
      )
      // the sun is to the upper left, so shadows fall to the lower right
      this.stampShadow(x + 4, y, tree.displayWidth * 1.3)
    })
  },

  // Adds a soft ground shadow to the static shadow layer
  stampShadow: function (x, y, width) {
    this.groundShadows.stamp('fx-shadow', null, x, y, {
      scaleX: width / 32,
      scaleY: (width * 0.34) / 12,
    })
  },

  // Bushes, rocks, flowers and tufts on open grass, away from the trees. They are only scenery,
  // nothing collides with them
  scatterDecorations: function (obstacles) {
    const random = seededRandom(this.floor * 15485863)
    const total = DECORATION_KINDS.reduce((sum, [, weight]) => sum + weight, 0)
    const { widthInPixels, heightInPixels } = obstacles.tilemap
    for (let i = 0; i < 70; i++) {
      const x = 8 + Math.floor(random() * (widthInPixels - 16))
      const y = 8 + Math.floor(random() * (heightInPixels - 16))
      if (
        obstacles.getTileAtWorldXY(x, y) ||
        obstacles.getTileAtWorldXY(x, y + 8)
      ) {
        continue
      }
      let roll = random() * total
      const [key] = DECORATION_KINDS.find(([, weight]) => (roll -= weight) < 0)
      const deco = this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y)
      // plants move in the wind, rocks and mushrooms stay still
      if (['deco-tuft', 'deco-flowers', 'deco-bush'].includes(key)) {
        Fx.sway(this, deco)
      }
      // flat things (tufts, flowers) don't cast a visible shadow
      if (deco.height >= 8) this.stampShadow(x + 1, y - 1, deco.width * 1.1)
    }
  },

  // The leader's walk: a sway from foot to foot with a little bounce in each step. delta is the time
  // since the last frame while walking, 0 to settle back to standing
  walk: function (delta) {
    const player = this.player
    if (delta) {
      this.walkTime += delta
      const step = Math.sin(this.walkTime / 75)
      player.setAngle(step * 6)
      player.setScale(1 + Math.abs(step) * 0.04, 1 - Math.abs(step) * 0.05)
    } else {
      this.walkTime = 0
      player.setAngle(player.angle * 0.7)
      player.setScale(1)
    }
  },
})
