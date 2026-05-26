import Phaser from 'phaser'
import { saveSystem } from '../save'
import { Inventory } from '../inventory'
// Boot scene to load assets and initialize game state
export var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' })
  },
  // Preload method to load all necessary assets for the game, including tiles, fonts, characters, and enemies
  preload: function () {
    // map tiles
    this.load.image('tiles', 'assets/map/spritesheet.png')
    this.load.image('stairs', 'assets/map/stairs.png')
    this.load.image('chest', 'assets/map/chest.png')

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

    // Title image
    this.load.image('title', 'assets/titleScreen.png')

    // map in json format
    this.load.tilemapTiledJSON('map', 'assets/map/map.json')

    // enemies
    this.load.image('dragonblue', 'assets/dragonblue.png')
    this.load.image('dragonorrange', 'assets/dragonorrange.png')
    this.load.image('ogre', 'assets/ogre.png')

    // Ranger
    this.load.image('ranger', 'assets/ranger.png')

    // our two characters, mage and warrior
    this.load.spritesheet('player', 'assets/RPG_assets.png', {
      frameWidth: 16,
      frameHeight: 16,
    })
  },
  // Create method to initialize the inventory and start the title scene
  create: function () {
    if (!this.registry.get('inventory')) {
      this.registry.set('inventory', [])
    }
    this.game.inventory = new Inventory(this.registry)
    // start the TitleScene
    this.scene.start('TitleScene')
  },
})
