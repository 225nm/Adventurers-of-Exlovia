// Shared look of the menus: blue gradient windows with a bevelled silver frame and rounded corners,
// a pointing hand cursor, and recolored copies of the bitmap font (grey, blue, red).
// Everything is drawn pixel by pixel into canvas textures at boot or on first use, so it stays crisp
// with the Canvas renderer (where Graphics gradients and setTint are not available)

const RADIUS = 4
// frame tones from the outside in: outline, then two bevel tones on the lit (top/left) and shaded
// (bottom/right) edges, then a dark line against the fill
const FRAMES = {
  silver: {
    outline: [10, 10, 28],
    lit: [
      [255, 255, 255],
      [196, 204, 230],
    ],
    shade: [
      [176, 184, 212],
      [118, 128, 170],
    ],
    inner: [16, 20, 66],
  },
  // used for the highlighted card on the party selection screen
  gold: {
    outline: [30, 16, 6],
    lit: [
      [255, 246, 176],
      [240, 200, 88],
    ],
    shade: [
      [216, 164, 56],
      [160, 104, 30],
    ],
    inner: [40, 22, 30],
  },
}
const FILLS = {
  blue: { top: [74, 104, 226], bottom: [10, 18, 92] },
  // darker fill for windows behind the active one
  dusk: { top: [44, 60, 150], bottom: [8, 12, 60] },
}

const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

// Draws a window of the given size into a cached canvas texture and returns its key
const windowTexture = (scene, w, h, frameName, fillName) => {
  const key = `ui-window-${w}x${h}-${frameName}-${fillName}`
  if (scene.textures.exists(key)) return key
  const frame = FRAMES[frameName]
  const fill = FILLS[fillName]
  const texture = scene.textures.createCanvas(key, w, h)
  const ctx = texture.getContext()
  const image = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = Math.min(x, w - 1 - x)
      const dy = Math.min(y, h - 1 - y)
      // how many pixels in from the edge, rounded off at the corners
      let inset = Math.min(dx, dy)
      if (dx < RADIUS && dy < RADIUS) {
        inset = Math.floor(
          RADIUS - Math.hypot(RADIUS - dx - 0.5, RADIUS - dy - 0.5)
        )
      }
      if (inset < 0) continue
      const lit = Math.min(x, y) <= Math.min(w - 1 - x, h - 1 - y)
      let color
      if (inset === 0) color = frame.outline
      else if (inset <= 2) color = (lit ? frame.lit : frame.shade)[inset - 1]
      else if (inset === 3) color = frame.inner
      else {
        // banded vertical gradient, one tone every two pixel rows
        const t = Math.min(1, Math.max(0, (y - 4) / Math.max(1, h - 9)))
        color = lerp(fill.top, fill.bottom, Math.round(t * (h / 2)) / (h / 2))
      }
      const i = (y * w + x) * 4
      image.data[i] = color[0]
      image.data[i + 1] = color[1]
      image.data[i + 2] = color[2]
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  texture.refresh()
  return key
}

// Pointing hand cursor, 13x9, drawn facing right
const POINTER = [
  '...ooooo.....',
  '..owwwwwooooo',
  '.owwwwwwwwwwo',
  'oowwwwwssssso',
  'ocowwwwooooo.',
  'ocowwwwwo....',
  'oowwwwsso....',
  '.ooossso.....',
  '...oooo......',
]
const POINTER_COLORS = {
  o: '#14142a',
  w: '#ffffff',
  s: '#a8b0d0',
  c: '#4a68d8',
}

// Copies of the white bitmap font in other colors: the glyphs are white with a dark outline, so only
// the white is replaced
const FONT_COLORS = {
  pressstartg: [138, 146, 170],
  pressstartb: [150, 206, 255],
  pressstartr: [255, 112, 96],
}

export const Ui = {
  // Pointer texture and font colors, called once by the boot scene after the fonts have loaded
  createTextures: function (scene) {
    const pointer = scene.textures.createCanvas(
      'ui-pointer',
      POINTER[0].length,
      POINTER.length
    )
    const ctx = pointer.getContext()
    POINTER.forEach((row, y) =>
      [...row].forEach((char, x) => {
        if (POINTER_COLORS[char]) {
          ctx.fillStyle = POINTER_COLORS[char]
          ctx.fillRect(x, y, 1, 1)
        }
      })
    )
    pointer.refresh()

    // four pointed twinkle, used on the title logo
    const sparkle = scene.textures.createCanvas('ui-sparkle', 7, 7)
    const sctx = sparkle.getContext()
    sctx.fillStyle = '#fff8d0'
    sctx.fillRect(3, 0, 1, 7)
    sctx.fillRect(0, 3, 7, 1)
    sctx.fillStyle = '#ffffff'
    sctx.fillRect(2, 2, 3, 3)
    sparkle.refresh()

    const font = scene.cache.bitmapFont.get('pressstart')
    const source = scene.textures.get('pressstart').getSourceImage()
    Object.entries(FONT_COLORS).forEach(([key, color]) => {
      const texture = scene.textures.createCanvas(
        key,
        source.width,
        source.height
      )
      const context = texture.getContext()
      context.drawImage(source, 0, 0)
      const image = context.getImageData(0, 0, source.width, source.height)
      for (let i = 0; i < image.data.length; i += 4) {
        // scale by brightness so the anti-aliased edge pixels keep their shade
        const k = image.data[i] / 255
        image.data[i] = color[0] * k
        image.data[i + 1] = color[1] * k
        image.data[i + 2] = color[2] * k
      }
      context.putImageData(image, 0, 0)
      texture.refresh()
      scene.cache.bitmapFont.add(key, {
        data: font.data,
        texture: key,
        frame: null,
      })
    })
  },

  // Adds a window with its top left corner at x, y. Options: frame 'silver' or 'gold', fill 'blue' or 'dusk'
  window: function (scene, x, y, w, h, options = {}) {
    const key = windowTexture(
      scene,
      w,
      h,
      options.frame || 'silver',
      options.fill || 'blue'
    )
    return scene.add.image(x, y, key).setOrigin(0, 0)
  },

  // Adds the hand cursor. It points at the left edge of whatever it is placed beside (origin on its
  // fingertip) and nudges back and forth
  pointer: function (scene) {
    const pointer = scene.add.image(0, 0, 'ui-pointer').setOrigin(1, 0.5)
    pointer.bob = 0
    scene.tweens.add({
      targets: pointer,
      bob: 2,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    // place beside a text object whose origin is on its left edge
    pointer.pointAt = (x, y) => {
      pointer.setPosition(Math.round(x - 2 - pointer.bob), Math.round(y))
      return pointer
    }
    return pointer
  },
}
