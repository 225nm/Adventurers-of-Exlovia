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

// The bigger monsters, painted facing right (toward the heroes)

// A beady glaring eye with a glowing iris
const glare = (p, cx, cy, r, iris, glow) => {
  if (glow)
    p.add(
      `<path d="${oval(cx, cy, r * 2.4, r * 2)}" fill="${iris}" opacity="0.55" filter="${p.blur(r)}"/>`
    )
  p.shape(
    blob([
      [cx - r, cy],
      [cx + r * 1.1, cy - r * 0.7],
      [cx + r, cy + r * 0.6],
      [cx - r * 0.5, cy + r * 0.7],
    ]),
    {
      fill: '#fff6d0',
      line: '#140808',
      width: r * 0.28,
    }
  )
  p.shape(oval(cx + r * 0.2, cy, r * 0.42, r * 0.5), { fill: iris })
  p.shape(oval(cx + r * 0.25, cy, r * 0.16, r * 0.3), { fill: '#100404' })
  p.shape(oval(cx + r * 0.05, cy - r * 0.18, r * 0.13, r * 0.13), {
    fill: '#ffffff',
  })
}

// Goblin: green skinned, long pointed ears, a hunched stance in ragged leathers, jabbing a spear
export const goblin = () => {
  const p = new Painting(48, 56)
  const skinFill = p.paint(
    linearAt(
      [
        [0, '#c8f08a'],
        [0.45, '#6aaa3a'],
        [1, '#2a4a14'],
      ],
      120,
      100,
      300,
      420
    )
  )
  const skinLine = '#16280a'
  // spear behind the body, held forward
  p.shape(
    curve([
      [90, 420],
      [440, 250],
    ]),
    { line: '#6a4422', width: 10 }
  )
  p.shape(
    curve([
      [90, 420],
      [440, 250],
    ]),
    { line: '#b0804a', width: 3, opacity: 0.7 }
  )
  p.part(
    blob(
      [
        [430, 238, 0],
        [476, 230, 0],
        [446, 268, 0],
      ],
      0.2
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#ffffff'],
            [1, '#7a8aaa'],
          ],
          430,
          230,
          470,
          268
        )
      ),
      line: '#2a3044',
    }
  )
  // legs, bandy and bare
  ;[
    [180, 0.85],
    [250, 1],
  ].forEach(([x, tone]) => {
    const leg = blob([
      [x - 18, 400],
      [x + 16, 400],
      [x + 22, 490],
      [x + 44, 506],
      [x + 40, 524, 0],
      [x - 22, 524, 0],
      [x - 20, 470],
    ])
    p.part(leg, {
      fill: skinFill,
      line: skinLine,
      shade: '#0e2006',
      offset: 10,
    })
    if (tone < 1) p.shape(leg, { fill: '#0e2006', opacity: 0.25 })
  })
  // ragged leather tunic
  const body = blob([
    [160, 220],
    [290, 210],
    [316, 300],
    [306, 380],
    [320, 420, 0],
    [280, 410],
    [250, 430, 0],
    [220, 410],
    [184, 430, 0],
    [150, 400],
    [140, 300],
  ])
  p.part(body, {
    fill: p.paint(
      linearAt(
        [
          [0, '#c08a52'],
          [0.5, '#7a4a24'],
          [1, '#2e1608'],
        ],
        160,
        210,
        300,
        430
      )
    ),
    line: '#1a0a02',
    shade: '#140600',
    depth: 0.6,
    light: '#f0c088',
    offset: 18,
  })
  p.shape(
    curve([
      [150, 330],
      [230, 340],
      [310, 320],
    ]),
    { line: '#3a1c08', width: 10 }
  )
  p.shape(oval(232, 338, 12, 10), {
    fill: '#d0d4e0',
    line: '#3a3e50',
    width: 3,
  })
  // arms reaching forward to the spear
  const arm = blob([
    [262, 230],
    [310, 250],
    [356, 320],
    [372, 334],
    [352, 352],
    [314, 330],
    [270, 280],
  ])
  p.part(arm, { fill: skinFill, line: skinLine, shade: '#0e2006', offset: 10 })
  p.part(oval(362, 336, 20, 18), { fill: skinFill, line: skinLine })
  // head: big, with long ears, hooked nose and a toothy grin
  const head = blob([
    [150, 120],
    [196, 60],
    [270, 56],
    [330, 100],
    [344, 160],
    [320, 210],
    [260, 230],
    [196, 222],
    [160, 186],
  ])
  p.part(head, {
    fill: skinFill,
    line: skinLine,
    shade: '#0e2006',
    depth: 0.6,
    light: '#f0ffd0',
    offset: 18,
  })
  ;[
    [
      [160, 130],
      [40, 70],
      [168, 180],
    ],
    [
      [300, 90],
      [420, 40],
      [330, 140],
    ],
  ].forEach(([a, tip, b]) => {
    const ear = blob([a, [tip[0], tip[1], 0], b], 0.6)
    p.part(ear, { fill: skinFill, line: skinLine, shade: '#0e2006', offset: 8 })
    p.shape(
      blob(
        [
          [a[0], a[1] + 10],
          [
            tip[0] + (a[0] - tip[0]) * 0.3,
            tip[1] + (a[1] - tip[1]) * 0.3 + 6,
            0,
          ],
          [b[0], b[1] - 10],
        ],
        0.6
      ),
      {
        fill: '#d07a6a',
        opacity: 0.55,
      }
    )
  })
  glare(p, 230, 130, 20, '#ffcc20', true)
  glare(p, 296, 128, 16, '#ffcc20', true)
  p.shape(stroke([200, 104], [256, 116], 9, 0.1), { fill: '#16280a' })
  p.shape(stroke([280, 112], [316, 104], 8, -0.1), { fill: '#16280a' })
  p.part(
    blob([
      [300, 140],
      [346, 176],
      [312, 182],
    ]),
    { fill: skinFill, line: skinLine }
  )
  p.shape(
    blob([
      [230, 184],
      [270, 196],
      [318, 186],
      [304, 214],
      [252, 216],
    ]),
    { fill: '#3a0a0a', line: skinLine, width: 3 }
  )
  ;[
    [250, 194],
    [274, 198],
    [298, 192],
  ].forEach(([x, y]) =>
    p.shape(
      blob(
        [
          [x - 7, y],
          [x + 7, y],
          [x, y + 13, 0],
        ],
        0.2
      ),
      { fill: '#fff6d8' }
    )
  )
  return p.toString()
}

// Dark mage: a tall hooded figure in purple robes, its face lost in shadow but for two glowing eyes,
// holding a staff and a sphere of violet fire
export const darkMage = () => {
  const p = new Painting(48, 62)
  const robeFill = p.paint(
    linearAt(
      [
        [0, '#9a6ad8'],
        [0.35, '#4a2488'],
        [1, '#12062a'],
      ],
      120,
      60,
      320,
      600
    )
  )
  const robeLine = '#0a0218'
  // staff behind
  p.shape(
    curve([
      [340, 70],
      [330, 600],
    ]),
    { line: '#2a1a12', width: 12 }
  )
  p.shape(
    curve([
      [340, 70],
      [330, 600],
    ]),
    { line: '#6a4a3a', width: 3, opacity: 0.6 }
  )
  p.part(
    blob(
      [
        [318, 74, 0],
        [340, 30, 0],
        [362, 74, 0],
        [340, 92],
      ],
      0.4
    ),
    { fill: '#3a2a4a', line: '#0a0418' }
  )
  // robe, flaring to the ground
  const robe = blob([
    [180, 160],
    [300, 150],
    [320, 300],
    [356, 560],
    [370, 614, 0],
    [96, 614, 0],
    [110, 540],
    [150, 300],
  ])
  p.part(robe, {
    fill: robeFill,
    line: robeLine,
    shade: '#06010e',
    depth: 0.65,
    light: '#c8a8ff',
    offset: 24,
    radius: 16,
  })
  p.soft(
    robe,
    [
      [stroke([180, 330], [150, 600], 24, 0.04), '#08021a', 0.6],
      [stroke([270, 330], [300, 600], 18, -0.04), '#08021a', 0.5],
      [stroke([226, 330], [226, 600], 10, 0.02), '#b090f0', 0.4],
    ],
    10
  )
  // gold trim and runes down the front
  p.shape(
    curve([
      [230, 300],
      [228, 450],
      [226, 610],
    ]),
    { line: '#e8b848', width: 6 }
  )
  ;[360, 430, 500, 570].forEach((y) =>
    p.shape(oval(228, y, 7, 7), { fill: '#c890ff', line: '#e8b848', width: 2 })
  )
  // hood
  const hood = blob([
    [140, 180],
    [158, 90],
    [220, 30],
    [290, 50],
    [330, 120],
    [320, 200],
    [270, 230],
    [180, 226],
  ])
  p.part(hood, {
    fill: robeFill,
    line: robeLine,
    shade: '#06010e',
    depth: 0.6,
    light: '#d8c0ff',
    offset: 18,
  })
  // the darkness inside the hood and the glowing eyes in it
  const face = blob([
    [200, 120],
    [270, 100],
    [306, 150],
    [292, 206],
    [240, 216],
    [206, 186],
  ])
  p.shape(face, { fill: '#05010c' })
  p.add(
    `<path d="${oval(256, 154, 46, 22)}" fill="#ff40c0" opacity="0.5" filter="${p.blur(10)}"/>`
  )
  p.shape(
    blob(
      [
        [228, 148],
        [252, 140],
        [248, 158],
      ],
      0.6
    ),
    { fill: '#ffd0f0' }
  )
  p.shape(
    blob(
      [
        [268, 146],
        [290, 140],
        [286, 156],
      ],
      0.6
    ),
    { fill: '#ffd0f0' }
  )
  // sleeve and a clawed hand holding a sphere of violet fire
  const sleeve = blob([
    [260, 220],
    [320, 240],
    [372, 300],
    [380, 330],
    [340, 344],
    [290, 300],
  ])
  p.part(sleeve, {
    fill: robeFill,
    line: robeLine,
    shade: '#06010e',
    depth: 0.6,
    offset: 12,
  })
  p.add(
    `<path d="${oval(392, 290, 60, 60)}" fill="#c040ff" opacity="0.6" filter="${p.blur(16)}"/>`
  )
  p.part(oval(392, 290, 30, 30), {
    fill: p.paint(
      radialAt(
        [
          [0, '#ffffff'],
          [0.3, '#f0b0ff'],
          [0.7, '#a020e0'],
          [1, '#3a0478'],
        ],
        384,
        280,
        34
      )
    ),
    line: '#2a0050',
    light: '#ffffff',
    offset: 6,
  })
  glint(p, 384, 280, 8)
  p.part(
    blob([
      [352, 316],
      [380, 312],
      [388, 336],
      [360, 346],
    ]),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#c0b8d8'],
            [1, '#5a5070'],
          ],
          352,
          312,
          388,
          346
        )
      ),
      line: '#1a1428',
    }
  )
  return p.toString()
}

// Ogre: a hulking brute with ruddy skin, a heavy brow, tusks and a spiked club raised over its head
export const ogre = () => {
  const p = new Painting(64, 76)
  const skinAt = (y1, y2) =>
    p.paint(
      linearAt(
        [
          [0, '#ffc8a0'],
          [0.4, '#d8805a'],
          [1, '#7a3018'],
        ],
        200,
        y1,
        420,
        y2
      )
    )
  const skinLine = '#2a0a04'
  const flesh = (d, y1, y2, extra = {}) =>
    p.part(d, {
      fill: skinAt(y1, y2),
      line: skinLine,
      width: 4,
      shade: '#3a0c04',
      depth: 0.55,
      light: '#ffe4cc',
      offset: 18,
      ...extra,
    })

  // far arm, hanging behind the belly
  const farArm = blob([
    [170, 250],
    [214, 262],
    [204, 380],
    [180, 470],
    [140, 486],
    [118, 450],
    [140, 350],
  ])
  flesh(farArm, 250, 490)
  p.shape(farArm, { fill: '#3a0c04', opacity: 0.25 })

  // legs, short and thick, feet planted wide
  ;[
    [230, true],
    [370, false],
  ].forEach(([x, far]) => {
    const leg = blob([
      [x - 56, 540],
      [x + 50, 540],
      [x + 52, 670],
      [x + 84, 694],
      [x + 80, 736, 0],
      [x - 62, 736, 0],
      [x - 60, 680],
    ])
    flesh(leg, 540, 736)
    // toes
    ;[x + 20, x + 46, x + 70].forEach((tx) =>
      p.shape(
        curve([
          [tx, 712],
          [tx + 4, 734],
        ]),
        { line: skinLine, width: 3, opacity: 0.6 }
      )
    )
    if (far) p.shape(leg, { fill: '#3a0c04', opacity: 0.25 })
  })

  // body: a broad chest over a round belly, hunched so the head juts forward
  const body = blob([
    [150, 260],
    [250, 200],
    [400, 200],
    [480, 260],
    [500, 380],
    [470, 500],
    [400, 560],
    [230, 566],
    [150, 500],
    [126, 380],
  ])
  flesh(body, 200, 566, { offset: 34, radius: 20 })
  // pecs and belly drawn in with soft shadows
  p.soft(
    body,
    [
      [
        curve([
          [230, 300],
          [300, 330],
          [380, 300],
        ]),
        '#7a2a14',
        0.5,
      ],
      [oval(330, 450, 120, 80), '#ffe4cc', 0.35],
    ],
    12
  )
  p.shape(
    curve([
      [236, 304],
      [300, 330],
      [372, 300],
    ]),
    { line: '#8a3418', width: 4, opacity: 0.55 }
  )
  p.shape(oval(330, 470, 8, 6), { fill: '#8a3418', opacity: 0.6 })

  // loincloth on a rope belt
  p.part(
    blob(
      [
        [146, 500],
        [470, 488],
        [474, 524],
        [150, 536],
      ],
      0.5
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#9a7a52'],
            [1, '#3a2414'],
          ],
          0,
          488,
          0,
          536
        )
      ),
      line: '#1a0a02',
    }
  )
  p.part(
    blob(
      [
        [240, 524],
        [420, 518],
        [410, 640, 0],
        [370, 610],
        [336, 650, 0],
        [300, 612],
        [258, 640, 0],
      ],
      0.7
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#c89a62'],
            [1, '#5a3418'],
          ],
          0,
          518,
          0,
          640
        )
      ),
      line: '#1a0a02',
      shade: '#120600',
      offset: 12,
    }
  )

  // spiked club over the near shoulder
  const club = blob(
    [
      [360, 330, 0],
      [338, 312, 0],
      [490, 70],
      [556, 30],
      [600, 64],
      [540, 150],
    ],
    0.8
  )
  p.part(club, {
    fill: p.paint(
      linearAt(
        [
          [0, '#d0a070'],
          [0.5, '#7a4a22'],
          [1, '#2a1406'],
        ],
        420,
        40,
        600,
        330
      )
    ),
    line: '#1a0a02',
    width: 4,
    shade: '#120600',
    depth: 0.6,
    light: '#f4d0a0',
    offset: 18,
  })
  ;[
    [510, 70],
    [556, 50],
    [540, 122],
    [490, 116],
    [584, 90],
  ].forEach(([x, y]) =>
    p.part(
      blob(
        [
          [x - 9, y + 6],
          [x + 4, y - 24, 0],
          [x + 11, y + 8],
        ],
        0.4
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#ffffff'],
              [1, '#7a82a0'],
            ],
            x,
            y - 24,
            x,
            y + 8
          )
        ),
        line: '#2a2e44',
        width: 2,
      }
    )
  )

  // near arm raised, fist wrapped around the club
  const arm = blob([
    [384, 220],
    [450, 214],
    [500, 260],
    [496, 300],
    [470, 250],
    [440, 250],
    [420, 290],
    [380, 280],
  ])
  flesh(arm, 214, 300)
  const forearm = blob([
    [464, 236],
    [500, 252],
    [476, 196],
    [452, 160],
    [420, 176],
    [440, 214],
  ])
  flesh(forearm, 160, 252)
  flesh(oval(440, 170, 30, 26), 144, 196)
  p.shape(
    curve([
      [420, 170],
      [446, 166],
      [462, 176],
    ]),
    { line: skinLine, width: 3, opacity: 0.6 }
  )

  // head: small for the body, jutting forward, heavy brow, tusks, a scowl and a tuft of hair
  const head = blob([
    [250, 130],
    [300, 80],
    [380, 84],
    [430, 130],
    [432, 196],
    [400, 240],
    [330, 254],
    [270, 230],
    [246, 180],
  ])
  flesh(head, 80, 254)
  p.soft(
    head,
    [
      [
        blob(
          [
            [260, 140],
            [430, 124],
            [432, 160],
            [262, 164],
          ],
          0.6
        ),
        '#6a2410',
        0.7,
      ],
    ],
    6
  )
  glare(p, 328, 168, 18, '#ffe040', true)
  glare(p, 394, 164, 15, '#ffe040', true)
  p.shape(stroke([296, 146], [354, 150], 12, 0.08), { fill: '#4a1808' })
  p.shape(stroke([374, 146], [420, 140], 11, -0.08), { fill: '#4a1808' })
  flesh(
    blob([
      [372, 184],
      [426, 206],
      [380, 218],
    ]),
    184,
    218,
    { offset: 6 }
  )
  p.shape(
    curve([
      [316, 232],
      [360, 222],
      [410, 230],
    ]),
    { line: skinLine, width: 6 }
  )
  ;[
    [326, 232],
    [400, 228],
  ].forEach(([x, y]) =>
    p.part(
      blob(
        [
          [x - 9, y + 4],
          [x + 2, y - 30, 0],
          [x + 11, y + 4],
        ],
        0.5
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#ffffff'],
              [1, '#d8c8a0'],
            ],
            x,
            y - 30,
            x,
            y + 4
          )
        ),
        line: '#5a3a20',
        width: 2,
      }
    )
  )
  p.part(
    blob(
      [
        [286, 92],
        [314, 40, 0],
        [334, 86],
        [364, 34, 0],
        [380, 88],
        [408, 56, 0],
        [410, 112],
        [320, 106],
      ],
      0.7
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#6a3a24'],
            [1, '#1a0804'],
          ],
          0,
          40,
          0,
          110
        )
      ),
      line: '#0e0402',
    }
  )
  return p.toString()
}

// Dragon: a winged dragon rearing to the right, long neck curving up to a horned head, a tail curling
// back on the left, scaled hide over a pale belly. The palette makes it orange or blue
const DRAGON_COLORS = {
  orange: {
    hide: ['#ffc890', '#f88a3a', '#c8501c', '#5a1406'],
    belly: ['#fff4d0', '#f0d098', '#b07840'],
    wing: ['#ffa060', '#c83a1c', '#4a0c04'],
    line: '#2a0602',
    eye: '#ffe040',
  },
  blue: {
    hide: ['#c4dcff', '#6a98f0', '#2a52c0', '#0a1450'],
    belly: ['#f0f6ff', '#b8d0f0', '#6a88c8'],
    wing: ['#8ab0ff', '#2a48b0', '#081040'],
    line: '#040822',
    eye: '#a8ffe8',
  },
}
const dragon = (kind) => () => {
  const c = DRAGON_COLORS[kind]
  const p = new Painting(92, 80)
  const hide = p.paint(
    linearAt(
      [
        [0, c.hide[0]],
        [0.35, c.hide[1]],
        [0.75, c.hide[2]],
        [1, c.hide[3]],
      ],
      200,
      100,
      700,
      780
    )
  )
  const belly = p.paint(
    linearAt(
      [
        [0, c.belly[0]],
        [0.5, c.belly[1]],
        [1, c.belly[2]],
      ],
      400,
      300,
      520,
      700
    )
  )
  const part = (d, extra = {}) =>
    p.part(d, {
      fill: hide,
      line: c.line,
      width: 4,
      shade: c.hide[3],
      depth: 0.6,
      light: c.hide[0],
      offset: 18,
      ...extra,
    })

  // far wing, behind everything
  const wing = (dx, dy, tone) => {
    const membrane = blob(
      [
        [380 + dx, 300 + dy],
        [300 + dx, 120 + dy],
        [180 + dx, 20 + dy, 0],
        [200 + dx, 130 + dy],
        [120 + dx, 120 + dy, 0],
        [170 + dx, 220 + dy],
        [90 + dx, 250 + dy, 0],
        [190 + dx, 320 + dy],
        [130 + dx, 380 + dy, 0],
        [300 + dx, 380 + dy],
      ],
      0.8
    )
    p.part(membrane, {
      fill: p.paint(
        linearAt(
          [
            [0, c.wing[0]],
            [0.5, c.wing[1]],
            [1, c.wing[2]],
          ],
          140 + dx,
          20 + dy,
          380 + dx,
          380 + dy
        )
      ),
      line: c.line,
      width: 4,
      shade: c.wing[2],
      depth: 0.6,
      light: c.wing[0],
      offset: 18,
    })
    ;[
      [180, 20],
      [120, 120],
      [90, 250],
      [130, 380],
    ].forEach(([x, y]) =>
      p.shape(
        curve([
          [380 + dx, 300 + dy],
          [(380 + x) / 2 + dx, (300 + y) / 2 - 20 + dy],
          [x + dx, y + dy],
        ]),
        { line: c.line, width: 5, opacity: 0.7 }
      )
    )
    if (tone < 1) p.shape(membrane, { fill: c.line, opacity: 1 - tone })
  }
  wing(80, 30, 0.75)

  // tail curling back to the left, with a spade tip
  const tail = blob(
    [
      [300, 560],
      [200, 640],
      [90, 640],
      [40, 590],
      [70, 560],
      [120, 600],
      [210, 590],
      [290, 500],
    ],
    0.9
  )
  part(tail)
  p.part(
    blob(
      [
        [60, 600],
        [20, 560, 0],
        [40, 620],
        [10, 660, 0],
        [80, 630],
      ],
      0.5
    ),
    { fill: hide, line: c.line, width: 4 }
  )

  // hind legs and body
  part(
    blob([
      [300, 520],
      [380, 520],
      [400, 640],
      [440, 700],
      [430, 730, 0],
      [310, 730, 0],
      [330, 680],
      [290, 600],
    ])
  )
  const body = blob([
    [280, 420],
    [400, 330],
    [560, 350],
    [620, 460],
    [600, 600],
    [500, 680],
    [360, 660],
    [280, 580],
  ])
  part(body, { offset: 30, radius: 18 })
  // belly plates
  const bellyShape = blob([
    [470, 380],
    [560, 400],
    [596, 500],
    [570, 620],
    [500, 670],
    [470, 560],
    [460, 460],
  ])
  p.part(bellyShape, {
    fill: belly,
    line: c.line,
    width: 3,
    shade: c.belly[2],
    depth: 0.5,
    offset: 14,
  })
  ;[440, 490, 540, 590, 630].forEach((y) =>
    p.shape(
      curve([
        [470, y],
        [530, y + 10],
        [590, y - 6],
      ]),
      { line: c.belly[2], width: 3, opacity: 0.8 }
    )
  )
  // near hind leg
  part(
    blob([
      [440, 560],
      [540, 580],
      [560, 680],
      [600, 720],
      [590, 760, 0],
      [450, 760, 0],
      [470, 690],
      [430, 630],
    ])
  )
  ;[470, 510, 550].forEach((x) =>
    p.shape(
      blob(
        [
          [x, 752],
          [x + 10, 770, 0],
          [x + 20, 752],
        ],
        0.3
      ),
      { fill: '#fff4e0', line: c.line, width: 2 }
    )
  )

  // neck curving up to the head
  const neck = blob(
    [
      [520, 380],
      [560, 260],
      [620, 170],
      [690, 150],
      [700, 220],
      [640, 300],
      [610, 420],
    ],
    0.9
  )
  part(neck, { offset: 22 })
  p.part(
    blob(
      [
        [580, 300],
        [620, 220],
        [660, 196],
        [640, 260],
        [610, 400],
      ],
      0.9
    ),
    { fill: belly, line: c.line, width: 3, offset: 10 }
  )
  // front claws
  part(
    blob([
      [580, 470],
      [650, 470],
      [690, 530],
      [700, 560],
      [660, 570],
      [620, 520],
    ])
  )
  ;[660, 680, 700].forEach((x) =>
    p.shape(
      blob(
        [
          [x - 8, 556],
          [x + 6, 582, 0],
          [x + 10, 554],
        ],
        0.3
      ),
      { fill: '#fff4e0', line: c.line, width: 2 }
    )
  )

  // head: horned, a long snout, glowing eye and a mouth full of teeth
  const head = blob([
    [640, 130],
    [700, 90],
    [780, 100],
    [880, 160],
    [890, 200],
    [820, 220],
    [760, 230],
    [690, 220],
    [640, 190],
  ])
  part(head, { offset: 18 })
  ;[
    [
      [680, 110],
      [600, 30],
      [710, 100],
    ],
    [
      [720, 100],
      [680, 10],
      [750, 96],
    ],
  ].forEach(([a, tip, b]) =>
    p.part(blob([a, [tip[0], tip[1], 0], b], 0.5), {
      fill: p.paint(
        linearAt(
          [
            [0, '#fff8e8'],
            [1, '#a08a6a'],
          ],
          tip[0],
          tip[1],
          a[0],
          a[1]
        )
      ),
      line: c.line,
      width: 3,
    })
  )
  p.shape(
    curve([
      [780, 196],
      [830, 200],
      [884, 184],
    ]),
    { line: c.line, width: 5 }
  )
  ;[800, 830, 860].forEach((x) =>
    p.shape(
      blob(
        [
          [x - 8, 194],
          [x, 214, 0],
          [x + 8, 194],
        ],
        0.3
      ),
      { fill: '#fffbe8' }
    )
  )
  glare(p, 744, 142, 18, c.eye, true)
  p.shape(oval(868, 156, 5, 4), { fill: c.line })
  // spines along the back
  ;[
    [600, 230],
    [570, 290],
    [520, 340],
    [440, 330],
    [370, 360],
  ].forEach(([x, y]) =>
    p.part(
      blob(
        [
          [x - 14, y + 8],
          [x - 18, y - 30, 0],
          [x + 14, y + 4],
        ],
        0.4
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#fff4e0'],
              [1, c.hide[2]],
            ],
            x,
            y - 30,
            x,
            y + 8
          )
        ),
        line: c.line,
        width: 2.5,
      }
    )
  )

  // near wing, raised behind the shoulders
  wing(250, 20, 1)
  return p.toString()
}
export const dragonOrange = dragon('orange')
export const dragonBlue = dragon('blue')
