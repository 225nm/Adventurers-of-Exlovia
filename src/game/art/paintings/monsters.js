import {
  Painting,
  blob,
  oval,
  curve,
  stroke,
  linearAt,
  radialAt,
} from '../paint/svg'
import { glint } from '../paint/anime'

// The smaller monsters, painted facing right (toward the heroes). Sizes in layout units match the
// battle slots they were designed for

// A pair of fierce little eyes: a glowing iris under a frowning lid
const angryEye = (p, cx, cy, r, iris, glow = false) => {
  if (glow)
    p.add(
      `<path d="${oval(cx, cy, r * 2.2, r * 2)}" fill="${iris}" opacity="0.5" filter="${p.blur(r * 0.8)}"/>`
    )
  p.shape(
    blob([
      [cx - r, cy - r * 0.2],
      [cx + r * 1.1, cy - r * 0.9],
      [cx + r * 0.9, cy + r * 0.6],
      [cx - r * 0.6, cy + r * 0.8],
    ]),
    {
      fill: '#fffbe8',
      line: '#1a0a10',
      width: r * 0.25,
    }
  )
  p.shape(oval(cx + r * 0.15, cy + r * 0.05, r * 0.5, r * 0.55), { fill: iris })
  p.shape(oval(cx + r * 0.2, cy + r * 0.05, r * 0.2, r * 0.32), {
    fill: '#100408',
  })
  p.shape(oval(cx - r * 0.05, cy - r * 0.2, r * 0.16, r * 0.16), {
    fill: '#ffffff',
  })
}

// Slime: a wobbly dome of translucent green gel with bubbles inside, a glossy shine and a scowl
export const slime = () => {
  const p = new Painting(42, 36)
  // shadow pooled under it
  p.add(
    `<path d="${oval(210, 340, 170, 18)}" fill="#0a2a1a" opacity="0.35" filter="${p.blur(6)}"/>`
  )
  const body = blob([
    [40, 330],
    [70, 230],
    [130, 120],
    [210, 70],
    [290, 110],
    [354, 210],
    [384, 318],
    [330, 346],
    [300, 330],
    [270, 350],
    [200, 344],
    [140, 352],
    [90, 338],
  ])
  p.part(body, {
    fill: p.paint(
      radialAt(
        [
          [0, '#d8fff0'],
          [0.35, '#6af0c0'],
          [0.75, '#1aa088'],
          [1, '#0a4a48'],
        ],
        170,
        140,
        280
      )
    ),
    line: '#063a34',
    width: 5,
    shade: '#043030',
    depth: 0.6,
    light: '#e8fff6',
    offset: 30,
    radius: 18,
  })
  // bubbles and a darker core seen through the gel
  p.soft(body, [[oval(230, 270, 110, 60), '#0a6a5a', 0.5]], 20)
  ;[
    [120, 280, 12],
    [150, 230, 7],
    [290, 280, 10],
    [312, 240, 6],
    [250, 310, 8],
  ].forEach(([x, y, r]) => {
    p.shape(oval(x, y, r, r), {
      fill: '#bfffe8',
      opacity: 0.45,
      line: '#e8fff8',
      width: 1.5,
    })
  })
  // big glossy shine
  p.add(
    `<path d="${blob([
      [120, 170],
      [180, 110],
      [230, 100],
      [200, 130],
      [146, 196],
    ])}" fill="#ffffff" opacity="0.85" filter="${p.blur(5)}"/>`
  )
  glint(p, 300, 160, 18, 0.6)
  // face, looking right
  angryEye(p, 236, 200, 22, '#ffd040')
  angryEye(p, 310, 196, 18, '#ffd040')
  p.shape(
    curve([
      [256, 262],
      [282, 250],
      [312, 258],
    ]),
    { line: '#063a34', width: 6 }
  )
  p.shape(
    blob(
      [
        [270, 254],
        [278, 254],
        [276, 266, 0],
      ],
      0.2
    ),
    { fill: '#ffffff', line: '#063a34', width: 1.5 }
  )
  return p.toString()
}

// Bat: a purple bat with wide ribbed wings, furry body, big ears, red glowing eyes and fangs
export const bat = () => {
  const p = new Painting(60, 40)
  const wing = (s) => {
    // s: 1 for the near (right) wing, -1 for the far (left) one, mirrored around the body
    const x = (v) => 300 + v * s
    const membrane = blob(
      [
        [x(20), 160],
        [x(90), 80],
        [x(190), 40, 0],
        [x(250), 70],
        [x(290), 130, 0],
        [x(250), 150],
        [x(250), 220, 0],
        [x(200), 200],
        [x(170), 250, 0],
        [x(130), 220],
        [x(80), 250, 0],
        [x(40), 210],
      ],
      0.8
    )
    p.part(membrane, {
      fill: p.paint(
        linearAt(
          [
            [0, '#b088e0'],
            [0.5, '#6a3aa8'],
            [1, '#2a0e4a'],
          ],
          x(40),
          60,
          x(260),
          250
        )
      ),
      line: '#14041e',
      width: 4,
      shade: '#12021e',
      depth: 0.55,
      light: '#e0c8ff',
      offset: 16,
    })
    // finger bones
    ;[
      [x(250), 150],
      [x(200), 200],
      [x(130), 220],
    ].forEach((tip) =>
      p.shape(curve([[x(70), 120], [(x(70) + tip[0]) / 2, 110], tip]), {
        line: '#2a0e44',
        width: 4,
        opacity: 0.8,
      })
    )
    p.shape(
      curve([
        [x(40), 160],
        [x(120), 70],
        [x(190), 42],
      ]),
      { line: '#d8c0ff', width: 5, opacity: 0.6 }
    )
  }
  wing(-1)
  wing(1)
  // body
  const body = blob([
    [262, 120],
    [338, 120],
    [360, 200],
    [330, 290],
    [300, 310],
    [270, 290],
    [240, 200],
  ])
  p.part(body, {
    fill: p.paint(
      linearAt(
        [
          [0, '#a07ac8'],
          [0.5, '#5a2e8a'],
          [1, '#22083a'],
        ],
        250,
        120,
        350,
        300
      )
    ),
    line: '#14041e',
    width: 4,
    shade: '#12021e',
    light: '#e0c8ff',
    offset: 14,
  })
  // fur tufts
  p.shape(
    curve([
      [262, 230],
      [280, 250],
      [300, 236],
      [320, 252],
      [338, 232],
    ]),
    { line: '#c8a8f0', width: 3, opacity: 0.6 }
  )
  // ears
  ;[
    [252, 70, 270, 130],
    [348, 70, 330, 130],
  ].forEach(([tx, ty, bx, by]) => {
    p.part(
      blob(
        [
          [bx - 22, by],
          [tx, ty, 0],
          [bx + 22, by],
        ],
        0.6
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#a07ac8'],
              [1, '#3a1060'],
            ],
            tx,
            ty,
            bx,
            by
          )
        ),
        line: '#14041e',
        width: 4,
      }
    )
    p.shape(
      blob(
        [
          [bx - 10, by - 4],
          [tx + (bx - tx) * 0.25, ty + 18, 0],
          [bx + 10, by - 4],
        ],
        0.6
      ),
      { fill: '#e08ab8', opacity: 0.7 }
    )
  })
  // face
  angryEye(p, 280, 168, 16, '#ff3a3a', true)
  angryEye(p, 322, 168, 16, '#ff3a3a', true)
  p.shape(
    curve([
      [278, 214],
      [300, 222],
      [322, 214],
    ]),
    { line: '#14041e', width: 4 }
  )
  p.shape(
    blob(
      [
        [284, 216],
        [292, 218],
        [288, 236, 0],
      ],
      0.2
    ),
    { fill: '#ffffff', line: '#14041e', width: 1.5 }
  )
  p.shape(
    blob(
      [
        [308, 218],
        [316, 216],
        [312, 236, 0],
      ],
      0.2
    ),
    { fill: '#ffffff', line: '#14041e', width: 1.5 }
  )
  // feet
  p.shape(
    curve([
      [286, 300],
      [282, 330],
    ]),
    { line: '#2a0e44', width: 6 }
  )
  p.shape(
    curve([
      [314, 300],
      [318, 330],
    ]),
    { line: '#2a0e44', width: 6 }
  )
  return p.toString()
}

// Wisp: a living flame with a grinning face. The colors make it a fire wisp or a frost wisp
const WISP_COLORS = {
  fire: ['#fffbe8', '#fff090', '#ffc030', '#ff7a18', '#d83a10', '#7a1004'],
  ice: ['#f4ffff', '#d0f6ff', '#8ed8ff', '#4aa0f0', '#2a5ad0', '#0e1e6a'],
}
const wisp = (kind) => () => {
  const c = WISP_COLORS[kind]
  const p = new Painting(40, 48)
  // outer glow
  p.add(
    `<path d="${oval(200, 270, 170, 190)}" fill="${c[3]}" opacity="0.45" filter="${p.blur(30)}"/>`
  )
  const flame = (points, colors, line, offset) => {
    const d = blob(points, 0.9)
    p.part(d, {
      fill: p.paint(
        linearAt(
          colors.map((col, i) => [i / (colors.length - 1), col]),
          200,
          470,
          200,
          20
        )
      ),
      line,
      width: 3,
      shade: c[5],
      depth: 0.35,
      light: c[0],
      offset,
    })
    return d
  }
  // outer flame: tongues licking upward and back
  flame(
    [
      [110, 430],
      [60, 330],
      [80, 230],
      [60, 160, 0],
      [120, 190],
      [140, 90],
      [170, 120],
      [200, 20, 0],
      [240, 120],
      [290, 70, 0],
      [300, 170],
      [350, 150, 0],
      [336, 260],
      [350, 350],
      [300, 440],
      [200, 466],
    ],
    [c[5], c[4], c[3], c[2]],
    c[5],
    24
  )
  // inner flame
  flame(
    [
      [140, 420],
      [110, 330],
      [140, 240],
      [176, 260],
      [196, 150, 0],
      [232, 250],
      [270, 210, 0],
      [296, 310],
      [270, 410],
      [200, 440],
    ],
    [c[3], c[2], c[1]],
    'none',
    16
  )
  // white hot core
  p.add(
    `<path d="${oval(206, 360, 70, 70)}" fill="${c[0]}" opacity="0.85" filter="${p.blur(14)}"/>`
  )
  // face: wide eyes and a jagged grin, set toward the right
  angryEye(p, 190, 300, 24, c[5])
  angryEye(p, 262, 296, 20, c[5])
  p.shape(
    blob([
      [176, 360],
      [216, 372],
      [260, 360],
      [276, 352],
      [256, 392],
      [216, 402],
      [184, 388],
    ]),
    {
      fill: c[5],
      line: c[5],
      width: 2,
    }
  )
  ;[
    [196, 368],
    [226, 374],
    [252, 366],
  ].forEach(([x, y]) =>
    p.shape(
      blob(
        [
          [x - 7, y - 2],
          [x + 7, y - 2],
          [x, y + 12, 0],
        ],
        0.2
      ),
      { fill: c[0] }
    )
  )
  return p.toString()
}
export const wispFire = wisp('fire')
export const wispIce = wisp('ice')
