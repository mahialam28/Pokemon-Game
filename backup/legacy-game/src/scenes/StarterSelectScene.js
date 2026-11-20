/**
 * HD-2D Starter Selection Overlay Scene (480x270).
 * Displays the smooth-scaled HD Pokémon render (PokémonDB primary, PokéAPI pixel fallback)
 * inside a framed radiant showcase card with Dex #, name, type badge, 1-line description,
 * and YES/NO confirmation.
 * On YES: removes ball, plays smooth bounce + radiant flash + 8-bit fanfare, saves state,
 * then hands back to lab for Professor's closing dialogue & EndOfDemoScene.
 */

import { audio } from '../audio.js';
import { drawStarterSprite } from '../data/starters.js';
import { setStarter } from '../state.js';
import { drawGbaBox, drawText, measureText } from '../ui/font.js';
import { Menu } from '../ui/Menu.js';
import { TextBox } from '../ui/TextBox.js';

const W = 480;
const H = 270;

export class StarterSelectScene {
  constructor(manager) {
    this.manager = manager;
    this.isOverlay = true;

    this.starter = null;
    this.onAccepted = null;
    this.textBox = new TextBox();
    this.yesNoMenu = null;

    this.phase = 'prompt'; // 'prompt' | 'choose' | 'celebrate'
    this.tick = 0;
    this.openAnim = 0;
    this.celebrateTick = 0;
  }

  onEnter({ starter, onAccepted = null } = {}) {
    this.starter = starter;
    this.onAccepted = onAccepted;
    this.yesNoMenu = null;
    this.phase = 'prompt';
    this.tick = 0;
    this.openAnim = 0;
    this.celebrateTick = 0;

    const promptMsg = `So, you want ${starter.name}, the ${starter.type} type POKéMON?`;
    this.textBox.show(promptMsg, {
      waitForConfirm: false,
      onComplete: () => {
        this.phase = 'choose';
        this.yesNoMenu = Menu.createYesNo({
          x: 344,
          y: 112,
          onYes: () => this._acceptStarter(),
          onNo: () => this._declineStarter(),
        });
      },
    });
  }

  _declineStarter() {
    this.manager.popScene();
  }

  _acceptStarter() {
    setStarter(this.starter);

    this.phase = 'celebrate';
    this.celebrateTick = 0;
    this.yesNoMenu = null;
    audio.fanfare();

    this.textBox.show('{PLAYER} received {STARTER}!', {
      waitForConfirm: true,
      onComplete: () => {
        const cb = this.onAccepted;
        this.manager.popScene();
        if (cb) cb(this.starter);
      },
    });
  }

  update(input) {
    this.tick += 1;
    if (this.openAnim < 1) {
      this.openAnim = Math.min(1, this.openAnim + 0.14);
    }

    if (this.phase === 'celebrate') {
      this.celebrateTick += 1;
      if (this.celebrateTick < 24) {
        this.textBox.update({
          isHeld: () => false,
          wasJustPressed: () => false,
        });
      } else {
        this.textBox.update(input);
      }
      return;
    }

    if (this.phase === 'choose' && this.yesNoMenu) {
      this.yesNoMenu.update(input);
      return;
    }

    this.textBox.update(input);
  }

  render(ctx) {
    if (!this.starter) return;

    const ease = 1 - Math.pow(1 - this.openAnim, 3);

    // Soft atmospheric scrim over the live lab scene
    ctx.fillStyle = `rgba(10, 14, 24, ${(0.58 * ease).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);

    // Main HD-2D starter card
    const cardW = 396;
    const cardH = 166;
    const cardX = (W - cardW) / 2;
    const cardY = 14 + Math.round((1 - ease) * 14);

    ctx.save();
    ctx.globalAlpha = ease;

    drawGbaBox(ctx, cardX, cardY, cardW, cardH, {
      fill: '#FAFBFD',
      outerBorder: '#1C2432',
      accentBorder: this.starter.typeColor,
      accentHighlight: this.starter.typeLight || '#FFFFFF',
      innerBorder: '#2C3A4C',
    });

    // Crisp white framed portrait medallion on left (seamlessly blends HD .jpg white bg!)
    const portX = cardX + 18;
    const portY = cardY + 18;
    const portSize = 114;

    // Outer subtle accent ring
    ctx.fillStyle = this.starter.typeColor;
    ctx.fillRect(portX - 2, portY - 2, portSize + 4, portSize + 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(portX, portY, portSize, portSize);

    // Celebration radiant glow behind sprite
    if (this.phase === 'celebrate') {
      const glowAlpha = Math.max(0, 0.55 - this.celebrateTick * 0.01);
      const g = ctx.createRadialGradient(
        portX + portSize / 2,
        portY + portSize / 2,
        8,
        portX + portSize / 2,
        portY + portSize / 2,
        portSize * 0.65
      );
      g.addColorStop(0, `rgba(255, 236, 140, ${glowAlpha.toFixed(3)})`);
      g.addColorStop(1, 'rgba(255, 236, 140, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(portX, portY, portSize, portSize);
    }

    // Bounce & flash animation
    let bounceY = 0;
    let flash = false;
    if (this.phase === 'celebrate') {
      if (this.celebrateTick < 34) {
        bounceY = -Math.round(Math.abs(Math.sin((this.celebrateTick / 17) * Math.PI)) * 14);
      }
      flash = this.celebrateTick < 26 && Math.floor(this.celebrateTick / 4) % 2 === 0;
    } else {
      bounceY = Math.round(Math.sin(this.tick * 0.06) * 2);
    }

    drawStarterSprite(ctx, this.starter, portX + 7, portY + 7 + bounceY, portSize - 14, { flash });

    // Golden celebration sparkles around portrait
    if (this.phase === 'celebrate' && this.celebrateTick < 54) {
      const sp = Math.floor(this.celebrateTick / 5) % 2;
      ctx.fillStyle = sp === 0 ? '#FFD848' : '#FFF8C8';
      const pts = [
        [portX + 12, portY + 14],
        [portX + portSize - 16, portY + 20],
        [portX + 18, portY + portSize - 20],
        [portX + portSize - 14, portY + portSize - 18],
      ];
      for (const [sx, sy] of pts) {
        ctx.fillRect(sx - 4, sy, 9, 2);
        ctx.fillRect(sx, sy - 4, 2, 9);
      }
    }

    // Right info column: Dex #, Name, Type Badge
    const infoX = portX + portSize + 20;
    const dexNum = `No.${String(this.starter.id).padStart(3, '0')}`;
    drawText(ctx, dexNum, infoX, cardY + 22, {
      color: '#6A7C90',
      shadow: '#E4EAF0',
      scale: 2,
    });

    drawText(ctx, this.starter.name, infoX, cardY + 46, {
      color: '#1E2634',
      shadow: '#D4DCE6',
      scale: 2,
    });

    // Type badge pill with top highlight bevel
    const typeLabel = this.starter.type;
    const badgeW = measureText(typeLabel, 2) + 22;
    const badgeH = 24;
    const badgeX = infoX;
    const badgeY = cardY + 72;

    ctx.fillStyle = this.starter.typeDark;
    ctx.fillRect(badgeX + 2, badgeY, badgeW - 4, badgeH);
    ctx.fillRect(badgeX, badgeY + 2, badgeW, badgeH - 4);
    ctx.fillStyle = this.starter.typeColor;
    ctx.fillRect(badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4);
    ctx.fillStyle = this.starter.typeLight || '#FFFFFF';
    ctx.fillRect(badgeX + 3, badgeY + 2, badgeW - 6, 2);

    drawText(ctx, typeLabel, badgeX + 11, badgeY + 6, {
      color: '#FFFFFF',
      shadow: this.starter.typeDark,
      scale: 2,
    });

    // Divider line & 1-line description cleanly spanning bottom of card
    ctx.fillStyle = '#D4DEE8';
    ctx.fillRect(cardX + 18, cardY + 138, cardW - 36, 1);

    drawText(ctx, this.starter.description, W / 2, cardY + 146, {
      color: '#344252',
      scale: 1,
      align: 'center',
    });

    ctx.restore();

    // Dialogue box at bottom
    this.textBox.render(ctx);

    // YES / NO menu when active
    if (this.phase === 'choose' && this.yesNoMenu) {
      this.yesNoMenu.render(ctx);
    }
  }
}
