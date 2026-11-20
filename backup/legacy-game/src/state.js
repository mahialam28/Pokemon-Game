/**
 * Global game state and localStorage persistence (Phases 1–3).
 * Persists: playerName, rivalName, trainerId, playTimeFrames, starter, rivalStarter,
 * party (up to 6 full Pokémon), pcBox, bag (pokeball/potion/antidote), money,
 * pokedex (seen/caught), respawn point, picked hidden items, settings, flags & map position.
 */

import { CONFIG } from './config.js';
import {
  createPokemon,
  ensureFullPokemon,
  getCounterStarterId,
  getSpecies,
} from './data/pokemon.js';

const SAVE_STORAGE_KEY = 'monster_quest_dawn_save_v1';

function randomTrainerId() {
  return String(1 + Math.floor(Math.random() * 65534)).padStart(5, '0');
}

function createDefaultState() {
  return {
    playerName: 'RED',
    rivalName: CONFIG.DEFAULT_RIVAL_NAME || 'GARY',
    trainerId: randomTrainerId(),
    playTimeFrames: 0,
    starter: null,
    rivalStarter: null,
    friendStarter: null,
    money: 0,
    flags: {
      talkedToMom: false,
      metProf: false,
      gotStarter: false,
      rivalPickedStarter: false,
      friendReceivedStarter: false,
      rivalBattleDone: false,
      rivalBattleWon: false,
      goalsDiscussed: false,
      healedByMom: false,
      receivedStarterKit: false, // 5 Poké Balls + Pokédex from Professor/Aide
      receivedMomPotions: false, // 2 Potions from Mom when leaving home
      receivedMartSample: false, // Free Potion from Route 1 Mart Employee
      demoCompleted: false,
    },
    settings: {
      graphicsMode: CONFIG.DEFAULT_GRAPHICS_MODE || 'classic',
      zoom: CONFIG.DEFAULT_ZOOM || 'normal',
      textSpeed: CONFIG.DEFAULT_TEXT_SPEED || 'normal',
      settingsVersion: 3,
    },
    location: {
      mapId: 'bedroom',
      x: 2,
      y: 4,
      facing: 'down',
    },
    respawn: {
      mapId: 'downstairs',
      x: 5,
      y: 5,
      facing: 'up',
    },
    party: [],
    pcBox: [],
    bag: {
      pokeball: 0,
      potion: 0,
      antidote: 0,
    },
    pickedItems: [],
    pokedex: {
      seen: [],
      caught: [],
    },
    // Runtime debug toggle (not persisted)
    encountersEnabled: true,
  };
}

export const gameState = createDefaultState();

export function resetState(playerName = 'RED', rivalName = CONFIG.DEFAULT_RIVAL_NAME || 'GARY') {
  const fresh = createDefaultState();
  fresh.playerName = playerName || 'RED';
  fresh.rivalName = rivalName || CONFIG.DEFAULT_RIVAL_NAME || 'GARY';
  Object.assign(gameState, fresh);
}

export function markPokedexSeen(speciesId) {
  const id = Number(speciesId);
  if (!id) return false;
  if (!gameState.pokedex.seen.includes(id)) {
    gameState.pokedex.seen.push(id);
    return true;
  }
  return false;
}

export function markPokedexCaught(speciesId) {
  const id = Number(speciesId);
  if (!id) return false;
  markPokedexSeen(id);
  if (!gameState.pokedex.caught.includes(id)) {
    gameState.pokedex.caught.push(id);
    return true; // Newly registered!
  }
  return false;
}

export function addItem(itemId, qty = 1) {
  if (!gameState.bag) gameState.bag = { pokeball: 0, potion: 0, antidote: 0 };
  gameState.bag[itemId] = Math.max(0, (gameState.bag[itemId] || 0) + qty);
}

export function removeItem(itemId, qty = 1) {
  if (!gameState.bag) return false;
  const cur = gameState.bag[itemId] || 0;
  if (cur < qty) return false;
  gameState.bag[itemId] = cur - qty;
  return true;
}

export function getItemCount(itemId) {
  return (gameState.bag && gameState.bag[itemId]) || 0;
}

/** Add a caught Pokémon to the party (up to 6) or send it to the PC Box. */
export function addCaughtPokemon(mon) {
  mon.otName = gameState.playerName || 'RED';
  mon.otId = gameState.trainerId || '00001';
  markPokedexCaught(mon.speciesId || mon.id);

  if (!Array.isArray(gameState.party)) gameState.party = [];
  if (!Array.isArray(gameState.pcBox)) gameState.pcBox = [];

  if (gameState.party.length < 6) {
    gameState.party.push(mon);
    return 'party';
  }
  gameState.pcBox.push(mon);
  return 'pc';
}

export function getFirstHealthyPartyIndex() {
  for (let i = 0; i < (gameState.party || []).length; i++) {
    const mon = gameState.party[i];
    if (mon && mon.currentHp > 0) return i;
  }
  return -1;
}

export function setStarter(starter) {
  gameState.starter = { ...starter };
  const mon = createPokemon(starter.id, 5, {
    otName: gameState.playerName || 'RED',
    otId: gameState.trainerId || '00001',
    allowShiny: false,
  });
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

  // The 3rd remaining starter is given to Friend
  const remainingId = [1, 4, 7].find((id) => id !== starter.id && id !== counterId) || 1;
  const remainingSp = getSpecies(remainingId);
  gameState.friendStarter = {
    id: remainingSp.id,
    name: remainingSp.name,
    slug: remainingSp.slug,
    type: remainingSp.types[0],
  };

  markPokedexCaught(starter.id);
  saveGame();
}

export function getLeadPokemon() {
  if (!gameState.party || gameState.party.length === 0) {
    if (gameState.starter) {
      gameState.party = [
        createPokemon(gameState.starter.id, 5, {
          otName: gameState.playerName || 'RED',
          otId: gameState.trainerId || '00001',
          allowShiny: false,
        }),
      ];
    } else {
      return null;
    }
  }
  gameState.party = gameState.party.map((m) => ensureFullPokemon(m)).filter(Boolean);
  return gameState.party[0] || null;
}

export function formatPlayTime(frames = gameState.playTimeFrames) {
  const totalSec = Math.floor((frames || 0) / 60);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function saveGame() {
  try {
    const payload = { ...gameState };
    delete payload.encountersEnabled;
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
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

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const fresh = createDefaultState();
    Object.assign(gameState, fresh, parsed);
    gameState.flags = { ...fresh.flags, ...(parsed.flags || {}) };
    gameState.settings = { ...fresh.settings, ...(parsed.settings || {}) };
    if (!parsed.settings || (parsed.settings.settingsVersion || 1) < 3) {
      gameState.settings.graphicsMode = 'classic';
      gameState.settings.zoom = 'normal';
      gameState.settings.settingsVersion = 3;
    }
    gameState.location = { ...fresh.location, ...(parsed.location || {}) };
    gameState.respawn = { ...fresh.respawn, ...(parsed.respawn || {}) };

    // Migrate old bag keys (`pokeballs` / `potions`) seamlessly into Phase 3 keys
    const rawBag = parsed.bag || {};
    gameState.bag = {
      pokeball: rawBag.pokeball ?? rawBag.pokeballs ?? 0,
      potion: rawBag.potion ?? rawBag.potions ?? 0,
      antidote: rawBag.antidote ?? 0,
    };

    gameState.pickedItems = Array.isArray(parsed.pickedItems) ? parsed.pickedItems : [];
    gameState.pokedex = {
      seen: Array.isArray(parsed.pokedex?.seen) ? parsed.pokedex.seen : [],
      caught: Array.isArray(parsed.pokedex?.caught) ? parsed.pokedex.caught : [],
    };
    gameState.party = Array.isArray(parsed.party)
      ? parsed.party.map((m) => ensureFullPokemon(m)).filter(Boolean)
      : [];
    gameState.pcBox = Array.isArray(parsed.pcBox)
      ? parsed.pcBox.map((m) => ensureFullPokemon(m)).filter(Boolean)
      : [];
    gameState.encountersEnabled = true;

    if (gameState.starter && !gameState.flags.gotStarter) {
      gameState.flags.gotStarter = true;
    }
    if (gameState.starter && gameState.starter.id) {
      markPokedexCaught(gameState.starter.id);
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

export function formatText(text) {
  const player = gameState.playerName || 'RED';
  const rival = gameState.rivalName || CONFIG.DEFAULT_RIVAL_NAME || 'GARY';
  const friend = gameState.friendName || 'FRIEND';
  const starter = gameState.starter ? gameState.starter.name : 'POKéMON';
  const rivalStarter = gameState.rivalStarter ? gameState.rivalStarter.name : 'POKéMON';
  const friendStarter = gameState.friendStarter ? gameState.friendStarter.name : 'POKéMON';
  return String(text)
    .replaceAll('{PLAYER}', player)
    .replaceAll('{RIVAL}', rival)
    .replaceAll('{FRIEND}', friend)
    .replaceAll('{STARTER}', starter)
    .replaceAll('{RIVAL_STARTER}', rivalStarter)
    .replaceAll('{FRIEND_STARTER}', friendStarter);
}
