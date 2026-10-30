// Battle backdrop: a meadow at the edge of a forest under a summer sky, distant snowy mountains,
// a dirt path between the two sides. Light comes from the upper left, like on the sprites.
// Painted as an SVG with procedural details (trees, grass tufts, flowers), rendered to 320x160
import { seeded, scene } from './lib/paint.mjs'

export default function () {
  const r = seeded(7)
  const W = 320
  const H = 160
  const HORIZON = 60
  const parts = []
  const add = (s) => parts.push(s)

  // ---- sky ----
  add(`<rect width="${W}" height="${HORIZON + 4}" fill="url(#sky)"/>`)

  // ---- cumulus clouds: billowing domes with a flat base, lit from the upper left ----
  let clouds = 0
  const cloud = (cx, cy, w, h) => {
    const puffs = []
    const n = Math.round(w / 2.2)
    for (let i = 0; i < n; i++) {
      const u = (r() - 0.5) * 2
      const x = cx + u * w * 0.5
      const dome = 1 - u * u
      const rr = h * (0.18 + dome * 0.3 * (0.5 + r()))
      puffs.push([x, cy - rr * 0.4 - r() * dome * h * 0.55, rr])
    }
    puffs.sort((a, b) => a[1] - b[1])
    const id = `cloudbase${clouds++}`
    let s = `<clipPath id="${id}"><rect x="${cx - w}" y="${cy - h * 2}" width="${w * 2}" height="${h * 2 + 1.5}"/></clipPath>`
    s += `<g filter="url(#soft)" clip-path="url(#${id})">`
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${x}" cy="${y + rr * 0.25}" r="${rr}" fill="#9fb2d8"/>`
    })
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${x - rr * 0.12}" cy="${y - rr * 0.1}" r="${rr * 0.88}" fill="#d6e2f6"/>`
    })
    puffs.forEach(([x, y, rr]) => {
      s += `<circle cx="${x - rr * 0.32}" cy="${y - rr * 0.36}" r="${rr * 0.52}" fill="#ffffff"/>`
    })
    return s + '</g>'
  }
  add(cloud(62, 24, 76, 18))
  add(cloud(252, 18, 96, 20))
  add(cloud(160, 38, 40, 9))
  add(cloud(304, 42, 28, 7))
  add(cloud(4, 44, 26, 6))

  // ---- distant mountains: lit left faces, shaded right faces, snow caps ----
  const range = (baseY, peaks, height, lit, shade, snow, haze) => {
    let s = ''
    peaks.forEach(([px, ph, pw]) => {
      const top = baseY - ph * height
      const left = px - pw
      const right = px + pw * (0.9 + r() * 0.4)
      s += `<path d="M${left} ${baseY} L${px} ${top} L${right} ${baseY} Z" fill="${shade}"/>`
      // the lit face, with a ragged ridge line down the middle
      const midX = px + pw * 0.15
      s += `<path d="M${left} ${baseY} L${px} ${top} L${midX} ${top + ph * height * 0.35} L${px - pw * 0.05} ${top + ph * height * 0.6} L${px + pw * 0.2} ${baseY} Z" fill="${lit}"/>`
      if (snow) {
        const sy = top + ph * height * 0.28
        s += `<path d="M${px - pw * 0.28} ${sy} L${px} ${top} L${px + pw * 0.3} ${sy + 1} L${px + pw * 0.12} ${sy - 1.5} L${px + 0.5} ${sy + 2} L${px - pw * 0.12} ${sy - 1} Z" fill="${snow}"/>`
      }
    })
    s += `<rect x="0" y="${baseY - 6}" width="${W}" height="8" fill="${haze}" opacity="0.55"/>`
    return s
  }
  add(
    range(
      HORIZON - 8,
      [
        [20, 0.7, 30],
        [78, 1, 38],
        [130, 0.6, 26],
        [196, 0.85, 34],
        [262, 1.1, 40],
        [318, 0.7, 30],
      ],
      30,
      '#a7b9de',
      '#8399c6',
      '#f2f6ff',
      '#c4d4ee'
    )
  )
  add(
    range(
      HORIZON - 4,
      [
        [-6, 0.5, 30],
        [48, 0.55, 30],
        [104, 0.4, 24],
        [160, 0.6, 34],
        [226, 0.45, 28],
        [290, 0.6, 34],
      ],
      22,
      '#7f9ec0',
      '#6684ad',
      null,
      '#a9c2dc'
    )
  )

  // ---- forest line on the horizon: leafy crowns made of a few billows, with pines in between,
  // darker toward the back ----
  const forest = (baseY, count, size, tones, pines) => {
    let s = `<rect x="0" y="${baseY - size * 0.6}" width="${W}" height="${size * 1.2}" fill="${tones[0]}"/>`
    const crowns = []
    const conifers = []
    for (let i = 0; i < count; i++) {
      const x = (i / count) * (W + 20) - 10 + r() * 6
      const rr = size * (0.55 + r() * 0.5)
      const y = baseY - rr * 0.9 - r() * size * 0.5
      if (r() < pines) {
        conifers.push([x, baseY, rr * 2.6])
        continue
      }
      // a crown is a cluster of three billows
      crowns.push([x, y, rr])
      crowns.push([x - rr * 0.6, y + rr * 0.35, rr * 0.7])
      crowns.push([x + rr * 0.6, y + rr * 0.3, rr * 0.75])
    }
    conifers.forEach(([x, base, h]) => {
      const w = h * 0.32
      s += `<path d="M${x} ${base - h} L${x + w} ${base} L${x - w} ${base} Z" fill="${tones[0]}"/>`
      s += `<path d="M${x} ${base - h} L${x + w * 0.1} ${base - h * 0.2} L${x - w * 0.85} ${base - h * 0.05} Z" fill="${tones[1]}"/>`
      s += `<path d="M${x} ${base - h} L${x - w * 0.05} ${base - h * 0.55} L${x - w * 0.45} ${base - h * 0.45} Z" fill="${tones[2]}"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="${tones[0]}"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${x - rr * 0.2}" cy="${y - rr * 0.2}" r="${rr * 0.78}" fill="${tones[1]}"/>`
    })
    crowns.forEach(([x, y, rr]) => {
      s += `<circle cx="${x - rr * 0.38}" cy="${y - rr * 0.42}" r="${rr * 0.4}" fill="${tones[2]}"/>`
    })
    return s
  }
  add(forest(HORIZON - 3, 40, 6, ['#3c6a5a', '#4e7e62', '#6a9670'], 0.35))
  add(forest(HORIZON + 1, 30, 7.5, ['#22503a', '#2f6640', '#4a8448'], 0.15))

  // ---- meadow: hazy in the distance, rich green in front, mottled with sunlight and shade ----
  add(
    `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#meadow)"/>`
  )
  add(
    `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" filter="url(#mottle)"/>`
  )
  // perspective bands, closer together toward the horizon
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9
    const y = HORIZON + 2 + (H - HORIZON) * t * t
    const h = 1 + t * 7
    add(
      `<rect y="${y}" width="${W}" height="${h}" fill="#3e7a2a" opacity="${0.12 + t * 0.1}"/>`
    )
  }

  // ---- dirt path winding from the front to the horizon, between the two parties ----
  const path = `M136 ${H} C146 136 176 124 170 108 C164 94 146 88 152 78 C156 70 166 66 162 ${HORIZON + 1}
    L166 ${HORIZON + 1} C172 66 164 72 162 78 C158 88 180 94 186 108 C194 126 170 140 186 ${H} Z`
  add(`<path d="${path}" fill="#7e6038"/>`)
  add(
    `<path d="${path}" fill="url(#dirt)" transform="translate(1.2 -0.6) scale(0.992 1)"/>`
  )
  for (let i = 0; i < 40; i++) {
    // pebbles, bigger toward the front
    const t = r()
    const y = HORIZON + 4 + t * t * (H - HORIZON - 4)
    const x = 158 + (r() - 0.5) * (6 + t * t * 40) + (t < 0.5 ? 6 : 0)
    const s = 0.3 + t * 1.2
    add(
      `<ellipse cx="${x}" cy="${y}" rx="${s * 1.3}" ry="${s * 0.8}" fill="#e2c898"/>`
    )
    add(
      `<ellipse cx="${x + s * 0.4}" cy="${y + s * 0.4}" rx="${s * 1.1}" ry="${s * 0.5}" fill="#8a6a40" opacity="0.8"/>`
    )
  }

  // ---- rocks and bushes at the sides ----
  const rock = (x, y, s) =>
    `<ellipse cx="${x + s * 0.3}" cy="${y + s * 0.55}" rx="${s * 1.4}" ry="${s * 0.45}" fill="#2a4a20" opacity="0.6"/>` +
    `<path d="M${x - s} ${y + s * 0.4} C${x - s} ${y - s * 0.4} ${x - s * 0.3} ${y - s * 0.8} ${x + s * 0.2} ${y - s * 0.7} C${x + s * 0.9} ${y - s * 0.6} ${x + s * 1.1} ${y} ${x + s} ${y + s * 0.45} Z" fill="#6a7088"/>` +
    `<path d="M${x - s * 0.85} ${y + s * 0.1} C${x - s * 0.8} ${y - s * 0.4} ${x - s * 0.3} ${y - s * 0.75} ${x + s * 0.1} ${y - s * 0.62} C${x + s * 0.3} ${y - s * 0.2} ${x - s * 0.2} ${y} ${x - s * 0.85} ${y + s * 0.1} Z" fill="#a8b0c4"/>`
  const bush = (x, y, s, tones) => {
    let b = `<ellipse cx="${x + s * 0.2}" cy="${y + s * 0.3}" rx="${s * 1.5}" ry="${s * 0.4}" fill="#24461c" opacity="0.6"/>`
    const balls = [
      [-0.8, -0.2, 0.7],
      [0, -0.6, 0.85],
      [0.8, -0.15, 0.7],
    ]
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${x + bx * s}" cy="${y + by * s}" r="${br * s}" fill="${tones[0]}"/>`
    })
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${x + bx * s - br * s * 0.2}" cy="${y + by * s - br * s * 0.25}" r="${br * s * 0.7}" fill="${tones[1]}"/>`
    })
    balls.forEach(([bx, by, br]) => {
      b += `<circle cx="${x + bx * s - br * s * 0.4}" cy="${y + by * s - br * s * 0.45}" r="${br * s * 0.3}" fill="${tones[2]}"/>`
    })
    return b
  }
  const leaves = ['#2a5a26', '#3e7e30', '#68a848']
  add(bush(14, HORIZON + 6, 3.2, leaves))
  add(bush(300, HORIZON + 8, 3.6, leaves))
  add(bush(124, HORIZON + 10, 2.4, leaves))
  add(rock(206, HORIZON + 7, 2.2))
  add(rock(96, HORIZON + 4, 1.6))
  add(rock(6, 148, 7))
  add(rock(312, 140, 5))

  // ---- grass tufts and flowers, larger toward the front ----
  for (let i = 0; i < 420; i++) {
    const t = Math.sqrt(r())
    const y = HORIZON + 3 + t * (H - HORIZON - 3)
    const x = r() * W
    if (x > 140 && x < 192 && y > HORIZON + 20) continue // keep off the path
    const s = 0.5 + t * t * 3.2
    const dark = r() < 0.55
    const c = dark ? '#2c6222' : '#78b850'
    add(
      `<path d="M${x - s * 0.6} ${y - s * 0.9} L${x} ${y} L${x + s * 0.1} ${y - s * 1.2} L${x + 0.25 * s} ${y} L${x + s * 0.7} ${y - s * 0.8} L${x + s * 0.4} ${y + 0.2} Z" fill="${c}"/>`
    )
  }
  const flowerColors = ['#ffffff', '#ffe060', '#ff9ab8', '#b8a0ff']
  for (let i = 0; i < 90; i++) {
    const t = Math.sqrt(r())
    const y = HORIZON + 4 + t * (H - HORIZON - 4)
    const x = r() * W
    if (x > 140 && x < 192 && y > HORIZON + 20) continue
    const s = 0.35 + t * 0.9
    const c = flowerColors[Math.floor(r() * flowerColors.length)]
    add(`<circle cx="${x}" cy="${y}" r="${s}" fill="${c}"/>`)
  }

  return scene(
    W,
    H,
    `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c58b8"/><stop offset="0.55" stop-color="#5e94dc"/>
      <stop offset="0.85" stop-color="#a6d0f0"/><stop offset="1" stop-color="#dcecf2"/>
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9cc074"/><stop offset="0.25" stop-color="#78ae4c"/>
      <stop offset="0.7" stop-color="#5a9a38"/><stop offset="1" stop-color="#4a8a2e"/>
    </linearGradient>
    <linearGradient id="dirt" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="#d8b880"/><stop offset="0.6" stop-color="#c09a62"/><stop offset="1" stop-color="#a88250"/>
    </linearGradient>
    <filter id="soft" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="0.5"/></filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.12" numOctaves="3" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.36  0 0 0 0 0.1  2.6 0 0 0 -1.25"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    `,
    parts.join('\n')
  )
}
