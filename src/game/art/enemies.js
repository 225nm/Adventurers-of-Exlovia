import { mirror, createTexture } from './pixelArt'

// Original front-facing enemy art, written as left halves and mirrored.
// Shapes shared by several enemies (wisps, dragons) are recolored with different palettes

const SLIME = [
  '........',
  '........',
  '........',
  '........',
  '.....ooo',
  '...ooggg',
  '..oglggg',
  '.oglgggg',
  '.oggwkgg',
  'ogggwkgg',
  'oggggggg',
  'oggggggk',
  'oggggggg',
  '.ogggggg',
  '..oooooo',
  '........',
]

const BAT = [
  '........',
  '........',
  '........',
  'o.......',
  'oo......',
  'o....oo.',
  'oo..oppp',
  'opo.oppp',
  'oppooprp',
  'opppoppp',
  'oppppppp',
  'o.opppfp',
  '....oppp',
  '.....ooo',
  '........',
  '........',
]

const GOBLIN = [
  '........',
  '........',
  'o.....oo',
  'oo...ogg',
  '.ogooggg',
  '..oggGgg',
  '...ogegg',
  '...ogggg',
  '...ogktk',
  '....oggg',
  '..ogcccc',
  '..ogcccc',
  '...occcc',
  '....ogg.',
  '....ogg.',
  '....ooo.',
]

const WISP = [
  '........',
  '.......o',
  '......of',
  '......of',
  '.....ofF',
  '....offF',
  '...offFF',
  '...ofFFc',
  '..offFcc',
  '..ofFccc',
  '..ofFcec',
  '..ofFccc',
  '...offcc',
  '....offf',
  '.....ooo',
  '........',
]

const DARK_MAGE = [
  '.......o',
  '......oh',
  '.....ohH',
  '....ohhH',
  '...ohhkk',
  '...ohkkk',
  '...ohkek',
  '...ohkkk',
  '..ohhhkk',
  '..ohrrrr',
  '.ohrryrr',
  '.ohrrrry',
  '.orrrrrr',
  '.orrrrrr',
  'orrrrrrr',
  'oooooooo',
]

const OGRE = [
  '............',
  '..o.........',
  '..oho.......',
  '...oho.ooooo',
  '....ooogGggg',
  '.......oGggg',
  '......oggggg',
  '......oggeeg',
  '......oggggg',
  '......ogktkk',
  '.......ogggg',
  '....oooooggg',
  '...oGgggoggg',
  '..oGggggoggg',
  '..oggggogggg',
  '..ogggoobbbb',
  '..oggo.occcc',
  '.oGggo.occcc',
  '.ogggo.occcc',
  '..ooo..occco',
  '......oggo..',
  '......oggo..',
  '.....ogggo..',
  '.....ooooo..',
]

const DRAGON = [
  '............',
  '.........o..',
  'o........oho',
  'oo......oddd',
  'owo....oDddd',
  'owwo...odedd',
  'owWwo..odddd',
  'owWWwo.ooddk',
  'owWWWwoodddd',
  'owWwWWwoddbb',
  'owwWwWwodbbb',
  'oo.owwwodbbb',
  'o...owwodbbb',
  '.....ooodbbb',
  '......oddbbb',
  '.....oDddbbb',
  '....oDdddbbb',
  '....oddodbbb',
  '...oddo.odbb',
  '...oddo.oddd',
  '..oddo..oddd',
  '..ohho...odd',
  '...oo.....oo',
  '............',
]

const ENEMIES = {
  slime: {
    art: SLIME,
    palette: {
      o: '#0e3a3a',
      g: '#34b890',
      l: '#a8f4dc',
      w: '#ffffff',
      k: '#111111',
    },
  },
  bat: {
    art: BAT,
    palette: { o: '#2b1640', p: '#7a4fc0', r: '#ff4040', f: '#ffffff' },
  },
  goblin: {
    art: GOBLIN,
    palette: {
      o: '#1a2010',
      g: '#6aa040',
      G: '#9ad060',
      e: '#ffe040',
      k: '#2a1a10',
      t: '#ffffff',
      c: '#7a4a2a',
    },
  },
  'wisp-fire': {
    art: WISP,
    palette: {
      o: '#5a1a08',
      f: '#e8601a',
      F: '#ffa030',
      c: '#fff0a0',
      e: '#5a1a08',
    },
  },
  'wisp-ice': {
    art: WISP,
    palette: {
      o: '#0a2a5a',
      f: '#2a8ad0',
      F: '#6ad0ff',
      c: '#e8ffff',
      e: '#0a2a5a',
    },
  },
  'dark-mage': {
    art: DARK_MAGE,
    palette: {
      o: '#120a1a',
      h: '#3a1a5a',
      H: '#6a3a9a',
      k: '#0a0610',
      e: '#ff4060',
      r: '#2a1440',
      y: '#c0a040',
    },
  },
  ogre: {
    art: OGRE,
    palette: {
      o: '#2a140a',
      g: '#b0784a',
      G: '#d8a070',
      h: '#efe6cf',
      e: '#ff3030',
      k: '#3a1a10',
      t: '#ffffff',
      b: '#c09040',
      c: '#6a3a20',
    },
  },
  'dragon-orange': {
    art: DRAGON,
    palette: {
      o: '#1a0a08',
      d: '#e0702a',
      D: '#ffa050',
      b: '#f8d890',
      w: '#a03a1a',
      W: '#d06030',
      h: '#f0e0c0',
      e: '#ffe040',
      k: '#401010',
    },
  },
  'dragon-blue': {
    art: DRAGON,
    palette: {
      o: '#0a0a20',
      d: '#2a5ad0',
      D: '#5a8af0',
      b: '#c8e0f8',
      w: '#1a2a80',
      W: '#3a5ab0',
      h: '#f0e0c0',
      e: '#ffe040',
      k: '#100a30',
    },
  },
}

// Small 16px versions shown roaming the map, as <key>-mini (the battle sprites are in battlers.js)
export const createEnemies = (scene) => {
  Object.entries(ENEMIES).forEach(([key, enemy]) =>
    createTexture(scene, `${key}-mini`, mirror(enemy.art), enemy.palette)
  )
}
