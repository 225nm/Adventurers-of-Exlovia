import Phaser from 'phaser'
import { skillsIndex } from './skills/skillsIndex'

//Party with warrior and mage
export let Party = {
  Heroes: [
    {
      type: 'Warrior',
      name: 'todowar',
      hp: 100,
      damage: 20,
      mp: 20,
      maxMp: 20,
      xp: 0,
      level: 1,
      skills: skillsIndex.warriorSkills,
    },
    {
      type: 'Mage',
      name: 'todomage',
      hp: 80,
      damage: 8,
      mp: 50,
      maxMp: 50,
      xp: 0,
      level: 1,
      skills: skillsIndex.mageSkills,
    },
  ],
}

/* 
//Party with warrior and ranger
export let Party = {
  Heroes: [
    {
      type: 'Warrior',
      name: 'todowar',
      hp: 100,
      damage: 20,
      mp: 20,
      maxMp: 20,
      xp: 0,
      level: 1,
      skills: skillsIndex.warriorSkills,
    },
    {
      type: 'Ranger',
      name: 'todoranger',
      hp: 70,
      damage: 12,
      mp: 50,
      maxMp: 50,
      xp: 0,
      level: 1,
      skills: skillsIndex.rangerSkills,
    },
  ],
} */