// Dragon: a great winged dragon reared up toward the heroes, neck arched, jaws open on a glow of fire,
// one claw raised, wings spread behind and the tail sweeping along the ground. Lit from the upper left.
// The neck and tail are tapered shapes built along curves, with spikes and belly plates placed along them.
// The blue dragon reuses this source with its scale, belly and wing colors swapped (see render.mjs)
import { scene } from './lib/paint.mjs'

const bez = ([p0, p1, p2, p3], t) => {
  const u = 1 - t
  return [0, 1].map(
    (i) =>
      u * u * u * p0[i] +
      3 * u * u * t * p1[i] +
      3 * u * t * t * p2[i] +
      t * t * t * p3[i]
  )
}
const sample = (curve, n) =>
  Array.from({ length: n + 1 }, (_, i) => bez(curve, i / n))
// unit normals of a polyline (pointing to the left of the direction of travel)
const normals = (pts) =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    return [dy / len, -dx / len]
  })
const f = (n) => Math.round(n * 10) / 10
// closed outline of a band along the curve, width going from w0 to w1
const taper = (curve, w0, w1, n = 24) => {
  const pts = sample(curve, n)
  const ns = normals(pts)
  const side = (sign) =>
    pts.map((p, i) => {
      const w = (w0 + (w1 - w0) * (i / n)) / 2
      return [p[0] + ns[i][0] * w * sign, p[1] + ns[i][1] * w * sign]
    })
  const left = side(1)
  const right = side(-1).reverse()
  return (
    'M' +
    [...left, ...right].map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') +
    ' Z'
  )
}
// spikes standing out of one side of a curve
const spikes = (curve, w0, w1, from, to, count, size, sign = 1) => {
  let d = ''
  const n = 60
  const pts = sample(curve, n)
  const ns = normals(pts)
  for (let k = 0; k < count; k++) {
    const t = from + ((to - from) * (k + 0.5)) / count
    const i = Math.round(t * n)
    const p = pts[i]
    const nv = ns[i]
    const w = (w0 + (w1 - w0) * t) / 2 - 1
    const base = [p[0] + nv[0] * w * sign, p[1] + nv[1] * w * sign]
    const along = [-nv[1] * sign, nv[0] * sign]
    const s = size * (1 - t * 0.4)
    const tip = [
      base[0] + nv[0] * s * sign - along[0] * s * 0.5,
      base[1] + nv[1] * s * sign - along[1] * s * 0.5,
    ]
    d += `M${f(base[0] - along[0] * s * 0.45)} ${f(base[1] - along[1] * s * 0.45)} L${f(tip[0])} ${f(tip[1])} L${f(base[0] + along[0] * s * 0.45)} ${f(base[1] + along[1] * s * 0.45)} Z `
  }
  return d
}
// short lines across a band, for belly plates
const plates = (curve, w0, w1, from, to, count, sign) => {
  let d = ''
  const n = 60
  const pts = sample(curve, n)
  const ns = normals(pts)
  for (let k = 1; k < count; k++) {
    const t = from + ((to - from) * k) / count
    const i = Math.round(t * n)
    const p = pts[i]
    const nv = ns[i]
    const w = (w0 + (w1 - w0) * t) / 2
    const a = [p[0] + nv[0] * w * sign * 0.95, p[1] + nv[1] * w * sign * 0.95]
    const b = [p[0] + nv[0] * w * sign * 0.15, p[1] + nv[1] * w * sign * 0.15]
    d += `M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} `
  }
  return d
}

export default function () {
  const NECK = [
    [206, 186],
    [252, 178],
    [256, 112],
    [292, 96],
  ]
  const TAIL = [
    [134, 222],
    [96, 262],
    [52, 280],
    [16, 258],
  ]
  // the curve of the back, for its row of spikes
  const BACK = [
    [116, 196],
    [116, 156],
    [160, 132],
    [210, 142],
  ]
  const neck = taper(NECK, 66, 34)
  const tail = taper(TAIL, 52, 8)
  // the belly side of the neck is its right side (sign -1)
  const neckBelly = (() => {
    const pts = sample(NECK, 24)
    const ns = normals(pts)
    const outer = pts.map((p, i) => {
      const w = (66 + (34 - 66) * (i / 24)) / 2
      return [p[0] - ns[i][0] * w, p[1] - ns[i][1] * w]
    })
    const inner = pts
      .map((p, i) => {
        const w = (66 + (34 - 66) * (i / 24)) / 2
        return [p[0] - ns[i][0] * w * 0.2, p[1] - ns[i][1] * w * 0.2]
      })
      .reverse()
    return (
      'M' +
      [...outer, ...inner].map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') +
      ' Z'
    )
  })()

  const defs = `
    <radialGradient id="scales" cx="0.3" cy="0.25" r="0.85">
      <stop offset="0" stop-color="#ffc890"/>
      <stop offset="0.25" stop-color="#f89848"/>
      <stop offset="0.55" stop-color="#d86020"/>
      <stop offset="0.85" stop-color="#a03410"/>
      <stop offset="1" stop-color="#6a1a0a"/>
    </radialGradient>
    <linearGradient id="scalesFar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a03410"/>
      <stop offset="1" stop-color="#3a0c04"/>
    </linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff0c8"/>
      <stop offset="0.55" stop-color="#f0d098"/>
      <stop offset="1" stop-color="#c89860"/>
    </linearGradient>
    <linearGradient id="wing" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#6a1a0a"/>
      <stop offset="0.6" stop-color="#a03410"/>
      <stop offset="1" stop-color="#c85a28"/>
    </linearGradient>
    <linearGradient id="wingFar" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#3a0c04"/>
      <stop offset="1" stop-color="#a03410"/>
    </linearGradient>
    <linearGradient id="horn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff8e8"/>
      <stop offset="0.6" stop-color="#e0d4b8"/>
      <stop offset="1" stop-color="#9a8a6c"/>
    </linearGradient>
    <radialGradient id="fire" cx="0.6" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#ffffd0"/>
      <stop offset="0.4" stop-color="#ffd040"/>
      <stop offset="1" stop-color="#e04818"/>
    </radialGradient>
    <radialGradient id="eye" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffc0"/>
      <stop offset="0.6" stop-color="#ffd820"/>
      <stop offset="1" stop-color="#d07a08"/>
    </radialGradient>
    <pattern id="scaleTex" width="12" height="9" patternUnits="userSpaceOnUse">
      <path d="M0 9 C2 4 10 4 12 9 M-6 4.5 C-4 -0.5 4 -0.5 6 4.5 M6 4.5 C8 -0.5 16 -0.5 18 4.5" fill="none" stroke="#3a0c04" stroke-width="1.4" opacity="0.4"/>
    </pattern>`

  // the wing: arm bones to the wrist, four fingers, a membrane scalloped between them
  const wing = (dx, dy, k, fill, bone) => {
    const P = (x, y) => `${f(dx + x * k)} ${f(dy + y * k)}`
    const S = [180, 148]
    const E = [150, 86]
    const Wr = [106, 30]
    const tips = [
      [8, 32],
      [14, 102],
      [50, 152],
      [112, 164],
    ]
    let s = `<path d="M${P(...S)} L${P(...E)} L${P(...Wr)} L${P(...tips[0])} Q${P(50, 62)} ${P(...tips[1])} Q${P(62, 114)} ${P(...tips[2])} Q${P(94, 132)} ${P(...tips[3])} Q${P(142, 152)} ${P(176, 172)} Z" fill="${fill}"/>`
    if (bone) {
      // light shining through the membrane between the fingers
      s += `<path d="M${P(...Wr)} L${P(14, 38)} Q${P(44, 64)} ${P(20, 96)} Z" fill="#d86020" opacity="0.4" stroke="none"/>`
      s += `<path d="M${P(...Wr)} L${P(22, 106)} Q${P(58, 112)} ${P(50, 144)} Z" fill="#d86020" opacity="0.3" stroke="none"/>`
      const bones =
        `M${P(...S)} L${P(...E)} L${P(...Wr)} ` +
        tips.map((t) => `M${P(...Wr)} L${P(...t)}`).join(' ')
      s += `<path d="${bones}" fill="none" stroke="#2a0a04" stroke-width="7"/>`
      s += `<path d="${bones}" fill="none" stroke="${bone}" stroke-width="3"/>`
      s += `<path d="M${P(106, 30)} L${P(98, 12)} L${P(112, 24)} Z" fill="url(#horn)"/>`
    }
    return s
  }

  const body = `
  <g stroke="#2a0a04" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">
    ${wing(64, -10, 0.86, 'url(#wingFar)', null)}
    ${wing(0, 0, 1, 'url(#wing)', '#f89848')}
    <!-- far legs -->
    <path d="M112 232 C98 252 94 276 98 296 L86 304 L122 304 L114 294 C114 274 120 258 132 244 Z" fill="url(#scalesFar)"/>
    <path d="M204 222 C212 242 218 264 220 290 L212 304 L244 304 L232 292 C230 266 226 242 222 222 Z" fill="url(#scalesFar)"/>
    <!-- tail -->
    <path d="${tail}" fill="url(#scales)"/>
    <path d="${spikes(TAIL, 52, 8, 0.1, 0.9, 6, 12, 1)}" fill="#6a1a0a"/>
    <path d="M18 262 L0 246 L14 244 L8 230 L26 250 Z" fill="#a03410"/>
    <!-- body, with spikes along the back -->
    <path d="${spikes(BACK, 2, 2, 0.15, 0.9, 5, 28, 1)}" fill="url(#horn)"/>
    <path d="M112 192 C112 150 152 132 196 138 C236 144 256 174 250 206 C244 238 214 256 176 256 C136 256 112 232 112 192 Z" fill="url(#scales)"/>
    <path d="M204 152 C238 162 252 198 238 228 C226 250 198 256 172 252 C198 238 216 212 216 186 C216 172 210 160 204 152 Z" fill="url(#belly)"/>
    <path d="M214 170 C222 172 230 172 236 168 M218 192 C226 194 236 194 244 190 M214 214 C222 218 232 218 240 214 M202 234 C210 238 220 238 228 234" fill="none" stroke="#c89860" stroke-width="2.4"/>
    <path d="M132 164 C146 148 166 142 184 142" fill="none" stroke="#ffc890" stroke-width="3" opacity="0.8"/>
    <path d="M140 176 C146 170 154 170 158 176 M158 176 C164 170 172 170 176 176 M176 176 C182 170 190 170 194 176 M150 192 C156 186 164 186 168 192 M168 192 C174 186 182 186 186 192 M132 192 C138 186 146 186 150 192 M142 208 C148 202 156 202 160 208 M160 208 C166 202 174 202 178 208" fill="none" stroke="#a03410" stroke-width="2.4" opacity="0.75"/>
    <!-- near hind leg -->
    <path d="M128 208 C160 200 184 222 180 250 C178 264 170 274 166 284 L178 298 L194 304 L146 304 L148 290 C150 276 148 262 138 252 C126 242 118 226 128 208 Z" fill="url(#scales)"/>
    <path d="M178 300 L196 296 L190 306 Z M168 302 L184 300 L176 308 Z" fill="url(#horn)" stroke-width="2"/>
    <!-- neck with spikes and belly plates -->
    <path d="${spikes(NECK, 66, 34, 0.05, 0.95, 7, 16, 1)}" fill="#6a1a0a"/>
    <path d="${neck}" fill="url(#scales)"/>
    <path d="${neckBelly}" fill="url(#belly)" stroke-width="2.4"/>
    <path d="${plates(NECK, 66, 34, 0, 1, 7, -1)}" fill="none" stroke="#c89860" stroke-width="2.2"/>
    <!-- near foreleg raised, claws out -->
    <path d="M214 192 C236 192 252 212 254 234 L276 220 L284 232 L256 252 C242 258 232 248 230 238 C226 222 218 208 214 192 Z" fill="url(#scales)"/>
    <path d="M276 216 C286 210 296 212 298 220 C292 218 286 220 282 224 Z M282 226 C292 224 302 228 302 236 C296 232 290 234 284 236 Z M278 234 C286 236 292 242 290 250 C286 244 280 242 274 242 Z" fill="url(#horn)" stroke-width="2"/>
    <!-- head: horns swept back, a long angular snout, jaws wide open on a glow of fire -->
    <path d="M278 64 C262 46 244 36 220 32 C240 46 252 60 262 76 Z" fill="url(#horn)"/>
    <path d="M294 56 C290 30 276 12 250 2 C266 22 274 42 278 62 Z" fill="url(#horn)"/>
    <path d="M284 30 L276 35 M272 18 L266 24 M262 50 L254 54" fill="none" stroke-width="2"/>
    <path d="M280 100 L312 102 L350 114 L344 124 L312 124 C296 120 286 112 280 100 Z" fill="url(#scales)"/>
    <path d="M296 92 L356 82 L350 114 L300 106 Z" fill="#4a0c06"/>
    <path d="M304 96 L352 88 L346 110 L306 104 Z" fill="url(#fire)" stroke="none"/>
    <path d="M262 90 C260 70 274 56 294 54 L324 58 L352 70 L360 80 L352 86 L318 90 L300 94 C286 100 268 100 262 90 Z" fill="url(#scales)"/>
    <path d="M306 92 L309 100 L313 91 M320 90 L323 98 L327 89 M334 88 L337 96 L341 87 M346 86 L348 93 L351 85 M304 106 L308 99 L312 107 M318 109 L322 102 L326 111 M332 113 L336 106 L340 115" fill="#fff8e8" stroke-width="1.6"/>
    <path d="M286 64 L328 64 L322 74 L290 72 Z" fill="#6a1a0a"/>
    <path d="M296 72 C302 66 314 66 320 70 C316 76 302 78 296 72 Z" fill="url(#eye)"/>
    <path d="M309 67 L308 76" stroke-width="2.4"/>
    <path d="M350 74 L354 76" stroke-width="2.6"/>
    <path d="M330 62 C340 64 348 68 354 74" fill="none" stroke="#ffc890" stroke-width="2.4"/>
    <path d="M268 94 L252 104 L270 102 Z M274 102 L262 118 L280 108 Z M266 82 L248 84 L264 90 Z" fill="#6a1a0a"/>
    <path d="M274 70 C280 60 290 56 300 56" fill="none" stroke="#ffc890" stroke-width="2.6"/>
  </g>
  <!-- smoke curling from the nostril -->
  <path d="M354 70 C358 64 354 58 358 52" fill="none" stroke="#d0c8c0" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`

  return scene(360, 312, defs, body)
}
