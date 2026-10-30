// Renders the SVG sprite sources in tools/sprites/src into pixel art PNGs in public/assets/sprites.
//
// Each SVG is drawn large in a headless Chrome, shrunk to the sprite size by averaging, reduced to the
// colors written in the SVG plus a few edge colors (the crisp pixel art look) and given a dark outline
// around its silhouette.
//
// Usage (needs playwright-core, which is not a project dependency, and an installed Chrome):
//   node tools/sprites/render.mjs [chrome path]
// Set PLAYWRIGHT to the playwright-core entry file if it is installed somewhere else.
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

// name: output size in pixels (the outline adds 1px around), optional recolors of the same SVG
const SPRITES = {
  'battler-warrior': { size: [36, 45] },
  'battler-mage': { size: [36, 45] },
  'battler-ranger': { size: [36, 45] },
  slime: { size: [28, 22] },
  bat: { size: [38, 24] },
  goblin: { size: [30, 36] },
  'wisp-fire': { size: [24, 32], source: 'wisp' },
  'wisp-ice': {
    size: [24, 32],
    source: 'wisp',
    recolor: {
      '#ff9a2a': '#5ac8ff',
      '#ffd860': '#bff0ff',
      '#c8401a': '#2a6ac8',
      '#fff6c0': '#f4ffff',
    },
  },
  'dark-mage': { size: [32, 42] },
  ogre: { size: [40, 46] },
  'dragon-orange': { size: [52, 46], source: 'dragon' },
  'dragon-blue': {
    size: [52, 46],
    source: 'dragon',
    recolor: {
      '#f08a3a': '#4a7ae8',
      '#ffc078': '#8ab4ff',
      '#b0461a': '#22388a',
      '#f8e0a8': '#d8ecff',
      '#e0b880': '#a8c0e8',
      '#c8905a': '#5a78c0',
      '#8a2a14': '#14205a',
    },
  },
  'title-knight': { size: [54, 104] },
  'title-mage': { size: [54, 104] },
}
const SUPERSAMPLE = 8
// free palette colors for the blended edges between the SVG's own colors
const EDGE_COLORS = 6

const browser = await chromium.launch({ executablePath: chrome })
const page = await browser.newPage()
fs.mkdirSync(outDir, { recursive: true })

// ONLY=name1,name2 renders just those sprites
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
for (const [name, config] of Object.entries(SPRITES)) {
  if (only && !only.includes(name)) continue
  let svg = fs.readFileSync(
    path.join(here, 'src', `${config.source || name}.svg`),
    'utf8'
  )
  Object.entries(config.recolor || {}).forEach(([from, to]) => {
    svg = svg.split(from).join(to)
  })
  const palette = [...new Set(svg.toLowerCase().match(/#[0-9a-f]{6}/g))].map(
    (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  )
  const png = await page.evaluate(
    async ({ svg, size, palette, edgeColors, supersample }) => {
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
          px.push(a / (S * S) < 110 ? null : [r / a, g / a, b / a])
        }
      }

      // palette reduction: every color written in the SVG is kept exactly (the cel shading tones and
      // pixel-placed eyes), plus a few free colors that k-means fits to the blended edges between them
      const opaque = px.filter(Boolean)
      let centers = palette.slice()
      const dist2 = (c, k) =>
        (c[0] - k[0]) ** 2 + (c[1] - k[1]) ** 2 + (c[2] - k[2]) ** 2
      for (let i = 0; i < edgeColors && opaque.length; i++) {
        // start each free color at the pixel farthest from the palette so far
        let far = opaque[0],
          farD = -1
        opaque.forEach((c) => {
          const d = Math.min(...centers.map((k) => dist2(c, k)))
          if (d > farD) {
            farD = d
            far = c
          }
        })
        centers.push(far.slice())
      }
      const nearest = (c) => {
        let best = 0,
          bestD = Infinity
        centers.forEach((k, i) => {
          const d = (c[0] - k[0]) ** 2 + (c[1] - k[1]) ** 2 + (c[2] - k[2]) ** 2
          if (d < bestD) {
            bestD = d
            best = i
          }
        })
        return best
      }
      for (let iter = 0; iter < 12; iter++) {
        const sums = centers.map(() => [0, 0, 0, 0])
        opaque.forEach((c) => {
          const s = sums[nearest(c)]
          s[0] += c[0]
          s[1] += c[1]
          s[2] += c[2]
          s[3]++
        })
        centers = centers.map((k, i) =>
          i >= palette.length && sums[i][3]
            ? sums[i].slice(0, 3).map((v) => v / sums[i][3])
            : k
        )
      }
      const quantized = px.map((c) => (c ? centers[nearest(c)] : null))

      // 1px outline around the silhouette, a dark shade of the color it borders
      const OW = W + 2,
        OH = H + 2
      const at = (x, y) =>
        x >= 0 && y >= 0 && x < W && y < H ? quantized[y * W + x] : null
      const out = document.createElement('canvas')
      out.width = OW
      out.height = OH
      const ctx = out.getContext('2d')
      const image = ctx.createImageData(OW, OH)
      for (let y = 0; y < OH; y++) {
        for (let x = 0; x < OW; x++) {
          let c = at(x - 1, y - 1)
          if (!c) {
            const n = [
              at(x - 1, y - 2),
              at(x - 2, y - 1),
              at(x, y - 1),
              at(x - 1, y),
            ].find(Boolean)
            if (!n) continue
            c = n.map((v, i) => v * 0.28 + [16, 10, 30][i] * 0.72)
          }
          const i = (y * OW + x) * 4
          image.data[i] = c[0]
          image.data[i + 1] = c[1]
          image.data[i + 2] = c[2]
          image.data[i + 3] = 255
        }
      }
      ctx.putImageData(image, 0, 0)
      return out.toDataURL('image/png')
    },
    {
      svg,
      size: config.size,
      palette,
      edgeColors: EDGE_COLORS,
      supersample: SUPERSAMPLE,
    }
  )
  fs.writeFileSync(
    path.join(outDir, `${name}.png`),
    Buffer.from(png.split(',')[1], 'base64')
  )
  console.log('rendered', name)
}
await browser.close()
