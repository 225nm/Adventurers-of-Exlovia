import { mirror, padRows, createSheet } from './pixelArt'

// Original 16x24 heroes for the map, slim and about 3 heads tall like classic top-down JRPG characters.
// Each hero has an upper body for the front, back and side views (16 rows, the mage's robe 20),
// combined with shared leg poses into walking frames: down0-2, up0-2 and side0-2 (side faces right).
// Shared letters: o outline, s skin, e eye, p legs, b boots

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
  // Knight with a plumed steel helmet, blue armor and a red cape
  warrior: {
    palette: {
      h: '#8a96a8',
      r: '#d03a3a',
      s: '#f2c8a8',
      e: { color: '#2a3a6a', flat: true },
      a: '#3a5aa8',
      g: '#b8c2d0',
      c: '#8a2030',
      y: '#e8b84a',
      p: '#4a3a5a',
      b: '#6a4428',
    },
    front: [
      '......or',
      '.....orr',
      '....ohhh',
      '....ohhh',
      '....ohss',
      '....ohes',
      '....ohss',
      '.....oss',
      '......os',
      '....oaaa',
      '....ogaa',
      '....ogaa',
      '....ogaa',
      '....ogyy',
      '....osaa',
      '.....oaa',
    ],
    back: [
      '......or',
      '.....orr',
      '....ohhh',
      '....ohhh',
      '....ohhh',
      '....ohhh',
      '....ohhh',
      '.....ohh',
      '......oa',
      '....oacc',
      '....ogcc',
      '....ogcc',
      '....ogcc',
      '....ogcc',
      '....oscc',
      '.....occ',
    ],
    side: [
      '.......oo',
      '......orro',
      '.....ohhhho',
      '.....ohhhhho',
      '.....ohhhsso',
      '.....ohhhseo',
      '.....ohhhsso',
      '......ohsso',
      '.......oso',
      '......oaaao',
      '......oagao',
      '......oagao',
      '......oagao',
      '......oyyyo',
      '......oasao',
      '......oaaao',
    ],
  },

  // Golden-haired mage with a starred pointed hat and long blue robes
  mage: {
    palette: {
      t: '#4a3a9a',
      y: '#f0cc60',
      s: '#f4d2b8',
      e: { color: '#3a6a40', flat: true },
      r: '#2a3a8a',
      g: '#e8c050',
      p: '#2a3a8a',
      b: '#3a2a4a',
    },
    front: [
      '.......o',
      '......ot',
      '.....ott',
      '..oooooo',
      '....oyss',
      '....oyes',
      '....oyss',
      '....oyys',
      '....oyos',
      '....oyrr',
      '....oyrr',
      '....orrr',
      '....orgg',
      '....osrr',
      '...orrrr',
      '...orrrr',
      '...orrrr',
      '...orrrr',
      '...ogggg',
      '...ooooo',
    ],
    back: [
      '.......o',
      '......ot',
      '.....ott',
      '..oooooo',
      '....oyyy',
      '....oyyy',
      '....oyyy',
      '....oyyy',
      '....oyyy',
      '....oyyy',
      '....oyyy',
      '....oryy',
      '....orgg',
      '....osrr',
      '...orrrr',
      '...orrrr',
      '...orrrr',
      '...orrrr',
      '...ogggg',
      '...ooooo',
    ],
    side: [
      '.....oo',
      '.....otoo',
      '......ottto',
      '....ooooooooo',
      '......oyysso',
      '......oyyseo',
      '......oyysso',
      '......oyyyso',
      '......oyyoo',
      '......oyrrro',
      '......oyrrro',
      '......orrsro',
      '......oggggo',
      '......orrrro',
      '.....orrrrro',
      '.....orrrrro',
      '.....orrrrro',
      '.....orrrrro',
      '.....oggggggo',
      '.....oooooooo',
    ],
  },

  // Hooded archer in green with a leather tunic and a quiver on the back
  ranger: {
    palette: {
      g: '#3a7a3a',
      n: '#7a4a2a',
      s: '#f2c8a8',
      e: { color: '#2a3a20', flat: true },
      t: '#8a5a2a',
      y: '#e8b84a',
      q: '#8a2a2a',
      p: '#4a4030',
      b: '#3a2a20',
    },
    front: [
      '......oo',
      '.....ogg',
      '....oggg',
      '....oggn',
      '....ogns',
      '....oges',
      '....ogss',
      '.....oss',
      '......os',
      '....oggt',
      '....ogtt',
      '....ogtt',
      '....ogtt',
      '....ogyy',
      '....ostt',
      '.....ott',
    ],
    back: [
      '......oo',
      '.....ogg',
      '....oggg',
      '....oggg',
      '....oggg',
      '....oggg',
      '....oggg',
      '.....ogg',
      '......og',
      '....oggq',
      '....oggq',
      '....oggq',
      '....oggg',
      '....oggg',
      '....osgg',
      '.....ogg',
    ],
    side: [
      '',
      '......oooo',
      '.....oggggo',
      '.....ogggggo',
      '.....oggnsso',
      '.....oggnseo',
      '.....ogggsso',
      '......oggso',
      '.......ooo',
      '.....qottto',
      '.....qotgto',
      '.....qotgto',
      '.....qotgto',
      '.....qoyyyo',
      '......otsto',
      '......ottto',
    ],
  },
}

// Creates hero-warrior, hero-mage and hero-ranger textures with the walking frames
export const createHeroes = (scene) => {
  Object.entries(HEROES).forEach(([name, art]) =>
    createSheet(scene, `hero-${name}`, framesFor(art), art.palette)
  )
}
