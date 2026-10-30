import { mirror, padRows, createSheet } from './pixelArt'

// Original 16x24 chibi heroes for the map in an anime JRPG style: a big head with 2x2 eyes on a small body.
// Each hero has an upper body for the front, back and side views (17-21 rows, the mage's robe the longest),
// combined with shared leg poses into walking frames: down0-2, up0-2 and side0-2 (side faces right).
// Shared letters: o outline, s skin, e/i eye (dark top, light bottom), m mouth, p legs, b boots

const HEIGHT = 24

// two thin legs side by side, columns 5-7 (left) and 8-10 (right); shorter bodies use more of them
const LEGS_FRONT = mirror([
  '.....opo',
  '.....opo',
  '.....opo',
  '.....opo',
  '.....opo',
  '.....obo',
  '.....obo',
  '.....ooo',
])
const LEGS_SIDE = {
  idle: [
    '......oppo',
    '......oppo',
    '......oppo',
    '......oppo',
    '......oppo',
    '......obbo',
    '......obbo',
    '......oooo',
  ],
  step: [
    '......oppo',
    '.....opoopo',
    '.....opo.opo',
    '....opo..opo',
    '....opo...opo',
    '...obo....obo',
    '...obbo...obbo',
    '...oooo...oooo',
  ],
  stride: [
    '......opo',
    '......opo',
    '......opo',
    '......opo',
    '......opo',
    '......obo',
    '......obbo',
    '......oooo',
  ],
}

// Front walking: one leg lifts by a pixel
const liftLeg = (legs, fromCol, toCol) =>
  legs.map((row, y) =>
    [...row]
      .map((char, x) => {
        if (x < fromCol || x > toCol) return char
        return y + 1 < legs.length ? legs[y + 1][x] : '.'
      })
      .join('')
  )
const LEFT_LEG = [5, 7]
const RIGHT_LEG = [8, 10]

const framesFor = (art) => {
  const front = mirror(art.front)
  const back = mirror(art.back)
  // the bottom part of each leg pose fills whatever the body leaves of the 24 rows
  const legs = (pose) => pose.slice(pose.length - (HEIGHT - art.front.length))
  const frontLegs = legs(LEGS_FRONT)
  const side = (pose) => padRows([...art.side, ...legs(pose)], 16)
  return {
    down0: [...front, ...frontLegs],
    down1: [...front, ...liftLeg(frontLegs, ...RIGHT_LEG)],
    down2: [...front, ...liftLeg(frontLegs, ...LEFT_LEG)],
    up0: [...back, ...frontLegs],
    up1: [...back, ...liftLeg(frontLegs, ...LEFT_LEG)],
    up2: [...back, ...liftLeg(frontLegs, ...RIGHT_LEG)],
    side0: side(LEGS_SIDE.idle),
    side1: side(LEGS_SIDE.step),
    side2: side(LEGS_SIDE.stride),
  }
}

const HEROES = {
  // Spiky auburn hair, steel and blue armor, a red cape (matches battler-warrior)
  warrior: {
    palette: {
      h: '#d47a3a',
      s: { color: '#ffe0c8', flat: true },
      e: { color: '#1a2a6a', flat: true },
      i: { color: '#4a8ae8', flat: true },
      m: { color: '#e0907c', flat: true },
      g: '#d8e0ec',
      a: '#3a62c8',
      y: '#f0c040',
      c: '#c8303e',
      p: '#3e3e5a',
      b: '#7a4a26',
    },
    front: [
      '....o.o.',
      '...ohoho',
      '..ohhhhh',
      '.ohhhhhh',
      'ohhhhhhh',
      '.ohhhhhh',
      '.ohshshs',
      '.ohseess',
      '.ohsiiss',
      '..ohssss',
      '...osssm',
      '....oooo',
      '..oggaaa',
      '..oggaay',
      '..osgaaa',
      '...oyyyy',
      '...oaaaa',
      '...oaaaa',
    ],
    back: [
      '....o.o.',
      '...ohoho',
      '..ohhhhh',
      '.ohhhhhh',
      'ohhhhhhh',
      '.ohhhhhh',
      '.ohhhhhh',
      '.ohhhhhh',
      '.ohhhhhh',
      '..ohhhhh',
      '...ohoho',
      '....oooo',
      '..oggccc',
      '..oggccc',
      '..osgccc',
      '...occcc',
      '...occcc',
      '...occcc',
    ],
    side: [
      '......o.o.o',
      '.....ohohoho',
      '...oohhhhhhhoo',
      '..ohhhhhhhhhhho',
      '.ohhhhhhhhhhhho',
      'ohhhhhhhhhshsho',
      '.ohhhhhhssssso',
      '.ohhhhhsssseso',
      '..ohhhhssssiso',
      '..ohhhsssssso',
      '...ohhssssmo',
      '....ooooooo',
      '...ocoggaaao',
      '...ocogsaaao',
      '...ocoyyyyyo',
      '...ocoaaaaao',
      '...ocoaaaaao',
      '....ooaaaaao',
    ],
  },

  // Wide witch hat, long golden hair, blue robes with a white hem (matches battler-mage)
  mage: {
    palette: {
      t: '#6a46c8',
      g: '#f0c040',
      y: '#ffd860',
      s: { color: '#ffe4d0', flat: true },
      e: { color: '#14503a', flat: true },
      i: { color: '#3ac08a', flat: true },
      k: { color: '#ff98a8', flat: true },
      m: { color: '#e88a8a', flat: true },
      r: '#4a5ae0',
      w: '#f4f6ff',
      p: '#4a5ae0',
      b: '#5a3a20',
    },
    front: [
      '.......o',
      '......ot',
      '.....ott',
      '....ottt',
      '...otggg',
      'ottttttt',
      '.ooooooo',
      '..oyyyyy',
      '.oyyysys',
      '.oyseess',
      '.oysiiss',
      '.oykssss',
      '.oyysssm',
      '.oyyoooo',
      '.oyorrrr',
      '.oyosrrr',
      '..oorggg',
      '...orrrr',
      '..orrrrr',
      '..owwwww',
    ],
    back: [
      '.......o',
      '......ot',
      '.....ott',
      '....ottt',
      '...otggg',
      'ottttttt',
      '.ooooooo',
      '..oyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '.oyyyyyy',
      '..oryyyy',
      '...orrrr',
      '...orrrr',
      '..orrrrr',
      '..owwwww',
    ],
    side: [
      '.oo',
      '.otoo',
      '..ottoo',
      '...otttto',
      '....ogggggo',
      'otttttttttttttto',
      '.oooooooooooooo',
      '...oyyyyyyyyo',
      '..oyyyyyysyso',
      '..oyyyysssseso',
      '..oyyyyssssiso',
      '..oyyyysssskso',
      '..oyyyyyssmo',
      '..oyyyyoooo',
      '..oyyyorrro',
      '..oyyyorsro',
      '....ooggggo',
      '.....orrrro',
      '....orrrrro',
      '....owwwwwo',
    ],
  },

  // Green hood, chestnut bangs, red scarf, leather tunic and a quiver (matches battler-ranger)
  ranger: {
    palette: {
      g: '#4aa840',
      n: '#a85a28',
      s: { color: '#ffe0c8', flat: true },
      e: { color: '#5a2e08', flat: true },
      i: { color: '#e0a030', flat: true },
      m: { color: '#e0907c', flat: true },
      q: '#e04a30',
      t: '#b07a44',
      y: '#f0c040',
      u: '#7a4a24',
      p: '#4a5a34',
      b: '#5a3a1e',
    },
    front: [
      '....oooo',
      '...ogggg',
      '..oggggg',
      '.ogggggg',
      '.oggnnnn',
      '.ognsnsn',
      '.ogseess',
      '.ogsiiss',
      '.ogsssss',
      '..ogsssm',
      '..oqqqqq',
      '.oggtttt',
      '.oggtttt',
      '.ogsyyyy',
      '..ogtttt',
      '..ogtttt',
      '...otttt',
    ],
    back: [
      '....oooo',
      '...ogggg',
      '..oggggg',
      '.ogggggg',
      '.ogggggg',
      '.ogggggg',
      '.ogggggg',
      '.ogggggg',
      '.ogggggg',
      '..oggggg',
      '..oqqqqq',
      '.ogggggg',
      '.ogggggg',
      '.ogggggg',
      '..oggggg',
      '..oggggg',
      '...ogggg',
    ],
    side: [
      '....ooooo',
      '...ogggggo',
      '..ogggggggo',
      '.ogggggggggggo',
      '.oggggggnnnnno',
      '.ogggggnnsnsno',
      '.ogggggsssseso',
      '.ogggggssssiso',
      '..ogggsssssso',
      '...oggssssmo',
      '..qqqqqqqqo',
      '.q.uogtttto',
      '...uogtttto',
      '...uogysyyo',
      '....ogtttto',
      '....ogtttto',
      '.....otttto',
    ],
  },
}

// Creates hero-warrior, hero-mage and hero-ranger textures with the walking frames
export const createHeroes = (scene) => {
  Object.entries(HEROES).forEach(([name, art]) =>
    createSheet(scene, `hero-${name}`, framesFor(art), art.palette)
  )
}
