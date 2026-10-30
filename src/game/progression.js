import { enemiesIndex } from './units/enemies/enemiesIndex'

// Dungeon progression: how enemies scale with the floor, which enemies appear and how much XP levels need

// Enemies whose first floor is more than this many floors ago stop appearing
const RETIRE_AFTER = 3

export const Progression = {
  // Multipliers for an enemy's floor 1 stats, every floor makes enemies tougher
  enemyScaling: function (floor) {
    const depth = floor - 1
    return {
      hp: 1 + 0.2 * depth,
      damage: 1 + 0.12 * depth,
      speed: 1 + 0.05 * depth,
      xp: 1 + 0.25 * depth,
      defense: Math.floor(depth / 2),
    }
  },

  // Applies the floor's scaling to a freshly created enemy
  scaleEnemy: function (enemy, floor) {
    const scale = this.enemyScaling(floor)
    enemy.maxHp = Math.round(enemy.maxHp * scale.hp)
    enemy.hp = enemy.maxHp
    enemy.damage = Math.round(enemy.damage * scale.damage)
    enemy.magic = Math.round(enemy.magic * scale.damage)
    enemy.speed = Math.round(enemy.speed * scale.speed)
    enemy.defense += scale.defense
    enemy.magicDefense += scale.defense
    enemy.xpDrop = Math.round(enemy.xpDrop * scale.xp)
    enemy.updateStatusBar()
  },

  // Enemy types that can appear on a floor. Weak early enemies retire as new ones arrive,
  // but there are always at least 3 types to pick from
  enemyPool: function (floor) {
    const unlocked = Object.keys(enemiesIndex)
      .filter((key) => enemiesIndex[key].minFloor <= floor)
      .sort((a, b) => enemiesIndex[b].minFloor - enemiesIndex[a].minFloor)
    const current = unlocked.filter(
      (key) => enemiesIndex[key].minFloor >= floor - RETIRE_AFTER
    )
    return current.length >= 3 ? current : unlocked.slice(0, 3)
  },

  // Random enemy type for a floor, newer (stronger) types are more likely
  pickEnemy: function (floor) {
    const pool = this.enemyPool(floor)
    const total = pool.reduce((sum, key) => sum + enemiesIndex[key].minFloor, 0)
    let roll = Math.random() * total
    for (const key of pool) {
      roll -= enemiesIndex[key].minFloor
      if (roll < 0) return key
    }
    return pool[pool.length - 1]
  },

  // How many enemies a battle has: 1-2 on the first floor, up to 3 deeper down
  enemyCount: function (floor) {
    if (floor === 1) return 1 + Math.floor(Math.random() * 2)
    if (floor < 4) return 2
    return 2 + Math.floor(Math.random() * 2)
  },

  // XP needed to go from this level to the next, grows a little faster than linear
  xpToNext: function (level) {
    return Math.round(20 * Math.pow(level, 1.4))
  },

  // Floor where the hero class not picked at the start joins the party
  recruitFloor: 3,
}
