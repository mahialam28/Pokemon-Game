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
  CENTER_SIGN_P: 23,
  MART_SIGN_M: 24,
  FOUNTAIN: 25,

  // Indoor floors & warps
  WOOD_FLOOR: 30,
  LAB_FLOOR: 31,
  RUG_RED: 32,
  RUG_BLUE: 33,
  DOORMAT: 34,
  STAIRS_DOWN: 35,
  STAIRS_UP: 36,
  LAB_DOORMAT: 37,
  CENTER_FLOOR: 38,

  // Indoor walls
  WALL_TOP: 40,
  WALL_BOT: 41,
  WALL_WINDOW: 42,
  LAB_WALL_TOP: 43,
  LAB_WALL_BOT: 44,
  LAB_WINDOW_IN: 45,
  CENTER_WALL_TOP: 46,
  CENTER_WALL_BOT: 47,

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
  COUNTER: 65,
  HEAL_MACHINE: 66,
  SOFA_L: 67,
  SOFA_R: 68,
  MART_SHELF: 69,

  // Pokémon Center exterior (4x4 tiles)
  PC_ROOF_00: 90,
  PC_ROOF_10: 91,
  PC_ROOF_20: 92,
  PC_ROOF_30: 93,
  PC_ROOF_01: 94,
  PC_ROOF_11: 95,
  PC_ROOF_21: 96,
  PC_ROOF_31: 97,
  PC_WALL_02: 98,
  PC_WALL_12: 99,
  PC_WALL_22: 100,
  PC_WALL_32: 101,
  PC_WALL_03: 102,
  PC_DOOR_13: 103,
  PC_DOOR_23: 104,
  PC_WALL_33: 105,

  // Main Character House Exterior
  HERO_ROOF_L: 110,
  HERO_ROOF_M: 111,
  HERO_ROOF_DORMER: 112,
  HERO_ROOF_R: 113,
  HERO_WALL_L: 117,
  HERO_WALL_WIN: 118,
  HERO_BALCONY: 119,
  HERO_WALL_R: 120,
  HERO_DOOR: 122,

  // Rival House & Training Exterior
  RIVAL_ROOF_L: 125,
  RIVAL_ROOF_PEAK: 126,
  RIVAL_ROOF_R: 127,
  RIVAL_WALL_BRICK: 131,
  RIVAL_WALL_WIN: 132,
  RIVAL_DOOR: 133,
  TRAIN_BAG: 134,
  TRAIN_WEIGHTS: 135,
  TRAIN_SAND: 136,

  // Poké Mart Exterior (4x4)
  MART_ROOF_00: 140,
  MART_ROOF_10: 141,
  MART_ROOF_20: 142,
  MART_ROOF_30: 143,
  MART_ROOF_01: 144,
  MART_ROOF_11: 145,
  MART_ROOF_21: 146,
  MART_ROOF_31: 147,
  MART_WALL_02: 148,
  MART_WALL_12: 149,
  MART_WALL_22: 150,
  MART_WALL_32: 151,
  MART_WALL_03: 152,
  MART_DOOR_13: 153,
  MART_DOOR_23: 154,
  MART_WALL_33: 155,

  // Cobalt City Gym & Mixed Houses
  GYM_ROOF_00: 160,
  GYM_ROOF_10: 161,
  GYM_ROOF_20: 162,
  GYM_ROOF_30: 163,
  GYM_ROOF_01: 164,
  GYM_ROOF_11: 165,
  GYM_ROOF_21: 166,
  GYM_ROOF_31: 167,
  GYM_WALL_02: 168,
  GYM_WALL_12: 169,
  GYM_WALL_22: 170,
  GYM_WALL_32: 171,
  GYM_WALL_03: 172,
  GYM_DOOR_13: 173,
  GYM_DOOR_23: 174,
  GYM_WALL_33: 175,
  ROOF_AMBER: 176,
  ROOF_AMBER_TRIM: 177,
  DOME_ROOF: 178,

  // Gen 5 Pokémon Center Interior & Furniture
  PC_WALL_RED: 180,
  PC_ELEVATOR: 181,
  PC_WALL_TV: 182,
  PC_FLOOR_MOSAIC_TL: 183,
  PC_FLOOR_MOSAIC_TR: 184,
  PC_FLOOR_MOSAIC_BL: 185,
  PC_FLOOR_MOSAIC_BR: 186,
  PC_FLOOR_BLUE: 187,
  PC_FLOOR_YELLOW: 188,
  SOFA_YELLOW_L: 189,
  SOFA_YELLOW_R: 190,
  PLANT_PALM: 191,

  // Interiors & Mart 2F
  RUG_TEAL_PC: 195,
  TROPHY_CASE: 196,
  GYM_BENCH: 197,
  MART_SHOWCASE: 198,
  VENDING_MACHINE: 199,
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
  TILE.CENTER_SIGN_P,
  TILE.MART_SIGN_M,
  TILE.FOUNTAIN,
  TILE.PC_ROOF_00,
  TILE.PC_ROOF_10,
  TILE.PC_ROOF_20,
  TILE.PC_ROOF_30,
  TILE.PC_ROOF_01,
  TILE.PC_ROOF_11,
  TILE.PC_ROOF_21,
  TILE.PC_ROOF_31,
  TILE.PC_WALL_02,
  TILE.PC_WALL_12,
  TILE.PC_WALL_22,
  TILE.PC_WALL_32,
  TILE.PC_WALL_03,
  TILE.PC_WALL_33,
  TILE.WALL_TOP,
  TILE.WALL_BOT,
  TILE.WALL_WINDOW,
  TILE.LAB_WALL_TOP,
  TILE.LAB_WALL_BOT,
  TILE.LAB_WINDOW_IN,
  TILE.CENTER_WALL_TOP,
  TILE.CENTER_WALL_BOT,
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
  TILE.COUNTER,
  TILE.HEAL_MACHINE,
  TILE.SOFA_L,
  TILE.SOFA_R,
  TILE.MART_SHELF,
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
  TILE.SOFA_L,
  TILE.SOFA_R,
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

// --- Phase 3 Verdant City, Pokémon Center & Poké Mart pixel maps ---
const MAP_CENTER_SIGN_P = [
  '2222222222222222',
  '3300000000000033',
  '330RRRRRRRRRR033',
  '330RwwwwwwRRR033',
  '330RwRRRRwwRR033',
  '330RwRRRRwwRR033',
  '330RwwwwwwRRR033',
  '330RwRRRRRRRR033',
  '330RwRRRRRRRR033',
  '330rrrrrrrrrr033',
  '3300000000000033',
  '3333333333333333',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  '0000000000000000',
];

const MAP_MART_SIGN_M = [
  '2222222222222222',
  '3300000000000033',
  '330cccccccccc033',
  '330cwccccccwc033',
  '330cwwccccwwc033',
  '330cwcwccwcwc033',
  '330cwccwwccwc033',
  '330cwccccccwc033',
  '330cwccccccwc033',
  '330bbbbbbbbbb033',
  '3300000000000033',
  '3333333333333333',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  '0000000000000000',
];

const MAP_FOUNTAIN_0 = [
  '....ssssssss....',
  '..ssLLLLLLLLss..',
  '.sLL22244222LLs.',
  '.sL2234444322Ls.',
  'sL223422224322Ls',
  'sL2322sLLs2232Ls',
  'sL242sL44Ls242Ls',
  'sL242sL22Ls242Ls',
  'sL2322sSSs2232Ls',
  'sL223222222322Ls',
  '.sL2234444322Ls.',
  '.sLL22233222LLs.',
  '..ssSSSSSSSSss..',
  '...ssssssssss...',
  '....ssssssss....',
  '................',
];

const MAP_FOUNTAIN_1 = [
  '....ssssssss....',
  '..ssLLLLLLLLss..',
  '.sLL22322322LLs.',
  '.sL2322442232Ls.',
  'sL232422224232Ls',
  'sL2224sLLs4222Ls',
  'sL223sL22Ls322Ls',
  'sL223sL44Ls322Ls',
  'sL2224sSSs4222Ls',
  'sL232232232232Ls',
  '.sL2322442232Ls.',
  '.sLL22244222LLs.',
  '..ssSSSSSSSSss..',
  '...ssssssssss...',
  '....ssssssss....',
  '................',
];

const MAP_CENTER_FLOOR = [
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'wwwwwwwwLLLLLLLL',
  'WWWWWWWWlllllllw',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'LLLLLLLLwwwwwwww',
  'llllllllWWWWWWWW',
];

const MAP_CENTER_WALL_TOP = [
  'rrrrrrrrrrrrrrrr',
  'RRRRRRRRRRRRRRRR',
  'wwwwwwwwwwwwwwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'RRRRRRRRRRRRRRRR',
  'wwwwwwwwwwwwwwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
  'wwwWWwwwwwwWWwww',
];

const MAP_CENTER_WALL_BOT = [
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
  'RRRRRRRRRRRRRRRR',
  'rrrrrrrrrrrrrrrr',
  'wwwwwwwwwwwwwwww',
  'WWWWWWWWWWWWWWWW',
  'SSSSSSSSSSSSSSSS',
  'ssssssssssssssss',
];

const MAP_SERVICE_COUNTER = [
  'ssssssssssssssss',
  'LLLLLLLLLLLLLLLL',
  'LLLLLLLLLLLLLLLL',
  'llllllllllllllll',
  'RRRRRRRRRRRRRRRR',
  'rrrrrrrrrrrrrrrr',
  'wwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwww',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'SSSSSSSSSSSSSSSS',
  'ssssssssssssssss',
  'ssssssssssssssss',
  '................',
  '................',
  '................',
];

const MAP_HEAL_MACHINE_0 = [
  '.ssssssssssssss.',
  '.sLLLLLLLLLLLLs.',
  '.sLkkkkkkkkkkLs.',
  '.sLksskkkksskLs.',
  '.sLksskkkksskLs.',
  '.sLkkkkkkkkkkLs.',
  '.sLksskkkksskLs.',
  '.sLksskkkksskLs.',
  '.sLkkkkkkkkkkLs.',
  '.sSSSSSSSSSSSSs.',
  '.sSllSllSllSlls.',
  '.sSllllllllllSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '................',
  '................',
];

const MAP_HEAL_MACHINE_1 = [
  '.ssssssssssssss.',
  '.sLLLLLLLLLLLLs.',
  '.sLkkkkkkkkkkLs.',
  '.sLkYYkkkkYYkLs.',
  '.sLkYYkkkkYYkLs.',
  '.sLkkkkkkkkkkLs.',
  '.sLkYYkkkkYYkLs.',
  '.sLkYYkkkkYYkLs.',
  '.sLkkkkkkkkkkLs.',
  '.sSSSSSSSSSSSSs.',
  '.sSllSEESllSlls.',
  '.sSllllllllllSs.',
  '.sSSSSSSSSSSSSs.',
  '.ssssssssssssss.',
  '................',
  '................',
];

const MAP_SOFA_L = [
  '................',
  '.000000000000000',
  '.0RRRRRRRRRRRRRR',
  '.0RRRRRRRRRRRRRR',
  '.0rrrrrrrrrrrrrr',
  '.0RR000000000000',
  '.0RR0RRRRRRRRRRR',
  '.0RR0RRRRRRRRRRR',
  '.0RR0rrrrrrrrrrr',
  '.0rr0RRRRRRRRRRR',
  '.0000rrrrrrrrrrr',
  '.011000000000000',
  '.0000...........',
  '................',
  '................',
  '................',
];

const MAP_SOFA_R = [
  '................',
  '000000000000000.',
  'RRRRRRRRRRRRRR0.',
  'RRRRRRRRRRRRRR0.',
  'rrrrrrrrrrrrrr0.',
  '000000000000RR0.',
  'RRRRRRRRRRR0RR0.',
  'RRRRRRRRRRR0RR0.',
  'rrrrrrrrrrr0RR0.',
  'RRRRRRRRRRR0rr0.',
  'rrrrrrrrrrr0000.',
  '000000000000110.',
  '...........0000.',
  '................',
  '................',
  '................',
];

const MAP_MART_SHELF = [
  'ssssssssssssssss',
  'sLLLLLLLLLLLLLLs',
  'sLRRLLCCLLGGLLYs',
  'sLrrLLccLLggLLys',
  'sSSSSSSSSSSSSSSs',
  'sLLLLLLLLLLLLLLs',
  'sLCCLLYYLLRRLLGs',
  'sLccLLyyLLrrLLgs',
  'sSSSSSSSSSSSSSSs',
  'sLLLLLLLLLLLLLLs',
  'sLGGLLRRLLCCLLYs',
  'sLggLLrrLLccLLys',
  'sSSSSSSSSSSSSSSs',
  'sccccccccccccccs',
  'ssssssssssssssss',
  '................',
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
const PAL_POKECENTER = {
  "0": "#201E2C",
  "1": "#485058",
  "2": "#808890",
  "3": "#B8C0C8",
  "4": "#E8ECE8",
  "5": "#D0E8D0",
  "6": "#F890B8",
  "7": "#E06890",
  "8": "#C03858",
  "9": "#E84038",
  "r": "#981820",
  "Y": "#F8E050",
  "y": "#C8A020",
  "B": "#98D0F8",
  "b": "#5890D8",
  "d": "#285098",
  "D": "#182858"
};

const MAP_PC_ROOF_00 = [
  "..12111112222222",
  ".135289766666666",
  "1352897666336663",
  "2531976663545665",
  "2531976666553665",
  "2531976666666666",
  "2531976666666666",
  "2531976666666666",
  "2531976666555665",
  "2531976666553665",
  "2531976666666666",
  "2531976666666666",
  "2531976666336666",
  "2531976663555665",
  "2531976666553665",
  "2531976666666666",
];

const MAP_PC_ROOF_10 = [
  "2222222222222222",
  "6666666666666666",
  "3666663366663666",
  "4566664456644566",
  "5566665556655366",
  "6666666666666666",
  "6666666666666666",
  "6666666666666666",
  "5566665556655566",
  "5566665556655366",
  "6666666666666666",
  "6666666666666666",
  "3666666366663666",
  "5566665556654566",
  "5566665556654366",
  "6666666666666666",
];

const MAP_PC_ROOF_20 = [
  "2222222222222222",
  "6666666666666666",
  "6633666336666633",
  "6644563445666644",
  "6655366553666655",
  "6666666666666666",
  "6666666666666666",
  "6666666666666666",
  "6655566555666655",
  "6655366553666655",
  "6666666666666666",
  "6666666666666666",
  "6663666636666633",
  "6655563555666655",
  "6655366555666655",
  "6666666666666666",
];

const MAP_PC_ROOF_30 = [
  "2222222111122...",
  "66666666792332..",
  "666636666792332.",
  "5665456666981331",
  "3665556666981331",
  "6666666666981331",
  "6666666666981331",
  "6666666666981331",
  "5665556666981331",
  "3665556666981331",
  "6666666666981331",
  "6666666666981331",
  "6666366666981331",
  "5665456666981331",
  "3665456666981331",
  "6666666666981331",
];

const MAP_PC_ROOF_01 = [
  "2531976666666666",
  "2531976666666666",
  "2531976666555665",
  "2531996666553665",
  "2531999766666666",
  "2531999776666666",
  "2532899999999999",
  "2553289999999999",
  "2555328888888888",
  "1355532111111111",
  "1235555333333333",
  "1223555555555555",
  "1222222222222222",
  ".122222222222222",
  "..12222222222222",
  "..11111111111111",
];

const MAP_PC_ROOF_11 = [
  "6666666666666666",
  "6666666666666666",
  "5566665556655566",
  "5366665536655366",
  "6666666666666666",
  "6666666666666666",
  "9999999999999988",
  "9999999999988822",
  "8888888888811255",
  "1111111111233554",
  "3333333212354444",
  "5555533223354444",
  "2222221233354533",
  "2222211233333322",
  "2222112232222223",
  "1111112222222222",
];

const MAP_PC_ROOF_21 = [
  "6666666666666666",
  "6666666666666666",
  "6655566555666655",
  "6655366553666655",
  "6666666666666666",
  "6666666666666666",
  "8899999999999999",
  "2288999999999999",
  "5321888888888888",
  "4553311111111111",
  "4444522233333333",
  "4444532223555555",
  "3354533321222222",
  "2233333321122222",
  "3222222321122222",
  "2222222221111111",
];

const MAP_PC_ROOF_31 = [
  "6666666666981331",
  "6666666666981331",
  "5665556666981331",
  "3665536667981331",
  "6666666679981331",
  "6666666799981331",
  "9999999999982531",
  "9999999999823531",
  "8888888888235531",
  "1111111112355521",
  "3333333335555321",
  "5555555555532221",
  "2222222222222221",
  "222222222222221.",
  "22222222222221..",
  "11111111111111..",
];

const MAP_PC_WALL_02 = [
  "..11111111111111",
  "..1222211yYYYYy1",
  "..12222225YY55y1",
  "..123332255Y55y2",
  "..123553255Y55y2",
  "..123543255Y55y2",
  "..112543223y3322",
  "..11133211111111",
  "..11111111111111",
  "..12211111166666",
  "..12222222166666",
  "..12333332176666",
  "..12355552199766",
  "..12354452118899",
  "..12354452111188",
  "..12354452112211",
];

const MAP_PC_WALL_12 = [
  "1111112222222111",
  "2221111222218977",
  "2222112222187765",
  "2332112221876555",
  "3552122218976666",
  "5443122289976766",
  "5443132199965566",
  "2332132199976355",
  "1221132199999763",
  "6662122188888888",
  "6667111111111111",
  "6666666666666666",
  "6666666666666666",
  "9999999999999999",
  "8888888888888888",
  "1111111111111111",
];

const MAP_PC_WALL_22 = [
  "1112222222111111",
  "7981123221112221",
  "3679822321112222",
  "5536782222112332",
  "6636798222113553",
  "6766799122223443",
  "6353799812223443",
  "5536999812212332",
  "3679999812211221",
  "8888888812217666",
  "1111111111126666",
  "6666666666666666",
  "6666666666666666",
  "9999999999999999",
  "8888888888888888",
  "1111111111111111",
];

const MAP_PC_WALL_32 = [
  "11111111111111..",
  "1YYYYYy1222211..",
  "2Y55Y531222211..",
  "2Y55Y531333211..",
  "2Y55Y532555211..",
  "2Y55Y532545211..",
  "1y33y322545211..",
  "11111111332111..",
  "11111111111111..",
  "66667111111211..",
  "66667122222211..",
  "66677123333211..",
  "67798135555211..",
  "99881134445211..",
  "88111134445211..",
  "11221134445211..",
];

const MAP_PC_WALL_03 = [
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..12354452113212",
  "..11254452113212",
  "..11233332113212",
  "..11111111112212",
  "...1122222111112",
  "....122222111111",
  ".....11111112111",
  "............1111",
  "..............11",
];

const MAP_PC_DOOR_13 = [
  "1dbbbbd11dbbbbd1",
  "1dbbbbd11dbbbbd1",
  "1dbbbbd11dbbbbd1",
  "1bbbbbd11bbbbbd1",
  "1bbbbb211bbbbb21",
  "12bbbb211bbbbb21",
  "123333211bb33321",
  "1233332112333321",
  "1233332112333321",
  "1233332112333321",
  "12b3332112b33321",
  "12bbb3211bbb3321",
  "1bbbbb211bbbbb21",
  "12bbdd111dddbb21",
  "1111111111111111",
  "1...............",
];

const MAP_PC_DOOR_23 = [
  "1dbbbbd11dbbbbd1",
  "1dbbbbd11bbbbbd1",
  "1dbbbbd11bbbbbd1",
  "1bbbbbd11bbbbbd1",
  "1bbbbb211bbbbb21",
  "1bbbbb211bbbbb21",
  "1b333b211b333321",
  "1233332112333321",
  "1333332113333321",
  "13333b2113333321",
  "12333b2113333b21",
  "123bbb2112bbbb21",
  "12bbbbd11bbbbb21",
  "12bbddd11dddbb21",
  "1111111111111111",
  "...............1",
];

const MAP_PC_WALL_33 = [
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221134445211..",
  "21221123332111..",
  "21221111111111..",
  "2111112222211...",
  "111111222221....",
  "11121111111.....",
  "1111............",
  "11..............",
];


// ---------------------------------------------------------------------------
// 1. PALETTES
// ---------------------------------------------------------------------------
const R = (...rows) => rows;
const PAL_HERO_HOUSE = {
  '0': '#162C38', '1': '#225068', '2': '#327494', '3': '#4E9EC2', '4': '#7ED0EC',
  'w': '#2A2420', 'W': '#FFF8F0', 'e': '#D8CAB8', 'c': '#68A8D8', 'C': '#B0DCF8',
  'g': '#388838', 'G': '#68C858', 'r': '#E04038', 'y': '#F8D840', 'b': '#64442C',
  'B': '#946848', 'm': '#E84038', 'M': '#FFFFFF',
};

const PAL_RIVAL_HOUSE = {
  '0': '#181A24', '1': '#282C38', '2': '#3E4658', '3': '#5E6A80', '4': '#8898B4',
  'b': '#581814', 'B': '#882C24', 'r': '#B84034', 'R': '#E05040', 'm': '#F08070',
  'w': '#3C281C', 'W': '#6C4830', 'c': '#4C7094', 'p': '#B82020', 'P': '#E84038',
  'i': '#2C3038', 'I': '#4C5464', 's': '#D8BC84', 'S': '#F0D4A0',
};

const PAL_MART_EXT = {
  '0': '#121C38', '1': '#1C2E60', '2': '#2A4690', '3': '#3E66CC', '4': '#6C94F0',
  'y': '#B88414', 'Y': '#F8D434', 'w': '#E4E8EE', 'W': '#FFFFFF', 'c': '#242830',
  'e': '#68707C', 'm': '#D4D8E0', 'M': '#F4F6F8', 'g': '#284878', 'G': '#4478B8',
  'b': '#6CA8EC', 'B': '#B0D4FC',
};

const PAL_GYM_EXT = {
  '0': '#302008', '1': '#5C3C10', '2': '#94641C', '3': '#C88C28', '4': '#F4BC44',
  'm': '#282C34', 'M': '#586070', 'l': '#9CA6B8', 'L': '#D8E0EC', 'w': '#F8FAFE',
  'g': '#B87814', 'G': '#F8D844', 'd': '#341818', 'D': '#5C2828', 'c': '#B83030',
};

const PAL_INTERIORS_UPGRADE = {
  '0': '#161824', '1': '#2C3044', '2': '#4C546C', '3': '#7884A0', '4': '#C0C8DC',
  'w': '#FFFFFF',
  'r': '#902024', 'R': '#D03438', 'a': '#E85458',
  'e': '#243454', 'E': '#3C5C90',
  'f': '#F0E0B8', 'F': '#FAF4DC', 'm': '#D8C490', 'M': '#B8A068',
  'b': '#386498', 'B': '#5488C8', 'c': '#90C0E8',
  'y': '#D4A828', 'Y': '#F8D444', 'u': '#785088', 'U': '#B48CC8',
  'p': '#307838', 'P': '#50A848', 't': '#885834',
  'k': '#1E5868', 'K': '#34889C', 'h': '#7AD0E0',
  'g': '#B88410', 'G': '#F8D438', 's': '#804820',
  'i': '#2C3038', 'I': '#5C6474', 'q': '#B82828',
  'v': '#2C3448', 'V': '#4C5C78', 'j': '#80D0F8',
};

// ---------------------------------------------------------------------------
// 2. PIXEL MAPS: MAIN CHARACTER HOUSE
// ---------------------------------------------------------------------------
const MAP_HERO_ROOF_L = R(
  '.......000000000',
  '.....00444333222',
  '....044333322222',
  '...0433222222111',
  '..04322222111111',
  '..03222211111110',
  '.032221111111000',
  '.022211111100440',
  '.022111111004330',
  '0221111110043220',
  '0211111100432210',
  '0211111004322110',
  '0111110043221110',
  '0111100432211100',
  '0000000000000000',
  '0wwwwwwwwwwwwwww',
);

const MAP_HERO_ROOF_M = R(
  '0000000000000000',
  '2222222222222222',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  '4444444444444444',
  '3333333333333333',
  '2222222222222222',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  'wwwwwwwwwwwwwwww',
);

const MAP_HERO_ROOF_DORMER = R(
  '0000000000000000',
  '2222220000222222',
  '2222204444022222',
  '1111043333401111',
  '1110430000340111',
  '110430WwwW034011',
  '00030WccccW03000',
  '44030wCCccw03044',
  '33030WccccW03033',
  '22030WwwwwwW0222',
  '222030WWWW032222',
  '1111030000311111',
  '1111103333011111',
  '1111110000111111',
  '0000000000000000',
  'wwwwwwwwwwwwwwww',
);

const MAP_HERO_ROOF_R = R(
  '000000000.......',
  '22233344400.....',
  '222223333440....',
  '1112222223340...',
  '11111122222340..',
  '01111111222230..',
  '000111111122230.',
  '044001111112220.',
  '033400111111220.',
  '0223400111111220',
  '0122340011111120',
  '0112234001111120',
  '0111223400111110',
  '0011122340011110',
  '0000000000000000',
  'wwwwwwwwwwwwwww0',
);

const MAP_HERO_WALL_L = R(
  'wWWWWWWWWWWWWWWW',
  'wWWWWWWWWWWWWWWW',
  'weeeeeeeeeeeeeee',
  'wWWWW0000000WWWW',
  'wWWW0cCCCCcc0WWW',
  'weee0ccCCCCc0eee',
  'wWWW0ccccCcc0WWW',
  'wWWW000000000WWW',
  'weee0bbbbbbb0eee',
  'wWWW0grGyrGg0WWW',
  'wWWW0GGryrGG0WWW',
  'weee0bbbbbbb0eee',
  'wWWWWWWWWWWWWWWW',
  'weeeeeeeeeeeeeee',
  'wWWWWWWWWWWWWWWW',
  'w000000000000000',
);

const MAP_HERO_WALL_WIN = R(
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'eeeeeeeeeeeeeeee',
  'WWWW00000000WWWW',
  'WWW0cCCCCccc0WWW',
  'eee0ccCCCCcc0eee',
  'WWW0ccccCccc0WWW',
  'WWW0000000000WWW',
  'eee0bbbbbbbb0eee',
  'WWW0grGyrGyr0WWW',
  'WWW0GGryrGyG0WWW',
  'eee0bbbbbbbb0eee',
  'WWWWWWWWWWWWWWWW',
  'eeeeeeeeeeeeeeee',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
);

const MAP_HERO_BALCONY = R(
  'WWWWWWWWWWWWWWWW',
  'WWWWWW0bbbbbb0WW',
  'eeeeee0bBBBb0eee',
  'WWWWWW0bB0Bb0WWW',
  'WWWWWW0bB0Bb0WWW',
  'eeeeee0bBBBb0eee',
  'WW0bbbbbbbbbbbb0',
  'WW0BBBBBBBBBBBB0',
  'ee0b0b0b0b0b0b0e',
  'WW0BgGGBGrGyGBG0',
  'WW0bgGgGbrGyGbG0',
  'ee0bbbbbbbbbbbb0',
  'WW0gGg0WWWW0gGg0',
  'ee0gg0eeeeee0gg0',
  'WW0g0WWWWWWWW0g0',
  '0000000000000000',
);

const MAP_HERO_WALL_R = R(
  'WWWWWWWWWWWWWWWw',
  'WWWWWWWWWWWWWWWw',
  'eeeeeeeeeeeeeeew',
  'WWWW0000000WWWWw',
  'WWW0cCCCCcc0WWWw',
  'eee0ccCCCCc0eeee',
  'WWW0ccccCcc0WWWw',
  'WWW000000000WWWw',
  'eee0bbbbbbb0eeee',
  'WWW0grGyrGg0WWWw',
  'WWW0GGryrGG0WWWw',
  'eee0bbbbbbb0eeee',
  'WWWWWWWWWWWWWWWw',
  'eeeeeeeeeeeeeeew',
  'WWWWWWWWWWWWWWWw',
  '000000000000000w',
);

const MAP_HERO_DOOR = R(
  '0000000000000000',
  '0333333333333330',
  '0330000000000330',
  '030WW0MMMM0WW030',
  '00Ww0MmmmmM0wW00',
  '00w0MrmMMMmr0w00',
  '0w0MrmmMMmmr0M0w',
  '0w000MM00MM0000w',
  '0w0Wb000000bW00w',
  '0w0bBBBBBBBBb00w',
  '0w0bBwBBBBwBb00w',
  '0w0bBBBBBBBBb00w',
  '0w0bBwBBBBwBb00w',
  '0w0bBBBBBBBBb00w',
  '000bBBBBBBBBb000',
  'eeeeeeeeeeeeeeee',
);

// ---------------------------------------------------------------------------
// 3. PIXEL MAPS: RIVAL HOUSE & TRAINING AREA
// ---------------------------------------------------------------------------
const MAP_RIVAL_ROOF_L = R(
  '.......000000000',
  '.....00444333222',
  '....044333322222',
  '...0433222222111',
  '..04322222111111',
  '..03222211111110',
  '.032221111111000',
  '.022211111100440',
  '.022111111004330',
  '0221111110043220',
  '0211111100432210',
  '0211111004322110',
  '0111110043221110',
  '0111100432211100',
  '0000000000000000',
  'wWWWWWWWWWWWWWWW',
);

const MAP_RIVAL_ROOF_PEAK = R(
  '.......0000.....',
  '......044440....',
  '.....04333340...',
  '....0430000340..',
  '...0430wwww0340.',
  '..0430wcCCc0340.',
  '.0430wcCCCCc0340',
  '0430wcCCcCCc0340',
  '030wcCcCCcCCc030',
  '00wcccCcCcccw00.',
  '0w0wwwwwwwwww0w0',
  '0000000000000000',
  'rBrBrBrBrBrBrBrB',
  'BrBrBrBrBrBrBrBr',
  'rBrBrBrBrBrBrBrB',
  '0000000000000000',
);

const MAP_RIVAL_ROOF_R = R(
  '000000000.......',
  '22233344400.....',
  '222223333440....',
  '1112222223340...',
  '11111122222340..',
  '01111111222230..',
  '000111111122230.',
  '044001111112220.',
  '033400111111220.',
  '0223400111111220',
  '0122340011111120',
  '0112234001111120',
  '0111223400111110',
  '0011122340011110',
  '0000000000000000',
  'WWWWWWWWWWWWWWWw',
);

const MAP_RIVAL_WALL_BRICK = R(
  'rBrBrBrBrBrBrBrB',
  'BrBrBrBrBrBrBrBr',
  'rBrBrBrBrBrBrBrB',
  'BrBr00000000rBrB',
  'rBr0cCCCCccc0BrB',
  'BrB0ccCCCCcc0rBr',
  'rBr0ccccCccc0BrB',
  'BrB0000000000rBr',
  'rBrBrBrBrBrBrBrB',
  'BrBrBrBrBrBrBrBr',
  'rBrBrBrBrBrBrBrB',
  'BrBrBrBrBrBrBrBr',
  'rBrBrBrBrBrBrBrB',
  'BrBrBrBrBrBrBrBr',
  'rBrBrBrBrBrBrBrB',
  '0000000000000000',
);

const MAP_RIVAL_DOOR = R(
  'rBrBrBrBrBrBrBrB',
  'BrBr00000000rBrB',
  'rBr0WWWWWWWW0BrB',
  'Br0WwwwwwwwwW0rB',
  'r0Ww0wwwwww0wW0B',
  '0Ww0wWWWWWWw0wW0',
  '0w0wWWwWWwWWw0w0',
  '0w0wWWwWWwWWw0w0',
  '0w0wWWWWWWWWw0w0',
  '0w0wWWwWWwWWw0w0',
  '0w0wWWwWWwWWw0w0',
  '0w0wWWWWWWWWw0w0',
  '0w0wWWwWWwWWw0w0',
  '0w0wWWWWWWWWw0w0',
  '000wWWWWWWWWw000',
  'ssssssssssssssss',
);

const MAP_TRAIN_BAG = R(
  '..0wwwwwwwwww0..',
  '..0wWWWWWWWWw0..',
  '..0w0000000000..',
  '..0w0..0ii0.....',
  '..0w0..0ii0.....',
  '..0w0.0pPPp0....',
  '..0w00pPPPPp0...',
  '..0w00pPPPPp0...',
  '..0w00pPPPPp0...',
  '..0w00pPPPPp0...',
  '..0w00pPPPPp0...',
  '..0w0.0pPPp0....',
  '..0w0..0pp0.....',
  '..0w0...00......',
  '..0w0...........',
  'ssssssssssssssss',
);

const MAP_TRAIN_WEIGHTS = R(
  'ssssssssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'ssss0i0ssss0i0ss',
  'ssss0I0ssss0I0ss',
  'sss00I000000I00s',
  'ss0i0IIIIII0i0s.',
  's0iI0IIIIII0Ii0s',
  's0ii0IIIIII0ii0s',
  'ss000000000000ss',
  'ssss0I0ssss0I0ss',
  'ssss0i0ssss0i0ss',
  'ssssssssssssssss',
);

const MAP_TRAIN_SAND = R(
  'ssssssssssssssss',
  'sssssSssssssssss',
  'ssssssSsssssssss',
  'ssssssssssssssss',
  'ssssssssssSsssss',
  'ssssssssssssssss',
  'sssSssssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssSs',
  'ssssssssssssssss',
  'ssssssSsssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
  'sssssSssssssssss',
  'ssssssssssssssss',
  'ssssssssssssssss',
);

// ---------------------------------------------------------------------------
// 4. PIXEL MAPS: POKÉ MART EXTERIOR (4x4, Blue Octagonal Dome + White Pokéball)
// ---------------------------------------------------------------------------
const MAP_MART_ROOF_00 = R(
  '.......000000000',
  '.....00444333222',
  '....044333322222',
  '...0433222222111',
  '..04322222111111',
  '..03222211111110',
  '.032221111111000',
  '.022211111100yy0',
  '.02211111100YYY0',
  '02211111100yyyy0',
  '0211111100WWWWWW',
  '021111100wwwwwww',
  '0111110033333330',
  '0111100222222200',
  '0000000000000000',
  '0cccccccccccccc0',
);

const MAP_MART_ROOF_10 = R(
  '0000000000000000',
  '2222222222222222',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  'yyyyyyyyyyyyyyyy',
  'YYYYYYYYYYYYYYYY',
  'yyyyyyyyyyyyyyyy',
  'WWWWWWWW00WWWWWW',
  'wwwwwww0WW0wwwww',
  '3333330WwwW03333',
  '2222220WwwW02222',
  '0000000000000000',
  'cccccccccccccccc',
);

const MAP_MART_ROOF_20 = R(
  '0000000000000000',
  '2222222222222222',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  'yyyyyyyyyyyyyyyy',
  'YYYYYYYYYYYYYYYY',
  'yyyyyyyyyyyyyyyy',
  'WWWWWW00WWWWWWWW',
  'wwwww0WW0wwwwwww',
  '33330WwwW0333333',
  '22220WwwW0222222',
  '0000000000000000',
  'cccccccccccccccc',
);

const MAP_MART_ROOF_30 = R(
  '000000000.......',
  '22233344400.....',
  '222223333440....',
  '1112222223340...',
  '11111122222340..',
  '01111111222230..',
  '000111111122230.',
  '0yy001111112220.',
  '0YYY00111111220.',
  '0yyyy00111111220',
  'WWWWWW0011111120',
  'wwwwwww001111120',
  '0333333300111110',
  '0022222220011110',
  '0000000000000000',
  '0cccccccccccccc0',
);

const MAP_MART_ROOF_01 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0000000000000000',
  '0yyyyyyyyyyyyyy0',
  '0YYYYYYYYYYYYYY0',
  '0000000000000000',
);

const MAP_MART_ROOF_11 = R(
  'cccccccccccccccc',
  'cMMMMMMMMMMMMMMc',
  'cm000000000000mc',
  'c0WWWWWWWWWWWW0c',
  'c0W0000000000W0c',
  'c0W0MM0000MM0W0c',
  'c0W0M0wwww0M0W0c',
  'c0W000wwww000W0c',
  'c0W0M0wwww0M0W0c',
  'c0W0MM0000MM0W0c',
  'c0W0000000000W0c',
  'c0WWWWWWWWWWWW0c',
  '0000000000000000',
  'yyyyyyyyyyyyyyyy',
  'YYYYYYYYYYYYYYYY',
  '0000000000000000',
);

const MAP_MART_ROOF_21 = R(
  'cccccccccccccccc',
  'cMMMMMMMMMMMMMMc',
  'cm000000000000mc',
  'c0WWWWWWWWWWWW0c',
  'c0W0000000000W0c',
  'c0W0MM0000MM0W0c',
  'c0W0M0wwww0M0W0c',
  'c0W000wwww000W0c',
  'c0W0M0wwww0M0W0c',
  'c0W0MM0000MM0W0c',
  'c0W0000000000W0c',
  'c0WWWWWWWWWWWW0c',
  '0000000000000000',
  'yyyyyyyyyyyyyyyy',
  'YYYYYYYYYYYYYYYY',
  '0000000000000000',
);

const MAP_MART_ROOF_31 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0000000000000000',
  '0yyyyyyyyyyyyyy0',
  '0YYYYYYYYYYYYYY0',
  '0000000000000000',
);

const MAP_MART_WALL_02 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cccccccccccccc0',
);

const MAP_MART_WALL_12 = R(
  '0000000000000000',
  '0bbbbbbbbbbbbbb0',
  '0bBBBBBBBBBBBBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBBBBBBBBBBBBb0',
  '0000000000000000',
);

const MAP_MART_WALL_22 = R(
  '0000000000000000',
  '0bbbbbbbbbbbbbb0',
  '0bBBBBBBBBBBBBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBggggbbbbgGBb0',
  '0bBBBBBBBBBBBBb0',
  '0000000000000000',
);

const MAP_MART_WALL_32 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cccccccccccccc0',
);

const MAP_MART_WALL_03 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cccccccccccccc0',
  '0eeeeeeeeeeeeee0',
  '0cccccccccccccc0',
  '0000000000000000',
);

const MAP_MART_DOOR_13 = R(
  '0000000000000000',
  '0GGGGGGGG00GGGG0',
  '0GbbbbbbG00GbbG0',
  '0GbBBBBbG00GbBG0',
  '0GbBBBBbG00GbBG0',
  '0GbbbbbbG00GbbG0',
  '0GbbbbbbG00GbbG0',
  '0GbBBBBbG00GbBG0',
  '0GbBBBBbG00GbBG0',
  '0GbbbbbbG00GbbG0',
  '0GbbbbbbG00GbbG0',
  '0GbBBBBbG00GbBG0',
  '0GbBBBBbG00GbBG0',
  '0GbbbbbbG00GbbG0',
  '0GGGGGGGG00GGGG0',
  '0000000000000000',
);

const MAP_MART_DOOR_23 = R(
  '0000000000000000',
  '0GGGG00GGGGGGGG0',
  '0GbbG00GbbbbbbG0',
  '0GbBG00GbBBBBbG0',
  '0GbBG00GbBBBBbG0',
  '0GbbG00GbbbbbbG0',
  '0GbbG00GbbbbbbG0',
  '0GbBG00GbBBBBbG0',
  '0GbBG00GbBBBBbG0',
  '0GbbG00GbbbbbbG0',
  '0GbbG00GbbbbbbG0',
  '0GbBG00GbBBBBbG0',
  '0GbBG00GbBBBBbG0',
  '0GbbG00GbbbbbbG0',
  '0GGGG00GGGGGGGG0',
  '0000000000000000',
);

const MAP_MART_WALL_33 = R(
  '0cccccccccccccc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cmmmmmmmmmmmmc0',
  '0cMMMMMMMMMMMMc0',
  '0cccccccccccccc0',
  '0eeeeeeeeeeeeee0',
  '0cccccccccccccc0',
  '0000000000000000',
);

// ---------------------------------------------------------------------------
// 5. PIXEL MAPS: POKÉMON GYM & COBALT CITY BUILDINGS
// ---------------------------------------------------------------------------
const MAP_GYM_ROOF_00 = R(
  '.......000000000',
  '.....00444333222',
  '....044333322222',
  '...0433222222111',
  '..04322222111111',
  '..03222211111110',
  '.032221111111000',
  '.022211111100GG0',
  '.02211111100GGg0',
  '02211111100GGgg0',
  '0211111100wwwwww',
  '021111100LLLLLLL',
  '01111100llllllll',
  '0111100MMMMMMMM0',
  '0000000000000000',
  '0mmmmmmmmmmmmmm0',
);

const MAP_GYM_ROOF_10 = R(
  '0000000000000000',
  '4444444444444444',
  '3333333333333333',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  'GGGGGGGGGGGGGGGG',
  'gGGGGGGGGGGGGGGg',
  'ggGGGGGGGGGGGGgg',
  'wwwwwwwwwwwwwwww',
  'LLLLLLLLLLLLLLLL',
  'llllllllllllllll',
  'MMMMMMMMMMMMMMMM',
  '0000000000000000',
  'mmmmmmmmmmmmmmmm',
);

const MAP_GYM_ROOF_20 = R(
  '0000000000000000',
  '4444444444444444',
  '3333333333333333',
  '2222222222222222',
  '1111111111111111',
  '1111111111111111',
  '0000000000000000',
  'GGGGGGGGGGGGGGGG',
  'gGGGGGGGGGGGGGGg',
  'ggGGGGGGGGGGGGgg',
  'wwwwwwwwwwwwwwww',
  'LLLLLLLLLLLLLLLL',
  'llllllllllllllll',
  'MMMMMMMMMMMMMMMM',
  '0000000000000000',
  'mmmmmmmmmmmmmmmm',
);

const MAP_GYM_ROOF_30 = R(
  '000000000.......',
  '22233344400.....',
  '222223333440....',
  '1112222223340...',
  '11111122222340..',
  '01111111222230..',
  '000111111122230.',
  '0GG001111112220.',
  '0gGG00111111220.',
  '0ggGG00111111220',
  'wwwwww0011111120',
  'LLLLLLL001111120',
  'llllllll00111110',
  '0MMMMMMMM0011110',
  '0000000000000000',
  '0mmmmmmmmmmmmmm0',
);

const MAP_GYM_ROOF_01 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0000000000000000',
  '0GGGGGGGGGGGGGG0',
  '0gGGGGGGGGGGGGg0',
  '0000000000000000',
);

const MAP_GYM_ROOF_11 = R(
  'mmmmmmmmmmmmmmmm',
  'mLLLLLLLLLLLLLLm',
  'ml000000000000lm',
  'm0GGGGGGGGGGGG0m',
  'm0G0000000000G0m',
  'm0G0gg0000gg0G0m',
  'm0G0g0GGGG0g0G0m',
  'm0G000GGGG000G0m',
  'm0G0g0GGGG0g0G0m',
  'm0G0gg0000gg0G0m',
  'm0G0000000000G0m',
  'm0GGGGGGGGGGGG0m',
  '0000000000000000',
  'GGGGGGGGGGGGGGGG',
  'gGGGGGGGGGGGGGGg',
  '0000000000000000',
);

const MAP_GYM_ROOF_21 = R(
  'mmmmmmmmmmmmmmmm',
  'mLLLLLLLLLLLLLLm',
  'ml000000000000lm',
  'm0GGGGGGGGGGGG0m',
  'm0G0000000000G0m',
  'm0G0gg0000gg0G0m',
  'm0G0g0GGGG0g0G0m',
  'm0G000GGGG000G0m',
  'm0G0g0GGGG0g0G0m',
  'm0G0gg0000gg0G0m',
  'm0G0000000000G0m',
  'm0GGGGGGGGGGGG0m',
  '0000000000000000',
  'GGGGGGGGGGGGGGGG',
  'gGGGGGGGGGGGGGGg',
  '0000000000000000',
);

const MAP_GYM_ROOF_31 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0000000000000000',
  '0GGGGGGGGGGGGGG0',
  '0gGGGGGGGGGGGGg0',
  '0000000000000000',
);

const MAP_GYM_WALL_02 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mLLLLLLLLLLLLm0',
  '0mmmmmmmmmmmmmm0',
);

const MAP_GYM_WALL_12 = R(
  '0000000000000000',
  '0DDDDDDDDDDDDDD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddccddddccddD0',
  '0DddccddddccddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddccddddccddD0',
  '0DddccddddccddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0000000000000000',
);

const MAP_GYM_WALL_22 = R(
  '0000000000000000',
  '0DDDDDDDDDDDDDD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddccddddccddD0',
  '0DddccddddccddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddccddddccddD0',
  '0DddccddddccddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0DddddddddddddD0',
  '0000000000000000',
);

const MAP_GYM_WALL_32 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mLLLLLLLLLLLLm0',
  '0mmmmmmmmmmmmmm0',
);

const MAP_GYM_WALL_03 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mmmmmmmmmmmmmm0',
  '0MMMMMMMMMMMMMM0',
  '0mmmmmmmmmmmmmm0',
  '0000000000000000',
);

const MAP_GYM_DOOR_13 = R(
  '0000000000000000',
  '0DDDDDDDD00DDDD0',
  '0DddddddD00DddD0',
  '0DddccddD00DdcD0',
  '0DddccddD00DdcD0',
  '0DddddddD00DddD0',
  '0DddddddD00DddD0',
  '0DddccddD00DdcD0',
  '0DddccddD00DdcD0',
  '0DddddddD00DddD0',
  '0DddddddD00DddD0',
  '0DddccddD00DdcD0',
  '0DddccddD00DdcD0',
  '0DddddddD00DddD0',
  '0DDDDDDDD00DDDD0',
  '0000000000000000',
);

const MAP_GYM_DOOR_23 = R(
  '0000000000000000',
  '0DDDD00DDDDDDDD0',
  '0DddD00DddddddD0',
  '0DdcD00DddccddD0',
  '0DdcD00DddccddD0',
  '0DddD00DddddddD0',
  '0DddD00DddddddD0',
  '0DdcD00DddccddD0',
  '0DdcD00DddccddD0',
  '0DddD00DddddddD0',
  '0DddD00DddddddD0',
  '0DdcD00DddccddD0',
  '0DdcD00DddccddD0',
  '0DddD00DddddddD0',
  '0DDDD00DDDDDDDD0',
  '0000000000000000',
);

const MAP_GYM_WALL_33 = R(
  '0mmmmmmmmmmmmmm0',
  '0mLLLLLLLLLLLLm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mlLLLLLLLLLLlm0',
  '0mmmmmmmmmmmmmm0',
  '0MMMMMMMMMMMMMM0',
  '0mmmmmmmmmmmmmm0',
  '0000000000000000',
);

const MAP_DOME_ROOF = R(
  '......000000....',
  '....0044444400..',
  '...044333333440.',
  '..04332222223340',
  '.043221100112234',
  '.032211000011223',
  '0322110044001122',
  '0321100433400112',
  '0221100433400112',
  '0211100433400111',
  '0211110044001111',
  '.011111000011111',
  '.011111100111111',
  '..01111111111110',
  '...000000000000.',
  '0000000000000000',
);

// ---------------------------------------------------------------------------
// 6. PIXEL MAPS: INTERIOR FURNITURE & GEN 5 POKÉMON CENTER
// ---------------------------------------------------------------------------
const MAP_PC_WALL_RED = R(
  'rrrrrrrrrrrrrrrr',
  'RRRRRRRRRRRRRRRR',
  'aaaaaaaaaaaaaaaa',
  'RRRRRRRRRRRRRRRR',
  'rrrrrrrrrrrrrrrr',
  '0000000000000000',
  '4444444444444444',
  '3333333333333333',
  '2222222222222222',
  '1111111111111111',
  '0000000000000000',
  'eeeeeeeeeeeeeeee',
  'EEEEEEEEEEEEEEEE',
  'eeeeeeeeeeeeeeee',
  '0000000000000000',
  'ffffffffffffffff',
);

const MAP_PC_ELEVATOR = R(
  '0000000000000000',
  '0EEEEEEEEEEEEEE0',
  '0E000000000000E0',
  '0E0ffffffffff0E0',
  '0E0f00000000f0E0',
  '0E0f0eeeeee0f0E0',
  '0E0f0eEEEEe0f0E0',
  '0E0f0eEeeEe0f0E0',
  '0E0f0eEeeEe0f0E0',
  '0E0f0eEeeEe0f0E0',
  '0E0f0eEEEEe0f0E0',
  '0E0f0eeeeee0f0E0',
  '0E0f00000000f0E0',
  '0E0ffffffffff0E0',
  '0E000000000000E0',
  '0000000000000000',
);

const MAP_PC_WALL_TV = R(
  'rrrrrrrrrrrrrrrr',
  'RR000000000000RR',
  'aa0eeeeeeeeee0aa',
  'RR0e00000000e0RR',
  'rr0e0cCCCCce0rr.',
  '000e0c0ww0ce0000',
  '440e0cwwwwce0444',
  '330e0cwwwwce0333',
  '220e0c0ww0ce0222',
  '110e0ccccccce011',
  '000e00000000e000',
  'ee0eeeeeeeeee0ee',
  'EE000000000000EE',
  'eeeeeeeeeeeeeeee',
  '0000000000000000',
  'ffffffffffffffff',
);

const MAP_PC_FLOOR_MOSAIC_TL = R(
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffff0000',
  'fffffffff000FFFF',
  'fffffff00FFFFFFF',
  'ffffff0FFFFFFFFF',
  'fffff0FFFFFFFFFF',
  'ffff0FFFFFFFFFFF',
  'ffff0FFFFFFFFFFF',
  'fff0FFFFF0000000',
  'fff0FFFF0mmmmmmm',
  'ff0FFFF0mmmmmmmm',
  'ff0FFFF0mmmmmmmm',
  'ff0FFFF0mmmmmmmm',
);

const MAP_PC_FLOOR_MOSAIC_TR = R(
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  '0000ffffffffffff',
  'FFFF000fffffffff',
  'FFFFFFF00fffffff',
  'FFFFFFFFF0ffffff',
  'FFFFFFFFFF0fffff',
  'FFFFFFFFFFF0ffff',
  'FFFFFFFFFFF0ffff',
  '0000000FFFFF0fff',
  'mmmmmmm0FFFF0fff',
  'mmmmmmmm0FFFF0ff',
  'mmmmmmmm0FFFF0ff',
  'mmmmmmmm0FFFF0ff',
);

const MAP_PC_FLOOR_MOSAIC_BL = R(
  'ff0FFFF0mmmmmmmm',
  'ff0FFFF0mmmmmmmm',
  'ff0FFFF0mmmmmmmm',
  'fff0FFFF0mmmmmmm',
  'fff0FFFFF0000000',
  'ffff0FFFFFFFFFFF',
  'ffff0FFFFFFFFFFF',
  'fffff0FFFFFFFFFF',
  'ffffff0FFFFFFFFF',
  'fffffff00FFFFFFF',
  'fffffffff000FFFF',
  'ffffffffffff0000',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
);

const MAP_PC_FLOOR_MOSAIC_BR = R(
  'mmmmmmmm0FFFF0ff',
  'mmmmmmmm0FFFF0ff',
  'mmmmmmmm0FFFF0ff',
  'mmmmmmm0FFFF0fff',
  '0000000FFFFF0fff',
  'FFFFFFFFFFF0ffff',
  'FFFFFFFFFFF0ffff',
  'FFFFFFFFFF0fffff',
  'FFFFFFFFF0ffffff',
  'FFFFFFF00fffffff',
  'FFFF000fffffffff',
  '0000ffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
  'ffffffffffffffff',
);

const MAP_PC_FLOOR_BLUE = R(
  'bbbbbbbbbbbbbbbb',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBcCcCcCcCcCcCcB',
  'bBBBBBBBBBBBBBBb',
  'bBBBBBBBBBBBBBBb',
  'bbbbbbbbbbbbbbbb',
);

const MAP_PC_FLOOR_YELLOW = R(
  'uuuuuuuuuuuuuuuu',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUyYyYyYyYyYyYyU',
  'uUUUUUUUUUUUUUUu',
  'uUUUUUUUUUUUUUUu',
  'uuuuuuuuuuuuuuuu',
);

const MAP_SOFA_YELLOW_L = R(
  '................',
  '................',
  '..00000000000000',
  '..0YYYYYYYYYYYYY',
  '..0YYyYYyYYyYYyY',
  '..0YYYYYYYYYYYYY',
  '..0YY00000000000',
  '..0YY0yyyyyyyyyy',
  '..0YY0YYYYYYYYYY',
  '..0YY0YYYYYYYYYY',
  '..0YY0yyyyyyyyyy',
  '..0YY00000000000',
  '..0YY0ssssssssss',
  '..0000ssssssssss',
  '................',
  '................',
);

const MAP_SOFA_YELLOW_R = R(
  '................',
  '................',
  '00000000000000..',
  'YYYYYYYYYYYYY0..',
  'YyYYyYYyYYyYY0..',
  'YYYYYYYYYYYYY0..',
  '00000000000YY0..',
  'yyyyyyyyyy0YY0..',
  'YYYYYYYYYY0YY0..',
  'YYYYYYYYYY0YY0..',
  'yyyyyyyyyy0YY0..',
  '00000000000YY0..',
  'ssssssssss0YY0..',
  'ssssssssss0000..',
  '................',
  '................',
);

const MAP_PLANT_PALM = R(
  '.....0PPPPP0....',
  '...00PPPPPPP00..',
  '..0PP0pPPPp0PP0.',
  '.0PPPp0ppp0pPPP0',
  '.0PPpPP000PPpPP0',
  '..000PPptpPP000.',
  '....0PPptpPP0...',
  '.....000t000....',
  '.......0t0......',
  '.......0t0......',
  '.....0000000....',
  '....0bbbbbbb0...',
  '....0bBBBBBb0...',
  '....0bBBBBBb0...',
  '....0bbbbbbb0...',
  '.....0000000....',
);

const MAP_RUG_TEAL_PC = R(
  '..000000000000..',
  '.0kKKKhhhhKKKk0.',
  '0kKhhhhhhhhhhKk0',
  '0KhhhKK00KKhhhK0',
  '0KhhK0FFFF0KhhK0',
  '0KhK0FFFFFF0KhK0',
  '0Kh0FFFFFFFF0hK0',
  '0Kh0000mm0000hK0',
  '0Kh0000mm0000hK0',
  '0Kh0FFFFFFFF0hK0',
  '0KhK0FFFFFF0KhK0',
  '0KhhK0FFFF0KhhK0',
  '0KhhhKK00KKhhhK0',
  '0kKhhhhhhhhhhKk0',
  '.0kKKKhhhhKKKk0.',
  '..000000000000..',
);

const MAP_TROPHY_CASE = R(
  '0000000000000000',
  '0ssssssssssssss0',
  '0s00s00ss00s00s0',
  '0s0G00G0s0G00G0s',
  '0s0G00G0s0G00G0s',
  '0s000000s000000s',
  '0ssssssssssssss0',
  '0s..0GGGGGG0..s0',
  '0s.0GGGGGGGG0.s0',
  '0s.0G0GggG0G0.s0',
  '0s..0GGGGGG0..s0',
  '0s...0gGGg0...s0',
  '0s....0gg0....s0',
  '0s...0GGGG0...s0',
  '0ssssssssssssss0',
  '0000000000000000',
);

const MAP_GYM_BENCH = R(
  '................',
  '................',
  '..000000000000..',
  '.0qqqqqqqqqqqq0.',
  '.0qQQQQQQQQQQq0.',
  '.0qqqqqqqqqqqq0.',
  '.00000000000000.',
  '..0I0ssssss0I0..',
  '..0I0ssssss0I0..',
  '.00I00000000I00.',
  '0i0IIIIIIII0i0..',
  '0iI0IIIIIIII0Ii0',
  '0ii0IIIIIIII0ii0',
  '.00000000000000.',
  '..0I0ssssss0I0..',
  '..0i0ssssss0i0..',
);

const MAP_MART_SHOWCASE = R(
  '0000000000000000',
  '0vvvvvvvvvvvvvv0',
  '0vVVVVVVVVVVVVv0',
  '0vV0000000000Vv0',
  '0v0jjjjjjjjjj0v0',
  '0v0jJJJJJJJJj0v0',
  '0v0jJJjJJjJJj0v0',
  '0v0jJJJJJJJJj0v0',
  '0v0jjjjjjjjjj0v0',
  '0vV0000000000Vv0',
  '0vVVVVVVVVVVVVv0',
  '0vVVVVVVVVVVVVv0',
  '0vvvvvvvvvvvvvv0',
  '0VVVVVVVVVVVVVV0',
  '0vvvvvvvvvvvvvv0',
  '0000000000000000',
);

const MAP_VENDING_MACHINE = R(
  '0000000000000000',
  '0eeeeeeeeeeeeee0',
  '0eEEEEEEEEEEEEe0',
  '0eE0000000000Ee0',
  '0e0cCcCcCcCcC0e0',
  '0e0cCcCcCcCcC0e0',
  '0e0cCcCcCcCcC0e0',
  '0eE0000000000Ee0',
  '0eE0rrrr00yy0Ee0',
  '0eE0rrrr00yy0Ee0',
  '0eE0000000000Ee0',
  '0eE0000000000Ee0',
  '0e0bbbbbbbbbb0e0',
  '0eEEEEEEEEEEEEe0',
  '0eeeeeeeeeeeeee0',
  '0000000000000000',
);

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

  // Phase 3 Verdant City, Pokémon Center & Poké Mart tiles
  const centerSignPal = { ...PAL_HOUSE_WALL, R: '#E04040', r: '#A82828' };
  const martSignPal = { ...PAL_LAB_WALL, c: '#3878C8', b: '#224E8C' };
  const fountainPal = { ...PAL_INTERIOR, '2': '#4898E8', '3': '#78C4F8', '4': '#F0FAFF' };
  tileCache.set(TILE.CENTER_SIGN_P, [compilePixelMap(MAP_CENTER_SIGN_P, centerSignPal)]);
  tileCache.set(TILE.MART_SIGN_M, [compilePixelMap(MAP_MART_SIGN_M, martSignPal)]);
  tileCache.set(TILE.FOUNTAIN, [
    compilePixelMap(MAP_FOUNTAIN_0, fountainPal, { underlay: pathAutoCache.get(0) }),
    compilePixelMap(MAP_FOUNTAIN_1, fountainPal, { underlay: pathAutoCache.get(0) }),
  ]);

  const centerFloor = compilePixelMap(MAP_CENTER_FLOOR, PAL_INTERIOR);
  tileCache.set(TILE.CENTER_FLOOR, [centerFloor]);
  tileCache.set(TILE.CENTER_WALL_TOP, [compilePixelMap(MAP_CENTER_WALL_TOP, PAL_INTERIOR)]);
  tileCache.set(TILE.CENTER_WALL_BOT, [compilePixelMap(MAP_CENTER_WALL_BOT, PAL_INTERIOR)]);
  tileCache.set(TILE.COUNTER, [
    compilePixelMap(MAP_SERVICE_COUNTER, PAL_INTERIOR, { underlay: centerFloor }),
  ]);
  tileCache.set(TILE.HEAL_MACHINE, [
    compilePixelMap(MAP_HEAL_MACHINE_0, PAL_INTERIOR, { underlay: centerFloor }),
    compilePixelMap(MAP_HEAL_MACHINE_1, PAL_INTERIOR, { underlay: centerFloor }),
  ]);
  tileCache.set(TILE.SOFA_L, [compilePixelMap(MAP_SOFA_L, PAL_INTERIOR)]);
  tileCache.set(TILE.SOFA_R, [compilePixelMap(MAP_SOFA_R, PAL_INTERIOR)]);
  tileCache.set(TILE.MART_SHELF, [
    compilePixelMap(MAP_MART_SHELF, PAL_INTERIOR, { underlay: labFloor }),
  ]);

  // Pokémon Center Exterior (4x4 tiles)
  const pcUnderlay = grassVariants[0];
  tileCache.set(TILE.PC_ROOF_00, [compilePixelMap(MAP_PC_ROOF_00, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_10, [compilePixelMap(MAP_PC_ROOF_10, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_20, [compilePixelMap(MAP_PC_ROOF_20, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_30, [compilePixelMap(MAP_PC_ROOF_30, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_01, [compilePixelMap(MAP_PC_ROOF_01, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_11, [compilePixelMap(MAP_PC_ROOF_11, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_21, [compilePixelMap(MAP_PC_ROOF_21, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_ROOF_31, [compilePixelMap(MAP_PC_ROOF_31, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_02, [compilePixelMap(MAP_PC_WALL_02, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_12, [compilePixelMap(MAP_PC_WALL_12, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_22, [compilePixelMap(MAP_PC_WALL_22, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_32, [compilePixelMap(MAP_PC_WALL_32, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_03, [compilePixelMap(MAP_PC_WALL_03, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_DOOR_13, [compilePixelMap(MAP_PC_DOOR_13, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_DOOR_23, [compilePixelMap(MAP_PC_DOOR_23, PAL_POKECENTER, { underlay: pcUnderlay })]);
  tileCache.set(TILE.PC_WALL_33, [compilePixelMap(MAP_PC_WALL_33, PAL_POKECENTER, { underlay: pcUnderlay })]);

  // Main Character House
  const heroUnderlay = grassVariants[0];
  tileCache.set(TILE.HERO_ROOF_L, [compilePixelMap(MAP_HERO_ROOF_L, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_ROOF_M, [compilePixelMap(MAP_HERO_ROOF_M, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_ROOF_DORMER, [compilePixelMap(MAP_HERO_ROOF_DORMER, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_ROOF_R, [compilePixelMap(MAP_HERO_ROOF_R, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_WALL_L, [compilePixelMap(MAP_HERO_WALL_L, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_WALL_WIN, [compilePixelMap(MAP_HERO_WALL_WIN, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_BALCONY, [compilePixelMap(MAP_HERO_BALCONY, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_WALL_R, [compilePixelMap(MAP_HERO_WALL_R, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.HERO_DOOR, [compilePixelMap(MAP_HERO_DOOR, PAL_HERO_HOUSE, { underlay: heroUnderlay })]);

  // Rival House & Training
  tileCache.set(TILE.RIVAL_ROOF_L, [compilePixelMap(MAP_RIVAL_ROOF_L, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.RIVAL_ROOF_PEAK, [compilePixelMap(MAP_RIVAL_ROOF_PEAK, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.RIVAL_ROOF_R, [compilePixelMap(MAP_RIVAL_ROOF_R, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.RIVAL_WALL_BRICK, [compilePixelMap(MAP_RIVAL_WALL_BRICK, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.RIVAL_WALL_WIN, [compilePixelMap(MAP_RIVAL_WALL_BRICK, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.RIVAL_DOOR, [compilePixelMap(MAP_RIVAL_DOOR, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.TRAIN_BAG, [compilePixelMap(MAP_TRAIN_BAG, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.TRAIN_WEIGHTS, [compilePixelMap(MAP_TRAIN_WEIGHTS, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);
  tileCache.set(TILE.TRAIN_SAND, [compilePixelMap(MAP_TRAIN_SAND, PAL_RIVAL_HOUSE, { underlay: heroUnderlay })]);

  // Poké Mart Exterior (4x4)
  tileCache.set(TILE.MART_ROOF_00, [compilePixelMap(MAP_MART_ROOF_00, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_10, [compilePixelMap(MAP_MART_ROOF_10, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_20, [compilePixelMap(MAP_MART_ROOF_20, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_30, [compilePixelMap(MAP_MART_ROOF_30, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_01, [compilePixelMap(MAP_MART_ROOF_01, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_11, [compilePixelMap(MAP_MART_ROOF_11, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_21, [compilePixelMap(MAP_MART_ROOF_21, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_ROOF_31, [compilePixelMap(MAP_MART_ROOF_31, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_02, [compilePixelMap(MAP_MART_WALL_02, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_12, [compilePixelMap(MAP_MART_WALL_12, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_22, [compilePixelMap(MAP_MART_WALL_22, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_32, [compilePixelMap(MAP_MART_WALL_32, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_03, [compilePixelMap(MAP_MART_WALL_03, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_DOOR_13, [compilePixelMap(MAP_MART_DOOR_13, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_DOOR_23, [compilePixelMap(MAP_MART_DOOR_23, PAL_MART_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.MART_WALL_33, [compilePixelMap(MAP_MART_WALL_33, PAL_MART_EXT, { underlay: heroUnderlay })]);

  // Pokémon Gym & Cobalt City
  tileCache.set(TILE.GYM_ROOF_00, [compilePixelMap(MAP_GYM_ROOF_00, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_10, [compilePixelMap(MAP_GYM_ROOF_10, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_20, [compilePixelMap(MAP_GYM_ROOF_20, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_30, [compilePixelMap(MAP_GYM_ROOF_30, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_01, [compilePixelMap(MAP_GYM_ROOF_01, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_11, [compilePixelMap(MAP_GYM_ROOF_11, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_21, [compilePixelMap(MAP_GYM_ROOF_21, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_ROOF_31, [compilePixelMap(MAP_GYM_ROOF_31, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_02, [compilePixelMap(MAP_GYM_WALL_02, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_12, [compilePixelMap(MAP_GYM_WALL_12, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_22, [compilePixelMap(MAP_GYM_WALL_22, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_32, [compilePixelMap(MAP_GYM_WALL_32, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_03, [compilePixelMap(MAP_GYM_WALL_03, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_DOOR_13, [compilePixelMap(MAP_GYM_DOOR_13, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_DOOR_23, [compilePixelMap(MAP_GYM_DOOR_23, PAL_GYM_EXT, { underlay: heroUnderlay })]);
  tileCache.set(TILE.GYM_WALL_33, [compilePixelMap(MAP_GYM_WALL_33, PAL_GYM_EXT, { underlay: heroUnderlay })]);

  const amberPal = { '0': '#3C2808', '1': '#684410', '2': '#A06C18', '3': '#D89828', '4': '#F8D050' };
  tileCache.set(TILE.ROOF_AMBER, [compilePixelMap(MAP_ROOF, amberPal)]);
  tileCache.set(TILE.ROOF_AMBER_TRIM, [compilePixelMap(MAP_ROOF_TRIM, amberPal)]);
  tileCache.set(TILE.DOME_ROOF, [compilePixelMap(MAP_DOME_ROOF, PAL_MART_EXT, { underlay: heroUnderlay })]);

  // Gen 5 Pokémon Center Interior & Furniture
  tileCache.set(TILE.PC_WALL_RED, [compilePixelMap(MAP_PC_WALL_RED, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_ELEVATOR, [compilePixelMap(MAP_PC_ELEVATOR, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_WALL_TV, [compilePixelMap(MAP_PC_WALL_TV, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_MOSAIC_TL, [compilePixelMap(MAP_PC_FLOOR_MOSAIC_TL, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_MOSAIC_TR, [compilePixelMap(MAP_PC_FLOOR_MOSAIC_TR, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_MOSAIC_BL, [compilePixelMap(MAP_PC_FLOOR_MOSAIC_BL, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_MOSAIC_BR, [compilePixelMap(MAP_PC_FLOOR_MOSAIC_BR, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_BLUE, [compilePixelMap(MAP_PC_FLOOR_BLUE, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PC_FLOOR_YELLOW, [compilePixelMap(MAP_PC_FLOOR_YELLOW, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.SOFA_YELLOW_L, [compilePixelMap(MAP_SOFA_YELLOW_L, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.SOFA_YELLOW_R, [compilePixelMap(MAP_SOFA_YELLOW_R, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.PLANT_PALM, [compilePixelMap(MAP_PLANT_PALM, PAL_INTERIORS_UPGRADE)]);

  // Interiors & Mart 2F
  tileCache.set(TILE.RUG_TEAL_PC, [compilePixelMap(MAP_RUG_TEAL_PC, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.TROPHY_CASE, [compilePixelMap(MAP_TROPHY_CASE, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.GYM_BENCH, [compilePixelMap(MAP_GYM_BENCH, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.MART_SHOWCASE, [compilePixelMap(MAP_MART_SHOWCASE, PAL_INTERIORS_UPGRADE)]);
  tileCache.set(TILE.VENDING_MACHINE, [compilePixelMap(MAP_VENDING_MACHINE, PAL_INTERIORS_UPGRADE)]);

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
