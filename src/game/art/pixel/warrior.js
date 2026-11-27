import { gridSprite } from './grid'

// The warrior, hand placed pixel by pixel in the style of 16-bit JRPG battle sprites: three quarters
// to the right (flipped in game to face the enemies), short spiky auburn hair, steel plate
// with pauldrons over a navy tabard, a crimson cape, a kite shield with a red cross and a longsword
// raised in guard. 32 x 44 pixels, lit from the upper left
const LEGEND = {
  O: '#1c1424', // outline
  // hair, darkest to highlight
  A: '#4a1410',
  B: '#8a2c1c',
  C: '#b8462a',
  D: '#e27848',
  E: '#ffb07a',
  // skin
  e: '#b8684e',
  f: '#eaa680',
  g: '#fcd6b4',
  // eyes
  k: '#1a1630',
  w: '#f0f0f8',
  i: '#3a6cc0',
  // steel, darkest to highlight
  1: '#262c48',
  2: '#4c567c',
  3: '#8490b4',
  4: '#c0cae2',
  5: '#f6f9ff',
  // navy cloth
  n: '#161c44',
  N: '#2a3a7a',
  M: '#4a62b0',
  // crimson
  r: '#3a0816',
  R: '#741626',
  S: '#ac2a38',
  T: '#da545e',
  // gold
  y: '#8a5a16',
  Y: '#deae46',
  Z: '#fff2ac',
  // leather
  l: '#34200f',
  L: '#66402a',
  m: '#8a5c3a',
}

const ROWS = [
  '................................',
  '................................',
  '............O..O..O.............',
  '...........OEOOEOODOO...........',
  '..........OEDCBDDCBCCBO.........',
  '.........OEDCCBBCCCBBBBO........',
  '.........ODCCBBCCBBBCCBBO.......',
  '.........OCBBBBBAgBggBO.........',
  '.........OCBBBAAfAAgAAfO........',
  '.........OCBBAfffkkgfkfO........',
  '.........OBBBAeefwigfifO........',
  '..........OBBAAefffffefO........',
  '..........OOAAAOefffefO.........',
  '...........OOO..OefffO..........',
  '........O45443O3443OO33O........',
  '.......O4554432444332O4332O.....',
  '......O455443324333223332O......',
  '..OOOOOOOOO2443433222O3221O.....',
  '..O4444443O3443432221O3221O.....',
  '..O4MMSMM3O3443432221O3221O.....',
  '..O4MNSNN3O3443332211O221O......',
  '..O4SSSSS3O3432332211O21O.......',
  '..O4MNSNN3O3332322211O1O........',
  '..O4NNSNN2O2222222111O..........',
  '...O4NSNn2OlLLLLYYLLlO..........',
  '...O4NSn2ORNMMNNNNNNnO..........',
  '....O4Sn2OSNMNNNNNNnnO..........',
  '....O3S2OTRNMNNnNNNnnO..........',
  '.....O32OSRNNNnOnNNnnO..........',
  '.....O2OTSROYYYYOYYYyO..........',
  '......OTSRRONNnOrONNnO..........',
  '......OTSRRONNnOrONnnO..........',
  '......OTSRRONnnOrONnnO..........',
  '......OSRRrO453OrO342O..........',
  '......OSRRrO343OrO332O..........',
  '.......ORRrO432OrO321O..........',
  '.......ORrrO432OrO321O..........',
  '........OrrO432OOO321O..........',
  '.........OOO432O.O321O..........',
  '...........O431O.O321O..........',
  '...........OmLlO.OmLlO..........',
  '...........OmLLlOOmLLlO.........',
  '...........OmLLLlOmLLLlO........',
  '...........OOOOOOOOOOOOO........',
]

// the longsword: a blade on a slant up to the top right corner, a gold crossguard, the gauntlet on
// the grip and a gold pommel
const sword = () => {
  const px = []
  for (let r = 1; r <= 18; r++) {
    const x = Math.floor(26 + (18 - r) * 0.28)
    px.push([x - 1, r, 'O'], [x, r, '5'], [x + 1, r, '3'], [x + 2, r, 'O'])
  }
  px.push([30, 0, 'O'])
  // crossguard
  px.push(
    [23, 19, 'O'],
    [24, 19, 'Y'],
    [25, 19, 'Z'],
    [26, 19, 'Y'],
    [27, 19, 'Y'],
    [28, 19, 'O']
  )
  // gauntlet on the grip
  px.push(
    [23, 20, 'O'],
    [24, 20, '4'],
    [25, 20, '3'],
    [26, 20, '2'],
    [27, 20, 'O'],
    [23, 21, 'O'],
    [24, 21, '3'],
    [25, 21, '2'],
    [26, 21, '1'],
    [27, 21, 'O'],
    [24, 22, 'O'],
    [25, 22, 'L'],
    [26, 22, 'O'],
    [24, 23, 'O'],
    [25, 23, 'L'],
    [26, 23, 'O'],
    [24, 24, 'O'],
    [25, 24, 'Y'],
    [26, 24, 'O'],
    [25, 25, 'O']
  )
  return px
}

export const warriorSprite = () => gridSprite(ROWS, LEGEND, sword())
