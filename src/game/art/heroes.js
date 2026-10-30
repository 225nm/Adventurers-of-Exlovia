import { mirror, padRows, createSheet } from './pixelArt'

// Original 16x16 chibi heroes for the map: a big head over a slim body with thin legs.
// Each hero has an upper body (13 rows) for the front, back and side views,
// combined with shared leg poses (3 rows) into walking frames: down0-2, up0-2 and side0-2 (side faces right).
// Shared letters: o outline, s skin, e eye, p legs, b boots

// two thin legs side by side, columns 5-7 (left) and 8-10 (right)
const LEGS_FRONT = mirror(['.....opo', '.....obo', '.....ooo'])
const LEGS_SIDE = {
  idle: ['......oppo', '......obbo', '......oooo'],
  step: ['.....opoopo', '....obo..obo', '....ooo..ooo'],
  stride: ['......opo', '......obo', '......ooo'],
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
  const side = (legs) => padRows([...art.side, ...legs], 16)
  return {
    down0: [...front, ...LEGS_FRONT],
    down1: [...front, ...liftLeg(LEGS_FRONT, ...RIGHT_LEG)],
    down2: [...front, ...liftLeg(LEGS_FRONT, ...LEFT_LEG)],
    up0: [...back, ...LEGS_FRONT],
    up1: [...back, ...liftLeg(LEGS_FRONT, ...LEFT_LEG)],
    up2: [...back, ...liftLeg(LEGS_FRONT, ...RIGHT_LEG)],
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
      s: '#f2c29b',
      e: { color: '#2a1a40', flat: true },
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
      '...ohhhh',
      '...ohhhh',
      '...ohsss',
      '...ohses',
      '....ohss',
      '.....ooo',
      '....ogaa',
      '....ogaa',
      '....ogyy',
      '....osaa',
    ],
    back: [
      '......or',
      '.....orr',
      '....ohhh',
      '...ohhhh',
      '...ohhhh',
      '...ohhhh',
      '...ohhhh',
      '....ohhh',
      '.....ooo',
      '....ogcc',
      '....ogcc',
      '....ogcc',
      '....oscc',
    ],
    side: [
      '.......oo',
      '......orro',
      '.....ohhhho',
      '....ohhhhhho',
      '....ohhhhhho',
      '....ohhhssso',
      '....ohhhsseo',
      '.....ohhsso',
      '......oooo',
      '.....oaaao',
      '.....oagao',
      '.....oyyyo',
      '.....oasao',
    ],
  },

  // Scholar mage with a starred pointed hat, silver hair and teal robes
  mage: {
    palette: {
      t: '#4a3a9a',
      y: '#f0d050',
      w: '#e0e0f0',
      s: '#f2c29b',
      e: { color: '#2a1a40', flat: true },
      r: '#2a8a8a',
      p: '#2a8a8a',
      b: '#3a2a4a',
    },
    front: [
      '.......o',
      '......ot',
      '.....ott',
      '....otty',
      '..oooooo',
      '...owsss',
      '...owses',
      '....owss',
      '.....ooo',
      '....orrr',
      '....orrr',
      '....oryy',
      '....osrr',
    ],
    back: [
      '.......o',
      '......ot',
      '.....ott',
      '....ottt',
      '..oooooo',
      '...owwww',
      '...owwww',
      '....owww',
      '.....oww',
      '....orrw',
      '....orrr',
      '....oryy',
      '....osrr',
    ],
    side: [
      '....oo',
      '....otoo',
      '.....ottto',
      '.....ottyo',
      '...oooooooooo',
      '.....owwsso',
      '.....owwseo',
      '.....owwsso',
      '......oooo',
      '.....orrro',
      '.....orrso',
      '.....oyyyo',
      '....orrrro',
    ],
  },

  // Hooded archer in green with a leather tunic and a quiver on the back
  ranger: {
    palette: {
      g: '#3a7a3a',
      n: '#7a4a2a',
      s: '#f2c29b',
      e: { color: '#2a1a40', flat: true },
      t: '#8a5a2a',
      y: '#e8b84a',
      q: '#8a2a2a',
      p: '#4a4030',
      b: '#3a2a20',
    },
    front: [
      '........',
      '......oo',
      '.....ogg',
      '....oggg',
      '...oggnn',
      '...ognss',
      '...ogses',
      '....ogss',
      '.....ooo',
      '....ogtt',
      '....ogtt',
      '....ogyy',
      '....ostt',
    ],
    back: [
      '........',
      '......oo',
      '.....ogg',
      '....oggg',
      '...ogggg',
      '...ogggg',
      '...ogggg',
      '....oggg',
      '.....ooo',
      '....oggq',
      '....oggq',
      '....oggg',
      '....osgg',
    ],
    side: [
      '',
      '......oooo',
      '.....oggggo',
      '....ogggggo',
      '....ogggnnno',
      '....oggnssso',
      '....ogggsseo',
      '.....oggsso',
      '......oooo',
      '....qottto',
      '....qotgto',
      '....qoyyyo',
      '.....otsto',
    ],
  },
}

// Creates hero-warrior, hero-mage and hero-ranger textures with the walking frames
export const createHeroes = (scene) => {
  Object.entries(HEROES).forEach(([name, art]) =>
    createSheet(scene, `hero-${name}`, framesFor(art), art.palette)
  )
}
