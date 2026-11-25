import { blob, oval, curve, stroke, linearAt, radialAt } from './svg'

// Shared pieces of the painted anime characters: eyes, faces and hair, so all heroes share one style

// An anime eye: a white with a soft shadow under the lid, a big iris graded dark to light from top to
// bottom with a ring of color, a pupil, two highlights, a thick upper lash line that flicks out at
// the outer corner and a thin lower line. size is its height; squash narrows it (the far eye of a
// face turned to the side); flip mirrors the lash flick (for eyes on the left of the face)
export const eye = (
  p,
  cx,
  cy,
  size,
  iris,
  { squash = 1, flip = false, lid = '#2a1408' } = {}
) => {
  const h = size
  const w = size * 0.82 * squash
  const s = flip ? -1 : 1
  const white = blob([
    [cx - (w / 2) * s, cy - h * 0.18],
    [cx, cy - h * 0.46],
    [cx + (w / 2) * s, cy - h * 0.22],
    [cx + (w / 2) * s * 0.92, cy + h * 0.3],
    [cx, cy + h * 0.47],
    [cx - (w / 2) * s * 0.95, cy + h * 0.28],
  ])
  p.shape(white, { fill: '#fbfaff' })
  // shadow cast by the upper lid
  p.soft(
    white,
    [[oval(cx, cy - h * 0.48, w * 0.8, h * 0.3), '#8a90c0', 0.8]],
    h * 0.08
  )
  const ir = p.paint(
    linearAt(
      [
        [0, iris[0]],
        [0.45, iris[1]],
        [1, iris[2]],
      ],
      cx,
      cy - h * 0.4,
      cx,
      cy + h * 0.45
    )
  )
  const irisPath = oval(cx + w * 0.05 * s, cy + h * 0.04, w * 0.36, h * 0.42)
  const c = p.clip(white)
  p.add(`<g clip-path="${c}">`)
  p.shape(irisPath, {
    fill: ir,
    line: iris[3] || '#101030',
    width: size * 0.05,
  })
  // pupil and a glint of reflected color low in the iris
  p.shape(oval(cx + w * 0.06 * s, cy + h * 0.02, w * 0.16, h * 0.2), {
    fill: '#0a0818',
    opacity: 0.85,
  })
  p.shape(oval(cx + w * 0.02 * s, cy + h * 0.26, w * 0.2, h * 0.08), {
    fill: iris[2],
    opacity: 0.9,
  })
  p.add('</g>')
  // highlights
  p.shape(oval(cx - w * 0.12 * s, cy - h * 0.14, w * 0.13, h * 0.12), {
    fill: '#ffffff',
  })
  p.shape(oval(cx + w * 0.17 * s, cy + h * 0.17, w * 0.06, h * 0.05), {
    fill: '#ffffff',
    opacity: 0.9,
  })
  // lashes: a thick arc over the eye flicking out at the outer corner, and a thin line below
  const lash = blob([
    [cx - (w / 2) * s * 1.05, cy - h * 0.12, 0],
    [cx - w * 0.1 * s, cy - h * 0.52],
    [cx + (w / 2) * s * 1.1, cy - h * 0.34],
    [cx + (w / 2) * s * 1.38, cy - h * 0.2, 0],
    [cx + (w / 2) * s * 1.02, cy - h * 0.26],
    [cx - w * 0.08 * s, cy - h * 0.4],
    [cx - (w / 2) * s * 0.92, cy - h * 0.1, 0],
  ])
  p.shape(lash, { fill: lid })
  p.shape(
    curve([
      [cx - (w / 2) * s * 0.7, cy + h * 0.38],
      [cx + w * 0.05 * s, cy + h * 0.5],
      [cx + (w / 2) * s * 0.85, cy + h * 0.32],
    ]),
    { line: lid, width: size * 0.045, opacity: 0.7 }
  )
}

// A soft round flush on a cheek
export const blush = (p, cx, cy, rx, ry, color = '#ff8a9a') => {
  p.add(
    `<path d="${oval(cx, cy, rx, ry)}" fill="${color}" opacity="0.4" filter="${p.blur(ry * 0.6)}"/>`
  )
}

// Skin: a warm gradient lit from the upper left
export const skin = (p, x1, y1, x2, y2) =>
  p.paint(
    linearAt(
      [
        [0, '#fff1e4'],
        [0.5, '#ffd8bc'],
        [1, '#e8a888'],
      ],
      x1,
      y1,
      x2,
      y2
    )
  )

// A glossy band of light across hair, following the given curve, clipped to the hair
export const hairSheen = (
  p,
  hairPath,
  points,
  color = '#ffffff',
  width = 10,
  opacity = 0.65
) => {
  const c = p.clip(hairPath)
  p.add(
    `<g clip-path="${c}"><path d="${curve(points)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}" filter="${p.blur(width * 0.35)}"/></g>`
  )
}

// Thin strand lines inside hair, in a darker tone, each a tapered brush stroke
export const strands = (p, hairPath, list, color, opacity = 0.55) => {
  const c = p.clip(hairPath)
  p.add(`<g clip-path="${c}" opacity="${opacity}">`)
  list.forEach(([a, b, w, bend]) =>
    p.shape(stroke(a, b, w, bend), { fill: color })
  )
  p.add('</g>')
}

// A chibi face turned three quarters to the right, drawn around (x, y), the middle of the face:
// neck, ear, face, cheeks, eyes, brows, nose and mouth. Hair or hats go on top. Returns the face path
// (for shading cast onto it). iris: [top, middle, bottom, ring] colors; brow: brow color
export const faceRight = (
  p,
  x,
  y,
  { iris, brow, mouth = 'smile', lid = '#2a1408' }
) => {
  const at = (pts) => pts.map(([px, py, t]) => [x + px, y + py, t])
  const skinFill = skin(p, x - 60, y - 70, x + 50, y + 75)
  // neck, with the jaw's shadow across it
  const neck = blob(
    at([
      [-24, 50],
      [12, 50],
      [14, 86],
      [-22, 86],
    ]),
    0.5
  )
  p.part(neck, { fill: skinFill, line: '#8a4a30', shade: '#a0583c', offset: 8 })
  p.soft(neck, [[oval(x, y + 52, 40, 16), '#9a4c34', 0.8]], 6)
  // face: round forehead, full cheek, a small chin pointing toward the right
  const face = blob(
    at([
      [-58, -36],
      [-4, -70],
      [56, -46],
      [70, 4],
      [58, 44],
      [34, 68],
      [4, 66],
      [-32, 52],
      [-56, 22],
    ])
  )
  p.part(face, {
    fill: skinFill,
    line: '#8a4a30',
    shade: '#c47456',
    depth: 0.45,
    light: '#fffaf4',
    glow: 0.5,
    offset: 14,
  })
  // ear on the near side
  p.part(
    blob(
      at([
        [-58, -6],
        [-46, -2],
        [-44, 26],
        [-56, 32],
        [-68, 12],
      ])
    ),
    {
      fill: skinFill,
      line: '#8a4a30',
      shade: '#b86848',
      offset: 6,
    }
  )
  p.shape(
    curve(
      at([
        [-60, 4],
        [-52, 10],
        [-56, 22],
      ])
    ),
    { line: '#b86848', width: 2.5 }
  )
  blush(p, x - 18, y + 38, 18, 8)
  blush(p, x + 52, y + 38, 7, 4, '#ff9aa8')
  // eyes, brows, nose and mouth
  eye(p, x - 14, y + 6, 44, iris, { flip: true, lid })
  eye(p, x + 46, y + 6, 42, iris, { squash: 0.6, lid })
  p.shape(stroke([x - 36, y - 30], [x + 6, y - 34], 6, -0.12), { fill: brow })
  p.shape(stroke([x + 32, y - 34], [x + 62, y - 28], 5, -0.12), { fill: brow })
  p.add(
    `<path d="${oval(x + 58, y + 26, 4, 6)}" fill="#c06a50" opacity="0.6" filter="${p.blur(1.5)}"/>`
  )
  if (mouth === 'smile') {
    p.shape(
      curve(
        at([
          [16, 46],
          [28, 52],
          [40, 45],
        ])
      ),
      { line: '#7a3020', width: 3 }
    )
  } else {
    p.shape(
      curve(
        at([
          [18, 48],
          [30, 48],
          [40, 46],
        ])
      ),
      { line: '#7a3020', width: 3 }
    )
  }
  return face
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
