// Textures for the effects, drawn pixel by pixel at boot so no image files are needed

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
const tileNoise = (seed) => {
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

// 4x4 ordered dither, for soft edges that stay pixel crisp
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const bayer = (x, y) => (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16

export const createFxTextures = (scene) => {
  // soft round glow, white so it can be tinted: spell cores, fireflies, light blooms
  paint(scene, 'fx-glow', 32, 32, (x, y) => {
    const d = Math.hypot(x - 15.5, y - 15.5) / 16
    const a = clamp01(1 - d)
    return [255, 255, 255, Math.round(a * a * 255)]
  })

  // ground shadow, an ellipse that fades out at the rim
  paint(scene, 'fx-shadow', 32, 12, (x, y) => {
    const d = Math.hypot((x - 15.5) / 16, (y - 5.5) / 6)
    const a = clamp01((1 - d) * 2.2)
    return [8, 14, 30, Math.round(smooth(a) * 255)]
  })

  // cloud shadows for a multiply blend: white is clear sky, the clouds a cool blue grey. Two
  // levels (shadow, deeper core) with dithered edges, so they look painted in pixels
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
    const t = bayer(x, y) * 0.06 - 0.03
    const shade = v + t > 0.6 ? 0.55 : v + t > 0.52 ? 0.75 : 1
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
    const a = clamp01((v - 0.35) * 2.2) * band
    const stepped = Math.floor(a * 6 + bayer(x, y)) / 6
    return [255, 255, 255, Math.round(clamp01(stepped) * 255)]
  })

  // a shaft of light: soft across, fading out toward its far end
  paint(scene, 'fx-ray', 40, 300, (x, y) => {
    const across = Math.sin((x / 39) * Math.PI)
    const along = clamp01(1 - y / 300) * clamp01(y / 30)
    return [255, 255, 255, Math.round(across * across * along * 255)]
  })

  // a speck of pollen
  paint(scene, 'fx-mote', 3, 3, (x, y) => {
    const center = x === 1 && y === 1
    const edge = x === 1 || y === 1
    return [255, 255, 255, center ? 255 : edge ? 110 : 0]
  })

  // a sharp shard of ice, white so the element color tints it
  paint(scene, 'fx-shard', 5, 11, (x, y) => {
    const half = Math.abs(x - 2)
    const width = y < 5 ? y / 2.4 : (10 - y) / 2.4
    if (half > width) return [0, 0, 0, 0]
    const lit = x <= 2 ? 255 : 200
    return [lit, lit, 255, 255]
  })
}
