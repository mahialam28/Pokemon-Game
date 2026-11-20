# Monster Quest: Dawn Version — Legacy Project Backup

**Backup Date**: 2026-11-20  
**Snapshot Location**: `backup/legacy-game/`  
**Git Bundle**: `backup/legacy-game/legacy-git-history.bundle`  

---

## 1. Original Project Overview

This folder contains an independent, full snapshot of the original *Monster Quest: Dawn Version* codebase prior to the Phase 1 clean restart.

### Key Components Backed Up:
- **`src/`** (41 files):
  - `src/main.js` — Original game loop, scene manager, loading screen.
  - `src/assets.js` — Asset loading pipeline and fallback manager.
  - `src/state.js` — Game state flags, party data, player progress.
  - `src/audio.js` — Sound effects and BGM triggers.
  - `src/input.js` — Keyboard handling and button mapping.
  - `src/battle/` — Turn-based battle system, BattleScene, BattleUI, moves, damage calculation.
  - `src/world/` — Procedural metatile generator (`tiles.js`), maps (`maps.js`), lighting, particles, and house modules (`heroHouseTiles.js`, `rivalHouseTiles.js`, `friendHouseTiles.js`).
  - `src/entities/` — Player entity, NPC definitions, spritesheet compiler.
  - `src/scenes/` — OverworldScene, TitleScene, StarterSelectScene, EndOfDemoScene.
  - `src/ui/` — BagScene, PartyScene, PokedexScene, ShopScene, TrainerCardScene, font rendering.
  - `src/data/` — Encounters, items, moves, Pokémon stats, starters, type chart.
  - `src/gfx/` — Pixel-art canvas compilation and battle trainer graphics.
- **`assets/`** (8 files):
  - `assets/manifest.json` — Asset pack descriptor.
  - `assets/tiles/` — Tileset JSON & PNG.
  - `assets/characters/` — Drop-in character sprites.
  - `assets/ui/` — UI chrome graphics.
- **`scratch/`** (9 files):
  - Offline tile authoring scripts, validators, and capture test scripts.
- **Root Files**:
  - `index.html` — Canvas viewport wrapper.
  - `style.css` — Responsive scaling and pixelated rendering rules.
  - `README.md` — Original project README.
- **Git History**:
  - `legacy-git-history.bundle` — Complete Git bundle of repository commits and branch refs.

---

## 2. Excluded Items

- `node_modules` — None present in original project.
- Temporary OS caches (`.DS_Store`).

---

## 3. How to Restore the Legacy Project

To restore and run this backup independently:

1. **Option A: Direct in-place test**
   ```bash
   cd backup/legacy-game
   python3 -m http.server 8080
   # Open http://localhost:8080 in your browser
   ```

2. **Option B: Restore to a separate clean repository**
   ```bash
   mkdir ~/Desktop/MonsterQuest-Legacy
   cp -R backup/legacy-game/* ~/Desktop/MonsterQuest-Legacy/
   cd ~/Desktop/MonsterQuest-Legacy
   # Restore git history if desired:
   git clone legacy-git-history.bundle restored-git
   ```

3. **Option C: Revert current workspace to this backup**
   ```bash
   cp -R backup/legacy-game/src ./
   cp -R backup/legacy-game/assets ./
   cp backup/legacy-game/index.html backup/legacy-game/style.css ./
   ```

