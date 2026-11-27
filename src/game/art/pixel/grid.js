// Hand placed pixel art: a sprite written as rows of characters, one character per pixel, with a
// legend mapping characters to colors. Outlines and shading are part of the drawing, nothing is
// generated. overlay is a list of [x, y, character] drawn on top, for parts that are easier to
// place one pixel at a time (a blade on a slant)
export const gridSprite = (rows, legend, overlay = []) => {
  const w = Math.max(...rows.map((r) => r.length))
  const h = rows.length
  const color = new Array(w * h).fill(null)
  const put = (x, y, ch) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    if (ch in legend) color[y * w + x] = legend[ch]
  }
  rows.forEach((row, y) => [...row].forEach((ch, x) => put(x, y, ch)))
  overlay.forEach(([x, y, ch]) => put(x, y, ch))
  return {
    w,
    h,
    color,
    draw(ctx, size = 1, ox = 0, oy = 0) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const c = color[y * w + x]
          if (!c) continue
          ctx.fillStyle = c
          ctx.fillRect(ox + x * size, oy + y * size, size, size)
        }
      }
    },
  }
}

// A symmetric sprite from its left half: each row runs from the left edge to the middle column,
// and is mirrored to the right (the middle column is not repeated)
export const mirrored = (halfRows) =>
  halfRows.map((row) => row + [...row.slice(0, -1)].reverse().join(''))
