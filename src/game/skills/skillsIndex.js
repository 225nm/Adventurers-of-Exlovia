import Phaser from 'phaser'
import { warriorSkills } from './warriorSkills.js'
import { mageSkills } from './mageSkills.js'

// individual exports
export { warriorSkills, mageSkills }

// list export
export const skillsIndex = {
  warriorSkills,
  mageSkills,
}
