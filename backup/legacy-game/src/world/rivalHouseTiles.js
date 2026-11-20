/**
 * Hand-crafted 16x16 pixel-art metatiles for Rival's House (Panel 2).
 */

export const PAL_RIVAL_EXT = {
  '0': '#121620', // slate outline
  '1': '#1C2434', // deep slate
  '2': '#2A364C', // slate shadow
  '3': '#3E4E6A', // slate mid
  '4': '#566A8A', // slate tone
  '5': '#748AA8', // slate highlight
  '6': '#98B0D0', // slate soft rim
  '7': '#C0D4EC', // slate peak shine
  'b': '#2A140E', // mortar dark
  'B': '#482016', // brick dark
  'c': '#6E2E20', // brick shadow
  'C': '#94422E', // brick body
  'd': '#BA583E', // brick mid
  'D': '#DC7050', // brick light
  'e': '#F09070', // brick face highlight
  'w': '#181412', // wood dark outline
  'W': '#3C261A', // wood shadow
  'x': '#68442E', // timber mid
  'X': '#946444', // timber light
  'y': '#C28E62', // timber warm
  't': '#F6F2EC', // white stone trim
  'T': '#D4CCC0', // stone shadow
  'k': '#101C2A', // window dark glass
  'K': '#1E344C', // window glass mid
  'l': '#3E668C', // window glass light
  'L': '#78A8D4', // window glass reflection
  'p': '#221236', // hydrangea dark purple
  'P': '#422468', // hydrangea mid purple
  'v': '#6C3E9E', // hydrangea lavender
  'V': '#9A68D0', // hydrangea light lilac
  'a': '#CCA0F8', // hydrangea petal shine
  'g': '#0E2410', // hedge dark
  'G': '#1E4C22', // hedge mid
  'h': '#347A38', // hedge bright
  'H': '#58AC5C', // hedge highlight
  's': '#1A1E24', // ashlar stone outline
  'S': '#323842', // ashlar stone dark
  'm': '#4E5866', // ashlar stone mid
  'M': '#707C8C', // ashlar stone light
  'n': '#96A4B4', // ashlar stone cap highlight
  'N': '#C2CEE0', // ashlar stone white sheen
  'r': '#341610', // chimney brick dark
  'R': '#763222', // chimney brick mid
  'f': '#98402E', // chimney brick light
  'j': '#CE9220', // porch brass lantern
  'J': '#FFE060', // porch lamp glow
  '.': null,
};

export const RIVAL_TILES = {
  RIVAL_EXT_ROOF_L_TOP: 360,
  RIVAL_EXT_ROOF_M_TOP: 361,
  RIVAL_EXT_GABLE_PEAK: 362,
  RIVAL_EXT_ROOF_R_TOP: 363,
  RIVAL_EXT_CHIMNEY_TOP: 364,
  RIVAL_EXT_ROOF_L_BOT: 365,
  RIVAL_EXT_ROOF_M_BOT: 366,
  RIVAL_EXT_GABLE_WIN: 367,
  RIVAL_EXT_ROOF_R_BOT: 368,
  RIVAL_EXT_CHIMNEY_BOT: 369,
  RIVAL_EXT_WALL_L_TOP: 370,
  RIVAL_EXT_AWNING_WIN_TOP: 371,
  RIVAL_EXT_PORCH_CANOPY: 372,
  RIVAL_EXT_WALL_R_TOP: 373,
  RIVAL_EXT_WALL_FAR_R: 374,
  RIVAL_EXT_WALL_L_BASE: 375,
  RIVAL_EXT_AWNING_WIN_BOT: 376,
  RIVAL_EXT_PORCH_DOOR: 377,
  RIVAL_EXT_WALL_WIN_R: 378,
  RIVAL_EXT_WALL_R_BASE: 379,
  RIVAL_EXT_BUSH_PURPLE: 380,
  RIVAL_EXT_HEDGE_ROUND: 381,
  RIVAL_EXT_STONE_PATH: 382,
  RIVAL_EXT_WALL_STONE_H: 383,
  RIVAL_EXT_WALL_STONE_POST: 384,
  RIVAL_EXT_WALL_STONE_CORNER_L: 385,
  RIVAL_EXT_WALL_STONE_CORNER_R: 386,
};

export const MAP_RIVAL_EXT_ROOF_L_TOP = [
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

export const MAP_RIVAL_EXT_ROOF_M_TOP = [
  '0000000000000000',
  '6655443344556670',
  '5443322122345560',
  '4322110011223450',
  '0000000000000000',
  '5554443355544433',
  '4433221144332211',
  '3322110033221100',
  '0000000000000000',
  '6655443366554433',
  '5544332255443322',
  '4433221144332211',
  '0000000000000000',
  '6655443366554433',
  '5544332255443322',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_GABLE_PEAK = [
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
  'cCdwtTklllktwCdD',
  'cCdwtTkkkktwdCdD',
  'cCdwwttttttwwCdD',
  'cCdccbbbbbbcdCdD',
  'cCDdcCdDdCdcCDdC',
  'bbbbbbbbbbbbbbbb',
];

export const MAP_RIVAL_EXT_ROOF_R_TOP = [
  '0000000000000000',
  '0766554433445566',
  '0655443322233455',
  '0544332211122344',
  '0000000000000000',
  '3355544433555444',
  '1144332211443322',
  '0033221100332211',
  '0000000000000000',
  '3366554433665544',
  '2255443322554433',
  '1144332211443322',
  '0000000000000000',
  '3366554433665544',
  '2255443322554433',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_CHIMNEY_TOP = [
  '..00000000000...',
  '..0nnnnnnnn0....',
  '..0sMMMMMMs0....',
  '..0sSSSSSSs0....',
  '...00000000.....',
  '...0rRfRfr0.....',
  '...0RfRRfR0.....',
  '...0rRfRfr0.....',
  '0000RfRRfR000...',
  '4430rRfRfr03322.',
  '3320RfRRfR02211.',
  '000000000000000.',
  '554433665544322.',
  '443322554433211.',
  '000000000000000.',
  'WWWWWWWWWWWWWWWW',
];

export const MAP_RIVAL_EXT_ROOF_L_BOT = [
  '0765544332211000',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
];

export const MAP_RIVAL_EXT_ROOF_M_BOT = [
  '7766554433221100',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'cCDd00000000cCDd',
  'cCdC0ttlltt0cCdC',
  'bbbb0tkllkt0bbbb',
  'DdcC0tkllkt0DdcC',
  'CdCc0ttlltt0CdCc',
  'bbbb0tkLLkt0bbbb',
  'cCDd0tkkkkt0cCDd',
  'cCdC0tttttt0cCdC',
  'bbbb00000000bbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
];

export const MAP_RIVAL_EXT_GABLE_WIN = [
  'cCDdcCDdcCDdcCDd',
  'cCdC00000000cCdC',
  'bbb0tttttttt0bbb',
  'Ddc0tTkLLkTt0Ddc',
  'CdC0tTkllkTt0CdC',
  'bbb0tT0000Tt0bbb',
  'cCD0tT0000Tt0cCD',
  'cCd0tTklLktt0cCd',
  'bbb0tTkllktT0bbb',
  'Ddc0tTkkkktT0Ddc',
  'CdC0tttttttt0CdC',
  'bbb0000000000bbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
];

export const MAP_RIVAL_EXT_ROOF_R_BOT = [
  '0011223344556677',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'cCDd00000000cCDd',
  'cCdC0ttlltt0cCdC',
  'bbbb0tkllkt0bbbb',
  'DdcC0tkllkt0DdcC',
  'CdCc0ttlltt0CdCc',
  'bbbb0tkLLkt0bbbb',
  'cCDd0tkkkkt0cCDd',
  'cCdC0tttttt0cCdC',
  'bbbb00000000bbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
];

export const MAP_RIVAL_EXT_CHIMNEY_BOT = [
  '...0rRfRfr0.....',
  '...0RfRRfR0.....',
  '...0rRfRfr0.....',
  '0000RfRRfR000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
];

export const MAP_RIVAL_EXT_WALL_L_TOP = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
];

export const MAP_RIVAL_EXT_AWNING_WIN_TOP = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  '0000000000000000',
  '0665544334455660',
  '0554433223344550',
  '0443322112233440',
  '0000000000000000',
  'WWWWWWWWWWWWWWWW',
  '0000000000000000',
  '0ttlltt00ttlltt0',
  '0tkllkt00tkllkt0',
  '0tkllkt00tkllkt0',
  '0tt00tt00tt00tt0',
  '0tkLLkt00tkLLkt0',
  '0tkkkkt00tkkkkt0',
  '0tttttt00tttttt0',
];

export const MAP_RIVAL_EXT_PORCH_CANOPY = [
  'cCDd....00....dC',
  'cCdC...0yy0...dC',
  'bbb...0yXXy0...b',
  'Ddc..0yXXXXy0..C',
  'CdC.0yXXwwXXy0.C',
  'bb.0yXXwttwXXy0b',
  'cC00000wtTTtw000',
  'cCdC.0wjjjjw0.dC',
  'bbb..0wJJJJw0..b',
  'Ddc..0wJJJJw0..C',
  'CdC..0wjjjjw0..C',
  'bbb...000000...b',
  'cCD...0xWWx0..dC',
  'cCdC..0xWWx0..dC',
  'bbbb..0xWWx0..bb',
  'DdcC..0xWWx0..cC',
];

export const MAP_RIVAL_EXT_WALL_R_TOP = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDd00000000cCDd',
  'cCdC0ttlltt0cCdC',
  'bbbb0tkllkt0bbbb',
  'DdcC0tkllkt0DdcC',
  'CdCc0ttlltt0CdCc',
  'bbbb0tkLLkt0bbbb',
  'cCDd0tkkkkt0cCDd',
  'cCdC0tttttt0cCdC',
  'bbbb00000000bbbb',
  'DdcCDdcCDdcCDdcC',
];

export const MAP_RIVAL_EXT_WALL_FAR_R = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  'bbbbbbbbbbbbbbbb',
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
];

export const MAP_RIVAL_EXT_WALL_L_BASE = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_AWNING_WIN_BOT = [
  '0tt00tt00tt00tt0',
  '0tkllkt00tkllkt0',
  '0tkllkt00tkllkt0',
  '0tttttt00tttttt0',
  '0000000000000000',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_PORCH_DOOR = [
  '0xWWx0000000xWWx',
  '0xWWx0WWWW00xWWx',
  '0xWWx0WxxW00xWWx',
  '0xWWx0WxxW00xWWx',
  '0xWWx0WWWW00xWWx',
  '0xWWx0WxxW00xWWx',
  '0xWWx0WxjW00xWWx',
  '0xWWx0WWWW00xWWx',
  '0xWWx0WxxW00xWWx',
  '0xWWx0WxxW00xWWx',
  '0xWWx0WWWW00xWWx',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
];

export const MAP_RIVAL_EXT_WALL_WIN_R = [
  'cCDd00000000cCDd',
  'cCdC0ttlltt0cCdC',
  'bbbb0tkllkt0bbbb',
  'DdcC0tkllkt0DdcC',
  'CdCc0tttttt0CdCc',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_WALL_R_BASE = [
  'cCDdcCDdcCDdcCDd',
  'cCdCcCdCcCdCcCdC',
  'bbbbbbbbbbbbbbbb',
  'DdcCDdcCDdcCDdcC',
  'CdCcCdCcCdCcCdCc',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
  'snnnnnnnnnnnnnns',
  'sMMMMMMMMMMMMMMs',
  'smmmmmmmmmmmmmms',
  'sSSSSSSSSSSSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_BUSH_PURPLE = [
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

export const MAP_RIVAL_EXT_HEDGE_ROUND = [
  '.....000000.....',
  '...00ghhhhG00...',
  '..0ghHHHHhhG00..',
  '.0ghHHHHHHhhG00.',
  '00hHHHHhhhhhhG00',
  '0ghHHHhhhhhhgG00',
  '0ghhhhhhggggGG00',
  '00hhhhgggggGG00.',
  '0ghhhgggggGGG00.',
  '00ghhggggGGGG00.',
  '.00ghgggGGGG00..',
  '..00ggggGGG00...',
  '...00gGGGGg00...',
  '....000gg000....',
  '......0000......',
  '................',
];

export const MAP_RIVAL_EXT_STONE_PATH = [
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

export const MAP_RIVAL_EXT_WALL_STONE_H = [
  '................',
  '................',
  '................',
  '................',
  '0000000000000000',
  'sNNNNNNNNNNNNNNs',
  'snnnnnnnnnnnnnns',
  '0000000000000000',
  'sMMMMMsMMMMMMMMs',
  'smmmmmsmmmmmmmms',
  'sSSSSSsSSSSSSSSs',
  '0000000000000000',
  'sMMMMMMMMMsMMMMs',
  'smmmmmmmmmsmmmms',
  'sSSSSSSSSSsSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_WALL_STONE_POST = [
  '................',
  '................',
  '...0000000000...',
  '...sNNNNNNNNs...',
  '...snnnnnnnns...',
  '...0000000000...',
  '...sMMMMMMMMs...',
  '...smmmmmmmms...',
  '...sSSSSSSSSs...',
  '...0000000000...',
  '...sMMMMMMMMs...',
  '...smmmmmmmms...',
  '...sSSSSSSSSs...',
  '...0000000000...',
  '...sMMMMMMMMs...',
  '...0000000000...',
];

export const MAP_RIVAL_EXT_WALL_STONE_CORNER_L = [
  '................',
  '................',
  '00000000........',
  'sNNNNNNs........',
  'snnnnnns00000000',
  '00000000sNNNNNNs',
  'sMMMMMMssnnnnnns',
  'smmmmmms00000000',
  'sSSSSSSssMMMMMMs',
  '00000000smmmmmms',
  'sMMMMMMssSSSSSSs',
  'smmmmmms00000000',
  'sSSSSSSssMMMMMMs',
  '00000000smmmmmms',
  'sMMMMMMssSSSSSSs',
  '0000000000000000',
];

export const MAP_RIVAL_EXT_WALL_STONE_CORNER_R = [
  '................',
  '................',
  '........00000000',
  '........sNNNNNNs',
  '00000000snnnnnns',
  'sNNNNNNs00000000',
  'snnnnnnssMMMMMMs',
  '00000000smmmmmms',
  'sMMMMMMssSSSSSSs',
  'smmmmmms00000000',
  'sSSSSSSssMMMMMMs',
  '00000000smmmmmms',
  'sMMMMMMssSSSSSSs',
  'smmmmmms00000000',
  'sSSSSSSssMMMMMMs',
  '0000000000000000',
];


export const RIVAL_SOLID_TILES = new Set([
  RIVAL_TILES.RIVAL_EXT_ROOF_L_TOP,
  RIVAL_TILES.RIVAL_EXT_ROOF_M_TOP,
  RIVAL_TILES.RIVAL_EXT_GABLE_PEAK,
  RIVAL_TILES.RIVAL_EXT_ROOF_R_TOP,
  RIVAL_TILES.RIVAL_EXT_CHIMNEY_TOP,
  RIVAL_TILES.RIVAL_EXT_ROOF_L_BOT,
  RIVAL_TILES.RIVAL_EXT_ROOF_M_BOT,
  RIVAL_TILES.RIVAL_EXT_GABLE_WIN,
  RIVAL_TILES.RIVAL_EXT_ROOF_R_BOT,
  RIVAL_TILES.RIVAL_EXT_CHIMNEY_BOT,
  RIVAL_TILES.RIVAL_EXT_WALL_L_TOP,
  RIVAL_TILES.RIVAL_EXT_AWNING_WIN_TOP,
  RIVAL_TILES.RIVAL_EXT_PORCH_CANOPY,
  RIVAL_TILES.RIVAL_EXT_WALL_R_TOP,
  RIVAL_TILES.RIVAL_EXT_WALL_FAR_R,
  RIVAL_TILES.RIVAL_EXT_WALL_L_BASE,
  RIVAL_TILES.RIVAL_EXT_AWNING_WIN_BOT,
  RIVAL_TILES.RIVAL_EXT_WALL_WIN_R,
  RIVAL_TILES.RIVAL_EXT_WALL_R_BASE,
  RIVAL_TILES.RIVAL_EXT_BUSH_PURPLE,
  RIVAL_TILES.RIVAL_EXT_HEDGE_ROUND,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_H,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_POST,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_L,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_R,
]);

export const RIVAL_Y_SORT_TILES = new Set([
  RIVAL_TILES.RIVAL_EXT_BUSH_PURPLE,
  RIVAL_TILES.RIVAL_EXT_HEDGE_ROUND,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_H,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_POST,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_L,
  RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_R,
]);

export const RIVAL_OVERHEAD_TILES = new Set([
  RIVAL_TILES.RIVAL_EXT_ROOF_L_TOP,
  RIVAL_TILES.RIVAL_EXT_ROOF_M_TOP,
  RIVAL_TILES.RIVAL_EXT_GABLE_PEAK,
  RIVAL_TILES.RIVAL_EXT_ROOF_R_TOP,
  RIVAL_TILES.RIVAL_EXT_CHIMNEY_TOP,
  RIVAL_TILES.RIVAL_EXT_ROOF_L_BOT,
  RIVAL_TILES.RIVAL_EXT_ROOF_M_BOT,
  RIVAL_TILES.RIVAL_EXT_GABLE_WIN,
  RIVAL_TILES.RIVAL_EXT_ROOF_R_BOT,
  RIVAL_TILES.RIVAL_EXT_CHIMNEY_BOT,
  RIVAL_TILES.RIVAL_EXT_WALL_L_TOP,
  RIVAL_TILES.RIVAL_EXT_AWNING_WIN_TOP,
  RIVAL_TILES.RIVAL_EXT_PORCH_CANOPY,
  RIVAL_TILES.RIVAL_EXT_WALL_R_TOP,
  RIVAL_TILES.RIVAL_EXT_WALL_FAR_R,
]);

export function registerRivalHouseTiles(tileCache, compilePixelMap, underlays = {}) {
  const grass = underlays.grass || null;

  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_L_TOP, [compilePixelMap(MAP_RIVAL_EXT_ROOF_L_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_M_TOP, [compilePixelMap(MAP_RIVAL_EXT_ROOF_M_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_GABLE_PEAK, [compilePixelMap(MAP_RIVAL_EXT_GABLE_PEAK, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_R_TOP, [compilePixelMap(MAP_RIVAL_EXT_ROOF_R_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_CHIMNEY_TOP, [compilePixelMap(MAP_RIVAL_EXT_CHIMNEY_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_L_BOT, [compilePixelMap(MAP_RIVAL_EXT_ROOF_L_BOT, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_M_BOT, [compilePixelMap(MAP_RIVAL_EXT_ROOF_M_BOT, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_GABLE_WIN, [compilePixelMap(MAP_RIVAL_EXT_GABLE_WIN, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_ROOF_R_BOT, [compilePixelMap(MAP_RIVAL_EXT_ROOF_R_BOT, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_CHIMNEY_BOT, [compilePixelMap(MAP_RIVAL_EXT_CHIMNEY_BOT, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_L_TOP, [compilePixelMap(MAP_RIVAL_EXT_WALL_L_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_AWNING_WIN_TOP, [compilePixelMap(MAP_RIVAL_EXT_AWNING_WIN_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_PORCH_CANOPY, [compilePixelMap(MAP_RIVAL_EXT_PORCH_CANOPY, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_R_TOP, [compilePixelMap(MAP_RIVAL_EXT_WALL_R_TOP, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_FAR_R, [compilePixelMap(MAP_RIVAL_EXT_WALL_FAR_R, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_L_BASE, [compilePixelMap(MAP_RIVAL_EXT_WALL_L_BASE, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_AWNING_WIN_BOT, [compilePixelMap(MAP_RIVAL_EXT_AWNING_WIN_BOT, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_PORCH_DOOR, [compilePixelMap(MAP_RIVAL_EXT_PORCH_DOOR, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_WIN_R, [compilePixelMap(MAP_RIVAL_EXT_WALL_WIN_R, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_R_BASE, [compilePixelMap(MAP_RIVAL_EXT_WALL_R_BASE, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_BUSH_PURPLE, [compilePixelMap(MAP_RIVAL_EXT_BUSH_PURPLE, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_HEDGE_ROUND, [compilePixelMap(MAP_RIVAL_EXT_HEDGE_ROUND, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_STONE_PATH, [compilePixelMap(MAP_RIVAL_EXT_STONE_PATH, PAL_RIVAL_EXT, {})]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_STONE_H, [compilePixelMap(MAP_RIVAL_EXT_WALL_STONE_H, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_STONE_POST, [compilePixelMap(MAP_RIVAL_EXT_WALL_STONE_POST, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_L, [compilePixelMap(MAP_RIVAL_EXT_WALL_STONE_CORNER_L, PAL_RIVAL_EXT, { underlay: grass })]);
  tileCache.set(RIVAL_TILES.RIVAL_EXT_WALL_STONE_CORNER_R, [compilePixelMap(MAP_RIVAL_EXT_WALL_STONE_CORNER_R, PAL_RIVAL_EXT, { underlay: grass })]);
}
