// Title logo built from the game's own bitmap font: gold letters shaded in bands from top to bottom,
// a bright bevel along their top edges, a dark outline and a drop shadow.
// The font's glyphs are white with a black outline, drawn at 16px, so 'EXLOVIA' is doubled to 32px

const LINES = [
  { text: 'ADVENTURERS OF', scale: 1 },
  { text: 'EXLOVIA', scale: 2 },
]
const GAP = 3
// gold from top to bottom of each line
const BANDS = [
  [0.3, [255, 246, 196]],
  [0.52, [255, 216, 96]],
  [0.76, [240, 172, 48]],
  [1.01, [204, 120, 28]],
]
const BEVEL = [255, 255, 236]
const UNDERSIDE = [150, 72, 16]
const OUTLINE = [42, 14, 6]
const SHADOW = [8, 4, 20]

export const createLogo = (scene) => {
  const font = scene.cache.bitmapFont.get('pressstart').data
  const source = scene.textures.get('pressstart').getSourceImage()
  const widthOf = (line) =>
    [...line.text].reduce(
      (w, ch) => w + font.chars[ch.charCodeAt(0)].xAdvance * line.scale,
      0
    )
  const width = Math.max(...LINES.map(widthOf)) + 4
  const heights = LINES.map((line) => font.lineHeight * line.scale + 2)
  const height = heights.reduce((a, b) => a + b, 0) + GAP + 4

  // draw the white glyphs
  const glyphs = document.createElement('canvas')
  glyphs.width = width
  glyphs.height = height
  const g = glyphs.getContext('2d')
  g.imageSmoothingEnabled = false
  const lineTops = []
  let top = 1
  LINES.forEach((line, i) => {
    lineTops.push([top, top + heights[i]])
    let x = Math.round((width - widthOf(line)) / 2)
    ;[...line.text].forEach((ch) => {
      const c = font.chars[ch.charCodeAt(0)]
      if (c.width > 0) {
        g.drawImage(
          source,
          c.x,
          c.y,
          c.width,
          c.height,
          x + c.xOffset * line.scale,
          top + c.yOffset * line.scale,
          c.width * line.scale,
          c.height * line.scale
        )
      }
      x += c.xAdvance * line.scale
    })
    top += heights[i] + GAP
  })

  // recolor: bright pixels are letter, dark ones outline
  const image = g.getImageData(0, 0, width, height)
  const d = image.data
  const isLetter = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    d[(y * width + x) * 4 + 3] > 0 &&
    d[(y * width + x) * 4] > 128
  const letter = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) letter.push(isLetter(x, y))
  }
  for (let y = 0; y < height; y++) {
    const [lineTop, lineBottom] =
      lineTops.find(([t, b]) => y >= t && y < b) ||
      lineTops[lineTops.length - 1]
    const t = (y - lineTop) / (lineBottom - lineTop)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (d[i + 3] === 0) continue
      let color
      if (!letter[y * width + x]) color = OUTLINE
      else if (!letter[(y - 1) * width + x]) color = BEVEL
      else if (!letter[(y + 1) * width + x]) color = UNDERSIDE
      else color = BANDS.find(([limit]) => t < limit)[1]
      d[i] = color[0]
      d[i + 1] = color[1]
      d[i + 2] = color[2]
      d[i + 3] = 255
    }
  }
  g.putImageData(image, 0, 0)

  // final texture: the shadow two pixels down and right, the letters on top
  const texture = scene.textures.createCanvas(
    'title-logo',
    width + 2,
    height + 2
  )
  const ctx = texture.getContext()
  const shadow = document.createElement('canvas')
  shadow.width = width
  shadow.height = height
  const s = shadow.getContext('2d')
  s.drawImage(glyphs, 0, 0)
  s.globalCompositeOperation = 'source-in'
  s.fillStyle = `rgba(${SHADOW.join(',')}, 0.75)`
  s.fillRect(0, 0, width, height)
  ctx.drawImage(shadow, 2, 2)
  ctx.drawImage(glyphs, 0, 0)
  texture.refresh()
}
