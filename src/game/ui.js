import { hdCanvas } from './hd'

// Shared look of the menus, in the style of modern JRPGs: panels of dark, slightly see-through glass
// with a cool glow along the top, a thin gilded frame with a hairline inside it and gems on the
// corners. A gloved hand is the cursor. Everything is painted at screen resolution into canvas
// textures, cached per size, at boot or on first use

const RADIUS = 3
// frame metals: the gilded line from its lit to its shaded end, the hairline inside it, the corner
// gems (light, mid, dark) and an inward glow
const FRAMES = {
  silver: {
    outline: 'rgba(2, 3, 12, 0.9)',
    light: '#fff4cc',
    mid: '#c9a65a',
    dark: '#6e5428',
    hairline: 'rgba(232, 208, 140, 0.3)',
    gem: ['#e0f4ff', '#5aa8f0', '#18348a'],
    glow: null,
  },
  // the highlighted card on the party selection screen: a brighter frame that glows inward
  gold: {
    outline: 'rgba(20, 10, 0, 0.95)',
    light: '#fffbe6',
    mid: '#ffd86a',
    dark: '#b07a1c',
    hairline: 'rgba(255, 226, 140, 0.6)',
    gem: ['#fff0f0', '#ff6a6a', '#8a1020'],
    glow: 'rgba(255, 196, 80, 0.5)',
  },
}
// the glass: top and bottom of its gradient, and the glow along its top edge
const FILLS = {
  blue: {
    top: 'rgba(28, 42, 94, 0.93)',
    bottom: 'rgba(6, 9, 30, 0.96)',
    glow: 'rgba(110, 160, 255, 0.26)',
  },
  // darker glass for windows behind the active one
  dusk: {
    top: 'rgba(18, 24, 56, 0.95)',
    bottom: 'rgba(4, 5, 18, 0.97)',
    glow: 'rgba(90, 120, 220, 0.14)',
  },
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// A small square-cut gem in a gold setting, turned on its point, centered on x, y
const gem = (ctx, x, y, size, frame) => {
  const [light, mid, dark] = frame.gem
  const s = size
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(Math.PI / 4)
  ctx.fillStyle = frame.outline
  ctx.fillRect(-s - 0.35, -s - 0.35, s * 2 + 0.7, s * 2 + 0.7)
  const setting = ctx.createLinearGradient(-s, -s, s, s)
  setting.addColorStop(0, frame.light)
  setting.addColorStop(0.5, frame.mid)
  setting.addColorStop(1, frame.dark)
  ctx.fillStyle = setting
  ctx.fillRect(-s, -s, s * 2, s * 2)
  const i = s * 0.6
  const stone = ctx.createLinearGradient(-i, -i, i, i)
  stone.addColorStop(0, light)
  stone.addColorStop(0.45, mid)
  stone.addColorStop(1, dark)
  ctx.fillStyle = stone
  ctx.fillRect(-i, -i, i * 2, i * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillRect(-i * 0.75, -i * 0.75, i * 0.6, i * 0.6)
  ctx.restore()
}

// A gilded corner bracket with a curl and a gem. sx, sy point from the corner into the window
const corner = (ctx, x, y, sx, sy, frame, w, h) => {
  const len = Math.min(10, w * 0.2, h * 0.34)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const bracket = () => {
    ctx.beginPath()
    ctx.moveTo(x + sx * len, y + sy * 1.1)
    ctx.lineTo(x + sx * 1.1, y + sy * 1.1)
    ctx.lineTo(x + sx * 1.1, y + sy * len)
  }
  const metal = ctx.createLinearGradient(x, y, x + sx * len, y + sy * len)
  metal.addColorStop(0, frame.light)
  metal.addColorStop(0.5, frame.mid)
  metal.addColorStop(1, 'rgba(0, 0, 0, 0)')
  bracket()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 1.1
  ctx.stroke()
  bracket()
  ctx.strokeStyle = metal
  ctx.lineWidth = 0.45
  ctx.stroke()
  // a curl tucked into the corner
  ctx.beginPath()
  ctx.moveTo(x + sx * 3.4, y + sy * 1.5)
  ctx.quadraticCurveTo(x + sx * 3.6, y + sy * 3.6, x + sx * 1.5, y + sy * 3.4)
  ctx.strokeStyle = frame.mid
  ctx.lineWidth = 0.35
  ctx.stroke()
  gem(ctx, x, y, Math.min(1.35, h * 0.06), frame)
}

const paintWindow = (frame, fill) => (ctx, w, h) => {
  const inset = 1.2
  const box = () =>
    roundRect(ctx, inset, inset, w - inset * 2, h - inset * 2, RADIUS)
  // the glass
  ctx.save()
  box()
  ctx.clip()
  const body = ctx.createLinearGradient(0, 0, 0, h)
  body.addColorStop(0, fill.top)
  body.addColorStop(1, fill.bottom)
  ctx.fillStyle = body
  ctx.fillRect(0, 0, w, h)
  // a cool glow along the top edge, brightest at the upper left, where the light comes from
  const glow = ctx.createRadialGradient(
    w * 0.25,
    -h * 0.3,
    0,
    w * 0.25,
    -h * 0.3,
    Math.max(w * 0.75, h * 1.1)
  )
  glow.addColorStop(0, fill.glow)
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  // a faint diagonal sheen across the glass
  const sheen = ctx.createLinearGradient(0, 0, w, h * 0.7)
  sheen.addColorStop(0.3, 'rgba(255, 255, 255, 0)')
  sheen.addColorStop(0.36, 'rgba(255, 255, 255, 0.05)')
  sheen.addColorStop(0.46, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, h)
  // the highlighted frame glows inward
  if (frame.glow) {
    ctx.shadowColor = frame.glow
    ctx.shadowBlur = 30
    ctx.strokeStyle = frame.glow
    ctx.lineWidth = 2
    box()
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  ctx.restore()

  // the frame: a dark outline, a thin gilded line lit from the upper left, a hairline inside it
  box()
  ctx.strokeStyle = frame.outline
  ctx.lineWidth = 1.4
  ctx.stroke()
  const gilt = ctx.createLinearGradient(0, 0, w * 0.4, h)
  gilt.addColorStop(0, frame.light)
  gilt.addColorStop(0.35, frame.mid)
  gilt.addColorStop(1, frame.dark)
  box()
  ctx.strokeStyle = gilt
  ctx.lineWidth = 0.5
  ctx.stroke()
  roundRect(
    ctx,
    inset + 1.4,
    inset + 1.4,
    w - inset * 2 - 2.8,
    h - inset * 2 - 2.8,
    RADIUS - 1
  )
  ctx.strokeStyle = frame.hairline
  ctx.lineWidth = 0.25
  ctx.stroke()
  // a bright glint running along the top edge
  const glint = ctx.createLinearGradient(inset, 0, w - inset, 0)
  glint.addColorStop(0, 'rgba(255, 250, 230, 0)')
  glint.addColorStop(0.18, 'rgba(255, 250, 230, 0.95)')
  glint.addColorStop(0.5, 'rgba(255, 250, 230, 0)')
  ctx.strokeStyle = glint
  ctx.lineWidth = 0.3
  ctx.beginPath()
  ctx.moveTo(inset + RADIUS, inset)
  ctx.lineTo(w - inset - RADIUS, inset)
  ctx.stroke()

  // ornaments on the corners, where the window is big enough to carry them
  if (w >= 40 && h >= 18) {
    corner(ctx, inset, inset, 1, 1, frame, w, h)
    corner(ctx, w - inset, inset, -1, 1, frame, w, h)
    corner(ctx, inset, h - inset, 1, -1, frame, w, h)
    corner(ctx, w - inset, h - inset, -1, -1, frame, w, h)
  }
}

export const Ui = {
  // The hand cursor and the twinkle, called once by the boot scene
  createTextures: function (scene) {
    // a white glove pointing right, its fingertip at the right edge
    hdCanvas(scene, 'ui-pointer', 15, 10, (ctx) => {
      ctx.lineJoin = 'round'
      ctx.lineWidth = 0.7
      ctx.strokeStyle = '#141632'
      const glove = ctx.createLinearGradient(0, 1, 0, 9)
      glove.addColorStop(0, '#ffffff')
      glove.addColorStop(0.6, '#e4e8f6')
      glove.addColorStop(1, '#9aa2c8')
      // cuff
      roundRect(ctx, 0.5, 2.2, 3.4, 6, 1)
      const cuff = ctx.createLinearGradient(0, 2, 0, 8)
      cuff.addColorStop(0, '#fff0b0')
      cuff.addColorStop(1, '#a8761e')
      ctx.fillStyle = cuff
      ctx.fill()
      ctx.stroke()
      // fingers curled under the palm
      roundRect(ctx, 3.4, 4.6, 6.2, 4, 1.8)
      ctx.fillStyle = glove
      ctx.fill()
      ctx.stroke()
      // palm and pointing finger
      ctx.beginPath()
      ctx.moveTo(3.6, 2.6)
      ctx.quadraticCurveTo(5.5, 1.2, 8.2, 1.4)
      ctx.lineTo(13.4, 1.4)
      ctx.quadraticCurveTo(14.6, 1.4, 14.6, 2.6)
      ctx.quadraticCurveTo(14.6, 3.8, 13.4, 3.8)
      ctx.lineTo(9, 3.8)
      ctx.quadraticCurveTo(9.8, 5.4, 8.4, 6)
      ctx.lineTo(4, 6.2)
      ctx.closePath()
      ctx.fillStyle = glove
      ctx.fill()
      ctx.stroke()
    })
    // a four pointed twinkle with a soft glow, used on the title logo and chests
    hdCanvas(scene, 'ui-sparkle', 9, 9, (ctx) => {
      const glow = ctx.createRadialGradient(4.5, 4.5, 0, 4.5, 4.5, 4.5)
      glow.addColorStop(0, 'rgba(255, 250, 220, 0.9)')
      glow.addColorStop(0.35, 'rgba(255, 240, 180, 0.35)')
      glow.addColorStop(1, 'rgba(255, 240, 180, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 9, 9)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(4.5, 0)
      ctx.quadraticCurveTo(5, 4, 9, 4.5)
      ctx.quadraticCurveTo(5, 5, 4.5, 9)
      ctx.quadraticCurveTo(4, 5, 0, 4.5)
      ctx.quadraticCurveTo(4, 4, 4.5, 0)
      ctx.fill()
    })
    // a band of gold light fading out to the right, behind the highlighted row of a list
    hdCanvas(scene, 'ui-rowglow', 64, 8, (ctx) => {
      const band = ctx.createLinearGradient(0, 0, 64, 0)
      band.addColorStop(0, 'rgba(255, 214, 110, 0.42)')
      band.addColorStop(0.5, 'rgba(255, 200, 90, 0.16)')
      band.addColorStop(1, 'rgba(255, 200, 90, 0)')
      ctx.fillStyle = band
      ctx.fillRect(0, 0.5, 64, 7)
      const edge = ctx.createLinearGradient(0, 0, 64, 0)
      edge.addColorStop(0, 'rgba(255, 240, 190, 0.9)')
      edge.addColorStop(0.7, 'rgba(255, 240, 190, 0)')
      ctx.fillStyle = edge
      ctx.fillRect(0, 0.3, 64, 0.3)
      ctx.fillRect(0, 7.4, 64, 0.3)
    })
    // a gold crystal pointing down, hovering over the unit whose turn it is
    hdCanvas(scene, 'ui-marker', 7, 10, (ctx) => {
      const glow = ctx.createRadialGradient(3.5, 4, 0, 3.5, 4, 3.5)
      glow.addColorStop(0, 'rgba(255, 230, 140, 0.6)')
      glow.addColorStop(1, 'rgba(255, 230, 140, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 7, 8)
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(3.5, 9.6)
      ctx.lineTo(0.8, 3.6)
      ctx.lineTo(2.2, 1)
      ctx.lineTo(4.8, 1)
      ctx.lineTo(6.2, 3.6)
      ctx.closePath()
      ctx.fillStyle = '#2a1604'
      ctx.lineWidth = 0.9
      ctx.strokeStyle = '#2a1604'
      ctx.stroke()
      const stone = ctx.createLinearGradient(0.8, 1, 6.2, 9)
      stone.addColorStop(0, '#fffbe0')
      stone.addColorStop(0.4, '#ffd04a')
      stone.addColorStop(1, '#a05a10')
      ctx.fillStyle = stone
      ctx.fill()
      // facets
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.beginPath()
      ctx.moveTo(2.2, 1)
      ctx.lineTo(3.5, 3.6)
      ctx.lineTo(0.8, 3.6)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(120, 50, 0, 0.35)'
      ctx.beginPath()
      ctx.moveTo(3.5, 3.6)
      ctx.lineTo(6.2, 3.6)
      ctx.lineTo(3.5, 9.6)
      ctx.closePath()
      ctx.fill()
    })
  },

  // Adds a window with its top left corner at x, y. Options: frame 'silver' or 'gold', fill 'blue' or 'dusk'
  window: function (scene, x, y, w, h, options = {}) {
    const frame = options.frame || 'silver'
    const fill = options.fill || 'blue'
    const key = `ui-window-${w}x${h}-${frame}-${fill}`
    hdCanvas(scene, key, w, h, paintWindow(FRAMES[frame], FILLS[fill]))
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
      pointer.setPosition(x - 2 - pointer.bob, y)
      return pointer
    }
    return pointer
  },
}
