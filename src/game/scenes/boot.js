import Phaser from 'phaser'
import { saveSystem } from '../save'

export var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' })
  },

  preload: function () {
    // map tiles
    this.load.image('tiles', 'assets/map/spritesheet.png')

    // Title image
    this.load.image('title', 'assets/titleScreen.png')

    // map in json format
    this.load.tilemapTiledJSON('map', 'assets/map/map.json')

    // enemies
    this.load.image('dragonblue', 'assets/dragonblue.png')
    this.load.image('dragonorrange', 'assets/dragonorrange.png')
    // ranger
    this.load.image('ranger', 'assets/ranger.png')

    // our two characters
    this.load.spritesheet('player', 'assets/RPG_assets.png', {
      frameWidth: 16,
      frameHeight: 16,
    }),
      // Font file
      this.load.addFile(new CustomFontFile(this.load, 'Press Start 2P'))
  },

  create: function () {
    // start the TitleScene
    this.scene.start('TitleScene')
  },
})

// AI suggested custom class in order to load font before Title screen is loaded
class CustomFontFile extends Phaser.Loader.File {
  constructor(loader, fontName) {
    super(loader, { type: 'text', key: fontName })
  }
  load() {
    document.fonts.load(`10px "${this.key}"`).then(() => {
      this.loader.nextFile(this, true)
    })
  }
}
