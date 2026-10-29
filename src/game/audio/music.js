import { AudioEngine } from './audioEngine'
import { SONGS } from './songs'

// Music sequencer: turns the song data in songs.js into timed notes and plays them on synth instruments

const BEATS_PER_BAR = 4
const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

// 'C#4' -> MIDI note number (middle C = 60)
export function noteToMidi(note) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(note)
  if (!match) {
    throw new Error(`Bad note: ${note}`)
  }
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0
  return NOTE_OFFSETS[match[1]] + accidental + (Number(match[3]) + 1) * 12
}

const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12)

// 'F#m' -> MIDI notes of the chord's root, third and fifth around octave 3
export function parseChord(name) {
  const match = /^([A-G][#b]?)(m?)$/.exec(name)
  if (!match) {
    throw new Error(`Bad chord: ${name}`)
  }
  const root = noteToMidi(match[1] + '3')
  return [root, root + (match[2] ? 3 : 4), root + 7]
}

// 'A4 2, C5 1 | ...' -> [{ note, beat, beats }], bar lines are only for readability
export function parseMelody(melody) {
  const notes = []
  let beat = 0
  melody
    .split(/[,|]/)
    .map((token) => token.trim())
    .filter((token) => token)
    .forEach((token) => {
      const [note, length] = token.split(/\s+/)
      const beats = Number(length)
      if (note !== '-') {
        notes.push({ note: noteToMidi(note), beat, beats })
      }
      beat += beats
    })
  return { notes, totalBeats: beat }
}

// Synth instruments, each plays one note at time t on the song's bus
const tone = (o) => AudioEngine.tone(o)
const noise = (o) => AudioEngine.noise(o)
const INSTRUMENTS = {
  flute: (f, t, d, bus) =>
    tone({
      bus,
      type: 'triangle',
      freq: f,
      start: t,
      duration: d,
      volume: 0.16,
      attack: 0.04,
      release: 0.1,
      vibrato: true,
      echo: true,
    }),
  oboe: (f, t, d, bus) =>
    tone({
      bus,
      type: 'square',
      freq: f,
      start: t,
      duration: d,
      volume: 0.06,
      attack: 0.02,
      filter: 1800,
      vibrato: true,
      echo: true,
    }),
  brass: (f, t, d, bus) => {
    tone({
      bus,
      type: 'sawtooth',
      freq: f,
      start: t,
      duration: d,
      volume: 0.07,
      attack: 0.03,
      filter: 2400,
      vibrato: true,
      echo: true,
    })
    tone({
      bus,
      type: 'square',
      freq: f,
      start: t,
      duration: d,
      volume: 0.03,
      attack: 0.03,
      filter: 1200,
    })
  },
  harp: (f, t, d, bus) =>
    tone({
      bus,
      type: 'triangle',
      freq: f,
      start: t,
      duration: Math.min(d * 3, 0.8),
      volume: 0.07,
      pluck: true,
      echo: true,
    }),
  pulse: (f, t, d, bus) =>
    tone({
      bus,
      type: 'square',
      freq: f,
      start: t,
      duration: d * 0.8,
      volume: 0.025,
      filter: 2500,
      pluck: true,
    }),
  // two slightly detuned saws give the wide "string section" sound
  pad: (f, t, d, bus) => {
    tone({
      bus,
      type: 'sawtooth',
      freq: f,
      start: t,
      duration: d,
      volume: 0.02,
      attack: 0.35,
      release: 0.3,
      filter: 1000,
      detune: -8,
    })
    tone({
      bus,
      type: 'sawtooth',
      freq: f,
      start: t,
      duration: d,
      volume: 0.02,
      attack: 0.35,
      release: 0.3,
      filter: 1000,
      detune: 8,
    })
  },
  bass: (f, t, d, bus) =>
    tone({
      bus,
      type: 'triangle',
      freq: f,
      start: t,
      duration: d * 0.9,
      volume: 0.22,
      release: 0.03,
    }),
  kick: (f, t, d, bus) =>
    tone({
      bus,
      type: 'sine',
      freq: 150,
      slideTo: 45,
      start: t,
      duration: 0.15,
      volume: 0.35,
      pluck: true,
    }),
  snare: (f, t, d, bus) =>
    noise({
      bus,
      start: t,
      duration: 0.12,
      volume: 0.13,
      filterType: 'bandpass',
      filterFreq: 1800,
      q: 0.8,
    }),
  hat: (f, t, d, bus) =>
    noise({
      bus,
      start: t,
      duration: 0.03,
      volume: 0.04,
      filterType: 'highpass',
      filterFreq: 7000,
    }),
}

// Accompaniment patterns, generated per bar from the chord. Offsets are in beats
const ARP_ORDER = [0, 1, 2, 3, 2, 1, 0, 1] // chord tone indexes, 3 = root an octave up
const BASS_PATTERNS = {
  half: [
    [0, 0, 2],
    [2, 2, 2],
  ], // [beat, chord tone, length]
  walk: [
    [0, 0, 1],
    [1, 2, 1],
    [2, 3, 1],
    [3, 2, 1],
  ],
  drive: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((beat, i) => [
    beat,
    i % 2 ? 3 : 0,
    0.5,
  ]),
}
const DRUM_PATTERNS = {
  march: { kick: [0, 2], snare: [1, 3], hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
  battle: {
    kick: [0, 1.5, 2],
    snare: [1, 3, 3.5],
    hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
  },
}

// Turns a song into a sorted list of { instrument, freq, beat, beats } for one loop
export function compileSong(song) {
  const events = []
  const add = (instrument, midi, beat, beats) =>
    events.push({ instrument, freq: midi ? midiToFreq(midi) : 0, beat, beats })

  song.chords.forEach((name, bar) => {
    const start = bar * BEATS_PER_BAR
    const [root, third, fifth] = parseChord(name)
    const tones = [root, third, fifth, root + 12]

    if (song.pad) {
      ;[root, third, fifth].forEach((midi) =>
        add('pad', midi + 12, start, BEATS_PER_BAR)
      )
    }
    if (song.arp) {
      ARP_ORDER.forEach((toneIndex, i) =>
        add(song.arp, tones[toneIndex] + 24, start + i * 0.5, 0.5)
      )
    }
    if (song.bass) {
      BASS_PATTERNS[song.bass].forEach(([beat, toneIndex, beats]) =>
        add('bass', tones[toneIndex] - 12, start + beat, beats)
      )
    }
    if (song.drums) {
      Object.entries(DRUM_PATTERNS[song.drums]).forEach(([drum, beats]) =>
        beats.forEach((beat) => add(drum, 0, start + beat, 0.25))
      )
    }
  })

  parseMelody(song.melody).notes.forEach((n) =>
    add(song.lead, n.note, n.beat, n.beats)
  )

  return events.sort((a, b) => a.beat - b.beat)
}

export const Music = {
  current: null,

  // Starts a song, does nothing if it is already playing
  play: function (name) {
    if (this.current === name) {
      return
    }
    this.stop()
    this.current = name
    const c = AudioEngine.context
    if (!c) {
      return
    }
    this.song = SONGS[name]
    this.events = compileSong(this.song)
    this.secondsPerBeat = 60 / this.song.bpm
    this.loopBeats = this.song.chords.length * BEATS_PER_BAR
    this.startTime = c.currentTime + 0.1
    this.index = 0
    this.loopCount = 0

    // each song gets its own gain so it can fade out while the next one starts
    this.songGain = c.createGain()
    this.songGain.connect(AudioEngine.musicBus)

    // schedule notes slightly ahead of time, Web Audio then plays them exactly on time
    this.timer = setInterval(() => this.schedule(), 25)
    this.schedule()
  },

  schedule: function () {
    const c = AudioEngine.context
    const horizon = c.currentTime + 0.2
    for (;;) {
      const event = this.events[this.index]
      const t =
        this.startTime +
        (this.loopCount * this.loopBeats + event.beat) * this.secondsPerBeat
      if (t > horizon) {
        break
      }
      // background tabs run timers late, skip missed notes instead of playing them all at once
      if (t > c.currentTime - 0.05) {
        INSTRUMENTS[event.instrument](
          event.freq,
          t,
          event.beats * this.secondsPerBeat,
          this.songGain
        )
      }
      this.index++
      if (this.index >= this.events.length) {
        if (!this.song.loop) {
          clearInterval(this.timer)
          this.timer = null
          break
        }
        this.index = 0
        this.loopCount++
      }
    }
  },

  // Fades out the current song
  stop: function () {
    clearInterval(this.timer)
    this.timer = null
    this.current = null
    const c = AudioEngine.context
    if (c && this.songGain) {
      const gain = this.songGain
      gain.gain.setValueAtTime(gain.gain.value, c.currentTime)
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.4)
      setTimeout(() => gain.disconnect(), 600)
      this.songGain = null
    }
  },
}
