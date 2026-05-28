# Adventurers of Exlovia

# Description

This is a turn-based roleplaying game built using Phaser initially following this tutorial: https://gamedevacademy.org/how-to-create-a-turn-based-rpg-game-in-phaser-3-part-1/. All assets and code not written by me are publically sourced and available to be freely used under CC or otherwise properly credited. This project features AI-generated code from Gemini as well as autocompletion by Copilot in VScode. This game also features AI-generated assets. This game was built as part of a course in LNU and migrated from Gitlab.

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

Currently under development, V.0.5.0 is the final release for the 1DV613 course, Mjukvaruutvecklingsprojekt. The project is still in a early state and lacks a lot of features to be classified as an enjoyable game.
The game currently features movement, multiple playable characters, a save and load system, loot, randomly generated maps, multiple enemies, a turn-based combat system, level up system, skill system. 

All systems are at a very basic and unfinished level currently. Balancing of enemies/units have not been done at all. The items and skills are very few and barebones. There's currently no equipment system. The character customization features are not yet implemented such as being able to switch class and mix skills from different classes. There's currently no "purpose" or goal to the game, defeating enemies simply grants experience and minor loot. Entering the stairs on the map generates a new random map but there's no victory condition at the moment. The game needs more visual feedback when leveling up, using items, turn order etc. The game currently features no sound or music. An Options menu needs to be added. The ability to use items in combat is still missing. 
