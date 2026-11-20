/**
 * Gen 3 6-Slot Party Screen (480x270).
 * Reusable across:
 * - Overworld Start Menu ('overworld'): Summary, Swap Order, Cancel
 * - Overworld Bag Item Usage ('useItem'): Heal HP with Potion or cure PSN with Antidote
 * - Battle Switching ('battleSwitch'): Switch active Pokémon (optional or forced on faint)
 */

import { audio } from '../audio.js';
import { getItem } from '../data/items.js';
import { getMove } from '../data/moves.js';
import {
  drawMiniIcon,
  getPokemonDisplayName,
  getSpecies,
} from '../data/pokemon.js';
import { drawStarterSprite } from '../data/starters.js';
import { getTypeColor } from '../data/typeChart.js';
import { gameState, removeItem, saveGame } from '../state.js';
import { drawGbaBox, drawText, measureText } from './font.js';
import { Menu } from './Menu.js';
import { TextBox } from './TextBox.js';

const W = 480;
const H = 270;

function drawSmallHpBar(ctx, x, y, w, ratio) {
  const c = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = '#242E3C';
  ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = '#445060';
  ctx.fillRect(x + 1, y + 1, w - 2, 5);
  const fillW = c > 0 ? Math.max(2, Math.round((w - 2) * c)) : 0;
  if (fillW > 0) {
    ctx.fillStyle = c > 0.5 ? '#42C85E' : c > 0.2 ? '#F0BC34' : '#E8443C';
    ctx.fillRect(x + 1, y + 1, fillW, 5);
  }
}

export class PartyScene {
  constructor(manager) {
    this.manager = manager;
    this.mode = 'overworld'; // 'overworld' | 'useItem' | 'battleSwitch'
    this.itemId = null;
    this.activeIndex = 0;
    this.forced = false;
    this.onSelect = null;

    this.cursor = 0;
    this.swapFrom = -1;
    this.actionMenu = null;
    this.showingSummary = false;
    this.textBox = new TextBox();
  }

  onEnter({
    mode = 'overworld',
    itemId = null,
    activeIndex = 0,
    forced = false,
    onSelect = null,
  } = {}) {
    this.mode = mode;
    this.itemId = itemId;
    this.activeIndex = activeIndex;
    this.forced = forced;
    this.onSelect = onSelect;
    this.cursor = 0;
    this.swapFrom = -1;
    this.actionMenu = null;
    this.showingSummary = false;
    this.textBox.close();
  }

  _close(result = null) {
    const cb = this.onSelect;
    this.manager.popScene();
    if (cb) cb(result);
  }

  _useItemOnSlot(idx) {
    const party = gameState.party || [];
    const mon = party[idx];
    const item = getItem(this.itemId);
    if (!mon || !item) return;

    if (item.healHp) {
      if (mon.currentHp <= 0 || mon.currentHp >= mon.maxHp) {
        audio.bump();
        this.textBox.show("It won't have any effect.");
        return;
      }
      const healed = Math.min(mon.maxHp - mon.currentHp, item.healHp);
      mon.currentHp += healed;
      removeItem(item.id, 1);
      saveGame();
      audio.heal();
      this.textBox.show(
        `${getPokemonDisplayName(mon)} recovered ${healed} HP!`,
        {
          onComplete: () => this._close({ used: true, idx }),
        }
      );
      return;
    }

    if (item.cureStatus) {
      if (mon.status !== item.cureStatus) {
        audio.bump();
        this.textBox.show("It won't have any effect.");
        return;
      }
      mon.status = null;
      removeItem(item.id, 1);
      saveGame();
      audio.heal();
      this.textBox.show(
        `${getPokemonDisplayName(mon)} was cured of poison!`,
        {
          onComplete: () => this._close({ used: true, idx }),
        }
      );
    }
  }

  update(input) {
    if (this.textBox.active) {
      this.textBox.update(input);
      return;
    }

    if (this.showingSummary) {
      if (
        input.wasJustPressed('cancel') ||
        input.wasJustPressed('pause') ||
        input.wasJustPressed('confirm')
      ) {
        audio.cancel();
        this.showingSummary = false;
      }
      return;
    }

    if (this.actionMenu) {
      this.actionMenu.update(input);
      return;
    }

    const party = gameState.party || [];
    const count = party.length;

    if (!this.forced && (input.wasJustPressed('cancel') || input.wasJustPressed('pause'))) {
      audio.cancel();
      if (this.swapFrom >= 0) {
        this.swapFrom = -1;
      } else {
        this._close(null);
      }
      return;
    }

    if (count === 0) return;

    if (input.wasJustPressed('up')) {
      this.cursor = (this.cursor - 1 + count) % count;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.cursor = (this.cursor + 1) % count;
      audio.blip();
    } else if (input.wasJustPressed('left')) {
      if (this.cursor > 0) {
        this.cursor = 0;
        audio.blip();
      }
    } else if (input.wasJustPressed('right')) {
      if (this.cursor === 0 && count > 1) {
        this.cursor = 1;
        audio.blip();
      }
    } else if (input.wasJustPressed('confirm')) {
      if (this.mode === 'useItem') {
        this._useItemOnSlot(this.cursor);
        return;
      }

      if (this.mode === 'battleSwitch') {
        const chosen = party[this.cursor];
        if (!chosen) return;
        if (this.cursor === this.activeIndex) {
          audio.bump();
          this.textBox.show(`${getPokemonDisplayName(chosen)} is already in battle!`);
          return;
        }
        if (chosen.currentHp <= 0) {
          audio.bump();
          this.textBox.show(`${getPokemonDisplayName(chosen)} has no energy left to battle!`);
          return;
        }
        audio.confirm();
        this._close(this.cursor);
        return;
      }

      // Overworld mode: complete swap if swap mode active, else open action menu
      if (this.swapFrom >= 0) {
        if (this.swapFrom !== this.cursor) {
          const tmp = party[this.swapFrom];
          party[this.swapFrom] = party[this.cursor];
          party[this.cursor] = tmp;
          saveGame();
          audio.confirm();
        } else {
          audio.cancel();
        }
        this.swapFrom = -1;
        return;
      }

      audio.blip();
      this.actionMenu = new Menu({
        options: [
          { label: 'SUMMARY', value: 'summary' },
          { label: 'SWITCH', value: 'switch' },
          { label: 'CANCEL', value: 'cancel' },
        ],
        x: 340,
        y: 136,
        width: 120,
        scale: 1,
        cancelable: true,
        onSelect: (opt) => {
          this.actionMenu = null;
          if (opt.value === 'summary') {
            this.showingSummary = true;
          } else if (opt.value === 'switch') {
            if (party.length < 2) {
              audio.bump();
              this.textBox.show('You need at least 2 POKéMON to switch order.');
            } else {
              this.swapFrom = this.cursor;
            }
          }
        },
        onCancel: () => {
          this.actionMenu = null;
        },
      });
    }
  }

  render(ctx) {
    // Classic Gen 3 emerald-teal party backdrop
    ctx.fillStyle = '#2C5C68';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#38707E';
    for (let y = 0; y < H; y += 16) {
      ctx.fillRect(0, y, W, 8);
    }

    if (this.showingSummary) {
      this._renderSummary(ctx, gameState.party[this.cursor]);
      return;
    }

    const party = gameState.party || [];

    // Header
    drawText(
      ctx,
      this.mode === 'useItem'
        ? `USE ${getItem(this.itemId)?.name || 'ITEM'} ON WHICH POKéMON?`
        : this.swapFrom >= 0
          ? 'MOVE TO WHICH POSITION?'
          : this.mode === 'battleSwitch'
            ? 'CHOOSE A POKéMON TO SEND OUT'
            : 'POKéMON PARTY',
      16,
      10,
      { color: '#FFFDF4', shadow: '#163038', scale: 1 }
    );

    if (party.length === 0) {
      drawGbaBox(ctx, 80, 96, 320, 64);
      drawText(ctx, 'No POKéMON in your party yet!', W / 2, 122, {
        color: '#384658',
        scale: 1,
        align: 'center',
      });
    } else {
      // Slot 0 (Lead Pokémon) on the left
      this._renderLeadCard(ctx, party[0], 0);

      // Slots 1..5 stacked cleanly on the right
      for (let i = 1; i < 6; i++) {
        this._renderListSlot(ctx, party[i] || null, i);
      }
    }

    // Bottom hint bar
    drawGbaBox(ctx, 14, 224, 452, 34, {
      fill: '#F8F8F8',
      outerBorder: '#283644',
      accentBorder: '#6898B8',
      accentHighlight: '#A4CBE4',
      innerBorder: '#3C4E60',
      shadow: false,
    });
    const hint = this.forced
      ? 'ARROWS:SELECT   Z/ENTER:SEND OUT'
      : 'ARROWS:SELECT   Z/ENTER:CHOOSE   X/ESC:BACK';
    drawText(ctx, hint, W / 2, 237, {
      color: '#344252',
      scale: 1,
      align: 'center',
    });

    if (this.actionMenu) this.actionMenu.render(ctx);
    if (this.textBox.active) this.textBox.render(ctx);
  }

  _renderLeadCard(ctx, mon, idx) {
    const x = 14;
    const y = 28;
    const w = 178;
    const h = 152;
    const selected = this.cursor === idx;
    const isSwap = this.swapFrom === idx;

    drawGbaBox(ctx, x, y, w, h, {
      fill: selected ? '#FFFDF0' : '#EAF4F8',
      outerBorder: '#1E2C38',
      accentBorder: isSwap ? '#E8A030' : selected ? '#E05848' : '#588CA8',
      accentHighlight: isSwap ? '#FFE084' : selected ? '#FFA090' : '#94C4DE',
      innerBorder: '#2E4050',
      shadow: false,
    });

    if (!mon) return;

    drawMiniIcon(ctx, mon.speciesId, x + 12, y + 14, 44);
    const dispName = getPokemonDisplayName(mon);
    drawText(ctx, dispName, x + 62, y + 20, { color: '#1E2634', scale: 1 });
    drawText(ctx, mon.gender || '♂', x + w - 14, y + 20, {
      color: mon.gender === '♀' ? '#E45C88' : '#3E84DC',
      scale: 1,
      align: 'right',
    });
    drawText(ctx, `Lv${mon.level}`, x + 62, y + 36, { color: '#384A5E', scale: 1 });

    if (mon.status === 'PSN') {
      ctx.fillStyle = '#984EA8';
      ctx.fillRect(x + 114, y + 34, 28, 11);
      drawText(ctx, 'PSN', x + 128, y + 36, { color: '#FFFFFF', scale: 1, align: 'center' });
    }

    drawText(ctx, 'HP', x + 14, y + 74, { color: '#D87A28', scale: 1 });
    drawSmallHpBar(ctx, x + 32, y + 74, 130, mon.currentHp / Math.max(1, mon.maxHp));
    drawText(ctx, `${mon.currentHp}/${mon.maxHp}`, x + w - 16, y + 88, {
      color: mon.currentHp === 0 ? '#D83834' : '#24303E',
      scale: 1,
      align: 'right',
    });

    if (mon.isShiny) {
      drawText(ctx, '*SHINY*', x + 14, y + 108, { color: '#D89A18', scale: 1 });
    }
    drawText(ctx, 'LEAD POKéMON', x + 14, y + 128, { color: '#60788C', scale: 1 });
  }

  _renderListSlot(ctx, mon, idx) {
    const x = 200;
    const y = 26 + (idx - 1) * 38;
    const w = 266;
    const h = 35;
    const selected = this.cursor === idx;
    const isSwap = this.swapFrom === idx;

    if (!mon) {
      ctx.fillStyle = 'rgba(20, 44, 52, 0.5)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(130, 180, 196, 0.35)';
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      drawText(ctx, '--- EMPTY ---', x + w / 2, y + 14, {
        color: '#6E9CA8',
        scale: 1,
        align: 'center',
      });
      return;
    }

    drawGbaBox(ctx, x, y, w, h, {
      fill: selected ? '#FFFDF0' : '#EAF4F8',
      outerBorder: '#1E2C38',
      accentBorder: isSwap ? '#E8A030' : selected ? '#E05848' : '#588CA8',
      accentHighlight: isSwap ? '#FFE084' : selected ? '#FFA090' : '#94C4DE',
      innerBorder: '#2E4050',
      shadow: false,
    });

    drawMiniIcon(ctx, mon.speciesId, x + 8, y + 4, 26);
    drawText(ctx, getPokemonDisplayName(mon), x + 38, y + 8, { color: '#1E2634', scale: 1 });
    drawText(ctx, `Lv${mon.level}`, x + 38, y + 20, { color: '#46586C', scale: 1 });

    if (mon.status === 'PSN') {
      ctx.fillStyle = '#984EA8';
      ctx.fillRect(x + 84, y + 19, 26, 10);
      drawText(ctx, 'PSN', x + 97, y + 20, { color: '#FFFFFF', scale: 1, align: 'center' });
    }

    drawSmallHpBar(ctx, x + 150, y + 10, 102, mon.currentHp / Math.max(1, mon.maxHp));
    drawText(ctx, `${mon.currentHp}/${mon.maxHp}`, x + w - 14, y + 21, {
      color: mon.currentHp === 0 ? '#D83834' : '#24303E',
      scale: 1,
      align: 'right',
    });
  }

  _renderSummary(ctx, mon) {
    if (!mon) return;
    const sp = getSpecies(mon.speciesId);

    drawGbaBox(ctx, 18, 16, 444, 238, {
      fill: '#FAFBFD',
      outerBorder: '#1C2836',
      accentBorder: sp.typeColor || '#4C86A8',
      accentHighlight: sp.typeLight || '#88C4E4',
      innerBorder: '#2E3E50',
    });

    // Portrait card on left
    ctx.fillStyle = sp.typeColor || '#4C86A8';
    ctx.fillRect(34, 34, 96, 96);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(36, 36, 92, 92);
    drawStarterSprite(ctx, sp, 40, 40, 84);

    // Name, Dex #, Level, Types, Nature, OT/ID
    const lx = 144;
    drawText(ctx, `#${String(mon.speciesId).padStart(3, '0')} ${getPokemonDisplayName(mon)} ${mon.gender || '♂'}`, lx, 34, {
      color: '#1E2634',
      scale: 2,
    });
    drawText(ctx, `Lv${mon.level}`, 444, 34, { color: '#2C4058', scale: 2, align: 'right' });

    let tx = lx;
    for (const t of mon.types || []) {
      const tc = getTypeColor(t);
      const bw = measureText(t, 1) + 12;
      ctx.fillStyle = tc.bg;
      ctx.fillRect(tx, 56, bw, 13);
      drawText(ctx, t, tx + bw / 2, 59, { color: '#FFFFFF', scale: 1, align: 'center' });
      tx += bw + 6;
    }

    drawText(ctx, `NATURE: ${mon.nature || 'HARDY'}`, lx, 78, { color: '#46586C', scale: 1 });
    drawText(ctx, `OT: ${mon.otName || gameState.playerName}   IDNo.${mon.otId || gameState.trainerId}`, lx, 92, {
      color: '#46586C',
      scale: 1,
    });
    const toNext = Math.max(0, (mon.expNext || 0) - (mon.exp || 0));
    drawText(ctx, `EXP: ${mon.exp || 0}   NEXT LV: ${toNext}`, lx, 106, {
      color: '#3A74B4',
      scale: 1,
    });

    // Divider
    ctx.fillStyle = '#D4DCE6';
    ctx.fillRect(34, 138, 412, 1);

    // Left bottom: Stats
    drawText(ctx, 'STATS', 36, 146, { color: '#586C80', scale: 1 });
    drawText(ctx, `HP      ${mon.currentHp}/${mon.maxHp}`, 36, 160, { color: '#1E2634', scale: 1 });
    drawText(ctx, `ATTACK  ${mon.stats.atk}`, 36, 173, { color: '#1E2634', scale: 1 });
    drawText(ctx, `DEFENSE ${mon.stats.def}`, 36, 186, { color: '#1E2634', scale: 1 });
    drawText(ctx, `SP.ATK  ${mon.stats.spa}`, 36, 199, { color: '#1E2634', scale: 1 });
    drawText(ctx, `SP.DEF  ${mon.stats.spd}`, 36, 212, { color: '#1E2634', scale: 1 });
    drawText(ctx, `SPEED   ${mon.stats.spe}`, 36, 225, { color: '#1E2634', scale: 1 });

    // Right bottom: Moves
    drawText(ctx, 'KNOWN MOVES', 208, 146, { color: '#586C80', scale: 1 });
    (mon.moves || []).forEach((slot, i) => {
      const def = getMove(slot.id);
      const tc = getTypeColor(def.type);
      const ry = 162 + i * 17;
      ctx.fillStyle = tc.bg;
      ctx.fillRect(208, ry - 1, 52, 12);
      drawText(ctx, def.type.slice(0, 7), 234, ry + 1, {
        color: '#FFFFFF',
        scale: 1,
        align: 'center',
      });
      drawText(ctx, def.name, 266, ry + 1, { color: '#1E2634', scale: 1 });
      drawText(ctx, `${slot.pp}/${slot.maxPp}`, 444, ry + 1, {
        color: '#46586C',
        scale: 1,
        align: 'right',
      });
    });

    drawText(ctx, 'Z / X / ESC: BACK', 444, 236, {
      color: '#687C90',
      scale: 1,
      align: 'right',
    });
  }
}
