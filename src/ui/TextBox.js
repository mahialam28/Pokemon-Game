/**
 * HD-2D Handheld Dialogue Box (480x270 native UI resolution).
 * Features:
 * - Elevated double-bordered HD-2D frame with smooth open animation
 * - Optional speaker nameplate badge for MOM / PROF / AIDE
 * - Typewriter text effect (hold Z/Enter/Space to speed up)
 * - Blinking ▼ arrow on completed pages
 * - Automatic {PLAYER} and {STARTER} placeholder interpolation
 */

import { audio } from '../audio.js';
import { TEXT_SPEED_RATES } from '../config.js';
import { formatText, gameState } from '../state.js';
import { drawGbaBox, drawText, measureText, wrapText } from './font.js';

const BOX_X = 20;
const BOX_Y = 192;
const BOX_W = 440;
const BOX_H = 68;
const TEXT_SCALE = 2;
const MAX_CHARS_PER_LINE = 32;

const SPEAKER_COLORS = {
  MOM: { bg: '#D8687A', hi: '#F49AA8' },
  PROF: { bg: '#3B8A68', hi: '#74C49E' },
  AIDE: { bg: '#487EB0', hi: '#82B6E6' },
  NEIGHBOUR: { bg: '#6C8E48', hi: '#A2C878' },
  RIVAL: { bg: '#5844A8', hi: '#9482E4' },
};

export class TextBox {
  constructor() {
    this.active = false;
    this.pages = []; // Array of { speaker: string|null, lines: [l1, l2] }
    this.pageIndex = 0;
    this.charCount = 0;
    this.tickAccum = 0;
    this.blinkTimer = 0;
    this.openAnim = 0;
    this.onComplete = null;
    this.waitForConfirm = true;
  }

  /**
   * Open the dialogue box with one or more messages (string or string[]).
   * Long messages automatically paginate into 2-line pages.
   */
  show(messages, { onComplete = null, waitForConfirm = true } = {}) {
    const list = Array.isArray(messages) ? messages : [messages];
    this.pages = [];

    const isClassic = (gameState.settings && gameState.settings.graphicsMode) !== 'enhanced';

    for (const raw of list) {
      const formatted = formatText(raw);
      let speaker = null;
      let body = formatted;

      // In Classic Gen 3 mode, keep speaker prefixes inline (no floating tab)
      if (!isClassic) {
        const rivalUpper = (gameState.rivalName || 'GARY').toUpperCase();
        const match = formatted.match(/^([A-Z0-9_-]{2,12}):\s*(.*)$/);
        if (match) {
          const candidate = match[1].toUpperCase();
          if (SPEAKER_COLORS[candidate] || candidate === rivalUpper) {
            speaker = match[1];
            body = match[2];
          }
        }
      }

      const wrapped = wrapText(body, MAX_CHARS_PER_LINE);
      for (let i = 0; i < wrapped.length; i += 2) {
        this.pages.push({
          speaker,
          lines: [wrapped[i], wrapped[i + 1] || ''],
        });
      }
    }

    if (this.pages.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.active = true;
    this.pageIndex = 0;
    this.charCount = 0;
    this.tickAccum = 0;
    this.blinkTimer = 0;
    this.openAnim = 0;
    this.onComplete = onComplete;
    this.waitForConfirm = waitForConfirm;
  }

  close() {
    this.active = false;
    this.pages = [];
    this.pageIndex = 0;
    this.charCount = 0;
    this.onComplete = null;
  }

  isPageComplete() {
    if (!this.active) return true;
    const [l1, l2] = this.pages[this.pageIndex].lines;
    return this.charCount >= l1.length + l2.length;
  }

  update(input) {
    if (!this.active) return;

    if (this.openAnim < 1) {
      this.openAnim = Math.min(1, this.openAnim + 0.2);
    }

    const [l1, l2] = this.pages[this.pageIndex].lines;
    const totalChars = l1.length + l2.length;

    if (this.charCount < totalChars) {
      const fast = input.isHeld('confirm') || input.isHeld('cancel');
      const speedKey = (gameState.settings && gameState.settings.textSpeed) || 'normal';
      const baseRate = TEXT_SPEED_RATES[speedKey] || TEXT_SPEED_RATES.normal;
      const charsToAdd = fast ? 3.2 : baseRate;
      this.tickAccum += charsToAdd;

      const prevCount = this.charCount;
      while (this.tickAccum >= 1 && this.charCount < totalChars) {
        this.tickAccum -= 1;
        this.charCount += 1;
      }

      if (this.charCount > prevCount && this.charCount % 3 === 0) {
        const combined = l1 + l2;
        const ch = combined[this.charCount - 1];
        if (ch && ch !== ' ') {
          audio.textTick();
        }
      }
      return;
    }

    this.blinkTimer = (this.blinkTimer + 1) % 36;

    if (!this.waitForConfirm) {
      if (this.onComplete) {
        const cb = this.onComplete;
        this.onComplete = null;
        cb();
      }
      return;
    }

    if (input.wasJustPressed('confirm') || input.wasJustPressed('cancel')) {
      audio.blip();
      if (this.pageIndex + 1 < this.pages.length) {
        this.pageIndex += 1;
        this.charCount = 0;
        this.tickAccum = 0;
        this.blinkTimer = 0;
      } else {
        const cb = this.onComplete;
        this.close();
        if (cb) cb();
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    // Smooth pop-in slide offset
    const ease = 1 - Math.pow(1 - this.openAnim, 3);
    const slideY = Math.round((1 - ease) * 10);
    const y = BOX_Y + slideY;

    const page = this.pages[this.pageIndex];

    ctx.save();
    ctx.globalAlpha = Math.min(1, ease * 1.15);

    const isClassic = (gameState.settings && gameState.settings.graphicsMode) !== 'enhanced';

    // Optional floating Speaker Nameplate Pill (hidden in Classic Gen 3 mode)
    if (!isClassic && page.speaker) {
      const spKey = SPEAKER_COLORS[page.speaker.toUpperCase()] ? page.speaker.toUpperCase() : 'RIVAL';
      const sp = SPEAKER_COLORS[spKey] || { bg: '#4C86A8', hi: '#82B8D8' };
      const tagW = measureText(page.speaker, 1) + 22;
      const tagX = BOX_X + 12;
      const tagY = y - 16;

      ctx.fillStyle = '#1E2634';
      ctx.fillRect(tagX + 1, tagY, tagW - 2, 18);
      ctx.fillRect(tagX, tagY + 1, tagW, 17);
      ctx.fillStyle = sp.bg;
      ctx.fillRect(tagX + 2, tagY + 2, tagW - 4, 15);
      ctx.fillStyle = sp.hi;
      ctx.fillRect(tagX + 3, tagY + 2, tagW - 6, 2);

      drawText(ctx, page.speaker, tagX + tagW / 2, tagY + 6, {
        color: '#FFFFFF',
        shadow: '#1E2634',
        scale: 1,
        align: 'center',
      });
    }

    // Main dialogue box (Classic Gen 3 light-blue/grey double border)
    drawGbaBox(ctx, BOX_X, y, BOX_W, BOX_H, {
      fill: '#F8F8F8',
      outerBorder: '#384452',
      accentBorder: isClassic ? '#80A4C4' : '#4C86A8',
      accentHighlight: isClassic ? '#C4DCEE' : '#80BCE0',
      innerBorder: '#445464',
      shadow: !isClassic,
    });

    const [l1, l2] = page.lines;
    const show1 = l1.slice(0, Math.min(this.charCount, l1.length));
    const rem = Math.max(0, this.charCount - l1.length);
    const show2 = l2.slice(0, Math.min(rem, l2.length));

    const textX = BOX_X + 18;
    const line1Y = y + 16;
    const line2Y = y + 38;

    drawText(ctx, show1, textX, line1Y, {
      color: '#2A303C',
      shadow: '#D4DCE4',
      scale: TEXT_SCALE,
    });

    if (show2) {
      drawText(ctx, show2, textX, line2Y, {
        color: '#2A303C',
        shadow: '#D4DCE4',
        scale: TEXT_SCALE,
      });
    }

    // Bouncing coral advance arrow when page is complete
    if (this.waitForConfirm && this.isPageComplete()) {
      const bob = Math.round(Math.sin((this.blinkTimer / 36) * Math.PI * 2) * 2);
      drawText(ctx, '▼', BOX_X + BOX_W - 22, y + BOX_H - 21 + bob, {
        color: '#E64B3C',
        shadow: '#F0C0B8',
        scale: 2,
      });
    }

    ctx.restore();
  }
}
