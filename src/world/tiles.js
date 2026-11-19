/**
 * Gen 3 GBA-Style Pixel-Map Tile Atlas (16x16 tiles + 32x32 2x2 trees).
 * Every tile is hand-authored pixel by pixel using string pixel maps and palettes
 * compiled once at startup via src/gfx/pixelart.js — zero gradients, zero blur,
 * colored dark outlines, top-left lighting, 3-5 shades per material.
 *
 * Also supports full 16-case dirt-path auto-tiling, 4-frame scrolling water with
 * foam shoreline edges, 3-frame swaying flowers, tall-grass player-leg overlay,
 * one-way jumpable ledges, and external PNG/JSON tileset overrides.
 */

import { compilePixelMap, stampPixelMap } from '../gfx/pixelart.js';

export const TILE_SIZE = 16;

export const TILE = {
  // Outdoor
  GRASS: 0,
  PATH: 1,
  FLOWER: 2,
  TALL_GRASS: 3,
  TREE: 4,
  FENCE: 5,
  SIGN: 6,
  MAILBOX: 7,
  WATER: 8,
  LEDGE: 9,

  // Building exteriors
  ROOF_RED: 10,
  ROOF_RED_TRIM: 11,
  ROOF_BLUE: 12,
  ROOF_BLUE_TRIM: 13,
  ROOF_LAB: 14,
  ROOF_LAB_TRIM: 15,
  HOUSE_WALL: 16,
  HOUSE_WINDOW: 17,
  LAB_WALL: 18,
  LAB_WINDOW: 19,
  DOOR: 20,
  LAB_DOOR: 21,
  LAB_SIGN: 22,

  // Indoor floors & warps
  WOOD_FLOOR: 30,
  LAB_FLOOR: 31,
  RUG_RED: 32,
  RUG_BLUE: 33,
  DOORMAT: 34,
  STAIRS_DOWN: 35,
  STAIRS_UP: 36,
  LAB_DOORMAT: 37,

  // Indoor walls
  WALL_TOP: 40,
  WALL_BOT: 41,
  WALL_WINDOW: 42,
  LAB_WALL_TOP: 43,
  LAB_WALL_BOT: 44,
  LAB_WINDOW_IN: 45,

  // Indoor furniture & decor
  BED_TOP: 50,
  BED_BOT: 51,
  PC_DESK: 52,
  DESK: 53,
  TV: 54,
  PLANT: 55,
  KITCHEN_FRIDGE: 56,
  KITCHEN_STOVE: 57,
  KITCHEN_COUNTER: 58,
  TABLE_LEFT: 59,
  TABLE_RIGHT: 60,
  BOOKSHELF: 61,
  LAB_MACHINE: 62,
  LAB_TABLE: 63,
  CHAIR: 64,
};

/** Tiles that block standard walking (LEDGE is handled specially for downward hops). */
export const SOLID_TILES = new Set([
  TILE.TREE,
  TILE.FENCE,
  TILE.SIGN,
  TILE.LAB_SIGN,
  TILE.MAILBOX,
  TILE.WATER,
  TILE.LEDGE,
  TILE.ROOF_RED,
  TILE.ROOF_RED_TRIM,
  TILE.ROOF_BLUE,
  TILE.ROOF_BLUE_TRIM,
  TILE.ROOF_LAB,
  TILE.ROOF_LAB_TRIM,
  TILE.HOUSE_WALL,
  TILE.HOUSE_WINDOW,
  TILE.LAB_WALL,
  TILE.LAB_WINDOW,
  TILE.WALL_TOP,
  TILE.WALL_BOT,
  TILE.WALL_WINDOW,
  TILE.LAB_WALL_TOP,
  TILE.LAB_WALL_BOT,
  TILE.LAB_WINDOW_IN,
  TILE.BED_TOP,
  TILE.BED_BOT,
  TILE.PC_DESK,
  TILE.DESK,
  TILE.TV,
  TILE.PLANT,
  TILE.KITCHEN_FRIDGE,
  TILE.KITCHEN_STOVE,
  TILE.KITCHEN_COUNTER,
  TILE.TABLE_LEFT,
  TILE.TABLE_RIGHT,
  TILE.BOOKSHELF,
  TILE.LAB_MACHINE,
  TILE.LAB_TABLE,
]);

/** Props drawn on the Y-sorted object layer above base ground tiles. */
export const Y_SORT_TILES = new Set([
  TILE.SIGN,
  TILE.LAB_SIGN,
  TILE.MAILBOX,
  TILE.FENCE,
  TILE.PLANT,
  TILE.BED_TOP,
  TILE.BED_BOT,
  TILE.TABLE_LEFT,
  TILE.TABLE_RIGHT,
  TILE.LAB_TABLE,
  TILE.CHAIR,
]);

/** Deterministic hash for subtle 2-variant grass placement. */
export function tileHash(x, y) {
  let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  n = (n ^ (n >> 13)) * 1274126177;
  return Math.abs(n ^ (n >> 16));
}

// =========================================================================
// GEN 3 GBA PALETTES (BRIGHT, WARM, COLORED DARK OUTLINES — NO PURE BLACK)
// =========================================================================

const PAL_GRASS = {
  '0': '#387838', // Dark tuft root
  '1': '#58B050', // Mid grass tuft
  '2': '#78D068', // Bright warm GBA meadow base
  '3': '#98E078', // Top-left sunlit blade glint
};

const PAL_TALL_GRASS = {
  '0': '#184020', // Deep emerald outline
  '1': '#286830', // Shaded clump
  '2': '#389840', // Lush blade mid
  '3': '#68C858', // Sunlit pointed tip
  '4': '#78D068', // Ground grass visible through gaps
};

const PAL_FLOWER = {
  '0': '#205828', // Stem outline
  '1': '#389040', // Leaf/stem
  'r': '#D83838', // Red petal shadow
  'R': '#F86858', // Red petal bright
  'y': '#E0A820', // Yellow petal shadow
  'Y': '#F8E048', // Yellow petal bright
  'w': '#FFF8D8', // Pollen highlight
};

const PAL_PATH = {
  '0': '#508844', // Grass-path edge dark
  '1': '#68B858', // Grass fringe
  '2': '#B89860', // Dirt shadow border
  '3': '#D4B87C', // Dirt speckle
  '4': '#E8D098', // Warm sandy path base
  '5': '#F4E4B8', // Light pebble glint
};

const PAL_WATER = {
  '0': '#204878', // Deep shore shadow
  '1': '#3070C0', // Mid water shade
  '2': '#4898E8', // Vibrant GBA water base
  '3': '#78C4F8', // Wave highlight
  '4': '#E8F8FF', // White shimmer / foam crest
  '5': '#D8C088', // Sandy pond rim
  '6': '#58B050', // Outer grass lip
};

const PAL_LEDGE = {
  '0': '#483018', // Dark earth outline
  '1': '#886034', // Shaded cliff face
  '2': '#B88C54', // Mid cliff face
  '3': '#D8B878', // Light cliff ridge
  '4': '#F0DC9C', // Top-left sunlit lip
  's': '#488840', // Pixel drop shadow on grass below
  'g': '#78D068', // Meadow grass
  't': '#58B050', // Grass tuft
};

const PAL_TREE = {
  '0': '#183820', // Deep green outline
  '1': '#286830', // Dark underside clump
  '2': '#389840', // Rich mid foliage
  '3': '#60C050', // Bright foliage clump
  '4': '#90E068', // Top-left sunlit highlight clump
  'b': '#482814', // Trunk outline
  'B': '#704424', // Trunk shadow
  't': '#986034', // Trunk sunlit bark
  's': '#488840', // Pixel ground shadow
};

const PAL_FENCE = {
  '0': '#404850', // Dark outline
  '1': '#A8B0B8', // Post shadow
  '2': '#DCE4EC', // Mid white wood
  '3': '#F8F8F8', // Sunlit picket highlight
  's': '#488840', // Ground shadow
};

const PAL_WOOD_PROP = {
  '0': '#402818', // Dark wood outline
  '1': '#784828', // Shadow wood
  '2': '#B07440', // Base wood
  '3': '#D8A064', // Highlight wood
  '4': '#F0D098', // Paper / glint
  'r': '#C83838', // Mailbox red shadow
  'R': '#E85850', // Mailbox red bright
  'm': '#506070', // Metal post
  'c': '#4898C8', // Lab icon cyan
  's': '#488840', // Grass shadow
};

const PAL_ROOF_RED = {
  '0': '#581C20',
  '1': '#982C30',
  '2': '#C84444',
  '3': '#E86860',
  '4': '#F89888',
  'w': '#EFE4CC',
  's': '#B8A88C',
};

const PAL_ROOF_BLUE = {
  '0': '#1C2E58',
  '1': '#2C4C8C',
  '2': '#4470BC',
  '3': '#6898E0',
  '4': '#98C4F8',
  'w': '#EFE4CC',
  's': '#B8A88C',
};

const PAL_ROOF_LAB = {
  '0': '#1C3840',
  '1': '#305C68',
  '2': '#4C8490',
  '3': '#74ACB8',
  '4': '#A8D8E0',
  'w': '#E4ECF0',
  's': '#A8B8C4',
};

const PAL_HOUSE_WALL = {
  '0': '#483828', // Outline / sill dark
  '1': '#988870', // Foundation / shade
  '2': '#D8C8A8', // Siding groove / roof shadow
  '3': '#EFE4CC', // Warm cream wall
  '4': '#FAF4E4', // Top wall glint
  'b': '#4890D0', // Window glass mid
  'B': '#78C8F8', // Window glass bright
  'w': '#F8FCFF', // White window glint
  'd': '#683C20', // Door wood dark
  'D': '#985C34', // Door wood base
  'h': '#C07C48', // Door wood light
  'g': '#F0C840', // Gold doorknob
  'm': '#C84444', // Doormat red
};

const PAL_LAB_WALL = {
  '0': '#2C3C4C',
  '1': '#788C9C',
  '2': '#B8C8D4',
  '3': '#E0EAEF',
  '4': '#F4F8FA',
  'b': '#3888B0',
  'B': '#70C8E8',
  'w': '#F4FCFF',
  'd': '#3C6C84',
  'D': '#5898B4',
  'h': '#90D0E8',
  'g': '#D0E0EC',
  'm': '#4878A8',
};

const PAL_INTERIOR = {
  '0': '#382418', // Dark wood outline
  '1': '#7C5030', // Wood dark
  '2': '#B88050', // Wood mid
  '3': '#DCA874', // Wood base
  '4': '#ECC494', // Wood highlight
  'w': '#F4ECE0', // Wallpaper / sheet white
  'W': '#E4D8C4', // Wallpaper stripe
  'b': '#C09868', // Baseboard
  'r': '#B83434', // Red blanket / rug dark
  'R': '#E05048', // Red blanket / rug bright
  'y': '#E0B038', // Gold trim / rug border
  'Y': '#FFE478', // Bright yellow book spine / highlight
  'c': '#3878C0', // Blue glass / PC / rug dark
  'C': '#78C8F8', // Bright cyan screen / sky
  'g': '#286830', // Plant / book green dark
  'G': '#50B048', // Plant / book green bright
  'p': '#C06034', // Terracotta pot
  's': '#384454', // Dark slate TV/PC bezel
  'S': '#8898A8', // Mid metal / bezel
  'l': '#D8E2EC', // Light metal / lab floor
  'L': '#EEF4F8', // Brightest lab white
  'k': '#202834', // Screen dark
  'e': '#F04840', // Red LED
  'E': '#48E068', // Green LED
};

// =========================================================================
// HAND-AUTHORED 16x16 PIXEL MAPS
// =========================================================================

const MAP_GRASS_A = [
  '2222222222222222',
  '2222222222222222',
  '2232222222222222',
  '2212122222222222',
  '2220222222222222',
  '2222222222222222',
  '2222222222222222',
  '2222222222322222',
  '2222222222222222',
  '2222222222222222',
  '2222222222212122',
  '2222222222220222',
  '2222222222222222',
  '2222322222222222',
  '2222222222222222',
  '2222222222222222',
];

const MAP_GRASS_B = [
  '2222222222222222',
  '2222222222322222',
  '2222222221212222',
  '2222222222022222',
  '2222222222222222',
  '2222222222222222',
  '2232222222222222',
  '2222222222222222',
  '2222222222222222',
  '2221212222222222',
  '2222022222222222',
  '2222222222222222',
  '2222222222223222',
  '2222222222222222',
  '2222222122222222',
  '2222222222222222',
];

const MAP_TALL_GRASS_0 = [
  '4434443444344434',
  '4323432343234323',
  '3222322232223222',
  '2121212121212121',
  '1010101010101010',
  '4344434443444344',
  '3234323432343234',
  '2223222322232223',
  '1212121212121212',
  '0101010101010101',
  '4434443444344434',
  '4323432343234323',
  '3222322232223222',
  '2121212121212121',
  '1010101010101010',
  '0000000000000000',
];

const MAP_TALL_GRASS_1 = [
  '4443444344434443',
  '4432343234323432',
  '4322232223222322',
  '2121212121212121',
  '1010101010101010',
  '4434443444344434',
  '4323432343234323',
  '3222322232223222',
  '1212121212121212',
  '0101010101010101',
  '4443444344434443',
  '4432343234323432',
  '4322232223222322',
  '2121212121212121',
  '1010101010101010',
  '0000000000000000',
];

/** Lower half overlay drawn ON TOP of the player's legs when standing in tall grass! */
const MAP_TALL_GRASS_FRONT = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..3...3...3...3.',
  '.323.323.323.323',
  '.222322232223222',
  '3121212121212121',
  '2010101010101010',
  '1121112111211121',
  '0010001000100010',
  '0000000000000000',
];

const MAP_FLOWER_0 = [
  '................',
  '...R............',
  '..RwR...........',
  '...r......Y.....',
  '...1.....YwY....',
  '..101.....y.....',
  '..........1.....',
  '.........101....',
  '................',
  '....Y...........',
  '...YwY....R.....',
  '....y....RwR....',
  '....1.....r.....',
  '...101....1.....',
  '.........101....',
  '................',
];

const MAP_FLOWER_1 = [
  '................',
  '....R...........',
  '...RwR..........',
  '....r......Y....',
  '...1......YwY...',
  '..101......y....',
  '..........1.....',
  '.........101....',
  '................',
  '.....Y..........',
  '....YwY....R....',
  '.....y....RwR...',
  '....1......r....',
  '...101....1.....',
  '.........101....',
  '................',
];

const MAP_FLOWER_2 = [
  '................',
  '..R.............',
  '.RwR............',
  '..r......Y......',
  '...1....YwY.....',
  '..101....y......',
  '..........1.....',
  '.........101....',
  '................',
  '...Y............',
  '..YwY....R......',
  '...y....RwR.....',
  '....1....r......',
  '...101....1.....',
  '.........101....',
  '................',
];

const MAP_PATH_CENTER = [
  '4444444444444444',
  '4445444444444444',
  '4434444444434444',
  '4444444444444444',
  '4444444444444444',
  '4444445444444444',
  '4444444444444444',
  '4444444444444344',
  '4444444444444444',
  '4434444444444444',
  '4444444444444444',
  '4444444445444444',
  '4444444444444444',
  '4444434444444444',
  '4444444444444444',
  '4444444444444444',
];

const MAP_WATER_FRAMES = [0, 1, 2, 3].map((shift) => {
  const base = [
    '2222222222222222',
    '2222222222222222',
    '2234432222222222',
    '2222222222222222',
    '2222222222222222',
    '2222222222343222',
    '2222222222222222',
    '2222222222222222',
    '2222222222222222',
    '2222343222222222',
    '2222222222222222',
    '2222222222222222',
    '2222222222223443',
    '2222222222222222',
    '1111111111111111',
    '2222222222222222',
  ];
  return base.map((row) => {
    const s = (shift * 4) % 16;
    return row.slice(16 - s) + row.slice(0, 16 - s);
  });
});

/** Gen 3 one-way jump-down ledge tile (light cliff ridge + shaded face + shadow). */
const MAP_LEDGE = [
  'gggggggggggggggg',
  'gggggggggggggggg',
  '0000000000000000',
  '4444444444444444',
  '3333333333333333',
  '3343333333433333',
  '2222222222222222',
  '2122221222221222',
  '1111111111111111',
  '1112111111121111',
  '0000000000000000',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'gggggggggggggggg',
  'gggtggggggggtggg',
  'gggggggggggggggg',
];

/** Classic Gen 3 32x32 2x2-tile bumpy-clump tree (split into base + overhead canopy!). */
const MAP_TREE_32 = [
  '..........000000000000..........',
  '.......000444443333322000.......',
  '.....0044444444333333222200.....',
  '....044444443333333322222210....',
  '...04444333333222222222221110...',
  '..0044333333222223333222211100..',
  '.044433332222223344433222111110.',
  '.044333222222233444433222211110.',
  '00433322221122333333322222111100',
  '04433222211112222222222111111110',
  '04333222111111122222221111111110',
  '03332222211111223332221111111110',
  '03322233322222334433222211111110',
  '03222334433222333333222221111110',
  '02222333332222222222222211111110',
  '02222222222211122222211111111100',
  '0122222221111111122211111111110.',
  '.011222211111111111111111111100.',
  '.00111111111100111111111111100..',
  '..001111111000001111111111000...',
  '....0000000.000000000000000.....',
  '..........00111111111100........',
  '...........001111111100.........',
  '............0bttBBBb0...........',
  '............0bttBBBb0...........',
  '............0bttBBBb0...........',
  '...........0btttBBBBb0..........',
  '..........s0bttBBBBBb0s.........',
  '.........ss0bbbbbbbbb0ss........',
  '..........sssssssssssss.........',
  '...........sssssssssss..........',
  '................................',
];

const MAP_FENCE = [
  '................',
  '................',
  '..00....00....00',
  '.0320..0320..032',
  '.0320..0320..032',
  '0032000032000032',
  '2232222232222232',
  '1131111131111131',
  '0032000032000032',
  '.0320..0320..032',
  '0032000032000032',
  '2232222232222232',
  '1111111111111111',
  '0000000000000000',
  '.ssss..ssss..sss',
  '................',
];

const MAP_SIGN = [
  '................',
  '..000000000000..',
  '.03333333333320.',
  '.03222222222210.',
  '.03200000002210.',
  '.03222222222210.',
  '.03200000222210.',
  '.02111111111110.',
  '..000000000000..',
  '......0310......',
  '......0310......',
  '......0210......',
  '......0210......',
  '.....s0000s.....',
  '....ssssssss....',
  '................',
];

const MAP_LAB_SIGN = [
  '................',
  '.00000000000000.',
  '0444444444444430',
  '04RR440000004420',
  '0444444444444420',
  '04cc440000444420',
  '0444444444444420',
  '0322222222222210',
  '.00000000000000.',
  '......0m10......',
  '......0m10......',
  '......0m10......',
  '......0m10......',
  '.....s0000s.....',
  '....ssssssss....',
  '................',
];

const MAP_MAILBOX = [
  '................',
  '................',
  '....00000000....',
  '...0RRRRRRR00...',
  '...0R4444RRr0...',
  '...0R4444Rrr0...',
  '...0rrrrrrr00...',
  '....00000000....',
  '.......0m0......',
  '.......0m0......',
  '.......0m0......',
  '.......0m0......',
  '.......0m0......',
  '......s000s.....',
  '.....sssssss....',
  '................',
];

// Sloped Gen 3 roof shingle pattern (reused via palette swap for Red / Blue / Lab!)
const MAP_ROOF = [
  '4444444444444444',
  '3333333033333330',
  '2222222022222220',
  '1111111011111110',
  '0000000000000000',
  '4440444444404444',
  '3330333333303333',
  '2220222222202222',
  '1110111111101111',
  '0000000000000000',
  '4444444044444440',
  '3333333033333330',
  '2222222022222220',
  '1111111011111110',
  '0000000000000000',
  '3330333333303333',
];

const MAP_ROOF_TRIM = [
  '4444444444444444',
  '3333333033333330',
  '2222222022222220',
  '1111111011111110',
  '0000000000000000',
  '4440444444404444',
  '3330333333303333',
  '2220222222202222',
  '1110111111101111',
  '0000000000000000',
  '1111111111111111',
  '0000000000000000',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'wwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwww',
];

const MAP_WALL_EXT = [
  '2222222222222222',
  '3333333333333333',
  '3333333333333333',
  '3333333333333333',
  '2222222222222222',
  '3333333333333333',
  '3333333333333333',
  '3333333333333333',
  '2222222222222222',
  '3333333333333333',
  '3333333333333333',
  '3333333333333333',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  '0000000000000000',
];

const MAP_WINDOW_EXT = [
  '2222222222222222',
  '3333333333333333',
  '3300000000000033',
  '330wBBb00wBBb033',
  '330wBBb00BBbb033',
  '330BBbb00Bbbb033',
  '3300000000000033',
  '330wBBb00BBbb033',
  '330BBbb00Bbbb033',
  '330Bbbb00bbbb033',
  '3000000000000003',
  '3044444444444403',
  '1100000000000011',
  '1111111111111111',
  '0000000000000000',
  '0000000000000000',
];

const MAP_DOOR_EXT = [
  '2200000000000022',
  '330hhhhhhhhhh033',
  '330hDDDDDDDDh033',
  '330hDddDDddDh033',
  '330hDddDDddDh033',
  '330hDDDDDDDDh033',
  '330hDDDDDDDDh033',
  '330hDDDDDDgDh033',
  '330hDDDDDDgDh033',
  '330hDddDDddDh033',
  '330hDddDDddDh033',
  '330hDDDDDDDDh033',
  '110dddddddddd011',
  '1100000000000011',
  '00mmmmmmmmmmmm00',
  '00mmmmmmmmmmmm00',
];

// --- Interiors ---
const MAP_WOOD_FLOOR = [
  '4444433333323333',
  '3333333333323333',
  '3333333333323333',
  '2222222222222222',
  '3332444443333333',
  '3332333333333333',
  '3332333333333333',
  '2222222222222222',
  '3333333332444433',
  '3333333332333333',
  '3333333332333333',
  '2222222222222222',
  '3244443333333333',
  '3233333333333333',
  '3233333333333333',
  '2222222222222222',
];

const MAP_LAB_FLOOR = [
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLL',
  'llllllllLLLLLLLS',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'LLLLLLLLllllllll',
  'SSSSSSSLSSSSSSSs',
];

const MAP_RUG_RED = [
  'rrrrrrrrrrrrrrrr',
  'rRRRRRRRRRRRRRRr',
  'rRyyyyyyyyyyyyRr',
  'rRyRRRRRRRRRRyRr',
  'rRyRRRRRRRRRRyRr',
  'rRyRRyyyyyyRRyRr',
  'rRyRRyRRRRyRRyRr',
  'rRyRRyRRRRyRRyRr',
  'rRyRRyRRRRyRRyRr',
  'rRyRRyRRRRyRRyRr',
  'rRyRRyyyyyyRRyRr',
  'rRyRRRRRRRRRRyRr',
  'rRyRRRRRRRRRRyRr',
  'rRyyyyyyyyyyyyRr',
  'rRRRRRRRRRRRRRRr',
  'rrrrrrrrrrrrrrrr',
];

const MAP_RUG_BLUE = [
  'cccccccccccccccc',
  'cCCCCCCCCCCCCCCc',
  'cCLLLLLLLLLLLLCc',
  'cCLCCCCCCCCCCLCc',
  'cCLCCCCCCCCCCLCc',
  'cCLCCLLLLLLCCLCc',
  'cCLCCLCCCCLCCLCc',
  'cCLCCLCCCCLCCLCc',
  'cCLCCLCCCCLCCLCc',
  'cCLCCLCCCCLCCLCc',
  'cCLCCLLLLLLCCLCc',
  'cCLCCCCCCCCCCLCc',
  'cCLCCCCCCCCCCLCc',
  'cCLLLLLLLLLLLLCc',
  'cCCCCCCCCCCCCCCc',
  'cccccccccccccccc',
];

const MAP_WALL_TOP = [
  '0000000000000000',
  '1111111111111111',
  'bbbbbbbbbbbbbbbb',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
];

const MAP_WALL_BOT = [
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'bbbbbbbbbbbbbbbb',
  '4444444444444444',
  '3333333333333333',
  '2222222222222222',
  '1111111111111111',
  '0000000000000000',
];

const MAP_WALL_WINDOW = [
  '0000000000000000',
  '1111111111111111',
  'bbbbbbbbbbbbbbbb',
  'ww000000000000ww',
  'ww0wCCc00wCCc0ww',
  'ww0wCCc00CCcc0ww',
  'ww0CCcc00Cccc0ww',
  'ww000000000000ww',
  'ww0wCCc00CCcc0ww',
  'ww0CCcc00Cccc0ww',
  'ww0Cccc00cccc0ww',
  'ww000000000000ww',
  'w04444444444440w',
  'w01111111111110w',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
];

const MAP_LAB_WALL_TOP = [
  'ssssssssssssssss',
  'SSSSSSSSSSSSSSSS',
  'llllllllllllllll',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'llllllllllllllll',
  'SSSSSSSSSSSSSSSS',
  'llllllllllllllll',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
];

const MAP_LAB_WALL_BOT = [
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
  'SSSSSSSSSSSSSSSS',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'kkkkkkkkkkkkkkkk',
];

const MAP_LAB_WINDOW_IN = [
  'ssssssssssssssss',
  'SSSSSSSSSSSSSSSS',
  'llllllllllllllll',
  'lssssssssssssssl',
  'lsLCCCcCCcCCCcsl',
  'lsLCCCcCCcCCCcsl',
  'lsCCCCcCCcCCCCsl',
  'lsCCCccCCcCCCcsl',
  'lsCCcccCCcCCccsl',
  'lsCccccCCcCcccsl',
  'lssssssssssssssl',
  'lLLLLLLLLLLLLLLl',
  'SSSSSSSSSSSSSSSS',
  'llllllllllllllll',
  'LLLLLLLllLLLLLLL',
  'LLLLLLLllLLLLLLL',
];

const MAP_BED_TOP = [
  '.00000000000000.',
  '.04444444444430.',
  '.02222222222210.',
  '.00000000000000.',
  '.0wwwwwwwwwwww0.',
  '.0wllwwwwwwllw0.',
  '.0wlwwwwwwwwlw0.',
  '.0wlwwwwwwwwlw0.',
  '.0wllwwwwwwllw0.',
  '.0wwwwwwwwwwww0.',
  '.00000000000000.',
  '.0RRRRRRRRRRRR0.',
  '.0wwwwwwwwwwww0.',
  '.0RRRRRRRRRRRR0.',
  '.0rrrrrrrrrrrr0.',
  '.0RRRRRRRRRRRR0.',
];

const MAP_BED_BOT = [
  '.0RRRRRRRRRRRR0.',
  '.0wwwwwwwwwwww0.',
  '.0RRRRRRRRRRRR0.',
  '.0rrrrrrrrrrrr0.',
  '.0RRRRRRRRRRRR0.',
  '.0yyyyyyyyyyyy0.',
  '.0RRRRRRRRRRRR0.',
  '.0rrrrrrrrrrrr0.',
  '.0rrrrrrrrrrrr0.',
  '.00000000000000.',
  '.04444444444430.',
  '.02222222222210.',
  '.00000000000000.',
  '..010......010..',
  '..000......000..',
  '................',
];

const MAP_PC_DESK = [
  '..ssssssssssss..',
  '..sLLLLLLLLLLs..',
  '..sLkkkkkkkkLs..',
  '..sLkCCccCCkLs..',
  '..sLkCCcCCCkLs..',
  '..sLkkkkkkkkLs..',
  '00sLLLLLLLLELs00',
  '044ssssssssss440',
  '0333333333333320',
  '033LLLLLLLLL3320',
  '033LSSSSSSSL3320',
  '0222222222222210',
  '0000000000000000',
  '0210........0210',
  '0110........0110',
  '0000........0000',
];

const MAP_DESK = [
  '................',
  '................',
  '................',
  '0000000000000000',
  '0444444444444430',
  '033wwww3333cc320',
  '033wSSw333cCCc20',
  '033wwww3333cc320',
  '0333333333333320',
  '0222222222222210',
  '0000000000000000',
  '0210........0210',
  '0210........0210',
  '0110........0110',
  '0000........0000',
  '................',
];

const MAP_TV_0 = [
  '....s......s....',
  '.....s....s.....',
  '.ssssssssssssss.',
  '.sSSSSSSSSSSSSs.',
  '.sSkkkkkkkkSSSs.',
  '.sSkCCccCCkSeSs.',
  '.sSkCCcCCCkSSSs.',
  '.sSkcGGGGGkSkSs.',
  '.sSkkkkkkkkSSSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '..044444444430..',
  '..022222222210..',
  '..000000000000..',
  '................',
  '................',
];

const MAP_TV_1 = [
  '....s......s....',
  '.....s....s.....',
  '.ssssssssssssss.',
  '.sSSSSSSSSSSSSs.',
  '.sSkkkkkkkkSSSs.',
  '.sSkCCCcCCkSeSs.',
  '.sSkcCCCCCkSSSs.',
  '.sSkGGGGGckSkSs.',
  '.sSkkkkkkkkSSSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '..044444444430..',
  '..022222222210..',
  '..000000000000..',
  '................',
  '................',
];

const MAP_PLANT = [
  '.....g000g......',
  '...g0GGGGG0g....',
  '..0GGGGGggGG0...',
  '..0GGGggggGG0...',
  '.0GGgggggggGG0..',
  '.0GgggggggggG0..',
  '..00ggggggg00...',
  '....00000000....',
  '...0pppppppp0...',
  '...0p333333p0...',
  '....0pppppp0....',
  '....0p1111p0....',
  '....0pppppp0....',
  '.....000000.....',
  '................',
  '................',
];

const MAP_BOOKSHELF = [
  '0000000000000000',
  '0444444444444430',
  '02RcGcYcRcGcYc10',
  '02RcGcYcRcGcYc10',
  '02rcgcycrcgcyc10',
  '02rcgcycrcgcyc10',
  '0111111111111110',
  '0444444444444430',
  '02cYRcGcYcRcGc10',
  '02cYRcGcYcRcGc10',
  '02cyrcgcycrcgc10',
  '02cyrcgcycrcgc10',
  '0111111111111110',
  '0222222222222210',
  '0111111111111110',
  '0000000000000000',
];

const MAP_LAB_MACHINE_0 = [
  '.ssssssssssssss.',
  '.sLLLLLLLLLLLLs.',
  '.sSkkkkkkkkkkSs.',
  '.sSkccCCCCcckSs.',
  '.sSkcCCccCCckSs.',
  '.sSkccCCCCcckSs.',
  '.sSkkkkkkkkkkSs.',
  '.sSSSSSSSSSSSSs.',
  '.sSllSeeSEESlls.',
  '.sSllSeeSEESlls.',
  '.sSllllllllllSs.',
  '.sSccccccccccSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '..ss........ss..',
  '................',
];

const MAP_LAB_MACHINE_1 = [
  '.ssssssssssssss.',
  '.sLLLLLLLLLLLLs.',
  '.sSkkkkkkkkkkSs.',
  '.sSkcCCCCccckSs.',
  '.sSkccCCccCCkSs.',
  '.sSkcCCCCccckSs.',
  '.sSkkkkkkkkkkSs.',
  '.sSSSSSSSSSSSSs.',
  '.sSllSssSCCSlls.',
  '.sSllSssSCCSlls.',
  '.sSllllllllllSs.',
  '.sSccccccccccSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '..ss........ss..',
  '................',
];

const MAP_TABLE_LEFT = [
  '................',
  '.000000000000000',
  '.044444444444444',
  '.033333333333333',
  '.033RR3wwwwwwwww',
  '.033R43wwwwwwwww',
  '.033rr3wwwwwwwww',
  '.033333wwwwwwwww',
  '.022222222222222',
  '.000000000000000',
  '.0210...........',
  '.0210...........',
  '.0110...........',
  '.0000...........',
  '................',
  '................',
];

const MAP_TABLE_RIGHT = [
  '................',
  '000000000000000.',
  '444444444444430.',
  '333333333333320.',
  'wwwwwwww3GG3320.',
  'wwwwwwww3Gy3320.',
  'wwwwwwww3gg3320.',
  'wwwwwwww3333320.',
  '222222222222210.',
  '000000000000000.',
  '...........0210.',
  '...........0210.',
  '...........0110.',
  '...........0000.',
  '................',
  '................',
];

const MAP_CHAIR = [
  '................',
  '................',
  '....00000000....',
  '....04444430....',
  '....03333320....',
  '....02222210....',
  '....00000000....',
  '...0444444430...',
  '...0333333320...',
  '...0222222210...',
  '...0000000000...',
  '...010....010...',
  '...010....010...',
  '...000....000...',
  '................',
  '................',
];

const MAP_LAB_TABLE = [
  '................',
  'ssssssssssssssss',
  'sLLLLLLLLLLLLLLs',
  'slllllllllllllls',
  'slllllllllllllls',
  'slllllllllllllls',
  'slllllllllllllls',
  'sSSSSSSSSSSSSSSs',
  'sSSSSSSSSSSSSSSs',
  'ssssssssssssssss',
  '.sSs........sSs.',
  '.sSs........sSs.',
  '.sss........sss.',
  '................',
  '................',
  '................',
];

const MAP_FRIDGE = [
  '.ssssssssssssss.',
  '.sLLLLLLLLLLLLs.',
  '.sLLLLLLLLLLlLs.',
  '.sLLLLLLLLLLsLs.',
  '.sLLLLLLLLLLsLs.',
  '.sLLLLLLLLLLlLs.',
  '.sSSSSSSSSSSSSs.',
  '.slllllllllllls.',
  '.sllllllllllsLs.',
  '.sllllllllllsLs.',
  '.sllllllllllsLs.',
  '.slllllllllllls.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '..ss........ss..',
  '................',
];

const MAP_STOVE = [
  'ssssssssssssssss',
  'sLLLLLLLLLLLLLLs',
  'sLkkkLLLLkkklLLs',
  'sLkSkLLLLkSklLLs',
  'sLkkkLLLLkkklLLs',
  'sLLLLLLLLLLLLLLs',
  'sSSSSSSSSSSSSSSs',
  'sLssLssLssLssLLs',
  'sSssssssssssssSs',
  'sSsSSSSSSSSSSsSs',
  'sSsSkkkkkkkkSsSs',
  'sSsSkkkkkkkkSsSs',
  'sSsSSSSSSSSSSsSs',
  'sSssssssssssssSs',
  'ssssssssssssssss',
  '................',
];

const MAP_COUNTER = [
  '0000000000000000',
  '0LLLLLLLLLLLLLL0',
  '0llllllllllllll0',
  '0llllllllllllll0',
  '0SSSSSSSSSSSSSS0',
  '0000000000000000',
  '0444444044444430',
  '0333333033333320',
  '03333y303y333320',
  '03333y303y333320',
  '0333333033333320',
  '0222222022222210',
  '0111111011111110',
  '0000000000000000',
  '................',
  '................',
];

const MAP_STAIRS_DOWN = [
  '0000000000000000',
  '2222222222222222',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '4440333022201110',
  '2222222222222222',
  '0000000000000000',
];

const MAP_STAIRS_UP = [
  '0000000000000000',
  '2222222222222222',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '1110222033304440',
  '2222222222222222',
  '0000000000000000',
];

const MAP_DOORMAT_OVERLAY = [
  '................',
  '................',
  '................',
  '.00000000000000.',
  '.0RRRRRRRRRRRR0.',
  '.0RyyyyyyyyyyR0.',
  '.0RyRRRRRRRRyR0.',
  '.0RyRRRRRRRRyR0.',
  '.0RyRRRRRRRRyR0.',
  '.0RyRRRRRRRRyR0.',
  '.0RyyyyyyyyyyR0.',
  '.0rrrrrrrrrrrr0.',
  '.00000000000000.',
  '................',
  '................',
  '................',
];

const MAP_LAB_MAT_OVERLAY = [
  '................',
  '................',
  '................',
  '.ssssssssssssss.',
  '.sccccccccccccs.',
  '.scLLLLLLLLLLcs.',
  '.scLccccccccLcs.',
  '.scLccccccccLcs.',
  '.scLccccccccLcs.',
  '.scLccccccccLcs.',
  '.scLLLLLLLLLLcs.',
  '.sccccccccccccs.',
  '.ssssssssssssss.',
  '................',
  '................',
  '................',
];

const MAP_CHIMNEY = [
  '.00000000.',
  '0SSSSSSSS0',
  '0LLLLLLLL0',
  '0000000000',
  '.0RRrRRR0.',
  '.0rrrrrr0.',
  '.0RRRRrR0.',
  '.0rrrrrr0.',
  '.0RRrRRR0.',
  '.00000000.',
];

// =========================================================================
// CACHE & COMPILER INIT
// =========================================================================

const tileCache = new Map();
const grassVariants = [];
const pathAutoCache = new Map(); // bitmask 0..15 -> HTMLCanvasElement
let treeBaseCanvas = null;
let treeCanopyCanvas = null;
let tallGrassFrontCanvas = null;
let chimneyCanvas = null;

/** Build all 16 path auto-tile edge/corner canvases cleanly from pixel-art strips. */
function buildPathAutoTile(mask) {
  // mask bits: 1=N grass, 2=E grass, 4=S grass, 8=W grass
  const c = compilePixelMap(MAP_PATH_CENTER, PAL_PATH);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const n = Boolean(mask & 1);
  const e = Boolean(mask & 2);
  const s = Boolean(mask & 4);
  const w = Boolean(mask & 8);

  if (n) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(0, 0, 16, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(0, 2, 16, 1);
    ctx.fillStyle = PAL_PATH['2'];
    ctx.fillRect(0, 3, 16, 1);
  }
  if (s) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(0, 14, 16, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(0, 13, 16, 1);
    ctx.fillStyle = PAL_PATH['2'];
    ctx.fillRect(0, 12, 16, 1);
  }
  if (w) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(0, 0, 2, 16);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(2, 0, 1, 16);
    ctx.fillStyle = PAL_PATH['2'];
    ctx.fillRect(3, 0, 1, 16);
  }
  if (e) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(14, 0, 2, 16);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(13, 0, 1, 16);
    ctx.fillStyle = PAL_PATH['2'];
    ctx.fillRect(12, 0, 1, 16);
  }

  // Round outer corners cleanly where two grassy edges meet
  if (n && w) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(3, 3, 1, 1);
  }
  if (n && e) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(12, 2, 2, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(12, 3, 1, 1);
  }
  if (s && w) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(2, 12, 2, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(3, 12, 1, 1);
  }
  if (s && e) {
    ctx.fillStyle = PAL_PATH['1'];
    ctx.fillRect(12, 12, 2, 2);
    ctx.fillStyle = PAL_PATH['0'];
    ctx.fillRect(12, 12, 1, 1);
  }

  return c;
}

/** Compile all pixel-map tiles once at startup. */
export function initTiles() {
  if (tileCache.size > 0) return;

  const grassA = compilePixelMap(MAP_GRASS_A, PAL_GRASS);
  const grassB = compilePixelMap(MAP_GRASS_B, PAL_GRASS);
  grassVariants.push(grassA, grassB);
  tileCache.set(TILE.GRASS, [grassA]);

  // Compile all 16 path auto-tile variants
  for (let mask = 0; mask < 16; mask++) {
    pathAutoCache.set(mask, buildPathAutoTile(mask));
  }
  tileCache.set(TILE.PATH, [pathAutoCache.get(0)]);

  // 3-frame synchronized flowers on grass
  tileCache.set(TILE.FLOWER, [
    compilePixelMap(MAP_FLOWER_0, PAL_FLOWER, { underlay: grassA }),
    compilePixelMap(MAP_FLOWER_1, PAL_FLOWER, { underlay: grassA }),
    compilePixelMap(MAP_FLOWER_2, PAL_FLOWER, { underlay: grassA }),
  ]);

  // 2-frame rustling tall grass + foreground leg-hiding overlay
  tileCache.set(TILE.TALL_GRASS, [
    compilePixelMap(MAP_TALL_GRASS_0, PAL_TALL_GRASS),
    compilePixelMap(MAP_TALL_GRASS_1, PAL_TALL_GRASS),
  ]);
  tallGrassFrontCanvas = compilePixelMap(MAP_TALL_GRASS_FRONT, PAL_TALL_GRASS);

  // 4-frame scrolling water
  tileCache.set(
    TILE.WATER,
    MAP_WATER_FRAMES.map((rows) => compilePixelMap(rows, PAL_WATER))
  );

  // One-way jump-down ledge
  tileCache.set(TILE.LEDGE, [compilePixelMap(MAP_LEDGE, PAL_LEDGE)]);

  // Classic 32x32 Gen 3 bumpy-clump tree -> split into trunk base & overhead canopy
  const fullTree = compilePixelMap(MAP_TREE_32, PAL_TREE);
  treeBaseCanvas = document.createElement('canvas');
  treeBaseCanvas.width = 16;
  treeBaseCanvas.height = 16;
  const tbCtx = treeBaseCanvas.getContext('2d');
  tbCtx.imageSmoothingEnabled = false;
  tbCtx.drawImage(grassA, 0, 0);
  tbCtx.drawImage(fullTree, 8, 16, 16, 16, 0, 0, 16, 16);
  tileCache.set(TILE.TREE, [treeBaseCanvas]);

  treeCanopyCanvas = document.createElement('canvas');
  treeCanopyCanvas.width = 32;
  treeCanopyCanvas.height = 24;
  const tcCtx = treeCanopyCanvas.getContext('2d');
  tcCtx.imageSmoothingEnabled = false;
  tcCtx.drawImage(fullTree, 0, 0, 32, 24, 0, 0, 32, 24);

  chimneyCanvas = compilePixelMap(MAP_CHIMNEY, PAL_INTERIOR);

  // Transparent props for clean Y-sorting
  tileCache.set(TILE.FENCE, [compilePixelMap(MAP_FENCE, PAL_FENCE)]);
  tileCache.set(TILE.SIGN, [compilePixelMap(MAP_SIGN, PAL_WOOD_PROP)]);
  tileCache.set(TILE.LAB_SIGN, [compilePixelMap(MAP_LAB_SIGN, PAL_WOOD_PROP)]);
  tileCache.set(TILE.MAILBOX, [compilePixelMap(MAP_MAILBOX, PAL_WOOD_PROP)]);

  // Palette-swapped houses & lab
  tileCache.set(TILE.ROOF_RED, [compilePixelMap(MAP_ROOF, PAL_ROOF_RED)]);
  tileCache.set(TILE.ROOF_RED_TRIM, [compilePixelMap(MAP_ROOF_TRIM, PAL_ROOF_RED)]);
  tileCache.set(TILE.ROOF_BLUE, [compilePixelMap(MAP_ROOF, PAL_ROOF_BLUE)]);
  tileCache.set(TILE.ROOF_BLUE_TRIM, [compilePixelMap(MAP_ROOF_TRIM, PAL_ROOF_BLUE)]);
  tileCache.set(TILE.ROOF_LAB, [compilePixelMap(MAP_ROOF, PAL_ROOF_LAB)]);
  tileCache.set(TILE.ROOF_LAB_TRIM, [compilePixelMap(MAP_ROOF_TRIM, PAL_ROOF_LAB)]);

  tileCache.set(TILE.HOUSE_WALL, [compilePixelMap(MAP_WALL_EXT, PAL_HOUSE_WALL)]);
  tileCache.set(TILE.HOUSE_WINDOW, [compilePixelMap(MAP_WINDOW_EXT, PAL_HOUSE_WALL)]);
  tileCache.set(TILE.DOOR, [compilePixelMap(MAP_DOOR_EXT, PAL_HOUSE_WALL)]);

  tileCache.set(TILE.LAB_WALL, [compilePixelMap(MAP_WALL_EXT, PAL_LAB_WALL)]);
  tileCache.set(TILE.LAB_WINDOW, [compilePixelMap(MAP_WINDOW_EXT, PAL_LAB_WALL)]);
  tileCache.set(TILE.LAB_DOOR, [compilePixelMap(MAP_DOOR_EXT, PAL_LAB_WALL)]);

  // Interiors
  const woodFloor = compilePixelMap(MAP_WOOD_FLOOR, PAL_INTERIOR);
  const labFloor = compilePixelMap(MAP_LAB_FLOOR, PAL_INTERIOR);
  tileCache.set(TILE.WOOD_FLOOR, [woodFloor]);
  tileCache.set(TILE.LAB_FLOOR, [labFloor]);
  tileCache.set(TILE.RUG_RED, [compilePixelMap(MAP_RUG_RED, PAL_INTERIOR)]);
  tileCache.set(TILE.RUG_BLUE, [compilePixelMap(MAP_RUG_BLUE, PAL_INTERIOR)]);
  tileCache.set(TILE.DOORMAT, [
    compilePixelMap(MAP_DOORMAT_OVERLAY, PAL_INTERIOR, { underlay: woodFloor }),
  ]);
  tileCache.set(TILE.LAB_DOORMAT, [
    compilePixelMap(MAP_LAB_MAT_OVERLAY, PAL_INTERIOR, { underlay: labFloor }),
  ]);
  tileCache.set(TILE.STAIRS_DOWN, [compilePixelMap(MAP_STAIRS_DOWN, PAL_INTERIOR)]);
  tileCache.set(TILE.STAIRS_UP, [compilePixelMap(MAP_STAIRS_UP, PAL_INTERIOR)]);

  tileCache.set(TILE.WALL_TOP, [compilePixelMap(MAP_WALL_TOP, PAL_INTERIOR)]);
  tileCache.set(TILE.WALL_BOT, [compilePixelMap(MAP_WALL_BOT, PAL_INTERIOR)]);
  tileCache.set(TILE.WALL_WINDOW, [compilePixelMap(MAP_WALL_WINDOW, PAL_INTERIOR)]);
  tileCache.set(TILE.LAB_WALL_TOP, [compilePixelMap(MAP_LAB_WALL_TOP, PAL_INTERIOR)]);
  tileCache.set(TILE.LAB_WALL_BOT, [compilePixelMap(MAP_LAB_WALL_BOT, PAL_INTERIOR)]);
  tileCache.set(TILE.LAB_WINDOW_IN, [compilePixelMap(MAP_LAB_WINDOW_IN, PAL_INTERIOR)]);

  tileCache.set(TILE.BED_TOP, [compilePixelMap(MAP_BED_TOP, PAL_INTERIOR)]);
  tileCache.set(TILE.BED_BOT, [compilePixelMap(MAP_BED_BOT, PAL_INTERIOR)]);
  tileCache.set(TILE.PC_DESK, [compilePixelMap(MAP_PC_DESK, PAL_INTERIOR, { underlay: woodFloor })]);
  tileCache.set(TILE.DESK, [compilePixelMap(MAP_DESK, PAL_INTERIOR, { underlay: woodFloor })]);
  tileCache.set(TILE.TV, [
    compilePixelMap(MAP_TV_0, PAL_INTERIOR, { underlay: woodFloor }),
    compilePixelMap(MAP_TV_1, PAL_INTERIOR, { underlay: woodFloor }),
  ]);
  tileCache.set(TILE.PLANT, [compilePixelMap(MAP_PLANT, PAL_INTERIOR)]);
  tileCache.set(TILE.BOOKSHELF, [compilePixelMap(MAP_BOOKSHELF, PAL_INTERIOR)]);
  tileCache.set(TILE.LAB_MACHINE, [
    compilePixelMap(MAP_LAB_MACHINE_0, PAL_INTERIOR, { underlay: labFloor }),
    compilePixelMap(MAP_LAB_MACHINE_1, PAL_INTERIOR, { underlay: labFloor }),
  ]);
  tileCache.set(TILE.TABLE_LEFT, [compilePixelMap(MAP_TABLE_LEFT, PAL_INTERIOR)]);
  tileCache.set(TILE.TABLE_RIGHT, [compilePixelMap(MAP_TABLE_RIGHT, PAL_INTERIOR)]);
  tileCache.set(TILE.CHAIR, [compilePixelMap(MAP_CHAIR, PAL_INTERIOR)]);
  tileCache.set(TILE.LAB_TABLE, [compilePixelMap(MAP_LAB_TABLE, PAL_INTERIOR)]);
  tileCache.set(TILE.KITCHEN_FRIDGE, [
    compilePixelMap(MAP_FRIDGE, PAL_INTERIOR, { underlay: woodFloor }),
  ]);
  tileCache.set(TILE.KITCHEN_STOVE, [
    compilePixelMap(MAP_STOVE, PAL_INTERIOR, { underlay: woodFloor }),
  ]);
  tileCache.set(TILE.KITCHEN_COUNTER, [
    compilePixelMap(MAP_COUNTER, PAL_INTERIOR, { underlay: woodFloor }),
  ]);
}

/** External PNG tileset override support (falls back to pixel-map tiles for omitted entries). */
export function registerExternalTileset(img, indexJson) {
  if (!img || !indexJson || !indexJson.tiles) return;
  const size = indexJson.tileSize || TILE_SIZE;

  for (const [tileName, coord] of Object.entries(indexJson.tiles)) {
    const tileId = TILE[tileName];
    if (tileId === undefined || !coord) continue;

    const coords = Array.isArray(coord) ? coord : [coord];
    const frames = coords.map(({ x, y }) => {
      const c = document.createElement('canvas');
      c.width = TILE_SIZE;
      c.height = TILE_SIZE;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x * size, y * size, size, size, 0, 0, TILE_SIZE, TILE_SIZE);
      return c;
    });
    tileCache.set(tileId, frames);
  }
}

function tileAt(map, tx, ty) {
  if (!map || ty < 0 || tx < 0 || ty >= map.height || tx >= map.width) return -1;
  return map.tiles[ty][tx];
}

function isGrassLike(id) {
  return (
    id === TILE.GRASS ||
    id === TILE.FLOWER ||
    id === TILE.TALL_GRASS ||
    id === TILE.TREE ||
    id === TILE.FENCE ||
    id === TILE.SIGN ||
    id === TILE.LAB_SIGN ||
    id === TILE.MAILBOX ||
    id === TILE.LEDGE
  );
}

/**
 * Draw a ground tile at (tx, ty) with 2-variant grass, full 16-case path auto-tiling,
 * and pixel-art water shoreline foam edges.
 */
export function drawMapTile(ctx, map, tx, ty, dx, dy, animFrame = 0) {
  const tileId = map.tiles[ty][tx];
  dx = Math.round(dx);
  dy = Math.round(dy);

  // 1. 2-variant seeded meadow grass
  if (tileId === TILE.GRASS && tileCache.get(TILE.GRASS)[0] === grassVariants[0]) {
    const v = tileHash(tx, ty) % grassVariants.length;
    ctx.drawImage(grassVariants[v], dx, dy);
    return;
  }

  // 2. Full 16-case auto-tiled dirt path
  if (tileId === TILE.PATH && tileCache.get(TILE.PATH)[0] === pathAutoCache.get(0)) {
    let mask = 0;
    if (isGrassLike(tileAt(map, tx, ty - 1))) mask |= 1;
    if (isGrassLike(tileAt(map, tx + 1, ty))) mask |= 2;
    if (isGrassLike(tileAt(map, tx, ty + 1))) mask |= 4;
    if (isGrassLike(tileAt(map, tx - 1, ty))) mask |= 8;
    ctx.drawImage(pathAutoCache.get(mask), dx, dy);
    return;
  }

  // Draw base compiled tile
  const frames = tileCache.get(tileId);
  if (frames) {
    const img = frames.length > 1 ? frames[animFrame % frames.length] : frames[0];
    ctx.drawImage(img, dx, dy);
  }

  // 3. Pixel-art pond shoreline rim + lighter foam crest line
  if (tileId === TILE.WATER) {
    const nW = tileAt(map, tx, ty - 1) === TILE.WATER;
    const sW = tileAt(map, tx, ty + 1) === TILE.WATER;
    const wW = tileAt(map, tx - 1, ty) === TILE.WATER;
    const eW = tileAt(map, tx + 1, ty) === TILE.WATER;

    if (!nW) {
      ctx.fillStyle = PAL_WATER['6'];
      ctx.fillRect(dx, dy, 16, 1);
      ctx.fillStyle = PAL_WATER['5'];
      ctx.fillRect(dx, dy + 1, 16, 2);
      ctx.fillStyle = PAL_WATER['0'];
      ctx.fillRect(dx, dy + 3, 16, 1);
      ctx.fillStyle = PAL_WATER['4'];
      ctx.fillRect(dx + 1, dy + 4, 14, 1);
    }
    if (!sW) {
      ctx.fillStyle = PAL_WATER['6'];
      ctx.fillRect(dx, dy + 15, 16, 1);
      ctx.fillStyle = PAL_WATER['5'];
      ctx.fillRect(dx, dy + 14, 16, 1);
      ctx.fillStyle = PAL_WATER['4'];
      ctx.fillRect(dx + 1, dy + 13, 14, 1);
    }
    if (!wW) {
      ctx.fillStyle = PAL_WATER['6'];
      ctx.fillRect(dx, dy, 1, 16);
      ctx.fillStyle = PAL_WATER['5'];
      ctx.fillRect(dx + 1, dy, 2, 16);
      ctx.fillStyle = PAL_WATER['4'];
      ctx.fillRect(dx + 3, dy + 1, 1, 14);
    }
    if (!eW) {
      ctx.fillStyle = PAL_WATER['6'];
      ctx.fillRect(dx + 15, dy, 1, 16);
      ctx.fillStyle = PAL_WATER['5'];
      ctx.fillRect(dx + 13, dy, 2, 16);
      ctx.fillStyle = PAL_WATER['4'];
      ctx.fillRect(dx + 12, dy + 1, 1, 14);
    }
  }
}

/** Draw the 32x24 overlapping Gen 3 tree canopy on the overhead layer. */
export function drawTreeOverhead(ctx, dx, dy) {
  if (!treeCanopyCanvas) return;
  ctx.drawImage(treeCanopyCanvas, Math.round(dx - 8), Math.round(dy - 16));
}

/** Draw foreground tall-grass blades ON TOP of a character standing in tall grass. */
export function drawTallGrassOverlay(ctx, dx, dy) {
  if (!tallGrassFrontCanvas) return;
  ctx.drawImage(tallGrassFrontCanvas, Math.round(dx), Math.round(dy));
}

/** Draw a pixel-art brick chimney on the overhead layer. */
export function drawChimneyOverhead(ctx, dx, dy) {
  if (!chimneyCanvas) return;
  ctx.drawImage(chimneyCanvas, Math.round(dx + 3), Math.round(dy - 6));
}

export function drawTile(ctx, tileId, dx, dy, animFrame = 0) {
  const frames = tileCache.get(tileId);
  if (!frames) return;
  const img = frames.length > 1 ? frames[animFrame % frames.length] : frames[0];
  ctx.drawImage(img, Math.round(dx), Math.round(dy));
}

export { stampPixelMap };
