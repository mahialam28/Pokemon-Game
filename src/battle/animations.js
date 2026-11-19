/**
 * DS / Gen 5 ROM-style Battle Animations & Type-Colored VFX (480x270):
 * - Intro flash + closing/opening horizontal black cinema bars
 * - Spinning Poké Ball throw arc + white burst + multi-particle release sparkles
 * - Move animations: Tackle lunge, Scratch 3 claw slashes, Growl sound rings, Tail Whip wag
 * - Type-colored hit particles: NORMAL (white stars), FIRE (embers), WATER (bubbles), GRASS (leaves)
 * - Stat Down (blue downward arrows + tint) & Stat Up (red upward arrows + tint)
 * - 3x target hit blink, white impact flash, screen shake & floating damage-number popups
 */

import { drawText } from '../ui/font.js';

const W = 480;
const H = 270;

/**
 * Intro battle transition: flashes over live overworld, then black bars close shut (0..1).
 */
export function renderBattleBarsClose(ctx, progress) {
  if (progress < 0.4) {
    const idx = Math.floor((progress / 0.4) * 6);
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.82)' : 'rgba(10, 14, 26, 0.72)';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // Smooth horizontal black bars closing toward center
  const t = Math.min(1, (progress - 0.4) / 0.6);
  const ease = t * t * (3 - 2 * t);
  const barH = Math.ceil((H / 2 + 2) * ease);

  ctx.fillStyle = '#090B12';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);

  // Crisp glowing horizontal seam line as bars meet
  if (t < 0.96) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, barH - 1, W, 1);
    ctx.fillRect(0, H - barH, W, 1);
  }
}

/**
 * Open black cinema bars outward to reveal the battle arena (0 = closed, 1 = fully open).
 */
export function renderBattleBarsOpen(ctx, progress) {
  const ease = 1 - Math.pow(1 - Math.min(1, progress), 3);
  const barH = Math.ceil((H / 2 + 2) * (1 - ease));
  if (barH <= 0) return;

  ctx.fillStyle = '#090B12';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);
}

/**
 * Gen 3 Wild Grass Encounter transition (distinct from Trainer cinema bars):
 * Quick bright flash followed by alternating left/right horizontal black stripes wiping shut.
 */
export function renderWildEncounterWipe(ctx, progress) {
  if (progress < 0.38) {
    const idx = Math.floor((progress / 0.38) * 6);
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(244, 255, 232, 0.86)' : 'rgba(18, 44, 26, 0.68)';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  const t = Math.min(1, (progress - 0.38) / 0.62);
  const ease = t * t * (3 - 2 * t);
  const bands = 10;
  const bandH = Math.ceil(H / bands);

  ctx.fillStyle = '#090C12';
  for (let i = 0; i < bands; i++) {
    const bw = Math.ceil(W * ease);
    const y = i * bandH;
    if (i % 2 === 0) {
      ctx.fillRect(0, y, bw, bandH + 1);
    } else {
      ctx.fillRect(W - bw, y, bw, bandH + 1);
    }
  }
}

/** Draw a crisp tilted/spinning Poké Ball centered at (x, y). */
function drawMiniPokeBall(ctx, x, y, angle = 0, radius = 7, caughtDark = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = '#1C1E2A';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = caughtDark ? '#B83430' : '#E84840';
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1.5, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = caughtDark ? '#D0D8E4' : '#F6F8FC';
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1.5, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#1C1E2A';
  ctx.fillRect(-(radius - 1), -1, (radius - 1) * 2, 2);
  ctx.fillStyle = caughtDark ? '#9AA8BC' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1.8, radius * 0.32), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Full Poké Ball Catch Sequence VFX renderer:
 * Stages: 'arc' -> 'absorb' -> 'drop' -> 'shakePause' / 'shake' -> 'caught' | 'breakFree'
 */
export function renderCatchSequence(ctx, catchAnim, enemyPlatform) {
  if (!catchAnim) return;
  const { stage, frame, duration } = catchAnim;
  const u = Math.min(1, frame / Math.max(1, duration));
  const ex = enemyPlatform.x;
  const ey = enemyPlatform.y;

  ctx.save();

  if (stage === 'arc') {
    const sx = 96;
    const sy = 166;
    const tx = ex;
    const ty = ey - 32;
    const bx = sx + (tx - sx) * u;
    const by = sy + (ty - sy) * u - Math.sin(u * Math.PI) * 88;
    drawMiniPokeBall(ctx, bx, by, u * Math.PI * 6, 7);
  } else if (stage === 'absorb') {
    const bx = ex;
    const by = ey - 38;
    // Red capture beam pulsing between ball and wild Pokémon
    const pulse = Math.sin(u * Math.PI);
    const grad = ctx.createRadialGradient(ex, ey - 22, 2, ex, ey - 22, 34 * (1 - u * 0.5) + 6);
    grad.addColorStop(0, `rgba(255, 110, 100, ${(pulse * 0.85).toFixed(3)})`);
    grad.addColorStop(0.6, `rgba(232, 48, 48, ${(pulse * 0.45).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(232, 48, 48, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ex, ey - 22, 40, 0, Math.PI * 2);
    ctx.fill();
    drawMiniPokeBall(ctx, bx, by, 0, 7);
  } else if (stage === 'drop') {
    // Drop with two diminishing bounces onto platform
    let yOff = 0;
    if (u < 0.45) {
      const k = u / 0.45;
      yOff = -38 * (1 - k * k);
    } else if (u < 0.75) {
      const k = (u - 0.45) / 0.3;
      yOff = -Math.sin(k * Math.PI) * 16;
    } else {
      const k = (u - 0.75) / 0.25;
      yOff = -Math.sin(k * Math.PI) * 6;
    }
    ctx.fillStyle = 'rgba(18, 26, 40, 0.28)';
    ctx.beginPath();
    ctx.ellipse(ex, ey + 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMiniPokeBall(ctx, ex, ey - 5 + yOff, 0, 7);
  } else if (stage === 'shakePause' || stage === 'caughtWait') {
    ctx.fillStyle = 'rgba(18, 26, 40, 0.28)';
    ctx.beginPath();
    ctx.ellipse(ex, ey + 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMiniPokeBall(ctx, ex, ey - 5, 0, 7, stage === 'caughtWait');
  } else if (stage === 'shake') {
    const tilt = Math.sin(u * Math.PI * 2) * 0.52;
    const shiftX = Math.sin(u * Math.PI * 2) * 4;
    ctx.fillStyle = 'rgba(18, 26, 40, 0.28)';
    ctx.beginPath();
    ctx.ellipse(ex + shiftX * 0.5, ey + 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMiniPokeBall(ctx, ex + shiftX, ey - 5, tilt, 7);

    // Classic little motion ticks beside shaking ball
    ctx.fillStyle = '#FFFFFF';
    if (u < 0.5) {
      ctx.fillRect(Math.round(ex - 14), Math.round(ey - 12), 4, 2);
      ctx.fillRect(Math.round(ex - 12), Math.round(ey - 7), 3, 2);
    } else {
      ctx.fillRect(Math.round(ex + 10), Math.round(ey - 12), 4, 2);
      ctx.fillRect(Math.round(ex + 9), Math.round(ey - 7), 3, 2);
    }
  } else if (stage === 'caught') {
    ctx.fillStyle = 'rgba(18, 26, 40, 0.28)';
    ctx.beginPath();
    ctx.ellipse(ex, ey + 2, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawMiniPokeBall(ctx, ex, ey - 5, 0, 7, true);

    // Three golden stars bursting upward on catch click!
    const alpha = Math.max(0, 1 - u * 0.85);
    const stars = [
      { dx: -16, dy: -14 },
      { dx: 0, dy: -22 },
      { dx: 16, dy: -14 },
    ];
    for (let i = 0; i < stars.length; i++) {
      const sx = Math.round(ex + stars[i].dx * (0.4 + u * 0.9));
      const sy = Math.round(ey - 10 + stars[i].dy * (0.3 + u * 1.1));
      ctx.fillStyle = `rgba(255, 224, 72, ${alpha.toFixed(3)})`;
      ctx.fillRect(sx - 3, sy, 7, 1);
      ctx.fillRect(sx, sy - 3, 1, 7);
      ctx.fillStyle = `rgba(255, 255, 232, ${alpha.toFixed(3)})`;
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
    }
  } else if (stage === 'breakFree') {
    const alpha = Math.max(0, 1 - u);
    const r = 8 + u * 44;
    const grad = ctx.createRadialGradient(ex, ey - 18, 2, ex, ey - 18, r);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
    grad.addColorStop(0.55, `rgba(255, 110, 96, ${(alpha * 0.72).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(255, 110, 96, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ex, ey - 18, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Gleaming ring of golden stars for 1/4096 Shiny Pokémon encounter! */
export function renderShinySparkle(ctx, cx, cy, u) {
  const alpha = Math.sin(Math.min(1, u) * Math.PI);
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + u * 2.4;
    const r = 10 + Math.sin(u * Math.PI) * 34;
    const sx = Math.round(cx + Math.cos(ang) * r);
    const sy = Math.round(cy - 28 + Math.sin(ang) * r * 0.75);
    ctx.fillStyle =
      i % 2 === 0
        ? `rgba(255, 232, 92, ${alpha.toFixed(3)})`
        : `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
    ctx.fillRect(sx - 4, sy, 9, 1);
    ctx.fillRect(sx, sy - 4, 1, 9);
    ctx.fillRect(sx - 1, sy - 1, 3, 3);
  }
  ctx.restore();
}

/** Rising purple toxic bubbles for end-of-turn Poison (PSN) damage. */
export function renderPoisonBubbles(ctx, cx, cy, u) {
  const alpha = Math.max(0, 1 - u * 0.85);
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const ox = ((i % 3) - 1) * 18 + Math.sin(i * 2.1 + u * 6) * 5;
    const oy = -10 - u * 44 - (i % 4) * 8;
    const r = 3 + (i % 3) * 1.6;
    ctx.fillStyle = `rgba(176, 80, 212, ${(alpha * 0.75).toFixed(3)})`;
    ctx.strokeStyle = `rgba(232, 176, 255, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Spinning Poké Ball throw arc (0..0.68) followed by bright white release burst
 * and radial golden/white sparkle particles (0.68..1.0).
 */
export function renderPokeBallThrow(ctx, startX, startY, endX, endY, t) {
  if (t < 0.68) {
    const u = t / 0.68;
    const x = startX + (endX - startX) * u;
    const y = startY + (endY - startY) * u - Math.sin(u * Math.PI) * 82;
    const angle = u * Math.PI * 6;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = '#1C1E2A';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E84840';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F6F8FC';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#1C1E2A';
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // White release burst + expanding sparkle ring
  const u = (t - 0.68) / 0.32;
  const alpha = Math.max(0, 1 - u);
  const cx = endX;
  const cy = endY - 24;
  const r = 10 + u * 54;

  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
  grad.addColorStop(0, `rgba(255, 255, 255, ${(alpha * 0.96).toFixed(3)})`);
  grad.addColorStop(0.55, `rgba(255, 240, 176, ${(alpha * 0.62).toFixed(3)})`);
  grad.addColorStop(1, 'rgba(255, 240, 176, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Crisp pixel sparkles radiating outward
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 + u * 0.6;
    const dist = 8 + u * 44;
    const sx = Math.round(cx + Math.cos(ang) * dist);
    const sy = Math.round(cy + Math.sin(ang) * dist * 0.72);
    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 255, 255, ${alpha.toFixed(3)})` : `rgba(255, 224, 104, ${alpha.toFixed(3)})`;
    ctx.fillRect(sx - 2, sy, 5, 1);
    ctx.fillRect(sx, sy - 2, 1, 5);
  }
  ctx.restore();
}

/**
 * Evaluate per-frame sprite transforms, flash, 3x blink, tint pulse & VFX overlay
 * for an active battle move animation.
 */
export function evaluateMoveAnim(animName, moveType, statDirection, actorSide, t) {
  const dir = actorSide === 'player' ? 1 : -1;
  const state = {
    actorOx: 0,
    actorOy: 0,
    targetOx: 0,
    targetOy: 0,
    targetFlash: false,
    targetBlinkHide: false,
    targetTint: null, // 'blue' | 'red' | null
    overlay: null,
  };

  // Status / stat-change animations
  if (animName === 'growl') {
    if (t < 0.48) {
      const u = t / 0.48;
      state.actorOx = Math.sin(u * Math.PI * 8) * 3;
      state.overlay = { type: 'soundWaves', u };
    } else {
      const u = (t - 0.48) / 0.52;
      state.targetTint = statDirection === 'up' ? 'red' : 'blue';
      state.overlay = { type: statDirection === 'up' ? 'statUp' : 'statDown', u };
    }
    return state;
  }

  if (animName === 'tailWhip') {
    if (t < 0.46) {
      const u = t / 0.46;
      state.actorOx = Math.sin(u * Math.PI * 6) * 11;
      state.actorOy = -Math.abs(Math.sin(u * Math.PI * 3)) * 5;
    } else {
      const u = (t - 0.46) / 0.54;
      state.targetTint = statDirection === 'up' ? 'red' : 'blue';
      state.overlay = { type: statDirection === 'up' ? 'statUp' : 'statDown', u };
    }
    return state;
  }

  // Damaging moves (Tackle, Scratch, Fire, Water, Grass, etc.)
  if (t < 0.28) {
    const u = t / 0.28;
    const ease = Math.sin(u * Math.PI * 0.5);
    const lunge = animName === 'scratch' ? 20 : 34;
    state.actorOx = dir * ease * lunge;
    state.actorOy = -dir * ease * 12;
  } else {
    const u = (t - 0.28) / 0.72;
    const lunge = animName === 'scratch' ? 20 : 34;
    const recoil = Math.max(0, 1 - u * 2.2);
    state.actorOx = dir * recoil * lunge;
    state.actorOy = -dir * recoil * 12;

    // Impact white flash first, followed by 3x classic ROM blink + shake
    if (u < 0.22) {
      state.targetFlash = true;
      state.targetOx = Math.sin(u * Math.PI * 10) * 6;
    } else {
      const blinkIdx = Math.floor(((u - 0.22) / 0.78) * 6); // 3 full off/on blinks
      state.targetBlinkHide = blinkIdx % 2 === 0;
      state.targetOx = Math.sin(u * Math.PI * 8) * 4 * (1 - u);
    }

    state.overlay = {
      type: animName === 'scratch' ? 'scratch' : 'typeImpact',
      moveType: String(moveType || 'NORMAL').toUpperCase(),
      u,
    };
  }

  return state;
}

/**
 * Draw move VFX particles (Normal stars, Fire embers, Water bubbles, Grass leaves,
 * Scratch slashes, Growl sound rings, Stat Down/Up arrows) on the top VFX canvas.
 */
export function renderMoveOverlay(ctx, overlay, actorPos, targetPos) {
  if (!overlay) return;
  const cx = targetPos.x;
  const cy = targetPos.y - 34;

  ctx.save();

  if (overlay.type === 'scratch') {
    const { u } = overlay;
    for (let i = 0; i < 3; i++) {
      const lu = Math.max(0, Math.min(1, (u * 1.45 - i * 0.14) / 0.45));
      if (lu <= 0 || lu >= 1) continue;
      const ox = (i - 1) * 14;
      const oy = (i - 1) * 7;
      const sx = cx + ox + 22;
      const sy = cy + oy - 22;
      const ex = sx - 44 * lu;
      const ey = sy + 44 * lu;

      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - lu * 0.35).toFixed(3)})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 224, 150, ${(0.85 - lu * 0.5).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  } else if (overlay.type === 'typeImpact') {
    const { moveType, u } = overlay;
    const alpha = Math.max(0, 1 - u);

    if (moveType === 'FIRE') {
      // Rising glowing orange-gold ember particles
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const spread = 8 + u * 34;
        const ex = Math.round(cx + Math.cos(ang) * spread);
        const ey = Math.round(cy + Math.sin(ang) * spread * 0.6 - u * 26);
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 110, 36, ${alpha.toFixed(3)})` : `rgba(255, 226, 92, ${alpha.toFixed(3)})`;
        ctx.fillRect(ex - 2, ey - 2, 5, 5);
        ctx.fillStyle = `rgba(255, 255, 220, ${(alpha * 0.8).toFixed(3)})`;
        ctx.fillRect(ex - 1, ey - 1, 2, 2);
      }
    } else if (moveType === 'WATER') {
      // Shimmering cyan-white bubbles popping upward
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.3;
        const bx = cx + Math.cos(ang) * (10 + u * 30);
        const by = cy + Math.sin(ang) * (8 + u * 20) - u * 18;
        const r = 3 + (i % 3) * 1.8;
        ctx.strokeStyle = `rgba(110, 214, 255, ${alpha.toFixed(3)})`;
        ctx.fillStyle = `rgba(180, 240, 255, ${(alpha * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(bx - 1), Math.round(by - 2), 2, 2);
      }
    } else if (moveType === 'GRASS') {
      // Swirling bright green leaves
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + u * 3.2;
        const dist = 10 + u * 36;
        const lx = cx + Math.cos(ang) * dist;
        const ly = cy + Math.sin(ang) * dist * 0.7;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(ang);
        ctx.fillStyle = i % 2 === 0 ? `rgba(76, 196, 74, ${alpha.toFixed(3)})` : `rgba(148, 238, 108, ${alpha.toFixed(3)})`;
        ctx.fillRect(-4, -2, 8, 4);
        ctx.fillStyle = `rgba(42, 128, 48, ${alpha.toFixed(3)})`;
        ctx.fillRect(-3, 0, 6, 1);
        ctx.restore();
      }
    } else if (moveType === 'ELECTRIC') {
      // Crackling electric yellow-white sparks
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + u * 1.5;
        const dist = 6 + u * 34;
        const sx = Math.round(cx + Math.cos(ang) * dist);
        const sy = Math.round(cy + Math.sin(ang) * dist * 0.75);
        ctx.strokeStyle = i % 2 === 0 ? `rgba(255, 224, 56, ${alpha.toFixed(3)})` : `rgba(255, 255, 220, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx - 5, sy - 4);
        ctx.lineTo(sx, sy);
        ctx.lineTo(sx - 2, sy + 2);
        ctx.lineTo(sx + 5, sy + 6);
        ctx.stroke();
      }
    } else if (moveType === 'POISON') {
      // Toxic purple bubbles splashing outward
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const px = cx + Math.cos(ang) * (8 + u * 28);
        const py = cy + Math.sin(ang) * (6 + u * 20) - u * 12;
        const r = 3 + (i % 3) * 1.5;
        ctx.fillStyle = `rgba(170, 68, 208, ${(alpha * 0.85).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240, 192, 255, ${alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(px - 1), Math.round(py - 1), 2, 2);
      }
    } else {
      // NORMAL: crisp white impact burst + radiating pixel stars
      if (u < 0.35) {
        const flashA = (1 - u / 0.35) * 0.85;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashA.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 10 + u * 40, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + 0.4;
        const dist = 8 + u * 38;
        const sx = Math.round(cx + Math.cos(ang) * dist);
        const sy = Math.round(cy + Math.sin(ang) * dist * 0.8);
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 255, 255, ${alpha.toFixed(3)})` : `rgba(255, 240, 170, ${alpha.toFixed(3)})`;
        ctx.fillRect(sx - 3, sy, 7, 1);
        ctx.fillRect(sx, sy - 3, 1, 7);
        ctx.fillRect(sx - 1, sy - 1, 3, 3);
      }
    }
  } else if (overlay.type === 'soundWaves') {
    const { u } = overlay;
    for (let i = 0; i < 3; i++) {
      const lu = u * 1.4 - i * 0.22;
      if (lu < 0 || lu > 1) continue;
      const x = actorPos.x + (targetPos.x - actorPos.x) * lu;
      const y = actorPos.y - 34 + (targetPos.y - 34 - (actorPos.y - 34)) * lu;
      const r = 10 + lu * 26;
      ctx.strokeStyle = `rgba(255, 240, 168, ${((1 - lu) * 0.85).toFixed(3)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (overlay.type === 'statDown' || overlay.type === 'statUp') {
    const { u } = overlay;
    const isUp = overlay.type === 'statUp';
    const alpha = Math.sin(u * Math.PI);
    const offsets = [-26, -13, 0, 13, 26];

    for (let i = 0; i < offsets.length; i++) {
      const ax = Math.round(cx + offsets[i]);
      const travel = isUp ? (1 - u) * 44 : u * 44;
      const ay = Math.round(targetPos.y - 68 + travel + (i % 2) * 10);

      if (isUp) {
        // Red upward-arrow particles
        ctx.fillStyle = `rgba(255, 86, 76, ${(alpha * 0.95).toFixed(3)})`;
        ctx.fillRect(ax - 1, ay - 6, 2, 2);
        ctx.fillRect(ax - 3, ay - 4, 6, 2);
        ctx.fillRect(ax - 5, ay - 2, 10, 2);
        ctx.fillRect(ax - 2, ay, 4, 7);
      } else {
        // Blue downward-arrow particles
        ctx.fillStyle = `rgba(74, 168, 255, ${(alpha * 0.95).toFixed(3)})`;
        ctx.fillRect(ax - 2, ay - 6, 4, 7);
        ctx.fillRect(ax - 5, ay, 10, 2);
        ctx.fillRect(ax - 3, ay + 2, 6, 2);
        ctx.fillRect(ax - 1, ay + 4, 2, 2);
      }
    }
  }

  ctx.restore();
}

/**
 * Draw floating damage number popups (e.g. "-6", golden "CRIT -12!").
 */
export function renderDamagePopups(ctx, popups) {
  for (const p of popups) {
    const u = p.frame / p.duration;
    const alpha = u < 0.7 ? 1 : Math.max(0, 1 - (u - 0.7) / 0.3);
    const y = p.y - u * 26;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawText(ctx, p.text, p.x, y, {
      color: p.isCrit ? '#FFE058' : '#FFFFFF',
      shadow: p.isCrit ? '#9E2A18' : '#182032',
      scale: p.isCrit ? 2 : 2,
      align: 'center',
    });
    ctx.restore();
  }
}
