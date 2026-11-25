import {
  Painting,
  blob,
  oval,
  curve,
  stroke,
  linearAt,
  radialAt,
} from '../paint/svg'
import { faceRight, glint, hairSheen, strands } from '../paint/anime'

// The mage, 3/4 view facing right: long golden hair, a wide purple witch hat with a gold band, a blue
// robe trimmed in gold with wide sleeves, and a tall staff topped with a glowing blue crystal.
// 42 x 52 layout units, feet on the bottom edge
export const mage = () => {
  const p = new Painting(42, 52)
  const gold = p.paint(
    linearAt(
      [
        [0, '#fff6c0'],
        [0.45, '#f2c24a'],
        [1, '#8a5a10'],
      ],
      0,
      0,
      0,
      520
    )
  )
  const hairFill = p.paint(
    linearAt(
      [
        [0, '#fff8d0'],
        [0.35, '#ffe07a'],
        [0.75, '#e0a83a'],
        [1, '#9a6a1a'],
      ],
      150,
      100,
      260,
      420
    )
  )
  const hairLine = '#7a4c10'

  // long hair falling down her back, behind everything
  const hairBack = blob([
    [176, 140],
    [250, 120],
    [292, 170],
    [270, 250],
    [222, 300],
    [196, 380],
    [158, 420],
    [116, 408, 0],
    [136, 380],
    [104, 362, 0],
    [134, 320],
    [122, 252],
    [140, 176],
  ])
  p.part(hairBack, {
    fill: hairFill,
    line: hairLine,
    shade: '#7a4a08',
    depth: 0.55,
    light: '#fffbe8',
    glow: 0.4,
    offset: 16,
  })
  strands(
    p,
    hairBack,
    [
      [[150, 220], [128, 360], 5, 0.08],
      [[176, 240], [150, 400], 5, -0.06],
      [[200, 260], [176, 370], 4, 0.08],
    ],
    hairLine,
    0.5
  )

  // robe: long, flaring at the hem, gold trim down the front
  const robeFill = p.paint(
    linearAt(
      [
        [0, '#7aa6ff'],
        [0.4, '#3a62d8'],
        [1, '#121e6a'],
      ],
      170,
      230,
      280,
      500
    )
  )
  const robe = blob([
    [196, 226],
    [262, 226],
    [282, 290],
    [290, 380],
    [314, 468],
    [306, 494, 0],
    [242, 500],
    [176, 496, 0],
    [150, 470],
    [168, 380],
    [172, 290],
  ])
  p.part(robe, {
    fill: robeFill,
    line: '#0a1240',
    shade: '#060a30',
    depth: 0.6,
    light: '#b8d0ff',
    offset: 18,
    radius: 12,
  })
  // folds falling from the waist
  p.soft(
    robe,
    [
      [stroke([210, 340], [196, 490], 16, 0.04), '#0a1450', 0.6],
      [stroke([258, 350], [282, 488], 14, -0.04), '#0a1450', 0.5],
      [stroke([232, 340], [236, 490], 8, 0.02), '#a8c4ff', 0.45],
    ],
    7
  )
  // gold trim: down the front and around the hem
  p.shape(
    curve([
      [238, 236],
      [240, 330],
      [246, 420],
      [248, 496],
    ]),
    { line: '#f2c24a', width: 7 }
  )
  p.shape(
    curve([
      [238, 236],
      [240, 330],
      [246, 420],
      [248, 496],
    ]),
    { line: '#8a5a10', width: 1.6, opacity: 0.7 }
  )
  p.shape(
    curve([
      [156, 476],
      [200, 492],
      [250, 496],
      [310, 482],
    ]),
    { line: '#f2c24a', width: 7 }
  )
  // sash at the waist with a hanging tassel
  p.part(
    blob(
      [
        [172, 318],
        [284, 314],
        [286, 338],
        [172, 342],
      ],
      0.4
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#e86ad0'],
            [1, '#7a1a6a'],
          ],
          0,
          314,
          0,
          342
        )
      ),
      line: '#3a0634',
      shade: '#2a0428',
      offset: 6,
    }
  )
  p.part(
    blob(
      [
        [178, 334],
        [196, 336],
        [192, 392],
        [176, 388],
      ],
      0.6
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#e86ad0'],
            [1, '#7a1a6a'],
          ],
          0,
          334,
          0,
          392
        )
      ),
      line: '#3a0634',
    }
  )
  // shoes peeking out under the hem
  p.part(
    blob(
      [
        [196, 494],
        [236, 492],
        [252, 504, 0],
        [192, 504, 0],
      ],
      0.5
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#a0603a'],
            [1, '#3a1a08'],
          ],
          0,
          492,
          0,
          504
        )
      ),
      line: '#200c02',
    }
  )

  // staff: dark wood, held upright in front, a gold claw cradling a glowing crystal
  const staff = blob(
    [
      [312, 120, 0],
      [324, 120, 0],
      [330, 504, 0],
      [316, 504, 0],
    ],
    0
  )
  p.part(staff, {
    fill: p.paint(
      linearAt(
        [
          [0, '#c08a5a'],
          [0.5, '#7a4a24'],
          [1, '#3a1e0a'],
        ],
        312,
        0,
        330,
        0
      )
    ),
    line: '#1e0c02',
    shade: '#140600',
    offset: 4,
  })
  // a soft halo of light around the crystal
  p.add(
    `<path d="${oval(318, 82, 56, 56)}" fill="#7ad4ff" opacity="0.45" filter="${p.blur(18)}"/>`
  )
  p.part(
    blob(
      [
        [296, 124],
        [340, 124],
        [350, 92, 0],
        [334, 108],
        [318, 96],
        [302, 108],
        [286, 92, 0],
      ],
      0.6
    ),
    {
      fill: gold,
      line: '#5a3408',
    }
  )
  const crystal = blob(
    [
      [318, 30, 0],
      [342, 74],
      [318, 118, 0],
      [294, 74],
    ],
    0.5
  )
  p.part(crystal, {
    fill: p.paint(
      radialAt(
        [
          [0, '#ffffff'],
          [0.3, '#a8ecff'],
          [0.75, '#2a8ae8'],
          [1, '#0a2a8a'],
        ],
        308,
        58,
        60
      )
    ),
    line: '#0a2a6a',
    shade: '#0a1a5a',
    light: '#ffffff',
    offset: 8,
  })
  glint(p, 309, 58, 10)

  // sleeves: wide bells, the near arm holding the staff
  const sleeveFar = blob([
    [186, 238],
    [210, 250],
    [200, 330],
    [168, 352],
    [148, 334],
    [164, 270],
  ])
  p.part(sleeveFar, {
    fill: robeFill,
    line: '#0a1240',
    shade: '#060a30',
    depth: 0.6,
    offset: 12,
  })
  p.shape(
    curve([
      [150, 334],
      [168, 350],
      [198, 330],
    ]),
    { line: '#f2c24a', width: 5 }
  )
  const sleeveNear = blob([
    [250, 236],
    [282, 244],
    [318, 296],
    [322, 326],
    [286, 330],
    [262, 290],
  ])
  p.part(sleeveNear, {
    fill: robeFill,
    line: '#0a1240',
    shade: '#060a30',
    depth: 0.55,
    light: '#b8d0ff',
    offset: 12,
  })
  p.shape(
    curve([
      [288, 330],
      [306, 326],
      [322, 322],
    ]),
    { line: '#f2c24a', width: 5 }
  )
  // hand on the staff
  p.part(
    blob([
      [306, 292],
      [328, 290],
      [332, 312],
      [314, 320],
      [302, 308],
    ]),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#fff1e4'],
            [1, '#e0a080'],
          ],
          300,
          290,
          330,
          320
        )
      ),
      line: '#8a4a30',
    }
  )
  // collar
  p.part(
    blob(
      [
        [200, 222],
        [258, 222],
        [262, 244],
        [230, 262],
        [198, 244],
      ],
      0.6
    ),
    {
      fill: gold,
      line: '#5a3408',
    }
  )
  p.part(oval(230, 248, 7, 7), {
    fill: p.paint(
      radialAt(
        [
          [0, '#c8f0ff'],
          [0.5, '#2a8ae8'],
          [1, '#0a2a6a'],
        ],
        228,
        245,
        8
      )
    ),
    line: '#0a1a4a',
  })

  faceRight(p, 232, 170, {
    iris: ['#0e4a2a', '#2eb05e', '#c0f4c8', '#062814'],
    brow: '#a87a24',
    lid: '#3a2208',
  })

  // bangs and a long lock falling in front of the ear down to her chest
  const bangs = blob(
    [
      [168, 160],
      [176, 114],
      [226, 92],
      [286, 104],
      [300, 150, 0],
      [282, 134],
      [276, 160, 0],
      [258, 130],
      [244, 162, 0],
      [228, 128],
      [208, 158, 0],
      [196, 132],
      [184, 176],
      [192, 230],
      [178, 286, 0],
      [164, 236],
    ],
    0.9
  )
  p.part(bangs, {
    fill: hairFill,
    line: hairLine,
    shade: '#8a5a10',
    depth: 0.5,
    light: '#ffffff',
    glow: 0.4,
    offset: 12,
  })
  strands(
    p,
    bangs,
    [
      [[230, 100], [226, 150], 4, 0.05],
      [[262, 108], [270, 150], 4, -0.05],
      [[184, 170], [180, 270], 4, 0.05],
    ],
    hairLine,
    0.45
  )
  hairSheen(
    p,
    bangs,
    [
      [184, 128],
      [226, 106],
      [276, 114],
    ],
    '#ffffff',
    9,
    0.8
  )

  // the hat: a wide brim tilted toward the viewer and a tall cone bending back
  const hatFill = p.paint(
    linearAt(
      [
        [0, '#b88aff'],
        [0.4, '#7040d0'],
        [1, '#2a0e6a'],
      ],
      150,
      0,
      260,
      140
    )
  )
  const cone = blob([
    [176, 112],
    [196, 62],
    [196, 20],
    [150, 10, 0],
    [218, 4],
    [254, 38],
    [276, 108],
  ])
  p.part(cone, {
    fill: hatFill,
    line: '#1a0640',
    shade: '#12043a',
    depth: 0.6,
    light: '#e0c8ff',
    offset: 14,
  })
  // gold band with a star buckle
  p.part(
    blob(
      [
        [178, 98],
        [276, 92],
        [282, 116],
        [176, 122],
      ],
      0.5
    ),
    { fill: gold, line: '#5a3408' }
  )
  p.part(
    blob(
      [
        [230, 92, 0],
        [236, 104],
        [248, 106, 0],
        [238, 112],
        [242, 124, 0],
        [230, 116],
        [218, 124, 0],
        [222, 112],
        [212, 106, 0],
        [224, 104],
      ],
      0.3
    ),
    { fill: '#fff8d8', line: '#8a5a10', width: 2 }
  )
  const brim = blob([
    [104, 124],
    [170, 104],
    [260, 98],
    [340, 116],
    [356, 132],
    [300, 144],
    [220, 146],
    [140, 142],
  ])
  p.part(brim, {
    fill: hatFill,
    line: '#1a0640',
    shade: '#12043a',
    depth: 0.6,
    light: '#e0c8ff',
    offset: 10,
  })
  // the brim shades her forehead
  p.add(
    `<path d="${curve([
      [188, 150],
      [232, 158],
      [282, 150],
    ])}" fill="none" stroke="#7a4a3a" stroke-width="12" opacity="0.3" filter="${p.blur(6)}"/>`
  )

  return p.toString()
}
