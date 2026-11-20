import fs from 'fs';
import { validatePixelMap } from './validator.mjs';

// PALETTES
const PAL_HERO_EXT = {
  // Outline & deep shadows
  '0': '#1A0C08', // Dark umber outline / mortar dark
  '1': '#3A1410', // Deep roof crease / brick shadow
  '2': '#681E16', // Roof dark shadow
  '3': '#A83222', // Terracotta midtone
  '4': '#DC4A32', // Terracotta base red-orange
  '5': '#F27254', // Sunlit tile highlight
  '6': '#FFA288', // Shingle ridge bright glint
  // Tudor dark oak timbering & door
  'd': '#1E120A', // Dark timber outline
  'D': '#3E2416', // Timber deep wood
  'b': '#683E26', // Timber medium oak
  'B': '#9C623E', // Timber wood highlight
  'y': '#D8A820', // Brass handle / lantern warm center
  'Y': '#FFE068', // Lantern golden glow highlight
  // Cream stucco wall & trims
  'w': '#2A2622', // Wall seam / dark trim
  'W': '#FFFDF8', // Crisp white trim / window sash
  'e': '#F8F2E6', // Cream stucco base
  'E': '#E4DAC8', // Stucco shadow / soft shading
  // Stone masonry (chimney, quoins, foundation plinth, steps)
  's': '#1C1E22', // Dark slate outline
  'S': '#363C46', // Dark stone shadow
  'm': '#5E6674', // Mid stone grey
  'M': '#8E98A8', // Light stone face
  'l': '#D4DCE8', // Sunlit stone highlight
  // Window glass & sky glare
  'c': '#16283C', // Deep window frame / sill
  'C': '#2E5478', // Blue glass shadow
  'k': '#5088B8', // Sky blue glass
  'K': '#8CC8F0', // Window glare diagonal gleam
  // Window flowers & garden shrubs
  'g': '#143818', // Deep foliage green
  'G': '#2C682C', // Mid foliage green
  'h': '#50A844', // Bright sunlit leaf
  'H': '#84D870', // Pale leaf highlight
  'p': '#9E1840', // Deep rose pink flower
  'P': '#E03C6C', // Vibrant pink hydrangea
  'f': '#FF78A0', // Soft pastel pink blossom
  'o': '#FFFFFF', // Pure white flower petal
  'j': '#F0B820', // Golden flower center
  // Red mailbox
  'r': '#600C0C', // Mailbox dark shadow
  'R': '#CC2020', // Mailbox rich red
  'a': '#F05050', // Mailbox red highlight
  // White picket fence
  't': '#484440', // Picket fence shadow / nail
  'T': '#D8D4D0', // Picket fence shaded wood
  // Cobblestone path
  'z': '#444040', // Path joint mortar
  'Z': '#747070', // Flagstone grey
  'x': '#A4A0A0', // Flagstone light face
  'X': '#D4D0D0', // Flagstone edge highlight
};

const PAL_HERO_INT = {
  // Outline & deep shadows
  '0': '#1C120C', // Dark wood outline
  // Golden oak floor & molding
  '1': '#54280E', // Floor dark joint / shadow
  '2': '#7E421A', // Floor medium shadow
  '3': '#A8602A', // Floor warm wood
  '4': '#D28240', // Golden oak base
  '5': '#ECA462', // Golden oak highlight
  '6': '#FAD094', // Oak bright grain glint
  // Wallpaper & ceiling trim
  'w': '#2C221A', // Trim border
  'W': '#FFFDF8', // Crisp white trim
  'e': '#FBF6EE', // Cream wallpaper base
  'E': '#ECE2D2', // Wallpaper stripe / shadow
  'f': '#D8CABE', // Wallpaper deep shaded corner
  // Furniture oak wood
  'd': '#180E08', // Dark furniture outline
  'D': '#3A2012', // Dark oak shadow
  'b': '#663A20', // Medium oak base
  'B': '#925832', // Oak highlight
  'q': '#BD7E4C', // Polished furniture ridge
  // Refrigerator & kitchen metal
  'm': '#1E2430', // Appliance dark outline
  'M': '#3E4858', // Metal shadow
  'i': '#748296', // Brushed stainless steel
  'I': '#B0C0D4', // Enameled light steel
  'l': '#E6EEF8', // Refrigerator crisp white
  'L': '#FFFFFF', // High metal sheen
  // Red sofa, chairs & checkered tablecloth
  'r': '#480E10', // Deep crimson crease
  'R': '#801818', // Sofa shadow
  'k': '#BA2626', // Rich red midtone
  'K': '#E44440', // Red cushion base
  'a': '#F86C64', // Red sunlit cushion highlight
  'A': '#FFA098', // Crimson button / rim glint
  // Blue bed & royal blue rug
  'u': '#0C162E', // Deep navy outline
  'U': '#162854', // Navy shadow
  'c': '#244488', // Royal blue midtone
  'C': '#3C6CC0', // Royal blue base
  'n': '#649CE8', // Pattern light blue
  'N': '#A8CEF8', // Rug border highlight / bedsheet pale blue
  // Green dining rug & indoor plants
  'g': '#0E2412', // Foliage deep shadow
  'G': '#1C4824', // Dark green rug border
  'h': '#307438', // Mid leaf green
  'H': '#4EA658', // Sage green rug base / leaf
  'v': '#78CC82', // Leaf highlight
  'V': '#A8E8B0', // Light green pattern dot
  // Brass lamps, gold accents & tea
  'y': '#64440C', // Brass shadow
  'Y': '#B07E18', // Warm brass mid
  'z': '#E8AC24', // Golden brass glow
  'Z': '#FFDA60', // Bright lamp light center
  // PC & TV screens
  's': '#081420', // Screen dark / bezel
  'S': '#142C44', // Screen deep glow
  't': '#20608C', // Desktop OS blue
  'T': '#3CAAE8', // Glowing cyan screen text
  'x': '#8EE4FF', // Screen bright highlight / cursor
  // Terracotta pots & paintings
  'p': '#502012', // Terracotta shadow
  'P': '#983E22', // Terracotta base
  'o': '#D46842', // Terracotta highlight
};

console.log('Building Hero House tile data...');

