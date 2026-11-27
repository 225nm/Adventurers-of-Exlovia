import { gridSprite } from './grid'

// The mage, hand placed pixel by pixel: three quarters to the right (flipped in game), a wide
// brimmed pointed hat with a gold band, long blonde hair, a blue robe with a gold hem and a purple
// sash, and a staff topped with a blue crystal. 32 x 44 pixels, lit from the upper left
const LEGEND = {
  O: '#1c1424',
  // hat
  a: '#2c1640',
  b: '#4e2a78',
  c: '#7448b0',
  d: '#a07ce0',
  y: '#9a6a18',
  Y: '#e8c050',
  // hair
  h: '#8a6420',
  H: '#c89a3a',
  J: '#f0cc68',
  // skin
  e: '#b8684e',
  f: '#eaa680',
  g: '#fcd6b4',
  // eyes
  k: '#1a1630',
  w: '#f0f0f8',
  j: '#2e9a68',
  // robe
  n: '#141c48',
  N: '#263a8a',
  M: '#4064c8',
  X: '#7096f0',
  // sash
  p: '#5a2a7a',
  q: '#8a4ab0',
  // staff and shoes
  l: '#3a2214',
  L: '#6a4228',
  m: '#9a6a40',
  // crystal
  z: '#2a6ad0',
  u: '#8ad0ff',
  v: '#effbff',
}

const ROWS = [
  '.........OO.....................',
  '........ObcO....................',
  '........ObccO...................',
  '.........OccdO..................',
  '.........ObccdO.................',
  '........ObbccddO................',
  '.......OabbccddcO...............',
  '.......OyYYYYYYyyO..............',
  '...OOOabbbccccddccbbOOO.........',
  '..OaabbbbbbbbbbbbbbbbaaO........',
  '......OHJJHhHJJJHJJHO...........',
  '.....OHJJHhJHJgHgggHO...........',
  '.....OHJHhhJHHfkkgfkO...........',
  '.....OHJHhJHhHfwjgfjO...........',
  '....OHJJHhJHhHefffffO...........',
  '....OHJHhhJHhHeffefO............',
  '....OHJHhJHHhhOeffO.............',
  '....OHJHhJHONMMMMNNNNO..........',
  '...OHJHhJHOMXXMMNNNNNO..........',
  '...OHJHhHOMXMMMNNNNNnO..........',
  '...OHJhhHOMXMMNNNNNnnO..........',
  '...OHJhHOMXMMNpqqqqpnO..........',
  '...OHhHOMXMMNNpppppnnOO.........',
  '....OhHOMXMMNNNNNNnnO...........',
  '.....OOMXMMNNNNNNNnnO...........',
  '......OMXMMNNNNNNNNnnO..........',
  '......OMXMNNNNNNNNNnnO..........',
  '.....OMXMMNNNNNNNNNnnnO.........',
  '.....OMXMNNNNNNNNNNnnnO.........',
  '.....OMXMNNNNNNNNNNnnnO.........',
  '....OMXMMNNNNNNNNNNNnnnO........',
  '....OMXMNNNNNNNNNNNNnnnO........',
  '....OMXMNNNNNNNNNNNNnnnO........',
  '...OMXMMNNNNNNNNNNNNNnnnO.......',
  '...OMXMNNNNNNNNNNNNNNnnnO.......',
  '...OMXMNNNNNNNNNNNNNNnnnO.......',
  '..OMXMMNNNNNNNNNNNNNNNnnnO......',
  '..OMXMNNNNNNNNNNNNNNNNnnnO......',
  '..OMXMNNNNNNNNNNNNNNNNnnnO......',
  '..OYYYYYYYYYYYYYYYYYYYYyyO......',
  '..OyyyyyyyyyyyyyyyyyyyyyyO......',
  '...OOOOOOOOOOOOOOOOOOOOOO.......',
  '........OlLO..OlLO..............',
  '........OOOO..OOOO..............',
]

const overlay = () => {
  const px = []
  // folds down the robe: a lit crease and a shaded one
  for (let y = 26; y <= 38; y++) {
    px.push([11, y, 'M'], [16, y, 'n'])
  }
  // the crystal, a cut gem catching the light on its upper left
  const gem = [
    [24, 0, 'O'],
    [23, 1, 'O'],
    [24, 1, 'v'],
    [25, 1, 'O'],
    [22, 2, 'O'],
    [23, 2, 'v'],
    [24, 2, 'u'],
    [25, 2, 'z'],
    [26, 2, 'O'],
    [22, 3, 'O'],
    [23, 3, 'u'],
    [24, 3, 'u'],
    [25, 3, 'z'],
    [26, 3, 'O'],
    [22, 4, 'O'],
    [23, 4, 'u'],
    [24, 4, 'z'],
    [25, 4, 'z'],
    [26, 4, 'O'],
    [23, 5, 'O'],
    [24, 5, 'z'],
    [25, 5, 'O'],
    // gold claws holding it
    [22, 5, 'Y'],
    [26, 5, 'y'],
    [23, 6, 'O'],
    [24, 6, 'Y'],
    [25, 6, 'y'],
    [26, 6, 'O'],
  ]
  px.push(...gem)
  // the staff down to the ground
  for (let y = 7; y <= 42; y++) {
    px.push([23, y, 'O'], [24, y, 'm'], [25, y, 'L'], [26, y, 'O'])
  }
  px.push([23, 43, 'O'], [24, 43, 'O'], [25, 43, 'O'], [26, 43, 'O'])
  // the hand around it, and the sleeve reaching to it
  px.push(
    [21, 19, 'N'],
    [22, 19, 'O'],
    [21, 20, 'N'],
    [22, 20, 'N'],
    [22, 21, 'O'],
    [23, 20, 'O'],
    [24, 20, 'O'],
    [25, 20, 'O'],
    [26, 20, 'O'],
    [23, 21, 'g'],
    [24, 21, 'f'],
    [25, 21, 'f'],
    [26, 21, 'O'],
    [23, 22, 'f'],
    [24, 22, 'e'],
    [25, 22, 'e'],
    [26, 22, 'O']
  )
  return px
}

export const mageSprite = () => gridSprite(ROWS, LEGEND, overlay())
