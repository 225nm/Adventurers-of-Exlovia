import { SONGS } from '../game/audio/songs'
import {
  compileSong,
  noteToMidi,
  parseChord,
  parseMelody,
} from '../game/audio/music'

describe('Music', () => {
  test('notes convert to the right MIDI numbers', () => {
    expect(noteToMidi('C4')).toBe(60)
    expect(noteToMidi('A4')).toBe(69)
    expect(noteToMidi('F#5')).toBe(78)
    expect(noteToMidi('Bb3')).toBe(58)
  })

  test('chords are built from root, third and fifth', () => {
    expect(parseChord('C')).toEqual([48, 52, 55])
    expect(parseChord('Am')).toEqual([57, 60, 64])
    expect(parseChord('F#m')).toEqual([54, 57, 61])
  })

  test('rests take up time but play no note', () => {
    const { notes, totalBeats } = parseMelody('C5 1, - 2, E5 1')
    expect(notes.map((n) => n.beat)).toEqual([0, 3])
    expect(totalBeats).toBe(4)
  })

  // A melody that is too long or short drifts out of time with the chords every loop
  test.each(Object.keys(SONGS))(
    'the %s melody fits its chords exactly',
    (name) => {
      const song = SONGS[name]
      expect(parseMelody(song.melody).totalBeats).toBe(song.chords.length * 4)
      expect(compileSong(song).length).toBeGreaterThan(0)
    }
  )
})
