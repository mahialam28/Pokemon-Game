# Custom Pixel Art Assets Guide

This project supports drop-in replacement PNG tilesets, character spritesheets, and UI textures.
If an asset is not configured or fails to load, the game **automatically falls back to the built-in HD-2D procedural art** so it always runs cleanly with zero errors.

## Folder Structure

```
/assets/
  manifest.json          <- Register your custom files here
  /tiles/
    tileset.png          <- 16x16 grid tileset PNG (transparent background)
    tileset.json         <- Maps tile names to { "x": col, "y": row } in tileset.png
  /characters/
    player.png           <- 4-direction character spritesheet (16x20 or 16x32 per frame)
    mom.png              <- 4-direction character spritesheet
    prof.png             <- 4-direction character spritesheet
    aide.png             <- 4-direction character spritesheet
    rival.png            <- 4-direction character spritesheet
    neighbour.png        <- 4-direction character spritesheet
  /ui/
    frame.png            <- Optional custom dialogue/menu frame texture
```

---

## 1. Registering Assets (`manifest.json`)

Edit `/assets/manifest.json` to enable any files you drop in:

```json
{
  "tileset": "tiles/tileset.png",
  "tilesetIndex": "tiles/tileset.json",
  "characters": {
    "player":    { "src": "characters/player.png",    "frameWidth": 16, "frameHeight": 20, "frames": 4 },
    "mom":       { "src": "characters/mom.png",       "frameWidth": 16, "frameHeight": 20, "frames": 4 },
    "prof":      { "src": "characters/prof.png",      "frameWidth": 16, "frameHeight": 20, "frames": 4 },
    "aide":      { "src": "characters/aide.png",      "frameWidth": 16, "frameHeight": 20, "frames": 4 },
    "rival":     { "src": "characters/rival.png",     "frameWidth": 16, "frameHeight": 20, "frames": 4 },
    "neighbour": { "src": "characters/neighbour.png", "frameWidth": 16, "frameHeight": 20, "frames": 4 }
  },
  "ui": {}
}
```

Set any entry to `null` (or omit it) to use the built-in procedural fallback for that asset.

---

## 2. Tileset Format (`/assets/tiles/`)

- **Image**: `tileset.png` — any width/height that is a multiple of `16` pixels (`16×16` per tile).
- **Index**: `tileset.json` — maps uppercase tile names from `src/world/tiles.js` to `{ "x": col, "y": row }` (0-indexed tile coordinates) or an array of frames `[{ "x": 0, "y": 2 }, { "x": 1, "y": 2 }]` for animated tiles (`FLOWER`, `TALL_GRASS`, `WATER`, `LAB_MACHINE`, `TV`).

Only tiles present in `tileset.json` are overridden — omitted tiles keep their procedural fallback.

---

## 3. Character Spritesheet Format (`/assets/characters/`)

- **Recommended frame size (Classic GBA/DS ROM proportions)**: **`16×20` pixels** (feet centered on a `16×16` tile, head overlapping 4px above).
- **Also supports `16×32` sheets with empty space on top** (very common in free CC0 RPG packs): simply set `"frameWidth": 16, "frameHeight": 32`. Frames are automatically bottom-aligned (`py + 16 - frameHeight`) so the character's feet land cleanly on the `16×16` tile!
- **Layout**: **4 rows** (directions) × **3 or 4 columns** (walk frames):
  - Row `0`: Facing **Down**
  - Row `1`: Facing **Up**
  - Row `2`: Facing **Left**
  - Row `3`: Facing **Right**
  - *(For RPG Maker / LPC sheets, set `"rowOrder": ["down", "left", "right", "up"]` in `manifest.json`.)*
- **Columns**:
  - **4-frame sheet** (`64×80` for `16×20`, `64×128` for `16×32`): `[Idle, Left Step, Passing/Idle, Right Step]`
  - **3-frame sheet** (`48×80` for `16×20`, `48×128` for `16×32`): `[Left Step, Idle, Right Step]` (auto-mapped to the 4-step walk cycle)
