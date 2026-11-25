import { hdCanvas } from '../hd'
import { FONTS } from '../text'

// The title logo, painted at screen resolution in Cinzel: gold letters graded from pale gold to deep
// amber, a dark outline, a bright rim along their tops, a soft drop shadow and a thin ornamental rule
// with a jewel between the two lines. Needs the fonts loaded (BootScene waits for them)

const W = 300
const H = 74

export const createLogo = (scene) => {
  hdCanvas(scene, 'title-logo', W, H, (ctx) => {
    const lines = [
      { text: 'ADVENTURERS OF', size: 15, y: 17, spacing: 2.2 },
      { text: 'EXLOVIA', size: 38, y: 56, spacing: 3 },
    ]
    lines.forEach(({ text, size, y, spacing }) => {
      ctx.font = `900 ${size}px ${FONTS.title}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.letterSpacing = `${spacing}px`
      ctx.lineJoin = 'round'
      const x = W / 2
      const top = y - size * 0.4
      const bottom = y + size * 0.4

      // soft shadow beneath
      ctx.save()
      ctx.shadowColor = 'rgba(6, 2, 24, 0.85)'
      ctx.shadowBlur = size * 0.25
      ctx.shadowOffsetY = size * 0.08
      ctx.lineWidth = size * 0.16
      ctx.strokeStyle = '#2a0e04'
      ctx.strokeText(text, x, y)
      ctx.restore()

      // dark outline, then a thinner bronze one inside it
      ctx.lineWidth = size * 0.16
      ctx.strokeStyle = '#2a0e04'
      ctx.strokeText(text, x, y)
      ctx.lineWidth = size * 0.07
      ctx.strokeStyle = '#a8621c'
      ctx.strokeText(text, x, y)

      // gold, pale at the top and deep amber at the bottom with a bright band across the middle
      const gold = ctx.createLinearGradient(0, top, 0, bottom)
      gold.addColorStop(0, '#fffbe0')
      gold.addColorStop(0.3, '#ffe27a')
      gold.addColorStop(0.5, '#fff2b0')
      gold.addColorStop(0.56, '#f0b440')
      gold.addColorStop(1, '#b0661a')
      ctx.fillStyle = gold
      ctx.fillText(text, x, y)

      // a rim of light on the upper edges
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.fillText(text, x, y - size * 0.05)
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = gold
      ctx.fillText(text, x, y + size * 0.03)
      ctx.restore()
    })

    // ornamental rule between the lines: tapering gold lines and a red jewel
    const ruleY = 30
    const rule = ctx.createLinearGradient(40, 0, W - 40, 0)
    rule.addColorStop(0, 'rgba(240, 190, 80, 0)')
    rule.addColorStop(0.5, 'rgba(255, 230, 150, 1)')
    rule.addColorStop(1, 'rgba(240, 190, 80, 0)')
    ctx.fillStyle = rule
    ctx.fillRect(40, ruleY - 0.4, W - 80, 0.8)
    ctx.save()
    ctx.translate(W / 2, ruleY)
    ctx.rotate(Math.PI / 4)
    ctx.fillStyle = '#2a0e04'
    ctx.fillRect(-2.6, -2.6, 5.2, 5.2)
    const jewel = ctx.createLinearGradient(-2, -2, 2, 2)
    jewel.addColorStop(0, '#ff9a9a')
    jewel.addColorStop(0.5, '#d8203a')
    jewel.addColorStop(1, '#6a0818')
    ctx.fillStyle = jewel
    ctx.fillRect(-1.9, -1.9, 3.8, 3.8)
    ctx.restore()
  })
}
