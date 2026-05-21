import { heroesIndex } from '../game/units/heroes/heroesIndex'
import Phaser from 'phaser'

// FR-1 Game must feature multiple classes

// Game must feature at least 3 playable different classes
test('Game must feature multiple classes', () => {
  const classes = Object.keys(heroesIndex)

  expect(classes.length).toBeGreaterThanOrEqual(3)
})

// Classes must have distinct individual features. In this case base stats
test('Classes have different statistics', () => {
  const rangerStats = heroesIndex.Ranger.baseStats
  const warriorStats = heroesIndex.Warrior.baseStats
  const mageStats = heroesIndex.Mage.baseStats

  expect(rangerStats).not.toEqual(warriorStats)
  expect(mageStats).not.toEqual(warriorStats)
  expect(rangerStats).not.toEqual(mageStats)
})
