import { Enemy } from '../../units'
// Blue Dragon enemy class with specific stats and skills
export let blueDragon = new Phaser.Class({
  Extends: Enemy,
  initialize: function blueDragon(scene, x, y) {
    // Parameters: scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable
    Enemy.call(this, scene, x, y, 'dragonblue', null, 'B. Dragon', 80, 8, 30, [
      'Potion',
      'Elixir',
    ])
    this.skills = [
      { name: 'Scorch', damage: 12, mpCost: 0, levelReq: 1, target: 'all' },
      {
        name: 'Flame Breath',
        damage: 16,
        mpCost: 0,
        levelReq: 1,
        target: 'all',
      },
    ]
  },
})
