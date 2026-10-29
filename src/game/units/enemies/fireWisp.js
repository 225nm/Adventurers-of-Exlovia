import Phaser from 'phaser'
import { Enemy } from '../../units'
// Fire Wisp: a living flame, resists magic but weapons pass right through it
export let fireWisp = new Phaser.Class({
  Extends: Enemy,
  initialize: function fireWisp(scene, x, y) {
    Enemy.call(this, scene, x, y, fireWisp.sprite, fireWisp.stats)
  },
})
fireWisp.minFloor = 2
fireWisp.sprite = {
  texture: 'monsters',
  frame: 'wispFire',
  scale: 1.3,
  worldScale: 0.8,
}
fireWisp.stats = {
  name: 'Fire Wisp',
  hp: 24,
  damage: 4,
  magic: 9,
  magicDefense: 6,
  xp: 12,
  loot: [{ item: 'Elixir', chance: 0.25 }],
  skills: [{ name: 'Ember', power: 1.4, type: 'magic', element: 'fire' }],
}
