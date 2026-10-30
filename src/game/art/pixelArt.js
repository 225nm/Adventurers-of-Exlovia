// Helpers for pixel art written as text: each row is a string, each character a palette color, '.' is transparent.
//
// Art is shaded automatically when painted, so it only needs flat material colors:
// - light comes from the top-left: material edges facing up/left get a warm highlight, edges facing down/right a cool shadow
// - 'o' is an outline, colored as a dark shade of the material it borders (soft "selective" outlines instead of black)
// - palette entries can be { color, flat: true } for details that shouldn't be shaded (eyes, glows, teeth)

// Completes symmetric art written as left halves. Halves are right-aligned (their last character
// touches the center line), so shorter halves are padded on the left
export const mirror = (halfRows) => {
  const width = Math.max(...halfRows.map((half) => half.length))
  return halfRows.map((half) => {
    const padded = half.padStart(width, '.')
    return padded + [...padded].reverse().join('')
  })
}

// Pads rows on the right to the widest row (or minWidth), so art can leave out trailing transparent pixels
export const padRows = (rows, minWidth = 0) => {
  const width = Math.max(minWidth, ...rows.map((row) => row.length))
  return rows.map((row) => row.padEnd(width, '.'))
}

// Draws extra pixels on top of rows: pixels is [[x, y, char], ...], used for weapons held over a body
export const overlay = (rows, pixels) => {
  const grid = rows.map((row) => [...row])
  pixels.forEach(([x, y, char]) => {
    if (grid[y] && x >= 0 && x < grid[y].length) grid[y][x] = char
  })
  return grid.map((row) => row.join(''))
}

// ---- color helpers ----
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (hex, towards, amount) => {
  const a = toRgb(hex)
  const b = toRgb(towards)
  return toHex(a.map((v, i) => v + (b[i] - v) * amount))
}
// Four-tone ramp per material, highlights shift warm and shadows cool (hue shifting, a classic pixel art technique)
const ramp = (hex) => ({
  highlight: mix(hex, '#fff6dc', 0.38),
  base: hex,
  shadow: mix(hex, '#2a1850', 0.3),
  deep: mix(hex, '#160c30', 0.52),
})
// outlines: dark on the outer silhouette, softer where two materials meet inside the sprite
const outerLine = (hex) => mix(hex, '#0c0618', 0.72)
const innerLine = (hex) => mix(hex, '#1a0e34', 0.5)

const entry = (palette, char) => {
  const value = palette[char]
  if (!value) return null
  return typeof value === 'string' ? { color: value } : value
}

// light from the upper left and slightly in front, normalised
const LIGHT = (() => {
  const v = [-0.55, -0.72, 0.62]
  const len = Math.hypot(...v)
  return v.map((c) => c / len)
})()
// how far into a shape (in pixels) it keeps rounding before it is treated as flat on top
const ROUNDING = 4

// Volume shading: every region of one material is treated as a rounded blob. The distance from a pixel
// to the region's edge gives its height, the slope of that height gives a surface normal, and the angle
// to the light picks one of four tones. Thin parts stay mostly mid tone, wide parts get a full
// highlight-to-shadow ramp, which reads as form instead of flat cut-outs
const shadeRows = (rows, palette) => {
  const h = rows.length
  const w = rows[0].length
  const at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w ? rows[y][x] : '.')
  const near4 = (x, y) => [
    [x, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x, y + 1],
  ]

  // distance from each material pixel to the nearest pixel that isn't the same material
  const dist = rows.map((row) => [...row].map(() => 0))
  let frontier = []
  rows.forEach((row, y) =>
    [...row].forEach((char, x) => {
      if (char === '.' || char === 'o') return
      if (near4(x, y).some(([nx, ny]) => at(nx, ny) !== char)) {
        dist[y][x] = 1
        frontier.push([x, y])
      }
    })
  )
  for (let d = 2; d <= ROUNDING && frontier.length; d++) {
    const next = []
    frontier.forEach(([x, y]) =>
      near4(x, y).forEach(([nx, ny]) => {
        const char = at(nx, ny)
        if (
          char !== '.' &&
          char !== 'o' &&
          char === rows[y][x] &&
          dist[ny][nx] === 0
        ) {
          dist[ny][nx] = d
          next.push([nx, ny])
        }
      })
    )
    frontier = next
  }
  // pixels deeper than ROUNDING were never reached, they're on the flat top
  const height = (x, y, char) => {
    if (at(x, y) !== char) return 0
    const d = dist[y][x] || ROUNDING
    const t = 1 - Math.min(d, ROUNDING) / ROUNDING
    return Math.sqrt(1 - t * t)
  }

  return rows.map((row, y) =>
    [...row].map((char, x) => {
      if (char === '.') return null
      if (char === 'o') {
        // outline takes the color of the material it borders the most
        const counts = {}
        let outer = false
        near4(x, y).forEach(([nx, ny]) => {
          const n = at(nx, ny)
          if (n === '.') outer = true
          if (n !== '.' && n !== 'o' && entry(palette, n)) {
            counts[n] = (counts[n] || 0) + 1
          }
        })
        const best = Object.keys(counts).sort(
          (a, b) => counts[b] - counts[a]
        )[0]
        if (!best) return '#0e0a18'
        const color = entry(palette, best).color
        return outer ? outerLine(color) : innerLine(color)
      }
      const material = entry(palette, char)
      if (!material) return null
      if (material.flat) return material.color

      const nx = height(x - 1, y, char) - height(x + 1, y, char)
      const ny = height(x, y - 1, char) - height(x, y + 1, char)
      const nz = 0.9
      const len = Math.hypot(nx, ny, nz)
      // normals point away from lower neighbors, so a left or top edge faces the upper-left light
      const light = (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / len
      const tones = ramp(material.color)
      // shiny materials (metal, gems) get a bright specular glint on the most lit pixels
      if (material.shiny && light > 0.93)
        return mix(material.color, '#ffffff', 0.7)
      if (light > 0.86) return tones.highlight
      if (light > 0.6) return tones.base
      if (light > 0.36) return tones.shadow
      return tones.deep
    })
  )
}

// Draws rows onto a canvas context at an offset, shaded
export const paint = (ctx, rows, palette, offsetX = 0, offsetY = 0) => {
  shadeRows(rows, palette).forEach((row, y) =>
    row.forEach((color, x) => {
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(offsetX + x, offsetY + y, 1, 1)
      }
    })
  )
}

// Draws rows without shading, for tiles where every pixel is already chosen by hand or by code
export const paintFlat = (ctx, rows, palette, offsetX = 0, offsetY = 0) => {
  rows.forEach((row, y) =>
    [...row].forEach((char, x) => {
      const material = entry(palette, char)
      if (material) {
        ctx.fillStyle = material.color
        ctx.fillRect(offsetX + x, offsetY + y, 1, 1)
      }
    })
  )
}

// Catches typos in art data: after padding every row must have the same width
const check = (key, rows) => {
  const width = rows[0].length
  rows.forEach((row, i) => {
    if (row.length !== width) {
      throw new Error(
        `${key}: row ${i} is ${row.length} wide, expected ${width}`
      )
    }
  })
  return width
}

// Single image texture from rows
export const createTexture = (scene, key, rows, palette) => {
  const width = check(key, rows)
  const texture = scene.textures.createCanvas(key, width, rows.length)
  paint(texture.getContext(), rows, palette)
  texture.refresh()
  return texture
}

// Texture with named frames side by side, frames is { name: rows }, all the same size
export const createSheet = (scene, key, frames, palette) => {
  const names = Object.keys(frames)
  const width = check(key, frames[names[0]])
  const height = frames[names[0]].length
  const texture = scene.textures.createCanvas(key, width * names.length, height)
  const ctx = texture.getContext()
  names.forEach((name, i) => {
    check(`${key}.${name}`, frames[name])
    paint(ctx, frames[name], palette, i * width, 0)
    texture.add(name, 0, i * width, 0, width, height)
  })
  texture.refresh()
  return texture
}
