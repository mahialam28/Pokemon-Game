/**
 * Map definitions for Phase 1 ("Opening Day"):
 * - bedroom     (8x8)   Player's upstairs room
 * - downstairs  (10x8)  Player's house first floor + Mom
 * - town        (20x18) Dawnleaf Town
 * - lab         (12x12) Professor's Pokémon Lab
 *
 * Designed so Phase 2+ routes, encounters, trainers, and buildings plug directly
 * into the MAPS registry without modifying OverworldScene core logic.
 */

import { gameState } from '../state.js';
import { TILE } from './tiles.js';

const T = TILE;

/** Helper to look up tile interactables keyed by "x,y". */
function keyOf(x, y) {
  return `${x},${y}`;
}

/** Parse compact ASCII map rows into numeric TILE arrays. */
function parseGrid(rows, legend) {
  return rows.map((row) =>
    Array.from(row).map((ch) => {
      const tid = legend[ch];
      return tid !== undefined ? tid : T.GRASS;
    })
  );
}

const OUTDOOR_LEGEND = {
  T: T.TREE,
  '.': T.GRASS,
  ',': T.PATH,
  'g': T.TALL_GRASS,
  'f': T.FLOWER,
  'L': T.LEDGE,
  '~': T.WATER,
  'F': T.FENCE,
  'S': T.SIGN,
  'M': T.MAILBOX,
  'r': T.ROOF_RED,
  'R': T.ROOF_RED_TRIM,
  'b': T.ROOF_BLUE,
  'B': T.ROOF_BLUE_TRIM,
  'l': T.ROOF_LAB,
  'K': T.ROOF_LAB_TRIM,
  'H': T.HOUSE_WALL,
  'W': T.HOUSE_WINDOW,
  'D': T.DOOR,
  'E': T.LAB_WALL,
  'V': T.LAB_WINDOW,
  'A': T.LAB_DOOR,
  'P': T.CENTER_SIGN_P,
  'U': T.MART_SIGN_M,
  'O': T.FOUNTAIN,
  '1': T.PC_ROOF_00,
  '2': T.PC_ROOF_10,
  '3': T.PC_ROOF_20,
  '4': T.PC_ROOF_30,
  '5': T.PC_ROOF_01,
  '6': T.PC_ROOF_11,
  '7': T.PC_ROOF_21,
  '8': T.PC_ROOF_31,
  '9': T.PC_WALL_02,
  '0': T.PC_WALL_12,
  'z': T.PC_WALL_22,
  'x': T.PC_WALL_32,
  'a': T.PC_WALL_03,
  'c': T.PC_DOOR_13,
  'C': T.PC_DOOR_23,
  'e': T.PC_WALL_33,

  // Main Character House
  'h': T.HERO_ROOF_L,
  'j': T.HERO_ROOF_M,
  'k': T.HERO_ROOF_DORMER,
  'l': T.HERO_ROOF_R,
  'm': T.HERO_WALL_L,
  'n': T.HERO_WALL_WIN,
  'o': T.HERO_BALCONY,
  'p': T.HERO_WALL_R,
  'q': T.HERO_DOOR,

  // Rival House & Training
  '3': T.RIVAL_ROOF_L,
  '4': T.RIVAL_ROOF_PEAK,
  '5': T.RIVAL_ROOF_R,
  'u': T.RIVAL_WALL_BRICK,
  'i': T.RIVAL_WALL_WIN,
  'd': T.RIVAL_DOOR,
  'x': T.TRAIN_BAG,
  'X': T.TRAIN_WEIGHTS,
  's': T.TRAIN_SAND,

  // Poké Mart Exterior (4x4)
  '!': T.MART_ROOF_00,
  '@': T.MART_ROOF_10,
  '#': T.MART_ROOF_20,
  '$': T.MART_ROOF_30,
  '%': T.MART_ROOF_01,
  '^': T.MART_ROOF_11,
  '&': T.MART_ROOF_21,
  '*': T.MART_ROOF_31,
  '[': T.MART_WALL_02,
  '{': T.MART_WALL_12,
  '}': T.MART_WALL_22,
  ']': T.MART_WALL_32,
  '(': T.MART_WALL_03,
  '<': T.MART_DOOR_13,
  '>': T.MART_DOOR_23,
  ')': T.MART_WALL_33,

  // Gym Exterior (4x4)
  'A': T.GYM_ROOF_00,
  'B': T.GYM_ROOF_10,
  'C': T.GYM_ROOF_20,
  'D': T.GYM_ROOF_30,
  'E': T.GYM_ROOF_01,
  'F': T.GYM_ROOF_11,
  'G': T.GYM_ROOF_21,
  'H': T.GYM_ROOF_31,
  'I': T.GYM_WALL_02,
  'J': T.GYM_WALL_12,
  'K': T.GYM_WALL_22,
  'N': T.GYM_WALL_32,
  'Q': T.GYM_WALL_03,
  'Y': T.GYM_DOOR_13,
  'Z': T.GYM_DOOR_23,
  'w': T.GYM_WALL_33,

  // Mixed City Houses
  'v': T.ROOF_AMBER,
  'V': T.ROOF_AMBER_TRIM,
  'O': T.DOME_ROOF,
};

const INDOOR_LEGEND = {
  'W': T.WALL_TOP,
  'w': T.WALL_BOT,
  'N': T.WALL_WINDOW,
  'C': T.CENTER_WALL_TOP,
  'c': T.CENTER_WALL_BOT,
  'L': T.LAB_WALL_TOP,
  'l': T.LAB_WALL_BOT,
  '.': T.WOOD_FLOOR,
  'p': T.CENTER_FLOOR,
  'f': T.LAB_FLOOR,
  'D': T.DOORMAT,
  'd': T.LAB_DOORMAT,
  'X': T.COUNTER,
  'H': T.HEAL_MACHINE,
  'P': T.PC_DESK,
  'K': T.PLANT,
  '[': T.SOFA_L,
  ']': T.SOFA_R,
  'S': T.MART_SHELF,
  'B': T.BOOKSHELF,
  'T': T.TV,
  '(': T.TABLE_LEFT,
  ')': T.TABLE_RIGHT,
  'h': T.CHAIR,
  'r': T.RUG_RED,
  'u': T.RUG_BLUE,
  'm': T.RUG_TEAL_PC,
  'g': T.TROPHY_CASE,
  'b': T.GYM_BENCH,
  'x': T.TRAIN_BAG,
  's': T.MART_SHOWCASE,
  'v': T.VENDING_MACHINE,
  'R': T.PC_WALL_RED,
  'E': T.PC_ELEVATOR,
  't': T.PC_WALL_TV,
  '1': T.PC_FLOOR_MOSAIC_TL,
  '2': T.PC_FLOOR_MOSAIC_TR,
  '3': T.PC_FLOOR_MOSAIC_BL,
  '4': T.PC_FLOOR_MOSAIC_BR,
  '5': T.PC_FLOOR_BLUE,
  '6': T.PC_FLOOR_YELLOW,
  '7': T.SOFA_YELLOW_L,
  '8': T.SOFA_YELLOW_R,
  'k': T.PLANT_PALM,
  'U': T.STAIRS_UP,
  'V': T.STAIRS_DOWN,
  '^': T.BED_TOP,
  '_': T.BED_BOT,
  'Q': T.WARDROBE_TOP,
  'q': T.WARDROBE_BOT,
  'F': T.KITCHEN_FRIDGE,
  'O': T.KITCHEN_STOVE,
  'I': T.KITCHEN_SINK,
  'Z': T.DESK,
};

export const MAPS = {
  // =========================================================================
  // 1. PLAYER'S BEDROOM (12 x 8) — Stage 1 Gen 1 Rebuild (Panel 5)
  // =========================================================================
  bedroom: {
    id: 'bedroom',
    name: 'BEDROOM',
    isIndoor: true,
    width: 12,
    height: 8,
    bgColor: '#0E1018',
    tiles: [
      // 0: North wall with double window above bed
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_BED_WIN_L, T.HERO_BED_WIN_R, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_CORNER_R],
      // 1: Wall items: Nightstand+Lamp, Bed head, Bookshelf, PC Tower, PC Monitor, Wardrobe Top, Painting, Stairs Down
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_WALL_B, T.HERO_BED_NIGHTSTAND, T.HERO_BED_HEAD_L, T.HERO_BED_HEAD_R, T.HERO_INT_BOOKCASE, T.HERO_PC_TOWER, T.HERO_PC_MONITOR, T.HERO_WARDROBE_TOP, T.HERO_INT_PAINTING, T.HERO_INT_STAIRS_DOWN, T.HERO_INT_WALL_CORNER_R],
      // 2: Open walking floor, Bed runner rug, Bed foot, Wardrobe Bottom, Stairs landing at (10, 2)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_FLOOR, T.HERO_BED_RUNNER, T.HERO_BED_FOOT_L, T.HERO_BED_FOOT_R, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_WARDROBE_BOT, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_WALL_CORNER_R],
      // 3: Royal blue diamond rug top (cols 4..8)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_RUG_BLU_TL, T.HERO_RUG_BLU_T, T.HERO_RUG_BLU_T, T.HERO_RUG_BLU_T, T.HERO_RUG_BLU_TR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_WALL_CORNER_R],
      // 4: Royal blue diamond rug center (cols 4..8) — Player spawn at (5, 4)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_RUG_BLU_L, T.HERO_RUG_BLU_C, T.HERO_RUG_BLU_C, T.HERO_RUG_BLU_C, T.HERO_RUG_BLU_R, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_WALL_CORNER_R],
      // 5: Royal blue diamond rug bottom (cols 4..8)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_RUG_BLU_BL, T.HERO_RUG_BLU_B, T.HERO_RUG_BLU_B, T.HERO_RUG_BLU_B, T.HERO_RUG_BLU_BR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_WALL_CORNER_R],
      // 6: Decorative corner palms & open walking floor
      [T.HERO_INT_WALL_CORNER_L, T.HERO_CORNER_PALM, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_CORNER_PALM, T.HERO_INT_WALL_CORNER_R],
      // 7: South baseboard
      [T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT],
    ],
    warps: [
      {
        x: 10,
        y: 1,
        targetMap: 'downstairs',
        targetX: 8,
        targetY: 2,
        targetFacing: 'down',
      },
    ],
    npcs: [],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(2, 1)]: ['A bedside nightstand with a brass lamp. It casts a comforting, warm glow.'],
      [keyOf(3, 0)]: ['A bright morning sun shines through the blue curtains! Today is the big day.'],
      [keyOf(4, 0)]: ['A bright morning sun shines through the blue curtains! Today is the big day.'],
      [keyOf(3, 1)]: ["It's your cozy bed. The soft navy quilt and fluffy pillow feel crisp and inviting!"],
      [keyOf(4, 1)]: ["It's your cozy bed. The soft navy quilt and fluffy pillow feel crisp and inviting!"],
      [keyOf(3, 2)]: ["It's your cozy bed. The soft navy quilt and fluffy pillow feel crisp and inviting!"],
      [keyOf(4, 2)]: ["It's your cozy bed. The soft navy quilt and fluffy pillow feel crisp and inviting!"],
      [keyOf(5, 1)]: ['A tall bookshelf packed with POKéMON adventure journals and regional battle guides!'],
      [keyOf(6, 1)]: ['Booted up the PC! Storage system is online and ready for partner monsters.'],
      [keyOf(7, 1)]: ['Booted up the PC! Storage system is online and ready for partner monsters.'],
      [keyOf(8, 1)]: ['A spacious wooden wardrobe. Neatly pressed trainer outfits are ready inside.'],
      [keyOf(8, 2)]: ['A spacious wooden wardrobe. Neatly pressed trainer outfits are ready inside.'],
      [keyOf(9, 1)]: ['A charming scenic painting of the rolling hills outside Dawnleaf Town.'],
      [keyOf(1, 6)]: ['A lush indoor potted plant, basking in the room light.'],
      [keyOf(10, 6)]: ['A decorative houseplant adding fresh oxygen to the bedroom.'],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 52, color: [255, 236, 178], intensity: 0.44, type: 'windowBeam' },
      { x: 6.5, y: 1.3, radius: 36, color: [96, 215, 255], intensity: 0.38, type: 'pc' },
      { x: 2.5, y: 1.5, radius: 46, color: [255, 224, 168], intensity: 0.32, type: 'lamp' },
    ],
    encounters: [],
  },


  // =========================================================================
  // 2. HOUSE DOWNSTAIRS (12 x 8) — Stage 1 Gen 1 Rebuild (Panel 4)
  // =========================================================================
  downstairs: {
    id: 'downstairs',
    name: 'HERO HOUSE 1F',
    isIndoor: true,
    width: 12,
    height: 8,
    bgColor: '#0E1018',
    tiles: [
      // 0: North wall
      [T.HERO_INT_WALL_CORNER_L, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_T, T.HERO_INT_WALL_CORNER_R],
      // 1: Fridge Top, Coffee Counter, Sink+Window, Stove+Hood, Bookcase, Ficus, TV Console, Stairs Up, Painting, Wall
      [T.HERO_INT_WALL_CORNER_L, T.HERO_KIT_FRIDGE_T, T.HERO_KIT_COFFEE, T.HERO_KIT_SINK_WIN, T.HERO_KIT_STOVE, T.HERO_INT_BOOKCASE, T.HERO_INT_PLANT_FICUS, T.HERO_INT_TV_CONSOLE, T.HERO_INT_STAIRS_UP, T.HERO_INT_PAINTING, T.HERO_INT_WALL_B, T.HERO_INT_WALL_CORNER_R],
      // 2: Fridge Bottom, open floor in front of kitchen, stairs landing at (8, 2)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_KIT_FRIDGE_B, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_WALL_CORNER_R],
      // 3: Green rug top (cols 1..3) & Cream rug top w/ Crimson Sofa (cols 6..10)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_RUG_GRN_TL, T.HERO_RUG_GRN_T, T.HERO_RUG_GRN_TR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_RUG_CRM_TL, T.HERO_SOFA_L, T.HERO_SOFA_M, T.HERO_SOFA_R, T.HERO_RUG_CRM_TR, T.HERO_INT_WALL_CORNER_R],
      // 4: Dining chairs & table (left) & Crimson armchairs & coffee table (right)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_DINING_CHAIR_L, T.HERO_DINING_TABLE, T.HERO_DINING_CHAIR_R, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_ARMCHAIR_L, T.HERO_COFFEE_TABLE, T.HERO_COFFEE_TABLE, T.HERO_ARMCHAIR_R, T.HERO_RUG_CRM_R, T.HERO_INT_WALL_CORNER_R],
      // 5: Green rug bottom (left) & Cream rug bottom (right)
      [T.HERO_INT_WALL_CORNER_L, T.HERO_RUG_GRN_BL, T.HERO_RUG_GRN_B, T.HERO_RUG_GRN_BR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_RUG_CRM_BL, T.HERO_RUG_CRM_B, T.HERO_RUG_CRM_B, T.HERO_RUG_CRM_B, T.HERO_RUG_CRM_BR, T.HERO_INT_WALL_CORNER_R],
      // 6: Decorative corner palms & open walking corridor
      [T.HERO_INT_WALL_CORNER_L, T.HERO_CORNER_PALM, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_INT_FLOOR, T.HERO_CORNER_PALM, T.HERO_INT_WALL_CORNER_R],
      // 7: South baseboard with centered welcome doormat exit at (5..6, 7)
      [T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.HERO_DOORMAT_L, T.HERO_DOORMAT_R, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT],
    ],
    warps: [
      {
        x: 8,
        y: 1,
        targetMap: 'bedroom',
        targetX: 10,
        targetY: 2,
        targetFacing: 'down',
      },
      {
        x: 5,
        y: 7,
        targetMap: 'town',
        targetX: 4,
        targetY: 7,
        targetFacing: 'down',
        guard: 'requireMom',
      },
      {
        x: 6,
        y: 7,
        targetMap: 'town',
        targetX: 4,
        targetY: 7,
        targetFacing: 'down',
        guard: 'requireMom',
      },
    ],
    npcs: [
      {
        id: 'mom',
        name: 'MOM',
        sprite: 'mom',
        x: 6,
        y: 3,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'down', 'right'],
        getDialogue: () => {
          if (gameState.starter) {
            return [
              'MOM: Oh, {STARTER} is adorable, {PLAYER}!',
              'MOM: Take good care of each other out there!',
            ];
          }
          return ["MOM: The PROFESSOR's lab is just south of here. Go on!"];
        },
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(1, 1)]: ["The refrigerator is stocked with cold lemonade and Mom's fresh snacks."],
      [keyOf(1, 2)]: ["The refrigerator freezer holds homemade Berry popsicles!"],
      [keyOf(2, 1)]: ['A modern espresso maker on a polished marble counter. Smells like freshly roasted coffee beans.'],
      [keyOf(3, 1)]: ['A sparkling clean sink under a sunny kitchen window.'],
      [keyOf(4, 1)]: ['A clean kitchen stove with ventilation hood. Breakfast was cooked here a short while ago.'],
      [keyOf(5, 1)]: ['Family photo albums, recipe books, and trainer field guides fill the shelf.'],
      [keyOf(6, 1)]: ['A vibrant potted ficus plant, thriving in the warm morning light.'],
      [keyOf(7, 1)]: ['A POKéMON battle championship broadcast is playing on the widescreen TV!'],
      [keyOf(9, 1)]: ['A beautiful landscape painting of the mountains at dawn.'],
      [keyOf(2, 4)]: ['A comfortable ladder-back dining chair.'],
      [keyOf(3, 4)]: ['A cheerful red-and-white checkered tablecloth with a fresh vase of wildflowers.'],
      [keyOf(4, 4)]: ['A comfortable ladder-back dining chair.'],
      [keyOf(6, 4)]: ['A plush crimson armchair. Incredibly soft and well-cared for.'],
      [keyOf(7, 3)]: ['A plush crimson living room sofa. Extremely soft and comfortable.'],
      [keyOf(8, 3)]: ['A plush crimson living room sofa. Extremely soft and comfortable.'],
      [keyOf(9, 3)]: ['A plush crimson living room sofa. Extremely soft and comfortable.'],
      [keyOf(7, 4)]: ['A polished oak coffee table with a glass centerpiece vase.'],
      [keyOf(8, 4)]: ['A polished oak coffee table with a glass centerpiece vase.'],
      [keyOf(9, 4)]: ['A plush crimson armchair. Incredibly soft and well-cared for.'],
      [keyOf(1, 6)]: ['A lush indoor potted palm.'],
      [keyOf(10, 6)]: ['A lush indoor potted palm.'],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 48, color: [255, 232, 168], intensity: 0.42, type: 'windowBeam' },
      { x: 7.5, y: 1.4, radius: 36, color: [130, 210, 255], intensity: 0.34, type: 'tv' },
      { x: 8.0, y: 4.0, radius: 64, color: [255, 216, 148], intensity: 0.28, type: 'lamp' },
    ],
    encounters: [],
  },




  // 3. DAWNLEAF TOWN (20 x 18)
  // =========================================================================
  town: {
    id: 'town',
    name: 'DAWNLEAF TOWN',
    isIndoor: false,
    width: 20,
    height: 18,
    bgColor: '#245834',
    tiles: [
      // y = 0..1: Northern trees with tall-grass route exit at cols 9..10
      [T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TALL_GRASS, T.TALL_GRASS, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE],
      [T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TALL_GRASS, T.TALL_GRASS, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE],
      // y = 2: North approach
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.TREE],
      // y = 3..6: Hero's House (cols 3..7) & Rival's House (cols 12..16)
      [T.TREE, T.GRASS, T.GRASS, T.HERO_EXT_ROOF_L_TOP, T.HERO_EXT_ROOF_DORMER_T, T.HERO_EXT_GABLE_PEAK_L, T.HERO_EXT_GABLE_PEAK_R, T.HERO_EXT_ROOF_CHIMNEY_T, T.GRASS, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_ROOF_L_TOP, T.RIVAL_EXT_ROOF_M_TOP, T.RIVAL_EXT_GABLE_PEAK, T.RIVAL_EXT_ROOF_R_TOP, T.RIVAL_EXT_CHIMNEY_TOP, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.HERO_EXT_ROOF_L_MID, T.HERO_EXT_DORMER_WIN, T.HERO_EXT_GABLE_WIN_L, T.HERO_EXT_GABLE_WIN_R, T.HERO_EXT_ROOF_CHIMNEY_B, T.GRASS, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_ROOF_L_BOT, T.RIVAL_EXT_ROOF_M_BOT, T.RIVAL_EXT_GABLE_WIN, T.RIVAL_EXT_ROOF_R_BOT, T.RIVAL_EXT_CHIMNEY_BOT, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.HERO_EXT_BUSH_PINK, T.HERO_EXT_WALL_L_TOP, T.HERO_EXT_PORCH_ROOF, T.HERO_EXT_WALL_GABLE_BL, T.HERO_EXT_WALL_GABLE_BR, T.HERO_EXT_WALL_R_TOP, T.HERO_EXT_BUSH_WHITE, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_WALL_L_TOP, T.RIVAL_EXT_AWNING_WIN_TOP, T.RIVAL_EXT_PORCH_CANOPY, T.RIVAL_EXT_WALL_R_TOP, T.RIVAL_EXT_WALL_FAR_R, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.HERO_EXT_WALL_WIN_L, T.HERO_EXT_PORCH_DOOR, T.HERO_EXT_WALL_GABLE_L, T.HERO_EXT_WALL_WIN_R, T.HERO_EXT_WALL_R_BASE, T.HERO_EXT_TOPIARY, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_WALL_L_BASE, T.RIVAL_EXT_AWNING_WIN_BOT, T.RIVAL_EXT_PORCH_DOOR, T.RIVAL_EXT_WALL_WIN_R, T.RIVAL_EXT_WALL_R_BASE, T.GRASS, T.GRASS, T.TREE],
      // y = 7: Hero front garden & Rival front garden
      [T.TREE, T.GRASS, T.GRASS, T.HERO_EXT_MAILBOX, T.HERO_EXT_STONE_PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_BUSH_PURPLE, T.GRASS, T.RIVAL_EXT_STONE_PATH, T.GRASS, T.RIVAL_EXT_HEDGE_ROUND, T.RIVAL_EXT_BUSH_PURPLE, T.GRASS, T.TREE],
      // y = 8: Enclosing white picket fence (Hero) & Ashlar stone perimeter wall (Rival)
      [T.TREE, T.GRASS, T.HERO_EXT_FENCE_POST_L, T.FENCE, T.HERO_EXT_STONE_PATH, T.FENCE, T.FENCE, T.HERO_EXT_FENCE_POST_R, T.SIGN, T.PATH, T.PATH, T.GRASS, T.RIVAL_EXT_WALL_STONE_CORNER_L, T.RIVAL_EXT_WALL_STONE_H, T.RIVAL_EXT_STONE_PATH, T.RIVAL_EXT_WALL_STONE_H, T.RIVAL_EXT_WALL_STONE_POST, T.RIVAL_EXT_WALL_STONE_CORNER_R, T.GRASS, T.TREE],
      // y = 9: Main town boulevard connecting houses
      [T.TREE, T.GRASS, T.PATH, T.PATH, T.HERO_EXT_STONE_PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.GRASS, T.GRASS, T.PATH, T.RIVAL_EXT_STONE_PATH, T.PATH, T.PATH, T.PATH, T.GRASS, T.TREE],
      // y = 10..14: Professor's Lab (cols 7..13), Friend's House (cols 15..18), flower beds & pond
      [T.TREE, T.GRASS, T.FLOWER, T.FLOWER, T.FLOWER, T.GRASS, T.PATH, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.PATH, T.FRIEND_EXT_ROOF_L_TOP, T.FRIEND_EXT_ROOF_M_TOP, T.FRIEND_EXT_GABLE_PEAK, T.FRIEND_EXT_ROOF_R_TOP, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.PATH, T.FRIEND_EXT_ROOF_L_BOT, T.FRIEND_EXT_ROOF_M_BOT, T.FRIEND_EXT_GABLE_WIN, T.FRIEND_EXT_ROOF_R_BOT, T.TREE],
      [T.TREE, T.GRASS, T.WATER, T.WATER, T.WATER, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.PATH, T.FRIEND_EXT_WALL_L_TOP, T.FRIEND_EXT_PORCH_CANOPY, T.FRIEND_EXT_WALL_GABLE_TOP, T.FRIEND_EXT_WALL_R_TOP, T.TREE],
      [T.TREE, T.GRASS, T.WATER, T.WATER, T.WATER, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.PATH, T.FRIEND_EXT_WALL_WIN_L, T.FRIEND_EXT_DOOR_PORCH, T.FRIEND_EXT_WALL_GABLE_B, T.FRIEND_EXT_WALL_R_BASE, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_DOOR, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.PATH, T.FRIEND_EXT_BUSH_ROSE, T.FRIEND_EXT_STONE_PATH, T.FRIEND_EXT_BUSH_ROSE, T.SIGN, T.TREE],
      // y = 15: Lab front plaza & Friend's front yard wooden fence
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.FRIEND_EXT_FENCE_CORNER_L, T.FRIEND_EXT_STONE_PATH, T.FRIEND_EXT_FENCE_WOOD_H, T.FRIEND_EXT_FENCE_LANTERN_POST, T.TREE],
      // y = 16..17: Southern flowers & tree border
      [T.TREE, T.TREE, T.GRASS, T.FLOWER, T.FLOWER, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.FLOWER, T.GRASS, T.GRASS, T.TREE, T.TREE],
      [T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE],
    ],
    warps: [
      {
        x: 4,
        y: 6,
        targetMap: 'downstairs',
        targetX: 5,
        targetY: 6,
        targetFacing: 'up',
      },
      {
        x: 14,
        y: 6,
        targetMap: 'rivalHouse',
        targetX: 4,
        targetY: 6,
        targetFacing: 'up',
      },
      {
        x: 10,
        y: 14,
        targetMap: 'lab',
        targetX: 5,
        targetY: 10,
        targetFacing: 'up',
      },
      {
        x: 16,
        y: 13,
        targetMap: 'friendHouse',
        targetX: 3,
        targetY: 6,
        targetFacing: 'up',
      },
    ],
    connections: {
      north: { targetMap: 'route1', targetXOffset: 0, targetY: 39 },
    },
    npcs: [
      {
        id: 'neighbour',
        name: 'NEIGHBOUR',
        sprite: 'neighbour',
        x: 12,
        y: 8,
        facing: 'down',
        idleLook: true,
        idleDirs: ['down', 'left', 'right'],
        getDialogue: () => {
          if (gameState.flags.rivalBattleDone) {
            if (gameState.flags.rivalBattleWon) {
              return [
                'NEIGHBOUR: No way! You beat {RIVAL} in your very first battle?!',
                'NEIGHBOUR: You and {STARTER} are going to be legendary, {PLAYER}!',
              ];
            }
            return [
              'NEIGHBOUR: I saw {RIVAL} strutting out of the lab!',
              'NEIGHBOUR: Keep training with {STARTER}, {PLAYER} — you will win next time!',
            ];
          }
          if (gameState.flags.gotStarter) {
            return [
              'NEIGHBOUR: Whoa, {STARTER} looks so cool! {RIVAL} was just looking for you in the lab!',
            ];
          }
          return [
            'NEIGHBOUR: Morning, {PLAYER}! {RIVAL} was bragging earlier about getting a POKéMON today.',
          ];
        },
      },
      {
        id: 'fatMan',
        name: 'TECH FAN',
        sprite: 'fatMan',
        x: 9,
        y: 8,
        facing: 'down',
        wanderBounds: { minX: 7, maxX: 11, minY: 7, maxY: 9 },
        getDialogue: () => {
          if (gameState.flags.rivalBattleDone) {
            return [
              'Technology is incredible! You can even save your adventure progress in the ESC menu!',
              'Heard you and {RIVAL} already put your new POKéMON to the test!',
            ];
          }
          return [
            'Technology is incredible! You can store and recall POKéMON data with a PC!',
          ];
        },
      },
      {
        id: 'townGirl',
        name: 'LASS',
        sprite: 'girl',
        x: 4,
        y: 15,
        facing: 'up',
        wanderBounds: { minX: 2, maxX: 5, minY: 14, maxY: 16 },
        getDialogue: () => {
          if (gameState.starter) {
            return [
              'Aw, {STARTER} is so cute! The flowers by the pond look extra bright today.',
            ];
          }
          return [
            'The water in Dawnleaf Pond sparkles so nicely! Sometimes I watch the ripples all morning.',
          ];
        },
      },
      {
        id: 'townKid',
        name: 'KID',
        sprite: 'kid',
        x: 15,
        y: 15,
        facing: 'up',
        wanderBounds: { minX: 14, maxX: 16, minY: 14, maxY: 16 },
        getDialogue: () => {
          if (gameState.flags.rivalBattleDone) {
            return [
              'Whoa, {PLAYER}! You battled {RIVAL} with {STARTER}?! Try hopping down that ledge above me!',
            ];
          }
          return [
            "See that ledge above me? Walk around the path and hop right down it — it's super fun!",
          ];
        },
      },
    ],
    pokeballs: [],
    triggers: [
      // North exit tall-grass guard
      { x: 9, y: 1, type: 'northExit' },
      { x: 10, y: 1, type: 'northExit' },
    ],
    interactables: {
      [keyOf(2, 6)]: ["{PLAYER}'s House Mailbox! No new letters today, but the red flag is raised."],
      [keyOf(3, 6)]: ['A blooming window flowerbox overflowing with pink hydrangeas and white blossoms.'],
      [keyOf(6, 6)]: ['A blooming window flowerbox overflowing with pink hydrangeas and white blossoms.'],
      [keyOf(8, 6)]: ['A neatly trimmed round topiary hedge in a chiseled stone base.'],
      [keyOf(3, 7)]: ["{PLAYER}'s HOUSE"],
      [keyOf(16, 7)]: ["{RIVAL}'s HOUSE"],
      [keyOf(18, 14)]: ["{FRIEND}'s HOUSE"],
      [keyOf(16, 13)]: ["{FRIEND}'s House. The porch lantern casts a cozy, welcoming light."],
      [keyOf(18, 15)]: ["A rustic timber lamppost illuminating the garden entrance."],
      [keyOf(15, 14)]: ["Fragrant blooming rose bushes line the garden pathway."],
      [keyOf(17, 14)]: ["Fragrant blooming rose bushes line the garden pathway."],
      [keyOf(8, 8)]: ['DAWNLEAF TOWN: A quiet little start.'],
      [keyOf(15, 14)]: ["PROFESSOR's POKéMON LAB"],
    },
    chimneys: [
      { x: 15, y: 3 },
    ],
    birdSpots: [
      { x: 8, y: 7 },
      { x: 12, y: 9 },
      { x: 11, y: 15 },
    ],
    lights: [
      // Soft glowing house & lab windows outdoors
      { x: 4.5, y: 5.5, radius: 20, color: [255, 224, 138], intensity: 0.28, type: 'windowGlow' },
      { x: 6.5, y: 5.5, radius: 20, color: [255, 224, 138], intensity: 0.28, type: 'windowGlow' },
      { x: 14.5, y: 5.5, radius: 20, color: [255, 224, 138], intensity: 0.24, type: 'windowGlow' },
      { x: 16.5, y: 5.5, radius: 20, color: [255, 224, 138], intensity: 0.24, type: 'windowGlow' },
      { x: 8.5, y: 12.8, radius: 24, color: [148, 232, 255], intensity: 0.26, type: 'windowGlow' },
      { x: 12.5, y: 12.8, radius: 24, color: [148, 232, 255], intensity: 0.26, type: 'windowGlow' },
      { x: 3.5, y: 13.0, radius: 34, color: [160, 230, 255], intensity: 0.16, type: 'windowGlow' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 4. PROFESSOR'S LAB (12 x 12)
  // =========================================================================
  lab: {
    id: 'lab',
    name: "PROFESSOR's LAB",
    isIndoor: true,
    width: 12,
    height: 12,
    bgColor: '#0E141E',
    tiles: [
      [T.LAB_WALL_TOP, T.LAB_WALL_TOP, T.LAB_WINDOW_IN, T.LAB_WALL_TOP, T.LAB_WALL_TOP, T.LAB_WINDOW_IN, T.LAB_WINDOW_IN, T.LAB_WALL_TOP, T.LAB_WALL_TOP, T.LAB_WINDOW_IN, T.LAB_WALL_TOP, T.LAB_WALL_TOP],
      [T.BOOKSHELF,    T.BOOKSHELF,    T.BOOKSHELF,     T.LAB_MACHINE,  T.LAB_MACHINE,  T.LAB_WALL_BOT,  T.LAB_WALL_BOT,  T.LAB_MACHINE,  T.LAB_MACHINE,  T.BOOKSHELF,     T.BOOKSHELF,    T.BOOKSHELF],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_TABLE, T.LAB_TABLE, T.LAB_TABLE, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.RUG_BLUE,  T.RUG_BLUE,  T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.BOOKSHELF, T.BOOKSHELF, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.RUG_BLUE,  T.RUG_BLUE,  T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.BOOKSHELF, T.BOOKSHELF],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.RUG_BLUE,  T.RUG_BLUE,  T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
      [T.PLANT,     T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.PLANT],
      [T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_DOORMAT, T.LAB_DOORMAT, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR, T.LAB_FLOOR],
    ],
    warps: [
      {
        x: 5,
        y: 11,
        targetMap: 'town',
        targetX: 10,
        targetY: 15,
        targetFacing: 'down',
      },
      {
        x: 6,
        y: 11,
        targetMap: 'town',
        targetX: 10,
        targetY: 15,
        targetFacing: 'down',
      },
    ],
    npcs: [
      {
        id: 'prof',
        name: 'PROF',
        sprite: 'prof',
        x: 5,
        y: 4,
        facing: 'down',
        idleLook: true,
        idleDirs: ['down', 'left', 'right'],
        getDialogue: () => {
          if (gameState.flags.rivalBattleDone) {
            return [
              'PROF: Battles like that are how you and your POKéMON grow stronger.',
              'PROF: Go show your MOM!',
            ];
          }
          if (gameState.starter) {
            return [
              'PROF: {STARTER} looks so happy traveling with you, {PLAYER}!',
              'PROF: Explore the world and meet lots of POKéMON!',
            ];
          }
          return [
            'PROF: Go right ahead, {PLAYER}!',
            'PROF: Inspect the three POKé BALLS on the table to choose your partner.',
          ];
        },
      },
      {
        id: 'aide',
        name: 'AIDE',
        sprite: 'aide',
        x: 2,
        y: 8,
        facing: 'right',
        idleLook: false,
        getDialogue: () => {
          if (gameState.flags.rivalBattleDone) {
            return [
              'AIDE: What an exciting battle between you and {RIVAL}!',
              'AIDE: {STARTER} already looks way more confident.',
            ];
          }
          if (gameState.starter) {
            return [
              'AIDE: {STARTER} is a fantastic partner, {PLAYER}!',
              'AIDE: I cannot wait to see your research data later.',
            ];
          }
          return [
            'AIDE: I study POKéMON types with the PROFESSOR.',
            'AIDE: Grass, Fire, and Water each shine in different matchups!',
          ];
        },
      },
    ],
    // Three starter Poké Balls sitting on the lab table (indexes into STARTERS)
    pokeballs: [
      { x: 7, y: 4, starterIndex: 0 },
      { x: 8, y: 4, starterIndex: 1 },
      { x: 9, y: 4, starterIndex: 2 },
    ],
    triggers: [],
    interactables: {
      [keyOf(0, 1)]: ['Research journals about POKéMON habitats fill the shelves.'],
      [keyOf(1, 1)]: ['Research journals about POKéMON habitats fill the shelves.'],
      [keyOf(2, 1)]: ['Research journals about POKéMON habitats fill the shelves.'],
      [keyOf(9, 1)]: ['Encyclopedias detailing POKéMON from across the region.'],
      [keyOf(10, 1)]: ['Encyclopedias detailing POKéMON from across the region.'],
      [keyOf(11, 1)]: ['Encyclopedias detailing POKéMON from across the region.'],
      [keyOf(0, 7)]: ['Field notes neatly organized by elemental type.'],
      [keyOf(1, 7)]: ['Field notes neatly organized by elemental type.'],
      [keyOf(10, 7)]: ['Stacks of Poké Ball design blueprints.'],
      [keyOf(11, 7)]: ['Stacks of Poké Ball design blueprints.'],
      [keyOf(3, 1)]: ['A blinking computer displays POKéMON vitality graphs.'],
      [keyOf(4, 1)]: ['A blinking computer displays POKéMON vitality graphs.'],
      [keyOf(7, 1)]: ['A high-tech analyzer hums quietly.'],
      [keyOf(8, 1)]: ['A high-tech analyzer hums quietly.'],
      [keyOf(0, 10)]: ['A lush potted plant keeps the lab airy.'],
      [keyOf(11, 10)]: ['A lush potted plant keeps the lab airy.'],
    },
    lights: [
      { x: 2.5, y: 0.7, radius: 52, color: [220, 244, 255], intensity: 0.36, type: 'windowBeam' },
      { x: 6.0, y: 0.7, radius: 60, color: [220, 244, 255], intensity: 0.38, type: 'windowBeam' },
      { x: 9.5, y: 0.7, radius: 52, color: [220, 244, 255], intensity: 0.36, type: 'windowBeam' },
      { x: 4.0, y: 1.5, radius: 36, color: [88, 224, 248], intensity: 0.38, type: 'lab' },
      { x: 8.0, y: 1.5, radius: 36, color: [88, 224, 248], intensity: 0.38, type: 'lab' },
      { x: 6.0, y: 6.0, radius: 84, color: [240, 248, 255], intensity: 0.22, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 5. ROUTE 1 (20 x 40) — Connects Dawnleaf Town (South) to Verdant City (North)
  // =========================================================================
  route1: {
    id: 'route1',
    name: 'ROUTE 1',
    isIndoor: false,
    width: 20,
    height: 40,
    bgColor: '#245834',
    tiles: parseGrid(
      [
        'TTTTTTTTT,,TTTTTTTTT', // 0  (connects north to Verdant City cols 14..15)
        'TTTTTTTTT,,TTTTTTTTT', // 1
        'T...ff...,,...ff...T', // 2
        'T..gggg..,,..gggg..T', // 3
        'T..gggg..,,,.gggg..T', // 4
        'T..gggg...,,.......T', // 5
        'T..LLLL...,,..LLLL.T', // 6  (one-way jump ledges going south!)
        'T.........,,.......T', // 7
        'T...,,,S..,,,......T', // 8  (signpost!)
        'T..,,,,,...,,,.....T', // 9
        'T..,,..ggggg,,.....T', // 10
        'T..,,..ggggg,,.....T', // 11
        'T..,,..ggggg,,..ff.T', // 12
        'T..,,..ggggg,,....fT', // 13  (hidden POKé BALL at 17,13!)
        'T..,,,.....,,,.....T', // 14
        'T...,,,,,,,,.......T', // 15
        'T....LLLLLL....ff..T', // 16  (jump ledge shortcut!)
        'T..............ff..T', // 17
        'T..gggggggggggggg..T', // 18  (unavoidable tall grass band!)
        'T..gggggggggggggg..T', // 19
        'T..gggggggggggggg..T', // 20
        'T........,,........T', // 21
        'T..~~~...,,...ff...T', // 22  (small scenic pond on west)
        'T..~~~...,,..gggg..T', // 23
        'T..~~~...,,..gggg..T', // 24
        'T........,,..gggg..T', // 25
        'T..ff....,,........T', // 26
        'T...f..,,,,..LLLL..T', // 27  (hidden POTION at 3,27 + east ledge!)
        'T.....,,,..........T', // 28
        'T....,,..ggggg.....T', // 29
        'T....,,..ggggg.....T', // 30
        'T....,,..ggggg..f..T', // 31
        'T....,,,,.......f..T', // 32
        'T.......,,,,.......T', // 33
        'T..gggg...,,,......T', // 34
        'T..gggg....,,..ff..T', // 35
        'T..gggg..,,....ff..T', // 36
        'T.......,,,,.......T', // 37
        'TTTTTTTTT,,TTTTTTTTT', // 38
        'TTTTTTTTT,,TTTTTTTTT', // 39 (connects south to Dawnleaf Town cols 9..10)
      ],
      OUTDOOR_LEGEND
    ),
    connections: {
      south: { targetMap: 'town', targetXOffset: 0, targetY: 0 },
      north: { targetMap: 'city', targetXOffset: 5, targetY: 29 },
    },
    warps: [],
    npcs: [
      {
        id: 'routeKid',
        name: 'YOUNGSTER',
        sprite: 'kid',
        x: 6,
        y: 33,
        facing: 'right',
        wanderBounds: { minX: 5, maxX: 7, minY: 32, maxY: 34 },
        getDialogue: () => [
          'YOUNGSTER: Wild POKéMON jump out of the TALL GRASS!',
          'YOUNGSTER: Weaken them first, then toss a POKé BALL from your BAG!',
        ],
      },
      {
        id: 'martEmployee',
        name: 'MART CLERK',
        sprite: 'clerk',
        x: 13,
        y: 15,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'down', 'up'],
        getDialogue: () => {
          if (gameState.flags.receivedMartSample) {
            return [
              'CLERK: Come visit the VERDANT CITY POKé MART just north of here!',
            ];
          }
          return ['CLERK: Hi there! I work at the POKé MART in VERDANT CITY!'];
        },
      },
    ],
    pokeballs: [],
    triggers: [],
    hiddenItems: [
      { id: 'route1_potion', x: 3, y: 27, itemId: 'potion', qty: 1 },
      { id: 'route1_pokeball', x: 17, y: 13, itemId: 'pokeball', qty: 1 },
    ],
    interactables: {
      [keyOf(7, 8)]: ['ROUTE 1: DAWNLEAF TOWN — VERDANT CITY'],
    },
    lights: [],
    encounters: ['route1'],
  },

  // =========================================================================
  // 6. VERDANT CITY (30 x 30) — Pokémon Center, Poké Mart, Plaza & Houses
  // =========================================================================
  city: {
    id: 'city',
    name: 'VERDANT CITY',
    isIndoor: false,
    width: 30,
    height: 30,
    bgColor: '#245834',
    tiles: parseGrid(
      [
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 0  (north exit blocked by resting Old Man)
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 1
        'T..ff........,,,,........ff..T', // 2
        'T..rrrrr.....,,,,....!@#$....T', // 3  (NW House & NE Poké Mart roof)
        'T..RRRRR.....,,,,....%^&*....T', // 4
        'T..HWHWH.....,,,,....[{}]....T', // 5  (Modern Poké Mart)
        'T..HHDHH.....,,,,....(<>)U...T', // 6  (House door 5,6 | Mart doors 23..24,6)
        'T..M.,,S.....,,,,.....,,S....T', // 7  (Signs & mailboxes)
        'T....,,,,,,,,,,,,,,,,,,,.....T', // 8  (Upper boulevard)
        'T....,,,,,,,,,,,,,,,,,,,.....T', // 9
        'T.ff.,,....FFFFFF....,,.ff...T', // 10
        'T.ff.,,..............,,.~~~..T', // 11 (East corner pond)
        'T....,,...,,,,,,,,...,,.~~~..T', // 12 (Central Plaza)
        'T....,,...,,,,,,,,...,,.~~~..T', // 13
        'T....,,...,,,OO,,,...,,......T', // 14 (Shimmering Fountain at 13..14,14..15)
        'T....,,...,,,OO,,,...,,..ff..T', // 15
        'T....,,...,,,,,,,,...,,..ff..T', // 16
        'T....,,...,,,,,,,,...,,......T', // 17
        'T....,,,,,,,,,,,,,,,,,,,.....T', // 18 (Lower boulevard)
        'T....,,,,,,,,,,,,,,,,,,,.....T', // 19
        'T.ff.,,..............,,..ff..T', // 20
        'T...1234....,,,,....bbbbbb...T', // 21 (SW Pokémon Center & SE City House)
        'T...5678....,,,,....BBBBBB...T', // 22
        'T...90zx....,,,,....HWHWHW...T', // 23
        'T...acCe....,,,,....HHDHHH...T', // 24 (Center doors 5..6,24 | House door 23,24)
        'T...S.,,,,,,,S,,,,,,,,,,M....T', // 25 (Center sign 4,25 | City sign 13,25)
        'T..ff........,,,,........ff..T', // 26
        'T..FFFF......,,,,......FFFF..T', // 27
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 28
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 29 (connects south to Route 1 cols 9..10)
      ],
      OUTDOOR_LEGEND
    ),
    connections: {
      north: { targetMap: 'cobaltCity', targetXOffset: 0, targetY: 24 },
      south: { targetMap: 'route1', targetXOffset: -5, targetY: 0 },
    },
    warps: [
      // Pokémon Center sliding doors
      { x: 5, y: 24, targetMap: 'pokecenter', targetX: 6, targetY: 8, targetFacing: 'up' },
      { x: 6, y: 24, targetMap: 'pokecenter', targetX: 6, targetY: 8, targetFacing: 'up' },
      // Poké Mart doors
      { x: 23, y: 6, targetMap: 'pokemart', targetX: 4, targetY: 7, targetFacing: 'up' },
      { x: 24, y: 6, targetMap: 'pokemart', targetX: 4, targetY: 7, targetFacing: 'up' },
      // Enterable NW City House door
      { x: 5, y: 6, targetMap: 'cityHouse', targetX: 4, targetY: 6, targetFacing: 'up' },
    ],
    npcs: [
      {
        id: 'oldManBlocker',
        name: 'OLD MAN',
        sprite: 'oldMan',
        x: 14,
        y: 2,
        facing: 'down',
        idleLook: false,
        getDialogue: () => [
          "OLD MAN: The road north to COBALT CITY is now open!",
          "Their grand POKéMON GYM is truly a spectacle, though it's currently undergoing maintenance!",
        ],
      },
      {
        id: 'cityCatchGuide',
        name: 'TRAINER',
        sprite: 'fatMan',
        x: 11,
        y: 16,
        facing: 'right',
        wanderBounds: { minX: 10, maxX: 12, minY: 15, maxY: 17 },
        getDialogue: () => [
          'TRAINER: Tip for catching wild POKéMON: lower their HP into the yellow or red first!',
          'TRAINER: Status conditions like Poison also make POKé BALLS work even better!',
        ],
      },
      {
        id: 'cityTypeExpert',
        name: 'LASS',
        sprite: 'girl',
        x: 19,
        y: 12,
        facing: 'left',
        wanderBounds: { minX: 18, maxX: 20, minY: 12, maxY: 16 },
        getDialogue: () => [
          'LASS: Remember type matchups! Fire beats Grass, Grass beats Water, and Water beats Fire!',
          'LASS: Electric moves like Pikachu\'s THUNDERSHOCK are super effective against Flying and Water!',
        ],
      },
      {
        id: 'cityKid',
        name: 'KID',
        sprite: 'kid',
        x: 9,
        y: 25,
        facing: 'down',
        wanderBounds: { minX: 8, maxX: 11, minY: 25, maxY: 26 },
        getDialogue: () => [
          'KID: If your POKéMON ever gets poisoned by a Weedle, buy an ANTIDOTE at the POKé MART!',
        ],
      },
    ],
    pokeballs: [],
    triggers: [
      // SE decorative house locked door
      { x: 23, y: 24, type: 'cityHouseLocked' },
    ],
    interactables: {
      [keyOf(13, 25)]: ['VERDANT CITY: Where Green Dreams Bloom!'],
      [keyOf(4, 25)]: ['POKéMON CENTER: Heal your tired POKéMON for free!'],
      [keyOf(24, 7)]: ['POKé MART: All your trainer item needs!'],
      [keyOf(7, 7)]: ['VERDANT PLAZA — North: Route 2 (Closed for rest)'],
      [keyOf(3, 7)]: ["COLLECTOR's HOUSE"],
      [keyOf(24, 25)]: ["RESIDENT's HOUSE"],
    },
    chimneys: [
      { x: 6, y: 3 },
      { x: 25, y: 21 },
    ],
    lights: [],
    encounters: [],
  },

  // =========================================================================
  // 7. POKéMON CENTER INTERIOR (12 x 10)
  // =========================================================================
  pokecenter: {
    id: 'pokecenter',
    name: 'POKéMON CENTER',
    isIndoor: true,
    width: 14,
    height: 10,
    bgColor: '#161218',
    tiles: parseGrid(
      [
        'RRRRRRRRRRRRRR', // 0  (Red luxury accent wall)
        'REEEtHXHEEE.KP', // 1  (Elevators E, TV t, Heal Machine H, Nurse Counter X, Plant K, PC P)
        'R...t...X....p', // 2  (Nurse stands at 6,2 behind counter row 3)
        'R555XXXXX6666p', // 3  (Counter across cols 4..8; talk at 6,3!)
        '5[[5112266886p', // 4  (West blue lounge with sofa [[ | Golden mosaic 1122 | East yellow lounge 88)
        '5()5334466()6p', // 5  (Flower table () in blue lounge | Golden mosaic 3344 | Flower table in yellow)
        '5555pppp66776p', // 6  (Yellow sofa 77)
        'pppppppppppppp', // 7
        'kppppppppppppk', // 8  (Lush indoor palm trees k)
        'ppppppDDpppppp', // 9  (Exit mats at 6..7, 9)
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 6, y: 9, targetMap: 'city', targetX: 6, targetY: 25, targetFacing: 'down' },
      { x: 7, y: 9, targetMap: 'city', targetX: 6, targetY: 25, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'nurse',
        name: 'NURSE',
        sprite: 'nurse',
        x: 6,
        y: 2,
        facing: 'down',
        idleLook: false,
        getDialogue: () => ['NURSE: Welcome to our POKéMON CENTER!'],
      },
      {
        id: 'centerVisitor',
        name: 'TRAINER',
        sprite: 'neighbour',
        x: 10,
        y: 6,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'down'],
        getDialogue: () => [
          'TRAINER: Whenever you heal here, this POKéMON CENTER becomes your safe return spot!',
        ],
      },
      {
        id: 'centerLass',
        name: 'LASS',
        sprite: 'girl',
        x: 2,
        y: 6,
        facing: 'right',
        idleLook: true,
        idleDirs: ['right', 'up'],
        getDialogue: () => [
          'LASS: I love resting in the blue lounge! The soothing music relaxes my POKéMON.',
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(6, 3)]: ['__NURSE_COUNTER__'],
      [keyOf(12, 1)]: ['__CENTER_PC__'],
      [keyOf(5, 1)]: ['A state-of-the-art POKéMON healing machine with six glowing particle slots.'],
      [keyOf(4, 1)]: ['High-definition wall monitor displaying global trainer news!'],
      [keyOf(1, 1)]: ['High-speed express elevator to the Union Room and Wi-Fi Colosseum.'],
      [keyOf(8, 1)]: ['High-speed express elevator to the Trainer Lounge.'],
      [keyOf(2, 5)]: ['A glass table with a fresh bouquet of radiant lilies.'],
      [keyOf(10, 5)]: ['A glass table decorated with cheerful yellow marigolds.'],
    },
    lights: [
      { x: 6.5, y: 2.5, radius: 75, color: [255, 230, 236], intensity: 0.35, type: 'lamp' },
      { x: 12.5, y: 1.4, radius: 28, color: [110, 210, 255], intensity: 0.32, type: 'pc' },
      { x: 4.5, y: 1.2, radius: 36, color: [130, 220, 255], intensity: 0.30, type: 'tv' },
      { x: 6.5, y: 5.0, radius: 65, color: [255, 245, 210], intensity: 0.25, type: 'lamp' },
    ],
    encounters: [],
  },

  pokemart: {
    id: 'pokemart',
    name: 'POKé MART 1F',
    isIndoor: true,
    width: 10,
    height: 9,
    bgColor: '#101620',
    tiles: parseGrid(
      [
        'LLLLLLLLLL', // 0
        'llSSSSSS.D', // 1  (Stocked item shelves, Stairs D at 9,1 leading to 2F!)
        'ffffffffff', // 2
        'fXfXffSSff', // 3  (Clerk at 2,3 behind counter)
        'fXXXffSSff', // 4
        'fvffffffff', // 5  (Vending machine v)
        'ffffffSSff', // 6
        'KffffffffK', // 7
        'ffffddffff', // 8  (Exit mats 4..5, 8)
      ],
      INDOOR_LEGEND
    ),
    warps: [
      // Exit to Verdant City
      { x: 4, y: 8, targetMap: 'city', targetX: 24, targetY: 7, targetFacing: 'down' },
      { x: 5, y: 8, targetMap: 'city', targetX: 24, targetY: 7, targetFacing: 'down' },
      // Stairs UP to 2F
      { x: 9, y: 1, targetMap: 'pokemart2f', targetX: 8, targetY: 2, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'martClerk',
        name: 'CLERK',
        sprite: 'clerk',
        x: 2,
        y: 3,
        facing: 'right',
        idleLook: false,
        getDialogue: () => ['__MART_SHOP__'],
      },
      {
        id: 'martShopper',
        name: 'LASS',
        sprite: 'girl',
        x: 7,
        y: 5,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'up', 'down'],
        getDialogue: () => [
          'LASS: I always keep a few extra POKé BALLS and POTIONS in my BAG!',
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(2, 4)]: ['__MART_SHOP__'],
      [keyOf(3, 3)]: ['__MART_SHOP__'],
      [keyOf(2, 1)]: ['Fresh POKé BALLS, POTIONS, and REVIVES neatly organized on the shelf.'],
      [keyOf(5, 1)]: ['Shiny trainer accessory catalogs on display.'],
      [keyOf(1, 5)]: ['A beverage vending machine. Fresh Lemonade and Soda Pop!'],
    },
    lights: [
      { x: 2.5, y: 3.5, radius: 60, color: [220, 240, 255], intensity: 0.3, type: 'lamp' },
      { x: 6.5, y: 4.5, radius: 55, color: [255, 235, 190], intensity: 0.25, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // POKé MART 2F (10 x 8) - Luxury Item Showcase
  // =========================================================================
  pokemart2f: {
    id: 'pokemart2f',
    name: 'POKé MART 2F',
    isIndoor: true,
    width: 10,
    height: 8,
    bgColor: '#101620',
    tiles: parseGrid(
      [
        'LLLLLLLLLL', // 0
        'llssssssll', // 1  (Luxury glass display showcases)
        'ffffffff.D', // 2  (Stairs DOWN at 9,2)
        'fXfXffssff', // 3  (Counter with Clerk at 2,3)
        'fXXXffssff', // 4
        'ffffffssff', // 5  (Evolution stone & TM pedestals)
        'KffffffffK', // 6
        'ffffffffff', // 7
      ],
      INDOOR_LEGEND
    ),
    warps: [
      // Stairs DOWN to 1F
      { x: 9, y: 2, targetMap: 'pokemart', targetX: 9, targetY: 2, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'martClerk2F',
        name: 'CLERK',
        sprite: 'clerk',
        x: 2,
        y: 3,
        facing: 'right',
        idleLook: false,
        getDialogue: () => [
          "Sorry, the cashier is not available right now. Please come again later!",
        ],
      },
      {
        id: 'collector2F',
        name: 'GENTLEMAN',
        sprite: 'oldMan',
        x: 6,
        y: 5,
        facing: 'up',
        idleLook: true,
        idleDirs: ['up', 'left'],
        getDialogue: () => [
          "GENTLEMAN: The second floor stocks rare TMs and Evolution Stones. I check back every day to see if the specialist clerk has arrived!",
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(2, 4)]: ["Sorry, the cashier is not available right now. Please come again later!"],
      [keyOf(3, 3)]: ["Sorry, the cashier is not available right now. Please come again later!"],
      [keyOf(2, 1)]: ["A locked glass cabinet holding glowing Fire and Water Stones."],
      [keyOf(5, 1)]: ["A display case with rare Technical Machines (TMs)."],
    },
    lights: [
      { x: 2.5, y: 3.5, radius: 55, color: [220, 240, 255], intensity: 0.3, type: 'lamp' },
      { x: 6.5, y: 4.5, radius: 55, color: [255, 215, 140], intensity: 0.28, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // RIVAL'S HOUSE INTERIOR (10 x 8)
  // =========================================================================
  rivalHouse: {
    id: 'rivalHouse',
    name: "RIVAL's HOUSE",
    isIndoor: true,
    width: 10,
    height: 8,
    bgColor: '#181214',
    tiles: parseGrid(
      [
        'WWWWWWWWWW', // 0
        'WU.g.P..^W', // 1  (Stairs U, Trophy case g, Desk with laptop P, Bed ^)
        'W[..rrrr_W', // 2  (Red sofa, Red Pokéball center rug, Bed bot _)
        'W[(.rrrr.W', // 3  (Coffee table with battle magazine, Red rug)
        'W...rrrr.W', // 4
        'Wbx.rrrr.W', // 5  (Gym bench b, punching bag x, plant K)
        'Wb..K....W', // 6
        'WWWWDDWWWW', // 7  (Exit mats at 4..5, 7)
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 4, y: 7, targetMap: 'town', targetX: 14, targetY: 7, targetFacing: 'down' },
      { x: 5, y: 7, targetMap: 'town', targetX: 14, targetY: 7, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'rivalSister',
        name: 'SISTER',
        sprite: 'girl',
        x: 6,
        y: 2,
        facing: 'down',
        idleLook: true,
        idleDirs: ['down', 'left', 'right'],
        getDialogue: () => [
          "SISTER: Hi! My brother {RIVAL} has been training hard every single day!",
          "He sets up barbells and workout equipment everywhere... He's determined to become the champion!",
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(3, 1)]: ["A gleaming trophy collection! First-place trophies and victory ribbons."],
      [keyOf(5, 1)]: ["The laptop is open to a battle simulation tracking type matchups and stats."],
      [keyOf(8, 1)]: ["RIVAL's bed. Tucked in tightly with military discipline."],
      [keyOf(8, 2)]: ["RIVAL's bed. Tucked in tightly with military discipline."],
      [keyOf(3, 5)]: ["A heavy punching bag. It shows signs of intense daily training."],
      [keyOf(2, 5)]: ["A heavy steel barbell and bench press setup for strength workouts."],
      [keyOf(3, 3)]: ["A battle tactics handbook open to elite trainer strategies."],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 48, color: [255, 220, 200], intensity: 0.4, type: 'windowBeam' },
      { x: 5.5, y: 1.4, radius: 30, color: [140, 220, 255], intensity: 0.32, type: 'pc' },
      { x: 5.0, y: 4.0, radius: 60, color: [255, 200, 150], intensity: 0.28, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 9. VERDANT CITY ENTERABLE HOUSE (9 x 8)
  // =========================================================================
  cityHouse: {
    id: 'cityHouse',
    name: "COLLECTOR'S HOUSE",
    isIndoor: true,
    width: 9,
    height: 8,
    bgColor: '#0E121A',
    tiles: parseGrid(
      [
        'WWWWWWWWW', // 0
        'WBB(T..BW', // 1
        'W.......W', // 2
        'W..[[...W', // 3
        'W.......W', // 4
        'W.uu.uu.W', // 5
        'W.......W', // 6
        'WWWDDWWWW', // 7
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 3, y: 7, targetMap: 'city', targetX: 23, targetY: 17, targetFacing: 'down' },
      { x: 4, y: 7, targetMap: 'city', targetX: 23, targetY: 17, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'collector',
        name: 'COLLECTOR',
        sprite: 'neighbour',
        x: 5,
        y: 3,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'down'],
        getDialogue: () => [
          'COLLECTOR: Hey there, {PLAYER}! I collect rare POKéMON from around the region.',
          'COLLECTOR: Rumor has it a rare PIKACHU hides in the tall grass on ROUTE 1!',
          "COLLECTOR: Once trading opens up, I'd love to trade POKéMON with you!",
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(1, 1)]: ['Illustrated POKéMON field guides fill the shelf.'],
      [keyOf(2, 1)]: ['Illustrated POKéMON field guides fill the shelf.'],
      [keyOf(4, 1)]: ['A nature documentary about wild PIKACHU is playing on TV!'],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 48, color: [255, 232, 168], intensity: 0.4, type: 'windowBeam' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 10. COBALT CITY (30 x 26) - Grand Metropol & Cobalt Gym
  // =========================================================================
  cobaltCity: {
    id: 'cobaltCity',
    name: 'COBALT CITY',
    isOutdoor: true,
    width: 30,
    height: 26,
    bgColor: '#2E7D32',
    tiles: parseGrid(
      [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
        'T............................T', // 1
        'T...yyyy....YYYYYYYY....yyyy.T', // 2  North Boulevard
        'T...qqee....12341234....aAss.T', // 3  House A (3..6) | POKéMON GYM (12..19, 3..6) | House B (24..27)
        'T...1234....56785678....bBde.T', // 4
        'T...5678....9$*k9$*k....fGhe.T', // 5
        'T...vvOv....vvDDDDvv....oouo.T', // 6  Gym doors at 15..16, 6
        'T...pppp....pppppppp....pppp.T', // 7
        'T............................T', // 8
        'T..qqee.....pppppppp.....aa..T', // 9  Mid-City District: Timber Cottage & Observatory Dome
        'T..1234.....ppffhhpp.....bb..T', // 10 (ffhh = Central Fountain)
        'T..5678.....ppffhhpp.....cc..T', // 11
        'T..vvOv.....pppppppp.....dd..T', // 12
        'T............................T', // 13
        'T.pppppppppppppppppppppppppp.T', // 14 Grand Crossway
        'T............................T', // 15
        'T..aAss................qqee..T', // 16 Southern Residential Quarter
        'T..bBde................1234..T', // 17
        'T..fGhe................5678..T', // 18
        'T..oouo................vvOv..T', // 19
        'T...pp..................pp...T', // 20
        'T...pp......pppppp......pp...T', // 21
        'T...........pppppp...........T', // 22
        'T...........pppppp...........T', // 23
        'T...........pppppp...........T', // 24 Entrance from Verdant City
        'TTTTTTTTTTTT.DDDD.TTTTTTTTTTTT', // 25 South connection to city
      ],
      OUTDOOR_LEGEND
    ),
    warps: [
      // South boundary to Verdant City
      { x: 13, y: 25, targetMap: 'city', targetX: 14, targetY: 1, targetFacing: 'down' },
      { x: 14, y: 25, targetMap: 'city', targetX: 14, targetY: 1, targetFacing: 'down' },
      { x: 15, y: 25, targetMap: 'city', targetX: 15, targetY: 1, targetFacing: 'down' },
      { x: 16, y: 25, targetMap: 'city', targetX: 15, targetY: 1, targetFacing: 'down' },
    ],
    connections: {
      south: { targetMap: 'city', targetXOffset: 0, targetY: 1 },
    },
    npcs: [
      {
        id: 'gymGreeter',
        name: 'OFFICIAL',
        sprite: 'clerk',
        x: 14,
        y: 7,
        facing: 'down',
        idleLook: true,
        idleDirs: ['down', 'left', 'right'],
        getDialogue: () => [
          'OFFICIAL: Welcome to COBALT CITY! The Gym Leader is currently away inspecting the mountain pass.',
          'OFFICIAL: The Gym is temporarily closed. Please come back later!',
        ],
      },
      {
        id: 'cobaltCitizen',
        name: 'CAMPER',
        sprite: 'kid',
        x: 10,
        y: 14,
        facing: 'right',
        idleLook: true,
        idleDirs: ['left', 'right'],
        getDialogue: () => [
          'CAMPER: Cobalt City has the most diverse architecture in the region!',
          'CAMPER: Look at the astronomical dome to the east. The professor there studies star charts!',
        ],
      },
      {
        id: 'cobaltLady',
        name: 'LADY',
        sprite: 'girl',
        x: 21,
        y: 11,
        facing: 'left',
        idleLook: true,
        idleDirs: ['up', 'left', 'down'],
        getDialogue: () => [
          'LADY: The central fountain was built over fifty years ago by the city founders.',
        ],
      },
    ],
    pokeballs: [],
    triggers: [
      {
        x: 15,
        y: 6,
        type: 'gymClosed',
        text: 'The Gym is currently closed. Please come back later!',
      },
      {
        x: 16,
        y: 6,
        type: 'gymClosed',
        text: 'The Gym is currently closed. Please come back later!',
      },
    ],
    interactables: {
      [keyOf(15, 6)]: ['The Gym is currently closed. Please come back later!'],
      [keyOf(16, 6)]: ['The Gym is currently closed. Please come back later!'],
      [keyOf(13, 7)]: ['COBALT CITY POKéMON GYM - LEADER: VACANT\n"The Steely Bastion of Strategy"'],
      [keyOf(14, 11)]: ['A sparkling freshwater fountain. Wild water Pokémon occasionally visit!'],
      [keyOf(15, 11)]: ['A sparkling freshwater fountain. Wild water Pokémon occasionally visit!'],
    },
    lights: [
      { x: 15.0, y: 7.0, radius: 70, color: [255, 230, 160], intensity: 0.35, type: 'lamp' },
      { x: 8.0, y: 14.0, radius: 60, color: [255, 230, 160], intensity: 0.30, type: 'lamp' },
      { x: 22.0, y: 14.0, radius: 60, color: [255, 230, 160], intensity: 0.30, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // FRIEND'S HOUSE (8 x 8)
  // =========================================================================
  friendHouse: {
    id: 'friendHouse',
    name: 'FRIEND HOUSE',
    isIndoor: true,
    width: 8,
    height: 8,
    bgColor: '#0E1018',
    tiles: [
      // 0: North wall
      [T.WALL_TOP, T.WALL_TOP, T.WALL_WINDOW, T.WALL_TOP, T.WALL_TOP, T.WALL_WINDOW, T.WALL_TOP, T.WALL_TOP],
      // 1: Bookshelves, study desk with notes, microscope, potted plant
      [T.WALL_BOT, T.BOOKSHELF, T.BOOKSHELF, T.DESK, T.PC_DESK, T.DESK, T.BOOKSHELF, T.PLANT],
      // 2: Open walking floor
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      // 3: Bed on left, research table & chairs on right
      [T.WOOD_FLOOR, T.BED_TOP, T.WOOD_FLOOR, T.TABLE_LEFT, T.TABLE_RIGHT, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      // 4: Bed foot on left, center teal rug
      [T.WOOD_FLOOR, T.BED_BOT, T.WOOD_FLOOR, T.RUG_TEAL_PC, T.RUG_TEAL_PC, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      // 5: Open walking floor
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      // 6: Corner plants, entrance doormats
      [T.PLANT, T.WOOD_FLOOR, T.WOOD_FLOOR, T.DOORMAT, T.DOORMAT, T.WOOD_FLOOR, T.WOOD_FLOOR, T.PLANT],
      // 7: South baseboard
      [T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT, T.WALL_BOT],
    ],
    warps: [
      {
        x: 3,
        y: 6,
        targetMap: 'town',
        targetX: 16,
        targetY: 14,
        targetFacing: 'down',
      },
      {
        x: 4,
        y: 6,
        targetMap: 'town',
        targetX: 16,
        targetY: 14,
        targetFacing: 'down',
      },
    ],
    npcs: [
      {
        id: 'friendMom',
        name: 'FRIEND MOM',
        sprite: 'girl',
        x: 2,
        y: 3,
        facing: 'right',
        idleLook: true,
        idleDirs: ['right', 'down'],
        getDialogue: () => {
          if (gameState.flags.goalsDiscussed) {
            return [
              "FRIEND'S MOM: {FRIEND} ran off to start researching POKéMON right after getting that partner!",
              "FRIEND'S MOM: You two take good care of each other!",
            ];
          }
          if (gameState.flags.gotStarter) {
            return [
              "FRIEND'S MOM: Oh! Are you looking for {FRIEND}? {FRIEND} headed towards the PROFESSOR's Lab!",
            ];
          }
          return [
            "FRIEND'S MOM: Good morning, {PLAYER}! {FRIEND} was reading POKéMON encyclopedias all night!",
          ];
        },
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      [keyOf(1, 1)]: ['Bookshelves packed with field notes, magnifying glasses, and regional POKéMON encyclopedias!'],
      [keyOf(2, 1)]: ['A hefty volume titled: "Habitat Distribution & Behaviors of Wild POKéMON".'],
      [keyOf(3, 1)]: ['A high-powered digital microscope is set up with sample slides of Berry leaves.'],
      [keyOf(4, 1)]: ["The PC screen displays active research databases connecting to the Professor's lab."],
      [keyOf(6, 1)]: ['A botanical research shelf filled with dried herbs and Berry specimens.'],
      [keyOf(1, 3)]: ['A cozy single bed with a leaf-patterned quilt.'],
      [keyOf(1, 4)]: ['A cozy single bed with a leaf-patterned quilt.'],
    },
    lights: [
      { x: 3.5, y: 1.0, radius: 48, color: [255, 236, 180], intensity: 0.4, type: 'windowBeam' },
      { x: 4.5, y: 1.3, radius: 32, color: [100, 215, 255], intensity: 0.35, type: 'pc' },
    ],
    encounters: [],
  },
};

export function getMap(mapId) {
  return MAPS[mapId] || MAPS.bedroom;
}