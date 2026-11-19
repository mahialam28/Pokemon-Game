/**
 * Gen 3 Bag Screen (480x270) with ITEMS & POKé BALLS pockets.
 * Reusable in both Overworld Start Menu and BattleScene.
 */

import { audio } from '../audio.js';
import { getItem, ITEMS } from '../data/items.js';
import { gameState, getItemCount } from '../state.js';
import { drawGbaBox, drawText } from './font.js';
import { TextBox } from './TextBox.js';

const W = 480;
const H = 270;

const TABS = [
  { id: 'items', label: 'ITEMS' },
  { id: 'pokeballs', label: 'POKé BALLS' },
];

export class BagScene {
  constructor(manager) {
    this.manager = manager;
    this.mode = 'overworld'; // 'overworld' | 'battle'
    this.isTrainerBattle = false;
    this.onUseItem = null;

    this.tabIndex = 0;
    this.cursor = 0;
    this.textBox = new TextBox();
  }

  onEnter({ mode = 'overworld', isTrainerBattle = false, onUseItem = null } = {}) {
    this.mode = mode;
    this.isTrainerBattle = isTrainerBattle;
    this.onUseItem = onUseItem;
    this.tabIndex = 0;
    this.cursor = 0;
    this.textBox.close();
  }

  _getTabItems() {
    const cat = TABS[this.tabIndex].id;
    return Object.values(ITEMS)
      .filter((it) => it.category === cat && getItemCount(it.id) > 0)
      .map((it) => ({ ...it, qty: getItemCount(it.id) }));
  }

  _close(result = null) {
    const cb = this.onUseItem;
    this.manager.popScene();
    if (cb && result) cb(result);
  }

  update(input) {
    if (this.textBox.active) {
      this.textBox.update(input);
      return;
    }

    if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
      audio.cancel();
      this.manager.popScene();
      return;
    }

    if (input.wasJustPressed('left') || input.wasJustPressed('right')) {
      this.tabIndex = 1 - this.tabIndex;
      this.cursor = 0;
      audio.blip();
      return;
    }

    const list = this._getTabItems();
    if (list.length === 0) return;
    if (this.cursor >= list.length) this.cursor = list.length - 1;

    if (input.wasJustPressed('up')) {
      this.cursor = (this.cursor - 1 + list.length) % list.length;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.cursor = (this.cursor + 1) % list.length;
      audio.blip();
    } else if (input.wasJustPressed('confirm')) {
      const chosen = list[this.cursor];
      if (!chosen) return;

      if (this.mode === 'battle') {
        if (chosen.category === 'pokeballs' && this.isTrainerBattle) {
          audio.bump();
          this.textBox.show("Don't be a thief! You can't catch another trainer's POKéMON!");
          return;
        }
        audio.confirm();
        this._close({ itemId: chosen.id });
        return;
      }

      // Overworld bag usage
      if (chosen.category === 'pokeballs') {
        audio.bump();
        this.textBox.show('Throw POKé BALLS during wild POKéMON battles!');
        return;
      }

      if (!gameState.party || gameState.party.length === 0) {
        audio.bump();
        this.textBox.show('You have no POKéMON to use this on.');
        return;
      }

      audio.confirm();
      this.manager.pushScene('party', {
        mode: 'useItem',
        itemId: chosen.id,
      });
    }
  }

  render(ctx) {
    // Warm amber-teal Gen 3 Bag backdrop
    ctx.fillStyle = '#3A5878';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#46688C';
    for (let y = 0; y < H; y += 16) {
      ctx.fillRect(0, y, W, 8);
    }

    // Pocket tabs along top
    for (let i = 0; i < TABS.length; i++) {
      const active = i === this.tabIndex;
      const tx = 20 + i * 130;
      const ty = 14;
      drawGbaBox(ctx, tx, ty, 122, 28, {
        fill: active ? '#FFFDF0' : '#C8D8E6',
        outerBorder: '#1E2836',
        accentBorder: active ? '#E06848' : '#587898',
        accentHighlight: active ? '#FFA888' : '#8CA8C4',
        innerBorder: '#2C3C4E',
        shadow: false,
      });
      drawText(ctx, TABS[i].label, tx + 61, ty + 10, {
        color: active ? '#1E2634' : '#4A5E72',
        scale: 1,
        align: 'center',
      });
    }

    drawText(ctx, 'LEFT/RIGHT: POCKET', 460, 24, {
      color: '#D8E8F8',
      scale: 1,
      align: 'right',
    });

    // Item list panel
    drawGbaBox(ctx, 20, 48, 440, 146, {
      fill: '#FAFBFD',
      outerBorder: '#1E2836',
      accentBorder: '#588CA8',
      accentHighlight: '#94C4DE',
      innerBorder: '#2C3C4E',
      shadow: false,
    });

    const list = this._getTabItems();
    if (list.length === 0) {
      drawText(ctx, 'This pocket is empty!', W / 2, 114, {
        color: '#6C7E92',
        scale: 2,
        align: 'center',
      });
    } else {
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        const ry = 66 + i * 28;
        const sel = i === this.cursor;
        if (sel) {
          ctx.fillStyle = '#E4F2FC';
          ctx.fillRect(32, ry - 4, 416, 22);
          drawText(ctx, '▶', 38, ry, { color: '#E04840', scale: 2 });
        }
        drawText(ctx, it.name, 58, ry, {
          color: sel ? '#182230' : '#404C5E',
          scale: 2,
        });
        drawText(ctx, `x${it.qty}`, 436, ry, {
          color: '#2A3C50',
          scale: 2,
          align: 'right',
        });
      }
    }

    // Bottom description bar
    drawGbaBox(ctx, 20, 202, 440, 54, {
      fill: '#FAFBFD',
      outerBorder: '#1E2836',
      accentBorder: '#4C86A8',
      accentHighlight: '#80BCE0',
      innerBorder: '#2C3C4E',
      shadow: false,
    });

    const selected = list[this.cursor];
    if (selected) {
      drawText(ctx, selected.description, 34, 218, {
        color: '#2A3442',
        scale: 1,
      });
      drawText(ctx, 'Z/ENTER: USE    X/ESC: BACK', 34, 236, {
        color: '#6C7E92',
        scale: 1,
      });
    } else {
      drawText(ctx, 'Buy more supplies at the POKé MART in VERDANT CITY!', 34, 218, {
        color: '#506072',
        scale: 1,
      });
      drawText(ctx, 'X/ESC: BACK', 34, 236, { color: '#6C7E92', scale: 1 });
    }

    if (this.textBox.active) this.textBox.render(ctx);
  }
}
