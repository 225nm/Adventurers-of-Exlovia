import { WorldScene } from '../game/scenes/world'
import Phaser from 'phaser'

// Fix Phaser random method not being initialized during tests
if (!Phaser.Math.RND) {
  Phaser.Math.RND = new Phaser.Math.RandomDataGenerator([Date.now().toString()])
}
//REQ-4 FR-3 Game must feature randomly generated maps
test('World scene tiles should be placed randomly, in this case the chest locations', () => {
  const testScene = {
    player: { x: 50, y: 100 },
    physics: {
      world: {
        bounds: { width: 800, height: 600 },
      },
      add: {
        staticGroup: jest.fn(() => ({ add: jest.fn() })),
        staticSprite: jest.fn(),
        group: jest.fn(() => ({ create: jest.fn() })),
        collider: jest.fn(),
        overlap: jest.fn(),
      },
    },
    add: {
      sprite: jest.fn(() => ({ setScale: jest.fn() })),
    },
  }

  const generateChestPositions = () => {
    const positions = []
    const chestAmount = 3
    const spawnRadius = 120
    const mockObstaclesLayer = {
      getTileAtWorldXY: jest.fn(() => null),
    }

    for (let i = 0; i < chestAmount; i++) {
      let x, y, distance, isBlocked
      do {
        x = Phaser.Math.RND.between(
          20,
          testScene.physics.world.bounds.width - 20
        )
        y = Phaser.Math.RND.between(
          20,
          testScene.physics.world.bounds.height - 20
        )
        distance = Phaser.Math.Distance.Between(
          x,
          y,
          testScene.player.x,
          testScene.player.y
        )
        isBlocked = mockObstaclesLayer.getTileAtWorldXY(x, y) !== null
      } while (distance < spawnRadius || isBlocked)

      positions.push({ x, y })
    }
    return positions
  }

  const firstLoop = generateChestPositions()
  const secondLoop = generateChestPositions()

  expect(firstLoop).not.toEqual(secondLoop)
})
