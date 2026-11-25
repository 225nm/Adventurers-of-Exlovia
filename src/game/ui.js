import { hdCanvas } from './hd'

// Shared look of the menus: deep blue windows with a soft sheen, a bevelled metal frame and rounded
// corners, and a gloved hand cursor. Everything is painted at screen resolution into canvas textures,
// cached per size, at boot or on first use

const RADIUS = 4.5
// frame metals, from the lit top left to the shaded bottom right
const FRAMES = {
  silver: {
    outline: '#080a22',
    light: '#ffffff',
    mid: '#c8d0ea',
    dark: '#6a74a0',
    inner: '#0c1240',
  },
  // the highlighted card on the party selection screen
  gold: {
    outline: '#1e1004',
    light: '#fff6c8',
    mid: '#f0c858',
    dark: '#9a6418',
    inner: '#2a1606',
  },
}
const FILLS = {
  blue: { top: '#4a6ae0', mid: '#203aa8', bottom: '#0a1258' },
  // darker fill for windows behind the active one
  dusk: { top: '#2e4096', mid: '#18266e', bottom: '#080c3a' },
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

const paintWindow = (frame, fill) => (ctx, w, h) => {
  // metal frame: outline, then a bevel lit from the upper left
  roundRect(ctx, 0, 0, w, h, RADIUS)
  ctx.fillStyle = frame.outline
  ctx.fill()
  const bevel = ctx.createLinearGradient(0, 0, w * 0.35, h)
  bevel.addColorStop(0, frame.light)
  bevel.addColorStop(0.45, frame.mid)
  bevel.addColorStop(1, frame.dark)
  roundRect(ctx, 0.6, 0.6, w - 1.2, h - 1.2, RADIUS - 0.6)
  ctx.fillStyle = bevel
  ctx.fill()
  roundRect(ctx, 2, 2, w - 4, h - 4, RADIUS - 1.8)
  ctx.fillStyle = frame.inner
  ctx.fill()

  // the window's body: a deep blue gradient with a soft glow near the top
  ctx.save()
  roundRect(ctx, 2.5, 2.5, w - 5, h - 5, RADIUS - 2.2)
  ctx.clip()
  const body = ctx.createLinearGradient(0, 2.5, 0, h - 2.5)
  body.addColorStop(0, fill.top)
  body.addColorStop(0.45, fill.mid)
  body.addColorStop(1, fill.bottom)
  ctx.fillStyle = body
  ctx.fillRect(0, 0, w, h)
  const sheen = ctx.createRadialGradient(
    w * 0.3,
    -h * 0.2,
    0,
    w * 0.3,
    -h * 0.2,
    Math.max(w, h) * 0.9
  )
  sheen.addColorStop(0, 'rgba(160, 190, 255, 0.35)')
  sheen.addColorStop(1, 'rgba(160, 190, 255, 0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, h)
  // a thin highlight along the top edge and a shadow along the bottom, for depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.fillRect(0, 2.5, w, 0.5)
  const floor = ctx.createLinearGradient(0, h - 8, 0, h)
  floor.addColorStop(0, 'rgba(0, 0, 20, 0)')
  floor.addColorStop(1, 'rgba(0, 0, 20, 0.35)')
  ctx.fillStyle = floor
  ctx.fillRect(0, h - 8, w, 8)
  ctx.restore()
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
      cuff.addColorStop(0, '#7a9af8')
      cuff.addColorStop(1, '#2a44b0')
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
