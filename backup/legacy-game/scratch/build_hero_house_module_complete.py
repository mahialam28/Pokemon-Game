import sys

with open('scratch/make_maps.py') as f:
    maps_code = f.read()

# Extract maps_ext and maps_int dictionaries
local_scope = {}
exec(maps_code, local_scope)

maps_ext = local_scope['maps_ext']
maps_int = local_scope['maps_int']
PAL_HERO_EXT = local_scope['PAL_HERO_EXT']
PAL_HERO_INT = local_scope['PAL_HERO_INT']

out = []
out.append("/**")
out.append(" * Hand-authored Gen 1 / FireRed authentic pixel-art assets for Stage 1:")
out.append(" * Main Character House (Exterior, Ground Floor 1F, Second Floor 2F).")
out.append(" * Follows the approved visual concept reference sheet with high fidelity.")
out.append(" */\n")

out.append("export const PAL_HERO_EXT = " + str(PAL_HERO_EXT).replace("None", "null") + ";\n")
out.append("export const PAL_HERO_INT = " + str(PAL_HERO_INT).replace("None", "null") + ";\n")

# Tile ID mapping
tile_ids = {}
curr_id = 260

# Exterior
for k in maps_ext.keys():
    tile_name = k.replace("MAP_", "")
    tile_ids[tile_name] = curr_id
    curr_id += 1

# Interior
for k in maps_int.keys():
    tile_name = k.replace("MAP_", "")
    tile_ids[tile_name] = curr_id
    curr_id += 1

out.append("export const HERO_TILES = {")
for name, tid in tile_ids.items():
    out.append(f"  {name}: {tid},")
out.append("};\n")

# Export map arrays
out.append("// =========================================================================")
out.append("// 1. EXTERIOR PIXEL MAPS")
out.append("// =========================================================================\n")
for k, v in maps_ext.items():
    out.append(f"export const {k} = [")
    for row in v:
        out.append(f"  '{row}',")
    out.append("];\n")

out.append("// =========================================================================")
out.append("// 2. INTERIOR PIXEL MAPS")
out.append("// =========================================================================\n")
for k, v in maps_int.items():
    out.append(f"export const {k} = [")
    for row in v:
        out.append(f"  '{row}',")
    out.append("];\n")

# Solid tiles set
out.append("export const HERO_SOLID_TILES = new Set([")
# Exterior solids
for k in maps_ext.keys():
    name = k.replace("MAP_", "")
    if "STONE_PATH" not in name and "PORCH_DOOR" not in name:
        out.append(f"  HERO_TILES.{name},")
# Interior solids
for k in maps_int.keys():
    name = k.replace("MAP_", "")
    if any(x in name for x in ["WALL", "FRIDGE", "COFFEE", "SINK", "STOVE", "BOOKCASE", "TV", "SOFA", "ARMCHAIR", "TABLE", "CHAIR", "PLANT", "PALM", "NIGHTSTAND", "BED_HEAD", "BED_FOOT", "PC", "WARDROBE"]):
        out.append(f"  HERO_TILES.{name},")
out.append("]);\n")

# Y-sort tiles set
out.append("export const HERO_Y_SORT_TILES = new Set([")
out.append("  HERO_TILES.HERO_EXT_MAILBOX,")
out.append("  HERO_TILES.HERO_EXT_FENCE_POST_L,")
out.append("  HERO_TILES.HERO_EXT_FENCE_POST_R,")
out.append("  HERO_TILES.HERO_EXT_BUSH_PINK,")
out.append("  HERO_TILES.HERO_EXT_BUSH_WHITE,")
out.append("  HERO_TILES.HERO_EXT_TOPIARY,")
out.append("  HERO_TILES.HERO_INT_PLANT_FICUS,")
out.append("  HERO_TILES.HERO_CORNER_PALM,")
out.append("  HERO_TILES.HERO_SOFA_L,")
out.append("  HERO_TILES.HERO_SOFA_M,")
out.append("  HERO_TILES.HERO_SOFA_R,")
out.append("  HERO_TILES.HERO_ARMCHAIR_L,")
out.append("  HERO_TILES.HERO_ARMCHAIR_R,")
out.append("  HERO_TILES.HERO_COFFEE_TABLE,")
out.append("  HERO_TILES.HERO_DINING_TABLE,")
out.append("  HERO_TILES.HERO_DINING_CHAIR_L,")
out.append("  HERO_TILES.HERO_DINING_CHAIR_R,")
out.append("  HERO_TILES.HERO_BED_NIGHTSTAND,")
out.append("  HERO_TILES.HERO_BED_HEAD_L,")
out.append("  HERO_TILES.HERO_BED_HEAD_R,")
out.append("  HERO_TILES.HERO_BED_FOOT_L,")
out.append("  HERO_TILES.HERO_BED_FOOT_R,")
out.append("]);\n")

# Overhead roof tiles set
out.append("export const HERO_OVERHEAD_TILES = new Set([")
out.append("  HERO_TILES.HERO_EXT_ROOF_L_TOP,")
out.append("  HERO_TILES.HERO_EXT_ROOF_DORMER_T,")
out.append("  HERO_TILES.HERO_EXT_GABLE_PEAK_L,")
out.append("  HERO_TILES.HERO_EXT_GABLE_PEAK_R,")
out.append("  HERO_TILES.HERO_EXT_ROOF_CHIMNEY_T,")
out.append("  HERO_TILES.HERO_EXT_ROOF_L_MID,")
out.append("  HERO_TILES.HERO_EXT_DORMER_WIN,")
out.append("  HERO_TILES.HERO_EXT_GABLE_WIN_L,")
out.append("  HERO_TILES.HERO_EXT_GABLE_WIN_R,")
out.append("  HERO_TILES.HERO_EXT_ROOF_CHIMNEY_B,")
out.append("  HERO_TILES.HERO_EXT_WALL_L_TOP,")
out.append("  HERO_TILES.HERO_EXT_PORCH_ROOF,")
out.append("  HERO_TILES.HERO_EXT_WALL_GABLE_BL,")
out.append("  HERO_TILES.HERO_EXT_WALL_GABLE_BR,")
out.append("  HERO_TILES.HERO_EXT_WALL_R_TOP,")
out.append("]);\n")

# Registration function
out.append("""
/**
 * Register all Stage 1 Hero House tiles into tileCache.
 * @param {Map<number, HTMLCanvasElement[]>} tileCache
 * @param {Function} compilePixelMap
 * @param {Object} underlays { grass, woodFloor }
 */
export function registerHeroHouseTiles(tileCache, compilePixelMap, underlays = {}) {
  const grass = underlays.grass || null;
  const oakFloor = compilePixelMap(MAP_HERO_INT_FLOOR, PAL_HERO_INT);
  tileCache.set(HERO_TILES.HERO_INT_FLOOR, [oakFloor]);

  // Exterior tiles (using grass underlay where appropriate)
""")

for k in maps_ext.keys():
    name = k.replace("MAP_", "")
    underlay_param = "{ underlay: grass }" if any(x in name for x in ["ROOF", "WIN", "DOOR", "BASE", "WALL", "FENCE", "BUSH", "TOPIARY", "MAILBOX"]) else ""
    out.append(f"  tileCache.set(HERO_TILES.{name}, [compilePixelMap({k}, PAL_HERO_EXT, {underlay_param or '{}'})]);")

out.append("\n  // Interior tiles (using oakFloor underlay where appropriate)\n")
for k in maps_int.keys():
    if k == "MAP_HERO_INT_FLOOR":
        continue
    name = k.replace("MAP_", "")
    use_underlay = not ("WALL" in name and "CORNER" not in name)
    underlay_param = "{ underlay: oakFloor }" if use_underlay else "{}"
    out.append(f"  tileCache.set(HERO_TILES.{name}, [compilePixelMap({k}, PAL_HERO_INT, {underlay_param})]);")

out.append("}\n")

with open('src/world/heroHouseTiles.js', 'w') as f:
    f.write("\n".join(out))

print("Successfully generated src/world/heroHouseTiles.js!")
