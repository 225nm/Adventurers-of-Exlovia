import Phaser from 'phaser'
import { Sfx } from './audio/sfx'

// Attack and skill animations for the battle scene, drawn with shapes, particles and tweens so no extra assets are needed
// Every animation calls onImpact(target) once per target at the moment the hit lands
// Note: the game uses the Canvas renderer, where setTint does nothing, so effects use alpha, scale and colored shapes

// Spell colors and particle textures (made in BootScene) by skill element
const ELEMENTS = {
  fire: { color: 0xff7a1a, spark: 'spark-fire', sound: 'fire', rise: -60 },
  ice: { color: 0x66ccff, spark: 'spark-ice', sound: 'ice', rise: 40 },
}
const DEFAULT_ELEMENT = {
  color: 0xc77dff,
  spark: 'spark-magic',
  sound: 'magicHit',
  rise: 0,
}
const ARROW_COLOR = 0xd9b26f

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
      this.castCircle(scene, attacker, element.color)
      Sfx.cast()
      targets.forEach((target) =>
        this.spell(scene, attacker, target, element, impact)
      )
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
          this.sparks(scene, target, 'spark-white', 6, 0)
          this.flash(scene, target)
          onImpact(target)
        })
      },
      onComplete: () => {
        attacker.x = startX
      },
    })
  },

  // Magic: a glowing orb flies to the target and bursts into particles
  spell: function (scene, attacker, target, element, onImpact) {
    const orb = scene.add
      .circle(attacker.x, attacker.y, 4, element.color)
      .setDepth(50)
    // small trail of sparks behind the orb
    const trail = scene.add
      .particles(0, 0, element.spark, {
        follow: orb,
        lifespan: 250,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.8, end: 0 },
        frequency: 20,
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
        trail.stop()
        this.later(scene, 300, () => trail.destroy())
        Sfx[element.sound]()
        this.burst(scene, target, element.color)
        this.sparks(scene, target, element.spark, 16, element.rise)
        this.flash(scene, target)
        onImpact(target)
      },
    })
  },

  // Ranged physical: an arrow flies to the target
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

    scene.tweens.add({
      targets: arrow,
      x: target.x,
      y: target.y,
      duration: 200,
      onComplete: () => {
        arrow.destroy()
        Sfx.hit()
        this.sparks(scene, target, 'spark-white', 5, 0)
        this.flash(scene, target)
        onImpact(target)
      },
    })
  },

  // Glowing ring at the caster's feet while a spell is cast
  castCircle: function (scene, caster, color) {
    const ring = scene.add
      .ellipse(caster.x, caster.y + 14, 20, 6)
      .setStrokeStyle(1, color)
      .setDepth(40)

    scene.tweens.add({
      targets: ring,
      scale: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    })
  },

  // Diagonal slash mark over the target
  slash: function (scene, target, color) {
    const slash = scene.add
      .rectangle(target.x, target.y, 2, 28, color)
      .setAngle(45)
      .setScale(1, 0)
      .setDepth(50)

    scene.tweens.add({
      targets: slash,
      scaleY: 1,
      alpha: 0,
      duration: 200,
      onComplete: () => slash.destroy(),
    })
  },

  // Expanding ring where a spell hits
  burst: function (scene, target, color) {
    const ring = scene.add.circle(target.x, target.y, 8, color, 0.7)
    ring.setDepth(50)

    scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 250,
      onComplete: () => ring.destroy(),
    })
  },

  // One-off burst of particles, rise moves them up (negative) or down (positive) like flames or falling ice
  sparks: function (scene, target, texture, count, rise) {
    const emitter = scene.add
      .particles(target.x, target.y, texture, {
        speed: { min: 20, max: 70 },
        lifespan: 450,
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: rise,
        emitting: false,
      })
      .setDepth(60)
    emitter.explode(count)
    this.later(scene, 600, () => emitter.destroy())
  },

  // Target blinks when hit. Only alpha is changed, never x/y,
  // because the HP bar is drawn at the unit's position
  flash: function (scene, target) {
    scene.tweens.add({
      targets: target,
      alpha: 0.2,
      duration: 60,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        target.alpha = 1
      },
    })
  },

  // Defeated units flicker, then fade away in a puff of sparks
  death: function (scene, target) {
    // takeDamage hides the unit straight away, show it again for the effect
    target.visible = true
    Sfx.enemyDeath()
    scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleY: target.scaleY * 1.3,
      // starts after the hit flash has finished
      delay: 250,
      duration: 500,
      onStart: () => this.sparks(scene, target, 'spark-magic', 14, -30),
      onComplete: () => {
        target.visible = false
      },
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
