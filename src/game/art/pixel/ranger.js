import { gridSprite } from './grid'

// The ranger, hand placed pixel by pixel: three quarters to the right (flipped in game), a green
// hood and cloak over the shoulders, a leather tunic and belt, dark breeches and boots, a quiver of
// red fletched arrows on the back and a longbow held in front. 32 x 44 pixels, lit from the upper
// left
const LEGEND = {
  O: '#141a14',
  // hood and cloak
  a: '#12301c',
  b: '#1e5030',
  c: '#2e7a44',
  d: '#52a860',
  // hair
  h: '#4a2a14',
  H: '#7a4a24',
  // skin
  e: '#b8684e',
  f: '#eaa680',
  g: '#fcd6b4',
  // eyes
  k: '#1a1630',
  w: '#f0f0f8',
  j: '#7a4a20',
  // tunic leather
  l: '#3a2214',
  L: '#6a4228',
  m: '#9a6a40',
  M: '#c8945a',
  Y: '#e8c050',
  // breeches and boots
  n: '#2a2418',
  N: '#4a4030',
  r: '#2a1a10',
  R: '#5a3a22',
  // bow, string, quiver and fletching
  v: '#5a3418',
  V: '#8a5a2a',
  U: '#c08850',
  s: '#e8e0d0',
  q: '#6a3a1a',
  Q: '#9a5a2a',
  x: '#d83838',
  X: '#f4f0ec',
}

const ROWS = [
  '................................',
  '................................',
  '................................',
  '................................',
  '...........OOOO.................',
  '.........OObcccOO...............',
  '........ObbccddccO..............',
  '.......ObbccddddccO.............',
  '......ObbbccddcccccO............',
  '.....ObabbccccccccdcO...........',
  '....ObabbbccbHHhHHHcO...........',
  '....ObabbbcbbHghhgghhO..........',
  '....ObabbbcbbffkkgfkfO..........',
  '....ObabbbcbbefwjgfjfO..........',
  '....ObabbbcbbeffffffeO..........',
  '....ObabbbcbbbefffefO...........',
  '....ObabbbcbbbbOeffO............',
  '....ObabbbccbbbbbbbbccO.........',
  '...ObabbbcccbbbbbbbbccO.........',
  '...ObabbcccdccbbbbbbcbbO........',
  '...ObbccddLLMMLLLLlcbbbO........',
  '...OabcdOMMMLLLLLLlcbaO.........',
  '....OacOMMLLLLLLLLllbaO.........',
  '....OaOMMLLLLLLLLLlllO..........',
  '.....OMMLLLLLLLLLLlllO..........',
  '.....OMLLLLLLLLLLLlllO..........',
  '.....OMLLLmLLLLLLLlllO..........',
  '.....OMLLLmLLLLLLLlllO..........',
  '.....OlllYYllllllllllO..........',
  '.....OMLLLLLLLLLLLlllO..........',
  '.....OMLLLLLLLLLLLlllO..........',
  '.....OMLLLmLLLmLLLlllO..........',
  '.....OOOOOOOOOOOOOOOOO..........',
  '.........ONNNnOONNnnO...........',
  '.........ONNNnOONNnnO...........',
  '.........ONNnnOONNnnO...........',
  '.........ONNnnOONnnnO...........',
  '.........ONNnnOONnnnO...........',
  '.........ORRRrOORRrrO...........',
  '.........ORRRrOORRrrO...........',
  '.........ORRRrOORRrrO...........',
  '.........ORRRrrOORRrrrO.........',
  '.........ORRRrrOORRrrrO.........',
  '.........OOOOOOOOOOOOOO.........',
]

const overlay = () => {
  const px = []
  // the quiver on the back, its arrows' red and white fletching over the shoulder
  for (let y = 13; y <= 22; y++)
    px.push([3, y, 'O'], [4, y, 'Q'], [5, y, 'q'], [6, y, 'O'])
  px.push([3, 23, 'O'], [4, 23, 'O'], [5, 23, 'O'], [6, 23, 'O'])
  px.push(
    [2, 10, 'O'],
    [3, 10, 'X'],
    [4, 10, 'O'],
    [5, 9, 'O'],
    [6, 9, 'x'],
    [7, 9, 'O'],
    [2, 11, 'O'],
    [3, 11, 'x'],
    [4, 11, 'X'],
    [5, 10, 'x'],
    [6, 10, 'X'],
    [7, 10, 'O'],
    [3, 12, 'O'],
    [4, 12, 'x'],
    [5, 11, 'x'],
    [6, 11, 'O'],
    [4, 13, 'v'],
    [5, 12, 'v']
  )
  // the longbow: a curved limb bowing out to the right, its string straight down the inside
  for (let y = 10; y <= 41; y++) {
    const t = (y - 10) / 31
    const x = 25 + Math.round(3 * Math.sin(Math.PI * t))
    px.push(
      [x - 1, y, 'O'],
      [x, y, y < 25 ? 'U' : 'V'],
      [x + 1, y, 'v'],
      [x + 2, y, 'O']
    )
    if (y > 10 && y < 41) px.push([24, y, 's'])
  }
  // the hand gripping the bow at its middle, the sleeve reaching out to it
  px.push(
    [21, 23, 'L'],
    [22, 23, 'L'],
    [23, 23, 'O'],
    [21, 24, 'l'],
    [22, 24, 'L'],
    [23, 24, 'L'],
    [24, 24, 'O'],
    [26, 23, 'O'],
    [27, 23, 'g'],
    [28, 23, 'f'],
    [29, 23, 'O'],
    [26, 24, 'f'],
    [27, 24, 'f'],
    [28, 24, 'e'],
    [29, 24, 'O'],
    [26, 25, 'O'],
    [27, 25, 'e'],
    [28, 25, 'O'],
    [25, 24, 'L']
  )
  return px
}

export const rangerSprite = () => gridSprite(ROWS, LEGEND, overlay())
