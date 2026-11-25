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
import { HD, installCameras } from './game/hd'
import { registerTextFactories } from './game/text'

// cameras zoom into the layout, text draws at screen resolution (see hd.js and text.js)
installCameras()
registerTextFactories()

// Painted at 1920x1080. Cameras zoom into the 320x240 layout space (see hd.js)
var config = {
  // shaders and high resolution textures need WebGL
  type: Phaser.WEBGL,
  parent: 'content',
  width: HD.WIDTH,
  height: HD.HEIGHT,
  antialias: true,
  backgroundColor: '#000000',
  // shader passes for the lighting, bloom and grading (see src/game/fx)
  pipeline: PIPELINES,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
