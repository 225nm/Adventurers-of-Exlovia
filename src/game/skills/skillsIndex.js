import Phaser from 'phaser'
import { warriorSkills } from './warriorSkills.js'
import { mageSkills } from './mageSkills.js'
import { rangerSkills } from './rangerSkills.js'
// individual exports
export { warriorSkills, mageSkills, rangerSkills }

// list export
export const skillsIndex = {
  warriorSkills,
  mageSkills,
  rangerSkills
}
