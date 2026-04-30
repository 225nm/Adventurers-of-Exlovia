import Phaser from 'phaser'
import { BootScene } from './game/scenes/boot'
import { WorldScene } from './game/scenes/world'
import { BattleScene } from './game/scenes/battle'
import { UIScene } from './game/scenes/battle'
import { TitleScene } from './game/scenes/title'

// TODO make resolution/zoom level more uniform and fit on multiple units
//Test commit
var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 320,
  height: 240,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true, // set to true to view zones
    },
  },
  scene: [BootScene, TitleScene, WorldScene, BattleScene, UIScene],
}
var game = new Phaser.Game(config)
