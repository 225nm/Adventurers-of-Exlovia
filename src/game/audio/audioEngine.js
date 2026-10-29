import { Settings } from './settings'

// All sound is synthesized with the Web Audio API, the game ships no audio files.
// Signal chain: instruments -> music/sfx bus -> master -> speakers,
// with an echo send modelled on the SNES sound chip's echo effect.

let ctx = null
let master = null
let musicBus = null
let sfxBus = null
let musicEcho = null
let sfxEcho = null
let noiseBuffer = null

// SNES-style echo: a delay that feeds back into itself through a lowpass filter.
// Returns the echo's input, its output goes into the given bus
function createEcho(bus) {
  const send = ctx.createGain()
  send.gain.value = 0.3
  const delay = ctx.createDelay(1)
  delay.delayTime.value = 0.24
  const feedback = ctx.createGain()
  feedback.gain.value = 0.38
  const echoTone = ctx.createBiquadFilter()
  echoTone.type = 'lowpass'
  echoTone.frequency.value = 2200
  send.connect(delay)
  delay.connect(echoTone)
  echoTone.connect(feedback)
  feedback.connect(delay)
  echoTone.connect(bus)
  return send
}

// Echo input for a sound's bus. Songs play through their own gain node, which feeds the music bus
const echoFor = (bus) => (bus && bus !== sfxBus ? musicEcho : sfxEcho)

function setup() {
  // jsdom (tests) and very old browsers have no Web Audio, every sound becomes a no-op
  const AudioCtx =
    typeof window !== 'undefined' &&
    (window.AudioContext || window.webkitAudioContext)
  if (!AudioCtx) {
    return
  }
  ctx = new AudioCtx()

  master = ctx.createGain()
  master.gain.value = 0.8
  master.connect(ctx.destination)

  musicBus = ctx.createGain()
  musicBus.connect(master)
  sfxBus = ctx.createGain()
  sfxBus.connect(master)

  // each bus gets its own echo that feeds back into that bus, so the volume settings also control the echo
  musicEcho = createEcho(musicBus)
  sfxEcho = createEcho(sfxBus)

  // one second of white noise, reused for drums and impact sounds
  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }

  AudioEngine.applyVolumes()
}

export const AudioEngine = {
  // Created on first use. Browsers keep it suspended until the player presses a key
  get context() {
    if (!ctx) {
      setup()
    }
    return ctx
  },

  get musicBus() {
    return this.context ? musicBus : null
  },

  get sfxBus() {
    return this.context ? sfxBus : null
  },

  // Browsers only allow audio after a user gesture, so resume on every key press or click
  installUnlock: function () {
    const unlock = () => {
      const c = this.context
      if (c && c.state === 'suspended') {
        c.resume()
      }
    }
    window.addEventListener('keydown', unlock)
    window.addEventListener('pointerdown', unlock)
  },

  // Volumes are squared so the options slider feels even to the ear
  applyVolumes: function () {
    if (!ctx) {
      return
    }
    const settings = Settings.get()
    musicBus.gain.value = settings.musicVolume * settings.musicVolume
    sfxBus.gain.value = settings.sfxVolume * settings.sfxVolume
  },

  // Plays one oscillator note
  // options: freq, start, duration, type, volume, attack, release, slideTo, detune,
  // filter (lowpass Hz), pluck (decaying note), vibrato, echo, bus
  tone: function (o) {
    const c = this.context
    if (!c) {
      return
    }
    const t = o.start === undefined ? c.currentTime : o.start
    const duration = o.duration
    const volume = o.volume === undefined ? 0.2 : o.volume
    const attack = o.attack === undefined ? 0.005 : o.attack
    const release = o.release === undefined ? 0.05 : o.release

    const osc = c.createOscillator()
    osc.type = o.type || 'square'
    osc.frequency.setValueAtTime(o.freq, t)
    if (o.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + duration)
    }
    if (o.detune) {
      osc.detune.value = o.detune
    }

    const env = c.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(volume, t + attack)
    if (o.pluck) {
      env.gain.exponentialRampToValueAtTime(0.001, t + duration)
    } else {
      env.gain.setValueAtTime(volume, t + Math.max(attack, duration - release))
      env.gain.linearRampToValueAtTime(0, t + duration)
    }

    let source = osc
    if (o.filter) {
      const filter = c.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = o.filter
      osc.connect(filter)
      source = filter
    }
    source.connect(env)

    // gentle pitch wobble that starts after the note's attack, like a held flute note
    if (o.vibrato && duration > 0.25) {
      const lfo = c.createOscillator()
      const depth = c.createGain()
      lfo.frequency.value = 5.5
      depth.gain.setValueAtTime(0, t)
      depth.gain.linearRampToValueAtTime(12, t + 0.25)
      lfo.connect(depth)
      depth.connect(osc.detune)
      lfo.start(t)
      lfo.stop(t + duration + 0.05)
    }

    env.connect(o.bus || sfxBus)
    if (o.echo) {
      env.connect(echoFor(o.bus))
    }
    osc.start(t)
    osc.stop(t + duration + 0.05)
  },

  // Plays filtered white noise, used for drums, slashes, fire and impacts
  // options: start, duration, volume, filterType, filterFreq, filterTo, q, echo, bus
  noise: function (o) {
    const c = this.context
    if (!c) {
      return
    }
    const t = o.start === undefined ? c.currentTime : o.start
    const volume = o.volume === undefined ? 0.2 : o.volume

    const src = c.createBufferSource()
    src.buffer = noiseBuffer
    const filter = c.createBiquadFilter()
    filter.type = o.filterType || 'lowpass'
    filter.frequency.setValueAtTime(o.filterFreq || 2000, t)
    if (o.filterTo) {
      filter.frequency.exponentialRampToValueAtTime(o.filterTo, t + o.duration)
    }
    filter.Q.value = o.q || 1

    const env = c.createGain()
    env.gain.setValueAtTime(volume, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + o.duration)

    src.connect(filter)
    filter.connect(env)
    env.connect(o.bus || sfxBus)
    if (o.echo) {
      env.connect(echoFor(o.bus))
    }
    src.start(t)
    src.stop(t + o.duration + 0.05)
  },
}
