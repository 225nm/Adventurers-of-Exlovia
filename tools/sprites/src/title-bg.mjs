// Title backdrop: a castle on a crag above a misty valley under a full moon, stars and drifting clouds,
// mountains fading into the night, rocky outcrops in the foreground where the two heroes stand.
// Painted as an SVG with procedural stars, ridges and trees, rendered to 320x240
import { seeded, scene } from './lib/paint.mjs'

export default function () {
  const r = seeded(1987)
  const W = 320
  const H = 240
  const parts = []
  const add = (s) => parts.push(s)

  // ---- night sky, a warm glow low on the horizon ----
  add(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`)
  // stars, a few bright ones with a glint
  for (let i = 0; i < 170; i++) {
    const x = r() * W
    const y = Math.pow(r(), 1.6) * 150
    const s = 0.3 + r() * 0.45
    const c = r() < 0.25 ? '#ffe8c0' : r() < 0.5 ? '#c8d4ff' : '#ffffff'
    add(
      `<circle cx="${x}" cy="${y}" r="${s}" fill="${c}" opacity="${0.55 + r() * 0.45}"/>`
    )
  }
  for (let i = 0; i < 9; i++) {
    const x = 10 + r() * 300
    const y = 6 + r() * 70
    add(
      `<path d="M${x} ${y - 2.6} L${x + 0.5} ${y - 0.5} L${x + 2.6} ${y} L${x + 0.5} ${y + 0.5} L${x} ${y + 2.6} L${x - 0.5} ${y + 0.5} L${x - 2.6} ${y} L${x - 0.5} ${y - 0.5} Z" fill="#ffffff"/>`
    )
  }

  // ---- full moon with a halo and soft maria ----
  add(`<circle cx="276" cy="98" r="40" fill="url(#halo)"/>`)
  add(`<circle cx="276" cy="98" r="19" fill="url(#moon)"/>`)
  add(
    `<path d="M266 90 C270 86 276 88 276 92 C276 96 270 98 267 96 Z M280 102 C284 100 288 102 287 106 C285 109 280 108 280 102 Z M272 106 C274 105 276 106 275 108 Z" fill="#d8ccb0" opacity="0.8"/>`
  )

  // ---- long clouds lit by the moon from above ----
  const band = (x, y, w, h) => {
    let s = `<g filter="url(#soft)">`
    for (let i = 0; i < w / 6; i++) {
      const cx = x + r() * w
      const cy = y + (r() - 0.5) * h
      const rr = h * (0.4 + r() * 0.5)
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rr * 2.4}" ry="${rr}" fill="#3a2c6a" opacity="0.9"/>`
      s += `<ellipse cx="${cx - 1}" cy="${cy - rr * 0.4}" rx="${rr * 1.8}" ry="${rr * 0.5}" fill="#7a6aaa" opacity="0.8"/>`
    }
    return s + '</g>'
  }
  add(band(150, 66, 120, 5))
  add(band(-10, 40, 90, 4))
  add(band(200, 92, 130, 4))

  // ---- mountain ranges fading into the distance ----
  const ridge = (baseY, amp, step, fill) => {
    let d = `M0 ${H} L0 ${baseY}`
    for (let x = 0; x <= W + step; x += step) {
      const y =
        baseY -
        Math.abs(Math.sin(x * 0.021 + r() * 0.6)) * amp -
        r() * amp * 0.35
      d += ` L${x} ${y}`
    }
    d += ` L${W} ${H} Z`
    return `<path d="${d}" fill="${fill}"/>`
  }
  add(ridge(150, 34, 9, 'url(#farRidge)'))
  add(`<rect y="130" width="${W}" height="30" fill="url(#mist)"/>`)
  add(ridge(170, 22, 7, 'url(#nearRidge)'))

  // ---- the castle on its crag ----
  const castle = []
  const c = (s) => castle.push(s)
  // crag
  c(
    `<path d="M100 258 L112 196 L120 186 L128 176 L140 170 L180 168 L196 174 L206 184 L214 198 L226 258 Z" fill="#1c1438"/>`
  )
  c(
    `<path d="M120 186 L128 176 L140 170 L150 172 L136 184 L128 200 L118 214 Z" fill="#2e2456"/>`
  )
  // walls and towers
  const tower = (x, top, w, roofH, lit) => {
    let s = `<rect x="${x}" y="${top}" width="${w}" height="${176 - top}" fill="#241a46"/>`
    s += `<rect x="${x}" y="${top}" width="${w * 0.35}" height="${176 - top}" fill="#34285e"/>`
    s += `<path d="M${x - 2} ${top} L${x + w / 2} ${top - roofH} L${x + w + 2} ${top} Z" fill="#3a1e4a"/>`
    s += `<path d="M${x - 2} ${top} L${x + w / 2} ${top - roofH} L${x + w * 0.45} ${top} Z" fill="#5a2e66"/>`
    s += `<path d="M${x + w / 2} ${top - roofH} L${x + w / 2} ${top - roofH - 6}" stroke="#241a46" stroke-width="0.8"/>`
    s += `<path d="M${x + w / 2} ${top - roofH - 6} L${x + w / 2 + 5} ${top - roofH - 4.5} L${x + w / 2} ${top - roofH - 3} Z" fill="#c83a3a"/>`
    lit.forEach(([wx, wy]) => {
      s += `<rect x="${x + wx}" y="${top + wy}" width="1.6" height="2.6" fill="#ffd870"/>`
    })
    return s
  }
  c(`<rect x="126" y="150" width="70" height="26" fill="#241a46"/>`)
  c(`<rect x="126" y="150" width="70" height="4" fill="#34285e"/>`)
  for (let bx = 126; bx < 196; bx += 4)
    c(`<rect x="${bx}" y="147" width="2" height="3" fill="#241a46"/>`)
  c(
    tower(118, 126, 12, 16, [
      [3, 8],
      [7, 18],
    ])
  )
  c(tower(190, 130, 11, 14, [[4, 9]]))
  c(
    tower(152, 104, 16, 22, [
      [4, 8],
      [10, 8],
      [7, 22],
      [3, 36],
    ])
  )
  c(tower(138, 128, 10, 13, [[3, 10]]))
  c(tower(172, 124, 10, 14, [[4, 12]]))
  ;[
    [134, 160],
    [146, 164],
    [176, 160],
    [184, 166],
    [160, 158],
  ].forEach(([wx, wy]) =>
    c(`<rect x="${wx}" y="${wy}" width="1.6" height="2.6" fill="#ffd870"/>`)
  )
  // glow of the lit windows on the mist
  c(`<ellipse cx="160" cy="150" rx="40" ry="18" fill="url(#warm)"/>`)
  add(`<g transform="translate(0 -18)">${castle.join('')}</g>`)

  // ---- forest of pines down in the valley ----
  for (let i = 0; i < 70; i++) {
    const x = r() * W
    if (x > 100 && x < 224) continue
    const base = 184 + r() * 24
    const h = 8 + r() * 10
    const w = h * 0.36
    add(
      `<path d="M${x} ${base - h} L${x + w} ${base} L${x - w} ${base} Z" fill="#160f30"/>`
    )
    add(
      `<path d="M${x} ${base - h} L${x - w * 0.15} ${base - h * 0.2} L${x - w * 0.8} ${base} Z" fill="#241c48"/>`
    )
  }
  add(`<rect y="200" width="${W}" height="40" fill="#120c28"/>`)

  // ---- rocky outcrops in front, where the heroes stand ----
  add(
    `<path d="M0 240 L0 214 L14 206 L30 204 L48 208 L62 216 L70 228 L74 240 Z" fill="#1a1236"/>`
  )
  add(
    `<path d="M0 214 L14 206 L30 204 L34 208 L18 212 L4 220 Z" fill="#3a2e66"/>`
  )
  add(
    `<path d="M320 240 L320 212 L306 204 L288 204 L272 210 L258 220 L250 240 Z" fill="#1a1236"/>`
  )
  add(
    `<path d="M306 204 L288 204 L278 208 L294 208 L310 214 L320 216 L320 212 Z" fill="#3a2e66"/>`
  )

  return scene(
    W,
    H,
    `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#070620"/><stop offset="0.24" stop-color="#161246"/>
      <stop offset="0.4" stop-color="#2e2062"/><stop offset="0.5" stop-color="#5a2c72"/>
      <stop offset="0.57" stop-color="#a65a7a"/><stop offset="0.63" stop-color="#e89a78"/>
      <stop offset="0.7" stop-color="#4a3070"/><stop offset="1" stop-color="#2a1a40"/>
    </linearGradient>
    <radialGradient id="halo"><stop offset="0.4" stop-color="#fff0c8" stop-opacity="0.35"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="moon" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stop-color="#fffef4"/><stop offset="0.7" stop-color="#f4ecd0"/><stop offset="1" stop-color="#d8c8a0"/></radialGradient>
    <radialGradient id="warm"><stop offset="0" stop-color="#ffb860" stop-opacity="0.22"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a9a" stop-opacity="0"/><stop offset="0.6" stop-color="#b07a9a" stop-opacity="0.35"/><stop offset="1" stop-color="#b07a9a" stop-opacity="0"/></linearGradient>
    <linearGradient id="farRidge" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#5a4a8c"/><stop offset="0.75" stop-color="#3a2c66"/></linearGradient>
    <linearGradient id="nearRidge" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="#3a2e6a"/><stop offset="0.85" stop-color="#241a48"/></linearGradient>
    <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="0.7"/></filter>
    `,
    parts.join('\n')
  )
}
