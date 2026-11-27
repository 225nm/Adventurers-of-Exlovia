// Battle backdrop: a meadow among old ruins at the edge of a forest, under a summer sky with towering
// clouds, layered mountain ranges fading into the haze and a castle on a far hill. Light comes from
// the upper left, like on the sprites, and pools on the grass where the fight takes place.
// Painted as an SVG with procedural details. Depth comes from aerial perspective (far layers paler,
// bluer and softer) and out-of-focus leaves framing the top corners, like a camera's shallow focus.
// It spans the whole screen width (426.67 layout units), the 320 wide middle lines up with the
// battle layout
import { seeded, scene } from './scene'
import { HD } from '../../hd'

// The ground line the fight stands on starts at the horizon
export const BATTLE_HORIZON = 66

export const battlefield = () => {
  const r = seeded(7)
  const W = HD.VIEW_W
  const H = 240
  // the layout's left edge, in the painting
  const X = HD.OFFSET_X
  const HORIZON = BATTLE_HORIZON
  const parts = []
  const add = (s) => parts.push(s)
  const f = (n) => Math.round(n * 100) / 100

  // A ridge line by midpoint displacement: points from x0 to x1 around baseY, rougher with rough
  const ridge = (x0, x1, baseY, amp, rough, levels = 7) => {
    let pts = [
      [x0, baseY - r() * amp],
      [x1, baseY - r() * amp],
    ]
    let spread = amp
    for (let l = 0; l < levels; l++) {
      const next = [pts[0]]
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1]
        const [bx, by] = pts[i]
        next.push([(ax + bx) / 2, (ay + by) / 2 + (r() - 0.5) * spread])
        next.push(pts[i])
      }
      pts = next
      spread *= rough
    }
    return pts
  }
  // A ridge through anchor points [x, y], with fractal detail between them
  const ridgeFrom = (anchors, rough, detail, levels = 5) => {
    let pts = anchors
    let spread = detail
    for (let l = 0; l < levels; l++) {
      const next = [pts[0]]
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1]
        const [bx, by] = pts[i]
        next.push([(ax + bx) / 2, (ay + by) / 2 + (r() - 0.5) * spread])
        next.push(pts[i])
      }
      pts = next
      spread *= rough
    }
    return pts
  }
  const poly = (pts, bottom) =>
    `M${f(pts[0][0])} ${bottom} ` +
    pts.map(([x, y]) => `L${f(x)} ${f(y)}`).join(' ') +
    ` L${f(pts[pts.length - 1][0])} ${bottom} Z`

  // ---- sky: deep blue overhead, warm haze at the horizon, the sun's glow at the upper left ----
  add(`<rect width="${W}" height="${HORIZON + 6}" fill="url(#sky)"/>`)
  add(
    `<ellipse cx="${X + 40}" cy="-10" rx="190" ry="90" fill="url(#sunglow)"/>`
  )

  // ---- towering cumulus: billows with warm lit tops and blue-grey undersides, softly painted ----
  let clouds = 0
  const cloud = (cx, cy, w, h, alpha = 1) => {
    const puffs = []
    const n = Math.round(w / 1.8)
    for (let i = 0; i < n; i++) {
      const u = (r() - 0.5) * 2
      const x = cx + u * w * 0.5
      const dome = 1 - u * u
      const rr = h * (0.16 + dome * 0.32 * (0.5 + r()))
      puffs.push([x, cy - rr * 0.35 - r() * dome * h * 0.7, rr])
    }
    puffs.sort((a, b) => a[1] - b[1])
    const id = `cloudbase${clouds++}`
    let s = `<clipPath id="${id}"><rect x="${cx - w}" y="${cy - h * 3}" width="${w * 2}" height="${h * 3 + 1.2}"/></clipPath>`
    s += `<g clip-path="url(#${id})" opacity="${alpha}"><g filter="url(#cloudpaint)">`
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x)}" cy="${f(y + rr * 0.25)}" r="${f(rr)}" fill="#8e9fc6"/>`
    })
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x - rr * 0.12)}" cy="${f(y - rr * 0.1)}" r="${f(rr * 0.86)}" fill="#cbd6ee"/>`
    })
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x - rr * 0.3)}" cy="${f(y - rr * 0.34)}" r="${f(rr * 0.56)}" fill="#fff8ea"/>`
    })
    return s + '</g></g>'
  }
  add(cloud(X + 250, 34, 110, 30))
  add(cloud(X + 40, 30, 80, 20))
  add(cloud(X + 150, 44, 46, 10, 0.9))
  add(cloud(X - 30, 46, 40, 9, 0.85))
  add(cloud(X + 370, 44, 50, 12, 0.85))
  // thin high streaks
  add(
    `<g filter="url(#blur1)" opacity="0.5">` +
      [...Array(7)]
        .map(
          () =>
            `<ellipse cx="${f(r() * W)}" cy="${f(4 + r() * 16)}" rx="${f(20 + r() * 30)}" ry="${f(0.6 + r() * 0.8)}" fill="#ffffff"/>`
        )
        .join('') +
      '</g>'
  )

  // ---- mountain ranges, each nearer one darker and sharper, snow on the far peaks ----
  // peaks: [x, height] pairs, valleys fall between them
  const range = (
    baseY,
    peaks,
    amp,
    rough,
    fill,
    snow,
    blur,
    rock,
    hazeAlpha
  ) => {
    const anchors = []
    peaks.forEach(([x, h], i) => {
      if (i > 0) {
        const [px, ph] = peaks[i - 1]
        anchors.push([
          (px + x) / 2 + (r() - 0.5) * 8,
          baseY - Math.min(ph, h) * amp * (0.25 + r() * 0.3),
        ])
      }
      anchors.push([x, baseY - h * amp])
    })
    const pts = ridgeFrom(anchors, rough, amp * 0.35)
    const id = `range${baseY}`
    let s = `<clipPath id="${id}"><path d="${poly(pts, baseY + 8)}"/></clipPath>`
    s += `<g filter="url(#${blur})">`
    s += `<path d="${poly(pts, baseY + 8)}" fill="${fill}"/>`
    s += `<g clip-path="url(#${id})">`
    // rocky texture and the light on the left faces of the peaks
    s += `<rect width="${W}" height="${baseY + 8}" filter="url(#${rock})" opacity="0.8"/>`
    if (snow) {
      // snowfields above a ragged line, patchy where the rock shows through
      const line = ridge(-10, W + 10, baseY - amp * 0.55, amp * 0.16, 0.55, 7)
      s += `<path d="M-10 -10 L${W + 10} -10 ${line
        .slice()
        .reverse()
        .map(([x, y]) => `L${f(x)} ${f(y)}`)
        .join(' ')} Z" fill="url(#snow)" filter="url(#snowpatch)"/>`
    }
    s += `<rect y="${baseY - amp * 0.5}" width="${W}" height="${amp * 0.5 + 8}" fill="url(#haze)" opacity="${hazeAlpha}"/>`
    // light on the faces turned to the sun: a band left of each peak
    peaks.forEach(([x, h]) => {
      const top = baseY - h * amp
      s += `<path d="M${f(x)} ${f(top - 2)} L${f(x - h * amp * 0.9)} ${baseY + 4} L${f(x - h * amp * 0.25)} ${baseY + 4} L${f(x + 1.5)} ${f(top + h * amp * 0.3)} Z" fill="#ffffff" opacity="0.16" filter="url(#blur1)"/>`
    })
    s += '</g></g>'
    return s
  }
  add(
    range(
      HORIZON - 6,
      [
        [-20, 0.7],
        [30, 1],
        [96, 0.62],
        [150, 0.85],
        [222, 1.25],
        [292, 0.8],
        [352, 1.05],
        [420, 0.75],
      ].map(([x, h]) => [x + X - 20, h]),
      42,
      0.55,
      '#8ea4d0',
      true,
      'blur06',
      'rockfar',
      0.8
    )
  )
  add(
    range(
      HORIZON - 2,
      [
        [-40, 0.6],
        [10, 0.9],
        [70, 0.5],
        [120, 0.8],
        [190, 0.55],
        [250, 0.95],
        [320, 0.6],
        [380, 0.85],
        [440, 0.6],
      ].map(([x, h]) => [x + X - 20, h]),
      24,
      0.55,
      '#6a86b2',
      false,
      'blur04',
      'rockmid',
      0.6
    )
  )

  // a castle on a far hill, pale in the haze
  const cx = X + 66
  const cy = HORIZON - 20
  add(
    `<g fill="#7486b4" filter="url(#blur04)">` +
      `<path d="M${cx - 26} ${cy + 12} C${cx - 14} ${cy + 2} ${cx + 10} ${cy + 1} ${cx + 28} ${cy + 12} Z"/>` +
      `<rect x="${cx - 8}" y="${cy - 5}" width="16" height="9"/>` +
      `<rect x="${cx - 11}" y="${cy - 9}" width="3.2" height="13"/>` +
      `<rect x="${cx + 7.8}" y="${cy - 8}" width="3.2" height="12"/>` +
      `<rect x="${cx - 2}" y="${cy - 15}" width="4" height="12"/>` +
      `<path d="M${cx - 11.6} ${cy - 9} L${cx - 9.4} ${cy - 13} L${cx - 7.2} ${cy - 9} Z"/>` +
      `<path d="M${cx + 7.2} ${cy - 8} L${cx + 9.4} ${cy - 12} L${cx + 11.6} ${cy - 8} Z"/>` +
      `<path d="M${cx - 2.6} ${cy - 15} L${cx} ${cy - 21} L${cx + 2.6} ${cy - 15} Z"/>` +
      `<path d="M${cx} ${cy - 21} L${cx} ${cy - 24} L${cx + 3} ${cy - 23} L${cx} ${cy - 22}" stroke="#7486b4" stroke-width="0.3" fill="#c04848"/>` +
      `</g>` +
      `<g fill="#fff2c0" opacity="0.8">` +
      `<rect x="${cx - 0.4}" y="${cy - 11}" width="0.8" height="1.2"/>` +
      `<rect x="${cx - 4.5}" y="${cy - 2}" width="0.8" height="1.2"/>` +
      `<rect x="${cx + 3.5}" y="${cy - 2}" width="0.8" height="1.2"/></g>`
  )
  // ---- forest along the horizon: rounded crowns lit from the upper left, darker toward the back,
  // with pines between them ----
  const forest = (baseY, count, size, tones, pines, blur) => {
    let s = `<g filter="url(#${blur})"><g filter="url(#leafy)"><rect x="0" y="${baseY - size * 0.5}" width="${W}" height="${size * 1.4}" fill="${tones[0]}"/>`
    const crowns = []
    const conifers = []
    for (let i = 0; i < count; i++) {
      const x = (i / count) * (W + 20) - 10 + r() * 6
      const rr = size * (0.55 + r() * 0.55)
      const y = baseY - rr * 0.9 - r() * size * 0.6
      if (r() < pines) {
        conifers.push([x, baseY + size * 0.2, rr * 2.8])
        continue
      }
      crowns.push([x, y, rr])
      crowns.push([x - rr * 0.62, y + rr * 0.38, rr * 0.7])
      crowns.push([x + rr * 0.6, y + rr * 0.32, rr * 0.76])
    }
    conifers.forEach(([x, base, h]) => {
      const w = h * 0.3
      // tiers of drooping boughs
      let d = ''
      for (let t = 0; t < 4; t++) {
        const top = base - h + (t * h) / 4.4
        const bw = w * (0.45 + t * 0.2)
        d += `M${f(x)} ${f(top)} Q${f(x + bw * 0.4)} ${f(top + h * 0.2)} ${f(x + bw)} ${f(top + h * 0.3)} L${f(x - bw)} ${f(top + h * 0.3)} Q${f(x - bw * 0.4)} ${f(top + h * 0.2)} ${f(x)} ${f(top)} Z `
      }
      s += `<path d="${d}" fill="${tones[0]}"/>`
      s += `<path d="M${f(x)} ${f(base - h)} L${f(x - w * 0.1)} ${f(base - h * 0.3)} L${f(x - w * 0.8)} ${f(base - h * 0.12)} Z" fill="${tones[1]}" opacity="0.8"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${tones[0]}"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x - rr * 0.2)}" cy="${f(y - rr * 0.2)}" r="${f(rr * 0.78)}" fill="${tones[1]}"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${f(x - rr * 0.38)}" cy="${f(y - rr * 0.42)}" r="${f(rr * 0.42)}" fill="${tones[2]}"/>`
    })
    return s + '</g></g>'
  }
  add(
    forest(
      HORIZON - 3,
      56,
      6.5,
      ['#4a7476', '#5c8a7e', '#7aa48a'],
      0.4,
      'blur04'
    )
  )
  add(
    forest(
      HORIZON + 1,
      44,
      8,
      ['#24503c', '#346a42', '#5a9450'],
      0.18,
      'blur02'
    )
  )
  // the forest's shade on the far edge of the field
  add(
    `<rect y="${HORIZON}" width="${W}" height="14" fill="url(#forestshade)"/>`
  )
  // mist pooling at the forest's feet
  add(
    `<rect y="${HORIZON - 4}" width="${W}" height="10" fill="url(#mist)" opacity="0.7"/>`
  )

  // ---- meadow: hazy in the distance, rich green in front, mottled with sunlight and shade ----
  add(
    `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#meadow)"/>`
  )
  add(
    `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" filter="url(#mottle)"/>`
  )
  // a fine grain of grass blades, coarser toward the front
  add(
    `<rect y="${HORIZON + 2}" width="${W}" height="${H - HORIZON}" filter="url(#grassgrain)" opacity="0.55"/>`
  )
  // big soft patches of light and shade drifting over the grass, flatter toward the horizon
  add(
    `<g filter="url(#blur4)" opacity="0.4">` +
      [...Array(18)]
        .map(() => {
          const t = r()
          return `<ellipse cx="${f(r() * W)}" cy="${f(HORIZON + 6 + t * t * (H - HORIZON))}" rx="${f(18 + t * 46)}" ry="${f(2 + t * 8)}" fill="${r() < 0.5 ? '#2a5e1e' : '#cce48a'}"/>`
        })
        .join('') +
      '</g>'
  )

  // ---- dirt path winding from the front to the horizon, between the two parties ----
  const path = `M136 ${H} C146 136 176 124 170 108 C164 94 146 88 152 80 C156 74 166 70 162 ${HORIZON + 1}
    L166 ${HORIZON + 1} C172 70 164 76 162 80 C158 90 180 94 186 108 C194 126 170 140 186 ${H} Z`
  add(
    `<g filter="url(#blur02)"><path d="${path}" fill="#6e5230" transform="translate(${X} 0)"/>` +
      `<path d="${path}" fill="url(#dirt)" transform="translate(${X + 1.2} -0.6) scale(0.992 1)"/></g>`
  )
  for (let i = 0; i < 46; i++) {
    // pebbles, bigger toward the front
    const t = r()
    const y = HORIZON + 4 + t * t * (H - HORIZON - 4)
    const x = X + 158 + (r() - 0.5) * (6 + t * t * 40) + (t < 0.5 ? 6 : 0)
    const s = 0.3 + t * 1.2
    add(
      `<ellipse cx="${f(x + s * 0.4)}" cy="${f(y + s * 0.4)}" rx="${f(s * 1.2)}" ry="${f(s * 0.55)}" fill="#5a4024" opacity="0.7"/>` +
        `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s * 1.2)}" ry="${f(s * 0.75)}" fill="#d8bc8a"/>`
    )
  }

  // ---- ruins of an old colonnade at the edges of the field ----
  const pillar = (x, baseY, w, h, broken) => {
    const id = `pillar${Math.round(x)}`
    let s = `<ellipse cx="${x + w * 0.4}" cy="${baseY + 1}" rx="${w * 1.6}" ry="${w * 0.35}" fill="#163012" opacity="0.5" filter="url(#blur1)"/>`
    // the broken top: a jagged line
    const top = baseY - h
    const jag = broken
      ? `L${x + w * 0.5} ${top} L${x + w * 0.2} ${top + w * 0.5} L${x - w * 0.15} ${top + w * 0.2} L${x - w * 0.5} ${top + w * 0.9}`
      : `L${x + w * 0.5} ${top} L${x - w * 0.5} ${top}`
    const shape = `M${x - w * 0.5} ${baseY} L${x + w * 0.5} ${baseY} ${jag} Z`
    s += `<clipPath id="${id}"><path d="${shape}"/></clipPath>`
    s += `<path d="${shape}" fill="url(#stone)"/>`
    s += `<g clip-path="url(#${id})">`
    // fluting: grooves down the shaft
    for (let k = -2; k <= 2; k++) {
      const gx = x + (k / 5) * w
      s += `<rect x="${gx - w * 0.04}" y="${top}" width="${w * 0.08}" height="${h}" fill="#3a3a4c" opacity="${0.3 + Math.abs(k) * 0.08}"/>`
    }
    s += `<rect x="${x - w * 0.5}" y="${top}" width="${w}" height="${h}" filter="url(#stonegrain)" opacity="0.5"/>`
    // shade on the right side
    s += `<rect x="${x + w * 0.1}" y="${top}" width="${w * 0.4}" height="${h}" fill="#1c1c34" opacity="0.4"/>`
    s += '</g>'
    // the base: two stepped blocks
    s += `<rect x="${x - w * 0.72}" y="${baseY - w * 0.5}" width="${w * 1.44}" height="${w * 0.5}" fill="url(#stone)"/>`
    s += `<rect x="${x - w * 0.72}" y="${baseY - w * 0.5}" width="${w * 1.44}" height="${w * 0.12}" fill="#e8e4f0" opacity="0.45"/>`
    s += `<rect x="${x + w * 0.2}" y="${baseY - w * 0.5}" width="${w * 0.52}" height="${w * 0.5}" fill="#1c1c34" opacity="0.35"/>`
    // ivy creeping up from the ground
    for (let k = 0; k < 26; k++) {
      const t = r()
      const ly = baseY - w * 0.3 - t * t * h * 0.8
      const lx = x + (r() - 0.6) * w * (1 - t * 0.4)
      const lr = 0.5 + r() * 0.7
      s += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="${f(lr)}" ry="${f(lr * 0.7)}" fill="${r() < 0.5 ? '#2e5e26' : '#5a9440'}"/>`
    }
    return s
  }
  // far, small and softened by the haze
  add(
    `<g filter="url(#blur02)" opacity="0.9">${pillar(X - 22, HORIZON + 14, 4, 22, true)}${pillar(X + 340, HORIZON + 12, 4, 16, true)}</g>`
  )
  // a fallen drum lying in the grass
  add(
    `<g><ellipse cx="${X + 352}" cy="${HORIZON + 41}" rx="12" ry="2" fill="#163012" opacity="0.45" filter="url(#blur1)"/>` +
      `<rect x="${X + 341}" y="${HORIZON + 33}" width="18" height="8" rx="1" fill="url(#stone)"/>` +
      `<ellipse cx="${X + 341}" cy="${HORIZON + 37}" rx="2.4" ry="4" fill="#cfcad8"/>` +
      `<ellipse cx="${X + 341}" cy="${HORIZON + 37}" rx="1.4" ry="2.6" fill="#a8a4b8"/></g>`
  )
  // near, tall pillars framing the field
  add(pillar(X - 36, HORIZON + 58, 9, 70, false))
  add(pillar(X + 366, HORIZON + 62, 10, 52, true))

  // ---- rocks and bushes ----
  const rock = (x, y, s) =>
    `<ellipse cx="${f(x + s * 0.3)}" cy="${f(y + s * 0.5)}" rx="${f(s * 1.5)}" ry="${f(s * 0.45)}" fill="#1e3a16" opacity="0.55" filter="url(#blur1)"/>` +
    `<path d="M${x - s} ${y + s * 0.4} C${x - s} ${y - s * 0.4} ${x - s * 0.3} ${y - s * 0.8} ${x + s * 0.2} ${y - s * 0.7} C${x + s * 0.9} ${y - s * 0.6} ${x + s * 1.1} ${y} ${x + s} ${y + s * 0.45} Z" fill="#5e6478"/>` +
    `<path d="M${x - s * 0.85} ${y + s * 0.1} C${x - s * 0.8} ${y - s * 0.4} ${x - s * 0.3} ${y - s * 0.75} ${x + s * 0.1} ${y - s * 0.62} C${x + s * 0.3} ${y - s * 0.2} ${x - s * 0.2} ${y} ${x - s * 0.85} ${y + s * 0.1} Z" fill="#a8b0c4"/>` +
    `<path d="M${x - s * 0.9} ${y + s * 0.3} C${x - s * 0.4} ${y + s * 0.1} ${x + s * 0.4} ${y + s * 0.2} ${x + s * 0.9} ${y + s * 0.4}" stroke="#4a8a34" stroke-width="${s * 0.25}" fill="none" opacity="0.8"/>`
  const bush = (x, y, s, tones) => {
    let b = `<ellipse cx="${f(x + s * 0.3)}" cy="${f(y + s * 0.3)}" rx="${f(s * 1.6)}" ry="${f(s * 0.4)}" fill="#1c3a16" opacity="0.55" filter="url(#blur1)"/>`
    const balls = [
      [-0.8, -0.2, 0.7],
      [0, -0.6, 0.85],
      [0.8, -0.15, 0.7],
      [-0.3, -0.1, 0.6],
    ]
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${f(x + bx * s)}" cy="${f(y + by * s)}" r="${f(br * s)}" fill="${tones[0]}"/>`
    })
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${f(x + bx * s - br * s * 0.2)}" cy="${f(y + by * s - br * s * 0.25)}" r="${f(br * s * 0.7)}" fill="${tones[1]}"/>`
    })
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${f(x + bx * s - br * s * 0.4)}" cy="${f(y + by * s - br * s * 0.45)}" r="${f(br * s * 0.3)}" fill="${tones[2]}"/>`
    })
    return b
  }
  const leaves = ['#244e22', '#3a782e', '#72b04c']
  add(bush(X - 14, HORIZON + 60, 5, leaves))
  add(bush(X + 14, HORIZON + 7, 3.2, leaves))
  add(bush(X + 300, HORIZON + 9, 3.6, leaves))
  add(bush(X + 384, HORIZON + 66, 5.2, leaves))
  add(bush(X + 124, HORIZON + 10, 2.4, leaves))
  add(rock(X + 206, HORIZON + 7, 2.2))
  add(rock(X + 96, HORIZON + 5, 1.6))
  add(rock(X - 10, 150, 7))
  add(rock(X + 330, 150, 6))

  // ---- grass tufts and flowers, larger toward the front ----
  for (let i = 0; i < 1500; i++) {
    const t = Math.sqrt(r())
    const y = HORIZON + 3 + t * (H - HORIZON - 3)
    const x = r() * W
    if (x > X + 140 && x < X + 192 && y > HORIZON + 20) continue // keep off the path
    const s = 0.5 + t * t * 3.4
    const tone = r()
    const c = tone < 0.45 ? '#285a1e' : tone < 0.8 ? '#4c8c32' : '#8cc85a'
    add(
      `<path d="M${f(x - s * 0.6)} ${f(y - s * 0.9)} Q${f(x - s * 0.1)} ${f(y - s * 0.3)} ${f(x)} ${f(y)} L${f(x + s * 0.1)} ${f(y - s * 1.3)} L${f(x + 0.25 * s)} ${f(y)} Q${f(x + s * 0.4)} ${f(y - s * 0.4)} ${f(x + s * 0.75)} ${f(y - s * 0.8)} L${f(x + s * 0.4)} ${f(y + 0.2)} Z" fill="${c}"/>`
    )
  }
  const flowerColors = ['#ffffff', '#ffe060', '#ff9ab8', '#b8a0ff']
  for (let i = 0; i < 140; i++) {
    const t = Math.sqrt(r())
    const y = HORIZON + 4 + t * (H - HORIZON - 4)
    const x = r() * W
    if (x > X + 140 && x < X + 192 && y > HORIZON + 20) continue
    const s = 0.35 + t * 0.9
    const c = flowerColors[Math.floor(r() * flowerColors.length)]
    add(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${c}"/>`)
  }

  // ---- light: shafts falling from the upper left, and a warm pool of sunlight on the field ----
  add(
    `<g filter="url(#blur3)" opacity="0.32" style="mix-blend-mode:screen">` +
      [0, 1, 2, 3, 4]
        .map((i) => {
          const x0 = X - 40 + i * 46 + r() * 14
          const w0 = 6 + r() * 10
          return `<path d="M${f(x0)} -4 L${f(x0 + w0)} -4 L${f(x0 + w0 + 110)} ${H * 0.7} L${f(x0 + 80)} ${H * 0.7} Z" fill="url(#ray)"/>`
        })
        .join('') +
      '</g>'
  )
  add(
    `<ellipse cx="${X + 165}" cy="${HORIZON + 62}" rx="200" ry="52" fill="url(#pool)" style="mix-blend-mode:soft-light"/>`
  )
  // the front of the field falls into shade
  add(
    `<rect y="${HORIZON + 70}" width="${W}" height="${H - HORIZON - 70}" fill="url(#frontshade)"/>`
  )

  // ---- out of focus leaves hanging into the top corners ----
  const bough = (x, y, dir, n) => {
    let s = ''
    for (let i = 0; i < n; i++) {
      const t = i / n
      const lx = x + dir * (t * 70 + r() * 12)
      const ly = y + Math.sin(t * 2.4) * 22 + r() * 14 - 4
      const rot = (dir > 0 ? 30 : -30) + (r() - 0.5) * 90
      const lr = 5 + r() * 4 - t * 2
      s += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="${f(lr)}" ry="${f(lr * 0.42)}" transform="rotate(${f(rot)} ${f(lx)} ${f(ly)})" fill="${r() < 0.6 ? '#10260e' : '#1e3e16'}"/>`
    }
    return s
  }
  add(
    `<g filter="url(#blur25)" opacity="0.92">${bough(-8, 2, 1, 26)}${bough(-6, 26, 1, 12)}${bough(W + 8, -2, -1, 22)}</g>`
  )
  // sunlight catching the edge of a few of them
  add(
    `<g filter="url(#blur25)" opacity="0.35">${bough(4, 0, 1, 6).replace(/fill="#[0-9a-f]+"/g, 'fill="#9ac870"')}</g>`
  )

  return scene(
    W,
    H,
    `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1e4aa8"/><stop offset="0.45" stop-color="#4a86d4"/>
      <stop offset="0.8" stop-color="#9ccaf0"/><stop offset="1" stop-color="#f0ead8"/>
    </linearGradient>
    <radialGradient id="sunglow">
      <stop offset="0" stop-color="#fffbe8" stop-opacity="0.85"/>
      <stop offset="0.4" stop-color="#fff0c8" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#fff0c8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="snow" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d4f0"/>
    </linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d6e2f4" stop-opacity="0"/><stop offset="1" stop-color="#e2ecf6" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6f0f0" stop-opacity="0"/><stop offset="0.5" stop-color="#e6f0f0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#e6f0f0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a8c47c"/><stop offset="0.2" stop-color="#80b250"/>
      <stop offset="0.6" stop-color="#5c9a38"/><stop offset="1" stop-color="#3c7a28"/>
    </linearGradient>
    <linearGradient id="dirt" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="#dcbc84"/><stop offset="0.6" stop-color="#bc9660"/><stop offset="1" stop-color="#9a764a"/>
    </linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0" stop-color="#e4e0ec"/><stop offset="0.45" stop-color="#b4b0c4"/><stop offset="1" stop-color="#6e6c88"/>
    </linearGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6d0" stop-opacity="1"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="pool">
      <stop offset="0" stop-color="#fff2b0" stop-opacity="0.9"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="frontshade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0e2410" stop-opacity="0"/><stop offset="1" stop-color="#0e2410" stop-opacity="0.45"/>
    </linearGradient>
    <filter id="blur02" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.2"/></filter>
    <filter id="blur04" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.4"/></filter>
    <filter id="blur06" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.6"/></filter>
    <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="blur25" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="cloudpaint" x="-20%" y="-40%" width="140%" height="180%">
      <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="0.55"/>
    </filter>
    <filter id="snowpatch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.25 0.5" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.4 -0.6" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
    <filter id="rockfar" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06 0.2" numOctaves="3" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.9  0 0 0 0 1  2.4 0 0 0 -1.2"/>
    </filter>
    <filter id="rockmid" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.07 0.22" numOctaves="3" seed="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.38  0 0 0 0 0.55  2.4 0 0 0 -1.15"/>
    </filter>
    <filter id="stonegrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.22  0 0 0 0 0.3  2 0 0 0 -0.9"/>
    </filter>
    <filter id="leafy" x="-5%" y="-30%" width="110%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="6" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="grassgrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.16" numOctaves="2" seed="8"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.3  0 0 0 0 0.08  0 0 0 -3 1.4"/>
    </filter>
    <linearGradient id="forestshade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16341a" stop-opacity="0.6"/><stop offset="1" stop-color="#16341a" stop-opacity="0"/>
    </linearGradient>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.12" numOctaves="3" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.32  0 0 0 0 0.08  2.6 0 0 0 -1.25"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    `,
    parts.join('\n')
  )
}
