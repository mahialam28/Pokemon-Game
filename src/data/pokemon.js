/**
 * Pokémon Species Database, PokéAPI localStorage Cache + Offline Fallbacks,
 * Gen 3 Stat & EXP Formulas, Level-Up Learnsets, Shiny Roll (1/4096),
 * Evolution Hook Stub, Animated Gen 5 Battle Sprite Preloader & Mini Party Icons.
 */

import { getMove } from './moves.js';
import { drawStarterPlaceholder } from './starters.js';

const SPECIES_CACHE_KEY = 'mq_species_cache_v1';

const NATURES = [
  'HARDY', 'LONELY', 'BRAVE', 'ADAMANT', 'NAUGHTY',
  'BOLD', 'DOCILE', 'RELAXED', 'IMPISH', 'LAX',
  'TIMID', 'HASTY', 'SERIOUS', 'JOLLY', 'NAIVE',
  'MODEST', 'MILD', 'QUIET', 'BASHFUL', 'RASH',
  'CALM', 'GENTLE', 'SASSY', 'CAREFUL', 'QUIRKY',
];

/** Hardcoded authentic Gen 3 data & offline fallbacks for Starters + Route 1 wild species. */
export const SPECIES = {
  1: {
    id: 1, name: 'BULBASAUR', slug: 'bulbasaur', types: ['GRASS', 'POISON'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    baseExp: 64, catchRate: 45, height: 7, weight: 69,
    flavor: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this POKéMON.',
    starterMoves: ['tackle', 'growl'],
    learnset: { 7: 'vineWhip', 10: 'poisonPowder', 13: 'razorLeaf' },
    evolveLevel: 16,
    typeColor: '#4BA64A', typeLight: '#82D478', typeDark: '#265E2B',
  },
  4: {
    id: 4, name: 'CHARMANDER', slug: 'charmander', types: ['FIRE'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    baseExp: 62, catchRate: 45, height: 6, weight: 85,
    flavor: 'The flame that burns at the tip of its tail is an indication of its emotions and life force.',
    starterMoves: ['scratch', 'growl'],
    learnset: { 7: 'ember', 10: 'smokescreen', 13: 'metalClaw' },
    evolveLevel: 16,
    typeColor: '#E85D32', typeLight: '#FFA068', typeDark: '#8F2D14',
  },
  7: {
    id: 7, name: 'SQUIRTLE', slug: 'squirtle', types: ['WATER'],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    baseExp: 63, catchRate: 45, height: 5, weight: 90,
    flavor: 'Shoots water at prey while in the water. Withdraws into its shell when in danger.',
    starterMoves: ['tackle', 'tailWhip'],
    learnset: { 7: 'bubble', 10: 'withdraw', 13: 'waterGun', 15: 'bite' },
    evolveLevel: 16,
    typeColor: '#3D88DC', typeLight: '#82C4FF', typeDark: '#1E4C8C',
  },
  10: {
    id: 10, name: 'CATERPIE', slug: 'caterpie', types: ['BUG'],
    baseStats: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 },
    baseExp: 39, catchRate: 255, height: 3, weight: 29,
    flavor: 'Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.',
    starterMoves: ['tackle', 'stringShot'],
    learnset: {},
    evolveLevel: 7,
    typeColor: '#8EA82C', typeLight: '#C4DC68', typeDark: '#506414',
  },
  13: {
    id: 13, name: 'WEEDLE', slug: 'weedle', types: ['BUG', 'POISON'],
    baseStats: { hp: 40, atk: 35, def: 30, spa: 20, spd: 20, spe: 50 },
    baseExp: 39, catchRate: 255, height: 3, weight: 32,
    flavor: 'Often found in forests, eating leaves. It has a sharp venomous stinger on its head.',
    starterMoves: ['poisonSting', 'stringShot'],
    learnset: {},
    evolveLevel: 7,
    typeColor: '#984EA8', typeLight: '#CE8CE0', typeDark: '#562664',
  },
  16: {
    id: 16, name: 'PIDGEY', slug: 'pidgey', types: ['NORMAL', 'FLYING'],
    baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
    baseExp: 50, catchRate: 255, height: 3, weight: 18,
    flavor: 'A common sight in forests and woods. It flaps its wings at ground level to kick up blinding sand.',
    starterMoves: ['tackle', 'sandAttack'],
    learnset: { 9: 'gust', 13: 'quickAttack' },
    evolveLevel: 18,
    typeColor: '#7E90E0', typeLight: '#B8C4FA', typeDark: '#465496',
  },
  19: {
    id: 19, name: 'RATTATA', slug: 'rattata', types: ['NORMAL'],
    baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
    baseExp: 51, catchRate: 255, height: 3, weight: 35,
    flavor: 'Bites anything when it attacks. Small and very quick, it is a common sight in many places.',
    starterMoves: ['tackle', 'tailWhip'],
    learnset: { 7: 'quickAttack', 13: 'bite' },
    evolveLevel: 20,
    typeColor: '#909488', typeLight: '#C0C4B8', typeDark: '#5C6056',
  },
  25: {
    id: 25, name: 'PIKACHU', slug: 'pikachu', types: ['ELECTRIC'],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    baseExp: 112, catchRate: 190, height: 4, weight: 60,
    flavor: 'When several of these POKéMON gather, their electricity could build and cause lightning storms.',
    starterMoves: ['thunderShock', 'growl'],
    learnset: { 6: 'tailWhip', 11: 'quickAttack' },
    evolveLevel: null,
    typeColor: '#E8B828', typeLight: '#FFE478', typeDark: '#8E6C10',
  },
  29: {
    id: 29, name: 'NIDORAN♀', slug: 'nidoran-f', types: ['POISON'],
    baseStats: { hp: 55, atk: 47, def: 52, spa: 40, spd: 40, spe: 41 },
    baseExp: 55, catchRate: 235, height: 4, weight: 70,
    genderFixed: '♀',
    flavor: 'Although small, its venomous barbs render this POKéMON dangerous. The female has smaller horns.',
    starterMoves: ['scratch', 'growl'],
    learnset: { 8: 'tailWhip', 12: 'poisonSting' },
    evolveLevel: 16,
    typeColor: '#984EA8', typeLight: '#CE8CE0', typeDark: '#562664',
  },
  32: {
    id: 32, name: 'NIDORAN♂', slug: 'nidoran-m', types: ['POISON'],
    baseStats: { hp: 46, atk: 57, def: 40, spa: 40, spd: 40, spe: 50 },
    baseExp: 55, catchRate: 235, height: 5, weight: 90,
    genderFixed: '♂',
    flavor: 'Stiffens its ears to sense danger. The larger its horns, the more powerful its secreted venom.',
    starterMoves: ['peck', 'leer'],
    learnset: { 8: 'poisonSting' },
    evolveLevel: 16,
    typeColor: '#984EA8', typeLight: '#CE8CE0', typeDark: '#562664',
  },
};

// Load any previously cached PokéAPI species overrides from localStorage
try {
  const cached = JSON.parse(localStorage.getItem(SPECIES_CACHE_KEY) || '{}');
  for (const [idStr, sp] of Object.entries(cached)) {
    const id = Number(idStr);
    if (SPECIES[id]) {
      SPECIES[id] = { ...SPECIES[id], ...sp };
    } else {
      SPECIES[id] = sp;
    }
  }
} catch {
  // Ignore storage errors
}

function saveSpeciesCache(id, entry) {
  try {
    const cached = JSON.parse(localStorage.getItem(SPECIES_CACHE_KEY) || '{}');
    cached[id] = entry;
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore quota errors
  }
}

export function getSpecies(speciesId) {
  return SPECIES[speciesId] || SPECIES[1];
}

export function getCounterStarterId(playerStarterId) {
  if (playerStarterId === 1) return 4;
  if (playerStarterId === 4) return 7;
  return 1;
}

/**
 * Fetch base stats, types, height & weight from PokéAPI and cache in localStorage.
 * Falls back gracefully to hardcoded SPECIES entries when offline.
 */
export async function fetchSpeciesFromPokeApi(id) {
  const existing = SPECIES[id];
  if (existing && existing._fetched) return existing;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) return existing || SPECIES[1];
    const data = await res.json();
    const statMap = {};
    for (const s of data.stats) {
      statMap[s.stat.name] = s.base_stat;
    }
    const merged = {
      ...(existing || {}),
      id: data.id,
      name: (existing && existing.name) || data.name.toUpperCase(),
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
      baseExp: data.base_experience || (existing && existing.baseExp) || 55,
      catchRate: (existing && existing.catchRate) || 190,
      height: data.height || (existing && existing.height) || 5,
      weight: data.weight || (existing && existing.weight) || 50,
      starterMoves: (existing && existing.starterMoves) || ['tackle'],
      learnset: (existing && existing.learnset) || {},
      _fetched: true,
    };
    SPECIES[id] = merged;
    saveSpeciesCache(id, merged);
    return merged;
  } catch {
    return existing || SPECIES[1];
  }
}

/** Gen 3 HP & Other Stat Formulas */
export function calcHpStat(base, iv, level) {
  return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
}

export function calcOtherStat(base, iv, level) {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

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

export function expForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(0.8 * Math.pow(level, 3));
}

function randomIv() {
  return Math.floor(Math.random() * 32);
}

/** Return the display name (nickname if set, otherwise species name). */
export function getPokemonDisplayName(mon) {
  if (!mon) return 'POKéMON';
  return (mon.nickname && mon.nickname.trim()) || mon.name;
}

/**
 * Create a full Phase 3 Pokémon object with IVs, Nature stub, Gender,
 * 1/4096 Shiny roll, OT info, moves, stats, and EXP tracking.
 */
export function createPokemon(
  speciesId,
  level = 5,
  { otName = 'RED', otId = '00001', allowShiny = true } = {}
) {
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

  // Build moveset from starterMoves + any learnset moves up to `level` (keep last 4)
  const moveIds = [...(sp.starterMoves || ['tackle'])];
  if (sp.learnset) {
    const lvKeys = Object.keys(sp.learnset)
      .map(Number)
      .sort((a, b) => a - b);
    for (const lv of lvKeys) {
      if (lv <= level) {
        const mId = sp.learnset[lv];
        if (!moveIds.includes(mId)) moveIds.push(mId);
      }
    }
  }
  const finalMoveIds = moveIds.slice(-4);
  const moves = finalMoveIds.map((moveId) => {
    const def = getMove(moveId);
    return { id: def.id, pp: def.maxPp, maxPp: def.maxPp };
  });

  const gender = sp.genderFixed || (Math.random() < 0.5 ? '♂' : '♀');
  const isShiny = allowShiny && Math.random() < 1 / 4096;
  const nature = NATURES[Math.floor(Math.random() * NATURES.length)];

  const baseLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);

  return {
    speciesId: sp.id,
    id: sp.id,
    name: sp.name,
    nickname: null,
    slug: sp.slug,
    types: [...sp.types],
    level,
    gender,
    isShiny,
    nature,
    otName,
    otId,
    baseStats: { ...sp.baseStats },
    baseExp: sp.baseExp,
    catchRate: sp.catchRate || 190,
    ivs,
    stats,
    maxHp: stats.hp,
    currentHp: stats.hp,
    moves,
    exp: baseLevelExp,
    expFloor: baseLevelExp,
    expNext: nextLevelExp,
    status: null, // null | 'PSN'
  };
}

export function ensureFullPokemon(mon) {
  if (!mon) return null;
  if (mon.stats && mon.ivs && Array.isArray(mon.moves) && mon.moves.length > 0) {
    const sp = getSpecies(mon.speciesId || mon.id || 1);
    if (mon.maxHp === undefined) mon.maxHp = mon.stats.hp;
    if (mon.currentHp === undefined) mon.currentHp = mon.hp ?? mon.maxHp;
    if (mon.expFloor === undefined) mon.expFloor = expForLevel(mon.level || 5);
    if (mon.expNext === undefined) mon.expNext = expForLevel((mon.level || 5) + 1);
    if (mon.exp < mon.expFloor) mon.exp = mon.expFloor;
    if (!mon.gender) mon.gender = sp.genderFixed || '♂';
    if (!mon.nature) mon.nature = NATURES[0];
    if (!mon.otName) mon.otName = 'RED';
    if (!mon.otId) mon.otId = '00001';
    if (mon.catchRate === undefined) mon.catchRate = sp.catchRate || 190;
    if (mon.isShiny === undefined) mon.isShiny = false;
    return mon;
  }
  return createPokemon(mon.speciesId || mon.id || 1, mon.level || 5);
}

/** Return any new move ID learned at exact `level` for a species (or null). */
export function getMoveLearnedAtLevel(speciesId, level) {
  const sp = getSpecies(speciesId);
  if (!sp || !sp.learnset) return null;
  return sp.learnset[level] || null;
}

/** Phase 4 Evolution Check Stub (returns true if Pokémon meets evolution level). */
export function checkEvolutionStub(mon) {
  const sp = getSpecies(mon.speciesId || mon.id);
  return Boolean(sp && sp.evolveLevel && mon.level >= sp.evolveLevel);
}

/** Grant EXP, recalculate stats on level-up, and collect any newly unlockable moves. */
export function applyExpGain(mon, amount) {
  const oldStats = { ...mon.stats };
  const oldLevel = mon.level;
  mon.exp += amount;

  let leveledUp = false;
  const newMoveIds = [];

  while (mon.exp >= mon.expNext && mon.level < 100) {
    mon.level += 1;
    leveledUp = true;
    mon.expFloor = expForLevel(mon.level);
    mon.expNext = expForLevel(mon.level + 1);

    const nextStats = calculateStats(mon.baseStats, mon.ivs, mon.level);
    const hpGain = Math.max(0, nextStats.hp - mon.stats.hp);
    mon.stats = nextStats;
    mon.maxHp = nextStats.hp;
    if (mon.currentHp > 0) {
      mon.currentHp = Math.min(mon.maxHp, mon.currentHp + hpGain);
    }

    const learned = getMoveLearnedAtLevel(mon.speciesId, mon.level);
    if (learned && !mon.moves.some((m) => m.id === learned) && !newMoveIds.includes(learned)) {
      newMoveIds.push(learned);
    }
  }

  return {
    leveledUp,
    oldLevel,
    newLevel: mon.level,
    oldStats,
    newStats: { ...mon.stats },
    newMoveIds,
    canEvolve: leveledUp && checkEvolutionStub(mon),
  };
}

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

export function healParty(party) {
  for (const mon of party || []) {
    healPokemon(mon);
  }
}

// =========================================================================
// ANIMATED GEN 5 BATTLE SPRITES (NORMAL & SHINY) + GEN 7 MINI PARTY ICONS
// =========================================================================

const gen5BattleCache = new Map();
const miniIconCache = new Map();

export function getGen5AnimatedUrl(speciesId, side = 'front', isShiny = false) {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
  if (side === 'back') {
    return isShiny ? `${base}/back/shiny/${speciesId}.gif` : `${base}/back/${speciesId}.gif`;
  }
  return isShiny ? `${base}/shiny/${speciesId}.gif` : `${base}/${speciesId}.gif`;
}

export function getStaticBattleUrl(speciesId, side = 'front', isShiny = false) {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  if (side === 'back') {
    return isShiny ? `${base}/back/shiny/${speciesId}.png` : `${base}/back/${speciesId}.png`;
  }
  return isShiny ? `${base}/shiny/${speciesId}.png` : `${base}/${speciesId}.png`;
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

/** Preload animated Gen 5 GIF (normal or shiny) with static PNG fallback. */
export function preloadBattleSprite(speciesId, side = 'front', isShiny = false) {
  const key = `${speciesId}_${side}_${isShiny ? 's' : 'n'}`;
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
    const gifUrl = getGen5AnimatedUrl(speciesId, side, isShiny);
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

    const pngUrl = getStaticBattleUrl(speciesId, side, isShiny);
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

/**
 * Retrieve/preload Gen 7 mini party icon (with automatic fallback to scaled front PNG).
 */
export function getMiniIcon(speciesId) {
  let entry = miniIconCache.get(speciesId);
  if (entry) return entry;

  entry = { img: null, status: 'loading' };
  miniIconCache.set(speciesId, entry);

  const iconUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${speciesId}.png`;
  const fallbackUrl = getStaticBattleUrl(speciesId, 'front', false);

  loadImageSafe(iconUrl, 3000)
    .then((img) => {
      entry.img = img;
      entry.status = 'loaded';
    })
    .catch(() =>
      loadImageSafe(fallbackUrl, 3000)
        .then((img) => {
          entry.img = img;
          entry.status = 'loaded';
        })
        .catch(() => {
          entry.status = 'error';
        })
    );

  return entry;
}

export function drawMiniIcon(ctx, speciesId, x, y, size = 30) {
  const entry = getMiniIcon(speciesId);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (entry.status === 'loaded' && entry.img) {
    const scale = Math.min(size / entry.img.naturalWidth, size / entry.img.naturalHeight);
    const dw = Math.round(entry.img.naturalWidth * scale);
    const dh = Math.round(entry.img.naturalHeight * scale);
    ctx.drawImage(
      entry.img,
      Math.round(x + (size - dw) / 2),
      Math.round(y + (size - dh) / 2),
      dw,
      dh
    );
  } else {
    drawStarterPlaceholder(ctx, x, y, size, getSpecies(speciesId));
  }
  ctx.restore();
}

export function drawBattlePlaceholder(ctx, mon, centerX, bottomY, size, { alpha = 1 } = {}) {
  const sp = getSpecies(mon.speciesId || mon.id);
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.imageSmoothingEnabled = false;
  drawStarterPlaceholder(ctx, centerX - size / 2, bottomY - size, size, sp);
  ctx.restore();
}
