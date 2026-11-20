/**
 * Gen 3 Kanto Pokédex Scene (#001 - #151, 480x270).
 * - Fetches & caches #001..#151 names from PokéAPI in localStorage (with offline fallbacks)
 * - Displays SEEN x / OWN y counter, Poké Ball icon for caught entries, "-----" for unseen
 * - Selecting a SEEN/OWN entry opens Detail View with sprite, types, height/weight & English
 *   flavor text fetched & cached from https://pokeapi.co/api/v2/pokemon-species/{id}
 */

import { audio } from '../audio.js';
import {
  drawMiniIcon,
  fetchSpeciesFromPokeApi,
  getSpecies,
  SPECIES,
} from '../data/pokemon.js';
import { drawStarterSprite } from '../data/starters.js';
import { getTypeColor } from '../data/typeChart.js';
import { gameState } from '../state.js';
import { drawGbaBox, drawText, measureText, wrapText } from './font.js';

const W = 480;
const H = 270;
const TOTAL_DEX = 151;
const VISIBLE_ROWS = 8;

const NAMES_CACHE_KEY = 'mq_pokedex_names_v1';
const FLAVOR_CACHE_KEY = 'mq_pokedex_flavor_v1';

let dexNames = null;
let flavorCache = {};

try {
  dexNames = JSON.parse(localStorage.getItem(NAMES_CACHE_KEY) || 'null');
  flavorCache = JSON.parse(localStorage.getItem(FLAVOR_CACHE_KEY) || '{}');
} catch {
  dexNames = null;
  flavorCache = {};
}

function getFallbackName(id) {
  if (SPECIES[id]) return SPECIES[id].name;
  return `POKéMON #${id}`;
}

async function ensureDexNamesLoaded() {
  if (Array.isArray(dexNames) && dexNames.length >= TOTAL_DEX) return;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_DEX}`);
    if (!res.ok) return;
    const data = await res.json();
    dexNames = (data.results || []).map((r, i) =>
      SPECIES[i + 1] ? SPECIES[i + 1].name : r.name.toUpperCase()
    );
    try {
      localStorage.setItem(NAMES_CACHE_KEY, JSON.stringify(dexNames));
    } catch {
      // Ignore storage quota
    }
  } catch {
    // Offline fallback works transparently via getFallbackName
  }
}

async function fetchFlavorText(id) {
  if (flavorCache[id]) return flavorCache[id];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!res.ok) throw new Error('status');
    const data = await res.json();
    const en = (data.flavor_text_entries || []).find((e) => e.language?.name === 'en');
    const cleaned = en
      ? en.flavor_text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
      : (SPECIES[id] && SPECIES[id].flavor) || 'A mysterious creature of the wild.';
    flavorCache[id] = cleaned;
    try {
      localStorage.setItem(FLAVOR_CACHE_KEY, JSON.stringify(flavorCache));
    } catch {
      // Ignore quota
    }
    return cleaned;
  } catch {
    return (SPECIES[id] && SPECIES[id].flavor) || 'No field notes recorded yet.';
  }
}

export class PokedexScene {
  constructor(manager) {
    this.manager = manager;
    this.cursor = 0; // 0..150 -> Dex #1..151
    this.scroll = 0;
    this.detailId = null;
    this.detailFlavor = '';
    this.detailSpecies = null;
  }

  onEnter() {
    this.cursor = 0;
    this.scroll = 0;
    this.detailId = null;
    this.detailFlavor = '';
    this.detailSpecies = null;
    ensureDexNamesLoaded();
  }

  _isSeen(id) {
    return gameState.pokedex.seen.includes(id);
  }

  _isOwned(id) {
    return gameState.pokedex.caught.includes(id);
  }

  _getName(id) {
    if (Array.isArray(dexNames) && dexNames[id - 1]) return dexNames[id - 1];
    return getFallbackName(id);
  }

  _openDetail(id) {
    this.detailId = id;
    this.detailSpecies = getSpecies(id);
    this.detailFlavor = flavorCache[id] || (SPECIES[id] && SPECIES[id].flavor) || 'Loading field notes...';

    fetchSpeciesFromPokeApi(id).then((sp) => {
      if (this.detailId === id) this.detailSpecies = sp;
    });
    fetchFlavorText(id).then((text) => {
      if (this.detailId === id) this.detailFlavor = text;
    });
  }

  _clampScroll() {
    if (this.cursor < this.scroll) this.scroll = this.cursor;
    if (this.cursor >= this.scroll + VISIBLE_ROWS) {
      this.scroll = this.cursor - VISIBLE_ROWS + 1;
    }
    this.scroll = Math.max(0, Math.min(TOTAL_DEX - VISIBLE_ROWS, this.scroll));
  }

  update(input) {
    if (this.detailId !== null) {
      if (
        input.wasJustPressed('cancel') ||
        input.wasJustPressed('pause') ||
        input.wasJustPressed('confirm')
      ) {
        audio.cancel();
        this.detailId = null;
      }
      return;
    }

    if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
      audio.cancel();
      this.manager.popScene();
      return;
    }

    if (input.wasJustPressed('up')) {
      this.cursor = (this.cursor - 1 + TOTAL_DEX) % TOTAL_DEX;
      this._clampScroll();
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.cursor = (this.cursor + 1) % TOTAL_DEX;
      this._clampScroll();
      audio.blip();
    } else if (input.wasJustPressed('left')) {
      this.cursor = Math.max(0, this.cursor - 10);
      this._clampScroll();
      audio.blip();
    } else if (input.wasJustPressed('right')) {
      this.cursor = Math.min(TOTAL_DEX - 1, this.cursor + 10);
      this._clampScroll();
      audio.blip();
    } else if (input.wasJustPressed('confirm')) {
      const id = this.cursor + 1;
      if (this._isSeen(id)) {
        audio.confirm();
        this._openDetail(id);
      } else {
        audio.bump();
      }
    }
  }

  render(ctx) {
    // Iconic Gen 3 crimson Pokédex shell backdrop
    ctx.fillStyle = '#B83434';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#D84844';
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = '#781E20';
    ctx.fillRect(0, 36, W, 2);

    drawText(ctx, 'KANTO POKéDEX', 18, 12, {
      color: '#FFFDF4',
      shadow: '#581818',
      scale: 2,
    });

    const seenCount = gameState.pokedex.seen.length;
    const ownCount = gameState.pokedex.caught.length;
    drawText(ctx, `SEEN ${seenCount}   OWN ${ownCount}`, 464, 15, {
      color: '#FFE8A0',
      shadow: '#581818',
      scale: 1,
      align: 'right',
    });

    if (this.detailId !== null) {
      this._renderDetail(ctx);
      return;
    }

    // Left preview panel for highlighted entry
    drawGbaBox(ctx, 14, 46, 152, 186, {
      fill: '#FAFBFD',
      outerBorder: '#241820',
      accentBorder: '#688CA8',
      accentHighlight: '#A4C8E4',
      innerBorder: '#344454',
      shadow: false,
    });

    const selId = this.cursor + 1;
    if (this._isSeen(selId)) {
      const sp = getSpecies(selId);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(36, 62, 108, 108);
      drawStarterSprite(ctx, { ...sp, id: selId, slug: sp.slug || this._getName(selId).toLowerCase() }, 44, 70, 92);
      drawText(ctx, this._isOwned(selId) ? 'CAUGHT' : 'SEEN', 90, 184, {
        color: this._isOwned(selId) ? '#2C8C48' : '#587088',
        scale: 1,
        align: 'center',
      });
      drawText(ctx, 'Z: DETAILS', 90, 206, {
        color: '#6C7C8E',
        scale: 1,
        align: 'center',
      });
    } else {
      drawText(ctx, '?', 90, 106, {
        color: '#B8C4D0',
        scale: 3,
        align: 'center',
      });
      drawText(ctx, 'NOT SEEN', 90, 184, {
        color: '#8896A4',
        scale: 1,
        align: 'center',
      });
    }

    // Right scrollable list (#001..#151)
    drawGbaBox(ctx, 174, 46, 292, 186, {
      fill: '#FAFBFD',
      outerBorder: '#241820',
      accentBorder: '#688CA8',
      accentHighlight: '#A4C8E4',
      innerBorder: '#344454',
      shadow: false,
    });

    for (let row = 0; row < VISIBLE_ROWS; row++) {
      const idx = this.scroll + row;
      if (idx >= TOTAL_DEX) break;
      const id = idx + 1;
      const ry = 56 + row * 21;
      const sel = idx === this.cursor;

      if (sel) {
        ctx.fillStyle = '#FFE8D8';
        ctx.fillRect(184, ry - 2, 260, 18);
        drawText(ctx, '▶', 188, ry + 3, { color: '#D83834', scale: 1 });
      }

      const seen = this._isSeen(id);
      const owned = this._isOwned(id);

      // Tiny Poké Ball icon for caught entries
      if (owned) {
        ctx.fillStyle = '#201C28';
        ctx.fillRect(202, ry + 2, 8, 8);
        ctx.fillStyle = '#E04038';
        ctx.fillRect(203, ry + 3, 6, 3);
        ctx.fillStyle = '#F8F8F8';
        ctx.fillRect(203, ry + 6, 6, 3);
      }

      const numStr = `#${String(id).padStart(3, '0')}`;
      const label = seen ? this._getName(id) : '-----';
      drawText(ctx, `${numStr} ${label}`, 216, ry + 3, {
        color: seen ? (sel ? '#182230' : '#2C3848') : '#98A4B0',
        scale: 1,
      });

      if (seen) {
        drawMiniIcon(ctx, id, 418, ry - 3, 20);
      }
    }

    // Scrollbar track
    ctx.fillStyle = '#DCE4EC';
    ctx.fillRect(450, 56, 6, 166);
    const thumbY = 56 + Math.round((this.cursor / (TOTAL_DEX - 1)) * 144);
    ctx.fillStyle = '#D84844';
    ctx.fillRect(450, thumbY, 6, 22);

    // Bottom hint
    drawText(ctx, 'UP/DOWN:SCROLL  LEFT/RIGHT:JUMP 10  Z:INFO  X/ESC:BACK', W / 2, 246, {
      color: '#FFF4E0',
      shadow: '#581818',
      scale: 1,
      align: 'center',
    });
  }

  _renderDetail(ctx) {
    const id = this.detailId;
    const sp = this.detailSpecies || getSpecies(id);
    const name = this._getName(id);

    drawGbaBox(ctx, 20, 48, 440, 204, {
      fill: '#FAFBFD',
      outerBorder: '#241820',
      accentBorder: '#688CA8',
      accentHighlight: '#A4C8E4',
      innerBorder: '#344454',
      shadow: false,
    });

    // Sprite portrait
    ctx.fillStyle = '#E4ECF4';
    ctx.fillRect(36, 64, 96, 96);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(38, 66, 92, 92);
    drawStarterSprite(ctx, { ...sp, id, slug: sp.slug || name.toLowerCase() }, 44, 72, 80);

    // Header details
    drawText(ctx, `#${String(id).padStart(3, '0')}  ${name}`, 148, 66, {
      color: '#1E2634',
      scale: 2,
    });

    let tx = 148;
    for (const t of sp.types || ['NORMAL']) {
      const tc = getTypeColor(t);
      const bw = measureText(t, 1) + 12;
      ctx.fillStyle = tc.bg;
      ctx.fillRect(tx, 90, bw, 14);
      drawText(ctx, t, tx + bw / 2, 93, { color: '#FFFFFF', scale: 1, align: 'center' });
      tx += bw + 6;
    }

    const ht = ((sp.height || 5) / 10).toFixed(1);
    const wt = ((sp.weight || 50) / 10).toFixed(1);
    drawText(ctx, `HT: ${ht} m    WT: ${wt} kg`, 148, 114, { color: '#46586C', scale: 1 });
    drawText(ctx, this._isOwned(id) ? 'STATUS: CAUGHT' : 'STATUS: SEEN ONLY', 148, 130, {
      color: this._isOwned(id) ? '#288C46' : '#687C90',
      scale: 1,
    });

    // Divider + Flavor text
    ctx.fillStyle = '#D4DCE6';
    ctx.fillRect(36, 168, 408, 1);

    const wrapped = wrapText(this.detailFlavor || '', 64).slice(0, 4);
    wrapped.forEach((line, i) => {
      drawText(ctx, line, 36, 178 + i * 14, { color: '#283442', scale: 1 });
    });

    drawText(ctx, 'PRESS Z / X / ESC TO RETURN TO LIST', W / 2, 236, {
      color: '#708294',
      scale: 1,
      align: 'center',
    });
  }
}
