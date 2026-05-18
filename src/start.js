import Phaser from 'phaser'
import { BootScene } from './game/scenes/boot'
import { WorldScene } from './game/scenes/world'
import { BattleScene } from './game/scenes/battle'
import { UIScene } from './game/scenes/battle'
import { TitleScene } from './game/scenes/title'
import { VictoryScene } from './game/scenes/victory'
import { PartyScene } from './game/scenes/partymenu'
import { WorldMenuScene } from './game/scenes/worldmenu'
import { ItemScene } from './game/scenes/itemmenu'

// TODO make resolution/zoom level more uniform and fit on multiple units
// Phaser container and physics settings.
var config = {
  type: Phaser.CANVAS,
  parent: 'content',
  width: 320,
  height: 240,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  antialiasGL: false,
  /* zoom: 3, */
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NONE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false, // set to true to view zones/hitboxes
    },
  },
  scene: [
    BootScene,
    TitleScene,
    WorldScene,
    BattleScene,
    UIScene,
    VictoryScene,
    PartyScene,
    WorldMenuScene,
    ItemScene,
  ],
}
var game = new Phaser.Game(config)

// AI added custom object for text
Phaser.GameObjects.GameObjectFactory.register(
  'pixelText',
  function (x, y, text, size = 8) {
    // 1. Create the native bitmap text object
    const bitmapText = this.scene.add.bitmapText(x, y, 'pressstart', text, size)

    // 2. Set the global default origin for your game (centered)
    bitmapText.setOrigin(0.5)

    // 3. Prevent floating-point subpixel blur instantly by snapping positions
    bitmapText.x = Math.floor(bitmapText.x)
    bitmapText.y = Math.floor(bitmapText.y)

    return bitmapText
  }
)
