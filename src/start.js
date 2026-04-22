import Phaser from 'phaser'
import { BootScene } from './game/scenes/boot'
import { WorldScene } from './game/scenes/world'
import { BattleScene } from './game/scenes/battle'
import { UIScene } from './game/scenes/battle'

// TODO make resolution/zoom level more uniform and fit on multiple units
var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 320,
  height: 240,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true, // set to true to view zones
    },
  },
  scene: [BootScene, WorldScene, BattleScene, UIScene],
}
var game = new Phaser.Game(config)
