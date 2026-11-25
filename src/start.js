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
import { StatsScene } from './game/scenes/heroStats'
import { OptionsScene } from './game/scenes/options'
import { GameOverScene } from './game/scenes/gameover'
import { PartySelectScene } from './game/scenes/partyselect'
import { PIPELINES } from './game/fx'

// TODO make resolution/zoom level more uniform and fit on multiple units
// Phaser container and physics settings.
var config = {
  // WebGL for shaders and effects, Canvas only where WebGL is missing (effects are skipped there)
  type: Phaser.AUTO,
  parent: 'content',
  width: 320,
  height: 240,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  antialiasGL: false,
  // shader passes for the lighting, bloom and grading (see src/game/fx)
  pipeline: PIPELINES,
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
    PartySelectScene,
    WorldScene,
    BattleScene,
    UIScene,
    VictoryScene,
    PartyScene,
    WorldMenuScene,
    ItemScene,
    StatsScene,
    GameOverScene,
    // last so it draws on top of whichever scene opened it
    OptionsScene,
  ],
}
var game = new Phaser.Game(config)
// lets browser automation (screenshots, smoke tests) reach the game in the dev server
if (import.meta.env && import.meta.env.DEV) window.__game = game

// Text factory
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

// Colored text factory. The game uses the Canvas renderer where setTint does nothing,
// so colored text uses a regular text object with the same pixel font instead.
// Drawn at double size and scaled down for crisp pixels, size is the on-screen height
Phaser.GameObjects.GameObjectFactory.register(
  'colorText',
  function (x, y, text, color = '#ffffff', size = 8) {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: `${size * 2}px`,
        color: color,
        stroke: '#000000',
        strokeThickness: size / 2,
      })
      .setOrigin(0.5)
      .setScale(0.5)
  }
)
