/**
 * Reusable HD-2D Yes/No and vertical list menu (480x270 native UI resolution).
 * Features smooth open pop-in, soft active-row highlight pill, and crisp cursor.
 */

import { audio } from '../audio.js';
import { CHAR_WIDTH, drawGbaBox, drawText } from './font.js';

export class Menu {
  constructor({
    options = [],
    x = 344,
    y = 114,
    width = null,
    scale = 2,
    initialIndex = 0,
    onSelect = null,
    onCancel = null,
    cancelable = true,
  } = {}) {
    this.options = options.map((opt) =>
      typeof opt === 'string' ? { label: opt, value: opt } : opt
    );
    this.index = Math.max(0, Math.min(initialIndex, Math.max(0, this.options.length - 1)));
    this.scale = scale;
    this.onSelect = onSelect;
    this.onCancel = onCancel;
    this.cancelable = cancelable;
    this.active = true;
    this.openAnim = 0;

    const maxLen = this.options.reduce((m, o) => Math.max(m, o.label.length), 3);
    this.width = width || Math.max(96, maxLen * CHAR_WIDTH * scale + 38);
    this.rowHeight = scale === 2 ? 24 : 15;
    this.height = this.options.length * this.rowHeight + 18;
    this.x = x;
    this.y = y;
  }

  /** Standard HD-2D YES / NO popup positioned neatly beside or above dialogue. */
  static createYesNo({ onYes, onNo, x = 352, y = 118 } = {}) {
    return new Menu({
      options: [
        { label: 'YES', value: true },
        { label: 'NO', value: false },
      ],
      x,
      y,
      width: 108,
      scale: 2,
      initialIndex: 0,
      cancelable: true,
      onSelect: (opt) => {
        if (opt.value) {
          if (onYes) onYes();
        } else {
          if (onNo) onNo();
        }
      },
      onCancel: () => {
        if (onNo) onNo();
      },
    });
  }

  update(input) {
    if (!this.active || this.options.length === 0) return;

    if (this.openAnim < 1) {
      this.openAnim = Math.min(1, this.openAnim + 0.25);
    }

    if (input.wasJustPressed('up')) {
      this.index = (this.index - 1 + this.options.length) % this.options.length;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.index = (this.index + 1) % this.options.length;
      audio.blip();
    } else if (input.wasJustPressed('confirm')) {
      audio.confirm();
      const chosen = this.options[this.index];
      const cb = this.onSelect;
      this.active = false;
      if (cb) cb(chosen, this.index);
    } else if (
      this.cancelable &&
      (input.wasJustPressed('cancel') || input.wasJustPressed('pause'))
    ) {
      audio.cancel();
      const cb = this.onCancel;
      this.active = false;
      if (cb) cb();
    }
  }

  render(ctx) {
    if (!this.active) return;

    const ease = 1 - Math.pow(1 - this.openAnim, 3);
    const slideY = Math.round((1 - ease) * 6);
    const y = this.y + slideY;

    ctx.save();
    ctx.globalAlpha = Math.min(1, ease * 1.2);

    drawGbaBox(ctx, this.x, y, this.width, this.height, {
      fill: '#FAFBFD',
      outerBorder: '#1E2634',
      accentBorder: '#4C86A8',
      accentHighlight: '#80BCE0',
      innerBorder: '#2C3C4E',
    });

    for (let i = 0; i < this.options.length; i++) {
      const opt = this.options[i];
      const rowTop = y + 10 + i * this.rowHeight;
      const selected = i === this.index;

      if (selected) {
        ctx.fillStyle = '#E2F0FA';
        ctx.fillRect(this.x + 8, rowTop - 2, this.width - 16, this.rowHeight - 2);
        drawText(ctx, '▶', this.x + 12, rowTop + 2, {
          color: '#E64B3C',
          shadow: '#F2C0B8',
          scale: this.scale,
        });
      }

      drawText(ctx, opt.label, this.x + 28, rowTop + 2, {
        color: selected ? '#182436' : '#404C5C',
        shadow: '#DCE2E8',
        scale: this.scale,
      });
    }

    ctx.restore();
  }
}
