import { BattleScene } from '../game/scenes/battle'
import Phaser from 'phaser'

jest.mock('../game/units/enemies/enemiesIndex.js', () => ({ enemiesIndex: {} }))
jest.mock('../game/units/heroes/heroesIndex.js', () => ({ heroesIndex: {} }))
jest.mock('../game/skills/skillsIndex.js', () => ({ skillsIndex: {} }))
jest.mock('../game/save.js', () => ({ saveSystem: { saveGame: jest.fn() } }))

// Integration test between Inventory and Battle
// REQ-8 FR-6 Game should feature rewards for defeating enemies
test('Loot and experience are properly distributed after a battle victory', () => {
  const testScene = {
    enemies: [{ xpDrop: 60, lootTable: ['Potion'] }],
    heroes: [{ xp: 0 }],
    game: {
      inventory: {
        addItem: jest.fn(),
      },
    },
    saveHeroData: jest.fn(),
    scene: {
      sleep: jest.fn(),
      pause: jest.fn(),
      launch: jest.fn(),
    },
  }

  BattleScene.prototype.endBattleVictory.call(testScene)

  expect(testScene.heroes[0].xp).toBe(60)

  expect(testScene.game.inventory.addItem).toHaveBeenCalledWith('Potion', 1)

  expect(testScene.scene.launch).toHaveBeenCalledWith('VictoryScene', {
    xp: 60,
    loot: ['Potion'],
  })
})
