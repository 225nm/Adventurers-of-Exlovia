import Phaser from 'phaser'
import { saveSystem } from '../save'
import { Inventory } from '../inventory'
import { AudioEngine } from '../audio/audioEngine'
import { Art } from '../art'
// Boot scene to load assets and initialize game state
export var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' })
  },
  // Only the font and the map layout are loaded from files, all art is generated in create (see src/game/art)
  preload: function () {
    // Load bitmap font
    this.load.bitmapFont(
      'pressstart',
      'assets/pressstart.png',
      'assets/pressstart.fnt'
    )
    this.load.bitmapFont(
      'pressstarty',
      'assets/pressstarty.png',
      'assets/pressstarty.fnt'
    )

    // map in json format, its tiles come from the generated 'tiles' texture
    this.load.tilemapTiledJSON('map', 'assets/map/map.json')
  },
  // Create method to initialize the inventory and start the title scene
  create: function () {
    if (!this.registry.get('inventory')) {
      this.registry.set('inventory', [])
    }
    this.game.inventory = new Inventory(this.registry)

    // small colored dots for spell and hit particles, drawn here so no image files are needed
    const sparks = {
      'spark-fire': 0xff8a2a,
      'spark-ice': 0x9fe6ff,
      'spark-magic': 0xd59cff,
      'spark-white': 0xffffff,
      'spark-bolt': 0xffe66d,
    }
    Object.entries(sparks).forEach(([key, color]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(color, 1)
      g.fillCircle(3, 3, 3)
      g.generateTexture(key, 6, 6)
      g.destroy()
    })

    // fonts, heroes, enemies, map tiles and backgrounds
    Art.createAll(this)

    // audio can only start after the player's first key press
    AudioEngine.installUnlock()

    // start the TitleScene
    this.scene.start('TitleScene')
  },
})
