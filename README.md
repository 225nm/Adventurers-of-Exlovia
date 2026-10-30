# Adventurers of Exlovia
<img width="640" height="369" alt="titleScreen" src="https://github.com/user-attachments/assets/1af8a807-bfa3-44c1-b767-a7956b1712f8" />


# Description
This project was made as a first year student at LNU as part of a course in Software development.

This is a turn-based roleplaying game built using Phaser initially following this tutorial: https://gamedevacademy.org/how-to-create-a-turn-based-rpg-game-in-phaser-3-part-1/. All sprites, tiles and backgrounds are original pixel art drawn in code (see `src/game/art/`). The only third-party asset is the Press Start 2P font, used under the SIL Open Font License (see `public/assets/CREDITS.md`). Code not written by me is publicly sourced and freely usable, or otherwise properly credited. This project features AI-generated code from Gemini and Claude (Claude Code) as well as autocompletion by Copilot in VScode. This game was built as part of a course in LNU and migrated from Gitlab.

## Installation

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

Clone the project.
To launch the game initially open a terminal and run the command "npm i". Then run the commande "npm run dev". Open your browser and go to "localhost:8080" or any other address specified in the terminal output. To move the character use the arrow keys, press Z to confirm, X to return and C to open the menu.

## Available Commands

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `npm install`      | Install project dependencies                   |
| `npm run dev`      | Launch a development web server                |
| `npm run build`    | Create a production build in the `dist` folder |
| `npm run lint`     | Look for linting errors                        |
| `npm run lint:fix` | Fix linting errors                             |

# Visuals

[Gif](https://i.imgur.com/BEnppsw.gif)

# Project status

Currently under development. V.0.5.0 was the final release for the 1DV613 course, Mjukvaruutvecklingsprojekt, and development has continued since.

The game currently features:

- Choosing a starting party of two out of three classes (Warrior, Mage, Ranger), with the third joining on floor 3
- A dungeon of randomly generated floors, where every staircase leads to stronger enemies and better loot
- Nine enemy types that appear as you go deeper, each with their own skills, defenses and drops
- Turn-based combat with physical and magic damage, skills that scale with your stats, and battle animations and effects
- An equipment system with weapons and armor in three tiers, found in chests and dropped by enemies
- Leveling up, a save and load system with autosaving on the stairs, and a game over screen
- Synthesized music and sound effects, and an options menu with volume controls
- Original pixel art for all characters, enemies, tiles and backgrounds

Still missing or unfinished:

- Items can't be used in combat yet
- There's no victory condition, the floors go on forever
- Balancing has only had light testing
- Classes can't be switched and skills can't be mixed between classes
- Equipment can be swapped but not unequipped, and there's no turn order display
