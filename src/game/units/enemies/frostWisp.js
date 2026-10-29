import Phaser from 'phaser'
import { Enemy } from '../../units'
// Frost Wisp: tougher cousin of the Fire Wisp that can freeze the whole party
export let frostWisp = new Phaser.Class({
  Extends: Enemy,
  initialize: function frostWisp(scene, x, y) {
    Enemy.call(this, scene, x, y, frostWisp.sprite, frostWisp.stats)
  },
})
frostWisp.minFloor = 3
frostWisp.sprite = {
  texture: 'monsters',
  frame: 'wispIce',
  scale: 1.3,
  worldScale: 0.8,
}
frostWisp.stats = {
  name: 'Frost Wisp',
  hp: 30,
  damage: 4,
  magic: 10,
  magicDefense: 6,
  xp: 15,
  loot: [
    { item: 'Elixir', chance: 0.3 },
    { item: 'Mage Robe', chance: 0.05 },
  ],
  skills: [
    { name: 'Frost', power: 1.4, type: 'magic', element: 'ice' },
    {
      name: 'Hailstorm',
      power: 0.9,
      type: 'magic',
      element: 'ice',
      target: 'all',
    },
  ],
}
