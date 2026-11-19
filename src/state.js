/**
 * Global game state and localStorage persistence (Phase 1 + Phase 2).
 * Persists: playerName, rivalName, starter, rivalStarter, party (full Pokémon objects),
 * money, settings (zoom, textSpeed), story flags, and player map + position.
 */

import { CONFIG } from './config.js';
import { createPokemon, ensureFullPokemon, getCounterStarterId, getSpecies } from './data/pokemon.js';

const SAVE_STORAGE_KEY = 'monster_quest_dawn_save_v1';

function createDefaultState() {
  return {
    playerName: 'RED',
    rivalName: CONFIG.DEFAULT_RIVAL_NAME || 'GARY',
    starter: null, // Starter metadata object
    rivalStarter: null, // Counter starter species metadata
    money: 0,
    flags: {
      talkedToMom: false,
      metProf: false,
      gotStarter: false,
      rivalPickedStarter: false,
      rivalBattleDone: false,
      rivalBattleWon: false,
      healedByMom: false,
      demoCompleted: false,
    },
    settings: {
      graphicsMode: CONFIG.DEFAULT_GRAPHICS_MODE || 'classic', // 'classic' | 'enhanced'
      zoom: CONFIG.DEFAULT_ZOOM || 'normal', // 'normal' (2x) | 'close' (3x)
      textSpeed: CONFIG.DEFAULT_TEXT_SPEED || 'normal', // 'slow' | 'normal' | 'fast'
      settingsVersion: 3,
    },
    location: {
      mapId: 'bedroom',
      x: 2,
      y: 4,
      facing: 'down',
    },
    party: [],
    bag: {
      pokeballs: 0,
      potions: 0,
    },
    pokedex: {
      seen: [],
      caught: [],
    },
  };
}

export const gameState = createDefaultState();

/** Reset in-memory state for a fresh playthrough. */
export function resetState(playerName = 'RED', rivalName = CONFIG.DEFAULT_RIVAL_NAME || 'GARY') {
  const fresh = createDefaultState();
  fresh.playerName = playerName || 'RED';
  fresh.rivalName = rivalName || CONFIG.DEFAULT_RIVAL_NAME || 'GARY';
  Object.assign(gameState, fresh);
}

/** Set the chosen starter, create a full Gen 3 Lv 5 Pokémon in party, and record rival counter. */
export function setStarter(starter) {
  gameState.starter = { ...starter };
  const mon = createPokemon(starter.id, 5);
  gameState.party = [mon];
  gameState.flags.gotStarter = true;

  const counterId = getCounterStarterId(starter.id);
  const counterSp = getSpecies(counterId);
  gameState.rivalStarter = {
    id: counterSp.id,
    name: counterSp.name,
    slug: counterSp.slug,
    type: counterSp.types[0],
  };

  if (!gameState.pokedex.seen.includes(starter.id)) {
    gameState.pokedex.seen.push(starter.id);
  }
  if (!gameState.pokedex.caught.includes(starter.id)) {
    gameState.pokedex.caught.push(starter.id);
  }
  saveGame();
}

/** Return the player's lead party Pokémon (ensuring full Phase 2 structure). */
export function getLeadPokemon() {
  if (!gameState.party || gameState.party.length === 0) {
    if (gameState.starter) {
      gameState.party = [createPokemon(gameState.starter.id, 5)];
    } else {
      return null;
    }
  }
  gameState.party[0] = ensureFullPokemon(gameState.party[0]);
  return gameState.party[0];
}

/** Persist current state to localStorage. */
export function saveGame() {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(gameState));
    return true;
  } catch {
    return false;
  }
}

export function hasSave() {
  try {
    return localStorage.getItem(SAVE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Load saved state from localStorage and gracefully migrate Phase 1 saves. */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const fresh = createDefaultState();
    Object.assign(gameState, fresh, parsed);
    gameState.flags = { ...fresh.flags, ...(parsed.flags || {}) };
    gameState.settings = { ...fresh.settings, ...(parsed.settings || {}) };
    // Migrate pre-v3 saves cleanly to Classic Gen 3 + Normal zoom defaults
    if (!parsed.settings || (parsed.settings.settingsVersion || 1) < 3) {
      gameState.settings.graphicsMode = 'classic';
      gameState.settings.zoom = 'normal';
      gameState.settings.settingsVersion = 3;
    }
    gameState.location = { ...fresh.location, ...(parsed.location || {}) };
    gameState.bag = { ...fresh.bag, ...(parsed.bag || {}) };
    gameState.pokedex = { ...fresh.pokedex, ...(parsed.pokedex || {}) };

    // Ensure every party Pokémon has full Gen 3 stats, IVs, moves & EXP
    if (Array.isArray(gameState.party)) {
      gameState.party = gameState.party.map((m) => ensureFullPokemon(m)).filter(Boolean);
    }
    if (gameState.starter && !gameState.flags.gotStarter) {
      gameState.flags.gotStarter = true;
    }
    if (gameState.starter && !gameState.rivalStarter) {
      const counterSp = getSpecies(getCounterStarterId(gameState.starter.id));
      gameState.rivalStarter = {
        id: counterSp.id,
        name: counterSp.name,
        slug: counterSp.slug,
        type: counterSp.types[0],
      };
    }
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  resetState('RED', CONFIG.DEFAULT_RIVAL_NAME || 'GARY');
}

/** Replace {PLAYER}, {RIVAL}, {STARTER}, and {RIVAL_STARTER} tokens in dialogue. */
export function formatText(text) {
  const player = gameState.playerName || 'RED';
  const rival = gameState.rivalName || CONFIG.DEFAULT_RIVAL_NAME || 'GARY';
  const starter = gameState.starter ? gameState.starter.name : 'POKéMON';
  const rivalStarter = gameState.rivalStarter ? gameState.rivalStarter.name : 'POKéMON';
  return String(text)
    .replaceAll('{PLAYER}', player)
    .replaceAll('{RIVAL}', rival)
    .replaceAll('{STARTER}', starter)
    .replaceAll('{RIVAL_STARTER}', rivalStarter);
}
