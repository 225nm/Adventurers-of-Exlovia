import Phaser from 'phaser'
import { Fx } from './index.js'
import { HD } from '../hd.js'

// the title and battle cameras are centered on the 320 wide layout, the screen's left edge is here
const LEFT = -HD.OFFSET_X

const ADD = Phaser.BlendModes.ADD

// where the moon sits on the title backdrop (title-bg), shared by the title and party selection
const TITLE_MOON = { x: 280, y: 95 }

// Bigger pieces of scenery built from the effects: the title backdrop's moonlit night, and the
// battle backdrop's sky in each floor's mood
export const Scenery = {
  // The title backdrop's night: bloom on the moon and lit windows, a halo around the moon, low
  // banks of mist drifting past the castle, and now and then a shooting star
  moonlitNight: function (scene) {
    Fx.look(scene, {
      bloom: 0.95,
      threshold: 0.78,
      saturation: 1.08,
      contrast: 1.04,
      vignette: 0.45,
      shadowTint: [0.0, -0.01, 0.05],
      highlightTint: [0.04, 0.03, 0.0],
    })
    if (!Fx.enabled(scene)) return
    const halo = scene.add
      .image(TITLE_MOON.x, TITLE_MOON.y, 'fx-glow')
      .setScale(3.2)
      .setTint(0xfff0c0)
      .setAlpha(0.22)
      .setBlendMode(ADD)
    scene.tweens.add({
      targets: halo,
      alpha: 0.3,
      scale: 3.4,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    this.mist(scene, 150, 0.24, 0.006)
    this.mist(scene, 166, 0.18, -0.004)
    scene.time.addEvent({
      delay: 3800,
      loop: true,
      callback: () => this.shootingStar(scene),
    })
  },

  // A band of mist at height y sliding sideways at speed pixels per millisecond
  mist: function (scene, y, alpha, speed, color = 0xc8c0ff) {
    if (!Fx.enabled(scene)) return null
    const band = scene.add
      .tileSprite(LEFT, y, HD.VIEW_W, 48, 'fx-mist')
      .setOrigin(0, 0.5)
      .setAlpha(alpha)
      .setTint(color)
      .setBlendMode(ADD)
    const drift = (time) => (band.tilePositionX = time * speed)
    scene.events.on('update', drift)
    band.once('destroy', () => scene.events.off('update', drift))
    return band
  },

  // A streak of light that falls across the sky and burns out, sometimes. area is the sky
  shootingStar: function (
    scene,
    area = { x: 60, y: 4, width: 240, height: 36 }
  ) {
    if (Math.random() < 0.35) return
    const x = area.x + Math.random() * area.width
    const y = area.y + Math.random() * area.height
    const head = scene.add
      .image(x, y, 'fx-glow')
      .setScale(0.18)
      .setBlendMode(ADD)
    const tail = scene.add.particles(0, 0, 'fx-mote', {
      follow: head,
      lifespan: 260,
      alpha: { start: 0.9, end: 0 },
      tint: [0xffffff, 0xd8e0ff],
      frequency: 8,
      blendMode: ADD,
    })
    scene.tweens.add({
      targets: head,
      x: x - 70,
      y: y + 34,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeIn',
      onComplete: () => {
        head.destroy()
        tail.stop()
        scene.time.delayedCall(300, () => tail.destroy())
      },
    })
  },

  // Repaints the battle backdrop's sky for a floor's mood: a gradient laid over the painted sky
  // that fades out toward the horizon (horizonY), plus whatever is up there: the low sun at dusk,
  // the moon and stars at night, strange stars in the abyss, storm clouds in the rain. Returns the
  // objects it made, so a reused scene can clear them. Needs WebGL (Graphics gradients)
  battleSky: function (scene, mood, horizonY, depth) {
    const sky = mood.rain ? SKIES.rain : SKIES[mood.name]
    if (!sky || !Fx.enabled(scene)) return []
    const made = []
    const g = scene.add.graphics().setDepth(depth)
    // the painted sky shows through less near the top, the horizon color fades to nothing
    g.fillGradientStyle(
      sky.top,
      sky.top,
      sky.horizon,
      sky.horizon,
      sky.alpha,
      sky.alpha,
      sky.alpha * 0.55,
      sky.alpha * 0.55
    )
    g.fillRect(LEFT, 0, HD.VIEW_W, Math.round(horizonY * 0.55))
    g.fillGradientStyle(
      sky.horizon,
      sky.horizon,
      sky.horizon,
      sky.horizon,
      sky.alpha * 0.55,
      sky.alpha * 0.55,
      0,
      0
    )
    g.fillRect(
      LEFT,
      Math.round(horizonY * 0.55),
      HD.VIEW_W,
      horizonY - Math.round(horizonY * 0.55)
    )
    made.push(g)

    if (sky.sun) {
      // a big soft sun sinking behind the mountains
      const sun = scene.add
        .image(sky.sun.x, sky.sun.y, 'fx-glow')
        .setScale(2.4, 1.6)
        .setTint(sky.sun.color)
        .setAlpha(0.75)
        .setBlendMode(ADD)
        .setDepth(depth)
      const core = scene.add
        .image(sky.sun.x, sky.sun.y + 2, 'fx-glow')
        .setScale(0.5)
        .setTint(0xfff0c0)
        .setBlendMode(ADD)
        .setDepth(depth)
      made.push(sun, core)
    }
    if (sky.stars) {
      for (let i = 0; i < sky.stars; i++) {
        const star = scene.add
          .rectangle(
            LEFT + Math.random() * HD.VIEW_W,
            Phaser.Math.Between(2, Math.round(horizonY * 0.45)),
            1,
            1,
            Phaser.Utils.Array.GetRandom(sky.starColors)
          )
          .setBlendMode(ADD)
          .setDepth(depth)
          .setAlpha(0.4 + Math.random() * 0.6)
        scene.tweens.add({
          targets: star,
          alpha: 0.15,
          duration: Phaser.Math.Between(700, 1800),
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2000,
        })
        made.push(star)
      }
    }
    if (sky.moon) {
      const halo = scene.add
        .image(sky.moon.x, sky.moon.y, 'fx-glow')
        .setScale(1.6)
        .setTint(sky.moon.color)
        .setAlpha(0.35)
        .setBlendMode(ADD)
        .setDepth(depth)
      // a full moon, added on so it shines through the night's darkness, with a few grey seas
      const disc = scene.add
        .circle(sky.moon.x, sky.moon.y, 6, sky.moon.color)
        .setBlendMode(ADD)
        .setDepth(depth)
      const seas = [
        [-2, -2, 2],
        [2, 1, 1.5],
        [-1, 3, 1],
      ].map(([dx, dy, r]) =>
        scene.add
          .circle(sky.moon.x + dx, sky.moon.y + dy, r, 0x8a8470, 0.5)
          .setDepth(depth)
      )
      made.push(halo, disc, ...seas)
    }
    if (sky.storm) {
      // dark clouds rolling past over the painted ones
      const clouds = Scenery.mist(scene, 14, 0.5, 0.004, 0x3a4050)
      if (clouds) {
        clouds
          .setBlendMode(Phaser.BlendModes.MULTIPLY)
          .setScale(1, 0.8)
          .setDepth(depth)
        made.push(clouds)
      }
    }
    return made
  },
}

// The battle sky of each mood. top and horizon are the gradient's colors, alpha how much it
// covers the painted daytime sky
const SKIES = {
  afternoon: { top: 0x5a8ad8, horizon: 0xffc070, alpha: 0.45 },
  dusk: {
    top: 0x3a2a6a,
    horizon: 0xff8a5a,
    alpha: 0.82,
    sun: { x: 236, y: 40, color: 0xff7a3a },
  },
  night: {
    top: 0x060a24,
    horizon: 0x2a3670,
    alpha: 0.9,
    stars: 34,
    starColors: [0xffffff, 0xd8e4ff, 0xfff0c0],
    moon: { x: 272, y: 14, color: 0xfff4d0 },
  },
  abyss: {
    top: 0x12041e,
    horizon: 0x5a2470,
    alpha: 0.92,
    stars: 26,
    starColors: [0xe0a0ff, 0xff90d0, 0xa0c0ff],
  },
  rain: { top: 0x3a4250, horizon: 0x8a92a4, alpha: 0.78, storm: true },
}
