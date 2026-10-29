// Original songs for the game, written as data for the music sequencer in music.js
// chords: one chord per 4-beat bar, the bass, arpeggio, pad and drums are generated from these
// lead:   the melody as "note beats" pairs, '-' is a rest. Must add up to 4 beats per bar
// lead/arp/bass/drums pick the instrument or pattern, see music.js

export const SONGS = {
  // Slow and wistful, harp and strings under a flute
  title: {
    bpm: 80,
    loop: true,
    lead: 'flute',
    arp: 'harp',
    bass: 'half',
    pad: true,
    drums: null,
    // prettier-ignore
    chords: [
      'Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E',
      'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'E',
    ],
    melody: `
      A4 2, C5 1, E5 1 | F5 3, E5 1 | G5 2, E5 1, C5 1 | D5 4 |
      A4 2, C5 1, E5 1 | A5 2, G5 1, F5 1 | E5 1, D5 1, B4 1, D5 1 | E5 4 |
      C6 2, A5 1, F5 1 | B5 2, G5 1, D5 1 | E5 1, G5 1, B5 1, A5 1 | A5 3, E5 1 |
      F5 2, E5 1, D5 1 | D5 1, E5 1, F5 1, G5 1 | E5 2, D5 1, C5 1 | B4 2, G#4 2
    `,
  },

  // Bright travelling march for the world map
  overworld: {
    bpm: 120,
    loop: true,
    lead: 'oboe',
    arp: 'harp',
    bass: 'walk',
    pad: true,
    drums: 'march',
    // prettier-ignore
    chords: [
      'D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A',
      'G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D',
    ],
    melody: `
      F#5 1.5, E5 0.5, D5 1, A4 1 | C#5 1.5, D5 0.5, E5 2 | D5 1.5, C#5 0.5, B4 1, F#4 1 | G4 1, A4 1, B4 1, D5 1 |
      F#5 1.5, E5 0.5, D5 1, F#5 1 | A5 2, G5 1, F#5 1 | E5 1, D5 1, B4 1, D5 1 | E5 3, - 1 |
      B5 1.5, A5 0.5, G5 1, D5 1 | C#6 1.5, B5 0.5, A5 2 | A5 1, F#5 1, C#5 1, F#5 1 | D6 2, B5 2 |
      B5 1, A5 1, G5 1, F#5 1 | E5 1, F#5 1, G5 1, C#5 1 | D5 4 | - 2, A4 1, C#5 1
    `,
  },

  // Fast and driving, brass lead over pounding bass
  battle: {
    bpm: 152,
    loop: true,
    lead: 'brass',
    arp: 'pulse',
    bass: 'drive',
    pad: true,
    drums: 'battle',
    // prettier-ignore
    chords: [
      'Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B',
      'Am', 'B', 'Em', 'C', 'Am', 'B', 'C', 'B',
    ],
    melody: `
      E5 0.5, B4 0.5, E5 0.5, F#5 0.5, G5 1, F#5 0.5, E5 0.5 | D5 0.5, E5 0.5, B4 1, - 2 |
      C5 0.5, E5 0.5, G5 0.5, A5 0.5, G5 1, E5 1 | F#5 0.5, A5 0.5, D6 1, C6 0.5, B5 0.5, A5 1 |
      B5 1.5, A5 0.5, G5 1, F#5 1 | G5 0.5, F#5 0.5, E5 1, B4 2 |
      C6 1, B5 0.5, A5 0.5, G5 1, E5 1 | F#5 1, D#5 1, B4 2 |
      A5 1, C6 1, E6 1, D6 0.5, C6 0.5 | B5 2, F#5 1, D#5 1 |
      E5 0.5, G5 0.5, B5 1, A5 0.5, G5 0.5, F#5 1 | G5 1, E5 1, C5 2 |
      C6 0.5, B5 0.5, A5 1, E5 1, A5 1 | D#6 1, B5 1, F#5 1, D#5 1 |
      E5 1, G5 1, C6 1, B5 1 | B5 2, - 2
    `,
  },

  // Slow, sad phrase when the party falls, plays once
  defeat: {
    bpm: 70,
    loop: false,
    lead: 'flute',
    arp: 'harp',
    bass: 'half',
    pad: true,
    drums: null,
    chords: ['Am', 'F', 'Dm', 'E'],
    melody: `
      E5 2, D5 1, C5 1 | A4 3, C5 1 | D5 2, F5 1, E5 1 | E5 4
    `,
  },

  // Short fanfare after winning, plays once
  victory: {
    bpm: 140,
    loop: false,
    lead: 'brass',
    arp: 'harp',
    bass: 'half',
    pad: true,
    drums: null,
    chords: ['C', 'F', 'G', 'C'],
    melody: `
      G4 0.5, C5 0.5, E5 0.5, G5 0.5, C6 2 | A5 1, C6 1, A5 1, F5 1 |
      G5 1, B5 1, D6 1, F6 1 | E6 4
    `,
  },
}
