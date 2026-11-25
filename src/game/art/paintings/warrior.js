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

// The warrior, 3/4 view facing right (flipped in game to face the enemies): spiky auburn hair,
// silver plate over a blue tabard, a red cape, a round blue shield and a sword raised forward.
// 42 x 52 layout units, feet on the bottom edge
export const warrior = () => {
  const p = new Painting(42, 52)
  const steel = p.paint(
    linearAt(
      [
        [0, '#ffffff'],
        [0.35, '#dfe6f6'],
        [0.7, '#9eaacb'],
        [1, '#5c6688'],
      ],
      150,
      200,
      300,
      360
    )
  )
  const steelLine = '#3a4266'

  // cape, behind everything
  const cape = blob([
    [165, 222],
    [252, 226],
    [262, 300],
    [246, 380],
    [232, 452],
    [205, 488],
    [168, 474],
    [132, 490],
    [96, 470],
    [70, 430],
    [104, 352],
    [138, 262],
  ])
  p.part(cape, {
    fill: p.paint(
      linearAt(
        [
          [0, '#ff6a6a'],
          [0.45, '#d42c40'],
          [1, '#6e0c22'],
        ],
        120,
        220,
        200,
        490
      )
    ),
    line: '#4a0614',
    shade: '#3a0010',
    light: '#ff9a9a',
    offset: 22,
    radius: 14,
  })
  // folds
  p.soft(
    cape,
    [
      [stroke([120, 300], [92, 460], 26, 0.05), '#5a0418', 0.55],
      [stroke([170, 330], [160, 470], 20, -0.04), '#5a0418', 0.45],
      [stroke([145, 290], [128, 440], 10, 0.03), '#ff8a8a', 0.4],
    ],
    9
  )

  // legs: silver greaves and brown boots, the far leg a little darker
  const legs = [
    { x: 196, tone: 0.82 },
    { x: 248, tone: 1 },
  ]
  legs.forEach(({ x, tone }) => {
    const greave = blob([
      [x - 22, 392],
      [x + 20, 392],
      [x + 18, 450],
      [x + 14, 472],
      [x - 16, 472],
      [x - 20, 440],
    ])
    p.part(greave, {
      fill: steel,
      line: steelLine,
      shade: '#2a3050',
      light: '#ffffff',
      offset: 10,
    })
    if (tone < 1) p.shape(greave, { fill: '#1a2040', opacity: 0.25 })
    // knee plate
    p.part(oval(x, 418, 17, 13), {
      fill: steel,
      line: steelLine,
      shade: '#2a3050',
      light: '#ffffff',
      offset: 6,
    })
    const boot = blob([
      [x - 20, 462],
      [x + 16, 462],
      [x + 20, 482],
      [x + 40, 488],
      [x + 42, 502, 0],
      [x - 22, 502, 0],
      [x - 24, 482],
    ])
    p.part(boot, {
      fill: p.paint(
        linearAt(
          [
            [0, '#a86a3a'],
            [1, '#4a2410'],
          ],
          x,
          462,
          x + 10,
          502
        )
      ),
      line: '#2a1206',
      shade: '#1a0800',
      light: '#d8a070',
      offset: 8,
    })
    if (tone < 1) p.shape(boot, { fill: '#1a0800', opacity: 0.2 })
  })

  // tabard skirt below the breastplate
  const tabard = blob([
    [186, 326],
    [270, 326],
    [276, 372],
    [282, 410, 0],
    [256, 398],
    [230, 414, 0],
    [206, 398],
    [180, 410, 0],
    [180, 370],
  ])
  p.part(tabard, {
    fill: p.paint(
      linearAt(
        [
          [0, '#6c9cff'],
          [0.5, '#2f5ed8'],
          [1, '#162a7a'],
        ],
        190,
        326,
        230,
        414
      )
    ),
    line: '#0e1a50',
    shade: '#081038',
    light: '#a8c8ff',
    offset: 10,
  })
  // gold hem
  p.shape(
    curve([
      [182, 404],
      [206, 394],
      [230, 408],
      [256, 394],
      [280, 404],
    ]),
    {
      line: '#f0c048',
      width: 5,
    }
  )

  // breastplate
  const chest = blob([
    [178, 222],
    [266, 220],
    [292, 258],
    [286, 318],
    [258, 340],
    [200, 340],
    [172, 318],
    [164, 262],
  ])
  p.part(chest, {
    fill: steel,
    line: steelLine,
    shade: '#28304e',
    light: '#ffffff',
    offset: 18,
    radius: 12,
  })
  // ridge down the middle and a bright streak where the light hits
  p.shape(
    curve([
      [236, 228],
      [242, 280],
      [236, 336],
    ]),
    { line: '#7a86aa', width: 3, opacity: 0.8 }
  )
  p.add(
    `<path d="${stroke([206, 238], [198, 316], 14, 0.08)}" fill="#ffffff" opacity="0.7" filter="${p.blur(4)}"/>`
  )
  // gold trim at the collar and a gem
  p.shape(
    curve([
      [184, 230],
      [222, 246],
      [262, 228],
    ]),
    { line: '#f4c850', width: 6 }
  )
  p.shape(
    curve([
      [184, 230],
      [222, 246],
      [262, 228],
    ]),
    { line: '#8a5a12', width: 1.5, opacity: 0.6 }
  )
  p.part(oval(224, 262, 9, 9), {
    fill: p.paint(
      radialAt(
        [
          [0, '#ff9ab0'],
          [0.5, '#d41c3c'],
          [1, '#5a0414'],
        ],
        221,
        259,
        10
      )
    ),
    line: '#3a0410',
  })
  glint(p, 221, 259, 4)

  // belt
  const belt = blob(
    [
      [174, 316],
      [286, 316],
      [288, 338],
      [174, 340],
    ],
    0.4
  )
  p.part(belt, {
    fill: p.paint(
      linearAt(
        [
          [0, '#8a5430'],
          [1, '#3e200c'],
        ],
        0,
        316,
        0,
        340
      )
    ),
    line: '#200c02',
  })
  p.part(
    blob(
      [
        [218, 314],
        [244, 314],
        [246, 342],
        [216, 342],
      ],
      0.3
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#fff0a0'],
            [0.5, '#f0b838'],
            [1, '#9a6010'],
          ],
          216,
          314,
          246,
          342
        )
      ),
      line: '#5a3408',
    }
  )

  // sword arm: pauldron, arm and gauntlet holding the sword up and forward
  const blade = blob(
    [
      [306, 286, 0],
      [384, 52, 0],
      [398, 30, 0],
      [396, 60, 0],
      [326, 294, 0],
    ],
    0
  )
  p.shape(blade, {
    fill: p.paint(
      linearAt(
        [
          [0, '#ffffff'],
          [0.48, '#e8eefc'],
          [0.52, '#a6b2d0'],
          [1, '#6a7698'],
        ],
        330,
        160,
        352,
        172
      )
    ),
    line: '#2e3658',
    width: 3,
  })
  p.shape(
    curve([
      [318, 280],
      [388, 56],
    ]),
    { line: '#ffffff', width: 2, opacity: 0.8 }
  )
  // shine travelling up the blade
  p.add(
    `<path d="${oval(362, 128, 6, 26)}" transform="rotate(18 362 128)" fill="#ffffff" opacity="0.85" filter="${p.blur(3)}"/>`
  )
  // crossguard, grip and pommel
  const gold = p.paint(
    linearAt(
      [
        [0, '#fff4b0'],
        [0.45, '#f4c040'],
        [1, '#8a560c'],
      ],
      0,
      270,
      0,
      300
    )
  )
  p.part(
    blob(
      [
        [278, 270],
        [350, 292],
        [348, 304],
        [276, 284],
      ],
      0.5
    ),
    { fill: gold, line: '#4a2c04' }
  )
  p.part(
    blob(
      [
        [300, 290],
        [320, 296],
        [306, 338],
        [288, 332],
      ],
      0.5
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#8a4a2a'],
            [1, '#3a1808'],
          ],
          290,
          300,
          320,
          330
        )
      ),
      line: '#1a0800',
    }
  )
  p.part(oval(294, 342, 9, 9), { fill: gold, line: '#4a2c04' })

  const arm = blob([
    [262, 238],
    [292, 250],
    [306, 290],
    [296, 312],
    [276, 300],
    [262, 270],
  ])
  p.part(arm, {
    fill: steel,
    line: steelLine,
    shade: '#28304e',
    light: '#ffffff',
    offset: 10,
  })
  const gauntlet = blob([
    [288, 292],
    [316, 296],
    [322, 318],
    [304, 330],
    [284, 318],
  ])
  p.part(gauntlet, {
    fill: steel,
    line: steelLine,
    shade: '#28304e',
    light: '#ffffff',
    offset: 7,
  })
  const pauldron = blob([
    [240, 222],
    [276, 210],
    [304, 232],
    [300, 266],
    [268, 262],
    [246, 248],
  ])
  p.part(pauldron, {
    fill: steel,
    line: steelLine,
    shade: '#28304e',
    light: '#ffffff',
    offset: 12,
  })
  p.shape(
    curve([
      [248, 246],
      [270, 254],
      [298, 256],
    ]),
    { line: '#f4c850', width: 4 }
  )

  // round shield on the far arm, in front of the body
  const shield = oval(132, 300, 64, 76)
  p.part(shield, {
    fill: p.paint(
      linearAt(
        [
          [0, '#fff2a8'],
          [0.5, '#e8a830'],
          [1, '#7a4608'],
        ],
        80,
        230,
        180,
        380
      )
    ),
    line: '#3a2004',
    shade: '#3a1c00',
    light: '#fffbe0',
    offset: 10,
  })
  const face = oval(134, 300, 53, 64)
  p.part(face, {
    fill: p.paint(
      radialAt(
        [
          [0, '#6a9cff'],
          [0.6, '#2648c0'],
          [1, '#0e1a5c'],
        ],
        112,
        268,
        90
      )
    ),
    line: '#5a3408',
    shade: '#060c30',
    light: '#b0ccff',
    offset: 12,
  })
  // emblem: a gold star of four points with a red heart
  p.part(
    blob(
      [
        [134, 248, 0],
        [144, 290],
        [178, 300, 0],
        [144, 310],
        [134, 352, 0],
        [124, 310],
        [90, 300, 0],
        [124, 290],
      ],
      0.6
    ),
    {
      fill: gold,
      line: '#5a3408',
      shade: '#7a4608',
      light: '#ffffff',
      offset: 5,
      radius: 4,
    }
  )
  p.part(oval(134, 300, 9, 9), {
    fill: p.paint(
      radialAt(
        [
          [0, '#ff9ab0'],
          [0.5, '#d41c3c'],
          [1, '#5a0414'],
        ],
        131,
        297,
        10
      )
    ),
    line: '#3a0410',
  })
  glint(p, 131, 297, 4)
  glint(p, 104, 258, 26, 0.55)

  // the head casts a soft shadow onto the collar and chest
  p.soft(chest, [[oval(226, 222, 62, 22), '#1a2040', 0.55]], 10)

  // head: back of the hair, face, then the spiky bangs and a lock falling in front of the ear
  const hairFill = p.paint(
    linearAt(
      [
        [0, '#ffa860'],
        [0.3, '#f46a22'],
        [0.7, '#c43c0a'],
        [1, '#701804'],
      ],
      170,
      10,
      270,
      200
    )
  )
  const hairLine = '#4a1404'
  const hairBack = blob(
    [
      [158, 204],
      [126, 176, 0],
      [146, 156],
      [96, 132, 0],
      [142, 110],
      [110, 66, 0],
      [170, 70],
      [176, 14, 0],
      [222, 46],
      [256, 2, 0],
      [276, 50],
      [334, 34, 0],
      [310, 86],
      [342, 108, 0],
      [304, 120],
      [300, 150],
      [262, 128],
      [190, 132],
      [178, 196],
    ],
    0.9
  )
  p.part(hairBack, {
    fill: hairFill,
    line: hairLine,
    shade: '#4a0e02',
    depth: 0.6,
    light: '#ffc890',
    glow: 0.35,
    offset: 16,
    radius: 10,
  })
  strands(
    p,
    hairBack,
    [
      [[150, 150], [112, 122], 5, 0.1],
      [[160, 112], [124, 72], 5, -0.1],
      [[200, 70], [184, 24], 5, 0.1],
      [[250, 60], [258, 12], 4, -0.1],
      [[290, 80], [326, 44], 4, 0.1],
    ],
    hairLine
  )

  faceRight(p, 230, 145, {
    iris: ['#14307a', '#2f78e6', '#a6e0ff', '#081238'],
    brow: '#7a2a0c',
  })

  // spiky bangs over the forehead, and a lock falling in front of the ear
  const bangs = blob(
    [
      [154, 130],
      [168, 82],
      [218, 56],
      [284, 64],
      [318, 104, 0],
      [290, 100],
      [296, 136, 0],
      [270, 108],
      [256, 140, 0],
      [242, 108],
      [222, 142, 0],
      [206, 112],
      [186, 146, 0],
      [176, 116],
      [166, 160],
      [170, 196, 0],
      [154, 168],
    ],
    0.9
  )
  p.part(bangs, {
    fill: hairFill,
    line: hairLine,
    shade: '#5a1404',
    depth: 0.55,
    light: '#ffd0a0',
    glow: 0.45,
    offset: 12,
    radius: 8,
  })
  strands(
    p,
    bangs,
    [
      [[230, 66], [222, 136], 4, 0.05],
      [[260, 70], [268, 132], 4, -0.05],
      [[196, 78], [190, 140], 4, 0.06],
      [[164, 118], [168, 186], 3, -0.05],
    ],
    hairLine,
    0.45
  )
  hairSheen(
    p,
    bangs,
    [
      [170, 98],
      [214, 74],
      [262, 76],
      [300, 96],
    ],
    '#fff0dc',
    9,
    0.8
  )
  // the bangs shade the forehead just under them
  p.add(
    `<path d="${curve([
      [196, 126],
      [230, 130],
      [272, 128],
    ])}" fill="none" stroke="#a85a3c" stroke-width="7" opacity="0.35" filter="${p.blur(4)}"/>`
  )

  return p.toString()
}
