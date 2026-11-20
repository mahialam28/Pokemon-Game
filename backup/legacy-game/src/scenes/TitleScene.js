/**
 * HD-2D Title Screen, Player Name Entry & Rival Name Entry Scene (480x270).
 * 1. Parallax dawn sunrise vista, volumetric sun glow, misty mountains, swaying meadow & petals.
 * 2. CONTINUE / NEW GAME when a localStorage save exists.
 * 3. On NEW GAME: Player Name Entry (default "RED") -> Professor intro -> Rival Name Entry (default CONFIG.DEFAULT_RIVAL_NAME).
 */

import { audio } from '../audio.js';
import { CONFIG } from '../config.js';
import { drawCharacter } from '../entities/sprites.js';
import { clearSave, hasSave, loadGame, resetState, saveGame } from '../state.js';
import { drawGbaBox, drawText } from '../ui/font.js';
import { Menu } from '../ui/Menu.js';
import { TextBox } from '../ui/TextBox.js';

const W = 480;
const H = 270;
const NAME_MAX_LEN = 7;

const LETTER_GRID = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-'],
  ['0', '1', '2', '3', '4', '5', 'DEL', 'CLR', 'OK'],
];

const STARS = [
  { x: 34, y: 18, phase: 0 },
  { x: 92, y: 32, phase: 14 },
  { x: 158, y: 16, phase: 28 },
  { x: 266, y: 20, phase: 7 },
  { x: 348, y: 28, phase: 22 },
  { x: 416, y: 16, phase: 35 },
  { x: 446, y: 42, phase: 11 },
  { x: 56, y: 52, phase: 19 },
  { x: 214, y: 34, phase: 3 },
  { x: 382, y: 48, phase: 26 },
];

export class TitleScene {
  constructor(manager) {
    this.manager = manager;
    this.mode = 'title'; // 'title' | 'saveMenu' | 'playerName' | 'profIntro' | 'rivalName'
    this.tick = 0;
    this.saveMenu = null;
    this.textBox = new TextBox();

    this.chosenPlayerName = 'RED';
    this.nameChars = ['R', 'E', 'D'];
    this.cursorRow = 3;
    this.cursorCol = 8; // Starts on OK so default name is one press away
    this.submitting = false;

    this.petals = Array.from({ length: 18 }, (_, i) => ({
      x: (i * 31) % W,
      y: (i * 19) % 220,
      vx: 0.35 + (i % 4) * 0.14,
      vy: 0.16 + (i % 3) * 0.08,
      phase: i * 0.9,
      color: i % 3 === 0 ? '#FFE8A0' : i % 3 === 1 ? '#FFB8C6' : '#FFF8DC',
    }));
  }

  onEnter() {
    audio.playTrack(null);
    this.mode = 'title';
    this.saveMenu = null;
    this.textBox.close();
    this.chosenPlayerName = 'RED';
    this.nameChars = ['R', 'E', 'D'];
    this.cursorRow = 3;
    this.cursorCol = 8;
    this.submitting = false;
  }

  _beginPlayerNameEntry() {
    this.mode = 'playerName';
    this.nameChars = ['R', 'E', 'D'];
    this.cursorRow = 3;
    this.cursorCol = 8;
  }

  _beginProfRivalIntro() {
    this.mode = 'profIntro';
    this.textBox.show(
      [
        `PROF: Welcome to Dawnleaf Town, ${this.chosenPlayerName}!`,
        "PROF: This is my grandson. He's been your rival since you were kids!",
        'PROF: Erm, what was his name again?',
      ],
      {
        onComplete: () => {
          const defRival = (CONFIG.DEFAULT_RIVAL_NAME || 'GARY').toUpperCase().slice(0, NAME_MAX_LEN);
          this.mode = 'rivalName';
          this.nameChars = defRival.split('');
          this.cursorRow = 3;
          this.cursorCol = 8;
        },
      }
    );
  }

  update(input) {
    this.tick += 1;

    for (const p of this.petals) {
      p.phase += 0.04;
      p.x += p.vx + Math.sin(p.phase) * 0.18;
      p.y += p.vy;
      if (p.x > W + 8) p.x = -8;
      if (p.y > 240) {
        p.y = -6;
        p.x = Math.random() * W;
      }
    }

    if (this.submitting || this.manager.isTransitioning()) return;

    if (this.mode === 'title') {
      if (input.wasJustPressed('confirm')) {
        audio.confirm();
        if (hasSave()) {
          this.mode = 'saveMenu';
          this.saveMenu = new Menu({
            options: [
              { label: 'CONTINUE', value: 'continue' },
              { label: 'NEW GAME', value: 'new' },
            ],
            x: 162,
            y: 148,
            width: 156,
            scale: 2,
            cancelable: true,
            onSelect: (opt) => {
              if (opt.value === 'continue') {
                this._continueGame();
              } else {
                this.saveMenu = null;
                this._beginPlayerNameEntry();
              }
            },
            onCancel: () => {
              this.mode = 'title';
              this.saveMenu = null;
            },
          });
        } else {
          this._beginPlayerNameEntry();
        }
      }
      return;
    }

    if (this.mode === 'saveMenu') {
      if (input.wasJustPressed('pause')) {
        audio.cancel();
        this.mode = 'title';
        this.saveMenu = null;
        return;
      }
      if (this.saveMenu) this.saveMenu.update(input);
      return;
    }

    if (this.mode === 'profIntro') {
      this.textBox.update(input);
      return;
    }

    if (this.mode === 'playerName' || this.mode === 'rivalName') {
      this._updateNameEntry(input);
    }
  }

  _updateNameEntry(input) {
    const rows = LETTER_GRID.length;
    const cols = LETTER_GRID[0].length;

    if (input.wasJustPressed('up')) {
      this.cursorRow = (this.cursorRow - 1 + rows) % rows;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.cursorRow = (this.cursorRow + 1) % rows;
      audio.blip();
    } else if (input.wasJustPressed('left')) {
      this.cursorCol = (this.cursorCol - 1 + cols) % cols;
      audio.blip();
    } else if (input.wasJustPressed('right')) {
      this.cursorCol = (this.cursorCol + 1) % cols;
      audio.blip();
    } else if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
      if (this.nameChars.length > 0) {
        this.nameChars.pop();
        audio.cancel();
      } else {
        audio.cancel();
        if (this.mode === 'rivalName') {
          this._beginPlayerNameEntry();
        } else {
          this.mode = 'title';
        }
      }
    } else if (input.wasJustPressed('confirm')) {
      const token = LETTER_GRID[this.cursorRow][this.cursorCol];
      if (token === 'DEL') {
        if (this.nameChars.length > 0) {
          this.nameChars.pop();
          audio.cancel();
        } else {
          audio.bump();
        }
      } else if (token === 'CLR') {
        this.nameChars = [];
        audio.cancel();
      } else if (token === 'OK') {
        const raw = this.nameChars.join('').trim();
        if (this.mode === 'playerName') {
          audio.confirm();
          this.chosenPlayerName = raw.length > 0 ? raw : 'RED';
          this._beginProfRivalIntro();
        } else {
          const defRival = (CONFIG.DEFAULT_RIVAL_NAME || 'GARY').toUpperCase();
          const finalRival = raw.length > 0 ? raw : defRival;
          this._startNewGame(this.chosenPlayerName, finalRival);
        }
      } else if (this.nameChars.length < NAME_MAX_LEN) {
        this.nameChars.push(token);
        audio.blip();
      } else {
        audio.bump();
      }
    }
  }

  _startNewGame(playerName, rivalName) {
    this.submitting = true;
    audio.confirm();
    clearSave();
    resetState(playerName, rivalName);
    saveGame();

    this.manager.transitionTo('overworld', {
      mapId: 'bedroom',
      x: 2,
      y: 4,
      facing: 'down',
    });
  }

  _continueGame() {
    this.submitting = true;
    loadGame();
    this.manager.transitionTo('overworld', { restoreFromState: true });
  }

  render(ctx) {
    this._renderDawnVista(ctx);

    if (this.mode === 'profIntro') {
      this._renderProfIntro(ctx);
      return;
    }

    if (this.mode === 'playerName' || this.mode === 'rivalName') {
      this._renderNameEntry(ctx);
      return;
    }

    // --- HD-2D Title Emblem ---
    const floatY = Math.round(Math.sin(this.tick * 0.035) * 2);

    ctx.fillStyle = 'rgba(18, 22, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(W / 2, 64 + floatY, 152, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    drawText(ctx, 'MONSTER', W / 2, 26 + floatY, {
      color: '#FFFDF0',
      shadow: '#222848',
      scale: 3,
      align: 'center',
    });
    drawText(ctx, 'QUEST', W / 2, 54 + floatY, {
      color: '#FFD45E',
      shadow: '#3E2244',
      scale: 3,
      align: 'center',
    });

    const ribW = 190;
    const ribX = (W - ribW) / 2;
    const ribY = 86 + floatY;
    ctx.fillStyle = '#202840';
    ctx.fillRect(ribX - 2, ribY - 2, ribW + 4, 22);
    ctx.fillStyle = '#E06844';
    ctx.fillRect(ribX, ribY, ribW, 18);
    ctx.fillStyle = '#F69668';
    ctx.fillRect(ribX, ribY, ribW, 3);
    drawText(ctx, 'DAWN VERSION', W / 2, ribY + 3, {
      color: '#FFFDF6',
      shadow: '#762C1A',
      scale: 2,
      align: 'center',
    });

    if (this.mode === 'title') {
      const pulse = Math.sin(this.tick * 0.09) * 0.5 + 0.5;
      ctx.save();
      ctx.globalAlpha = 0.45 + pulse * 0.55;
      drawText(ctx, 'PRESS START', W / 2, 178, {
        color: '#FFFFFF',
        shadow: '#181E34',
        scale: 2,
        align: 'center',
      });
      ctx.restore();
    } else if (this.mode === 'saveMenu' && this.saveMenu) {
      this.saveMenu.render(ctx);
    }

    ctx.fillStyle = 'rgba(12, 16, 28, 0.78)';
    ctx.fillRect(0, 236, W, 34);
    ctx.fillStyle = 'rgba(255, 224, 150, 0.25)';
    ctx.fillRect(0, 236, W, 1);

    drawText(ctx, 'ARROWS/WASD:MOVE   Z/ENTER:OK   X:BACK   ESC:MENU', W / 2, 243, {
      color: '#E6EFF8',
      scale: 1,
      align: 'center',
    });
    drawText(ctx, 'M:MUTE AUDIO   F:FULLSCREEN', W / 2, 256, {
      color: '#A8B8CC',
      scale: 1,
      align: 'center',
    });
  }

  _renderProfIntro(ctx) {
    ctx.fillStyle = 'rgba(12, 16, 28, 0.72)';
    ctx.fillRect(0, 0, W, H);

    // Spotlight platform with Professor & Rival standing together
    ctx.fillStyle = 'rgba(255, 244, 210, 0.22)';
    ctx.beginPath();
    ctx.ellipse(W / 2, 156, 112, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(3, 3);
    drawCharacter(ctx, 'prof', 'down', 0, 56, 42, { idle: true });
    drawCharacter(ctx, 'rival', 'down', 0, 88, 42, { idle: true });
    ctx.restore();

    this.textBox.render(ctx);
  }

  _renderDawnVista(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, 215);
    sky.addColorStop(0.0, '#182040');
    sky.addColorStop(0.24, '#2E3460');
    sky.addColorStop(0.46, '#644878');
    sky.addColorStop(0.68, '#C86E66');
    sky.addColorStop(0.86, '#F2AE6C');
    sky.addColorStop(1.0, '#FCE6A4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    for (const s of STARS) {
      const bright = Math.floor((this.tick + s.phase) / 22) % 2 === 0;
      ctx.fillStyle = bright ? '#FFF9DF' : '#8A96BE';
      ctx.fillRect(s.x, s.y, 2, 2);
      if (bright) {
        ctx.fillStyle = 'rgba(255, 249, 220, 0.45)';
        ctx.fillRect(s.x - 2, s.y, 6, 2);
        ctx.fillRect(s.x, s.y - 2, 2, 6);
      }
    }

    const sunY = 160 + Math.sin(this.tick * 0.02) * 2.5;
    const corona = ctx.createRadialGradient(W / 2, sunY, 10, W / 2, sunY, 155);
    corona.addColorStop(0, 'rgba(255, 248, 200, 0.85)');
    corona.addColorStop(0.32, 'rgba(255, 218, 138, 0.42)');
    corona.addColorStop(0.7, 'rgba(255, 168, 100, 0.12)');
    corona.addColorStop(1, 'rgba(255, 168, 100, 0)');
    ctx.fillStyle = corona;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#FFF7C8';
    ctx.beginPath();
    ctx.arc(W / 2, sunY, 32, 0, Math.PI * 2);
    ctx.fill();

    const c1 = (this.tick * 0.22) % (W + 120);
    const c2 = (this.tick * 0.14) % (W + 140);
    this._drawCloud(ctx, W + 40 - c1, 78, '#F8C4A0', 1.2);
    this._drawCloud(ctx, ((260 - c2) + W + 140) % (W + 140) - 60, 112, '#FCE2B6', 1.0);
    this._drawCloud(ctx, ((110 - c2 * 0.8) + W + 140) % (W + 140) - 60, 62, '#D89698', 0.85);

    ctx.fillStyle = '#4B5478';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = 186 - Math.sin(x * 0.015 + 0.4) * 20 - Math.cos(x * 0.032) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#305450';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) {
      const y = 204 - Math.sin(x * 0.02 + 1.5) * 14 - Math.sin(x * 0.008) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1E3C38';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) {
      const y = 222 - Math.sin(x * 0.028 + 2.8) * 11;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    const sway = Math.round(Math.sin(this.tick * 0.08) * 2);
    ctx.fillStyle = '#122624';
    for (let x = 6; x < W; x += 14) {
      ctx.fillRect(x + sway, 224, 2, 12);
      ctx.fillRect(x + 5 - sway, 226, 2, 10);
    }

    for (const p of this.petals) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 2);
    }
  }

  _drawCloud(ctx, x, y, color, s) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x + 10 * s), Math.round(y), Math.round(36 * s), Math.round(8 * s));
    ctx.fillRect(Math.round(x), Math.round(y + 4 * s), Math.round(54 * s), Math.round(8 * s));
    ctx.fillRect(Math.round(x + 16 * s), Math.round(y - 4 * s), Math.round(22 * s), Math.round(5 * s));
  }

  _renderNameEntry(ctx) {
    const isRival = this.mode === 'rivalName';
    ctx.fillStyle = 'rgba(10, 14, 26, 0.68)';
    ctx.fillRect(0, 0, W, H);

    // Top name header card
    drawGbaBox(ctx, 44, 14, 392, 68, {
      fill: '#FAFBFD',
      outerBorder: '#1E2634',
      accentBorder: isRival ? '#5844A8' : '#4C86A8',
      accentHighlight: isRival ? '#9482E4' : '#80BCE0',
      innerBorder: '#2C3C4E',
    });

    // Animated Gen 3 16x32 character sprite (Player or Rival) at crisp 2x scale
    const walkFrame = [0, 1, 2, 3][Math.floor(this.tick / 12) % 4];
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2);
    drawCharacter(ctx, isRival ? 'rival' : 'player', 'down', walkFrame, 32, 20);
    ctx.restore();

    drawText(ctx, isRival ? "RIVAL'S NAME?" : 'YOUR NAME?', 118, 24, {
      color: isRival ? '#52409E' : '#46607A',
      shadow: '#DCE4EC',
      scale: 2,
    });

    for (let i = 0; i < NAME_MAX_LEN; i++) {
      const sx = 118 + i * 32;
      const ch = this.nameChars[i] || '';
      if (ch) {
        drawText(ctx, ch, sx + 6, 46, {
          color: '#1E2634',
          shadow: '#D0D8E0',
          scale: 2,
        });
      }
      const isNextSlot = i === Math.min(this.nameChars.length, NAME_MAX_LEN - 1);
      const blink = isNextSlot && Math.floor(this.tick / 15) % 2 === 0;
      ctx.fillStyle = blink ? '#E64B3C' : '#708498';
      ctx.fillRect(sx + 2, 64, 20, 3);
    }

    drawGbaBox(ctx, 44, 90, 392, 148);

    const gridStartX = 64;
    const gridStartY = 108;
    const colW = 40;
    const rowH = 31;

    for (let r = 0; r < LETTER_GRID.length; r++) {
      for (let c = 0; c < LETTER_GRID[r].length; c++) {
        const token = LETTER_GRID[r][c];
        const cx = gridStartX + c * colW;
        const cy = gridStartY + r * rowH;
        const selected = r === this.cursorRow && c === this.cursorCol;

        if (selected) {
          const boxW = token.length > 1 ? 36 : 24;
          const bx = token.length > 1 ? cx - 4 : cx - 2;
          ctx.fillStyle = '#FFE4A8';
          ctx.fillRect(bx, cy - 5, boxW, 24);
          ctx.fillStyle = '#E64B3C';
          ctx.fillRect(bx, cy - 5, boxW, 2);
          ctx.fillRect(bx, cy + 17, boxW, 2);
        }

        const color =
          token === 'OK'
            ? '#2A7C48'
            : token === 'DEL' || token === 'CLR'
              ? '#C03C3C'
              : '#262E3C';

        const scale = token.length > 1 ? 1 : 2;
        const ox = token.length === 1 ? 4 : token.length === 2 ? 8 : 5;
        const oy = token.length === 1 ? 0 : 4;

        drawText(ctx, token, cx + ox, cy + oy, {
          color,
          shadow: '#DCE2E8',
          scale,
        });
      }
    }

    drawText(
      ctx,
      isRival
        ? 'Z/ENTER:PICK   X/BKSP:DELETE   OK:START ADVENTURE'
        : 'Z/ENTER:PICK   X/BKSP:DELETE   OK:NEXT',
      W / 2,
      248,
      {
        color: '#F4F8FC',
        shadow: '#141824',
        scale: 1,
        align: 'center',
      }
    );
  }
}
