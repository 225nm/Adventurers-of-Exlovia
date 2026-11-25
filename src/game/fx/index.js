import Phaser from 'phaser'
import { LookPipeline, DEFAULT_LOOK, MAX_LIGHTS } from './lookPipeline.js'
import { DissolvePipeline } from './dissolvePipeline.js'
import { WindPipeline } from './windPipeline.js'
import { createFxTextures } from './textures.js'

export { LookPipeline, DissolvePipeline, WindPipeline }

// Shader pipelines, registered with the game in start.js
export const PIPELINES = {
  Look: LookPipeline,
  Dissolve: DissolvePipeline,
  Wind: WindPipeline,
}

// The light and color of each depth of the dungeon. Deeper floors get darker, so the party's
// lantern, the stairs' glow and fireflies start to matter. Each mood also sets the atmosphere:
// drifting cloud shadows, sun shafts, and pollen or fireflies in the air
const MOODS = [
  {
    name: 'day',
    fromFloor: 1,
    look: { tiltShift: 0.6, vignette: 0.28, bloom: 0.55 },
    clouds: 0.3,
    rays: 0.1,
    rayColor: 0xfff2c0,
    motes: 'pollen',
    lantern: 0,
  },
  {
    name: 'afternoon',
    fromFloor: 3,
    look: {
      ambientColor: [1.04, 0.94, 0.8],
      highlightTint: [0.07, 0.035, -0.03],
      shadowTint: [0.01, -0.012, 0.04],
      tiltShift: 0.6,
      vignette: 0.32,
      bloom: 0.65,
    },
    clouds: 0.26,
    rays: 0.16,
    rayColor: 0xffc870,
    motes: 'pollen',
    lantern: 0,
  },
  {
    name: 'dusk',
    fromFloor: 5,
    look: {
      ambient: 0.62,
      ambientColor: [1, 0.72, 0.8],
      highlightTint: [0.06, 0.02, -0.01],
      shadowTint: [0.01, -0.01, 0.05],
      saturation: 1.05,
      tiltShift: 0.6,
      vignette: 0.42,
      bloom: 0.85,
      threshold: 0.66,
    },
    clouds: 0.14,
    rays: 0.07,
    rayColor: 0xff9a60,
    motes: 'fireflies',
    fireflies: 8,
    lantern: 0.75,
  },
  {
    name: 'night',
    fromFloor: 7,
    look: {
      ambient: 0.36,
      ambientColor: [0.5, 0.6, 1.05],
      highlightTint: [0.02, 0.02, 0.0],
      shadowTint: [0.0, 0.0, 0.05],
      saturation: 0.92,
      tiltShift: 0.6,
      vignette: 0.5,
      bloom: 1.1,
      threshold: 0.6,
    },
    clouds: 0,
    rays: 0,
    motes: 'fireflies',
    fireflies: 14,
    lantern: 1,
  },
  {
    name: 'abyss',
    fromFloor: 10,
    look: {
      ambient: 0.28,
      ambientColor: [0.62, 0.42, 0.95],
      highlightTint: [0.03, 0.0, 0.04],
      shadowTint: [0.02, 0.0, 0.06],
      saturation: 0.95,
      tiltShift: 0.6,
      vignette: 0.55,
      bloom: 1.2,
      threshold: 0.58,
    },
    clouds: 0,
    rays: 0,
    motes: 'fireflies',
    fireflies: 10,
    fireflyColor: 0xc89bff,
    lantern: 1,
  },
]

// Enemies that give off light, by battle texture
const CREATURE_GLOWS = {
  'wisp-fire': { color: [1, 0.55, 0.2], radius: 40, intensity: 1 },
  'wisp-ice': { color: [0.45, 0.75, 1], radius: 40, intensity: 1 },
  'dark-mage': { color: [0.7, 0.4, 1], radius: 26, intensity: 0.7 },
  'dragon-orange': { color: [1, 0.6, 0.3], radius: 30, intensity: 0.4 },
}

const toRgb = (hex) => [
  ((hex >> 16) & 255) / 255,
  ((hex >> 8) & 255) / 255,
  (hex & 255) / 255,
]

export const Fx = {
  // Shaders and blend effects need WebGL, under Canvas every effect is skipped
  enabled: function (scene) {
    return scene.sys.game.renderer.type === Phaser.WEBGL
  },

  // Generated textures shared by the effects, called once by the boot scene
  createTextures: function (scene) {
    createFxTextures(scene)
  },

  // The light and weather of a floor. Some floors are rainy: overcast, greyer and darker, with no
  // sun shafts, pollen or cloud shadows
  mood: function (floor) {
    const mood = MOODS.filter((m) => floor >= m.fromFloor).pop()
    const rainy = floor % 4 === 2 && floor < 10
    if (!rainy) return mood
    const look = { ...DEFAULT_LOOK, ...mood.look }
    return {
      ...mood,
      rain: true,
      clouds: 0,
      rays: 0,
      motes: mood.motes === 'fireflies' ? 'fireflies' : null,
      fireflies: Math.ceil((mood.fireflies || 0) / 2),
      look: {
        ...mood.look,
        ambient: look.ambient * 0.82,
        ambientColor: look.ambientColor.map(
          (c, i) => c * [0.88, 0.94, 1.04][i]
        ),
        saturation: look.saturation * 0.78,
        contrast: 1.02,
        highlightTint: [0.0, 0.01, 0.03],
      },
    }
  },

  // Rain: streaks falling at a slant across the screen, and drops splashing on the ground. Every
  // so often lightning flashes and thunder rolls (thunder is a callback, so this file stays free
  // of audio). area is the ground the splashes land on, in screen space. Returns what it made
  rain: function (scene, depth, area, thunder) {
    if (!this.enabled(scene)) return []
    const ground = area || { x: 0, y: 0, width: 320, height: 240 }
    const streaks = scene.add
      .particles(0, 0, 'fx-rain', {
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(-20, -12, 400, 4),
        },
        speedY: { min: 300, max: 360 },
        speedX: { min: -80, max: -60 },
        rotate: 12,
        lifespan: 900,
        alpha: { min: 0.35, max: 0.7 },
        frequency: 6,
        quantity: 2,
      })
      .setScrollFactor(0)
      .setDepth(depth)
    const splashes = scene.add
      .particles(0, 0, 'fx-mote', {
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(
            ground.x,
            ground.y,
            ground.width,
            ground.height
          ),
        },
        speedX: { min: -14, max: 14 },
        speedY: { min: -22, max: -8 },
        gravityY: 120,
        lifespan: 220,
        scale: { start: 0.7, end: 0.3 },
        alpha: { start: 0.7, end: 0 },
        tint: 0xd8e8ff,
        frequency: 18,
        quantity: 2,
      })
      .setScrollFactor(0)
      .setDepth(depth)
    const storm = scene.time.addEvent({
      delay: 9000,
      loop: true,
      callback: () => {
        if (Math.random() < 0.4) return
        this.flash(scene, 0xe8f0ff, 0.45, 120)
        scene.time.delayedCall(170, () => this.flash(scene, 0xe8f0ff, 0.3, 260))
        if (thunder) scene.time.delayedCall(500, thunder)
      },
    })
    streaks.once('destroy', () => storm.remove())
    return [streaks, splashes]
  },

  // Puts the look pass on a scene's main camera with the given settings, and keeps its lights in
  // screen space every frame. Returns the pipeline, or null under Canvas
  look: function (scene, settings = {}) {
    if (!this.enabled(scene)) return null
    const cam = scene.cameras.main
    cam.setPostPipeline(LookPipeline)
    const pipeline = cam.getPostPipeline(LookPipeline)
    pipeline.settings = { ...DEFAULT_LOOK, ...settings }
    scene.fxLights = []
    scene.fxLook = pipeline
    // world lights to screen pixels, the nearest to the middle of the screen win
    const update = () => {
      const view = cam.worldView
      const cx = view.centerX
      const cy = view.centerY
      pipeline.lights = scene.fxLights
        .filter((l) => l.intensity > 0 && l.radius > 0)
        .map((l) => {
          const x = l.follow ? l.follow.x + (l.offsetX || 0) : l.x
          const y = l.follow ? l.follow.y + (l.offsetY || 0) : l.y
          return {
            x: (x - view.x) * cam.zoom,
            y: (y - view.y) * cam.zoom,
            radius: l.radius * cam.zoom,
            intensity: l.intensity * (l.flicker ? l.flickerValue : 1),
            color: l.color,
            score:
              Math.hypot(x - cx, y - cy) - l.radius - (l.priority || 0) * 1000,
          }
        })
        .sort((a, b) => a.score - b.score)
        .slice(0, MAX_LIGHTS)
    }
    scene.events.on('prerender', update)
    scene.events.once('shutdown', () => {
      scene.events.off('prerender', update)
      scene.fxLights = []
    })
    return pipeline
  },

  // Adds a point light, in world coordinates or following a game object. Returns the light so it
  // can be changed, tweened (intensity, radius) or removed with Fx.removeLight
  addLight: function (scene, options) {
    if (!scene.fxLights) return null
    const light = {
      x: 0,
      y: 0,
      radius: 40,
      intensity: 1,
      color: [1, 0.85, 0.6],
      flickerValue: 1,
      ...options,
    }
    if (typeof light.color === 'number') light.color = toRgb(light.color)
    if (light.flicker) {
      // a lantern's flame breathes a little
      light.flickerTween = scene.tweens.add({
        targets: light,
        flickerValue: { from: 0.88, to: 1.05 },
        duration: 180 + Math.random() * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
    scene.fxLights.push(light)
    return light
  },

  removeLight: function (scene, light) {
    if (!light || !scene.fxLights) return
    if (light.flickerTween) light.flickerTween.stop()
    scene.tweens.killTweensOf(light)
    scene.fxLights = scene.fxLights.filter((l) => l !== light)
  },

  // A light that flares up and fades, for spell impacts and explosions
  pulseLight: function (scene, x, y, color, radius = 70, duration = 450) {
    const light = this.addLight(scene, {
      x,
      y,
      radius,
      color,
      intensity: 1.6,
      priority: 1,
    })
    if (!light) return
    scene.tweens.add({
      targets: light,
      intensity: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => this.removeLight(scene, light),
    })
  },

  // Fills the whole screen with a color for a moment (lightning, big hits)
  flash: function (scene, color = 0xffffff, strength = 0.6, duration = 160) {
    const look = scene.fxLook
    if (!look) {
      scene.cameras.main.flash(duration, ...toRgb(color).map((c) => c * 255))
      return
    }
    const flash = { a: strength }
    look.flash = [...toRgb(color), strength]
    scene.tweens.add({
      targets: flash,
      a: 0,
      duration,
      ease: 'Quad.easeIn',
      onUpdate: () => (look.flash[3] = flash.a),
    })
  },

  // A hit unit turns solid white for a moment, the classic flash. Canvas blinks the alpha instead
  hitFlash: function (scene, sprite) {
    if (!this.enabled(scene)) {
      scene.tweens.add({
        targets: sprite,
        alpha: 0.2,
        duration: 60,
        yoyo: true,
        repeat: 1,
        onComplete: () => (sprite.alpha = 1),
      })
      return
    }
    let blinks = 0
    // the battle scene clears its timers at the start of every player action, use a tween clock
    scene.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 220,
      onUpdate: (tween) => {
        const step = Math.floor(tween.getValue())
        if (step === blinks) return
        blinks = step
        if (!sprite.scene) return
        if (step % 2 === 0) sprite.setTintFill(0xffffff)
        else sprite.clearTint()
      },
      onStart: () => sprite.setTintFill(0xffffff),
      onComplete: () => sprite.scene && sprite.clearTint(),
    })
  },

  // Burns a sprite away with the dissolve shader, edge color by default a hot magenta
  dissolve: function (scene, sprite, duration = 700, edgeColor = 0xff6ad5) {
    if (!this.enabled(scene)) return false
    sprite.setPostPipeline(DissolvePipeline)
    const pipeline = sprite.getPostPipeline(DissolvePipeline)
    pipeline.edgeColor = toRgb(edgeColor)
    pipeline.progress = 0
    scene.tweens.add({
      targets: pipeline,
      progress: 1,
      duration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        sprite.visible = false
        sprite.resetPostPipeline()
      },
    })
    return true
  },

  // Creatures made of light light up their surroundings, on the map and in battle. key is the
  // enemy's battle texture. Returns the light, or null for creatures that don't glow
  creatureGlow: function (scene, sprite, key, scale = 1) {
    const glow = CREATURE_GLOWS[key]
    if (!glow) return null
    return this.addLight(scene, {
      follow: sprite,
      offsetY: glow.offsetY || 0,
      radius: glow.radius * scale,
      intensity: glow.intensity,
      color: glow.color,
      flicker: true,
    })
  },

  // Lets an image sway in the wind (trees, bushes, grass). Its x position sets its place in the
  // passing gusts, so neighbors move together and the gust rolls across the map
  sway: function (scene, image) {
    if (!this.enabled(scene)) return image
    const phase = Math.round(((((image.x / 180) % 1) + 1) % 1) * 255)
    return image.setPipeline('Wind').setTint(phase * 0x010101)
  },

  // Gives a scene's menus or HUD a camera of their own, drawn on top, so the lighting, bloom, tilt
  // shift and vignette on the main camera leave them alone. The main camera skips the given
  // objects, the new camera everything else, including objects added later. Returns the camera
  uiCamera: function (scene, uiObjects) {
    const cam = scene.cameras.add(0, 0, scene.scale.width, scene.scale.height)
    cam.roundPixels = true
    scene.children.list.forEach((child) => {
      if (!uiObjects.includes(child)) cam.ignore(child)
    })
    scene.cameras.main.ignore(uiObjects)
    const hide = (child) => {
      if (!uiObjects.includes(child)) cam.ignore(child)
    }
    scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, hide)
    scene.events.once('shutdown', () =>
      scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, hide)
    )
    return cam
  },

  // A soft colored outline that pulses, for the targeted enemy. Returns a function that removes it
  pulseGlow: function (scene, sprite, color = 0xfff27a) {
    if (!this.enabled(scene) || !sprite.preFX) return null
    sprite.preFX.setPadding(6)
    const glow = sprite.preFX.addGlow(color, 2, 0, false, 0.1, 6)
    const tween = scene.tweens.add({
      targets: glow,
      outerStrength: 4.5,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    return () => {
      tween.stop()
      if (sprite.preFX) sprite.preFX.remove(glow)
    }
  },

  // A soft shadow on the ground, a stretched blurred ellipse
  shadow: function (scene, x, y, width, alpha = 0.35) {
    return scene.add
      .image(x, y, 'fx-shadow')
      .setDisplaySize(width, Math.max(4, width * 0.32))
      .setAlpha(alpha)
  },

  // Cloud shadows sliding over the ground. The layer is screen sized, its pattern scrolls with the
  // camera plus a slow drift. area limits it to part of the screen (the battle's ground, not its sky)
  cloudShadows: function (scene, alpha, depth, area) {
    if (!this.enabled(scene) || !alpha) return null
    const { x, y, width, height } = area || {
      x: 0,
      y: 0,
      width: 320,
      height: 240,
    }
    const layer = scene.add
      .tileSprite(x, y, width, height, 'fx-clouds')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(alpha)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
    const cam = scene.cameras.main
    const update = (time) => {
      layer.tilePositionX = cam.scrollX + x + time * 0.006
      layer.tilePositionY = cam.scrollY + y + time * 0.0025
    }
    scene.events.on('update', update)
    layer.once('destroy', () => scene.events.off('update', update))
    return layer
  },

  // Slanted shafts of sunlight, drawn added on top so they brighten what they cross, breathing slowly
  sunRays: function (scene, alpha, color, depth, count = 4) {
    if (!this.enabled(scene) || !alpha) return []
    const rays = []
    for (let i = 0; i < count; i++) {
      const ray = scene.add
        .image(20 + i * 95 + Math.random() * 40, -20, 'fx-ray')
        .setOrigin(0.5, 0)
        .setScrollFactor(0.15, 0)
        .setAngle(-28)
        .setScale(0.6 + Math.random() * 0.8, 1.2)
        .setTint(color)
        .setAlpha(alpha * 0.5)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(depth)
      scene.tweens.add({
        targets: ray,
        alpha: alpha * (0.9 + Math.random() * 0.4),
        duration: 2200 + Math.random() * 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 1500,
      })
      rays.push(ray)
    }
    return rays
  },

  // Pollen drifting through the air in daylight
  pollen: function (scene, depth, area) {
    if (!this.enabled(scene)) return null
    const zone = area || { x: -20, y: -20, width: 360, height: 280 }
    return scene.add
      .particles(0, 0, 'fx-mote', {
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(
            zone.x,
            zone.y,
            zone.width,
            zone.height
          ),
        },
        lifespan: { min: 3000, max: 6000 },
        speedX: { min: 4, max: 14 },
        speedY: { min: -6, max: 4 },
        scale: { min: 0.5, max: 1 },
        // fade in and out over each mote's life
        alpha: {
          onEmit: () => 0,
          onUpdate: (p, key, t) => Math.sin(t * Math.PI) * 0.7,
        },
        tint: [0xfffbe0, 0xfff0a0, 0xffffff],
        frequency: 140,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setScrollFactor(0)
      .setDepth(depth)
  },

  // Fireflies wandering around the screen: glowing dots that blink on and off, the nearest light up
  // the ground around them
  fireflies: function (scene, count, depth, color = 0xd8ff7a, area) {
    if (!this.enabled(scene)) return []
    const zone = area || { x: 0, y: 0, width: 320, height: 240 }
    const cam = scene.cameras.main
    const flies = []
    for (let i = 0; i < count; i++) {
      const fly = scene.add
        .image(0, 0, 'fx-glow')
        .setScale(0.22)
        .setTint(color)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(depth)
      const place = () => {
        fly.x = cam.worldView.x + zone.x + Math.random() * zone.width
        fly.y = cam.worldView.y + zone.y + Math.random() * zone.height
      }
      place()
      const wander = () => {
        // flies that drifted off screen come back somewhere in view
        if (!cam.worldView.contains(fly.x, fly.y)) place()
        scene.tweens.add({
          targets: fly,
          x: fly.x + Phaser.Math.Between(-30, 30),
          y: fly.y + Phaser.Math.Between(-20, 20),
          duration: Phaser.Math.Between(1800, 3200),
          ease: 'Sine.easeInOut',
          onComplete: wander,
        })
      }
      wander()
      fly.alpha = 0
      scene.tweens.add({
        targets: fly,
        alpha: 1,
        duration: Phaser.Math.Between(500, 900),
        yoyo: true,
        hold: Phaser.Math.Between(200, 1200),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(300, 1600),
        delay: Math.random() * 2000,
        ease: 'Sine.easeInOut',
      })
      // only some carry a light, the shader has a limited number
      const light =
        i % 2 === 0 &&
        this.addLight(scene, {
          follow: fly,
          radius: 16,
          intensity: 0.5,
          color: toRgb(color),
        })
      const sync = () => {
        if (light) light.intensity = 0.55 * fly.alpha
      }
      scene.events.on('update', sync)
      // destroyed with the scene, or when a reused scene (battles) clears its atmosphere
      fly.once('destroy', () => {
        scene.events.off('update', sync)
        scene.tweens.killTweensOf(fly)
        this.removeLight(scene, light)
      })
      flies.push(fly)
    }
    return flies
  },
}
