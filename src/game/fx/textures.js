import { hdCanvas } from '../hd'

// Textures for the effects, painted at boot so no image files are needed. Most are painted at screen
// resolution (hdCanvas); the tiling cloud and mist layers are painted pixel by pixel at layout size,
// since they are soft anyway and tiling needs plain textures

const paint = (scene, key, width, height, pixel) => {
  if (scene.textures.exists(key)) return
  const texture = scene.textures.createCanvas(key, width, height)
  const ctx = texture.getContext()
  const image = ctx.createImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixel(x, y)
      const i = (y * width + x) * 4
      image.data[i] = r
      image.data[i + 1] = g
      image.data[i + 2] = b
      image.data[i + 3] = a
    }
  }
  ctx.putImageData(image, 0, 0)
  texture.refresh()
}

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const smooth = (t) => t * t * (3 - 2 * t)

// Value noise that wraps around every `period` lattice cells, so the texture tiles seamlessly
export const tileNoise = (seed) => {
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263 + seed * 144665) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295
  }
  return (x, y, period) => {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = smooth(x - x0)
    const fy = smooth(y - y0)
    const at = (i, j) =>
      hash(((i % period) + period) % period, ((j % period) + period) % period)
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx
    return top * (1 - fy) + bottom * fy
  }
}

export const createFxTextures = (scene) => {
  // soft round glow, white so it can be tinted: spell cores, fireflies, light blooms
  hdCanvas(scene, 'fx-glow', 32, 32, (ctx) => {
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      g.addColorStop(t, `rgba(255, 255, 255, ${(1 - t) * (1 - t)})`)
    }
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
  })

  // ground shadow, an ellipse that fades out at the rim
  hdCanvas(scene, 'fx-shadow', 32, 12, (ctx) => {
    ctx.save()
    ctx.translate(16, 6)
    ctx.scale(1, 6 / 16)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 16)
    g.addColorStop(0, 'rgba(8, 14, 30, 1)')
    g.addColorStop(0.45, 'rgba(8, 14, 30, 0.9)')
    g.addColorStop(1, 'rgba(8, 14, 30, 0)')
    ctx.fillStyle = g
    ctx.fillRect(-16, -16, 32, 32)
    ctx.restore()
  })

  // cloud shadows for a multiply blend: white is clear sky, the clouds a soft cool blue grey
  const noise = tileNoise(7)
  const size = 256
  paint(scene, 'fx-clouds', size, size, (x, y) => {
    let v = 0
    let weight = 0.55
    let total = 0
    for (const period of [4, 8, 16]) {
      v += noise((x / size) * period, (y / size) * period, period) * weight
      total += weight
      weight *= 0.5
    }
    v /= total
    const shade = 1 - smooth(clamp01((v - 0.48) / 0.18)) * 0.45
    return [
      Math.round(255 * shade + 255 * (1 - shade) * 0.08),
      Math.round(255 * shade + 255 * (1 - shade) * 0.14),
      Math.round(255 * shade + 255 * (1 - shade) * 0.38),
      255,
    ]
  })

  // wisps of mist, white on clear, tiling sideways. Fades out at the top and bottom edges so a band
  // of it has no hard border
  const mistNoise = tileNoise(23)
  paint(scene, 'fx-mist', 256, 48, (x, y) => {
    let v = 0
    let weight = 0.6
    for (const [px, py] of [
      [4, 1.5],
      [8, 3],
      [16, 6],
    ]) {
      v += mistNoise((x / 256) * px, (y / 48) * py, px) * weight
      weight *= 0.5
    }
    v /= 1.05
    const band = Math.sin((y / 47) * Math.PI)
    const a = smooth(clamp01((v - 0.35) * 2.2)) * band
    return [255, 255, 255, Math.round(a * 255)]
  })

  // a shaft of light: soft across, fading out toward its far end
  hdCanvas(scene, 'fx-ray', 40, 300, (ctx) => {
    const across = ctx.createLinearGradient(0, 0, 40, 0)
    across.addColorStop(0, 'rgba(255, 255, 255, 0)')
    across.addColorStop(0.5, 'rgba(255, 255, 255, 1)')
    across.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = across
    ctx.fillRect(0, 0, 40, 300)
    ctx.globalCompositeOperation = 'destination-in'
    const along = ctx.createLinearGradient(0, 0, 0, 300)
    along.addColorStop(0, 'rgba(0, 0, 0, 0)')
    along.addColorStop(0.1, 'rgba(0, 0, 0, 1)')
    along.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = along
    ctx.fillRect(0, 0, 40, 300)
  })

  // a falling raindrop's streak, brightest at its head
  hdCanvas(scene, 'fx-rain', 1, 8, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 8)
    g.addColorStop(0, 'rgba(220, 235, 255, 0)')
    g.addColorStop(1, 'rgba(235, 245, 255, 0.95)')
    ctx.fillStyle = g
    ctx.fillRect(0.3, 0, 0.4, 8)
  })

  // a speck of pollen or ash: a tiny soft dot
  hdCanvas(scene, 'fx-mote', 3, 3, (ctx) => {
    const g = ctx.createRadialGradient(1.5, 1.5, 0, 1.5, 1.5, 1.5)
    g.addColorStop(0, 'rgba(255, 255, 255, 1)')
    g.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)')
    g.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 3, 3)
  })

  // a sharp shard of ice, white so the element color tints it: a lit face and a shaded face
  hdCanvas(scene, 'fx-shard', 5, 11, (ctx) => {
    ctx.beginPath()
    ctx.moveTo(2.5, 0)
    ctx.lineTo(5, 5)
    ctx.lineTo(2.5, 11)
    ctx.lineTo(0, 5)
    ctx.closePath()
    ctx.fillStyle = '#c8d8ff'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(2.5, 0)
    ctx.lineTo(2.5, 11)
    ctx.lineTo(0, 5)
    ctx.closePath()
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  })
}
