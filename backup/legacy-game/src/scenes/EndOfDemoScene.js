/**
 * HD-2D End of Phase 2 Celebration Screen (480x270).
 * Displays "END OF PHASE 2", Trainer name, smooth-scaled HD starter render,
 * partner level, Rival battle result, prize money, and CONTINUE WALKING / RESTART buttons.
 */

import { drawStarterSprite, STARTERS } from '../data/starters.js';
import { clearSave, gameState, getLeadPokemon } from '../state.js';
import { drawGbaBox, drawText, measureText } from '../ui/font.js';
import { Menu } from '../ui/Menu.js';

const W = 480;
const H = 270;

export class EndOfDemoScene {
  constructor(manager) {
    this.manager = manager;
    this.tick = 0;
    this.menu = null;
    this.busy = false;
  }

  onEnter() {
    this.tick = 0;
    this.busy = false;
    this.menu = new Menu({
      options: [
        { label: 'CONTINUE WALKING', value: 'continue' },
        { label: 'RESTART', value: 'restart' },
      ],
      x: 118,
      y: 194,
      width: 244,
      scale: 2,
      initialIndex: 0,
      cancelable: false,
      onSelect: (opt) => {
        if (this.busy) return;
        this.busy = true;
        if (opt.value === 'restart') {
          clearSave();
          this.manager.transitionTo('title');
        } else {
          this.manager.transitionTo('overworld', { restoreFromState: true });
        }
      },
    });
  }

  update(input) {
    this.tick += 1;
    if (this.busy || this.manager.isTransitioning()) return;
    if (this.menu) {
      this.menu.update(input);
    }
  }

  render(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0.0, '#182442');
    bg.addColorStop(0.45, '#2C4A76');
    bg.addColorStop(0.8, '#4E7298');
    bg.addColorStop(1.0, '#223048');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const stars = [
      [30, 22], [84, 38], [398, 24], [446, 44],
      [38, 228], [434, 214], [62, 152], [418, 146],
      [152, 18], [332, 18],
    ];
    for (let i = 0; i < stars.length; i++) {
      const [sx, sy] = stars[i];
      const bright = Math.floor((this.tick + i * 9) / 18) % 2 === 0;
      ctx.fillStyle = bright ? '#FFF4BC' : '#7E9AC0';
      ctx.fillRect(sx, sy, 3, 3);
    }

    drawText(ctx, 'END OF PHASE 2', W / 2, 16, {
      color: '#FFE068',
      shadow: '#161E34',
      scale: 2,
      align: 'center',
    });

    const starter = gameState.starter || STARTERS[0];
    const lead = getLeadPokemon();
    const level = lead ? lead.level : 5;

    const cardW = 396;
    const cardH = 142;
    const cardX = (W - cardW) / 2;
    const cardY = 42;

    drawGbaBox(ctx, cardX, cardY, cardW, cardH, {
      fill: '#FAFBFD',
      outerBorder: '#1A2232',
      accentBorder: starter.typeColor || '#4C86A8',
      accentHighlight: starter.typeLight || '#FFFFFF',
      innerBorder: '#2C3A4C',
    });

    // Portrait medallion
    const pedX = cardX + 20;
    const pedY = cardY + 18;
    const pedSize = 104;
    ctx.fillStyle = starter.typeColor || '#4C86A8';
    ctx.fillRect(pedX - 2, pedY - 2, pedSize + 4, pedSize + 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(pedX, pedY, pedSize, pedSize);

    const bob = Math.round(Math.sin(this.tick * 0.07) * 2.5);
    drawStarterSprite(ctx, starter, pedX + 6, pedY + 6 + bob, pedSize - 12);

    // Trainer, Partner + Level, Battle Result & Money
    const textX = pedX + pedSize + 20;
    drawText(ctx, `TRAINER: ${gameState.playerName || 'RED'}`, textX, cardY + 18, {
      color: '#1E2634',
      shadow: '#D4DCE6',
      scale: 1,
    });

    drawText(ctx, `${starter.name}  Lv${level}`, textX, cardY + 36, {
      color: '#1E2634',
      shadow: '#D4DCE6',
      scale: 2,
    });

    // Type badge
    const badgeW = measureText(starter.type, 1) + 14;
    const badgeY = cardY + 60;
    ctx.fillStyle = starter.typeDark || '#2C3A4C';
    ctx.fillRect(textX, badgeY, badgeW, 15);
    ctx.fillStyle = starter.typeColor || '#4C86A8';
    ctx.fillRect(textX + 1, badgeY + 1, badgeW - 2, 13);
    drawText(ctx, starter.type, textX + 7, badgeY + 4, {
      color: '#FFFFFF',
      scale: 1,
    });

    // Battle Result + Money
    const rivalName = gameState.rivalName || 'GARY';
    const battleResultText = gameState.flags.rivalBattleDone
      ? gameState.flags.rivalBattleWon
        ? `RIVAL BATTLE: WON VS ${rivalName}!`
        : `RIVAL BATTLE: FACED ${rivalName}`
      : 'RIVAL BATTLE: PENDING';
    const resultColor = gameState.flags.rivalBattleWon ? '#2B8A46' : '#50647A';

    drawText(ctx, battleResultText, textX, cardY + 86, {
      color: resultColor,
      scale: 1,
    });

    drawText(ctx, `MONEY: ₽${gameState.money || 0}`, textX, cardY + 104, {
      color: '#34465A',
      scale: 1,
    });

    drawText(ctx, 'ROUTE 1 COMING SOON!', textX, cardY + 120, {
      color: '#7A8CA0',
      scale: 1,
    });

    if (this.menu) {
      this.menu.render(ctx);
    }
  }
}
