/**
 * Hand-authored Gen 3 GBA Overworld Character Sprites (16x32 frame, ~22px visible).
 * Slimmed classic GBA proportions: narrower 10-11px torso & shoulders, slim arms/legs,
 * compact cute head, colored 1px dark outlines, 3 shades per color, pixel-art ground shadow,
 * 4 directions x 3 frames (stand, step-left, step-right), periodic blink,
 * plus external 16x20 / 16x32 PNG spritesheet override support.
 */

import { drawBattleTrainerSprite, initBattleTrainers } from '../gfx/battleTrainers.js';
import { compilePixelMap } from '../gfx/pixelart.js';

const FRAME_W = 16;
const FRAME_H = 32;
const TOP_PAD = Array(10).fill('................');

// =========================================================================
// SLIM GEN 3 16x22 CHARACTER PIXEL MAPS (10-11px torso/shoulders, slim limbs)
// =========================================================================

const CHAR_DOWN_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHaHHhh0...',
  '...0HHeHHHhh0...',
  '...0h000000h0...',
  '...0hSSSSSSh0...',
  '...0h0wSSw0h0...',
  '...0h00SS00h0...',
  '....0kssssk0....',
  '.....00kk00.....',
  '....0iTccTt0....',
  '...0iTicciTt0...',
  '...0iT0cc0Tt0...',
  '...0s0TccT0s0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0P00p0.....',
  '.....0p00p0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
];

const CHAR_DOWN_LEFT = [
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHaHHhh0...',
  '...0HHeHHHhh0...',
  '...0h000000h0...',
  '...0hSSSSSSh0...',
  '...0h0wSSw0h0...',
  '...0h00SS00h0...',
  '....0kssssk0....',
  '.....00kk00.....',
  '....0iTccTt0....',
  '...0s0icciTt0...',
  '...000TccT0s0...',
  '....00tttt000...',
  '.....0P00P0.....',
  '.....0f00P0.....',
  '.....0000p0.....',
  '.........0f0....',
  '.........000....',
  '................',
  '................',
];

const CHAR_UP_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0hHHHHHhh0...',
  '...0hhHHHhhh0...',
  '...0hhhHhhhh0...',
  '....0hhhhhh0....',
  '.....000000.....',
  '....0iTBBTt0....',
  '...0iTBBBBTt0...',
  '...0iT0bb0Tt0...',
  '...0s0bbbb0s0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0P00p0.....',
  '.....0p00p0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
];

const CHAR_UP_LEFT = [
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0hHHHHHhh0...',
  '...0hhHHHhhh0...',
  '...0hhhHhhhh0...',
  '....0hhhhhh0....',
  '.....000000.....',
  '....0iTBBTt0....',
  '...0s0BBBBTt0...',
  '...000bbbb0s0...',
  '....00tttt000...',
  '.....0P00P0.....',
  '.....0f00P0.....',
  '.....0000p0.....',
  '.........0f0....',
  '.........000....',
  '................',
  '................',
];

const CHAR_LEFT_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '...0eeHHHHhh0...',
  '...00aHHHHhh0...',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHhh0...',
  '....000SHHh0....',
  '....0ssHHh0.....',
  '.....00kk0......',
  '.....0cTTB0.....',
  '.....0cTiB0.....',
  '.....0cTiB0.....',
  '.....0tTsb0.....',
  '......0tt0......',
  '......0PP0......',
  '......0Pp0......',
  '......0pp0......',
  '.....0fff0......',
  '.....00000......',
  '................',
  '................',
];

const CHAR_LEFT_STEP1 = [
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0eeHHHHhh0...',
  '...00aHHHHhh0...',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHhh0...',
  '....000SHHh0....',
  '....0ssHHh0.....',
  '.....00kk0......',
  '.....0cTTB0.....',
  '....0sTiTB0.....',
  '....00TTib0.....',
  '......0tt0......',
  '.....0P00P0.....',
  '....0P0..0p0....',
  '....0f0...0f0...',
  '....000...000...',
  '................',
  '................',
  '................',
];

const CHAR_LEFT_STEP2 = [
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0eeHHHHhh0...',
  '...00aHHHHhh0...',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHhh0...',
  '....000SHHh0....',
  '....0ssHHh0.....',
  '.....00kk0......',
  '.....0cTTB0.....',
  '......0cTB0.....',
  '......0tTs0.....',
  '......0tt0......',
  '.....0p00P0.....',
  '.....0p0.0P0....',
  '.....0f0.0f0....',
  '.....000.000....',
  '................',
  '................',
  '................',
];


// --- SPIKY RIVAL VARIANT (SLIM + SPIKY HAIR + GOLD NECKLACE) ---
const RIVAL_DOWN_STAND = [
  '....00000000....',
  '...0aaHaHHhh0...',
  '..0aHaHHHhHhh0..',
  '..00hHHHHHh000..',
  '...0hSSSSSSh0...',
  '...0h0wSSw0h0...',
  '...0h00SS00h0...',
  '....0kssssk0....',
  '.....00ke00.....',
  '....0iTccTt0....',
  '...0iTceecTt0...',
  '...0iT0cc0Tt0...',
  '...0s0TccT0s0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0P00p0.....',
  '.....0p00p0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
  '................',
];

const RIVAL_UP_STAND = [
  '....00000000....',
  '...0aaHaHHhh0...',
  '..0aHaHHHhHhh0..',
  '..00hHHHHHh000..',
  '...0hHHHHHHh0...',
  '...0hHHHHHHh0...',
  '...0hhHHHHhh0...',
  '...0hhhHHhhh0...',
  '....0hhhhhh0....',
  '.....000000.....',
  '....0iTBBTt0....',
  '...0iTBBBBTt0...',
  '...0iT0bb0Tt0...',
  '...0s0bbbb0s0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0P00p0.....',
  '.....0p00p0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
];

const RIVAL_LEFT_STAND = [
  '....000000......',
  '...0aaHaHhh0....',
  '..0aHaHHHhHh0...',
  '..00hHHHHhh0....',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHhh0...',
  '....000SHHh0....',
  '....0ssHHh0.....',
  '.....00kk0......',
  '.....0cTTB0.....',
  '.....0cTiB0.....',
  '.....0cTiB0.....',
  '.....0tTsb0.....',
  '......0tt0......',
  '......0PP0......',
  '......0Pp0......',
  '......0pp0......',
  '.....0fff0......',
  '.....00000......',
  '................',
  '................',
];

// --- FRIENDLY TECH FAN NPC (SLIGHTLY ROUNDER THAN TRAINER, STILL COMPACT ~12px)
const FATMAN_DOWN_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHHHHhh0...',
  '...0hSSSSSSh0...',
  '...0h0wSSw0h0...',
  '...0h00SS00h0...',
  '....0kssssk0....',
  '...0000kk0000...',
  '..0iTTTccTTTt0..',
  '..0iTiTccTiTt0..',
  '..0sT0TccT0Ts0..',
  '..000TTTTTT000..',
  '...0tttttttt0...',
  '....0PP00PP0....',
  '....0pp00pp0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const FATMAN_UP_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0hhHHHhhh0...',
  '....0hhhhhh0....',
  '...0000000000...',
  '..0iTTTTTTTTt0..',
  '..0iTiTTTTiTt0..',
  '..0sT0TTTT0Ts0..',
  '..000TTTTTT000..',
  '...0tttttttt0...',
  '....0PP00PP0....',
  '....0pp00pp0....',
  '....0ff00ff0....',
  '....00000000....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const FATMAN_LEFT_STAND = [
  '.....000000.....',
  '....0aaHHhh0....',
  '....0aHHHHhh0...',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHh0....',
  '....000SHh0.....',
  '....0ssHH0......',
  '...000kk000.....',
  '..0ccTTTTTt0....',
  '..0cTTiTTTt0....',
  '..0tTTsTTTt0....',
  '...0tttttt0.....',
  '....0PPPP0......',
  '....0pppp0......',
  '....0ffff0......',
  '....000000......',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// --- LITTLE KID NPC (SLIM & COMPACT ~18px TALL) ---
const KID_DOWN_STAND = [
  '................',
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHeHHhh0...',
  '...0h000000h0...',
  '...0hSSSSSSh0...',
  '...0h0wSSw0h0...',
  '...0h00SS00h0...',
  '....0kssssk0....',
  '.....00kk00.....',
  '....0iTccTt0....',
  '...0sTiTccTs0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0s00s0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
  '................',
  '................',
];

const KID_UP_STAND = [
  '................',
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0aHHHHHhh0...',
  '...0HHHHHHhh0...',
  '...0hHHHHHhh0...',
  '...0hhHHHhhh0...',
  '....0hhhhhh0....',
  '.....000000.....',
  '....0iTTTTt0....',
  '...0sTiTTiTs0...',
  '...000tttt000...',
  '.....0P00P0.....',
  '.....0s00s0.....',
  '.....0f00f0.....',
  '.....000000.....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const KID_LEFT_STAND = [
  '................',
  '................',
  '.....000000.....',
  '....0aaHHhh0....',
  '...0eeHHHHhh0...',
  '....0kHHHHhh0...',
  '....0SSHHHhh0...',
  '....0w0SHHh0....',
  '....000SHh0.....',
  '....0ssHH0......',
  '.....00kk0......',
  '.....0cTTt0.....',
  '.....0tTit0.....',
  '.....0tTst0.....',
  '......0PP0......',
  '......0ss0......',
  '.....0fff0......',
  '.....00000......',
  '................',
  '................',
  '................',
  '................',
];

const CHAR_PALETTES = {
  player: {
    '0': '#201C2C',
    'h': '#1C3C84', 'H': '#2C64C4', 'a': '#649CF4',
    'e': '#F8D454',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#8C2428', 'T': '#D84040', 'i': '#F4746C',
    'c': '#242834',
    'b': '#985E20', 'B': '#E8A848',
    'p': '#222E48', 'P': '#384C70',
    'f': '#28303E',
  },
  rival: {
    '0': '#20182C',
    'h': '#64381E', 'H': '#9C5C30', 'a': '#D48C4E',
    'e': '#F8D454',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#34266C', 'T': '#5644A4', 'i': '#8270D4',
    'c': '#389CA4',
    'b': '#34266C', 'B': '#5644A4',
    'p': '#1E2230', 'P': '#343C50',
    'f': '#282C38',
  },
  mom: {
    '0': '#2C1C24',
    'h': '#5C2C18', 'H': '#8E4828', 'a': '#C47244',
    'e': '#F4D478',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#A84458', 'T': '#E07084', 'i': '#FA9EB0',
    'c': '#FAF6EE',
    'b': '#FAF6EE', 'B': '#E07084',
    'p': '#344268', 'P': '#506494',
    'f': '#5C3A28',
  },
  prof: {
    '0': '#202630',
    'h': '#647080', 'H': '#98A4B4', 'a': '#D8E0E8',
    'e': '#C8D4E0',
    'k': '#CE9670', 's': '#F0C49E', 'S': '#FCE0C0',
    'w': '#FFFFFF',
    't': '#B8C6D4', 'T': '#EEF4F8', 'i': '#FFFFFF',
    'c': '#784828',
    'b': '#C4D0DC', 'B': '#EEF4F8',
    'p': '#2C3440', 'P': '#485466',
    'f': '#282E38',
  },
  aide: {
    '0': '#202430',
    'h': '#34241C', 'H': '#583E2E', 'a': '#846048',
    'e': '#78C8F0',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#98B8D0', 'T': '#DCECF8', 'i': '#F6FAFF',
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
    'h': '#983848', 'H': '#D85868', 'a': '#F89098',
    'e': '#FFE058',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#C89420', 'T': '#F0C848', 'i': '#FFE888',
    'c': '#FAF8F0',
    'b': '#C89420', 'B': '#F0C848',
    'p': '#3E8848', 'P': '#5CB464',
    'f': '#C84848',
  },
  kid: {
    '0': '#20222E',
    'h': '#246848', 'H': '#3CA468', 'a': '#74D898',
    'e': '#FFE058',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#C85828', 'T': '#F0843C', 'i': '#FFB468',
    'c': '#FFF8E8',
    'b': '#C85828', 'B': '#F0843C',
    'p': '#2C4470', 'P': '#4468A4',
    'f': '#D84040',
  },
  // Phase 3 new NPCs: Nurse Joy, Mart Clerk, Resting Old Man
  nurse: {
    '0': '#2C1C28',
    'h': '#C45478', 'H': '#F48CA8', 'a': '#FFC4D4', // Pink hair & cap
    'e': '#FFFFFF', // Nurse cap cross emblem
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#E07898', 'T': '#FFB0C8', 'i': '#FFDCE8', // Pink/white nurse uniform
    'c': '#FFFFFF',
    'b': '#FFFFFF', 'B': '#FFB0C8',
    'p': '#D87090', 'P': '#F8A0BC',
    'f': '#E06888',
  },
  clerk: {
    '0': '#1C2434',
    'h': '#2C2838', 'H': '#48445C', 'a': '#706C88',
    'e': '#FFFFFF',
    'k': '#D89C74', 's': '#F8CCA4', 'S': '#FFE4C4',
    'w': '#FFFFFF',
    't': '#244C8C', 'T': '#3C78CC', 'i': '#6CA8F4', // Poké Mart blue vest
    'c': '#F8FAFC',
    'b': '#244C8C', 'B': '#3C78CC',
    'p': '#202C44', 'P': '#34486C',
    'f': '#242A36',
  },
  oldMan: {
    '0': '#242228',
    'h': '#889098', 'H': '#B8C0C8', 'a': '#E4ECF0', // Silver-white hair
    'e': '#E4ECF0',
    'k': '#C89270', 's': '#ECC09C', 'S': '#FAE0C0',
    'w': '#FFFFFF',
    't': '#5C4430', 'T': '#8C6A4C', 'i': '#B4906E', // Cozy brown coat
    'c': '#E4DCC8',
    'b': '#5C4430', 'B': '#8C6A4C',
    'p': '#383430', 'P': '#58524C',
    'f': '#342820',
  },
};

function makeBlinkRows(rows) {
  return rows.map((r) => r.replaceAll('w', '0'));
}

function makeStepBobRows(rows) {
  return ['................', ...rows.slice(0, rows.length - 1)];
}

const spriteCache = new Map();

function compileFramed(rows22, pal, { flipX = false } = {}) {
  return compilePixelMap([...TOP_PAD, ...rows22], pal, { flipX });
}

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
      up0 = RIVAL_UP_STAND;
      up1 = makeStepBobRows(RIVAL_UP_STAND);
      left0 = RIVAL_LEFT_STAND;
      left1 = makeStepBobRows(RIVAL_LEFT_STAND);
      left2 = RIVAL_LEFT_STAND;
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

/** Crisp Gen 3 pixel-art shadow (slim oval matching narrower characters). */
export function drawCharacterShadow(ctx, px, py) {
  const x = Math.round(px);
  const y = Math.round(py);
  ctx.fillStyle = 'rgba(20, 28, 24, 0.36)';
  ctx.fillRect(x + 5, y + 13, 6, 1);
  ctx.fillRect(x + 4, y + 14, 8, 1);
  ctx.fillRect(x + 5, y + 15, 6, 1);
}

export function drawCharacter(
  ctx,
  spriteKey,
  dir,
  frame,
  px,
  py,
  { idle = false, blinking = false, jumpY = 0, bowY = 0 } = {}
) {
  const entry = spriteCache.get(spriteKey) || spriteCache.get('player');
  if (!entry) return;
  const frames = entry[dir] || entry.down;

  let canvas = frames[frame % frames.length];
  if (idle && blinking && frame === 0 && entry.blink && entry.blink[dir]) {
    canvas = entry.blink[dir];
  }

  const drawX = Math.round(px + (16 - entry.w) / 2);
  const drawY = Math.round(py + (16 - entry.h) + 2 - jumpY + bowY);
  ctx.drawImage(canvas, drawX, drawY);
}

export function drawBattleTrainer(ctx, which, centerX, bottomY, scale = 1.65, frame = 0) {
  drawBattleTrainerSprite(ctx, which, centerX, bottomY, { scale, frame });
}

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

export function drawPokeBall(ctx, tilePx, tilePy, ox = 3, oy = 1) {
  if (!pokeBallCanvas) {
    pokeBallCanvas = compilePixelMap(MAP_POKEBALL, PAL_POKEBALL);
  }
  const x = Math.round(tilePx + ox);
  const y = Math.round(tilePy + oy);
  ctx.fillStyle = 'rgba(20, 28, 36, 0.3)';
  ctx.fillRect(x + 2, y + 9, 6, 1);
  ctx.drawImage(pokeBallCanvas, x, y);
}

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
