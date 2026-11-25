import { hdCanvas } from '../hd'
import { seeded } from './paintings/scene'

// The map's ground, painted for each floor when it loads: a meadow with drifting patches of light and
// shade, thousands of grass blades leaning in the wind, clover, flowers and pebbles. It is painted
// at 3 pixels per layout unit, soft enough for grass and light on memory for a map-sized picture.
// Returns the texture key
export const paintGround = (scene, width, height, seed) => {
  const key = `ground-${seed}`
  // only the current floor's ground is kept
  scene.textures.getTextureKeys().forEach((k) => {
    if (k.startsWith('ground-') && k !== key) scene.textures.remove(k)
  })
  return hdCanvas(
    scene,
    key,
    width,
    height,
    (ctx) => {
      const r = seeded(seed * 7919 + 13)
      ctx.fillStyle = '#5c9a3a'
      ctx.fillRect(0, 0, width, height)

      // big soft patches of warmer and cooler green, like light through clouds
      const patch = (x, y, radius, color, alpha) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
        g.addColorStop(0, `rgba(${color}, ${alpha})`)
        g.addColorStop(1, `rgba(${color}, 0)`)
        ctx.fillStyle = g
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }
      for (let i = 0; i < 70; i++) {
        const warm = r() < 0.5
        patch(
          r() * width,
          r() * height,
          20 + r() * 50,
          warm ? '150, 200, 90' : '40, 100, 50',
          0.25 + r() * 0.25
        )
      }
      for (let i = 0; i < 260; i++) {
        patch(
          r() * width,
          r() * height,
          3 + r() * 8,
          r() < 0.5 ? '120, 180, 70' : '50, 110, 40',
          0.3
        )
      }

      // grass blades: short curved strokes, dark ones first and light tips on top
      const blades = Math.round(width * height * 0.16)
      const tones = [
        ['#2e6a26', 0.55],
        ['#3e8030', 0.6],
        ['#6aac44', 0.6],
        ['#9ad062', 0.55],
      ]
      tones.forEach(([color, alpha], layer) => {
        ctx.strokeStyle = color
        ctx.globalAlpha = alpha
        ctx.lineWidth = 0.32
        ctx.lineCap = 'round'
        ctx.beginPath()
        for (let i = 0; i < blades / tones.length; i++) {
          const x = r() * width
          const y = r() * height
          const len = 1.6 + r() * 1.8 - layer * 0.15
          const lean = 0.4 + (r() - 0.5) * 0.9
          ctx.moveTo(x, y)
          ctx.quadraticCurveTo(x + lean * 0.3, y - len * 0.6, x + lean, y - len)
        }
        ctx.stroke()
      })
      ctx.globalAlpha = 1

      // clover patches
      for (let i = 0; i < 90; i++) {
        const cx = r() * width
        const cy = r() * height
        for (let k = 0; k < 6; k++) {
          const x = cx + (r() - 0.5) * 6
          const y = cy + (r() - 0.5) * 4
          ctx.fillStyle = r() < 0.5 ? '#4a9a3a' : '#7ac04e'
          for (let leaf = 0; leaf < 3; leaf++) {
            const a = (leaf / 3) * Math.PI * 2 - Math.PI / 2
            ctx.beginPath()
            ctx.arc(
              x + Math.cos(a) * 0.45,
              y + Math.sin(a) * 0.45,
              0.45,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
        }
      }

      // little flowers: five petals around a golden heart
      const petals = ['#ffffff', '#fff27a', '#ffa8d0', '#c0b0ff']
      for (let i = 0; i < Math.round(width * height * 0.0016); i++) {
        const x = r() * width
        const y = r() * height
        ctx.fillStyle = petals[Math.floor(r() * petals.length)]
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(
            x + Math.cos(a) * 0.45,
            y + Math.sin(a) * 0.4,
            0.38,
            0,
            Math.PI * 2
          )
          ctx.fill()
        }
        ctx.fillStyle = '#ffc030'
        ctx.beginPath()
        ctx.arc(x, y, 0.25, 0, Math.PI * 2)
        ctx.fill()
      }

      // pebbles with a lit top and a shadow below
      for (let i = 0; i < 70; i++) {
        const x = r() * width
        const y = r() * height
        const s = 0.6 + r() * 0.9
        ctx.fillStyle = 'rgba(20, 40, 20, 0.45)'
        ctx.beginPath()
        ctx.ellipse(x + 0.3, y + 0.35, s * 1.1, s * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
        const g = ctx.createLinearGradient(x - s, y - s, x + s, y + s)
        g.addColorStop(0, '#e0e2ea')
        g.addColorStop(1, '#7a8094')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(x, y, s, s * 0.7, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    3
  )
}
