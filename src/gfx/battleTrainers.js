/**
 * Hand-authored Gen 3 ~64x64 Battle Trainer pixel-map sprites:
 * - Rival front trainer portrait (semi-realistic proportions, head ~25% height,
 *   spiky light-brown hair, purple/teal jacket, gold necklace, holding Poké Ball)
 * - Player back trainer sprite with 4-frame throw animation:
 *   0: Ready stance, 1: Wind-up, 2: Throw release, 3: Follow-through
 *
 * Built via our pixel-map compiler with colored dark outlines and 4-5 shades per material.
 */

import { compilePixelMap } from './pixelart.js';

const PAL_RIVAL_BATTLE = {
  '0': '#1C1828', // Dark indigo outline
  // Spiky light-brown hair (4 shades)
  'h': '#5C341C',
  'H': '#885028',
  'a': '#B8743C',
  'A': '#E0A464',
  // Skin (3 shades)
  'k': '#C88E68',
  's': '#F0BC94',
  'S': '#FCE0C0',
  // Eyes / mouth
  'e': '#283860',
  'w': '#FFFFFF',
  // Purple/teal high-collar jacket (5 shades)
  'p': '#2A2054',
  'P': '#463888',
  'v': '#6C5CB8',
  't': '#246874',
  'T': '#48A4AE',
  // Inner shirt & gold necklace
  'd': '#242838',
  'D': '#3C4458',
  'g': '#B88418',
  'G': '#F8D858',
  // Trousers
  'n': '#1E2434',
  'N': '#343E54',
  // Poké Ball in hand
  'r': '#B82828',
  'R': '#E84840',
};

// 32x32 compact pixel map compiled at 2x (giving razor-sharp 64x64 semi-realistic Gen 3 battle portrait!)
// Wait: let's author directly at 48x52 for ultra-detailed semi-realistic Gen 3 proportions (head ~13px = 25% of 52px!)
const MAP_RIVAL_FRONT = [
  '......................00........................',
  '....................00aH00......................',
  '...............00..0aAAaH00..00.................',
  '..............0aH00aAAaaHH00Ha0.................',
  '.............0aAAaaAAaaHHHHaAA0.................',
  '...........000aaAAaaHHHHHHaaAa000...............',
  '..........0aHHaaAAaHHhHHhHHaAAHHa0..............',
  '..........0aHHaaHHhH0hhhh0HhHHaaH0..............',
  '...........00HhHh00ssssssss00hHh0...............',
  '............0hHh0sSSssssssSSs0h0................',
  '............0h0ksS00kssssk00Ss0k0...............',
  '............00ksSwweSssssSewwSs00...............',
  '.............0ksSseeSssssSeesSs0................',
  '.............0kssSSSsSkssSSsssk0................',
  '..............0ksssss00k0ssssk0.................',
  '..............0kksssssssssskk0..................',
  '...............00kksssssskk00...................',
  '..............0p000kkkkkk000p0..................',
  '............00pPP0000ss0000PPp00................',
  '..........00pPPvPP0d0G0G0d0PPvPPp00.............',
  '.........0pPPvvvPP0dd0G0dd0PPvvvPPp0............',
  '........0pPPvvvPPp0dDDGDDd0pPPvvvPPp0...........',
  '.......0pPPvvvPPpp0dDDDDDd0ppPPvvvPPp0..0000....',
  '.......0pPPvvPPpTT0dDDDDDd0TTpPPvvPPp0.0RRRR0...',
  '......0pPPvvPPpTTT0dDDDDDd0TTTpPPvvPPp0R00w0R0..',
  '......0pPPvPPpTTTT0dDDDDDd0TTTTpPPvPPp00wwww00..',
  '......0pPPvPPpTTT00dDDDDDd00TTTpPPvPPp0sSSss0...',
  '.....0pPPvvPPpTTT0dDDDDDDDd0TTT0pPPvPP0sSssk0...',
  '.....0pPPvPPpTTTT0dDDDDDDDd0TTTT0pPPp0ksssk0....',
  '.....0pPPp0pTTTTT0dDDDDDDDd0TTTTT0000ksssk0.....',
  '.....0pPP0.0pTTTT0dDDDDDDDd0TTTTTpPPvvPP00......',
  '.....0pP0..0pTTTT0dDDDDDDDd0TTTTTpPPvPP0........',
  '....0sSs0..0pTTTT00000000000TTTTTpPPp00.........',
  '....0sSk0..0pPPPTTpppppppppppTTPPPp0............',
  '.....000...0pPPPPPpppppppppppPPPPPp0............',
  '...........0pPPPPpppppppppppppPPPPp0............',
  '...........000000000000000000000000.............',
  '...........0nNNNNNNNnn0nnNNNNNNNNn0.............',
  '...........0nNNNNNNNnn0nnNNNNNNNNn0.............',
  '...........0nNNNNNNnnn0nnnNNNNNNNn0.............',
  '...........0nNNNNNNnnn0nnnNNNNNNNn0.............',
  '...........0nNNNNNNnn0.0nnNNNNNNNn0.............',
  '...........0nNNNNNNnn0.0nnNNNNNNNn0.............',
  '...........0nNNNNNnnn0.0nnnNNNNNNn0.............',
  '...........0nNNNNNnnn0.0nnnNNNNNNn0.............',
  '...........0nNNNNNnn0...0nnNNNNNNn0.............',
  '...........0nNNNNNnn0...0nnNNNNNNn0.............',
  '...........0nNNNNnnn0...0nnnNNNNNn0.............',
  '...........0000000000...00000000000.............',
  '..........0RRRRR0000.....0000RRRRR0.............',
  '..........0wwwww0000.....0000wwwww0.............',
  '..........0000000000.....0000000000.............',
];

const PAL_PLAYER_BACK = {
  '0': '#1C1828', // Dark outline
  // Red/blue bandana & cap + gold emblem
  'b': '#1A3E88',
  'B': '#2C64C4',
  'c': '#5E98F0',
  'g': '#C89420',
  'G': '#F8D454',
  // Dark hair tufts
  'h': '#281C18',
  'H': '#4A3228',
  'a': '#704E3E',
  // Skin
  'k': '#C88E68',
  's': '#F0BC94',
  'S': '#FCE0C0',
  // Red/black sporty jacket
  'r': '#8C2228',
  'R': '#D43E40',
  'l': '#F4766E',
  'd': '#242A38',
  'D': '#3C465C',
  'w': '#F4F6FA',
  // Adventurer backpack (gold-tan)
  'p': '#8C521C',
  'P': '#C88234',
  'y': '#F0BA58',
  'Y': '#FCE088',
};

// Base 48x44 Player back sprite (Frame 0: Ready Stance)
const MAP_PLAYER_BACK_0 = [
  '...............000000000000.....................',
  '.............00ccBBBBBBBBBB00...................',
  '............0cccBBBBBBBBBBBBb0..................',
  '...........0ccBBBBBBBBBBBBBBbb0.................',
  '..........0cBBBBBBBBBBBBBBBBbb0.................',
  '..........0BBBBBBBBGGGGGBBBBBb0.................',
  '..........0bBBBBBBBggggGBBBBBb0000..............',
  '..........0bbBBBBBBBBBBBBBBBBbbbb00.............',
  '..........0000000000000000000000000.............',
  '..........0hhHHaaHHHHHHHHHHhh0ss0...............',
  '..........0hhHHaHHHHHHHHHHhhh0sk0...............',
  '...........0hhHHHHHHHHHHHhhh0000................',
  '...........00hhHHHHHHHHHhhh0....................',
  '............00hhHHHHHHHhhh0.....................',
  '.............0000000000000......................',
  '...........000wwwwwwwwwww000....................',
  '.........00rRR0dddddddddd0RRr00.................',
  '........0rRRllR0000000000RllRRr0................',
  '.......0rRRllRR0YYYYYYYY0RRllRRr0...............',
  '......0rRRllRRR0yyyyyyyy0RRRllRRr0..............',
  '......0rRRlRRRR0PPPPPPPP0RRRRlRRr0..............',
  '.....0rRRlRRRRR0PPPPPPPP0RRRRRlRRr0.............',
  '.....0rRRlRRRRR0pppppppp0RRRRRlRRr0.............',
  '.....0rRRRRRRRR0PPPPPPPP0RRRRRRRRr0.............',
  '....0rRRlRRRRRR0PPPPPPPP0RRRRRRlRRr0............',
  '....0rRRlRRr0RR0pppppppp0RR0rRRlRRr0............',
  '....0rRRRRRr0RR0PPPPPPPP0RR0rRRRRRr0............',
  '....0dDDDDDd0RR0pppppppp0RR0dDDDDDd0............',
  '....0dDDDDDd0RR0000000000RR0dDDDDDd0............',
  '....0dDDDDDd0RRRRRRRRRRRRRR0dDDDDDd0............',
  '....0dDDDDDd0RRRRRRRRRRRRRR0dDDDDDd0............',
  '....000000000rrrrrrrrrrrrrr000000000............',
  '.....0sSSsk0.0dddddddddddd0.0ksSSs0.............',
  '.....0ssssk0.0DDDDDDDDDDDD0.0kssss0.............',
  '......00000..0DDDDDDDDDDDD0..00000..............',
  '.............0dddddddddddd0.....................',
  '.............0dddddddddddd0.....................',
  '.............0DDDDDDDDDDDD0.....................',
  '.............0DDDDDDDDDDDD0.....................',
  '.............0dddddddddddd0.....................',
  '.............0dddddddddddd0.....................',
  '.............0dddddddddddd0.....................',
  '.............0dddddddddddd0.....................',
  '.............0dddddddddddd0.....................',
];

// Frame 1: Wind-up (right arm pulled back high holding a Poké Ball!)
const MAP_PLAYER_BACK_1 = [
  '...............000000000000...........0000......',
  '.............00ccBBBBBBBBBB00........0RRRR0.....',
  '............0cccBBBBBBBBBBBBb0......0R00w0R0....',
  '...........0ccBBBBBBBBBBBBBBbb0.....00wwww00....',
  '..........0cBBBBBBBBBBBBBBBBbb0.....0sSSss0.....',
  '..........0BBBBBBBBGGGGGBBBBBb0....0sSSssk0.....',
  '..........0bBBBBBBBggggGBBBBBb000..0dDDDDd0.....',
  '..........0bbBBBBBBBBBBBBBBBBbbbb0.0dDDDDd0.....',
  '..........00000000000000000000000000rRRRRr0.....',
  '..........0hhHHaaHHHHHHHHHHhh0ss0..0rRRlRr0.....',
  '..........0hhHHaHHHHHHHHHHhhh0sk0.0rRRlRRr0.....',
  '...........0hhHHHHHHHHHHHhhh0000..0rRRlRR0......',
  '...........00hhHHHHHHHHHhhh0.....0rRRlRR0.......',
  '............00hhHHHHHHHhhh0.....0rRRlRR0........',
  '.............0000000000000.....0rRRlRR0.........',
  '...........000wwwwwwwwwww000..0rRRlRR0..........',
  '.........00rRR0dddddddddd0RR00rRRlRR0...........',
  '........0rRRllR0000000000RllRRRRlRR0............',
  '.......0rRRllRR0YYYYYYYY0RRllRRRRr0.............',
  '......0rRRllRRR0yyyyyyyy0RRRllRRr0..............',
  '......0rRRlRRRR0PPPPPPPP0RRRRlRRr0..............',
  '.....0rRRlRRRRR0PPPPPPPP0RRRRRRr0...............',
  '.....0rRRlRRRRR0pppppppp0RRRRRr0................',
  '.....0rRRRRRRRR0PPPPPPPP0RRRRr0.................',
  '....0rRRlRRRRRR0PPPPPPPP0RRRR0..................',
  '....0rRRlRRr0RR0pppppppp0RRR0...................',
  '....0rRRRRRr0RR0PPPPPPPP0RRR0...................',
  '....0dDDDDDd0RR0pppppppp0RRR0...................',
  '....0dDDDDDd0RR0000000000RRR0...................',
  '....0dDDDDDd0RRRRRRRRRRRRRRR0...................',
  '....0dDDDDDd0RRRRRRRRRRRRRRR0...................',
  '....000000000rrrrrrrrrrrrrrr0...................',
  '.....0sSSsk0.0ddddddddddddd0....................',
  '.....0ssssk0.0DDDDDDDDDDDDD0....................',
  '......00000..0DDDDDDDDDDDDD0....................',
  '.............0ddddddddddddd0....................',
  '.............0ddddddddddddd0....................',
  '.............0DDDDDDDDDDDDD0....................',
  '.............0DDDDDDDDDDDDD0....................',
  '.............0ddddddddddddd0....................',
  '.............0ddddddddddddd0....................',
  '.............0ddddddddddddd0....................',
  '.............0ddddddddddddd0....................',
  '.............0ddddddddddddd0....................',
];

// Frame 2: Mid-throw whip forward!
const MAP_PLAYER_BACK_2 = [
  '.................000000000000...................',
  '...............00ccBBBBBBBBBB00.................',
  '..............0cccBBBBBBBBBBBBb0................',
  '.............0ccBBBBBBBBBBBBBBbb0...............',
  '............0cBBBBBBBBBBBBBBBBbb0...............',
  '............0BBBBBBBBGGGGGBBBBBb0...............',
  '............0bBBBBBBBggggGBBBBBb0000............',
  '............0bbBBBBBBBBBBBBBBBBbbbb00...........',
  '............0000000000000000000000000...........',
  '............0hhHHaaHHHHHHHHHHhh0ss0.............',
  '............0hhHHaHHHHHHHHHHhhh0sk0.............',
  '.............0hhHHHHHHHHHHHhhh0000..............',
  '.............00hhHHHHHHHHHhhh0..................',
  '..............00hhHHHHHHHhhh0.........0000......',
  '...............0000000000000........0sSSss0.....',
  '.............000wwwwwwwwwww000.....0sSSssk0.....',
  '...........00rRR0dddddddddd0RR00..0dDDDDDd0.....',
  '..........0rRRllR0000000000RllRR00dDDDDDd0......',
  '.........0rRRllRR0YYYYYYYY0RRllRRRRRRRRr0.......',
  '........0rRRllRRR0yyyyyyyy0RRRllRRRRlRR0........',
  '........0rRRlRRRR0PPPPPPPP0RRRRllRRlRR0.........',
  '.......0rRRlRRRRR0PPPPPPPP0RRRRRRRRRr0..........',
  '.......0rRRlRRRRR0pppppppp0RRRRRRRRr0...........',
  '.......0rRRRRRRRR0PPPPPPPP0RRRRRRR0.............',
  '......0rRRlRRRRRR0PPPPPPPP0RRRRRR0..............',
  '......0rRRlRRr0RR0pppppppp0RRRRR0...............',
  '......0dDDDDDd0RR0PPPPPPPP0RRRRR0...............',
  '......0dDDDDDd0RR0pppppppp0RRRRR0...............',
  '......000000000RR0000000000RRRRR0...............',
  '.......0sSSsk00RRRRRRRRRRRRRRRRR0...............',
  '.......0ssssk00RRRRRRRRRRRRRRRRR0...............',
  '........00000.0rrrrrrrrrrrrrrrrr0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0DDDDDDDDDDDDDDDDD0...............',
  '..............0DDDDDDDDDDDDDDDDD0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0DDDDDDDDDDDDDDDDD0...............',
  '..............0DDDDDDDDDDDDDDDDD0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0ddddddddddddddddd0...............',
  '..............0ddddddddddddddddd0...............',
];

// Frame 3: Follow-through pointing confidently forward
const MAP_PLAYER_BACK_3 = [
  '..................000000000000..................',
  '................00ccBBBBBBBBBB00................',
  '...............0cccBBBBBBBBBBBBb0...............',
  '..............0ccBBBBBBBBBBBBBBbb0..............',
  '.............0cBBBBBBBBBBBBBBBBbb0..............',
  '.............0BBBBBBBBGGGGGBBBBBb0..............',
  '.............0bBBBBBBBggggGBBBBBb0000...........',
  '.............0bbBBBBBBBBBBBBBBBBbbbb00..........',
  '.............0000000000000000000000000..........',
  '.............0hhHHaaHHHHHHHHHHhh0ss0............',
  '.............0hhHHaHHHHHHHHHHhhh0sk0............',
  '..............0hhHHHHHHHHHHHhhh0000.............',
  '..............00hhHHHHHHHHHhhh0.................',
  '...............00hhHHHHHHHhhh0..................',
  '................0000000000000...................',
  '..............000wwwwwwwwwww000.................',
  '............00rRR0dddddddddd0RR00...............',
  '...........0rRRllR0000000000RllRR000000.........',
  '..........0rRRllRR0YYYYYYYY0RRllRRRRRRdd00......',
  '.........0rRRllRRR0yyyyyyyy0RRRllRRRRRDDDD00....',
  '.........0rRRlRRRR0PPPPPPPP0RRRRllRRRRDDDDss0...',
  '........0rRRlRRRRR0PPPPPPPP0RRRRRRRRRR000sSSs0..',
  '........0rRRlRRRRR0pppppppp0RRRRRRRRr0...0000...',
  '........0rRRRRRRRR0PPPPPPPP0RRRRRRR0............',
  '.......0rRRlRRRRRR0PPPPPPPP0RRRRRR0.............',
  '.......0dDDDDDd0RR0pppppppp0RRRRR0..............',
  '.......0dDDDDDd0RR0PPPPPPPP0RRRRR0..............',
  '.......000000000RR0pppppppp0RRRRR0..............',
  '........0sSSsk00RR0000000000RRRRR0..............',
  '........0ssssk00RRRRRRRRRRRRRRRRR0..............',
  '.........00000.0RRRRRRRRRRRRRRRRR0..............',
  '...............0rrrrrrrrrrrrrrrrr0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0DDDDDDDDDDDDDDDDD0..............',
  '...............0DDDDDDDDDDDDDDDDD0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0DDDDDDDDDDDDDDDDD0..............',
  '...............0DDDDDDDDDDDDDDDDD0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0ddddddddddddddddd0..............',
  '...............0ddddddddddddddddd0..............',
];

let rivalFrontCanvas = null;
let playerBackFrames = null;

export function initBattleTrainers() {
  if (rivalFrontCanvas) return;
  rivalFrontCanvas = compilePixelMap(MAP_RIVAL_FRONT, PAL_RIVAL_BATTLE);
  playerBackFrames = [
    compilePixelMap(MAP_PLAYER_BACK_0, PAL_PLAYER_BACK),
    compilePixelMap(MAP_PLAYER_BACK_1, PAL_PLAYER_BACK),
    compilePixelMap(MAP_PLAYER_BACK_2, PAL_PLAYER_BACK),
    compilePixelMap(MAP_PLAYER_BACK_3, PAL_PLAYER_BACK),
  ];
}

/**
 * Draw a Gen 3 battle trainer sprite centered horizontally at centerX, bottom at bottomY.
 * which: 'rival' | 'playerBack'
 * frame: 0..3 for playerBack throw animation (0=ready, 1=wind-up, 2=throw, 3=follow-through)
 */
export function drawBattleTrainerSprite(ctx, which, centerX, bottomY, { scale = 1.65, frame = 0 } = {}) {
  initBattleTrainers();
  const canvas =
    which === 'rival'
      ? rivalFrontCanvas
      : playerBackFrames[Math.max(0, Math.min(playerBackFrames.length - 1, frame))];
  if (!canvas) return;

  const dw = Math.round(canvas.width * scale);
  const dh = Math.round(canvas.height * scale);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, Math.round(centerX - dw / 2), Math.round(bottomY - dh), dw, dh);
  ctx.restore();
}
