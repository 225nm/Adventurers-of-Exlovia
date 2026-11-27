// Helpers for the painted art. Each painting is SVG markup built in code; BootScene loads it as an
// SVG file that Phaser rasterizes at screen resolution (see art/paintings/index.js).
//
// Paintings are drawn in units of a tenth of a layout unit: a 42 x 52 sprite has a 420 x 520 viewBox.
// Shapes are mostly smooth closed curves through points (blob), filled with gradients lit from the
// upper left, then shaded with blurred shapes clipped to them (soft), outlined in a dark shade of
// their own color, and given rim light along their lit edges

let uid = 0
// unique ids, so gradients and clips of different paintings never clash
export const id = (name) => `${name}${++uid}`

const f = (n) => Math.round(n * 10) / 10

// A smooth closed curve through the points (Catmull-Rom turned into cubic Beziers). tension 0 gives
// straight lines, 1 the default roundness. Points may carry a third value: 0 for a sharp corner
export const blob = (points, tension = 1) => {
  const n = points.length
  let d = `M${f(points[0][0])},${f(points[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const t1 = (p1[2] ?? 1) * tension
    const t2 = (p2[2] ?? 1) * tension
    const c1 = [
      p1[0] + ((p2[0] - p0[0]) / 6) * t1,
      p1[1] + ((p2[1] - p0[1]) / 6) * t1,
    ]
    const c2 = [
      p2[0] - ((p3[0] - p1[0]) / 6) * t2,
      p2[1] - ((p3[1] - p1[1]) / 6) * t2,
    ]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d + 'Z'
}

// A smooth open curve through the points
export const curve = (points, tension = 1) => {
  const n = points.length
  let d = `M${f(points[0][0])},${f(points[0][1])}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(n - 1, i + 2)]
    const c1 = [
      p1[0] + ((p2[0] - p0[0]) / 6) * tension,
      p1[1] + ((p2[1] - p0[1]) / 6) * tension,
    ]
    const c2 = [
      p2[0] - ((p3[0] - p1[0]) / 6) * tension,
      p2[1] - ((p3[1] - p1[1]) / 6) * tension,
    ]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

// An ellipse as a path
export const oval = (cx, cy, rx, ry) =>
  `M${f(cx - rx)},${f(cy)}a${f(rx)},${f(ry)} 0 1,0 ${f(rx * 2)},0a${f(rx)},${f(ry)} 0 1,0 ${f(-rx * 2)},0Z`

// A tapering stroke from a to b, like a brush mark: wide in the middle, pointed at both ends,
// bending by `bend` (a fraction of its length) to one side
export const stroke = (a, b, width, bend = 0) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const mx = (a[0] + b[0]) / 2 + nx * len * bend
  const my = (a[1] + b[1]) / 2 + ny * len * bend
  const w = width / 2
  return `M${f(a[0])},${f(a[1])}Q${f(mx + nx * w)},${f(my + ny * w)} ${f(b[0])},${f(b[1])}Q${f(mx - nx * w)},${f(my - ny * w)} ${f(a[0])},${f(a[1])}Z`
}

const stops = (list) =>
  list
    .map(
      ([o, c, a = 1]) =>
        `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`
    )
    .join('')

// Gradients: lit from the upper left unless told otherwise. Returns [defs, url]
export const linear = (list, x1 = 0, y1 = 0, x2 = 0.6, y2 = 1) => {
  const g = id('l')
  return [
    `<linearGradient id="${g}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`,
    `url(#${g})`,
  ]
}
export const radial = (list, cx = 0.35, cy = 0.3, r = 0.8) => {
  const g = id('r')
  return [
    `<radialGradient id="${g}" cx="${cx}" cy="${cy}" r="${r}">${stops(list)}</radialGradient>`,
    `url(#${g})`,
  ]
}
// the same gradient in the painting's own units, for shapes that should share one light
export const linearAt = (list, x1, y1, x2, y2) => {
  const g = id('l')
  return [
    `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`,
    `url(#${g})`,
  ]
}
export const radialAt = (list, cx, cy, r, fx = cx, fy = cy) => {
  const g = id('r')
  return [
    `<radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stops(list)}</radialGradient>`,
    `url(#${g})`,
  ]
}

// Builds a painting: collects defs as it goes, so parts can add gradients, clips and filters
export class Painting {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.defs = []
    this.body = []
    this.blurs = {}
  }

  // a gaussian blur filter of the given radius (in painting units), shared by all that use it
  blur(radius) {
    if (!this.blurs[radius]) {
      const b = id('b')
      this.defs.push(
        `<filter id="${b}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${radius}"/></filter>`
      )
      this.blurs[radius] = b
    }
    return `url(#${this.blurs[radius]})`
  }

  // registers a gradient made with linear/radial and returns its url
  paint([def, url]) {
    this.defs.push(def)
    return url
  }

  // adds markup
  add(...markup) {
    this.body.push(...markup)
    return this
  }

  // a filled path with an optional outline: { fill, line, width, opacity }
  shape(d, { fill = 'none', line, width = 3, opacity = 1, extra = '' } = {}) {
    const stroke = line
      ? ` stroke="${line}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`
      : ''
    const op = opacity !== 1 ? ` opacity="${opacity}"` : ''
    this.body.push(`<path d="${d}" fill="${fill}"${stroke}${op}${extra}/>`)
    return this
  }

  // a clip path from a shape, returns its url
  clip(d) {
    const c = id('c')
    this.defs.push(`<clipPath id="${c}"><path d="${d}"/></clipPath>`)
    return `url(#${c})`
  }

  // Soft painted shading inside a shape: the given marks are blurred and clipped to it.
  // marks is an array of [path, color, opacity]
  soft(shapePath, marks, radius = 8) {
    const c = this.clip(shapePath)
    const inner = marks
      .map(
        ([d, color, opacity = 1]) =>
          `<path d="${d}" fill="${color}" opacity="${opacity}"/>`
      )
      .join('')
    this.body.push(
      `<g clip-path="${c}"><g filter="${this.blur(radius)}">${inner}</g></g>`
    )
    return this
  }

  // A complete painted part: gradient fill, soft shade toward the lower right, a lit rim on the
  // upper left, and a dark outline. shade and light are colors; offset moves the shade/light
  part(
    d,
    {
      fill,
      line,
      width = 3,
      shade,
      light,
      depth = 0.5,
      glow = 0.6,
      radius = 10,
      offset = 14,
    }
  ) {
    this.shape(d, { fill })
    const marks = []
    if (shade) marks.push([d, shade, depth, offset, offset])
    if (light) marks.push([d, light, glow, -offset * 0.8, -offset * 0.8])
    if (marks.length) {
      const c = this.clip(d)
      const inner = marks
        .map(([p, color, op, dx, dy]) => {
          // shade: the shape's own outline shifted, so the far edge falls in shadow; light: a
          // rim on the near edge, drawn as the shape minus itself shifted the other way
          if (color === shade) {
            return `<path d="${p}" fill="none" stroke="${color}" stroke-width="${offset * 2.2}" opacity="${op}" transform="translate(${dx * 0.5},${dy * 0.5})"/>`
          }
          return `<path d="${p}" fill="none" stroke="${color}" stroke-width="${offset * 1.1}" opacity="${op}" transform="translate(${dx * 0.35},${dy * 0.35})"/>`
        })
        .join('')
      this.body.push(
        `<g clip-path="${c}"><g filter="${this.blur(radius)}">${inner}</g></g>`
      )
    }
    if (line) this.shape(d, { line, width })
    return this
  }

  // the finished SVG document, sized in layout units
  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width * 10} ${this.height * 10}"><defs>${this.defs.join('')}</defs>${this.body.join('')}</svg>`
  }
}

// A round glossy highlight that fades out, for armor, gems and orbs
export const glint = (p, cx, cy, r, opacity = 0.9) => {
  const g = p.paint(
    radialAt(
      [
        [0, '#ffffff', opacity],
        [1, '#ffffff', 0],
      ],
      cx,
      cy,
      r
    )
  )
  p.shape(oval(cx, cy, r, r), { fill: g })
}
