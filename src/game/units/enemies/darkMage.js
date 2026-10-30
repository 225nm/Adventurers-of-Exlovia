import Phaser from 'phaser'
import { Enemy } from '../../units'
// Dark Mage: fragile spellcaster that hits the whole party with dark magic
export let darkMage = new Phaser.Class({
  Extends: Enemy,
  initialize: function darkMage(scene, x, y) {
    Enemy.call(this, scene, x, y, darkMage.sprite, darkMage.stats)
  },
})
darkMage.minFloor = 4
darkMage.sprite = {
  texture: 'dark-mage',
  world: 'dark-mage-mini',
  scale: 1,
  worldScale: 1,
  hover: true,
}
darkMage.stats = {
  name: 'Dark Mage',
  hp: 50,
  damage: 5,
  speed: 9,
  magic: 13,
  defense: 1,
  magicDefense: 5,
  xp: 30,
  loot: [
    { item: 'Elixir', chance: 0.4 },
    { item: 'Crystal Staff', chance: 0.08 },
    { item: 'Silk Robe', chance: 0.06 },
  ],
  skills: [
    { name: 'Shadow Bolt', power: 1.6, type: 'magic', element: 'dark' },
    {
      name: 'Hex Storm',
      power: 1.0,
      type: 'magic',
      element: 'dark',
      target: 'all',
    },
  ],
}
