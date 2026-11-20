/**
 * Hand-crafted 16x16 pixel-art metatiles for Friend's House (Panel 3).
 */

export const PAL_FRIEND_EXT = {
  '0': '#0C1A0E', // roof outline
  '1': '#143018', // deep green
  '2': '#1E4A24', // forest green shadow
  '3': '#2E6E36', // emerald mid
  '4': '#42944C', // green body
  '5': '#5EB668', // green light
  '6': '#82D68C', // green highlight
  '7': '#B2F4BC', // green soft shine
  'w': '#1A120A', // timber dark outline
  'W': '#382214', // timber shadow
  'x': '#603C24', // timber mid
  'X': '#8C5A38', // timber light
  'y': '#BC8458', // timber warm
  'e': '#F8F4EC', // cream stucco face
  'E': '#E6DCC8', // stucco mid
  'd': '#CEC0A6', // stucco shadow
  'k': '#101E2C', // window glass dark
  'K': '#1E3C56', // window glass mid
  'l': '#3C6E96', // window glass light
  'L': '#76AEDC', // window glass reflection
  't': '#FFFFFF', // white blossom / trim
  'T': '#D8D4CC', // white shadow
  'p': '#2E1020', // rose bush dark
  'P': '#6C2046', // rose bush mid
  'v': '#B43E78', // rose bush pink
  'V': '#F274A8', // rose bush light pink
  'a': '#FFA8CC', // rose blossom petal
  'g': '#102612', // hedge dark
  'G': '#205024', // hedge mid
  'h': '#38823E', // hedge bright
  'H': '#60B866', // hedge highlight
  's': '#202422', // stone path dark
  'S': '#3E4642', // stone path shadow
  'm': '#606C64', // stone path mid
  'M': '#8A988E', // stone path light
  'n': '#B8C8BC', // stone path surface
  'c': '#403C38', // chimney stone dark
  'C': '#74706A', // chimney stone mid
  'f': '#A8A49E', // chimney stone light
  'F': '#DCD8D2', // chimney stone white
  'j': '#D09420', // lantern brass
  'J': '#FFE460', // lantern warm glow
  '.': null,
};

export const FRIEND_TILES = {
  FRIEND_EXT_ROOF_L_TOP: 390,
  FRIEND_EXT_ROOF_M_TOP: 391,
  FRIEND_EXT_GABLE_PEAK: 392,
  FRIEND_EXT_ROOF_R_TOP: 393,
  FRIEND_EXT_ROOF_L_BOT: 394,
  FRIEND_EXT_ROOF_M_BOT: 395,
  FRIEND_EXT_GABLE_WIN: 396,
  FRIEND_EXT_ROOF_R_BOT: 397,
  FRIEND_EXT_WALL_L_TOP: 398,
  FRIEND_EXT_PORCH_CANOPY: 399,
  FRIEND_EXT_WALL_GABLE_TOP: 400,
  FRIEND_EXT_WALL_R_TOP: 401,
  FRIEND_EXT_WALL_WIN_L: 402,
  FRIEND_EXT_DOOR_PORCH: 403,
  FRIEND_EXT_WALL_GABLE_B: 404,
  FRIEND_EXT_WALL_R_BASE: 405,
  FRIEND_EXT_BUSH_ROSE: 406,
  FRIEND_EXT_STONE_PATH: 407,
  FRIEND_EXT_FENCE_WOOD_H: 408,
  FRIEND_EXT_FENCE_WOOD_POST: 409,
  FRIEND_EXT_FENCE_LANTERN_POST: 410,
  FRIEND_EXT_FENCE_CORNER_L: 411,
  FRIEND_EXT_FENCE_CORNER_R: 412,
};

export const MAP_FRIEND_EXT_ROOF_L_TOP = [
  '........00000000',
  '......0076655443',
  '....007655443322',
  '...0065544332211',
  '..00654433221110',
  '..07543322111000',
  '.006432211100345',
  '.075432111003456',
  '.064322110034565',
  '0054321100234564',
  '0754321100345653',
  '0643221002345642',
  '0543211003456532',
  '0543221002345431',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
];

export const MAP_FRIEND_EXT_ROOF_M_TOP = [
  '...00000000.....',
  '...0FFFFFFF0....',
  '...0fCCCCCC0....',
  '...0cCccccC0....',
  '0000cCFFFFcC0000',
  '5540cCffffcC0433',
  '4320cCFFFFcC0211',
  '0000000000000000',
  '6655443366554433',
  '5544332255443322',
  '4433221144332211',
  '0000000000000000',
  '6655443366554433',
  '5544332255443322',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
];

export const MAP_FRIEND_EXT_GABLE_PEAK = [
  '.......00.......',
  '......0yy0......',
  '.....0yXXy0.....',
  '....0yXXXXy0....',
  '...0yXXwwXXy0...',
  '..0yXXwttwXXy0..',
  '.0yXXwtTTtwXXy0.',
  '0yXXwtTkkTtwXXy0',
  'wXXwtTkLLkTwXXw0',
  '000wtTklLKkTw000',
  'WXe0tTklllkt0eXW',
  'WXe0tTkkkkt0deXW',
  'WXe00tttttt0deXW',
  'WXedddddddddeXWW',
  'WXeeeeeeeeeeeXWW',
  'WWWWWWWWWWWWWWWW',
];

export const MAP_FRIEND_EXT_ROOF_R_TOP = [
  '00000000........',
  '3445566700......',
  '223344556700....',
  '1122334455600...',
  '01112233445600..',
  '00011122334570..',
  '543001112234600.',
  '654300111234570.',
  '565430011223460.',
  '4654320011234500',
  '3565430011234570',
  '2465432001223460',
  '2356543001123450',
  '1345432001223450',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
];

export const MAP_FRIEND_EXT_ROOF_L_BOT = [
  '7766554433221100',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'WXe0000000000eXW',
  'WX0XykkkklkkXy0W',
  'W0XXykkkklkkXXy0',
  'W0xXykkLLlkkxXy0',
  'W0XXykkkklkkXXy0',
  'W0xXykkkklkkxXy0',
  'WX0XykkkkkkkXy0W',
  'WXe0000000000eXW',
  'WXeeddeeeeddeeXW',
  'WXeeeeeeeeeeeeXW',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_ROOF_M_BOT = [
  '7766554433221100',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'eeeeeeeeeeeeeeee',
  'eeeeeeeeddeeeeee',
  'eeeeeeeeeeeeeeee',
  'XXXXXXXXXXXXXXXX',
  'WWWWWWWWWWWWWWWW',
  'eeeeeeeeeeeeeeee',
  'eeeeeeeeddeeeeee',
  'eeeeeeeeeeeeeeee',
  'eeddeeeeeeeeddee',
  'eeeeeeeeeeeeeeee',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_GABLE_WIN = [
  'WXeeeeeeeeeeeeXW',
  'WXe0000000000eXW',
  'WX0tTkllkklkTt0W',
  'W0ttTkllkklkTtt0',
  'W0tTkLLlklLLkTt0',
  'W0tTkllkklklkTt0',
  'W0tt00000000tt0W',
  'W0tTkllkklklkTt0',
  'W0tTkllkklklkTt0',
  'W0ttTkllkklkTtt0',
  'WX0tTkkkkkkkTt0W',
  'WXe0000000000eXW',
  'WX0vvvvatttavv0W',
  'WX0000000000000W',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_ROOF_R_BOT = [
  '0011223344556677',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'XXXXXXXXXXXXXXXX',
  'WWWWWWWWWWWWWWWW',
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeddeeeeeeeeeddW',
  'eeeeeeeeeeeeeedW',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_WALL_L_TOP = [
  'WXe0000000000eXW',
  'WX0XykkkklkkXy0W',
  'W0XXykkkklkkXXy0',
  'W0xXykkLLlkkxXy0',
  'W0XXykkkklkkXXy0',
  'W0xXykkkklkkxXy0',
  'WX0XykkkkkkkXy0W',
  'WXe0000000000eXW',
  'WX0vvvvatttavv0W',
  'WX0000000000000W',
  'WXeedeedeeedeeXW',
  'WXeeeeeeeeeeeeXW',
  'WXeedeedeeedeeXW',
  'WXeeeeeeeeeeeeXW',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_PORCH_CANOPY = [
  'eeeeeeeeeeeeeeee',
  'eeeeeeeeddeeeeee',
  'WWWW00000000WWWW',
  'WW000wjjjjw000WW',
  'W00w0wJJJJw0w00W',
  'W00w0wjjjjw0w00W',
  'W00000000000000W',
  'W0Xw00000000wX0W',
  'W0Xw0WWWWWW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WWWWWW0wX0W',
  'W0Xw0WxxjWW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_WALL_GABLE_TOP = [
  'WXeeeeeeeeeeeeXW',
  'WXe0000000000eXW',
  'WX0XykkkklkkXy0W',
  'W0XXykkkklkkXXy0',
  'W0xXykkLLlkkxXy0',
  'W0xXykkkklkkxXy0',
  'WX0XykkkkkkkXy0W',
  'WXe0000000000eXW',
  'WX0vvvvatttavv0W',
  'WX0000000000000W',
  'WXeedeedeeedeeXW',
  'WXeeeeeeeeeeeeXW',
  'WXeedeedeeedeeXW',
  'WXeeeeeeeeeeeeXW',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_WALL_R_TOP = [
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeddeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeddeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'WWWWWWWWWWWWWWWW',
  'XXXXXXXXXXXXXXXX',
];

export const MAP_FRIEND_EXT_WALL_WIN_L = [
  'WXe0000000000eXW',
  'WX0XykkkklkkXy0W',
  'W0XXykkkklkkXXy0',
  'W0xXykkLLlkkxXy0',
  'W0XXykkkklkkXXy0',
  'W0xXykkkklkkxXy0',
  'WX0XykkkkkkkXy0W',
  'WXe0000000000eXW',
  'WX0vvvvatttavv0W',
  'WX0000000000000W',
  'WXeedeedeeedeeXW',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
];

export const MAP_FRIEND_EXT_DOOR_PORCH = [
  'W0Xw00000000wX0W',
  'W0Xw0WWWWWW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WWWWWW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WxxjWW0wX0W',
  'W0Xw0WWWWWW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WxxxxW0wX0W',
  'W0Xw0WWWWWW0wX0W',
  '00000WWWWWW00000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
];

export const MAP_FRIEND_EXT_WALL_GABLE_B = [
  'WXeeeeeeeeeeeeXW',
  'WXe0000000000eXW',
  'WX0XykkkklkkXy0W',
  'W0XXykkkklkkXXy0',
  'W0xXykkLLlkkxXy0',
  'W0xXykkkklkkxXy0',
  'WX0XykkkkkkkXy0W',
  'WXe0000000000eXW',
  'WX0vvvvatttavv0W',
  'WX0000000000000W',
  'WXeedeedeeedeeXW',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
];

export const MAP_FRIEND_EXT_WALL_R_BASE = [
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeddeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'eeeeeeeeddeeeedW',
  'deeeeeeeeeeeeedW',
  'eeeeeeeeeeeeeedW',
  'deeeeeeeeeeeeedW',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
];

export const MAP_FRIEND_EXT_BUSH_ROSE = [
  '.....000000.....',
  '...00vVVVvv00...',
  '..0vVaaaaVVv00..',
  '.0vVaaVVVaaVv00.',
  '00VaaVvvvVaaVv00',
  '0vVvVPpppPVvVv00',
  '0vVPpPPpPPPvvv00',
  '00VpPPvVVpPPv00.',
  '0vVPpVVaaVpPv00.',
  '00pPPVaaaaVpP00.',
  '.00pPPVaaVpP00..',
  '..00pPPvvPp00...',
  '...00pPPPPp00...',
  '....000pp000....',
  '......0000......',
  '................',
];

export const MAP_FRIEND_EXT_STONE_PATH = [
  'snnnnnnnsnnnnnns',
  'sMMMMMMMsMMMMMMs',
  'smmmmmmmsmmmmmms',
  'sSSSSSSSsSSSSSSs',
  '0000000000000000',
  'snnnnnnsnnnnnnns',
  'sMMMMMMsMMMMMMMs',
  'smmmmmmsmmmmmmms',
  'sSSSSSSsSSSSSSSs',
  '0000000000000000',
  'snnnnnnnsnnnnnns',
  'sMMMMMMMsMMMMMMs',
  'smmmmmmmsmmmmmms',
  'sSSSSSSSsSSSSSSs',
  '0000000000000000',
  'snnnnnnsnnnnnnns',
];

export const MAP_FRIEND_EXT_FENCE_WOOD_H = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '..000000000000..',
  '..wXXXXXXXXXXw..',
  '..wxxxxxxxxxxw..',
  '..wWWWWWWWWWWw..',
  '................',
  '..000000000000..',
  '..wXXXXXXXXXXw..',
  '..wxxxxxxxxxxw..',
  '..wWWWWWWWWWWw..',
  '................',
  '................',
];

export const MAP_FRIEND_EXT_FENCE_WOOD_POST = [
  '................',
  '................',
  '.....000000.....',
  '.....wyyyyw.....',
  '.....wXXXXw.....',
  '..000wXXXXw000..',
  '..wXXwXXXXwXXw..',
  '..wxxwxxxxwxxw..',
  '..wWWwWWWWwWWw..',
  '.....wxxxxw.....',
  '..000wxxxxw000..',
  '..wXXwXXXXwXXw..',
  '..wxxwxxxxwxxw..',
  '..wWWwWWWWwWWw..',
  '.....wWWWWw.....',
  '.....000000.....',
];

export const MAP_FRIEND_EXT_FENCE_LANTERN_POST = [
  '.....000000.....',
  '....0wjjjjw0....',
  '...0wwJJJJww0...',
  '...0wwJJJJww0...',
  '....0wjjjjw0....',
  '.....00ww00.....',
  '.....wyyyyw.....',
  '.....wXXXXw.....',
  '..000wXXXXw.....',
  '..wXXwXXXXw.....',
  '..wxxwxxxxw.....',
  '..wWWwWWWWw.....',
  '..000wxxxxw.....',
  '..wXXwXXXXw.....',
  '..wxxwxxxxw.....',
  '..wWWwWWWWw.....',
];

export const MAP_FRIEND_EXT_FENCE_CORNER_L = [
  '................',
  '................',
  '000000..........',
  'wyyyyw..........',
  'wXXXXw0000000000',
  'wXXXXwwXXXXXXXXw',
  'wxxxxwwxxxxxxxxw',
  'wWWWWwwWWWWWWWWw',
  'wxxxxw..........',
  'wXXXXw0000000000',
  'wXXXXwwXXXXXXXXw',
  'wxxxxwwxxxxxxxxw',
  'wWWWWwwWWWWWWWWw',
  'wWWWWw..........',
  '000000..........',
  '................',
];

export const MAP_FRIEND_EXT_FENCE_CORNER_R = [
  '................',
  '................',
  '..........000000',
  '..........wyyyyw',
  '0000000000wXXXXw',
  'wXXXXXXXXwwXXXXw',
  'wxxxxxxxxwwxxxxw',
  'wWWWWWWWWwwWWWWw',
  '..........wxxxxw',
  '0000000000wXXXXw',
  'wXXXXXXXXwwXXXXw',
  'wxxxxxxxxwwxxxxw',
  'wWWWWWWWWwwWWWWw',
  '..........wWWWWw',
  '..........000000',
  '................',
];


export const FRIEND_SOLID_TILES = new Set([
  FRIEND_TILES.FRIEND_EXT_ROOF_L_TOP,
  FRIEND_TILES.FRIEND_EXT_ROOF_M_TOP,
  FRIEND_TILES.FRIEND_EXT_GABLE_PEAK,
  FRIEND_TILES.FRIEND_EXT_ROOF_R_TOP,
  FRIEND_TILES.FRIEND_EXT_ROOF_L_BOT,
  FRIEND_TILES.FRIEND_EXT_ROOF_M_BOT,
  FRIEND_TILES.FRIEND_EXT_GABLE_WIN,
  FRIEND_TILES.FRIEND_EXT_ROOF_R_BOT,
  FRIEND_TILES.FRIEND_EXT_WALL_L_TOP,
  FRIEND_TILES.FRIEND_EXT_PORCH_CANOPY,
  FRIEND_TILES.FRIEND_EXT_WALL_GABLE_TOP,
  FRIEND_TILES.FRIEND_EXT_WALL_R_TOP,
  FRIEND_TILES.FRIEND_EXT_WALL_WIN_L,
  FRIEND_TILES.FRIEND_EXT_WALL_GABLE_B,
  FRIEND_TILES.FRIEND_EXT_WALL_R_BASE,
  FRIEND_TILES.FRIEND_EXT_BUSH_ROSE,
  FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_H,
  FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_POST,
  FRIEND_TILES.FRIEND_EXT_FENCE_LANTERN_POST,
  FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_L,
  FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_R,
]);

export const FRIEND_Y_SORT_TILES = new Set([
  FRIEND_TILES.FRIEND_EXT_BUSH_ROSE,
  FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_H,
  FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_POST,
  FRIEND_TILES.FRIEND_EXT_FENCE_LANTERN_POST,
  FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_L,
  FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_R,
]);

export const FRIEND_OVERHEAD_TILES = new Set([
  FRIEND_TILES.FRIEND_EXT_ROOF_L_TOP,
  FRIEND_TILES.FRIEND_EXT_ROOF_M_TOP,
  FRIEND_TILES.FRIEND_EXT_GABLE_PEAK,
  FRIEND_TILES.FRIEND_EXT_ROOF_R_TOP,
  FRIEND_TILES.FRIEND_EXT_ROOF_L_BOT,
  FRIEND_TILES.FRIEND_EXT_ROOF_M_BOT,
  FRIEND_TILES.FRIEND_EXT_GABLE_WIN,
  FRIEND_TILES.FRIEND_EXT_ROOF_R_BOT,
  FRIEND_TILES.FRIEND_EXT_WALL_L_TOP,
  FRIEND_TILES.FRIEND_EXT_PORCH_CANOPY,
  FRIEND_TILES.FRIEND_EXT_WALL_GABLE_TOP,
  FRIEND_TILES.FRIEND_EXT_WALL_R_TOP,
]);

export function registerFriendHouseTiles(tileCache, compilePixelMap, underlays = {}) {
  const grass = underlays.grass || null;

  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_L_TOP, [compilePixelMap(MAP_FRIEND_EXT_ROOF_L_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_M_TOP, [compilePixelMap(MAP_FRIEND_EXT_ROOF_M_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_GABLE_PEAK, [compilePixelMap(MAP_FRIEND_EXT_GABLE_PEAK, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_R_TOP, [compilePixelMap(MAP_FRIEND_EXT_ROOF_R_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_L_BOT, [compilePixelMap(MAP_FRIEND_EXT_ROOF_L_BOT, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_M_BOT, [compilePixelMap(MAP_FRIEND_EXT_ROOF_M_BOT, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_GABLE_WIN, [compilePixelMap(MAP_FRIEND_EXT_GABLE_WIN, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_ROOF_R_BOT, [compilePixelMap(MAP_FRIEND_EXT_ROOF_R_BOT, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_L_TOP, [compilePixelMap(MAP_FRIEND_EXT_WALL_L_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_PORCH_CANOPY, [compilePixelMap(MAP_FRIEND_EXT_PORCH_CANOPY, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_GABLE_TOP, [compilePixelMap(MAP_FRIEND_EXT_WALL_GABLE_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_R_TOP, [compilePixelMap(MAP_FRIEND_EXT_WALL_R_TOP, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_WIN_L, [compilePixelMap(MAP_FRIEND_EXT_WALL_WIN_L, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_DOOR_PORCH, [compilePixelMap(MAP_FRIEND_EXT_DOOR_PORCH, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_GABLE_B, [compilePixelMap(MAP_FRIEND_EXT_WALL_GABLE_B, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_WALL_R_BASE, [compilePixelMap(MAP_FRIEND_EXT_WALL_R_BASE, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_BUSH_ROSE, [compilePixelMap(MAP_FRIEND_EXT_BUSH_ROSE, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_STONE_PATH, [compilePixelMap(MAP_FRIEND_EXT_STONE_PATH, PAL_FRIEND_EXT, {})]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_H, [compilePixelMap(MAP_FRIEND_EXT_FENCE_WOOD_H, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_FENCE_WOOD_POST, [compilePixelMap(MAP_FRIEND_EXT_FENCE_WOOD_POST, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_FENCE_LANTERN_POST, [compilePixelMap(MAP_FRIEND_EXT_FENCE_LANTERN_POST, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_L, [compilePixelMap(MAP_FRIEND_EXT_FENCE_CORNER_L, PAL_FRIEND_EXT, { underlay: grass })]);
  tileCache.set(FRIEND_TILES.FRIEND_EXT_FENCE_CORNER_R, [compilePixelMap(MAP_FRIEND_EXT_FENCE_CORNER_R, PAL_FRIEND_EXT, { underlay: grass })]);
}
