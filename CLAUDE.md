# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Turn-based RPG built on Phaser 3 (forked from the `phaserjs/template-vite` template) with Vite, plain JavaScript ES modules, and Jest. Started from the gamedevacademy "turn-based RPG in Phaser 3" tutorial, which is why much of the code uses the old `new Phaser.Class({ Extends, initialize })` style and `var` instead of ES classes.

## Commands

- `npm run dev`: dev server on http://localhost:8080 (`dev-nolog` skips the template's `log.js` telemetry ping)
- `npm run build`: production build to `dist/` (`build-nolog` likewise)
- `npm run lint`: ESLint + `prettier --check`; `npm run lint:fix` to auto-fix
- `npm test`: Jest (jsdom + `jest-canvas-mock`, coverage always on, written to `coverage/`)
- Single test file: `npx jest src/tests/battle.test.js`; single test: `npx jest -t "part of test name"`

CI (`.gitlab-ci.yml`, from before the GitLab→GitHub migration) runs build, test and lint, then deploys from `main` via Docker Compose over SSH.

In-game controls: arrow keys move, Z confirms, X goes back, C opens the world menu.

Prettier style: no semicolons, single quotes, 2-space indent, `trailingComma: 'es5'`.

## Architecture

**Entry**: `src/start.js` creates the `Phaser.Game` (320×240 canvas, pixel art, arcade physics), registers every scene, and registers a custom `this.add.pixelText(x, y, text, size)` factory for bitmap-font text using the `pressstart` font.

**Scene flow** (`src/game/scenes/`):
`BootScene` (loads assets, creates the shared `Inventory`) → `TitleScene` (new game / load) → `WorldScene` (tilemap, random chests, enemy zones). Touching an enemy zone runs `scene.switch('BattleScene')`. `BattleScene` runs `UIScene` (defined in the same `battle.js`) for menus; on victory it launches `VictoryScene`, which stops the battle scenes and wakes `WorldScene`. `WorldMenuScene` is launched over the world and opens `PartyScene`, `ItemScene` and `StatsScene`. Scenes that get reused hook the `wake` event (`this.sys.events.on('wake', ...)`) to reset their state, so code that re-initializes a scene has to go through the wake handler, not just `create`.

**Shared state lives in `this.registry`**, not on scene instances:
- `partyData`: array of plain hero stat objects (`type`, `hp`, `maxHp`, `mp`, `maxMp`, `xp`, `level`, `damage`, `skills`). This is the source of truth between battles.
- `inventory`: `[{ name, qty }]`, wrapped by `Inventory` (`src/game/inventory.js`), which is reachable as `this.game.inventory` and writes back to the registry on every change.
- `usedItem`: hands off which item was chosen between `ItemScene` and `PartyScene`.

`saveSystem` (`src/game/save.js`) saves `partyData` + `inventory` to `localStorage` under the key `party_data`.

**Battle lifecycle**: `BattleScene.startBattle` builds hero sprites from `partyData` by looking up `heroesIndex[type]`, then spawns 2 random enemies from `enemiesIndex`. Turns go round-robin through `this.units`. Enemies have a 33% chance to use a random skill. `receivePlayerSelection` handles basic attack, single-target skills and AoE skills (`target === 'all'`), and deducts MP there. After a win, `saveHeroData` applies level-ups (`xp >= level * 20` → `hero.levelUp()`), copies the sprite stats back into `partyData`, and saves.

**Units and content registries**: `src/game/units.js` defines `Unit` (a sprite with HP/MP bars) → `Enemy` / `PlayerCharacter`. Content is data-driven through index modules, so adding content means creating a file *and* registering it in its index:
- Heroes: `src/game/units/heroes/*.js` + `heroesIndex.js`. Each hero class implements `levelUp()` and `checkSkills()` (filters its skill list by `levelReq`) and has a static `baseStats` that `Party.getStartingParty()` (`src/game/party.js`) uses for a new game.
- Enemies: `src/game/units/enemies/*.js` + `enemiesIndex.js`. Constructor args are `(scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable)`, and skills are set in `this.skills`. Every enemy in the index can be picked at random in battle.
- Skills: `src/game/skills/<class>Skills.js` arrays of `{ name, damage, mpCost, levelReq, target? }` + `skillsIndex.js`.
- Items: `src/game/items/*.js` (`healValue` restores HP, `manaValue` restores MP) + `itemIndex.js`. The item effects are applied in `PartyScene`.

## Tests

Tests in `src/tests/` avoid booting Phaser: they call scene prototype methods with a hand-built fake `this`, e.g. `BattleScene.prototype.endBattleVictory.call(testScene)`, and `jest.mock` the index modules and `save.js`. Test names reference course requirement IDs (`REQ-x FR-y`).
