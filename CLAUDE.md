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

**Entry**: `src/start.js` creates the `Phaser.Game` (320×240 canvas, pixel art, arcade physics), registers every scene, and registers two text factories: `this.add.pixelText(x, y, text, size)` (bitmap font) and `this.add.colorText(x, y, text, cssColor)` (colored text).

**The game uses `Phaser.CANVAS`, where `setTint`/`setTintFill` do nothing.** Highlight text by switching to the yellow bitmap font (`setFont('pressstarty')`), use `colorText` for other colors, and use alpha/scale/colored shapes for sprite effects. Particle textures are generated in `BootScene` (`spark-fire`, `spark-ice`, `spark-magic`, `spark-white`).

**Starting a scene without data reuses its previous start data** (Phaser only replaces `settings.data` when data is passed). Always pass data explicitly to scenes whose `init` reads it, e.g. `scene.start('PartyScene', { mode: 'VIEW' })`.

**Scene flow** (`src/game/scenes/`):
`BootScene` (loads assets, creates the shared `Inventory`) → `TitleScene` (new game / load) → `WorldScene` (tilemap, random chests, enemy zones). Touching an enemy zone runs `scene.switch('BattleScene')`. `BattleScene` runs `UIScene` (defined in the same `battle.js`) for menus; on victory it launches `VictoryScene`, which stops the battle scenes and wakes `WorldScene`. `WorldMenuScene` is launched over the world and opens `PartyScene`, `ItemScene` and `StatsScene`. `OptionsScene` is opened from the title and world menu: the caller pauses itself and passes `{ returnTo: key }`, and Options resumes it on close. Scenes that get reused hook the `wake` event (`this.sys.events.on('wake', ...)`) to reset their state, so code that re-initializes a scene has to go through the wake handler, not just `create`.

**Shared state lives in `this.registry`**, not on scene instances:
- `partyData`: array of plain hero stat objects (`type`, `hp`, `maxHp`, `mp`, `maxMp`, `xp`, `level`, `damage`, `magic`, `skills`, `equipment: { weapon, armor }`). This is the source of truth between battles.
- `inventory`: `[{ name, qty }]`, wrapped by `Inventory` (`src/game/inventory.js`), which is reachable as `this.game.inventory` and writes back to the registry on every change.
- `usedItem`: hands off which item was chosen between `ItemScene` and `PartyScene`.

`saveSystem` (`src/game/save.js`) saves `partyData` + `inventory` + a `version` to `localStorage` under the key `party_data`. When adding a hero stat, bump `SAVE_VERSION` and fill the stat in `migrateHero` so old saves still load. Audio settings are stored separately (`exlovia_settings`, `src/game/audio/settings.js`).

**Battle lifecycle**: `BattleScene.startBattle` builds hero sprites from `partyData` by looking up `heroesIndex[type]`, applies equipment bonuses (`Equipment.getBonus`, `src/game/equipment.js`), then spawns 2 random enemies from `enemiesIndex`. Turns go round-robin through `this.units`. Enemies have a 33% chance to use a random skill. Heroes and enemies both act through `performAction`, which plays the animation (`src/game/battleAnimations.js`) and applies damage in the animation's `onImpact` callback, so damage lands when the hit visually lands. After a win, `saveHeroData` applies level-ups (`xp >= level * 20` → `hero.levelUp()`), copies the sprite stats back into `partyData`, saves, and returns the level-ups for `VictoryScene`.

**Damage model** (`Unit.attack` / `takeDamage` in `units.js`): every attack is `physical` or `magic` (`skill.type`, basic attacks are physical). Physical damage = base + `attackBonus` − target `defense`. Magic damage = base + `magic` + `magicBonus` − target `magicDefense`. A hit always does at least 1. Equipment bonuses are kept separate from base stats, so they're never saved into `damage`.

**Audio** (`src/game/audio/`) is synthesized with the Web Audio API; there are no audio files. `audioEngine.js` is the mixer (music/SFX buses with an SNES-style echo) and becomes a no-op where Web Audio is missing (jsdom). `Sfx.<name>()` plays effects. `Music.play(name)` plays songs from `songs.js`, which are written as a chord list plus a melody string. Each melody must add up to exactly 4 beats per chord, or it drifts out of time with the chords on every loop.

**Units and content registries**: `src/game/units.js` defines `Unit` (a sprite with HP/MP bars) → `Enemy` / `PlayerCharacter`. Content is data-driven through index modules, so adding content means creating a file *and* registering it in its index:
- Heroes: `src/game/units/heroes/*.js` + `heroesIndex.js`. Each hero class implements `levelUp()` and `checkSkills()` (filters its skill list by `levelReq`) and has a static `baseStats` that `Party.getStartingParty()` (`src/game/party.js`) uses for a new game.
- Enemies: `src/game/units/enemies/*.js` + `enemiesIndex.js`. Constructor args are `(scene, x, y, texture, frame, name, hp, dmg, xpDrop, lootTable)`, and skills are set in `this.skills`. Every enemy in the index can be picked at random in battle.
- Skills: `src/game/skills/<class>Skills.js` arrays of `{ name, damage, mpCost, levelReq, target?, type, element? }` + `skillsIndex.js`. `element` (`fire`/`ice`) picks the spell's color, particles and sound.
- Items: `src/game/items/*.js` + `itemIndex.js`, keyed by the item's display name. Consumables use `healValue`/`manaValue` (applied in `PartyScene`). Equipment has a `slot` (`weapon`/`armor`) and any of `attack`, `magic`, `defense`, `magicDefense`. Every item needs a short `description` for the inventory detail panel.

## Tests

**Do not write new unit tests or update existing ones** unless explicitly asked. Verify changes by running the game instead.

**The unit tests are outdated.** They no longer fully reflect the current game systems, so a failing test doesn't necessarily mean the code is wrong, and a passing one doesn't prove it's right.

Tests in `src/tests/` avoid booting Phaser: they call scene prototype methods with a hand-built fake `this`, e.g. `BattleScene.prototype.endBattleVictory.call(testScene)`, and `jest.mock` the index modules and `save.js`. Test names reference course requirement IDs (`REQ-x FR-y`).
