// Renders the sprite and backdrop sources in tools/sprites/src into pixel art PNGs in public/assets/sprites.
//
// A source is an SVG file, or an .mjs module whose default export returns SVG markup (used for art with
// many procedural details, like the backdrops' trees and grass). Each one is drawn large in a headless
// Chrome, shrunk to its pixel size by averaging, reduced to a small palette (the crisp pixel art look),
// cleaned of stray single pixels and, for sprites, given a dark outline around the silhouette.
//
// Palettes: by default every color written in the SVG is kept exactly, plus a few free colors for the
// blended edges (used where pixels are placed by hand, like the heroes' eyes). With `colors: n` the
// palette is fitted to the painting instead (k-means in the Oklab color space), which suits the painted,
// softly shaded monsters and backdrops.
//
// Usage (needs playwright-core, which is not a project dependency, and an installed Chrome):
//   node tools/sprites/render.mjs [chrome path]
// Set PLAYWRIGHT to the playwright-core entry file if it is installed somewhere else, ONLY=a,b to render
// a subset.
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const { chromium } = await import(
  process.env.PLAYWRIGHT
    ? pathToFileURL(process.env.PLAYWRIGHT).href
    : 'playwright-core'
)

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(here, '../../public/assets/sprites')
const chrome =
  process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// name: output size in pixels (sprites get a 1px outline around that), optional source file, recolors,
// fitted palette size (colors) and backdrop: true for opaque pictures without an outline
const SPRITES = {
  'battler-warrior': { size: [40, 50] },
  'battler-mage': { size: [40, 50] },
  'battler-ranger': { size: [40, 50] },
  slime: { size: [40, 34], colors: 24 },
  bat: { size: [58, 38], colors: 24 },
  goblin: { size: [46, 54], colors: 24 },
  'wisp-fire': { size: [38, 46], source: 'wisp', colors: 16 },
  'wisp-ice': {
    size: [38, 46],
    source: 'wisp',
    colors: 16,
    recolor: {
      '#fffbe8': '#f4ffff',
      '#fff090': '#d0f6ff',
      '#ffd040': '#92dcff',
      '#ff8a20': '#4aa6f0',
      '#e04818': '#2a62d0',
      '#8a1808': '#1a2c88',
      '#3a0804': '#08143e',
    },
  },
  'dark-mage': { size: [46, 60], colors: 24 },
  ogre: { size: [62, 74], colors: 24 },
  'dragon-orange': { size: [90, 78], source: 'dragon', colors: 28 },
  'dragon-blue': {
    size: [90, 78],
    source: 'dragon',
    colors: 28,
    recolor: {
      '#ffc890': '#c4dcff',
      '#f89848': '#7aa8f8',
      '#d86020': '#3a68e0',
      '#c85a28': '#3458c0',
      '#a03410': '#20368a',
      '#6a1a0a': '#121c58',
      '#3a0c04': '#080e2c',
      '#fff0c8': '#e8f4ff',
      '#f0d098': '#b8d0f0',
      '#c89860': '#6a88c8',
    },
  },
  'title-knight': { size: [54, 104] },
  'title-mage': { size: [54, 104] },
  // map trees, drawn over the tiles in depth order (see WorldScene.plantTrees)
  'tree-round': { size: [22, 28], colors: 18 },
  'tree-dark': {
    size: [22, 28],
    source: 'tree-round',
    colors: 18,
    recolor: {
      '#8ad058': '#6ab088',
      '#4c9c40': '#2e7a5c',
      '#2c7034': '#1c5442',
      '#1a4a28': '#10342c',
      '#b4e870': '#90d8a8',
      '#e03a30': '#f0c040',
    },
  },
  'tree-pine': { size: [18, 30], colors: 12 },
  'battle-bg': { size: [320, 160], backdrop: true, colors: 64 },
  'title-bg': { size: [320, 240], backdrop: true, colors: 80 },
}
const SUPERSAMPLE = 8
// free palette colors for the blended edges between the SVG's own colors
const EDGE_COLORS = 6

const loadSource = async (name) => {
  const svgFile = path.join(here, 'src', `${name}.svg`)
  if (fs.existsSync(svgFile)) return fs.readFileSync(svgFile, 'utf8')
  const module = await import(
    pathToFileURL(path.join(here, 'src', `${name}.mjs`)).href
  )
  return module.default()
}

const browser = await chromium.launch({ executablePath: chrome })
const page = await browser.newPage()
fs.mkdirSync(outDir, { recursive: true })

const only = process.env.ONLY ? process.env.ONLY.split(',') : null
for (const [name, config] of Object.entries(SPRITES)) {
  if (only && !only.includes(name)) continue
  let svg = await loadSource(config.source || name)
  Object.entries(config.recolor || {}).forEach(([from, to]) => {
    svg = svg.split(from).join(to)
  })
  const palette = config.colors
    ? []
    : [...new Set(svg.toLowerCase().match(/#[0-9a-f]{6}/g))].map((hex) =>
        [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
      )
  const png = await page.evaluate(renderInPage, {
    svg,
    size: config.size,
    palette,
    colors: config.colors || 0,
    backdrop: !!config.backdrop,
    edgeColors: EDGE_COLORS,
    supersample: SUPERSAMPLE,
  })
  fs.writeFileSync(
    path.join(outDir, `${name}.png`),
    Buffer.from(png.split(',')[1], 'base64')
  )
  console.log('rendered', name)
}
await browser.close()

// Runs inside the browser page, so it can only use what is passed in
async function renderInPage({
  svg,
  size,
  palette,
  colors,
  backdrop,
  edgeColors,
  supersample,
}) {
  const img = new Image()
  img.src =
    'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  await img.decode()
  const [W, H] = size
  const S = supersample
  const big = document.createElement('canvas')
  big.width = W * S
  big.height = H * S
  big.getContext('2d').drawImage(img, 0, 0, W * S, H * S)
  const src = big.getContext('2d').getImageData(0, 0, W * S, H * S).data

  // average each SxS block (weighted by alpha), drop mostly transparent pixels
  const px = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const i = ((y * S + sy) * W * S + x * S + sx) * 4
          const alpha = src[i + 3]
          r += src[i] * alpha
          g += src[i + 1] * alpha
          b += src[i + 2] * alpha
          a += alpha
        }
      }
      const keep = backdrop ? a > 0 : a / (S * S) >= 110
      px.push(keep ? [r / a, g / a, b / a] : null)
    }
  }
  const opaque = px.filter(Boolean)

  // Oklab: distances in it match how different colors look, so the palette spends its colors well
  const lin = (v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const oklab = ([r, g, b]) => {
    r = lin(r)
    g = lin(g)
    b = lin(b)
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ]
  }
  const dist2 = (c, k) =>
    (c[0] - k[0]) ** 2 + (c[1] - k[1]) ** 2 + (c[2] - k[2]) ** 2

  // palette: fixed colors (the SVG's own) are never moved, free ones are fitted by k-means
  const points = opaque.map((c) => ({ rgb: c, lab: oklab(c) }))
  const fixed = palette.map((c) => ({ rgb: c, lab: oklab(c) }))
  let centers = fixed.slice()
  const free = colors || edgeColors
  // each free color starts at the pixel farthest from the palette so far (or the first pixel)
  const minD = points.map((p) =>
    centers.reduce((d, k) => Math.min(d, dist2(p.lab, k.lab)), Infinity)
  )
  for (let i = 0; i < free && points.length; i++) {
    let far = 0
    for (let p = 1; p < points.length; p++) if (minD[p] > minD[far]) far = p
    const center = {
      rgb: points[far].rgb.slice(),
      lab: points[far].lab.slice(),
    }
    centers.push(center)
    points.forEach((p, j) => {
      minD[j] = Math.min(minD[j], dist2(p.lab, center.lab))
    })
  }
  const nearest = (lab) => {
    let best = 0,
      bestD = Infinity
    for (let i = 0; i < centers.length; i++) {
      const d = dist2(lab, centers[i].lab)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }
  for (let iter = 0; iter < 16; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0, 0, 0, 0])
    points.forEach((p) => {
      const s = sums[nearest(p.lab)]
      for (let k = 0; k < 3; k++) {
        s[k] += p.lab[k]
        s[k + 3] += p.rgb[k]
      }
      s[6]++
    })
    centers = centers.map((k, i) =>
      i >= fixed.length && sums[i][6]
        ? {
            lab: sums[i].slice(0, 3).map((v) => v / sums[i][6]),
            rgb: sums[i].slice(3, 6).map((v) => v / sums[i][6]),
          }
        : k
    )
  }
  let index = px.map((c) => (c ? nearest(oklab(c)) : -1))

  // clean-up: a pixel whose four neighbors all differ from it, while three or more of them agree,
  // is quantization noise and takes their color
  const cleaned = index.slice()
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (index[i] < 0) continue
      const near = [
        [x, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x, y + 1],
      ].map(([nx, ny]) =>
        nx >= 0 && ny >= 0 && nx < W && ny < H ? index[ny * W + nx] : -1
      )
      if (near.includes(index[i])) continue
      const counts = {}
      near.forEach((n) => n >= 0 && (counts[n] = (counts[n] || 0) + 1))
      const [top, count] =
        Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []
      if (count >= 3) cleaned[i] = Number(top)
    }
  }
  index = cleaned
  const quantized = index.map((i) => (i >= 0 ? centers[i].rgb : null))

  // 1px outline around a sprite's silhouette, a dark shade of the color it borders
  const pad = backdrop ? 0 : 1
  const OW = W + pad * 2,
    OH = H + pad * 2
  const at = (x, y) =>
    x >= 0 && y >= 0 && x < W && y < H ? quantized[y * W + x] : null
  const out = document.createElement('canvas')
  out.width = OW
  out.height = OH
  const ctx = out.getContext('2d')
  const image = ctx.createImageData(OW, OH)
  for (let y = 0; y < OH; y++) {
    for (let x = 0; x < OW; x++) {
      let c = at(x - pad, y - pad)
      if (!c && !backdrop) {
        const n = [
          at(x - 1, y - 2),
          at(x - 2, y - 1),
          at(x, y - 1),
          at(x - 1, y),
        ].find(Boolean)
        if (!n) continue
        c = n.map((v, i) => v * 0.28 + [16, 10, 30][i] * 0.72)
      }
      if (!c) continue
      const i = (y * OW + x) * 4
      image.data[i] = c[0]
      image.data[i + 1] = c[1]
      image.data[i + 2] = c[2]
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return out.toDataURL('image/png')
}
