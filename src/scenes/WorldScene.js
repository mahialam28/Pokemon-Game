/**
 * WorldScene — Classic GBA Pokémon Overworld Exploration Scene
 * Loads 16x16 Tiled map (gba_test.json), authentic GBA Red trainer sprite,
 * multi-layer depth sorting (ground, paths, decorations, buildings, trees, overhead), and collision.
 */

import { Camera } from '../rendering/Camera.js';
import { TileMap } from '../world/TileMap.js';
import { Player } from '../entities/Player.js';

export class WorldScene {
  constructor(mapPath = 'maps/towns/gba_test.json') {
    this.mapPath = mapPath;
    this.map = new TileMap();
    this.player = null;
    this.camera = null;
    this.loaded = false;
    this.error = null;
    this.game = null;
  }

  async init(game) {
    this.game = game;
    try {
      await this.map.load(this.mapPath);

      // Player spawns on the dirt path in front of the house door (col: 8.5, row: 6.5)
      const spawnX = 8.5 * this.map.tileWidth;
      const spawnY = 6.5 * this.map.tileHeight;
      this.player = new Player(spawnX, spawnY);
      this.player.direction = 'down';
      await this.player.load('assets/characters/gba_player.png');

      // Camera with authentic GBA viewport
      this.camera = new Camera(game.width, game.height, 10);
      this.camera.setBounds(0, 0, this.map.getPixelWidth(), this.map.getPixelHeight());
      this.camera.follow(this.player);

      this.loaded = true;
    } catch (err) {
      console.error('Failed to initialize WorldScene:', err);
      this.error = err.message;
    }
  }

  update(input, dt) {
    if (!this.loaded) return;

    this.player.update(input, this.map);
    this.camera.update();

    if (input.isJustPressed('fullscreen')) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  render(ctx) {
    const { width, height } = this.game;

    if (!this.loaded) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.error ? `Error: ${this.error}` : 'Loading GBA Test Map...', width / 2, height / 2);
      return;
    }

    const camOffset = this.camera.getRenderOffset();

    // 1. Clear background
    ctx.fillStyle = '#48a048';
    ctx.fillRect(0, 0, width, height);

    // 2. Render bottom/middle layers
    this.map.renderLayer(ctx, 'ground', camOffset, width, height);
    this.map.renderLayer(ctx, 'paths', camOffset, width, height);
    this.map.renderLayer(ctx, 'decorations', camOffset, width, height);
    this.map.renderLayer(ctx, 'buildings', camOffset, width, height);
    this.map.renderLayer(ctx, 'trees_base', camOffset, width, height);

    // 3. Render Player entity
    this.player.render(ctx, camOffset);

    // 4. Render overhead layer (roof ridges, tree crowns above player)
    this.map.renderLayer(ctx, 'overhead', camOffset, width, height);

    // 5. Minimal classic GBA location indicator
    this._renderGBAHUD(ctx, width, height);
  }

  _renderGBAHUD(ctx, width, height) {
    ctx.save();
    // Compact top-left banner
    ctx.fillStyle = 'rgba(16, 24, 32, 0.85)';
    ctx.fillRect(4, 4, 110, 14);
    ctx.strokeStyle = '#d8a848';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 4.5, 109, 13);

    ctx.fillStyle = '#f8f8f0';
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('PALLET TOWN • RESIDENCE', 8, 11);

    // Controls hint
    const hintW = 90;
    const hintX = width - hintW - 4;
    ctx.fillStyle = 'rgba(16, 24, 32, 0.85)';
    ctx.fillRect(hintX, height - 15, hintW, 11);
    ctx.strokeStyle = '#4880c8';
    ctx.strokeRect(hintX + 0.5, height - 14.5, hintW - 1, 10);

    ctx.fillStyle = '#a0b0c8';
    ctx.font = '6px monospace';
    ctx.fillText('ARROWS: Move | SHIFT: Run', hintX + 4, height - 9);

    ctx.restore();
  }
}
