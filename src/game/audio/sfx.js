import { AudioEngine } from './audioEngine'

// Short synthesized sound effects. Each one is a few layered tones and noise bursts
const tone = (o) => AudioEngine.tone(o)
const noise = (o) => AudioEngine.noise(o)
// time offset from now, sounds are scheduled slightly ahead for exact timing
const at = (offset) => {
  const c = AudioEngine.context
  return c ? c.currentTime + offset : 0
}

export const Sfx = {
  // ---- menus ----
  cursor: function () {
    tone({ freq: 1200, duration: 0.03, volume: 0.06 })
  },

  confirm: function () {
    tone({ freq: 880, duration: 0.05, volume: 0.07 })
    tone({ freq: 1320, start: at(0.05), duration: 0.07, volume: 0.07 })
  },

  cancel: function () {
    tone({ freq: 660, slideTo: 330, duration: 0.09, volume: 0.07 })
  },

  error: function () {
    tone({ freq: 140, duration: 0.09, volume: 0.1, filter: 900 })
    tone({
      freq: 140,
      start: at(0.12),
      duration: 0.09,
      volume: 0.1,
      filter: 900,
    })
  },

  save: function () {
    tone({
      type: 'triangle',
      freq: 1046,
      duration: 0.15,
      volume: 0.15,
      echo: true,
    })
    tone({
      type: 'triangle',
      freq: 1568,
      start: at(0.12),
      duration: 0.35,
      volume: 0.15,
      pluck: true,
      echo: true,
    })
  },

  // ---- world ----
  itemGet: function () {
    ;[784, 1046, 1318, 1568].forEach((freq, i) =>
      tone({
        type: 'triangle',
        freq,
        start: at(i * 0.07),
        duration: i === 3 ? 0.4 : 0.1,
        volume: 0.14,
        pluck: i === 3,
        echo: true,
      })
    )
  },

  // Rising whoosh and shatter when a battle starts
  encounter: function () {
    noise({
      duration: 0.7,
      volume: 0.18,
      filterType: 'bandpass',
      filterFreq: 300,
      filterTo: 5000,
      q: 2,
      echo: true,
    })
    tone({
      type: 'sawtooth',
      freq: 110,
      slideTo: 880,
      duration: 0.6,
      volume: 0.06,
      filter: 2000,
    })
    tone({
      type: 'square',
      freq: 220,
      slideTo: 1760,
      duration: 0.6,
      volume: 0.04,
      filter: 3000,
    })
  },

  // ---- battle ----
  slash: function () {
    noise({
      duration: 0.14,
      volume: 0.22,
      filterType: 'highpass',
      filterFreq: 5000,
      filterTo: 900,
    })
    tone({
      type: 'triangle',
      freq: 220,
      slideTo: 60,
      duration: 0.12,
      volume: 0.25,
    })
  },

  arrow: function () {
    noise({
      duration: 0.18,
      volume: 0.12,
      filterType: 'bandpass',
      filterFreq: 2500,
      filterTo: 1200,
      q: 3,
    })
  },

  hit: function () {
    noise({ duration: 0.1, volume: 0.2, filterFreq: 1400 })
    tone({ type: 'sine', freq: 160, slideTo: 45, duration: 0.14, volume: 0.3 })
  },

  // Shimmering rise when a spell is cast
  cast: function () {
    tone({
      type: 'triangle',
      freq: 300,
      slideTo: 1200,
      duration: 0.3,
      volume: 0.12,
      echo: true,
    })
    ;[1318, 1568, 2093].forEach((freq, i) =>
      tone({
        type: 'square',
        freq,
        start: at(0.05 + i * 0.05),
        duration: 0.06,
        volume: 0.03,
        echo: true,
      })
    )
  },

  fire: function () {
    noise({
      duration: 0.45,
      volume: 0.25,
      filterFreq: 500,
      filterTo: 3000,
      echo: true,
    })
    tone({
      type: 'sawtooth',
      freq: 90,
      slideTo: 50,
      duration: 0.35,
      volume: 0.1,
      filter: 600,
    })
  },

  ice: function () {
    ;[2093, 2637, 3136, 2349].forEach((freq, i) =>
      tone({
        type: 'triangle',
        freq,
        start: at(i * 0.04),
        duration: 0.25,
        volume: 0.08,
        pluck: true,
        echo: true,
      })
    )
    noise({
      duration: 0.2,
      volume: 0.08,
      filterType: 'highpass',
      filterFreq: 6000,
    })
  },

  magicHit: function () {
    tone({
      type: 'sine',
      freq: 700,
      slideTo: 200,
      duration: 0.25,
      volume: 0.15,
      echo: true,
    })
  },

  enemyDeath: function () {
    noise({
      duration: 0.6,
      volume: 0.2,
      filterFreq: 3000,
      filterTo: 100,
      echo: true,
    })
    tone({
      type: 'square',
      freq: 440,
      slideTo: 55,
      duration: 0.5,
      volume: 0.06,
      filter: 1500,
    })
  },

  // ---- rewards and items ----
  heal: function () {
    ;[1046, 1318, 1568, 2093].forEach((freq, i) =>
      tone({
        type: 'triangle',
        freq,
        start: at(i * 0.06),
        duration: 0.3,
        volume: 0.1,
        pluck: true,
        echo: true,
      })
    )
  },

  equip: function () {
    tone({
      type: 'square',
      freq: 330,
      duration: 0.05,
      volume: 0.08,
      filter: 1500,
    })
    noise({
      start: at(0.05),
      duration: 0.12,
      volume: 0.15,
      filterType: 'bandpass',
      filterFreq: 3500,
      q: 4,
    })
  },

  levelUp: function () {
    ;[523, 659, 784, 1046, 1318].forEach((freq, i) =>
      tone({
        type: 'square',
        freq,
        start: at(i * 0.08),
        duration: i === 4 ? 0.6 : 0.09,
        volume: 0.06,
        filter: 3000,
        vibrato: i === 4,
        echo: true,
      })
    )
  },
}
