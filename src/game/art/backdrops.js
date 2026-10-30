import { seededRandom } from './world'

// Painted backgrounds: the title screen's moonlit castle and the battle field.
// Drawn with canvas fills in whole pixels so they match the pixel art style

const gradient = (ctx, top, bottom, stops) => {
  const g = ctx.createLinearGradient(0, top, 0, bottom)
  stops.forEach(([at, color]) => g.addColorStop(at, color))
  ctx.fillStyle = g
  ctx.fillRect(0, top, ctx.canvas.width, bottom - top)
}

// Mountain ridge made from a random walk, filled down to the bottom of the canvas
const ridge = (ctx, random, baseY, roughness, color) => {
  ctx.fillStyle = color
  let y = baseY
  for (let x = 0; x < ctx.canvas.width; x += 2) {
    y += (random() - 0.5) * roughness
    y = Math.max(baseY - roughness * 3, Math.min(baseY + roughness * 2, y))
    ctx.fillRect(x, Math.round(y), 2, ctx.canvas.height - Math.round(y))
  }
}

const paintTitle = (ctx) => {
  const random = seededRandom(1987)
  const w = ctx.canvas.width
  const h = ctx.canvas.height

  // dusk sky fading from deep night into a warm horizon
  gradient(ctx, 0, h, [
    [0, '#0b0a2a'],
    [0.45, '#2a1a5a'],
    [0.7, '#6a3a7a'],
    [0.85, '#c86a6a'],
    [1, '#e8a070'],
  ])

  // stars, a few brighter ones with a small cross
  for (let i = 0; i < 140; i++) {
    const x = Math.floor(random() * w)
    const y = Math.floor(random() * 130)
    ctx.fillStyle = random() < 0.3 ? '#ffe8c0' : '#c8d0ff'
    ctx.fillRect(x, y, 1, 1)
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(random() * w)
    const y = Math.floor(random() * 100)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x, y - 1, 1, 3)
    ctx.fillRect(x - 1, y, 3, 1)
  }

  // moon with a soft halo and a few craters
  ctx.fillStyle = 'rgba(255, 240, 200, 0.08)'
  for (let r = 34; r > 22; r -= 4) {
    ctx.beginPath()
    ctx.arc(250, 52, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#f4f0d8'
  ctx.beginPath()
  ctx.arc(250, 52, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ddd4b0'
  ;[
    [243, 46, 4],
    [256, 58, 3],
    [254, 44, 2],
    [246, 60, 2],
  ].forEach(([x, y, r]) => ctx.fillRect(x - r / 2, y - r / 2, r, r))

  // three layers of mountains, lighter in the distance
  ridge(ctx, random, 150, 6, '#4a2f6a')
  ridge(ctx, random, 168, 5, '#33224e')

  // castle on the hill: towers, battlements and lit windows
  const castle = '#1e1636'
  ctx.fillStyle = castle
  ctx.fillRect(116, 132, 88, 50)
  ;[
    [108, 112, 18, 70],
    [194, 112, 18, 70],
    [150, 96, 20, 86],
  ].forEach(([x, y, tw, th]) => {
    ctx.fillRect(x, y, tw, th)
    for (let bx = x; bx < x + tw; bx += 4) ctx.fillRect(bx, y - 3, 2, 3)
  })
  // pointed roofs
  ;[
    [117, 112, 11],
    [203, 112, 11],
    [160, 96, 12],
  ].forEach(([cx, y, half]) => {
    for (let i = 0; i < half; i++)
      ctx.fillRect(cx - half + i, y - i - 3, (half - i) * 2, 1)
  })
  for (let bx = 116; bx < 204; bx += 4) ctx.fillRect(bx, 129, 2, 3)
  ctx.fillStyle = '#ffd060'
  ;[
    [114, 124],
    [200, 124],
    [157, 108],
    [160, 120],
    [130, 146],
    [186, 146],
    [158, 150],
  ].forEach(([x, y]) => ctx.fillRect(x, y, 2, 3))

  // foreground hills with pine silhouettes
  ridge(ctx, random, 192, 4, '#171030')
  ctx.fillStyle = '#0e0a20'
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(random() * w)
    const base = 196 + Math.floor(random() * 10)
    const size = 6 + Math.floor(random() * 8)
    for (let r = 0; r < size; r++) {
      ctx.fillRect(
        x - Math.floor(r / 2),
        base - size + r,
        Math.floor(r / 2) * 2 + 1,
        1
      )
    }
  }
  ctx.fillRect(0, 214, w, h - 214)
}

const paintBattle = (ctx) => {
  const random = seededRandom(42)
  const w = ctx.canvas.width

  // bright sky over far hills, then a grassy field the battle stands on
  gradient(ctx, 0, 70, [
    [0, '#4a7ad0'],
    [1, '#b8dcf8'],
  ])
  for (let i = 0; i < 4; i++) {
    // a few flat pixel clouds
    const x = Math.floor(random() * w)
    const y = 8 + Math.floor(random() * 30)
    ctx.fillStyle = '#f0f8ff'
    ctx.fillRect(x, y, 24, 3)
    ctx.fillRect(x + 4, y - 2, 14, 2)
  }
  ridge(ctx, random, 56, 4, '#8aa0c8')
  ridge(ctx, random, 64, 3, '#5f8a6a')
  gradient(ctx, 70, ctx.canvas.height, [
    [0, '#5a9a42'],
    [1, '#3a7030'],
  ])
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(random() * w)
    const y = 72 + Math.floor(random() * 80)
    ctx.fillStyle = random() < 0.5 ? '#4a8a36' : '#6aaa4a'
    ctx.fillRect(x, y, random() < 0.3 ? 2 : 1, 1)
  }
}

export const createBackdrops = (scene) => {
  ;[
    ['title', 320, 240, paintTitle],
    ['battle-bg', 320, 150, paintBattle],
  ].forEach(([key, w, h, painter]) => {
    const texture = scene.textures.createCanvas(key, w, h)
    painter(texture.getContext())
    texture.refresh()
  })
}
