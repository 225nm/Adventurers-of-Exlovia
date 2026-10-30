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
`BootScene` (loads assets, creates the shared `Inventory`) → `TitleScene` (load, or New Game → `PartySelectScene` where the player picks 2 starting heroes) → `WorldScene` (tilemap, random chests, enemy zones). Touching an enemy zone runs `scene.switch('BattleScene')`. `BattleScene` runs `UIScene` (defined in the same `battle.js`) for menus; on victory it launches `VictoryScene`, which stops the battle scenes and wakes `WorldScene`. `WorldMenuScene` is launched over the world and opens `PartyScene`, `ItemScene` and `StatsScene`. `OptionsScene` is opened from the title and world menu: the caller pauses itself and passes `{ returnTo: key }`, and Options resumes it on close. Scenes that get reused hook the `wake` event (`this.sys.events.on('wake', ...)`) to reset their state, so code that re-initializes a scene has to go through the wake handler, not just `create`.

**Shared state lives in `this.registry`**, not on scene instances:

- `partyData`: array of plain hero stat objects (`type`, `hp`, `maxHp`, `mp`, `maxMp`, `xp`, `level`, `damage`, `magic`, `skills`, `equipment: { weapon, armor }`). This is the source of truth between battles.
- `inventory`: `[{ name, qty }]`, wrapped by `Inventory` (`src/game/inventory.js`), which is reachable as `this.game.inventory` and writes back to the registry on every change.
- `usedItem`: hands off which item was chosen between `ItemScene` and `PartyScene`.

`saveSystem` (`src/game/save.js`) saves `partyData` + `inventory` + a `version` to `localStorage` under the key `party_data`. When adding a hero stat, bump `SAVE_VERSION` and fill the stat in `migrateHero` so old saves still load. Audio settings are stored separately (`exlovia_settings`, `src/game/audio/settings.js`).

**Battle lifecycle**: `BattleScene.startBattle` builds hero sprites from `partyData` by looking up `heroesIndex[type]`, applies equipment bonuses (`Equipment.getBonus`, `src/game/equipment.js`), then spawns 2 random enemies from `enemiesIndex`. Each round, units act in speed order (`turnOrder`: `speed` + gear `speedBonus` + a 0-3 random roll, fastest first), drawn from `this.turnQueue`. Enemies have a 33% chance to use a random skill. Heroes and enemies both act through `performAction`, which plays the animation (`src/game/battleAnimations.js`) and applies damage in the animation's `onImpact` callback, so damage lands when the hit visually lands. After a win, `saveHeroData` applies level-ups (`xp >= level * 20` → `hero.levelUp()`), copies the sprite stats back into `partyData`, saves, and returns the level-ups for `VictoryScene`.

**Damage model** (`Unit.attack(target, skill)` / `takeDamage` in `units.js`): every attack is `physical` or `magic` (`skill.type`, basic attacks are physical with power 1). Physical damage = (`damage` + `attackBonus`) × `skill.power` − target `defense`. Magic damage = (`magic` + `magicBonus`) × `skill.power` − target `magicDefense`. A hit always does at least 1. Equipment bonuses are kept separate from base stats, so they're never saved into `damage`. `Unit.previewDamage(target, skill)` uses the same formula without dealing damage. The battle UI uses it to show yellow damage numbers over enemies while browsing skills or picking a target.

**Dungeon progression** (`src/game/progression.js`, `src/game/loot.js`): the stairs take the party one floor deeper (`registry.floor`, saved). On the way down the party recovers 50% HP/MP and the game autosaves, and the hero class not picked at the start joins on `Progression.recruitFloor` (3) at the party's average level. Enemy stats are written as floor 1 values, and `Progression.scaleEnemy` scales them per floor. Each enemy's `minFloor` decides when it appears (`enemyPool`/`pickEnemy`), and old types retire 3 floors later. Item `tier` decides when items show up in chests (tier 2 from floor 3, tier 3 from floor 6), and enemy drops roll each `{ item, chance }` entry. XP per level is `Progression.xpToNext`. Roaming map enemies show their type and lead the battle (`registry.encounter`). If every hero falls, `GameOverScene` returns to the title, so Continue loads the last save.

**Audio** (`src/game/audio/`) is synthesized with the Web Audio API; there are no audio files. `audioEngine.js` is the mixer (music/SFX buses with an SNES-style echo) and becomes a no-op where Web Audio is missing (jsdom). `Sfx.<name>()` plays effects. `Music.play(name)` plays songs from `songs.js`, which are written as a chord list plus a melody string. Each melody must add up to exactly 4 beats per chord, or it drifts out of time with the chords on every loop.

**Units and content registries**: `src/game/units.js` defines `Unit` (a sprite with HP/MP bars) → `Enemy` / `PlayerCharacter`. Content is data-driven through index modules, so adding content means creating a file _and_ registering it in its index:

- Heroes: `src/game/units/heroes/*.js` + `heroesIndex.js`. Each hero class has static `baseStats` (level 1) and `growth` (`{ hp, mp, damage, magic, speed }` per level), implements `levelUp()` (via `gainLevel(growth)`) and `checkSkills()` (filters its skill list by `levelReq`). `Party.createHero(type, level)` builds party data at any level. Static `description` and `sprite` are shown on the party selection screen.
- Enemies: `src/game/units/enemies/*.js` + `enemiesIndex.js`. Each file defines static `minFloor`, `sprite` (`{ texture, frame, scale, worldScale, flipX }`) and `stats` (`{ name, hp, damage, magic, defense, magicDefense, xp, loot, skills }`) and passes them to `Enemy.call(this, scene, x, y, sprite, stats)`.
- Skills: `src/game/skills/<class>Skills.js` arrays of `{ name, description, power, mpCost, levelReq, target?, type, element? }`. The description is shown on the party menu's Skills page and in the battle message box while browsing skills, so keep it under about 34 characters + `skillsIndex.js`. Enemy skills use the same shape without `mpCost`/`levelReq`. `element` (`fire`/`ice`/`lightning`/`dark`) picks the spell's color, particles and sound (`ELEMENTS` in `battleAnimations.js`). Keep `name + ' ' + mpCost` under about 14 characters so it fits the skill menu.
- Items: `src/game/items/*.js`. `itemIndex.js` collects every exported item automatically, keyed by its display name. Consumables use `healValue`/`manaValue` (applied in `PartyScene`). Equipment has a `slot` (`weapon`/`armor`) and any of `attack`, `magic`, `defense`, `magicDefense`. Every item needs a `tier` and a short `description` for the inventory detail panel.
- **All art is original**, made in two ways. Besides the art below, the only image files are the Press Start 2P font and exports for Tiled and the favicon (see `public/assets/CREDITS.md`).
  - **Battle and title sprites are SVG illustrations rendered to pixel art PNGs.** The sources live in `tools/sprites/src/*.svg` and `tools/sprites/render.mjs` turns them into `public/assets/sprites/<key>.png`. The script draws each SVG large in headless Chrome, averages it down, snaps every pixel to the hex colors written in the SVG (plus 6 free colors for blended edges) and adds a 1px dark outline. The style is **anime JRPG with cel shading**: each material is a light and a shadow tone split by a hard edge, written as a gradient with two stops at the same offset, so only colors the SVG declares appear in the sprite. Heads are big and eyes are large and shiny. At sprite size a vector eye turns to mush, so heroes and title figures place their eyes and mouths pixel by pixel: the root `viewBox` is the sprite's pixel size, the art sits in a `scale()` group, and the face is a group of 1-unit `<rect>`s after it. Sizes and recolors (the frost wisp and blue dragon reuse the `wisp`/`dragon` SVGs with swapped hex colors) are set in its `SPRITES` table. Rerun it after editing an SVG: `node tools/sprites/render.mjs`. It needs `playwright-core`, which isn't a project dependency (point `PLAYWRIGHT` at its entry file), and an installed Chrome. `ONLY=slime,bat` renders a subset. `BootScene.preload` loads each PNG under its file name, so a new sprite needs an entry in both `SPRITES` lists. Heroes are `battler-<hero>` (38x47, 3/4 view, drawn facing right and flipped by the hero classes to face the enemies), enemies use their own keys, and `title-knight`/`title-mage` are painted onto the title backdrop.
  - **Map sprites, tiles and backdrops are drawn in code at boot** (`src/game/art/`, `Art.createAll`). This art is written as text rows of **flat material colors**, and `pixelArt.js` shades it when painting. Light comes from the top-left (warm highlights, cool shadows), `o` pixels become outlines in a dark shade of the material they border, and palette entries like `{ color, flat: true }` skip shading (eyes, glows). Symmetric art is written as left halves (`mirror`). The map sprites are `heroes.js` walking sheets `hero-<class>` at 16x24 with frames `down0-2`/`up0-2`/`side0-2`, and enemies as 16px `<key>-mini`. Heroes are slim, about 3-3.5 heads tall, and the player collides with its feet only (body 10x8). Enemy files point at both sprites via `sprite.texture` and `sprite.world`. `world.js` builds the `tiles` sheet in the 2x3 layout `map.json` expects (1/3 grass, 2/4/5 trees, 6 bush), plus `chest` and `stairs`. `backdrops.js` paints `title` and `battle-bg`. Never add copyrighted or third-party art.

## Tests

**Do not write new unit tests or update existing ones** unless explicitly asked. Verify changes by running the game instead.

**The unit tests are outdated.** They no longer fully reflect the current game systems, so a failing test doesn't necessarily mean the code is wrong, and a passing one doesn't prove it's right.

Tests in `src/tests/` avoid booting Phaser: they call scene prototype methods with a hand-built fake `this`, e.g. `BattleScene.prototype.endBattleVictory.call(testScene)`, and `jest.mock` the index modules and `save.js`. Test names reference course requirement IDs (`REQ-x FR-y`).
