# Monster Quest: Dawn Version — HD Pixel-Art Rebuild

An authentic Gen 1 / GBA-inspired Pokémon RPG foundation built in Vanilla JavaScript, HTML5 Canvas, and Tiled Map Editor JSON format.

## Overview

- **Engine Foundation**: Vanilla JavaScript (ES Modules), HTML5 Canvas 2D, zero external runtime framework dependencies.
- **Base Grid**: 32×32 pixel tiles with multi-layering support (Ground, Paths, Decorations, Buildings, Trees, Overhead/Roofs, Collision).
- **Map Architecture**: Standard Tiled Map Editor JSON (`maps/towns/prototype.json`).
- **Visual Design**: Handcrafted GBA-quality pixel art matching the architectural concept specifications (terracotta roofs, cross gables with timber trusses, stone plinths, flowerboxes, cobblestone paths, and volumetric foliage).
- **Entities**: 4-direction animated player character with smooth motion, running toggle, and pixel-precise bounding box collision.
- **Camera**: Smooth 2D target tracking with integer pixel rendering and architectural framing.

## Running Locally

To play the prototype in your browser:

```bash
# Start local server
npm run dev
# or
python3 -m http.server 3000
```

Open `http://localhost:3000` in your web browser.

### Controls
- **WASD / Arrow Keys**: Move (4 directions)
- **Shift**: Run
- **F**: Toggle Fullscreen

## Legacy Project Backup

The complete previous codebase, assets, battle system, cutscenes, and full Git history are safely archived in:

- Snapshot: `backup/legacy-game/`
- Full Git History Bundle: `backup/legacy-game/legacy-git-history.bundle`
- Documentation: `backup/legacy-game/BACKUP_README.md`
