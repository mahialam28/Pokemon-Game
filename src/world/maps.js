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
};

export const MAPS = {
  // =========================================================================
  // 1. PLAYER'S BEDROOM (8 x 8)
  // =========================================================================
  bedroom: {
    id: 'bedroom',
    name: 'BEDROOM',
    isIndoor: true,
    width: 8,
    height: 8,
    bgColor: '#0E1018',
    tiles: [
      [T.WALL_TOP, T.WALL_TOP, T.WALL_TOP, T.WALL_WINDOW, T.WALL_TOP, T.WALL_TOP, T.WALL_TOP, T.WALL_TOP],
      [T.WALL_BOT, T.PC_DESK,  T.DESK,     T.WALL_BOT,    T.TV,       T.WALL_BOT, T.STAIRS_DOWN, T.PLANT],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.BED_TOP,    T.WOOD_FLOOR, T.RUG_RED,    T.RUG_RED,    T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.BED_BOT,    T.WOOD_FLOOR, T.RUG_RED,    T.RUG_RED,    T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.PLANT,      T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
    ],
    warps: [
      {
        x: 6,
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
      [keyOf(1, 1)]: ["It's your PC. Nothing to do yet."],
      [keyOf(2, 1)]: ['Your desk. A fresh adventure notebook sits on top.'],
      [keyOf(4, 1)]: ['A movie is playing. Four kids are walking on train tracks... Time to go!'],
      [keyOf(1, 4)]: ["It's your cozy bed. No time to sleep today!"],
      [keyOf(1, 5)]: ["It's your cozy bed. No time to sleep today!"],
      [keyOf(7, 1)]: ['A potted plant. It looks freshly watered.'],
      [keyOf(0, 6)]: ['A potted plant. It looks freshly watered.'],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 46, color: [255, 232, 168], intensity: 0.42, type: 'windowBeam' },
      { x: 1.5, y: 1.3, radius: 26, color: [96, 200, 255], intensity: 0.34, type: 'pc' },
      { x: 2.7, y: 1.4, radius: 28, color: [255, 214, 130], intensity: 0.32, type: 'lamp' },
      { x: 4.5, y: 1.4, radius: 30, color: [130, 210, 255], intensity: 0.3, type: 'tv' },
      { x: 4.0, y: 4.5, radius: 56, color: [255, 224, 165], intensity: 0.22, type: 'lamp' },
    ],
    encounters: [], // Phase 2+
  },

  // =========================================================================
  // 2. HOUSE DOWNSTAIRS (10 x 8)
  // =========================================================================
  downstairs: {
    id: 'downstairs',
    name: 'HOME 1F',
    isIndoor: true,
    width: 10,
    height: 8,
    bgColor: '#0E1018',
    tiles: [
      [T.WALL_TOP, T.WALL_TOP, T.WALL_TOP, T.WALL_WINDOW, T.WALL_TOP, T.WALL_TOP, T.WALL_WINDOW, T.WALL_TOP, T.WALL_TOP, T.WALL_TOP],
      [T.KITCHEN_FRIDGE, T.KITCHEN_STOVE, T.KITCHEN_COUNTER, T.WALL_BOT, T.TV, T.BOOKSHELF, T.WALL_BOT, T.WALL_BOT, T.STAIRS_UP, T.PLANT],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.CHAIR, T.TABLE_LEFT, T.TABLE_RIGHT, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
      [T.PLANT,      T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.PLANT],
      [T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.DOORMAT,    T.DOORMAT,    T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR, T.WOOD_FLOOR],
    ],
    warps: [
      {
        x: 8,
        y: 1,
        targetMap: 'bedroom',
        targetX: 6,
        targetY: 2,
        targetFacing: 'down',
      },
      {
        x: 4,
        y: 7,
        targetMap: 'town',
        targetX: 4,
        targetY: 7,
        targetFacing: 'down',
        guard: 'requireMom',
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
      [keyOf(0, 1)]: ['The fridge is stocked with cold lemonade and snacks.'],
      [keyOf(1, 1)]: ['Breakfast was cooked here just a little while ago.'],
      [keyOf(4, 1)]: ["The morning news is showing a story on the PROFESSOR's research."],
      [keyOf(5, 1)]: ['Family photo albums and recipe books fill the shelf.'],
      [keyOf(4, 3)]: ['A warm cup of tea sits on the kitchen table.'],
      [keyOf(5, 3)]: ['Fresh fruit from Dawnleaf Town sits in a bowl.'],
    },
    lights: [
      { x: 3.5, y: 0.7, radius: 48, color: [255, 232, 168], intensity: 0.42, type: 'windowBeam' },
      { x: 6.5, y: 0.7, radius: 48, color: [255, 232, 168], intensity: 0.42, type: 'windowBeam' },
      { x: 4.5, y: 1.4, radius: 30, color: [130, 210, 255], intensity: 0.28, type: 'tv' },
      { x: 5.0, y: 4.2, radius: 64, color: [255, 216, 148], intensity: 0.28, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
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
      // y = 3..6: Player's House (cols 3..6) & Neighbour's House (cols 13..16)
      [T.TREE, T.GRASS, T.GRASS, T.ROOF_RED, T.ROOF_RED, T.ROOF_RED, T.ROOF_RED, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.GRASS, T.ROOF_BLUE, T.ROOF_BLUE, T.ROOF_BLUE, T.ROOF_BLUE, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.ROOF_RED_TRIM, T.ROOF_RED_TRIM, T.ROOF_RED_TRIM, T.ROOF_RED_TRIM, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.GRASS, T.ROOF_BLUE_TRIM, T.ROOF_BLUE_TRIM, T.ROOF_BLUE_TRIM, T.ROOF_BLUE_TRIM, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.HOUSE_WALL, T.HOUSE_WINDOW, T.HOUSE_WALL, T.HOUSE_WINDOW, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.GRASS, T.HOUSE_WALL, T.HOUSE_WINDOW, T.HOUSE_WALL, T.HOUSE_WINDOW, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.HOUSE_WALL, T.DOOR, T.HOUSE_WALL, T.HOUSE_WALL, T.GRASS, T.GRASS, T.PATH, T.PATH, T.GRASS, T.GRASS, T.HOUSE_WALL, T.DOOR, T.HOUSE_WALL, T.HOUSE_WALL, T.GRASS, T.GRASS, T.TREE],
      // y = 7: Main town boulevard connecting houses
      [T.TREE, T.GRASS, T.FLOWER, T.MAILBOX, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.GRASS, T.MAILBOX, T.FLOWER, T.GRASS, T.TREE],
      // y = 8: Town sign & side paths around lab
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.GRASS, T.SIGN, T.PATH, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.TREE],
      // y = 9: Fences & central approach
      [T.TREE, T.GRASS, T.FENCE, T.FENCE, T.FENCE, T.FENCE, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.FENCE, T.FENCE, T.FENCE, T.GRASS, T.TREE],
      // y = 10..14: Professor's Lab (cols 7..13), flower beds, scenic pond & jumpable ledge terrace
      [T.TREE, T.GRASS, T.FLOWER, T.FLOWER, T.FLOWER, T.GRASS, T.PATH, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.ROOF_LAB, T.PATH, T.GRASS, T.GRASS, T.FLOWER, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.ROOF_LAB_TRIM, T.PATH, T.LEDGE, T.LEDGE, T.LEDGE, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.WATER, T.WATER, T.WATER, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.WATER, T.WATER, T.WATER, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_WINDOW, T.LAB_WALL, T.PATH, T.GRASS, T.FLOWER, T.GRASS, T.GRASS, T.TREE],
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.LAB_DOOR, T.LAB_WALL, T.LAB_WALL, T.LAB_WALL, T.PATH, T.LAB_SIGN, T.GRASS, T.GRASS, T.GRASS, T.TREE],
      // y = 15: Lab front plaza
      [T.TREE, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.PATH, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.TREE],
      // y = 16..17: Southern flowers & tree border
      [T.TREE, T.TREE, T.GRASS, T.FLOWER, T.FLOWER, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.GRASS, T.FLOWER, T.GRASS, T.GRASS, T.TREE, T.TREE],
      [T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE, T.TREE],
    ],
    warps: [
      {
        x: 4,
        y: 6,
        targetMap: 'downstairs',
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
        x: 16,
        y: 12,
        facing: 'up',
        wanderBounds: { minX: 15, maxX: 17, minY: 12, maxY: 13 },
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
      // Neighbour house locked door feedback when stepped onto
      { x: 14, y: 6, type: 'neighbourDoor' },
    ],
    interactables: {
      [keyOf(3, 7)]: ["{PLAYER}'s HOUSE"],
      [keyOf(16, 7)]: ["NEIGHBOUR's HOUSE"],
      [keyOf(8, 8)]: ['DAWNLEAF TOWN: A quiet little start.'],
      [keyOf(15, 14)]: ["PROFESSOR's POKéMON LAB"],
      [keyOf(14, 6)]: ["It's your neighbour's house. Nobody seems to be home right now."],
    },
    chimneys: [
      { x: 5, y: 3 },
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
        'T..rrrrr.....,,,,.....bbbbb..T', // 3  (NW House & NE Poké Mart roof)
        'T..RRRRR.....,,,,.....BBBBB..T', // 4
        'T..HWHWH.....,,,,.....EUWVE..T', // 5  (Poké Mart "M" sign at 23,5!)
        'T..HHDHH.....,,,,.....EEAEE..T', // 6  (House door 5,6 | Mart door 24,6)
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
        'T..rrrrrr....,,,,....bbbbbb..T', // 21 (SW Pokémon Center & SE City House)
        'T..RRRRRR....,,,,....BBBBBB..T', // 22
        'T..HPWHWH....,,,,....HWHWHW..T', // 23 (Pokémon Center "P" sign at 4,23!)
        'T..HHHAHH....,,,,....HHDHHH..T', // 24 (Center door 6,24 | House door 23,24)
        'T...S.,,,,,,,S,,,,,,,,,,M....T', // 25 (Center sign 4,25 | City sign 13,25)
        'T..ff........,,,,........ff..T', // 26
        'T..FFFF......,,,,......FFFF..T', // 27
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 28
        'TTTTTTTTTTTTTT,,TTTTTTTTTTTTTT', // 29 (connects south to Route 1 cols 9..10)
      ],
      OUTDOOR_LEGEND
    ),
    connections: {
      south: { targetMap: 'route1', targetXOffset: -5, targetY: 0 },
    },
    warps: [
      // Pokémon Center sliding door
      { x: 6, y: 24, targetMap: 'pokecenter', targetX: 6, targetY: 8, targetFacing: 'up' },
      // Poké Mart door
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
          "OLD MAN: Sorry, I'm resting here after my morning walk. Come back later!",
          '(You have reached the end of Phase 3 content — explore Verdant City & catch them all!)',
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
      // Old man politely blocks north exit (cols 14..15, y=1)
      { x: 14, y: 1, type: 'oldManBlock' },
      { x: 15, y: 1, type: 'oldManBlock' },
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
    width: 12,
    height: 10,
    bgColor: '#161218',
    tiles: parseGrid(
      [
        'CCCCCCCCCCCC', // 0
        'cccHccccKcPc', // 1  (Heal machine at 3,1 | Plant at 8,1 | PC at 10,1)
        'ppXXpppppppp', // 2  (Nurse stands at 5,2 behind counter row 3!)
        'ppXXXXXXpppp', // 3  (Service counter across cols 2..7; talk at 5,4!)
        'pppppppppppp', // 4
        'p[]pppppp[]p', // 5  (Waiting sofas on left & right)
        'pppppppppppp', // 6
        'pppppppppppp', // 7
        'KppppppppppK', // 8
        'pppppDDppppp', // 9  (Exit mats 5..6, 9)
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 5, y: 9, targetMap: 'city', targetX: 6, targetY: 25, targetFacing: 'down' },
      { x: 6, y: 9, targetMap: 'city', targetX: 6, targetY: 25, targetFacing: 'down' },
    ],
    npcs: [
      {
        id: 'nurse',
        name: 'NURSE',
        sprite: 'nurse',
        x: 5,
        y: 2,
        facing: 'down',
        idleLook: false,
        getDialogue: () => ['NURSE: Welcome to our POKéMON CENTER!'],
      },
      {
        id: 'centerVisitor',
        name: 'TRAINER',
        sprite: 'neighbour',
        x: 9,
        y: 6,
        facing: 'left',
        idleLook: true,
        idleDirs: ['left', 'down'],
        getDialogue: () => [
          'TRAINER: Whenever you heal here, this POKéMON CENTER becomes your safe return spot!',
        ],
      },
    ],
    pokeballs: [],
    triggers: [],
    interactables: {
      // Talking across the counter at (5,3) triggers Nurse healing in OverworldScene!
      [keyOf(5, 3)]: ['__NURSE_COUNTER__'],
      [keyOf(10, 1)]: ['__CENTER_PC__'],
      [keyOf(3, 1)]: ['A gleaming POKéMON healing machine.'],
    },
    lights: [
      { x: 5.5, y: 2.5, radius: 70, color: [255, 224, 232], intensity: 0.3, type: 'lamp' },
      { x: 10.5, y: 1.4, radius: 28, color: [110, 210, 255], intensity: 0.32, type: 'pc' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 8. POKé MART INTERIOR (10 x 9)
  // =========================================================================
  pokemart: {
    id: 'pokemart',
    name: 'POKé MART',
    isIndoor: true,
    width: 10,
    height: 9,
    bgColor: '#101620',
    tiles: parseGrid(
      [
        'LLLLLLLLLL', // 0
        'llSSSSSSll', // 1  (Stocked colorful item shelves)
        'ffffffffff', // 2  (Clerk stands at 2,3 behind counter!)
        'fXfXffSSff', // 3
        'fXXXffSSff', // 4  (Talk to clerk across counter at 2,4 or 3,3!)
        'ffffffffff', // 5
        'ffffffSSff', // 6
        'KffffffffK', // 7
        'ffffddffff', // 8  (Exit mats 4..5, 8)
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 4, y: 8, targetMap: 'city', targetX: 24, targetY: 7, targetFacing: 'down' },
      { x: 5, y: 8, targetMap: 'city', targetX: 24, targetY: 7, targetFacing: 'down' },
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
      [keyOf(2, 1)]: ['Shelves lined neatly with POKé BALLS and POTIONS!'],
      [keyOf(3, 1)]: ['Shelves lined neatly with POKé BALLS and POTIONS!'],
      [keyOf(4, 1)]: ['Shelves lined neatly with ANTIDOTES and supplies!'],
      [keyOf(5, 1)]: ['Shelves lined neatly with ANTIDOTES and supplies!'],
      [keyOf(6, 1)]: ['Shelves lined neatly with traveler gear!'],
      [keyOf(7, 1)]: ['Shelves lined neatly with traveler gear!'],
    },
    lights: [
      { x: 5, y: 4, radius: 75, color: [230, 245, 255], intensity: 0.28, type: 'lamp' },
    ],
    encounters: [],
  },

  // =========================================================================
  // 9. VERDANT CITY ENTERABLE HOUSE (9 x 8)
  // =========================================================================
  cityHouse: {
    id: 'cityHouse',
    name: "COLLECTOR's HOUSE",
    isIndoor: true,
    width: 9,
    height: 8,
    bgColor: '#101218',
    tiles: parseGrid(
      [
        'WWWNWWWWW', // 0
        'wBBwTwwKw', // 1
        '.........', // 2
        '..h()....', // 3
        '...rr....', // 4
        '...rr....', // 5
        'K.......K', // 6
        '....DD...', // 7
      ],
      INDOOR_LEGEND
    ),
    warps: [
      { x: 4, y: 7, targetMap: 'city', targetX: 5, targetY: 7, targetFacing: 'down' },
      { x: 5, y: 7, targetMap: 'city', targetX: 5, targetY: 7, targetFacing: 'down' },
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
};

export function getMap(mapId) {
  return MAPS[mapId] || MAPS.bedroom;
}
