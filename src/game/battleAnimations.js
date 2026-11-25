import Phaser from 'phaser'
import { Sfx } from './audio/sfx'
import { Fx } from './fx'

// Attack and skill animations for the battle scene, drawn with glows, particles, lights and tweens
// so no extra assets are needed. Every animation calls onImpact(target) once per target at the
// moment the hit lands.
// Glows use additive blending and light up the scene through the look shader's point lights. Under
// the Canvas renderer (no WebGL) the same animations play without the blending and lights

// Spell colors and particle textures (made in BootScene) by skill element. tints are the particle
// colors from hot to cool
const ELEMENTS = {
  fire: {
    color: 0xff7a1a,
    spark: 'spark-fire',
    sound: 'fire',
    rise: -60,
    tints: [0xfff3a0, 0xffb02e, 0xff5a1a, 0xc8281a],
  },
  ice: {
    color: 0x66ccff,
    spark: 'spark-ice',
    sound: 'ice',
    rise: 40,
    tints: [0xffffff, 0xc8f0ff, 0x7ad0ff],
  },
  lightning: {
    color: 0xffe66d,
    spark: 'spark-bolt',
    sound: 'thunder',
    rise: 0,
    tints: [0xffffff, 0xfff6b0, 0xffe066],
  },
  dark: {
    color: 0x9b5de5,
    spark: 'spark-magic',
    sound: 'magicHit',
    rise: 20,
    tints: [0xe0b0ff, 0xa060f0, 0x5a1e9a],
  },
}
const DEFAULT_ELEMENT = {
  color: 0xc77dff,
  spark: 'spark-magic',
  sound: 'magicHit',
  rise: 0,
  tints: [0xffffff, 0xe0b8ff, 0xb070ff],
}
const ARROW_COLOR = 0xd9b26f
const ADD = Phaser.BlendModes.ADD

const elementOf = (skill) => ELEMENTS[skill && skill.element] || DEFAULT_ELEMENT

export const BattleAnimations = {
  // Picks the animation for the action, skill is null for basic attacks
  play: function (scene, attacker, targets, skill, onImpact) {
    const type = (skill && skill.type) || 'physical'
    // skills hit harder, so they shake the screen
    const impact = (target) => {
      if (skill) {
        scene.cameras.main.shake(120, 0.006)
      }
      onImpact(target)
    }

    if (type === 'magic') {
      const element = elementOf(skill)
      this.castCircle(scene, attacker, element)
      Sfx.cast()
      targets.forEach((target) => {
        if (element === ELEMENTS.lightning) {
          this.lightning(scene, target, element, impact)
        } else {
          this.spell(scene, attacker, target, element, impact)
        }
      })
    } else if (attacker.ranged) {
      Sfx.arrow()
      targets.forEach((target) => this.arrow(scene, attacker, target, impact))
    } else {
      // skills slash in yellow so they stand out from basic attacks
      this.lunge(scene, attacker, targets, skill ? 0xf8ff38 : 0xffffff, impact)
    }
  },

  // Physical melee: the attacker dashes toward the targets and hits them all on contact
  lunge: function (scene, attacker, targets, slashColor, onImpact) {
    const startX = attacker.x
    // aim at the middle of the targets so AoE skills dash toward the whole group
    const aimX = targets.reduce((sum, t) => sum + t.x, 0) / targets.length

    // a short afterimage trail behind the dash
    this.afterimages(scene, attacker, 300)
    scene.tweens.add({
      targets: attacker,
      x: startX + (aimX - startX) * 0.6,
      duration: 150,
      ease: 'Quad.easeIn',
      yoyo: true,
      onYoyo: () => {
        Sfx.slash()
        targets.forEach((target) => {
          this.slash(scene, target, slashColor)
          this.sparks(scene, target, 'spark-white', 8, 0)
          Fx.pulseLight(scene, target.x, target.y, 0xfff4d0, 50, 250)
          this.flash(scene, target)
          onImpact(target)
        })
      },
      onComplete: () => {
        attacker.x = startX
      },
    })
  },

  // Fading copies of a dashing unit left behind it
  afterimages: function (scene, unit, duration) {
    if (!Fx.enabled(scene)) return
    let count = 0
    scene.tweens.addCounter({
      from: 0,
      to: 5,
      duration,
      onUpdate: (tween) => {
        if (Math.floor(tween.getValue()) <= count) return
        count++
        const ghost = scene.add
          .image(unit.x, unit.y, unit.texture.key, unit.frame.name)
          .setFlipX(unit.flipX)
          .setScale(unit.scaleX, unit.scaleY)
          .setDepth(unit.depth - 0.001)
          .setAlpha(0.45)
          .setTintFill(0x9fd8ff)
          .setBlendMode(ADD)
        scene.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 220,
          onComplete: () => ghost.destroy(),
        })
      },
    })
  },

  // Magic: a glowing orb flies to the target, lighting up the field on the way, and bursts into
  // the element's effect
  spell: function (scene, attacker, target, element, onImpact) {
    const orb = this.glowOrb(scene, attacker.x, attacker.y, element.color)
    const light = Fx.addLight(scene, {
      follow: orb,
      radius: 46,
      intensity: 1.1,
      color: element.color,
      priority: 1,
    })
    // trail of sparks behind the orb
    const trail = scene.add
      .particles(0, 0, element.spark, {
        follow: orb,
        lifespan: 300,
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.9, end: 0 },
        speed: { min: 4, max: 16 },
        frequency: 14,
        blendMode: ADD,
      })
      .setDepth(49)

    scene.tweens.add({
      targets: orb,
      x: target.x,
      y: target.y,
      duration: 300,
      ease: 'Sine.easeIn',
      onComplete: () => {
        orb.destroy()
        Fx.removeLight(scene, light)
        trail.stop()
        this.later(scene, 350, () => trail.destroy())
        Sfx[element.sound]()
        this.burst(scene, target, element.color)
        Fx.pulseLight(scene, target.x, target.y, element.color, 90, 500)
        if (element === ELEMENTS.fire) this.flames(scene, target, element)
        else if (element === ELEMENTS.ice)
          this.iceShards(scene, target, element)
        else if (element === ELEMENTS.dark) this.vortex(scene, target, element)
        this.sparks(scene, target, element.spark, 16, element.rise)
        this.flash(scene, target)
        onImpact(target)
      },
    })
  },

  // A glowing ball: a soft halo with a bright core. Canvas gets a plain circle
  glowOrb: function (scene, x, y, color) {
    if (!Fx.enabled(scene)) {
      return scene.add.circle(x, y, 4, color).setDepth(50)
    }
    const halo = scene.add
      .image(0, 0, 'fx-glow')
      .setTint(color)
      .setScale(0.75)
      .setBlendMode(ADD)
    const core = scene.add
      .image(0, 0, 'fx-glow')
      .setScale(0.3)
      .setBlendMode(ADD)
    const orb = scene.add.container(x, y, [halo, core]).setDepth(50)
    scene.tweens.add({
      targets: halo,
      scale: 0.95,
      duration: 80,
      yoyo: true,
      repeat: -1,
    })
    return orb
  },

  // Fire: a column of flames roars up from the target's feet
  flames: function (scene, target, element) {
    const feet = target.groundY !== undefined ? target.groundY : target.y + 10
    const emitter = scene.add
      .particles(target.x, feet, 'fx-glow', {
        x: { min: -10, max: 10 },
        speedY: { min: -90, max: -40 },
        speedX: { min: -10, max: 10 },
        lifespan: { min: 300, max: 550 },
        scale: { start: 0.45, end: 0.05 },
        alpha: { start: 1, end: 0 },
        tint: element.tints,
        frequency: 12,
        quantity: 2,
        blendMode: ADD,
      })
      .setDepth(55)
    this.later(scene, 380, () => emitter.stop())
    this.later(scene, 1000, () => emitter.destroy())
  },

  // Ice: shards of ice close in on the target from all sides and shatter
  iceShards: function (scene, target, element) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3
      const shard = scene.add
        .image(
          target.x + Math.cos(angle) * 30,
          target.y + Math.sin(angle) * 24,
          'fx-shard'
        )
        .setRotation(angle + Math.PI / 2)
        .setTint(element.tints[i % element.tints.length])
        .setDepth(56)
        .setAlpha(0)
      if (Fx.enabled(scene)) shard.setBlendMode(ADD)
      scene.tweens.add({
        targets: shard,
        x: target.x + Math.cos(angle) * 4,
        y: target.y + Math.sin(angle) * 3,
        alpha: 1,
        duration: 180,
        ease: 'Quad.easeIn',
        onComplete: () => {
          scene.tweens.add({
            targets: shard,
            alpha: 0,
            scale: 1.6,
            duration: 200,
            onComplete: () => shard.destroy(),
          })
        },
      })
    }
    this.later(scene, 180, () =>
      this.sparks(scene, target, 'spark-ice', 12, 90)
    )
  },

  // Dark: a whirl of shadow sparks drawn into the target, then a dark pulse
  vortex: function (scene, target, element) {
    const emitter = scene.add
      .particles(target.x, target.y, 'fx-glow', {
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Circle(0, 0, 26),
          quantity: 24,
        },
        moveToX: 0,
        moveToY: 0,
        lifespan: 320,
        scale: { start: 0.25, end: 0.05 },
        alpha: { start: 0, end: 1 },
        tint: element.tints,
        frequency: 10,
        quantity: 2,
        blendMode: ADD,
      })
      .setDepth(55)
    this.later(scene, 300, () => emitter.stop())
    this.later(scene, 700, () => emitter.destroy())
    Fx.flash(scene, 0x30004a, 0.25, 300)
  },

  // Lightning: a jagged bolt cracks down from the sky onto the target
  lightning: function (scene, target, element, onImpact) {
    // the cast takes as long as an orb's flight, so the pacing matches the other spells
    this.later(scene, 260, () => {
      const g = scene.add.graphics().setDepth(57)
      if (Fx.enabled(scene)) g.setBlendMode(ADD)
      const points = [{ x: target.x + Phaser.Math.Between(-20, 20), y: -10 }]
      const steps = 7
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        points.push({
          x:
            Phaser.Math.Linear(points[0].x, target.x, t) +
            (i < steps ? Phaser.Math.Between(-9, 9) : 0),
          y: Phaser.Math.Linear(-10, target.y, t),
        })
      }
      const draw = (width, color, alpha) => {
        g.lineStyle(width, color, alpha)
        g.beginPath()
        g.moveTo(points[0].x, points[0].y)
        points.slice(1).forEach((p) => g.lineTo(p.x, p.y))
        g.strokePath()
      }
      draw(6, element.color, 0.35)
      draw(3, 0xfff6b0, 0.8)
      draw(1, 0xffffff, 1)
      scene.tweens.add({
        targets: g,
        alpha: 0,
        duration: 260,
        delay: 80,
        onComplete: () => g.destroy(),
      })
      Fx.flash(scene, 0xffffff, 0.35, 180)
      Fx.pulseLight(scene, target.x, target.y, element.color, 130, 450)
      Sfx[element.sound]()
      this.burst(scene, target, element.color)
      this.sparks(scene, target, element.spark, 18, 0)
      this.flash(scene, target)
      onImpact(target)
    })
  },

  // Ranged physical: an arrow flies to the target with a faint streak behind it
  arrow: function (scene, attacker, target, onImpact) {
    const angle = Phaser.Math.Angle.Between(
      attacker.x,
      attacker.y,
      target.x,
      target.y
    )
    const arrow = scene.add
      .rectangle(attacker.x, attacker.y, 10, 2, ARROW_COLOR)
      .setRotation(angle)
      .setDepth(50)
    const streak = scene.add
      .particles(0, 0, 'spark-white', {
        follow: arrow,
        lifespan: 160,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.6, end: 0 },
        frequency: 10,
        blendMode: ADD,
      })
      .setDepth(49)

    scene.tweens.add({
      targets: arrow,
      x: target.x,
      y: target.y,
      duration: 200,
      onComplete: () => {
        arrow.destroy()
        streak.stop()
        this.later(scene, 200, () => streak.destroy())
        Sfx.hit()
        this.sparks(scene, target, 'spark-white', 6, 0)
        Fx.pulseLight(scene, target.x, target.y, 0xfff4d0, 40, 200)
        this.flash(scene, target)
        onImpact(target)
      },
    })
  },

  // Glowing ring at the caster's feet while a spell is cast, with motes rising around them
  castCircle: function (scene, caster, element) {
    const feet = caster.groundY !== undefined ? caster.groundY : caster.y + 14
    const ring = scene.add
      .ellipse(caster.x, feet, 20, 6)
      .setStrokeStyle(1, element.color)
      .setDepth(40)
    scene.tweens.add({
      targets: ring,
      scale: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    })
    if (!Fx.enabled(scene)) return

    const glow = scene.add
      .image(caster.x, feet, 'fx-glow')
      .setTint(element.color)
      .setScale(1.4, 0.4)
      .setBlendMode(ADD)
      .setDepth(40)
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 2,
      duration: 450,
      onComplete: () => glow.destroy(),
    })
    const motes = scene.add
      .particles(caster.x, feet, 'fx-mote', {
        x: { min: -10, max: 10 },
        speedY: { min: -50, max: -25 },
        lifespan: 380,
        alpha: { start: 1, end: 0 },
        tint: element.tints,
        frequency: 25,
        blendMode: ADD,
      })
      .setDepth(41)
    this.later(scene, 260, () => motes.stop())
    this.later(scene, 700, () => motes.destroy())
    Fx.pulseLight(scene, caster.x, caster.y, element.color, 60, 400)
  },

  // Diagonal slash over the target: a bright streak that sweeps across and fades
  slash: function (scene, target, color) {
    const slash = scene.add
      .rectangle(target.x, target.y, 2, 30, color)
      .setAngle(45)
      .setScale(1, 0)
      .setDepth(50)
    const targets = [slash]
    if (Fx.enabled(scene)) {
      const glow = scene.add
        .rectangle(target.x, target.y, 6, 32, color, 0.45)
        .setAngle(45)
        .setScale(1, 0)
        .setBlendMode(ADD)
        .setDepth(50)
      targets.push(glow)
    }
    scene.tweens.add({
      targets,
      scaleY: 1,
      alpha: 0,
      duration: 220,
      onComplete: () => targets.forEach((t) => t.destroy()),
    })
  },

  // Expanding flash where a spell hits
  burst: function (scene, target, color) {
    if (!Fx.enabled(scene)) {
      const ring = scene.add
        .circle(target.x, target.y, 8, color, 0.7)
        .setDepth(50)
      scene.tweens.add({
        targets: ring,
        scale: 2.5,
        alpha: 0,
        duration: 250,
        onComplete: () => ring.destroy(),
      })
      return
    }
    const glow = scene.add
      .image(target.x, target.y, 'fx-glow')
      .setTint(color)
      .setScale(0.5)
      .setAlpha(0.55)
      .setBlendMode(ADD)
      .setDepth(50)
    const ring = scene.add
      .circle(target.x, target.y, 10)
      .setStrokeStyle(2, color)
      .setBlendMode(ADD)
      .setDepth(50)
    scene.tweens.add({
      targets: glow,
      scale: 1.6,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => glow.destroy(),
    })
    scene.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    })
  },

  // One-off burst of particles, rise moves them up (negative) or down (positive) like flames or falling ice
  sparks: function (scene, target, texture, count, rise) {
    const emitter = scene.add
      .particles(target.x, target.y, texture, {
        speed: { min: 20, max: 80 },
        lifespan: 500,
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: rise,
        emitting: false,
        blendMode: ADD,
      })
      .setDepth(60)
    emitter.explode(count)
    this.later(scene, 650, () => emitter.destroy())
  },

  // Target flashes white when hit. Never moves the unit, because the HP bar is drawn at its position
  flash: function (scene, target) {
    Fx.hitFlash(scene, target)
  },

  // Defeated units flash, then burn away from the top in glowing blocks with sparks flying off
  death: function (scene, target) {
    // takeDamage hides the unit straight away, show it again for the effect
    target.visible = true
    // a glowing creature's light goes out as it burns away
    if (target.glow) {
      const light = target.glow
      target.glow = null
      scene.tweens.add({
        targets: light,
        intensity: 0,
        duration: 900,
        onComplete: () => Fx.removeLight(scene, light),
      })
    }
    Sfx.enemyDeath()
    this.later(scene, 250, () => {
      this.sparks(scene, target, 'spark-magic', 14, -30)
      if (Fx.dissolve(scene, target, 650)) return
      scene.tweens.add({
        targets: target,
        alpha: 0,
        scaleY: target.scaleY * 1.3,
        duration: 500,
        onComplete: () => {
          target.visible = false
        },
      })
    })
  },

  // Floating damage number that pops up above the target and fades, colored by damage type
  damageNumber: function (scene, target, amount, color) {
    const css = '#' + color.toString(16).padStart(6, '0')
    const text = scene.add
      .colorText(target.x, target.y - 12, `${amount}`, css)
      .setDepth(100)

    scene.tweens.add({
      targets: text,
      y: text.y - 14,
      duration: 300,
      ease: 'Back.easeOut',
    })
    scene.tweens.add({
      targets: text,
      alpha: 0,
      delay: 600,
      duration: 300,
      onComplete: () => text.destroy(),
    })
  },

  // Color used for the damage number of a skill
  colorFor: function (skill) {
    if (skill && skill.type === 'magic') {
      return elementOf(skill).color
    }
    return 0xffffff
  },

  // Runs a callback after a delay. Uses a tween instead of a timer because
  // the battle scene clears all its timers at the start of every player action
  later: function (scene, delay, callback) {
    scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: delay,
      onComplete: callback,
    })
  },
}
