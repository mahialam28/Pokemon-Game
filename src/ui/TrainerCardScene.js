/**
 * Gen 3 Trainer Card Scene ({PLAYER} in Start Menu, 480x270).
 * Displays Name, Trainer ID, Money (₽), Pokédex Seen/Own count,
 * live Play Time, and Lead Partner preview.
 */

import { audio } from '../audio.js';
import { drawMiniIcon, getPokemonDisplayName } from '../data/pokemon.js';
import { drawCharacter } from '../entities/sprites.js';
import { formatPlayTime, gameState, getLeadPokemon } from '../state.js';
import { drawGbaBox, drawText } from './font.js';

const W = 480;
const H = 270;

export class TrainerCardScene {
  constructor(manager) {
    this.manager = manager;
    this.isOverlay = true;
  }

  update(input) {
    if (
      input.wasJustPressed('cancel') ||
      input.wasJustPressed('pause') ||
      input.wasJustPressed('confirm')
    ) {
      audio.cancel();
      this.manager.popScene();
    }
  }

  render(ctx) {
    ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
    ctx.fillRect(0, 0, W, H);

    drawGbaBox(ctx, 42, 26, 396, 216, {
      fill: '#FAFBFD',
      outerBorder: '#1E2836',
      accentBorder: '#3E82B8',
      accentHighlight: '#84C0F0',
      innerBorder: '#2C3C4E',
    });

    // Header band
    ctx.fillStyle = '#3E82B8';
    ctx.fillRect(48, 32, 384, 28);
    drawText(ctx, 'TRAINER CARD', 62, 39, {
      color: '#FFFFFF',
      shadow: '#1C4468',
      scale: 2,
    });
    drawText(ctx, `IDNo.${gameState.trainerId || '00001'}`, 420, 42, {
      color: '#E8F4FF',
      scale: 1,
      align: 'right',
    });

    // Trainer sprite portrait on right
    ctx.fillStyle = '#E8F0F8';
    ctx.fillRect(326, 72, 92, 108);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(3, 3);
    drawCharacter(ctx, 'player', 'down', 0, 116, 34);
    ctx.restore();

    // Details column
    const lx = 64;
    drawText(ctx, `NAME:     ${gameState.playerName || 'RED'}`, lx, 78, {
      color: '#1E2634',
      scale: 2,
    });
    drawText(ctx, `MONEY:    ₽${gameState.money || 0}`, lx, 104, {
      color: '#243448',
      scale: 1,
    });
    drawText(
      ctx,
      `POKéDEX:  SEEN ${gameState.pokedex.seen.length} / OWN ${gameState.pokedex.caught.length}`,
      lx,
      124,
      { color: '#243448', scale: 1 }
    );
    drawText(ctx, `TIME:     ${formatPlayTime(gameState.playTimeFrames)}`, lx, 144, {
      color: '#243448',
      scale: 1,
    });
    drawText(ctx, `PARTY:    ${gameState.party.length}/6   PC BOX: ${gameState.pcBox.length}`, lx, 164, {
      color: '#46586C',
      scale: 1,
    });

    const lead = getLeadPokemon();
    if (lead) {
      drawMiniIcon(ctx, lead.speciesId, lx, 184, 28);
      drawText(ctx, `PARTNER: ${getPokemonDisplayName(lead)} Lv${lead.level}`, lx + 34, 194, {
        color: '#2A6844',
        scale: 1,
      });
    }

    drawText(ctx, 'Z / X / ESC: CLOSE', W / 2, 224, {
      color: '#6C7E92',
      scale: 1,
      align: 'center',
    });
  }
}
