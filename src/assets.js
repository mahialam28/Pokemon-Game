/**
 * Asset pipeline loader with progress tracking and graceful procedural fallbacks.
 * Reads /assets/manifest.json and loads any configured tilesets, character sheets,
 * UI textures, plus starter Pokémon HD renders.
 */

import { preloadStarterSprites, STARTERS } from './data/starters.js';
import { initSprites, registerExternalCharacter } from './entities/sprites.js';
import { initTiles, registerExternalTileset } from './world/tiles.js';

export const assets = {
  ui: {},
  tilesetLoaded: false,
  characterSheetsLoaded: [],
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) resolve(img);
      else reject(new Error(`Empty image: ${url}`));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Boot asset loader: builds procedural HD-2D fallback art, loads any custom drop-in
 * assets declared in /assets/manifest.json, and preloads starter HD renders.
 *
 * @param {Function} onProgress ({ progress: 0..1, label: string }) => void
 */
export async function loadAllAssets(onProgress = () => {}) {
  // Base steps: procedural tiles, procedural characters, manifest, 3 starters
  let completed = 0;
  let total = 3 + STARTERS.length;

  const bump = (label) => {
    completed += 1;
    onProgress({
      progress: Math.min(1, completed / Math.max(1, total)),
      label,
    });
  };

  // 1. Build HD-2D procedural tiles (always available as instant fallback)
  onProgress({ progress: 0.04, label: 'CRAFTING WORLD TILES...' });
  initTiles();
  bump('WORLD TILES READY');

  // 2. Build HD-2D 16x24 procedural characters (always available as fallback)
  initSprites();
  bump('CHARACTERS READY');

  // 3. Load optional custom assets from /assets/manifest.json
  const manifest = await fetchJsonSafe('./assets/manifest.json');
  bump('CHECKING ASSET PACKS...');

  const extraTasks = [];

  if (manifest) {
    // Optional custom 16x16 tileset PNG + JSON tile index
    if (manifest.tileset && manifest.tilesetIndex) {
      total += 1;
      extraTasks.push(async () => {
        try {
          const [img, indexJson] = await Promise.all([
            loadImage(`./assets/${manifest.tileset}`),
            fetchJsonSafe(`./assets/${manifest.tilesetIndex}`),
          ]);
          if (img && indexJson) {
            registerExternalTileset(img, indexJson);
            assets.tilesetLoaded = true;
          }
        } catch {
          // Gracefully keep procedural tiles
        }
        bump('TILESET LOADED');
      });
    }

    // Optional custom character spritesheets (player, mom, prof, aide)
    if (manifest.characters && typeof manifest.characters === 'object') {
      for (const [charKey, cfg] of Object.entries(manifest.characters)) {
        if (!cfg || !cfg.src) continue;
        total += 1;
        extraTasks.push(async () => {
          try {
            const img = await loadImage(`./assets/${cfg.src}`);
            registerExternalCharacter(charKey, img, cfg);
            assets.characterSheetsLoaded.push(charKey);
          } catch {
            // Gracefully keep procedural character sprite
          }
          bump(`LOADED ${charKey.toUpperCase()}`);
        });
      }
    }

    // Optional custom UI images
    if (manifest.ui && typeof manifest.ui === 'object') {
      for (const [uiKey, src] of Object.entries(manifest.ui)) {
        if (!src) continue;
        total += 1;
        extraTasks.push(async () => {
          try {
            assets.ui[uiKey] = await loadImage(`./assets/${src}`);
          } catch {
            // Gracefully keep procedural UI chrome
          }
          bump(`UI ${uiKey.toUpperCase()}`);
        });
      }
    }
  }

  // Run custom drop-in asset tasks + starter HD render preloading concurrently
  await Promise.all([
    ...extraTasks.map((fn) => fn()),
    preloadStarterSprites((starter) => {
      bump(`LOADING ${starter.name}...`);
    }),
  ]);

  onProgress({ progress: 1, label: 'READY!' });
}
