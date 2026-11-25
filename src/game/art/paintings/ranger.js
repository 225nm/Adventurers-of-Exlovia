import { Painting, blob, oval, curve, stroke, linearAt } from '../paint/svg'
import { faceRight, hairSheen, strands } from '../paint/anime'

// The ranger, 3/4 view facing right: a green hood and cloak, chestnut hair, a red scarf, a leather
// tunic and tall boots, a quiver on the back and a longbow held out in front.
// 42 x 52 layout units, feet on the bottom edge
export const ranger = () => {
  const p = new Painting(42, 52)
  const green = p.paint(
    linearAt(
      [
        [0, '#8ee07a'],
        [0.4, '#3a9a46'],
        [1, '#0e3a1e'],
      ],
      120,
      40,
      260,
      460
    )
  )
  const greenLine = '#0a2410'
  const leather = p.paint(
    linearAt(
      [
        [0, '#d8a46a'],
        [0.5, '#9a6232'],
        [1, '#4a2a10'],
      ],
      180,
      230,
      260,
      400
    )
  )
  const leatherLine = '#2a1404'

  // cloak, behind everything
  const cloak = blob([
    [172, 218],
    [250, 222],
    [258, 300],
    [240, 400],
    [210, 446],
    [160, 432],
    [112, 448],
    [92, 400],
    [126, 320],
    [146, 250],
  ])
  p.part(cloak, {
    fill: green,
    line: greenLine,
    shade: '#04200c',
    depth: 0.6,
    light: '#c0f0a0',
    offset: 20,
    radius: 14,
  })
  p.soft(
    cloak,
    [
      [stroke([140, 290], [118, 430], 22, 0.05), '#062a10', 0.55],
      [stroke([190, 310], [184, 432], 14, -0.04), '#062a10', 0.45],
    ],
    9
  )

  // quiver across the back, with fletched arrows sticking out
  const quiver = blob(
    [
      [128, 214, 0],
      [156, 202, 0],
      [194, 330, 0],
      [166, 340, 0],
    ],
    0.2
  )
  p.part(quiver, {
    fill: leather,
    line: leatherLine,
    shade: '#2a1406',
    offset: 8,
  })
  ;[
    [132, 206, '#f4f0e0'],
    [144, 200, '#e04a3a'],
    [156, 196, '#f4f0e0'],
  ].forEach(([x, y, color]) => {
    p.shape(
      curve([
        [x + 6, y + 20],
        [x - 14, y - 40],
      ]),
      { line: '#6a4a2a', width: 3 }
    )
    p.part(
      blob(
        [
          [x - 14, y - 40, 0],
          [x - 26, y - 64, 0],
          [x - 2, y - 52, 0],
        ],
        0.4
      ),
      { fill: color, line: '#3a2414', width: 2 }
    )
  })

  // legs: brown leggings and tall boots folded at the top
  ;[
    { x: 200, far: true },
    { x: 246, far: false },
  ].forEach(({ x, far }) => {
    const leg = blob(
      [
        [x - 18, 372],
        [x + 18, 372],
        [x + 16, 430],
        [x - 16, 430],
      ],
      0.5
    )
    p.part(leg, {
      fill: p.paint(
        linearAt(
          [
            [0, '#8a6a4a'],
            [1, '#3a2a1a'],
          ],
          x - 18,
          372,
          x + 18,
          430
        )
      ),
      line: '#1a1006',
    })
    const boot = blob([
      [x - 20, 420],
      [x + 18, 418],
      [x + 18, 476],
      [x + 40, 486],
      [x + 42, 502, 0],
      [x - 22, 502, 0],
      [x - 22, 470],
    ])
    p.part(boot, {
      fill: p.paint(
        linearAt(
          [
            [0, '#8a5a34'],
            [1, '#2a1406'],
          ],
          x,
          418,
          x + 10,
          502
        )
      ),
      line: '#1a0a02',
      shade: '#120600',
      light: '#d0986a',
      offset: 8,
    })
    // folded cuff
    p.part(
      blob(
        [
          [x - 22, 414],
          [x + 20, 412],
          [x + 22, 430],
          [x - 22, 432],
        ],
        0.6
      ),
      {
        fill: p.paint(
          linearAt(
            [
              [0, '#c08a5a'],
              [1, '#6a3a1a'],
            ],
            0,
            412,
            0,
            432
          )
        ),
        line: '#1a0a02',
      }
    )
    if (far) p.shape(boot, { fill: '#100600', opacity: 0.25 })
  })

  // leather tunic with a belt and a short skirt
  const tunic = blob([
    [184, 224],
    [262, 224],
    [276, 290],
    [280, 352],
    [288, 384, 0],
    [240, 378],
    [196, 384, 0],
    [174, 352],
    [176, 290],
  ])
  p.part(tunic, {
    fill: leather,
    line: leatherLine,
    shade: '#2a1406',
    depth: 0.55,
    light: '#f0c890',
    offset: 16,
  })
  // laces down the front
  p.shape(
    curve([
      [234, 240],
      [236, 320],
    ]),
    { line: '#3a1e08', width: 3 }
  )
  ;[252, 272, 292, 312].forEach((y) =>
    p.shape(
      curve([
        [226, y],
        [244, y + 6],
      ]),
      { line: '#f0d8a8', width: 2.5 }
    )
  )
  p.part(
    blob(
      [
        [176, 330],
        [282, 326],
        [284, 346],
        [176, 350],
      ],
      0.4
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#5a3418'],
            [1, '#2a1406'],
          ],
          0,
          326,
          0,
          350
        )
      ),
      line: '#120600',
    }
  )
  p.part(
    blob(
      [
        [220, 326],
        [242, 326],
        [244, 350],
        [218, 350],
      ],
      0.3
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#f0f0f8'],
            [1, '#7a82a0'],
          ],
          0,
          326,
          0,
          350
        )
      ),
      line: '#2a2e44',
    }
  )

  // longbow held out in front, the string drawn taut
  const bowFill = p.paint(
    linearAt(
      [
        [0, '#e0a868'],
        [0.5, '#9a5a28'],
        [1, '#4a240a'],
      ],
      300,
      0,
      350,
      0
    )
  )
  const bow = `${curve([
    [300, 118],
    [342, 200],
    [352, 300],
    [338, 400],
    [300, 480],
  ])}${curve([
    [300, 480],
    [328, 400],
    [340, 300],
    [330, 200],
    [300, 118],
  ]).replace('M', 'L')}Z`
  p.shape(bow, { fill: bowFill, line: '#2a1204', width: 3 })
  p.shape(
    curve([
      [300, 118],
      [300, 480],
    ]),
    { line: '#f4f0e8', width: 1.8, opacity: 0.9 }
  )
  // grip wrapped in red
  p.part(
    blob(
      [
        [332, 282],
        [350, 282],
        [352, 320],
        [332, 320],
      ],
      0.4
    ),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#ff6a5a'],
            [1, '#8a1a1a'],
          ],
          0,
          282,
          0,
          320
        )
      ),
      line: '#3a0606',
    }
  )

  // arms: the far one hidden by the body, the near one reaching out to hold the bow
  const arm = blob([
    [252, 232],
    [282, 244],
    [318, 286],
    [340, 290],
    [342, 312],
    [314, 316],
    [276, 294],
    [256, 270],
  ])
  p.part(arm, {
    fill: green,
    line: greenLine,
    shade: '#04200c',
    depth: 0.55,
    light: '#c0f0a0',
    offset: 10,
  })
  p.part(
    blob([
      [328, 286],
      [350, 284],
      [356, 306],
      [340, 318],
      [326, 308],
    ]),
    {
      fill: p.paint(
        linearAt(
          [
            [0, '#fff1e4'],
            [1, '#e0a080'],
          ],
          326,
          284,
          356,
          318
        )
      ),
      line: '#8a4a30',
    }
  )
  // bracer
  p.part(
    blob(
      [
        [300, 280],
        [322, 286],
        [320, 310],
        [298, 304],
      ],
      0.5
    ),
    { fill: leather, line: leatherLine }
  )

  // red scarf wrapped around the neck, its end flying back
  const scarfFill = p.paint(
    linearAt(
      [
        [0, '#ff8a6a'],
        [0.5, '#e0342a'],
        [1, '#7a0a0e'],
      ],
      180,
      200,
      260,
      260
    )
  )
  p.part(
    blob([
      [196, 226],
      [208, 246],
      [176, 270],
      [140, 312, 0],
      [128, 300],
      [150, 266],
      [178, 236],
    ]),
    {
      fill: scarfFill,
      line: '#4a0408',
      shade: '#3a0004',
      offset: 8,
    }
  )
  p.part(
    blob([
      [190, 212],
      [264, 210],
      [270, 236],
      [226, 250],
      [186, 240],
    ]),
    {
      fill: scarfFill,
      line: '#4a0408',
      shade: '#3a0004',
      light: '#ffc0a8',
      offset: 8,
    }
  )

  // hood, back part behind the face
  const hoodBack = blob([
    [154, 200],
    [144, 140],
    [168, 82],
    [224, 56],
    [282, 70],
    [314, 120],
    [304, 168],
    [284, 140],
    [230, 116],
    [182, 150],
    [182, 206],
  ])
  p.part(hoodBack, {
    fill: green,
    line: greenLine,
    shade: '#04200c',
    depth: 0.6,
    light: '#c0f0a0',
    offset: 16,
  })

  faceRight(p, 234, 158, {
    iris: ['#4a2408', '#a8662a', '#f4d090', '#2a1004'],
    brow: '#5a2e10',
  })

  // chestnut bangs under the hood
  const hairFill = p.paint(
    linearAt(
      [
        [0, '#d89060'],
        [0.4, '#9a5228'],
        [1, '#4a200a'],
      ],
      180,
      90,
      260,
      170
    )
  )
  const bangs = blob(
    [
      [176, 140],
      [190, 104],
      [236, 92],
      [286, 104],
      [300, 140, 0],
      [282, 126],
      [276, 150, 0],
      [258, 122],
      [244, 150, 0],
      [228, 120],
      [212, 148, 0],
      [200, 126],
      [188, 168, 0],
    ],
    0.9
  )
  p.part(bangs, {
    fill: hairFill,
    line: '#2a1004',
    shade: '#2a0e02',
    depth: 0.5,
    light: '#f0b888',
    glow: 0.4,
    offset: 10,
  })
  strands(
    p,
    bangs,
    [
      [[236, 98], [232, 142], 4, 0.05],
      [[266, 104], [272, 140], 4, -0.05],
    ],
    '#2a1004',
    0.45
  )
  hairSheen(
    p,
    bangs,
    [
      [194, 118],
      [236, 102],
      [280, 112],
    ],
    '#ffd8b8',
    8,
    0.7
  )

  // hood rim framing the face
  const hoodRim = blob([
    [150, 200],
    [140, 136],
    [172, 76],
    [232, 50],
    [292, 66],
    [322, 116],
    [312, 128],
    [282, 90],
    [232, 76],
    [186, 98],
    [166, 148],
    [178, 204],
  ])
  p.part(hoodRim, {
    fill: green,
    line: greenLine,
    shade: '#04200c',
    depth: 0.5,
    light: '#d8ffc0',
    glow: 0.55,
    offset: 10,
  })
  p.add(
    `<path d="${curve([
      [190, 112],
      [234, 98],
      [284, 108],
    ])}" fill="none" stroke="#2a3a1a" stroke-width="10" opacity="0.3" filter="${p.blur(6)}"/>`
  )

  return p.toString()
}
