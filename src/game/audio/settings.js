// Player settings, stored separately from the save file so they survive starting a new game
const settings_key = 'exlovia_settings'

const DEFAULTS = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
}

let current = null

export const Settings = {
  get: function () {
    if (!current) {
      current = { ...DEFAULTS }
      // storage can be blocked (private windows etc.), defaults are used then
      try {
        const saved = JSON.parse(localStorage.getItem(settings_key))
        if (saved) {
          current = { ...current, ...saved }
        }
      } catch (error) {
        // keep defaults
      }
    }
    return current
  },

  set: function (changes) {
    current = { ...this.get(), ...changes }
    try {
      localStorage.setItem(settings_key, JSON.stringify(current))
    } catch (error) {
      // settings still apply for this session
    }
  },
}
