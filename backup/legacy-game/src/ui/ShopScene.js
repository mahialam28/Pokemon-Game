/**
 * Gen 3 Poké Mart Shop Scene (480x270): BUY / SELL / QUIT.
 * Stock: POKé BALL ₽200, POTION ₽300, ANTIDOTE ₽100.
 * Quantity selector, live total price, money display, insufficient-funds check,
 * purchase coin sound, and SELL at half price.
 */

import { audio } from '../audio.js';
import { getItem, ITEMS, MART_STOCK } from '../data/items.js';
import { addItem, gameState, getItemCount, removeItem, saveGame } from '../state.js';
import { drawGbaBox, drawText } from './font.js';
import { Menu } from './Menu.js';
import { TextBox } from './TextBox.js';

const W = 480;
const H = 270;

export class ShopScene {
  constructor(manager) {
    this.manager = manager;
    this.isOverlay = true;
    this.mode = 'root'; // 'root' | 'buy' | 'buyQty' | 'sell' | 'sellQty'
    this.rootMenu = null;
    this.cursor = 0;
    this.qty = 1;
    this.textBox = new TextBox();
  }

  onEnter() {
    this.mode = 'root';
    this.cursor = 0;
    this.qty = 1;
    this._openRootMenu();
  }

  _openRootMenu() {
    this.mode = 'root';
    this.textBox.show('CLERK: Welcome to the POKé MART! How may I serve you?', {
      waitForConfirm: false,
    });
    this.rootMenu = new Menu({
      options: [
        { label: 'BUY', value: 'buy' },
        { label: 'SELL', value: 'sell' },
        { label: 'QUIT', value: 'quit' },
      ],
      x: 20,
      y: 22,
      width: 112,
      scale: 2,
      cancelable: true,
      onSelect: (opt) => {
        this.rootMenu = null;
        this.textBox.close();
        if (opt.value === 'buy') {
          this.mode = 'buy';
          this.cursor = 0;
        } else if (opt.value === 'sell') {
          this.mode = 'sell';
          this.cursor = 0;
        } else {
          this._exitShop();
        }
      },
      onCancel: () => {
        this.rootMenu = null;
        this.textBox.close();
        this._exitShop();
      },
    });
  }

  _exitShop() {
    this.mode = 'exiting';
    this.textBox.show('CLERK: Please come again!', {
      waitForConfirm: true,
      onComplete: () => {
        this.manager.popScene();
      },
    });
  }

  _getSellableItems() {
    return Object.values(ITEMS)
      .filter((it) => getItemCount(it.id) > 0)
      .map((it) => ({ ...it, qty: getItemCount(it.id) }));
  }

  update(input) {
    if (this.mode === 'root') {
      this.textBox.update({ isHeld: () => false, wasJustPressed: () => false });
      if (this.rootMenu) this.rootMenu.update(input);
      return;
    }

    if (this.textBox.active) {
      this.textBox.update(input);
      return;
    }

    if (this.mode === 'buy') {
      if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
        audio.cancel();
        this._openRootMenu();
        return;
      }
      if (input.wasJustPressed('up')) {
        this.cursor = (this.cursor - 1 + MART_STOCK.length) % MART_STOCK.length;
        audio.blip();
      } else if (input.wasJustPressed('down')) {
        this.cursor = (this.cursor + 1) % MART_STOCK.length;
        audio.blip();
      } else if (input.wasJustPressed('confirm')) {
        const item = getItem(MART_STOCK[this.cursor]);
        if ((gameState.money || 0) < item.price) {
          audio.bump();
          this.textBox.show("CLERK: You don't have enough money!");
          return;
        }
        audio.blip();
        this.qty = 1;
        this.mode = 'buyQty';
      }
      return;
    }

    if (this.mode === 'buyQty') {
      const item = getItem(MART_STOCK[this.cursor]);
      const maxAffordable = Math.max(1, Math.min(99, Math.floor((gameState.money || 0) / item.price)));

      if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
        audio.cancel();
        this.mode = 'buy';
        return;
      }
      if (input.wasJustPressed('up')) {
        this.qty = this.qty >= maxAffordable ? 1 : this.qty + 1;
        audio.blip();
      } else if (input.wasJustPressed('down')) {
        this.qty = this.qty <= 1 ? maxAffordable : this.qty - 1;
        audio.blip();
      } else if (input.wasJustPressed('right')) {
        this.qty = Math.min(maxAffordable, this.qty + 5);
        audio.blip();
      } else if (input.wasJustPressed('left')) {
        this.qty = Math.max(1, this.qty - 5);
        audio.blip();
      } else if (input.wasJustPressed('confirm')) {
        const total = item.price * this.qty;
        if ((gameState.money || 0) < total) {
          audio.bump();
          this.mode = 'buy';
          this.textBox.show("CLERK: You don't have enough money!");
          return;
        }
        gameState.money -= total;
        addItem(item.id, this.qty);
        saveGame();
        audio.coin();
        this.mode = 'buy';
        this.textBox.show(`Here you are! Thank you! (Bought ${this.qty} ${item.name}!)`);
      }
      return;
    }

    if (this.mode === 'sell') {
      const list = this._getSellableItems();
      if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
        audio.cancel();
        this._openRootMenu();
        return;
      }
      if (list.length === 0) return;
      if (this.cursor >= list.length) this.cursor = list.length - 1;

      if (input.wasJustPressed('up')) {
        this.cursor = (this.cursor - 1 + list.length) % list.length;
        audio.blip();
      } else if (input.wasJustPressed('down')) {
        this.cursor = (this.cursor + 1) % list.length;
        audio.blip();
      } else if (input.wasJustPressed('confirm')) {
        audio.blip();
        this.qty = 1;
        this.mode = 'sellQty';
      }
      return;
    }

    if (this.mode === 'sellQty') {
      const list = this._getSellableItems();
      const item = list[this.cursor];
      if (!item) {
        this.mode = 'sell';
        return;
      }
      const maxQty = item.qty;

      if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
        audio.cancel();
        this.mode = 'sell';
        return;
      }
      if (input.wasJustPressed('up')) {
        this.qty = this.qty >= maxQty ? 1 : this.qty + 1;
        audio.blip();
      } else if (input.wasJustPressed('down')) {
        this.qty = this.qty <= 1 ? maxQty : this.qty - 1;
        audio.blip();
      } else if (input.wasJustPressed('confirm')) {
        const earned = item.sellPrice * this.qty;
        removeItem(item.id, this.qty);
        gameState.money = (gameState.money || 0) + earned;
        saveGame();
        audio.coin();
        this.mode = 'sell';
        this.textBox.show(`Sold ${this.qty} ${item.name} for ₽${earned}!`);
      }
    }
  }

  render(ctx) {
    // Money box always visible top-right
    drawGbaBox(ctx, 324, 16, 138, 42, {
      fill: '#FAFBFD',
      outerBorder: '#1E2836',
      accentBorder: '#3C78C4',
      accentHighlight: '#80B4F4',
      innerBorder: '#2C3C4E',
    });
    drawText(ctx, 'MONEY', 338, 24, { color: '#586C80', scale: 1 });
    drawText(ctx, `₽${gameState.money || 0}`, 448, 36, {
      color: '#1E2634',
      scale: 2,
      align: 'right',
    });

    if (this.mode === 'root') {
      if (this.rootMenu) this.rootMenu.render(ctx);
      if (this.textBox.active) this.textBox.render(ctx);
      return;
    }

    if (this.mode === 'exiting') {
      if (this.textBox.active) this.textBox.render(ctx);
      return;
    }

    // Buy or Sell catalog window
    const isBuy = this.mode === 'buy' || this.mode === 'buyQty';
    const items = isBuy ? MART_STOCK.map((id) => getItem(id)) : this._getSellableItems();

    drawGbaBox(ctx, 20, 16, 294, 168, {
      fill: '#FAFBFD',
      outerBorder: '#1E2836',
      accentBorder: isBuy ? '#3C78C4' : '#3E9A54',
      accentHighlight: isBuy ? '#80B4F4' : '#7CE092',
      innerBorder: '#2C3C4E',
    });

    drawText(ctx, isBuy ? 'POKé MART CATALOG' : 'SELL FROM BAG', 34, 28, {
      color: isBuy ? '#2C5C9A' : '#2C7C46',
      scale: 1,
    });

    if (items.length === 0) {
      drawText(ctx, 'No items to sell!', 167, 94, {
        color: '#6C7E92',
        scale: 1,
        align: 'center',
      });
    } else {
      items.forEach((it, i) => {
        const ry = 50 + i * 32;
        const sel = i === this.cursor;
        if (sel) {
          ctx.fillStyle = '#E4F0FC';
          ctx.fillRect(30, ry - 4, 274, 24);
          drawText(ctx, '▶', 34, ry + 2, { color: '#D84840', scale: 1 });
        }
        drawText(ctx, it.name, 48, ry + 2, { color: '#1E2634', scale: 1 });
        const price = isBuy ? it.price : it.sellPrice;
        const suffix = isBuy ? `₽${price}` : `x${it.qty}  ₽${price}`;
        drawText(ctx, suffix, 296, ry + 2, {
          color: '#2A3C50',
          scale: 1,
          align: 'right',
        });
      });
    }

    // Quantity selector box when confirming Buy / Sell
    if ((this.mode === 'buyQty' || this.mode === 'sellQty') && items[this.cursor]) {
      const it = items[this.cursor];
      const unit = isBuy ? it.price : it.sellPrice;
      drawGbaBox(ctx, 324, 68, 138, 92, {
        fill: '#FFFDF0',
        outerBorder: '#1E2836',
        accentBorder: '#E07840',
        accentHighlight: '#FFB480',
        innerBorder: '#2C3C4E',
      });
      drawText(ctx, isBuy ? 'HOW MANY?' : 'SELL HOW MANY?', 393, 80, {
        color: '#5C4430',
        scale: 1,
        align: 'center',
      });
      drawText(ctx, `x${String(this.qty).padStart(2, '0')}`, 393, 98, {
        color: '#1E2634',
        scale: 2,
        align: 'center',
      });
      drawText(ctx, `TOTAL: ₽${unit * this.qty}`, 393, 124, {
        color: '#2A7C46',
        scale: 1,
        align: 'center',
      });
      drawText(ctx, 'Z:OK   X:BACK', 393, 142, {
        color: '#6C7E92',
        scale: 1,
        align: 'center',
      });
    }

    // Bottom info / dialogue box
    if (this.textBox.active) {
      this.textBox.render(ctx);
    } else {
      drawGbaBox(ctx, 20, 194, 440, 62, {
        fill: '#FAFBFD',
        outerBorder: '#1E2836',
        accentBorder: '#4C86A8',
        accentHighlight: '#80BCE0',
        innerBorder: '#2C3C4E',
      });
      const sel = items[this.cursor];
      if (sel) {
        drawText(ctx, sel.description, 34, 210, { color: '#263240', scale: 1 });
        drawText(ctx, `IN BAG: ${getItemCount(sel.id)}    Z:SELECT   X/ESC:BACK`, 34, 232, {
          color: '#607488',
          scale: 1,
        });
      } else {
        drawText(ctx, 'X/ESC: BACK', 34, 218, { color: '#607488', scale: 1 });
      }
    }
  }
}
