/**
 * Pokémon species database, Gen 3 stat formulas, EXP/leveling helpers,
 * battle sprite loader (HD primary + PokéAPI front/back fallback),
 * and PokéAPI stub for future phases.
 */

import { CONFIG } from '../config.js';
import { getMove } from './moves.js';
import { drawStarterPlaceholder } from './starters.js';

/** Hardcoded authentic Gen 3 base stats for #1, #4, #7. */
export const SPECIES = {
  1: {
    id: 1,
    name: 'BULBASAUR',
    slug: 'bulbasaur',
    types: ['GRASS', 'POISON'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    baseExp: 64,
    starterMoves: ['tackle', 'growl'],
    typeColor: '#4BA64A',
    typeLight: '#82D478',
    typeDark: '#265E2B',
  },
  4: {
    id: 4,
    name: 'CHARMANDER',
    slug: 'charmander',
    types: ['FIRE'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    baseExp: 62,
    starterMoves: ['scratch', 'growl'],
    typeColor: '#E85D32',
    typeLight: '#FFA068',
    typeDark: '#8F2D14',
  },
  7: {
    id: 7,
    name: 'SQUIRTLE',
    slug: 'squirtle',
    types: ['WATER'],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    baseExp: 63,
    starterMoves: ['tackle', 'tailWhip'],
    typeColor: '#3D88DC',
    typeLight: '#82C4FF',
    typeDark: '#1E4C8C',
  },
};

export function getSpecies(speciesId) {
  return SPECIES[speciesId] || SPECIES[1];
}

/** Return the rival's type-advantage counter starter species ID. */
export function getCounterStarterId(playerStarterId) {
  if (playerStarterId === 1) return 4; // Bulbasaur -> Charmander
  if (playerStarterId === 4) return 7; // Charmander -> Squirtle
  return 1; // Squirtle -> Bulbasaur
}

/**
 * Future-phase stub: fetch any National Dex species from PokéAPI.
 * Populates SPECIES[id] at runtime once Phase 3 routes/Pokédex are added.
 */
export async function fetchSpeciesFromPokeApi(id) {
  if (SPECIES[id]) return SPECIES[id];
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`PokéAPI request failed for #${id}`);
  const data = await res.json();
  const statMap = {};
  for (const s of data.stats) {
    statMap[s.stat.name] = s.base_stat;
  }
  const species = {
    id: data.id,
    name: data.name.toUpperCase(),
    slug: data.name.toLowerCase(),
    types: data.types.map((t) => t.type.name.toUpperCase()),
    baseStats: {
      hp: statMap.hp || 45,
      atk: statMap.attack || 45,
      def: statMap.defense || 45,
      spa: statMap['special-attack'] || 45,
      spd: statMap['special-defense'] || 45,
      spe: statMap.speed || 45,
    },
    baseExp: data.base_experience || 60,
    starterMoves: ['tackle'],
  };
  SPECIES[id] = species;
  return species;
}

/** Gen 3 HP stat formula: floor((2*Base + IV) * Lv / 100) + Lv + 10 */
export function calcHpStat(base, iv, level) {
  return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
}

/** Gen 3 non-HP stat formula: floor((2*Base + IV) * Lv / 100) + 5 */
export function calcOtherStat(base, iv, level) {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

/** Calculate all 6 Gen 3 stats from baseStats, IVs, and level. */
export function calculateStats(baseStats, ivs, level) {
  return {
    hp: calcHpStat(baseStats.hp, ivs.hp, level),
    atk: calcOtherStat(baseStats.atk, ivs.atk, level),
    def: calcOtherStat(baseStats.def, ivs.def, level),
    spa: calcOtherStat(baseStats.spa, ivs.spa, level),
    spd: calcOtherStat(baseStats.spd, ivs.spd, level),
    spe: calcOtherStat(baseStats.spe, ivs.spe, level),
  };
}

/** EXP required to reach a given level (tuned so Lv5->Lv6 needs 55 EXP). */
export function expForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(0.8 * Math.pow(level, 3));
}

function randomIv() {
  return Math.floor(Math.random() * 32); // 0..31 inclusive
}

/**
 * Create a full reusable Pokémon instance ready for battles, party, and saving.
 */
export function createPokemon(speciesId, level = 5) {
  const sp = getSpecies(speciesId);
  const ivs = {
    hp: randomIv(),
    atk: randomIv(),
    def: randomIv(),
    spa: randomIv(),
    spd: randomIv(),
    spe: randomIv(),
  };
  const stats = calculateStats(sp.baseStats, ivs, level);
  const moves = sp.starterMoves.map((moveId) => {
    const def = getMove(moveId);
    return { id: def.id, pp: def.maxPp, maxPp: def.maxPp };
  });

  const baseLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);

  return {
    speciesId: sp.id,
    id: sp.id,
    name: sp.name,
    slug: sp.slug,
    types: [...sp.types],
    level,
    gender: Math.random() < 0.875 ? '♂' : '♀', // Authentic 87.5% / 12.5% starter ratio
    baseStats: { ...sp.baseStats },
    baseExp: sp.baseExp,
    ivs,
    stats,
    maxHp: stats.hp,
    currentHp: stats.hp,
    moves,
    exp: baseLevelExp,
    expFloor: baseLevelExp,
    expNext: nextLevelExp,
    status: null,
  };
}

/**
 * Normalize a Pokémon loaded from older saves so Phase 1 saves upgrade seamlessly!
 */
export function ensureFullPokemon(mon) {
  if (!mon) return null;
  if (mon.stats && mon.ivs && Array.isArray(mon.moves) && mon.moves.length > 0) {
    if (mon.maxHp === undefined) mon.maxHp = mon.stats.hp;
    if (mon.currentHp === undefined) mon.currentHp = mon.hp ?? mon.maxHp;
    if (mon.expFloor === undefined) mon.expFloor = expForLevel(mon.level || 5);
    if (mon.expNext === undefined) mon.expNext = expForLevel((mon.level || 5) + 1);
    if (mon.exp < mon.expFloor) mon.exp = mon.expFloor;
    if (!mon.gender) mon.gender = '♂';
    return mon;
  }
  return createPokemon(mon.speciesId || mon.id || 1, mon.level || 5);
}

/** Grant EXP and apply any level-up stat recalculation. */
export function applyExpGain(mon, amount) {
  const oldStats = { ...mon.stats };
  const oldLevel = mon.level;
  mon.exp += amount;

  let leveledUp = false;
  while (mon.exp >= mon.expNext && mon.level < 100) {
    mon.level += 1;
    leveledUp = true;
    mon.expFloor = expForLevel(mon.level);
    mon.expNext = expForLevel(mon.level + 1);

    const nextStats = calculateStats(mon.baseStats, mon.ivs, mon.level);
    const hpGain = Math.max(0, nextStats.hp - mon.stats.hp);
    mon.stats = nextStats;
    mon.maxHp = nextStats.hp;
    mon.currentHp = Math.min(mon.maxHp, mon.currentHp + hpGain);
  }

  return {
    leveledUp,
    oldLevel,
    newLevel: mon.level,
    oldStats,
    newStats: { ...mon.stats },
  };
}

/** Fully restore a single Pokémon's HP, PP, and status. */
export function healPokemon(mon) {
  if (!mon) return;
  mon.currentHp = mon.maxHp || mon.stats.hp;
  mon.status = null;
  for (const m of mon.moves || []) {
    const def = getMove(m.id);
    m.maxPp = m.maxPp || def.maxPp;
    m.pp = m.maxPp;
  }
}

/** Fully heal all Pokémon in a party array. */
export function healParty(party) {
  for (const mon of party || []) {
    healPokemon(mon);
  }
}

// =========================================================================
// ANIMATED GEN 5 BATTLE SPRITE PRELOADER (WITH STATIC POKÉAPI PNG FALLBACK)
// =========================================================================

const gen5BattleCache = new Map();

export function getGen5AnimatedUrl(speciesId, side = 'front') {
  if (side === 'back') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${speciesId}.gif`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${speciesId}.gif`;
}

export function getStaticBattleUrl(speciesId, side = 'front') {
  if (side === 'back') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${speciesId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

function loadImageSafe(url, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let done = false;
    const t = setTimeout(() => {
      if (!done) {
        done = true;
        reject(new Error('timeout'));
      }
    }, timeoutMs);
    img.onload = () => {
      if (!done) {
        done = true;
        clearTimeout(t);
        if (img.naturalWidth > 0) resolve(img);
        else reject(new Error('empty'));
      }
    };
    img.onerror = () => {
      if (!done) {
        done = true;
        clearTimeout(t);
        reject(new Error('error'));
      }
    };
    img.src = url;
  });
}

/**
 * Preload an animated Gen 5 battle GIF (front or back), falling back automatically
 * to the static PokéAPI PNG if unavailable. Cached after first load.
 * Resolves to { url, width, height, isAnimated, status }.
 */
export function preloadBattleSprite(speciesId, side = 'front') {
  const key = `${speciesId}_${side}`;
  const cached = gen5BattleCache.get(key);
  if (cached) return cached.promise;

  const entry = {
    url: null,
    width: 64,
    height: 64,
    isAnimated: false,
    status: 'loading',
    promise: null,
  };
  gen5BattleCache.set(key, entry);

  entry.promise = (async () => {
    const gifUrl = getGen5AnimatedUrl(speciesId, side);
    try {
      const img = await loadImageSafe(gifUrl, 3800);
      entry.url = gifUrl;
      entry.width = img.naturalWidth;
      entry.height = img.naturalHeight;
      entry.isAnimated = true;
      entry.status = 'loaded';
      return entry;
    } catch {
      // Fallback to static PokéAPI PNG
    }

    const pngUrl = getStaticBattleUrl(speciesId, side);
    try {
      const img = await loadImageSafe(pngUrl, 3200);
      entry.url = pngUrl;
      entry.width = img.naturalWidth;
      entry.height = img.naturalHeight;
      entry.isAnimated = false;
      entry.status = 'loaded';
      return entry;
    } catch {
      entry.status = 'error';
      return entry;
    }
  })();

  return entry.promise;
}

/** Offline canvas fallback placeholder if neither GIF nor PNG could load. */
export function drawBattlePlaceholder(ctx, mon, centerX, bottomY, size, { alpha = 1 } = {}) {
  const sp = getSpecies(mon.speciesId || mon.id);
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.imageSmoothingEnabled = false;
  drawStarterPlaceholder(ctx, centerX - size / 2, bottomY - size, size, sp);
  ctx.restore();
}
