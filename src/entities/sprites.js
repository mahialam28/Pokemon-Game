/**
 * Hand-authored Gen 3 GBA Overworld Character Sprites (16x32 frame, ~16x22 visible).
 * Compiled from pixel maps via src/gfx/pixelart.js — zero gradients, zero blur,
 * crisp colored 1px dark outlines, 3 shades per color, pixel-art ground shadow,
 * 4 directions x 3 frames (stand, step-left, step-right), periodic blink,
 * plus external 16x20 / 16x32 PNG spritesheet override support.
 */

import { drawBattleTrainerSprite, initBattleTrainers } from '../gfx/battleTrainers.js';
import { compilePixelMap } from '../gfx/pixelart.js';

const FRAME_W = 16;
const FRAME_H = 32;

// 10 rows of headroom so 16x22 character fits comfortably inside a classic 16x32 frame
const TOP_PAD = Array(10).fill('................');

// =========================================================================
// HAND-AUTHORED GEN 3 16x22 CHARACTER PIXEL MAPS (DOWN / UP / LEFT; RIGHT = FLIP)
// Legend:
//   0 = dark outline
//   h/H/a = hair shadow / base / highlight (or cap for hat wearers)
//   e = cap emblem / ribbon / glasses / necklace accent
//   k/s/S = skin shadow / base / highlight
//   w = white eye glint
//   t/T/i = top/jacket shadow / base / highlight
//   c = inner shirt / apron / scarf / collar
//   b/B = backpack shadow / highlight
//   p/P = pants/skirt shadow / base
//   f = shoes
// =========================================================================

// --- STANDARD TRAINER / ADULT BODY (PLAYER, RIVAL, PROF, AIDE, NEIGHBOUR) ---
const CHAR_DOWN_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHaHHHhhh0..',
  '..0HHeHHHHhhh0..',
  '..0h00000000h0..',
  '..0hkSSSSSSkh0..',
  '..0hs0wSSw0sh0..',
  '..0hs00SS00sh0..',
  '...0kssssssk0...',
  '....00kkkk00....',
  '...0iTTccTTt0...',
  '..0iTTicciTTt0..',
  '..0iTiTccTiTt0..',
  '..0st0TccT0ts0..',
  '..0000tttt0000..',
  '....0PP00PP0....',
  '....0PP00Pp0....',
  '....0pp00pp0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
];

const CHAR_DOWN_LEFT = [
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHaHHHhhh0..',
  '..0HHeHHHHhhh0..',
  '..0h00000000h0..',
  '..0hkSSSSSSkh0..',
  '..0hs0wSSw0sh0..',
  '..0hs00SS00sh0..',
  '...0kssssssk0...',
  '....00kkkk00....',
  '...0iTTccTTt0...',
  '..0iTTicciTTt0..',
  '..0st0TccTiTt0..',
  '..0000TccT0ts0..',
  '....0PP00tt00...',
  '....0ff00PP0....',
  '....00000pp0....',
  '........0ff0....',
  '........0000....',
  '................',
  '................',
];

const CHAR_UP_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHHHHhhh0..',
  '..0HHHHHHHHhh0..',
  '..0HHHHHHHHhh0..',
  '..0hHHHHHHhhh0..',
  '..0hhHHHHhhhh0..',
  '..0hhhHHhhhhh0..',
  '...0hhhhhhhh0...',
  '....00000000....',
  '...0iTTBBTTt0...',
  '..0iTTBBBBTTt0..',
  '..0iTiBbbBTiTt0.'.slice(0, 16),
  '..0st0bbbb0ts0..',
  '..0000tttt0000..',
  '....0PP00PP0....',
  '....0PP00Pp0....',
  '....0pp00pp0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
];

const CHAR_UP_LEFT = [
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHHHHhhh0..',
  '..0HHHHHHHHhh0..',
  '..0HHHHHHHHhh0..',
  '..0hHHHHHHhhh0..',
  '..0hhHHHHhhhh0..',
  '..0hhhHHhhhhh0..',
  '...0hhhhhhhh0...',
  '....00000000....',
  '...0iTTBBTTt0...',
  '..0iTTBBBBTTt0..',
  '..0st0BbbBTiTt0.'.slice(0, 16),
  '..0000bbbb0ts0..',
  '....0PP00tt00...',
  '....0ff00PP0....',
  '....00000pp0....',
  '........0ff0....',
  '........0000....',
  '................',
  '................',
];

const CHAR_LEFT_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0eeHHHHHhhh0..',
  '..00aHHHHHhhh0..',
  '...0kkHHHHhhh0..',
  '...0sSSHHHhhh0..',
  '...0w0SHHHhhh0..',
  '...000SHHHhh0...',
  '...0sssHHhh0....',
  '....00kkkk0.....',
  '....0ccTTBB0....',
  '....0cTTiBB0....',
  '....0cTiTbb0....',
  '....0tTsTbb0....',
  '.....0tttt0.....',
  '.....0PPPp0.....',
  '.....0PPPp0.....',
  '.....0pppp0.....',
  '....0ffff0......',
  '....000000......',
  '................',
  '................',
];

const CHAR_LEFT_STEP1 = [
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0eeHHHHHhhh0..',
  '..00aHHHHHhhh0..',
  '...0kkHHHHhhh0..',
  '...0sSSHHHhhh0..',
  '...0w0SHHHhhh0..',
  '...000SHHHhh0...',
  '...0sssHHhh0....',
  '....00kkkk0.....',
  '....0ccTTBB0....',
  '...0sTiTTBB0....',
  '...00TTiTbb0....',
  '.....0tttt0.....',
  '....0PP00PP0....',
  '...0PP0..0pp0...',
  '...0ff0...0ff0..',
  '...0000...0000..',
  '................',
  '................',
  '................',
];

const CHAR_LEFT_STEP2 = [
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0eeHHHHHhhh0..',
  '..00aHHHHHhhh0..',
  '...0kkHHHHhhh0..',
  '...0sSSHHHhhh0..',
  '...0w0SHHHhhh0..',
  '...000SHHHhh0...',
  '...0sssHHhh0....',
  '....00kkkk0.....',
  '....0ccTTBB0....',
  '.....0cTiTBB0...',
  '.....0tTTsbb0...',
  '.....0tttt0.....',
  '....0pp00PP0....',
  '....0pp0.0PP0...',
  '....0ff0.0ff0...',
  '....0000.0000...',
  '................',
  '................',
  '................',
];

// --- SPIKY RIVAL VARIANT (DISTINCT SPIKY HAIR SILHOUETTE + GOLD NECKLACE) ---
const RIVAL_DOWN_STAND = [
  '...0000000000...',
  '..0aaHHaHHhhh0..',
  '.0aHHaHHHHhHhh0.',
  '.00hHHHHHHhh000.',
  '..0hkSSSSSSkh0..',
  '..0hs0wSSw0sh0..',
  '..0hs00SS00sh0..',
  '...0kssssssk0...',
  '....00kekk00....',
  '...0iTTccTTt0...',
  '..0iTTceecTTt0..',
  '..0iTiTccTiTt0..',
  '..0st0TccT0ts0..',
  '..0000tttt0000..',
  '....0PP00PP0....',
  '....0PP00Pp0....',
  '....0pp00pp0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
  '................',
];

// --- JOLLY FAT MAN NPC (WIDER ROUND SILHOUETTE!) ---
const FATMAN_DOWN_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHHHHhhh0..',
  '..0hkSSSSSSkh0..',
  '..0hs0wSSw0sh0..',
  '..0hs00SS00sh0..',
  '...0kssssssk0...',
  '..0000kkkk0000..',
  '.0iTTTTccTTTTt0.',
  '0iTTTTTccTTTTTt0',
  '0iTiTTTccTTTiTt0',
  '0sT0TTTccTTT0Ts0',
  '0000TTTTTTTT0000',
  '.0tttttttttttt0.',
  '..0PPPP00PPPP0..',
  '..0pppp00pppp0..',
  '..0fff0..0fff0..',
  '..00000..00000..',
  '................',
  '................',
  '................',
  '................',
];

const FATMAN_UP_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHHHHhhh0..',
  '..0HHHHHHHHhh0..',
  '..0hHHHHHHhhh0..',
  '..0hhhHHhhhhh0..',
  '...0hhhhhhhh0...',
  '..000000000000..',
  '.0iTTTTTTTTTTt0.',
  '0iTTTTTTTTTTTTt0',
  '0iTiTTTTTTTTiTt0',
  '0sT0TTTTTTTT0Ts0',
  '0000TTTTTTTT0000',
  '.0tttttttttttt0.',
  '..0PPPP00PPPP0..',
  '..0pppp00pppp0..',
  '..0fff0..0fff0..',
  '..00000..00000..',
  '................',
  '................',
  '................',
  '................',
];

const FATMAN_LEFT_STAND = [
  '....00000000....',
  '...0aaaHHhhh0...',
  '...0aHHHHHhhh0..',
  '...0kkHHHHhhh0..',
  '...0sSSHHHhhh0..',
  '...0w0SHHHhh0...',
  '...000SHHHh0....',
  '...0sssHHh0.....',
  '..000kkkk000....',
  '.0ccTTTTTTTt0...',
  '0ccTTTTiTTTTt0..',
  '0cTTTTTiTTTTt0..',
  '0tTTTTTsTTTTt0..',
  '.0tttttttttt0...',
  '..0PPPPPPPP0....',
  '..0pppppppp0....',
  '...0ffffff0.....',
  '...00000000.....',
  '................',
  '................',
  '................',
  '................',
];

// --- LITTLE KID NPC (SHORTER CHIBI PROPORTIONS ~18PX TALL!) ---
const KID_DOWN_STAND = [
  '................',
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHeHHhhh0..',
  '..0h00000000h0..',
  '..0hkSSSSSSkh0..',
  '..0hs0wSSw0sh0..',
  '..0hs00SS00sh0..',
  '...0kssssssk0...',
  '....00kkkk00....',
  '...0iTTccTTt0...',
  '..0sTiTccTiTs0..',
  '..0000tttt0000..',
  '....0PP00PP0....',
  '....0ss00ss0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
  '................',
  '................',
];

const KID_UP_STAND = [
  '................',
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0aHHHHHHhhh0..',
  '..0HHHHHHHHhh0..',
  '..0hHHHHHHhhh0..',
  '..0hhHHHHhhhh0..',
  '..0hhhHHhhhhh0..',
  '...0hhhhhhhh0...',
  '....00000000....',
  '...0iTTTTTTt0...',
  '..0sTiTTTTiTs0..',
  '..0000tttt0000..',
  '....0PP00PP0....',
  '....0ss00ss0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
  '................',
  '................',
];

const KID_LEFT_STAND = [
  '................',
  '................',
  '....00000000....',
  '...0aaaHHhhh0...',
  '..0eeHHHHHhhh0..',
  '...0kkHHHHhhh0..',
  '...0sSSHHHhhh0..',
  '...0w0SHHHhh0...',
  '...000SHHHh0....',
  '...0sssHHh0.....',
  '....00kkkk0.....',
  '....0ccTTTt0....',
  '....0tTiTTt0....',
  '....0tTsTTt0....',
  '.....0PPPP0.....',
  '.....0ssss0.....',
  '....0ffff0......',
  '....000000......',
  '................',
  '................',
  '................',
  '................',
];

// --- CHARACTER PALETTES (3 SHADES PER COLOR + COLORED DARK OUTLINE) ---
const CHAR_PALETTES = {
  player: {
    '0': '#201C2C',
    'h': '#1C3C84', 'H': '#2C64C4', 'a': '#649CF4', // Cobalt cap/bandana
    'e': '#F8D454', // Gold cap emblem
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#8C2428', 'T': '#D84040', 'i': '#F4746C', // Red/black sporty jacket
    'c': '#242834', // Dark inner zip/trim
    'b': '#985E20', 'B': '#E8A848', // Adventure backpack on back/side
    'p': '#222E48', 'P': '#384C70',
    'f': '#28303E',
  },
  rival: {
    '0': '#20182C',
    'h': '#64381E', 'H': '#9C5C30', 'a': '#D48C4E', // Spiky light-brown hair
    'e': '#F8D454', // Gold necklace pendant
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#34266C', 'T': '#5644A4', 'i': '#8270D4', // Purple jacket
    'c': '#389CA4', // Teal accent collar/shirt
    'b': '#34266C', 'B': '#5644A4',
    'p': '#1E2230', 'P': '#343C50',
    'f': '#282C38',
  },
  mom: {
    '0': '#2C1C24',
    'h': '#5C2C18', 'H': '#8E4828', 'a': '#C47244', // Brown hair in bun
    'e': '#F4D478', // Hair ribbon
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#A84458', 'T': '#E07084', 'i': '#FA9EB0', // Rose dress
    'c': '#FAF6EE', // Crisp white apron!
    'b': '#FAF6EE', 'B': '#E07084',
    'p': '#344268', 'P': '#506494',
    'f': '#5C3A28',
  },
  prof: {
    '0': '#202630',
    'h': '#647080', 'H': '#98A4B4', 'a': '#D8E0E8', // Grey hair
    'e': '#C8D4E0',
    'k': '#CE9670', 's': '#F0C49E', 'S': '#FCE0C0',
    'w': '#FFFFFF',
    't': '#B8C6D4', 'T': '#EEF4F8', 'i': '#FFFFFF', // White lab coat
    'c': '#784828', // Brown collared shirt underneath!
    'b': '#C4D0DC', 'B': '#EEF4F8',
    'p': '#2C3440', 'P': '#485466',
    'f': '#282E38',
  },
  aide: {
    '0': '#202430',
    'h': '#34241C', 'H': '#583E2E', 'a': '#846048',
    'e': '#78C8F0', // Glasses glint accent
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#98B8D0', 'T': '#DCECF8', 'i': '#F6FAFF', // Lab coat
    'c': '#3C78AC',
    'b': '#B8D0E4', 'B': '#DCECF8',
    'p': '#283444', 'P': '#405068',
    'f': '#28303C',
  },
  neighbour: {
    '0': '#202624',
    'h': '#44301E', 'H': '#6E4E32', 'a': '#9C744E',
    'e': '#F4E4B4',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#346834', 'T': '#54984C', 'i': '#88CC78',
    'c': '#F8F0D8',
    'b': '#346834', 'B': '#54984C',
    'p': '#303C4C', 'P': '#4C5C74',
    'f': '#4E3828',
  },
  fatMan: {
    '0': '#202430',
    'h': '#3A2A20', 'H': '#624634', 'a': '#8E6A50',
    'e': '#624634',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#2C588C', 'T': '#4C84C0', 'i': '#7EB4E8',
    'c': '#F4E8C8',
    'b': '#2C588C', 'B': '#4C84C0',
    'p': '#4C3C2C', 'P': '#745C44',
    'f': '#342820',
  },
  girl: {
    '0': '#2A1C28',
    'h': '#983848', 'H': '#D85868', 'a': '#F89098', // Bright coral hair
    'e': '#FFE058', // Sunny hair bow
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#C89420', 'T': '#F0C848', 'i': '#FFE888', // Sunny yellow dress
    'c': '#FAF8F0',
    'b': '#C89420', 'B': '#F0C848',
    'p': '#3E8848', 'P': '#5CB464',
    'f': '#C84848',
  },
  kid: {
    '0': '#20222E',
    'h': '#246848', 'H': '#3CA468', 'a': '#74D898', // Green backwards cap
    'e': '#FFE058',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#C85828', 'T': '#F0843C', 'i': '#FFB468', // Bright orange tee
    'c': '#FFF8E8',
    'b': '#C85828', 'B': '#F0843C',
    'p': '#2C4470', 'P': '#4468A4',
    'f': '#D84040',
  },
};

/** Helper to turn a 22-row map into a blink version (replaces eye glint with outline). */
function makeBlinkRows(rows) {
  return rows.map((r) => r.replaceAll('w', '0'));
}

/** Shift a 22-row sprite down 1px for crisp walk step-bob animation on custom NPCs. */
function makeStepBobRows(rows) {
  return ['................', ...rows.slice(0, rows.length - 1)];
}

const spriteCache = new Map();

function compileFramed(rows22, pal, { flipX = false } = {}) {
  const full32 = [...TOP_PAD, ...rows22];
  return compilePixelMap(full32, pal, { flipX });
}

/** Pre-compile all Gen 3 16x32 pixel-map characters + 64x64 battle trainers. */
export function initSprites() {
  if (spriteCache.size > 0) return;

  for (const [key, pal] of Object.entries(CHAR_PALETTES)) {
    let down0 = CHAR_DOWN_STAND;
    let down1 = CHAR_DOWN_LEFT;
    let up0 = CHAR_UP_STAND;
    let up1 = CHAR_UP_LEFT;
    let left0 = CHAR_LEFT_STAND;
    let left1 = CHAR_LEFT_STEP1;
    let left2 = CHAR_LEFT_STEP2;

    if (key === 'rival') {
      down0 = RIVAL_DOWN_STAND;
      down1 = makeStepBobRows(RIVAL_DOWN_STAND);
    } else if (key === 'fatMan') {
      down0 = FATMAN_DOWN_STAND;
      down1 = makeStepBobRows(FATMAN_DOWN_STAND);
      up0 = FATMAN_UP_STAND;
      up1 = makeStepBobRows(FATMAN_UP_STAND);
      left0 = FATMAN_LEFT_STAND;
      left1 = makeStepBobRows(FATMAN_LEFT_STAND);
      left2 = FATMAN_LEFT_STAND;
    } else if (key === 'kid') {
      down0 = KID_DOWN_STAND;
      down1 = makeStepBobRows(KID_DOWN_STAND);
      up0 = KID_UP_STAND;
      up1 = makeStepBobRows(KID_UP_STAND);
      left0 = KID_LEFT_STAND;
      left1 = makeStepBobRows(KID_LEFT_STAND);
      left2 = KID_LEFT_STAND;
    }

    // Add crisp glasses pixel rim onto Aide's front/side frames
    const applyAideGlasses = (rows) => {
      if (key !== 'aide') return rows;
      return rows.map((line, idx) =>
        idx === 6 || idx === 7 ? line.replaceAll('0w', 'ew').replaceAll('w0', 'we') : line
      );
    };

    const dStand = compileFramed(applyAideGlasses(down0), pal);
    const dLeft = compileFramed(applyAideGlasses(down1), pal);
    const dRight = compileFramed(applyAideGlasses(down1), pal, { flipX: true });

    const uStand = compileFramed(up0, pal);
    const uLeft = compileFramed(up1, pal);
    const uRight = compileFramed(up1, pal, { flipX: true });

    const lStand = compileFramed(left0, pal);
    const lStep1 = compileFramed(left1, pal);
    const lStep2 = compileFramed(left2, pal);

    const rStand = compileFramed(left0, pal, { flipX: true });
    const rStep1 = compileFramed(left1, pal, { flipX: true });
    const rStep2 = compileFramed(left2, pal, { flipX: true });

    spriteCache.set(key, {
      w: FRAME_W,
      h: FRAME_H,
      // 4-slot cycle: [stand, step-left, stand, step-right]
      down: [dStand, dLeft, dStand, dRight],
      up: [uStand, uLeft, uStand, uRight],
      left: [lStand, lStep1, lStand, lStep2],
      right: [rStand, rStep1, rStand, rStep2],
      blink: {
        down: compileFramed(makeBlinkRows(down0), pal),
        left: compileFramed(makeBlinkRows(left0), pal),
        right: compileFramed(makeBlinkRows(left0), pal, { flipX: true }),
      },
    });
  }

  initBattleTrainers();
}

/** External PNG spritesheet override (supports 16x20 and 16x32 top-padded sheets). */
export function registerExternalCharacter(charKey, img, cfg = {}) {
  if (!img || !img.naturalWidth) return;
  const fw = cfg.frameWidth || 16;
  const fh = cfg.frameHeight || 32;
  const cols = cfg.frames || Math.max(3, Math.floor(img.naturalWidth / fw));
  const rowOrder = cfg.rowOrder || ['down', 'up', 'left', 'right'];

  const entry = { w: fw, h: fh, blink: {} };
  for (let row = 0; row < rowOrder.length; row++) {
    const dir = rowOrder[row];
    const sliceFrame = (col) => {
      const c = document.createElement('canvas');
      c.width = fw;
      c.height = fh;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, col * fw, row * fh, fw, fh, 0, 0, fw, fh);
      return c;
    };

    if (cols >= 4) {
      entry[dir] = [sliceFrame(0), sliceFrame(1), sliceFrame(2), sliceFrame(3)];
    } else {
      const fLeft = sliceFrame(0);
      const fStand = sliceFrame(1);
      const fRight = sliceFrame(2);
      entry[dir] = [fStand, fLeft, fStand, fRight];
    }
  }
  spriteCache.set(charKey, entry);
}

/**
 * Crisp Gen 3 pixel-art character shadow (small 2-3px dark pixel oval, NO blur/arc).
 */
export function drawCharacterShadow(ctx, px, py) {
  const x = Math.round(px);
  const y = Math.round(py);
  ctx.fillStyle = 'rgba(20, 28, 24, 0.36)';
  ctx.fillRect(x + 4, y + 13, 8, 1);
  ctx.fillRect(x + 3, y + 14, 10, 1);
  ctx.fillRect(x + 4, y + 15, 8, 1);
}

/**
 * Draw a 16x32 Gen 3 character bottom-aligned to tile (px, py) with optional jump height.
 */
export function drawCharacter(
  ctx,
  spriteKey,
  dir,
  frame,
  px,
  py,
  { idle = false, blinking = false, jumpY = 0 } = {}
) {
  const entry = spriteCache.get(spriteKey) || spriteCache.get('player');
  if (!entry) return;
  const frames = entry[dir] || entry.down;

  let canvas = frames[frame % frames.length];
  if (idle && blinking && frame === 0 && entry.blink && entry.blink[dir]) {
    canvas = entry.blink[dir];
  }

  const drawX = Math.round(px + (16 - entry.w) / 2);
  const drawY = Math.round(py + (16 - entry.h) + 2 - jumpY);
  ctx.drawImage(canvas, drawX, drawY);
}

/** Draw hand-authored Gen 3 ~64x64 battle trainer sprite (supports 4-frame throw animation). */
export function drawBattleTrainer(ctx, which, centerX, bottomY, scale = 1.65, frame = 0) {
  drawBattleTrainerSprite(ctx, which, centerX, bottomY, { scale, frame });
}

// Crisp pixel-map Poké Ball sitting on the lab table
const MAP_POKEBALL = [
  '..000000..',
  '.0RRRRRR0.',
  '0RRwRRRRr0',
  '0RRRRRRrr0',
  '0000ww0000',
  '0000ww0000',
  '0WWWWWWWW0',
  '0WWWWWWww0',
  '.0wwwwww0.',
  '..000000..',
];
const PAL_POKEBALL = {
  '0': '#201C28',
  'R': '#E84038',
  'r': '#B82828',
  'w': '#D0D8E4',
  'W': '#F8FAFC',
};
let pokeBallCanvas = null;

export function drawPokeBall(ctx, tilePx, tilePy) {
  if (!pokeBallCanvas) {
    pokeBallCanvas = compilePixelMap(MAP_POKEBALL, PAL_POKEBALL);
  }
  const x = Math.round(tilePx + 3);
  const y = Math.round(tilePy + 1);
  ctx.fillStyle = 'rgba(20, 28, 36, 0.3)';
  ctx.fillRect(x + 2, y + 9, 6, 1);
  ctx.drawImage(pokeBallCanvas, x, y);
}

/** Crisp Gen 3 pixel-art "!" alert bubble above a character. */
export function drawAlertBubble(ctx, tilePx, tilePy) {
  const x = Math.round(tilePx + 2);
  const y = Math.round(tilePy - 20);

  ctx.fillStyle = '#202430';
  ctx.fillRect(x + 1, y, 10, 12);
  ctx.fillRect(x, y + 1, 12, 10);
  ctx.fillRect(x + 5, y + 12, 2, 2);

  ctx.fillStyle = '#F8F8F8';
  ctx.fillRect(x + 1, y + 1, 10, 10);

  ctx.fillStyle = '#E03838';
  ctx.fillRect(x + 5, y + 2, 2, 5);
  ctx.fillRect(x + 5, y + 8, 2, 2);
}
