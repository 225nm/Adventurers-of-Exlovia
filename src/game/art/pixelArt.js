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
// highlights shift warm, shadows and outlines shift cool, a classic pixel art technique
const light = (hex) => mix(hex, '#fff4d0', 0.3)
const dark = (hex) => mix(hex, '#1e1240', 0.32)
const outline = (hex) => mix(hex, '#0c0618', 0.65)

const entry = (palette, char) => {
  const value = palette[char]
  if (!value) return null
  return typeof value === 'string' ? { color: value } : value
}

// Works out every pixel's final color, see the notes at the top of the file
const shadeRows = (rows, palette) => {
  const at = (x, y) => (rows[y] && rows[y][x]) || '.'
  return rows.map((row, y) =>
    [...row].map((char, x) => {
      if (char === '.') return null
      if (char === 'o') {
        // outline takes the color of the material it borders the most
        const counts = {}
        ;[
          [x, y - 1],
          [x - 1, y],
          [x + 1, y],
          [x, y + 1],
        ].forEach(([nx, ny]) => {
          const n = at(nx, ny)
          if (n !== '.' && n !== 'o' && entry(palette, n)) {
            counts[n] = (counts[n] || 0) + 1
          }
        })
        const best = Object.keys(counts).sort(
          (a, b) => counts[b] - counts[a]
        )[0]
        return best ? outline(entry(palette, best).color) : '#0e0a18'
      }
      const material = entry(palette, char)
      if (!material) return null
      if (material.flat) return material.color
      const facesLight = at(x, y - 1) !== char || at(x - 1, y) !== char
      const facesShadow = at(x, y + 1) !== char || at(x + 1, y) !== char
      if (facesLight && !facesShadow) return light(material.color)
      if (facesShadow && !facesLight) return dark(material.color)
      return material.color
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
