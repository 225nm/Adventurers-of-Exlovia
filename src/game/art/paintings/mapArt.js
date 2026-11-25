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
import { seeded } from './scene'

// The map's scenery, painted: trees, small decorations, the treasure chest and the stairs down.
// Seen from slightly above, lit from the upper left. Each stands with its base on the bottom edge

// A billowing crown of leaves: overlapping clusters, each lit on its upper left and shaded below,
// with light dabs of single leaves on top. tones: [deep, mid, light, highlight]
const crown = (p, cx, cy, w, h, tones, seed, fruit) => {
  const r = seeded(seed)
  const clusters = []
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r())
    clusters.push([
      cx + Math.cos(a) * d * w * 0.42,
      cy + Math.sin(a) * d * h * 0.4,
      (0.18 + r() * 0.1) * w,
    ])
  }
  // back to front: the top clusters are drawn last, they catch the light
  clusters.sort((a, b) => b[1] - a[1])
  const silhouette = clusters
    .map(([x, y, s]) => oval(x, y, s, s * 0.85))
    .join('')
  p.shape(silhouette, { fill: tones[0], line: '#0a1e0c', width: 4 })
  clusters.forEach(([x, y, s], i) => {
    const fill = p.paint(
      radialAt(
        [
          [0, tones[3]],
          [0.35, tones[2]],
          [0.75, tones[1]],
          [1, tones[0]],
        ],
        x - s * 0.35,
        y - s * 0.4,
        s * 1.3
      )
    )
    const leafy = blob(
      [...Array(9)].map((_, k) => {
        const a = (k / 9) * Math.PI * 2
        const rr = s * (0.82 + ((i * 7 + k * 3) % 5) * 0.05)
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85]
      })
    )
    p.shape(leafy, { fill, line: tones[0], width: 2.5, opacity: 0.98 })
  })
  // single leaves catching the light
  for (let i = 0; i < 22; i++) {
    const x = cx + (r() - 0.6) * w * 0.7
    const y = cy + (r() - 0.7) * h * 0.6
    p.shape(stroke([x, y], [x + 8, y - 6], 6, 0.3), {
      fill: tones[3],
      opacity: 0.7,
    })
  }
  if (fruit) {
    for (let i = 0; i < 6; i++) {
      const x = cx + (r() - 0.5) * w * 0.7
      const y = cy + (r() - 0.3) * h * 0.55
      p.part(oval(x, y, 7, 7), {
        fill: p.paint(
          radialAt(
            [
              [0, '#ffffff'],
              [0.3, fruit[0]],
              [1, fruit[1]],
            ],
            x - 3,
            y - 3,
            9
          )
        ),
        line: '#2a0a04',
        width: 1.5,
      })
    }
  }
  // the crown's own shadow on its underside
  p.soft(
    silhouette,
    [[oval(cx + w * 0.1, cy + h * 0.45, w * 0.6, h * 0.25), '#04140a', 0.5]],
    10
  )
}

const trunk = (p, x, top, bottom, w) => {
  const d = blob(
    [
      [x - w * 0.4, top],
      [x + w * 0.4, top],
      [x + w * 0.5, bottom - 10],
      [x + w * 0.9, bottom],
      [x - w * 0.9, bottom],
      [x - w * 0.5, bottom - 10],
    ],
    0.6
  )
  p.part(d, {
    fill: p.paint(
      linearAt(
        [
          [0, '#c08a5a'],
          [0.5, '#7a4a28'],
          [1, '#3a1e0c'],
        ],
        x - w,
        0,
        x + w,
        0
      )
    ),
    line: '#1e0e04',
    shade: '#120600',
    offset: 6,
  })
  p.shape(
    curve([
      [x - 4, top + 10],
      [x - 2, bottom - 12],
    ]),
    { line: '#3a1e0c', width: 2, opacity: 0.6 }
  )
}

const LEAVES = {
  green: ['#1c4a22', '#3a8a36', '#7cc84e', '#d4f088'],
  dark: ['#0e3428', '#22684c', '#4aa278', '#a8e0b8'],
  pine: ['#0e2e1e', '#1e5a34', '#3e8a4a', '#9ad078'],
}

export const treeRound = () => {
  const p = new Painting(24, 30)
  trunk(p, 120, 170, 300, 34)
  crown(p, 120, 116, 168, 170, LEAVES.green, 11, ['#ff6a5a', '#9a1010'])
  return p.toString()
}

export const treeDark = () => {
  const p = new Painting(24, 30)
  trunk(p, 120, 170, 300, 34)
  crown(p, 120, 116, 168, 170, LEAVES.dark, 23, ['#ffe080', '#b07010'])
  return p.toString()
}

export const treePine = () => {
  const p = new Painting(20, 32)
  trunk(p, 100, 250, 320, 26)
  const t = LEAVES.pine
  // tiers of boughs, widest at the bottom, each with a ragged lower edge
  ;[
    [250, 96],
    [196, 80],
    [144, 62],
    [94, 44],
  ].forEach(([base, half], i) => {
    const top = base - half * 1.4 - 20
    const pts = [[100, top, 0]]
    const teeth = 6
    for (let k = 0; k <= teeth; k++) {
      const x = 100 + half - (k / teeth) * half * 2
      pts.push([x, base + (k % 2 ? -10 : 4), 0.4])
    }
    const tier = blob(pts, 0.5)
    p.part(tier, {
      fill: p.paint(
        linearAt(
          [
            [0, t[3]],
            [0.3, t[2]],
            [0.7, t[1]],
            [1, t[0]],
          ],
          60,
          top,
          150,
          base
        )
      ),
      line: '#04140a',
      width: 3,
      shade: '#020c06',
      depth: 0.55,
      light: t[3],
      offset: 10,
    })
    // a few strokes of needles catching the light
    for (let k = 0; k < 4; k++) {
      const x = 100 - half * 0.6 + k * half * 0.25
      p.shape(stroke([x, base - 16], [x - 12, base - 4 - i], 5, 0.2), {
        fill: t[3],
        opacity: 0.55,
      })
    }
  })
  return p.toString()
}

// a tuft of long grass blades
export const tuft = () => {
  const p = new Painting(10, 7)
  const r = seeded(5)
  for (let i = 0; i < 12; i++) {
    const x = 20 + r() * 60
    const lean = (r() - 0.5) * 30
    const top = 6 + r() * 30
    p.shape(stroke([x, 70], [x + lean, top], 7, (r() - 0.5) * 0.3), {
      fill: p.paint(
        linearAt(
          [
            [0, '#c8f080'],
            [0.5, '#5aa83a'],
            [1, '#1e5a1e'],
          ],
          0,
          top,
          0,
          70
        )
      ),
    })
  }
  return p.toString()
}

// a patch of small flowers on leafy stems
export const flowers = () => {
  const p = new Painting(12, 8)
  const r = seeded(9)
  const colors = [
    ['#ffffff', '#f0d8f0'],
    ['#fff07a', '#e8a820'],
    ['#ff9ac8', '#d84a8a'],
  ]
  for (let i = 0; i < 6; i++) {
    const x = 16 + r() * 88
    const y = 30 + r() * 38
    p.shape(stroke([x, 80], [x + (r() - 0.5) * 8, y], 3, 0.1), {
      fill: '#2e6a26',
    })
    const [light, dark] = colors[i % colors.length]
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      p.shape(oval(x + Math.cos(a) * 5, y + Math.sin(a) * 4, 4.5, 3.6), {
        fill: light,
        line: dark,
        width: 1,
      })
    }
    p.shape(oval(x, y, 3, 3), { fill: '#ffd040' })
  }
  return p.toString()
}

// a round bush of leaves
export const bush = () => {
  const p = new Painting(16, 11)
  crown(p, 80, 64, 112, 76, LEAVES.green, 31)
  return p.toString()
}

// a mossy grey boulder
export const rock = () => {
  const p = new Painting(12, 9)
  const d = blob([
    [10, 86],
    [16, 50],
    [44, 18],
    [84, 16],
    [110, 46],
    [114, 86],
  ])
  p.part(d, {
    fill: p.paint(
      linearAt(
        [
          [0, '#e4e8f2'],
          [0.45, '#9aa2b8'],
          [1, '#4a506a'],
        ],
        20,
        10,
        100,
        90
      )
    ),
    line: '#1e2234',
    width: 3,
    shade: '#141828',
    depth: 0.6,
    light: '#ffffff',
    offset: 12,
  })
  p.shape(
    curve([
      [52, 26],
      [62, 52],
      [56, 80],
    ]),
    { line: '#4a506a', width: 2.5, opacity: 0.6 }
  )
  p.soft(d, [[oval(40, 18, 40, 14), '#7ab04a', 0.7]], 4)
  return p.toString()
}

// a cluster of red spotted mushrooms
export const mushrooms = () => {
  const p = new Painting(10, 9)
  ;[
    [36, 40, 22, 30],
    [70, 56, 16, 22],
  ].forEach(([x, capY, rw, stemH]) => {
    p.part(
      blob(
        [
          [x - 7, capY],
          [x + 7, capY],
          [x + 9, capY + stemH],
          [x - 9, capY + stemH],
        ],
        0.5
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#fffaf0'],
              [1, '#d8c8a8'],
            ],
            x - 9,
            0,
            x + 9,
            0
          )
        ),
        line: '#5a4a32',
        width: 2,
      }
    )
    const cap = blob([
      [x - rw, capY + 4],
      [x - rw * 0.7, capY - rw * 0.6],
      [x, capY - rw * 0.9],
      [x + rw * 0.7, capY - rw * 0.6],
      [x + rw, capY + 4],
    ])
    p.part(cap, {
      fill: p.paint(
        radialAt(
          [
            [0, '#ff9a8a'],
            [0.5, '#e0302a'],
            [1, '#7a0a0a'],
          ],
          x - rw * 0.4,
          capY - rw * 0.5,
          rw * 1.4
        )
      ),
      line: '#3a0404',
      width: 2,
      light: '#ffd0c8',
      offset: 5,
    })
    ;[
      [-0.4, -0.3],
      [0.3, -0.5],
      [0.1, 0],
    ].forEach(([dx, dy]) =>
      p.shape(oval(x + dx * rw, capY + dy * rw, rw * 0.16, rw * 0.12), {
        fill: '#fffaf0',
      })
    )
  })
  return p.toString()
}

// a wooden treasure chest with gold bands and a lock, lid slightly domed
export const chest = () => {
  const p = new Painting(16, 14)
  const wood = p.paint(
    linearAt(
      [
        [0, '#e0a060'],
        [0.5, '#a0602a'],
        [1, '#4a2410'],
      ],
      20,
      20,
      120,
      140
    )
  )
  const gold = p.paint(
    linearAt(
      [
        [0, '#fff4b0'],
        [0.45, '#f0c040'],
        [1, '#8a560c'],
      ],
      0,
      30,
      0,
      130
    )
  )
  const box = blob(
    [
      [14, 66],
      [146, 66],
      [146, 134],
      [14, 134],
    ],
    0.15
  )
  p.part(box, {
    fill: wood,
    line: '#1e0e04',
    width: 4,
    shade: '#120600',
    offset: 10,
  })
  const lid = blob(
    [
      [10, 68],
      [16, 30],
      [80, 14],
      [144, 30],
      [150, 68],
    ],
    0.6
  )
  p.part(lid, {
    fill: wood,
    line: '#1e0e04',
    width: 4,
    shade: '#120600',
    light: '#ffd8a0',
    offset: 10,
  })
  // planks
  ;[100, 118].forEach((y) =>
    p.shape(
      curve([
        [18, y],
        [142, y],
      ]),
      { line: '#5a2e12', width: 2, opacity: 0.6 }
    )
  )
  // gold bands and rim
  ;[34, 118].forEach((x) => {
    p.part(
      blob(
        [
          [x - 8, 22],
          [x + 8, 20],
          [x + 8, 134],
          [x - 8, 134],
        ],
        0.3
      ),
      { fill: gold, line: '#5a3408', width: 2 }
    )
  })
  p.part(
    blob(
      [
        [10, 62],
        [150, 62],
        [150, 74],
        [10, 74],
      ],
      0.3
    ),
    { fill: gold, line: '#5a3408', width: 2 }
  )
  // lock
  p.part(
    blob(
      [
        [66, 60],
        [94, 60],
        [94, 92],
        [66, 92],
      ],
      0.4
    ),
    { fill: gold, line: '#5a3408', width: 2.5 }
  )
  p.shape(oval(80, 74, 4, 5), { fill: '#2a1404' })
  glint(p, 40, 34, 10, 0.7)
  return p.toString()
}

// a stone stairway sinking into the ground, mossy rim around steps that fade into darkness
export const stairs = () => {
  const p = new Painting(18, 16)
  const rim = blob(
    [
      [8, 40],
      [30, 10],
      [150, 10],
      [172, 40],
      [172, 140],
      [150, 156],
      [30, 156],
      [8, 140],
    ],
    0.5
  )
  p.part(rim, {
    fill: p.paint(
      linearAt(
        [
          [0, '#dcdcea'],
          [0.5, '#8a8aa0'],
          [1, '#3e3e52'],
        ],
        20,
        10,
        160,
        156
      )
    ),
    line: '#14141e',
    width: 4,
    shade: '#0e0e18',
    light: '#ffffff',
    offset: 10,
  })
  p.soft(
    rim,
    [
      [oval(40, 20, 50, 12), '#6aa84a', 0.8],
      [oval(150, 150, 30, 10), '#6aa84a', 0.6],
    ],
    5
  )
  const hole = blob(
    [
      [34, 34],
      [146, 34],
      [146, 140],
      [34, 140],
    ],
    0.2
  )
  p.shape(hole, { fill: '#08080c' })
  // steps, each darker as they go down
  const steps = ['#bdb8ac', '#8e8a7e', '#625e56', '#3a3632', '#1c1a18']
  steps.forEach((color, i) => {
    const y = 38 + i * 20
    p.shape(
      blob(
        [
          [38, y],
          [142, y],
          [142, y + 16],
          [38, y + 16],
        ],
        0.1
      ),
      { fill: color }
    )
    p.shape(
      curve([
        [38, y + 16],
        [142, y + 16],
      ]),
      { line: '#000000', width: 3, opacity: 0.6 }
    )
  })
  p.soft(hole, [[oval(90, 150, 70, 50), '#000000', 0.9]], 14)
  return p.toString()
}
