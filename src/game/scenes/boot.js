import Phaser from 'phaser'
import { saveSystem } from '../save'
import { Inventory } from '../inventory'
import { AudioEngine } from '../audio/audioEngine'
import { Art } from '../art'
import { Ui } from '../ui'
import { Fx } from '../fx'
import { hdCanvas } from '../hd'

const SPRITES = [
  'battler-warrior',
  'battler-mage',
  'battler-ranger',
  'slime',
  'bat',
  'goblin',
  'wisp-fire',
  'wisp-ice',
  'dark-mage',
  'ogre',
  'dragon-orange',
  'dragon-blue',
  'title-knight',
  'title-mage',
  'battle-bg',
  'title-bg',
  'tree-round',
  'tree-dark',
  'tree-pine',
]
// Boot scene to load assets and initialize game state
export var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' })
  },
  // Loads the map layout and the battle and title sprites, the rest of the art is generated in create (see src/game/art)
  preload: function () {
    // map in json format, its tiles come from the generated 'tiles' texture
    this.load.tilemapTiledJSON('map', 'assets/map/map.json')

    // pixel art rendered from the SVGs in tools/sprites (node tools/sprites/render.mjs)
    SPRITES.forEach((key) => this.load.image(key, `assets/sprites/${key}.png`))
  },
  // Create method to initialize the inventory and start the title scene
  create: function () {
    if (!this.registry.get('inventory')) {
      this.registry.set('inventory', [])
    }
    this.game.inventory = new Inventory(this.registry)

    // glowing sparks for spell and hit particles: a white hot core fading into the color
    const sparks = {
      'spark-fire': '255, 138, 42',
      'spark-ice': '159, 230, 255',
      'spark-magic': '213, 156, 255',
      'spark-white': '255, 255, 255',
      'spark-bolt': '255, 230, 109',
    }
    Object.entries(sparks).forEach(([key, rgb]) => {
      hdCanvas(this, key, 6, 6, (ctx) => {
        const glow = ctx.createRadialGradient(3, 3, 0, 3, 3, 3)
        glow.addColorStop(0, 'rgba(255, 255, 255, 1)')
        glow.addColorStop(0.35, `rgba(${rgb}, 1)`)
        glow.addColorStop(1, `rgba(${rgb}, 0)`)
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, 6, 6)
      })
    })

    // glows, shadows, clouds and light shafts for the effects
    Fx.createTextures(this)
    // menu windows' cursor
    Ui.createTextures(this)

    // audio can only start after the player's first key press
    AudioEngine.installUnlock()

    // the logo and all text need the fonts, so the title waits for them (a missing font falls back)
    Promise.all(
      ['800 16px Nunito', '700 16px Cinzel', '900 16px Cinzel'].map((font) =>
        document.fonts.load(font).catch(() => null)
      )
    ).then(() => {
      // map heroes and enemies, tiles and the title logo
      Art.createAll(this)
      this.scene.start('TitleScene')
    })
  },
})
