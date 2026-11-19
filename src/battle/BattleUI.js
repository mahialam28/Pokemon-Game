/**
 * DS / Gen 5 ROM-style Battle Backgrounds, Platforms & UI Renderer (480x270).
 * Features:
 * - Location-based pixel-art backgrounds ('lab' & 'grass' ready now; extensible for 'cave', etc.)
 * - Shaded beveled elliptical platforms with soft drop shadows + slide-in offsets + DS camera sway
 * - Clean ROM-inspired rounded HP boxes with subtle gradient, edge slide-in/out & low-HP red pulse
 * - Shimmering EXP bar & Level-Up stat panel showing old → new values
 * - Action menu with animated cursor + Move menu with type badges & yellow/red low-PP color
 */

import { getMove } from '../data/moves.js';
import { getPokemonDisplayName } from '../data/pokemon.js';
import { drawStarterSprite } from '../data/starters.js';
import { getTypeColor } from '../data/typeChart.js';
import { drawGbaBox, drawText, measureText } from '../ui/font.js';

const W = 480;
const H = 270;
const BG_PAD = 8; // Extra bleed around edges for smooth DS-style camera sway

export const PLAYER_PLATFORM = { x: 132, y: 184 };
export const ENEMY_PLATFORM = { x: 354, y: 108 };

const bgCache = new Map();

/** Build pixel-art Laboratory battle background (496x286 with sway bleed). */
function buildLabBackground() {
  const cw = W + BG_PAD * 2;
  const ch = H + BG_PAD * 2;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Soft laboratory wall gradient
  const wall = ctx.createLinearGradient(0, 0, 0, 126);
  wall.addColorStop(0, '#B8D0E4');
  wall.addColorStop(0.6, '#D4E4F0');
  wall.addColorStop(1, '#E6EFF6');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, cw, 126);

  // Softly blurred background machines, glowing monitors & bookshelves
  ctx.save();
  try {
    ctx.filter = 'blur(2px)';
  } catch {
    // Graceful fallback
  }

  // Tall lab windows with morning daylight
  for (const wx of [34, 152, 296, 408]) {
    ctx.fillStyle = '#527892';
    ctx.fillRect(wx - 2, 10, 58, 56);
    ctx.fillStyle = '#88D8F4';
    ctx.fillRect(wx, 12, 54, 52);
    ctx.fillStyle = '#FFF8DE';
    ctx.fillRect(wx + 4, 24, 46, 36);
    ctx.fillStyle = '#D8F6FF';
    ctx.fillRect(wx + 4, 15, 22, 10);
  }

  // Distant lab research cabinets & glowing cyan monitors
  ctx.fillStyle = '#7C94A8';
  ctx.fillRect(16, 68, 96, 44);
  ctx.fillStyle = '#305468';
  ctx.fillRect(24, 74, 34, 20);
  ctx.fillStyle = '#5EE6D4';
  ctx.fillRect(27, 77, 28, 14);
  ctx.fillStyle = '#92A8BA';
  ctx.fillRect(68, 72, 36, 36);

  // Distant bookshelves on right
  ctx.fillStyle = '#7A5438';
  ctx.fillRect(368, 64, 108, 48);
  const bookColors = ['#D85450', '#4A88D0', '#54A854', '#E8BC44', '#9864C4'];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = bookColors[(i + row * 2) % bookColors.length];
      ctx.fillRect(374 + i * 8, 70 + row * 18, 6, 14);
    }
  }

  // Center lab bench silhouette
  ctx.fillStyle = '#9BB0C2';
  ctx.fillRect(126, 86, 228, 26);
  ctx.fillStyle = '#CFDCE6';
  ctx.fillRect(126, 86, 228, 6);
  ctx.restore();

  // Crisp wall baseboard molding
  ctx.fillStyle = '#708CA4';
  ctx.fillRect(0, 108, cw, 6);
  ctx.fillStyle = '#4A6478';
  ctx.fillRect(0, 114, cw, 2);

  // Clean pixel-art tiled lab floor with subtle perspective rows
  ctx.fillStyle = '#EDF3F8';
  ctx.fillRect(0, 116, cw, ch - 116);

  let y = 116;
  let rowIdx = 0;
  while (y < ch) {
    const rowH = 14 + rowIdx * 4;
    const tileW = 26 + rowIdx * 5;
    for (let col = -1; col < 24; col++) {
      if ((col + rowIdx) % 2 === 0) {
        ctx.fillStyle = '#DCE6F0';
        ctx.fillRect(col * tileW - (rowIdx % 2) * 8, y, tileW, rowH);
      }
    }
    ctx.fillStyle = 'rgba(130, 156, 180, 0.26)';
    ctx.fillRect(0, y, cw, 1);
    y += rowH;
    rowIdx += 1;
  }

  // Warm sunlit indoor glaze
  const wash = ctx.createRadialGradient(120, 48, 12, 180, 96, 360);
  wash.addColorStop(0, 'rgba(255, 248, 220, 0.28)');
  wash.addColorStop(1, 'rgba(255, 248, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, cw, ch);

  return c;
}

/** Build pixel-art Grass Field battle background (ready for Route 1 / Phase 3 wild battles). */
function buildGrassBackground() {
  const cw = W + BG_PAD * 2;
  const ch = H + BG_PAD * 2;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Crisp morning blue-gold sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 118);
  sky.addColorStop(0, '#68B2EC');
  sky.addColorStop(0.65, '#A8DCFA');
  sky.addColorStop(1, '#E8F6E0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cw, 118);

  // Soft pixel clouds
  ctx.fillStyle = '#FFFFFF';
  for (const [cx, cy, w] of [[44, 24, 58], [210, 18, 72], [374, 30, 62]]) {
    ctx.fillRect(cx + 8, cy, w - 16, 8);
    ctx.fillRect(cx, cy + 4, w, 8);
    ctx.fillRect(cx + 12, cy - 4, w - 28, 6);
  }

  // Rolling distant green hills
  ctx.fillStyle = '#5CA866';
  for (let x = 0; x < cw; x += 4) {
    const h = Math.round(Math.sin(x * 0.018 + 0.5) * 14 + 26);
    ctx.fillRect(x, 118 - h, 4, h + 6);
  }
  ctx.fillStyle = '#489452';
  for (let x = 0; x < cw; x += 4) {
    const h = Math.round(Math.sin(x * 0.025 + 2.4) * 10 + 16);
    ctx.fillRect(x, 118 - h, 4, h + 6);
  }

  // Lush meadow battle ground bands
  const ground = ctx.createLinearGradient(0, 116, 0, ch);
  ground.addColorStop(0, '#82CE64');
  ground.addColorStop(0.55, '#68B852');
  ground.addColorStop(1, '#4E9C42');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 116, cw, ch - 116);

  // Subtle pixel grass tufts
  ctx.fillStyle = '#54A446';
  for (let i = 0; i < 42; i++) {
    const gx = (i * 47) % cw;
    const gy = 124 + ((i * 29) % 130);
    ctx.fillRect(gx, gy, 6, 2);
    ctx.fillRect(gx + 2, gy - 2, 2, 2);
  }

  return c;
}

const BG_BUILDERS = {
  lab: buildLabBackground,
  grass: buildGrassBackground,
};

function getLocationBg(location = 'lab') {
  const key = BG_BUILDERS[location] ? location : 'lab';
  if (!bgCache.has(key)) {
    bgCache.set(key, BG_BUILDERS[key]());
  }
  return bgCache.get(key);
}

/** Render location-based battle background with subtle DS-style camera sway. */
export function renderBattleBackground(ctx, location = 'lab', swayX = 0, swayY = 0) {
  const bg = getLocationBg(location);
  ctx.drawImage(bg, Math.round(-BG_PAD + swayX), Math.round(-BG_PAD + swayY));
}

/** Render a shaded elliptical platform with beveled rim & soft drop shadow. */
export function renderBattlePlatform(ctx, cx, cy, rx, ry, location = 'lab') {
  const isGrass = location === 'grass';

  // Soft elliptical ground shadow
  ctx.fillStyle = 'rgba(18, 28, 42, 0.24)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, rx + 5, ry + 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer dark rim edge
  ctx.fillStyle = isGrass ? '#326A34' : '#5E7C94';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Beveled rim band
  ctx.fillStyle = isGrass ? '#4E9A48' : '#8AA8BE';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, rx - 1, ry - 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top shaded pad surface
  const topGrad = ctx.createRadialGradient(cx - rx * 0.18, cy - ry * 0.2, 4, cx, cy, rx);
  if (isGrass) {
    topGrad.addColorStop(0, '#B2EC88');
    topGrad.addColorStop(0.7, '#7EC85E');
    topGrad.addColorStop(1, '#5CA84C');
  } else {
    topGrad.addColorStop(0, '#FFFFFF');
    topGrad.addColorStop(0.7, '#E6EFF6');
    topGrad.addColorStop(1, '#BDCEE0');
  }
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle inner concentric accent line
  ctx.strokeStyle = isGrass ? 'rgba(255, 255, 210, 0.35)' : 'rgba(116, 150, 178, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.72, ry * 0.66, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/** Clean ROM-inspired rounded panel with thin border & subtle vertical light gradient. */
function drawRomHudPanel(ctx, x, y, w, h, accentColor = '#4C86A8') {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  // Crisp subtle elevation shadow
  ctx.fillStyle = 'rgba(14, 20, 34, 0.28)';
  ctx.fillRect(x + 2, y + 3, w - 2, h);
  ctx.fillRect(x + 1, y + 4, w, h - 2);

  // Outer thin dark rounded border
  ctx.fillStyle = '#222C3C';
  ctx.fillRect(x + 2, y, w - 4, h);
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillRect(x, y + 2, w, h - 4);

  // Subtle top-to-bottom glossy white-ivory gradient interior
  const grad = ctx.createLinearGradient(0, y + 2, 0, y + h - 2);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.65, '#F4F8FB');
  grad.addColorStop(1, '#E2EBF2');
  ctx.fillStyle = grad;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

  // Sleek left edge color accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 2, y + 4, 3, h - 8);
}

function getHpBarColor(ratio) {
  if (ratio > 0.5) return { fill: '#42C85E', hi: '#8CF09E' };
  if (ratio > 0.2) return { fill: '#F0BC34', hi: '#FFE47C' };
  return { fill: '#E8443C', hi: '#FF8C80' };
}

function drawHpBar(ctx, x, y, w, ratio, tick = 0) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const isLow = clamped > 0 && clamped <= 0.2;

  ctx.fillStyle = '#242E3C';
  ctx.fillRect(x, y, w, 9);
  ctx.fillStyle = '#445060';
  ctx.fillRect(x + 2, y + 2, w - 4, 5);

  const innerW = w - 4;
  const fillW = clamped > 0 ? Math.max(2, Math.round(innerW * clamped)) : 0;
  if (fillW > 0) {
    const col = getHpBarColor(clamped);
    ctx.fillStyle = col.fill;
    ctx.fillRect(x + 2, y + 2, fillW, 5);
    ctx.fillStyle = col.hi;
    ctx.fillRect(x + 2, y + 2, fillW, 2);

    // Pulsing bright red warning flash under 20% HP
    if (isLow) {
      const pulse = Math.sin(tick * 0.25) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 220, 210, ${(pulse * 0.65).toFixed(3)})`;
      ctx.fillRect(x + 2, y + 2, fillW, 5);
    }
  }
}

function drawStatusBadge(ctx, status, x, y) {
  if (!status) return;
  const bg = status === 'PSN' ? '#9C48B8' : '#707888';
  const dark = status === 'PSN' ? '#622678' : '#404858';
  ctx.fillStyle = dark;
  ctx.fillRect(x, y, 24, 11);
  ctx.fillStyle = bg;
  ctx.fillRect(x + 1, y + 1, 22, 9);
  drawText(ctx, status, x + 12, y + 2, { color: '#FFFFFF', scale: 1, align: 'center' });
}

/** Foe Info Box (top-left, slides in from left edge). */
export function renderEnemyHud(ctx, enemyMon, displayHp, offsetX = 0, tick = 0) {
  const x = 16 + offsetX;
  const y = 14;
  const w = 190;
  const h = 44;
  if (x + w < -8) return;

  drawRomHudPanel(ctx, x, y, w, h, '#607898');

  drawText(ctx, enemyMon.name, x + 12, y + 8, {
    color: '#1E2634',
    shadow: '#DCE4EC',
    scale: 1,
  });
  let nameEnd = x + 14 + measureText(enemyMon.name, 1);
  drawText(ctx, enemyMon.gender || '♂', nameEnd + 2, y + 8, {
    color: enemyMon.gender === '♀' ? '#E45C88' : '#3E84DC',
    scale: 1,
  });
  if (enemyMon.isShiny) {
    drawText(ctx, '★', nameEnd + 11, y + 8, { color: '#E8A820', scale: 1 });
  }

  drawText(ctx, `Lv${enemyMon.level}`, x + w - 10, y + 8, {
    color: '#2A3646',
    scale: 1,
    align: 'right',
  });

  if (enemyMon.status) {
    drawStatusBadge(ctx, enemyMon.status, x + 12, y + 22);
    drawText(ctx, 'HP', x + 40, y + 24, { color: '#D87A28', scale: 1 });
    drawHpBar(ctx, x + 56, y + 23, w - 66, displayHp / Math.max(1, enemyMon.maxHp), tick);
  } else {
    drawText(ctx, 'HP', x + 12, y + 24, { color: '#D87A28', scale: 1 });
    drawHpBar(ctx, x + 28, y + 23, w - 38, displayHp / Math.max(1, enemyMon.maxHp), tick);
  }
}

/** Player Info Box (bottom-right, slides in from right edge + numeric HP + shimmering EXP bar). */
export function renderPlayerHud(
  ctx,
  playerMon,
  displayHp,
  displayExpRatio,
  { offsetX = 0, tick = 0, expShimmer = false } = {}
) {
  const x = 266 + offsetX;
  const y = 118;
  const w = 198;
  const h = 64;
  if (x > W + 8) return;

  const hpRatio = displayHp / Math.max(1, playerMon.maxHp);
  const lowPulse = hpRatio > 0 && hpRatio <= 0.2 ? Math.sin(tick * 0.25) * 0.5 + 0.5 : 0;

  drawRomHudPanel(ctx, x, y, w, h, lowPulse > 0.5 ? '#E8443C' : '#4C86A8');

  const pName = getPokemonDisplayName(playerMon);
  drawText(ctx, pName, x + 12, y + 8, {
    color: '#1E2634',
    shadow: '#DCE4EC',
    scale: 1,
  });
  const nameEnd = x + 14 + measureText(pName, 1);
  drawText(ctx, playerMon.gender || '♂', nameEnd + 2, y + 8, {
    color: playerMon.gender === '♀' ? '#E45C88' : '#3E84DC',
    scale: 1,
  });
  if (playerMon.isShiny) {
    drawText(ctx, '★', nameEnd + 11, y + 8, { color: '#E8A820', scale: 1 });
  }

  drawText(ctx, `Lv${playerMon.level}`, x + w - 10, y + 8, {
    color: '#2A3646',
    scale: 1,
    align: 'right',
  });

  drawText(ctx, 'HP', x + 12, y + 23, { color: '#D87A28', scale: 1 });
  drawHpBar(ctx, x + 28, y + 22, w - 38, hpRatio, tick);

  if (playerMon.status) {
    drawStatusBadge(ctx, playerMon.status, x + 12, y + 34);
  }

  // Real-time numeric HP count-down
  const shownHp = Math.max(0, Math.round(displayHp));
  drawText(ctx, `${shownHp}/${playerMon.maxHp}`, x + w - 10, y + 35, {
    color: hpRatio <= 0.2 ? '#C8322C' : '#222C3A',
    scale: 1,
    align: 'right',
  });

  // Shimmering EXP bar
  drawText(ctx, 'EXP', x + 12, y + 48, { color: '#3A74B4', scale: 1 });
  const ex = x + 36;
  const ey = y + 49;
  const ew = w - 46;
  ctx.fillStyle = '#242E3C';
  ctx.fillRect(ex, ey, ew, 6);
  ctx.fillStyle = '#404E60';
  ctx.fillRect(ex + 1, ey + 1, ew - 2, 4);

  const expW = Math.round((ew - 2) * Math.max(0, Math.min(1, displayExpRatio)));
  if (expW > 0) {
    ctx.fillStyle = '#3CB4F4';
    ctx.fillRect(ex + 1, ey + 1, expW, 4);
    ctx.fillStyle = '#9CE4FF';
    ctx.fillRect(ex + 1, ey + 1, expW, 1);

    // Traveling shimmer glint while EXP bar is filling
    if (expShimmer) {
      const glintX = ((tick * 4) % (expW + 24)) - 12;
      const gx0 = Math.max(0, glintX);
      const gx1 = Math.min(expW, glintX + 12);
      if (gx1 > gx0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(ex + 1 + gx0, ey + 1, gx1 - gx0, 4);
      }
    }
  }
}

/** 2x2 Main Battle Action Menu with animated bobbing cursor. */
export function renderMainActionMenu(ctx, playerMon, cursorIdx, tick = 0) {
  drawGbaBox(ctx, 20, 192, 234, 68, {
    fill: '#243044',
    outerBorder: '#141B28',
    accentBorder: '#507CA0',
    accentHighlight: '#88B8DC',
    innerBorder: '#1A2434',
  });
  drawText(ctx, 'What will', 36, 208, {
    color: '#F4F8FC',
    shadow: '#121824',
    scale: 2,
  });
  drawText(ctx, `${getPokemonDisplayName(playerMon)} do?`, 36, 230, {
    color: '#FFE078',
    shadow: '#121824',
    scale: 2,
  });

  drawGbaBox(ctx, 260, 192, 200, 68, {
    fill: '#FAFBFD',
    outerBorder: '#1E2634',
    accentBorder: '#4C86A8',
    accentHighlight: '#82BCE0',
    innerBorder: '#2C3A4C',
  });

  const items = [
    { label: 'FIGHT', x: 274, y: 208, accent: '#D84840' },
    { label: 'BAG', x: 374, y: 208, accent: '#D89634' },
    { label: 'POKéMON', x: 274, y: 234, accent: '#3E9A54' },
    { label: 'RUN', x: 374, y: 234, accent: '#447EC4' },
  ];

  const arrowBob = Math.round(Math.sin(tick * 0.2) * 1.5);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const sel = i === cursorIdx;
    if (sel) {
      ctx.fillStyle = '#E4F0FA';
      ctx.fillRect(it.x - 4, it.y - 4, 86, 18);
      drawText(ctx, '▶', it.x - 2 + arrowBob, it.y, {
        color: it.accent,
        scale: 1,
      });
    }
    drawText(ctx, it.label, it.x + 10, it.y, {
      color: sel ? '#182230' : '#4A5668',
      scale: 1,
    });
  }
}

/** 2x2 FIGHT Move Menu with type badges & PP turning yellow/red when low. */
export function renderFightMenu(ctx, playerMon, cursorIdx, tick = 0) {
  const moves = playerMon.moves || [];

  drawGbaBox(ctx, 20, 192, 294, 68, {
    fill: '#FAFBFD',
    outerBorder: '#1E2634',
    accentBorder: '#D85848',
    accentHighlight: '#F49888',
    innerBorder: '#2C3A4C',
  });

  const slots = [
    { x: 34, y: 208 },
    { x: 174, y: 208 },
    { x: 34, y: 234 },
    { x: 174, y: 234 },
  ];
  const arrowBob = Math.round(Math.sin(tick * 0.2) * 1.5);

  for (let i = 0; i < 4; i++) {
    const slot = moves[i];
    const pos = slots[i];
    const sel = i === cursorIdx;
    const label = slot ? getMove(slot.id).name : '-';

    if (sel) {
      ctx.fillStyle = '#FFE8DC';
      ctx.fillRect(pos.x - 4, pos.y - 4, 130, 18);
      drawText(ctx, '▶', pos.x - 2 + arrowBob, pos.y, {
        color: '#D84840',
        scale: 1,
      });
    }

    drawText(ctx, label, pos.x + 10, pos.y, {
      color: slot ? (sel ? '#182230' : '#3C4656') : '#9AA4B0',
      scale: 1,
    });
  }

  // Right move detail panel (PP with yellow/red low warning + Type Badge)
  drawGbaBox(ctx, 320, 192, 140, 68, {
    fill: '#FAFBFD',
    outerBorder: '#1E2634',
    accentBorder: '#4C86A8',
    accentHighlight: '#82BCE0',
    innerBorder: '#2C3A4C',
  });

  const activeSlot = moves[cursorIdx];
  if (activeSlot) {
    const def = getMove(activeSlot.id);
    const tc = getTypeColor(def.type);
    const ppRatio = activeSlot.pp / Math.max(1, activeSlot.maxPp);
    const ppColor =
      activeSlot.pp === 0 || ppRatio <= 0.25
        ? '#D83834'
        : ppRatio <= 0.5
          ? '#C88E18'
          : '#1E2634';

    drawText(ctx, 'PP', 334, 207, { color: '#5C6C7E', scale: 1 });
    drawText(ctx, `${activeSlot.pp}/${activeSlot.maxPp}`, 446, 207, {
      color: ppColor,
      scale: 1,
      align: 'right',
    });

    const badgeW = Math.max(70, measureText(def.type, 1) + 18);
    const bx = 334;
    const by = 228;
    ctx.fillStyle = tc.dark;
    ctx.fillRect(bx, by, badgeW, 18);
    ctx.fillStyle = tc.bg;
    ctx.fillRect(bx + 1, by + 1, badgeW - 2, 16);
    ctx.fillStyle = tc.light;
    ctx.fillRect(bx + 2, by + 1, badgeW - 4, 2);
    drawText(ctx, def.type, bx + badgeW / 2, by + 5, {
      color: '#FFFFFF',
      shadow: tc.dark,
      scale: 1,
      align: 'center',
    });
  }
}

/** Simple Party View Overlay (used in Battle POKéMON menu & Overworld Esc menu). */
export function renderPartyOverlay(ctx, party) {
  ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
  ctx.fillRect(0, 0, W, H);

  drawGbaBox(ctx, 44, 24, 392, 222, {
    fill: '#FAFBFD',
    outerBorder: '#1C2432',
    accentBorder: '#3E9A54',
    accentHighlight: '#7CE092',
    innerBorder: '#2C3A4C',
  });

  drawText(ctx, 'YOUR POKéMON PARTY', 64, 38, {
    color: '#2A6C3C',
    shadow: '#D8E8DC',
    scale: 2,
  });

  const mon = party && party[0];
  if (!mon) {
    drawText(ctx, 'No POKéMON in your party yet!', W / 2, 128, {
      color: '#505E6E',
      scale: 2,
      align: 'center',
    });
  } else {
    const px = 64;
    const py = 68;
    ctx.fillStyle = '#3E9A54';
    ctx.fillRect(px - 2, py - 2, 92, 92);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px, py, 88, 88);
    drawStarterSprite(ctx, mon, px + 4, py + 4, 80);

    const ix = 172;
    drawText(ctx, `${mon.name} ${mon.gender || '♂'}`, ix, 70, {
      color: '#1E2634',
      shadow: '#D4DCE4',
      scale: 2,
    });
    drawText(ctx, `Lv${mon.level}`, 416, 70, {
      color: '#2C4058',
      scale: 2,
      align: 'right',
    });

    drawText(ctx, 'HP', ix, 96, { color: '#D87A28', scale: 1 });
    drawHpBar(ctx, ix + 18, 95, 142, mon.currentHp / Math.max(1, mon.maxHp));
    drawText(ctx, `${mon.currentHp}/${mon.maxHp}`, 416, 96, {
      color: '#222C3A',
      scale: 1,
      align: 'right',
    });

    drawText(ctx, `ATK ${mon.stats.atk}   DEF ${mon.stats.def}   SPE ${mon.stats.spe}`, ix, 116, {
      color: '#3C4C5E',
      scale: 1,
    });
    drawText(ctx, `SPA ${mon.stats.spa}   SPD ${mon.stats.spd}`, ix, 130, {
      color: '#3C4C5E',
      scale: 1,
    });

    drawText(ctx, 'MOVES:', ix, 148, { color: '#586A7E', scale: 1 });
    (mon.moves || []).forEach((slot, idx) => {
      const def = getMove(slot.id);
      drawText(ctx, `${def.name}  ${slot.pp}/${slot.maxPp}`, ix, 162 + idx * 14, {
        color: '#222C3A',
        scale: 1,
      });
    });
  }

  drawText(ctx, 'PRESS X / Z / ESC TO CLOSE', W / 2, 224, {
    color: '#607084',
    scale: 1,
    align: 'center',
  });
}

/** Level-Up Stat Panel showing old → new stat values cleanly. */
export function renderLevelUpPanel(ctx, levelUpInfo) {
  if (!levelUpInfo) return;
  const x = 276;
  const y = 18;
  const w = 188;
  const h = 114;

  drawGbaBox(ctx, x, y, w, h, {
    fill: '#FAFBFD',
    outerBorder: '#1E2634',
    accentBorder: '#E6A832',
    accentHighlight: '#FFE084',
    innerBorder: '#2C3A4C',
  });

  drawText(ctx, `LEVEL UP! Lv${levelUpInfo.newLevel}`, x + w / 2, y + 10, {
    color: '#C87818',
    scale: 1,
    align: 'center',
  });

  const rows = [
    ['MAX HP', 'hp'],
    ['ATTACK', 'atk'],
    ['DEFENSE', 'def'],
    ['SP. ATK', 'spa'],
    ['SP. DEF', 'spd'],
    ['SPEED', 'spe'],
  ];

  for (let i = 0; i < rows.length; i++) {
    const [label, key] = rows[i];
    const oldVal = levelUpInfo.oldStats[key];
    const newVal = levelUpInfo.newStats[key];
    const changed = newVal > oldVal;
    const ry = y + 26 + i * 13;

    drawText(ctx, label, x + 12, ry, { color: '#384658', scale: 1 });
    drawText(ctx, `${oldVal}→${newVal}`, x + w - 12, ry, {
      color: changed ? '#288C46' : '#1E2634',
      scale: 1,
      align: 'right',
    });
  }
}

/** Move-Forget Selector Panel (when a Pokémon with 4 moves learns a new move). */
export function renderForgetMoveMenu(ctx, mon, newMoveId, cursorIdx, tick = 0) {
  ctx.fillStyle = 'rgba(10, 16, 28, 0.72)';
  ctx.fillRect(0, 0, W, H);

  drawGbaBox(ctx, 56, 30, 368, 206, {
    fill: '#FAFBFD',
    outerBorder: '#1C2432',
    accentBorder: '#D85848',
    accentHighlight: '#F49888',
    innerBorder: '#2C3A4C',
  });

  const newDef = getMove(newMoveId);
  drawText(ctx, `SELECT A MOVE TO FORGET FOR ${newDef.name}`, W / 2, 44, {
    color: '#A83228',
    scale: 1,
    align: 'center',
  });

  const moves = mon.moves || [];
  const arrowBob = Math.round(Math.sin(tick * 0.2) * 1.5);
  for (let i = 0; i < 4; i++) {
    const slot = moves[i];
    if (!slot) continue;
    const def = getMove(slot.id);
    const tc = getTypeColor(def.type);
    const ry = 68 + i * 28;
    const sel = i === cursorIdx;

    if (sel) {
      ctx.fillStyle = '#FFE8DC';
      ctx.fillRect(72, ry - 4, 336, 22);
      drawText(ctx, '▶', 76 + arrowBob, ry + 3, { color: '#D84840', scale: 1 });
    }

    drawText(ctx, def.name, 90, ry + 3, {
      color: sel ? '#182230' : '#3C4656',
      scale: 1,
    });

    ctx.fillStyle = tc.bg;
    ctx.fillRect(240, ry, 58, 14);
    drawText(ctx, def.type, 269, ry + 3, {
      color: '#FFFFFF',
      shadow: tc.dark,
      scale: 1,
      align: 'center',
    });

    drawText(ctx, `PP ${slot.pp}/${slot.maxPp}`, 396, ry + 3, {
      color: '#344456',
      scale: 1,
      align: 'right',
    });
  }

  // Option 4: Don't learn new move (Cancel)
  const cancelY = 186;
  const cancelSel = cursorIdx === 4;
  if (cancelSel) {
    ctx.fillStyle = '#E4EEF8';
    ctx.fillRect(72, cancelY - 4, 336, 20);
    drawText(ctx, '▶', 76 + arrowBob, cancelY + 2, { color: '#3868A8', scale: 1 });
  }
  drawText(ctx, `CANCEL (KEEP CURRENT MOVES)`, 90, cancelY + 2, {
    color: cancelSel ? '#182230' : '#586878',
    scale: 1,
  });

  drawText(ctx, 'Z: CONFIRM   X: CANCEL', W / 2, 218, {
    color: '#607084',
    scale: 1,
    align: 'center',
  });
}

export const NICKNAME_CHARS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-',
  'DEL', 'OK',
];

/** Clean GBA-style Nickname Entry Overlay (up to 10 characters). */
export function renderNicknamePanel(ctx, mon, text, cursorIdx, tick = 0) {
  ctx.fillStyle = 'rgba(10, 16, 28, 0.78)';
  ctx.fillRect(0, 0, W, H);

  drawGbaBox(ctx, 56, 24, 368, 222, {
    fill: '#FAFBFD',
    outerBorder: '#1C2432',
    accentBorder: '#4C86A8',
    accentHighlight: '#82BCE0',
    innerBorder: '#2C3A4C',
  });

  drawText(ctx, `NICKNAME FOR ${mon.name}`, W / 2, 38, {
    color: '#2A4C72',
    scale: 2,
    align: 'center',
  });

  // Current nickname box
  ctx.fillStyle = '#E6F0F8';
  ctx.fillRect(120, 62, 240, 24);
  ctx.strokeStyle = '#4C86A8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(120, 62, 240, 24);

  const cursorBlink = Math.floor(tick / 20) % 2 === 0 ? '_' : ' ';
  const shown = text.length < 10 ? `${text}${cursorBlink}` : text;
  drawText(ctx, shown, W / 2, 68, {
    color: '#182230',
    scale: 2,
    align: 'center',
  });

  // Letter grid (9 cols x 3 rows + DEL/OK bottom row)
  const cols = 9;
  for (let i = 0; i < 27; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const gx = 92 + col * 34;
    const gy = 102 + row * 28;
    const sel = i === cursorIdx;

    if (sel) {
      ctx.fillStyle = '#4C86A8';
      ctx.fillRect(gx - 8, gy - 4, 26, 20);
    }
    drawText(ctx, NICKNAME_CHARS[i], gx + 5, gy + 2, {
      color: sel ? '#FFFFFF' : '#243040',
      scale: 1,
      align: 'center',
    });
  }

  // DEL (index 27) & OK (index 28)
  const delSel = cursorIdx === 27;
  ctx.fillStyle = delSel ? '#D85848' : '#E6ECF2';
  ctx.fillRect(142, 190, 80, 22);
  drawText(ctx, 'DELETE', 182, 197, {
    color: delSel ? '#FFFFFF' : '#304050',
    scale: 1,
    align: 'center',
  });

  const okSel = cursorIdx === 28;
  ctx.fillStyle = okSel ? '#3E9A54' : '#E6ECF2';
  ctx.fillRect(258, 190, 80, 22);
  drawText(ctx, 'DONE', 298, 197, {
    color: okSel ? '#FFFFFF' : '#304050',
    scale: 1,
    align: 'center',
  });

  drawText(ctx, 'ARROWS: MOVE   Z: PICK   X: BACKSPACE', W / 2, 224, {
    color: '#607084',
    scale: 1,
    align: 'center',
  });
}
