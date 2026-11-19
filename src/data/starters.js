/**
 * Starter Pokémon definitions and HD-2D sprite/render loader.
 * Primary: HD renders from PokémonDB (smooth-scaled, cached locally after first load).
 * Fallback 1: PokéAPI pixel sprites by National Dex number.
 * Fallback 2: Procedural pixel-art placeholder.
 */

export const SPRITE_CONFIG = {
  /** Primary HD renders for Starter Select & End screens. */
  USE_HD_SPRITES: true,
};

export const STARTERS = [
  {
    id: 1,
    name: 'BULBASAUR',
    slug: 'bulbasaur',
    type: 'GRASS',
    typeColor: '#4BA64A',
    typeLight: '#82D478',
    typeDark: '#265E2B',
    description: 'A calm seed POKéMON with a bulb.',
  },
  {
    id: 4,
    name: 'CHARMANDER',
    slug: 'charmander',
    type: 'FIRE',
    typeColor: '#E85D32',
    typeLight: '#FFA068',
    typeDark: '#8F2D14',
    description: 'A lively lizard with a tail flame.',
  },
  {
    id: 7,
    name: 'SQUIRTLE',
    slug: 'squirtle',
    type: 'WATER',
    typeColor: '#3D88DC',
    typeLight: '#82C4FF',
    typeDark: '#1E4C8C',
    description: 'A tiny turtle in a tough shell.',
  },
];

export function getStarterById(id) {
  return STARTERS.find((s) => s.id === id) || STARTERS[0];
}

export function getHdSpriteUrl(starter) {
  return `https://img.pokemondb.net/sprites/home/normal/2x/${starter.slug}.jpg`;
}

export function getPixelSpriteUrl(starter) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starter.id}.png`;
}

/**
 * In-memory cache keyed by starter.id:
 * { img, isHd: boolean, status: 'loading' | 'loaded' | 'error', promise }
 */
const spriteCache = new Map();

function loadImageWithTimeout(url, timeoutMs = 4500) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('timeout'));
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        if (img.naturalWidth > 0) resolve(img);
        else reject(new Error('empty'));
      }
    };
    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error('load_error'));
      }
    };
    img.src = url;
  });
}

/**
 * Load (or return cached) starter render.
 * Tries HD PokémonDB render first, then falls back cleanly to PokéAPI pixel sprite.
 */
export function getStarterSprite(starter) {
  let entry = spriteCache.get(starter.id);
  if (entry) return entry;

  entry = {
    img: null,
    isHd: false,
    status: 'loading',
    promise: null,
  };
  spriteCache.set(starter.id, entry);

  const attemptChain = async () => {
    if (SPRITE_CONFIG.USE_HD_SPRITES) {
      try {
        const hdImg = await loadImageWithTimeout(getHdSpriteUrl(starter), 4000);
        entry.img = hdImg;
        entry.isHd = true;
        entry.status = 'loaded';
        return entry;
      } catch {
        // Fall through to PokéAPI pixel sprite
      }
    }

    try {
      const pxImg = await loadImageWithTimeout(getPixelSpriteUrl(starter), 3500);
      entry.img = pxImg;
      entry.isHd = false;
      entry.status = 'loaded';
      return entry;
    } catch {
      entry.status = 'error';
      return entry;
    }
  };

  entry.promise = attemptChain();
  return entry;
}

/** Preload all starter images and return a Promise that resolves once done (or timed out). */
export function preloadStarterSprites(onItemDone = null) {
  return Promise.all(
    STARTERS.map(async (starter) => {
      const entry = getStarterSprite(starter);
      await entry.promise;
      if (onItemDone) onItemDone(starter);
    })
  );
}

/** Procedural pixel-art placeholder when offline or images fail to load. */
export function drawStarterPlaceholder(ctx, x, y, size, starter) {
  const px = Math.max(2, Math.floor(size / 16));
  const ox = Math.round(x + (size - px * 16) / 2);
  const oy = Math.round(y + (size - px * 16) / 2);

  const main = starter ? starter.typeColor : '#7090B0';
  const light = starter ? starter.typeLight : '#A8C4E0';
  const dark = starter ? starter.typeDark : '#384858';

  const pattern = [
    '................',
    '.....######.....',
    '...##LLMMMM##...',
    '..#LLMMMMMMMM#..',
    '.#LMMMM##MMMMM#.',
    '.#MMMM#WW#MMMM#.',
    '.#MMMMW##WMMMM#.',
    '.#MMMMMMMMMMMM#.',
    '.#MM#MM##MM#MM#.',
    '.#MM#MMMMMM#MM#.',
    '..#MMMMMMMMMM#..',
    '...#MM#MM#MM#...',
    '...#MM####MM#...',
    '....##....##....',
    '................',
    '................',
  ];

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const ch = pattern[row][col];
      if (ch === '.') continue;
      if (ch === '#') ctx.fillStyle = dark;
      else if (ch === 'L') ctx.fillStyle = light;
      else if (ch === 'M') ctx.fillStyle = main;
      else if (ch === 'W') ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + col * px, oy + row * px, px, px);
    }
  }
}

/**
 * Draw the starter render cleanly inside a square area (x, y, size).
 * - HD renders: smooth high-quality scaling (aspect-ratio preserved)
 * - PokéAPI fallback: crisp nearest-neighbour scaling
 * - Offline fallback: procedural pixel placeholder
 */
export function drawStarterSprite(ctx, starter, x, y, size, { flash = false } = {}) {
  const entry = getStarterSprite(starter);
  const dx = Math.round(x);
  const dy = Math.round(y);

  ctx.save();

  if (entry.status === 'loaded' && entry.img && entry.img.naturalWidth > 0) {
    const iw = entry.img.naturalWidth;
    const ih = entry.img.naturalHeight;
    const scale = Math.min(size / iw, size / ih);
    const dw = Math.round(iw * scale);
    const dh = Math.round(ih * scale);
    const ox = dx + Math.round((size - dw) / 2);
    const oy = dy + Math.round((size - dh) / 2);

    if (entry.isHd) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    } else {
      ctx.imageSmoothingEnabled = false;
    }

    ctx.drawImage(entry.img, ox, oy, dw, dh);

    if (flash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fillRect(ox, oy, dw, dh);
    }
  } else {
    ctx.imageSmoothingEnabled = false;
    drawStarterPlaceholder(ctx, dx, dy, size, starter);
    if (flash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fillRect(dx + 8, dy + 8, size - 16, size - 16);
    }
  }

  ctx.restore();
}
