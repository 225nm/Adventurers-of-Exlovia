import Phaser from 'phaser'
import { BootScene } from './game/scenes/boot'
import { WorldScene } from './game/scenes/world'
import { BattleScene } from './game/scenes/battle'
import { UIScene } from './game/scenes/battle'
import { TitleScene } from './game/scenes/title'
import { VictoryScene } from './game/scenes/victory'
import { PartyScene } from './game/scenes/partymenu'
import { WorldMenuScene } from './game/scenes/worldmenu'

// TODO make resolution/zoom level more uniform and fit on multiple units
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
  ],
}
var game = new Phaser.Game(config)
