import zlib
import struct
import math

def write_png(filename, width, height, rgba_data):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data))
    
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type 0
        raw.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])
    
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)

def hex_to_rgba(hex_str, alpha=255):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return (r, g, b, alpha)

class Canvas:
    def __init__(self, w, h, bg=(0,0,0,0)):
        self.w = w
        self.h = h
        self.data = bytearray(w * h * 4)
        if bg[3] > 0:
            for i in range(w * h):
                self.data[i*4 : (i+1)*4] = bytes(bg)
                
    def set_pixel(self, x, y, rgba):
        if 0 <= x < self.w and 0 <= y < self.h:
            idx = (y * self.w + x) * 4
            self.data[idx : idx+4] = bytes(rgba)
            
    def fill_rect(self, x, y, w, h, rgba):
        for cy in range(y, y + h):
            for cx in range(x, x + w):
                self.set_pixel(cx, cy, rgba)
                
    def save(self, filename):
        write_png(filename, self.w, self.h, self.data)

print("Starting asset generation...")

# =============================================================================
# 1. TERRAIN (128x32: Grass A, Grass B, Path, Flowers)
# =============================================================================
terrain = Canvas(128, 32)

# Colors
C_GRASS_BASE = hex_to_rgba('#4CAE54')
C_GRASS_DARK = hex_to_rgba('#389440')
C_GRASS_SHAD = hex_to_rgba('#287830')
C_GRASS_LITE = hex_to_rgba('#64C66C')
C_GRASS_HIGH = hex_to_rgba('#84DC8C')

# Tile 0: Grass A (0..31)
terrain.fill_rect(0, 0, 32, 32, C_GRASS_BASE)
for y in range(0, 32, 4):
    for x in range(0, 32, 4):
        if (x * 7 + y * 13) % 9 == 0:
            terrain.set_pixel(x + 1, y + 1, C_GRASS_LITE)
            terrain.set_pixel(x + 1, y + 2, C_GRASS_HIGH)
            terrain.set_pixel(x + 2, y + 2, C_GRASS_DARK)
        elif (x * 11 + y * 5) % 8 == 0:
            terrain.set_pixel(x + 2, y + 1, C_GRASS_DARK)
            terrain.set_pixel(x + 2, y + 2, C_GRASS_SHAD)

# Tile 1: Grass B (32..63)
terrain.fill_rect(32, 0, 32, 32, C_GRASS_BASE)
for y in range(0, 32, 4):
    for x in range(32, 64, 4):
        if (x * 9 + y * 7) % 7 == 0:
            terrain.set_pixel(x + 1, y + 1, C_GRASS_LITE)
            terrain.set_pixel(x + 2, y + 1, C_GRASS_HIGH)
            terrain.set_pixel(x + 1, y + 2, C_GRASS_DARK)
        elif (x * 5 + y * 11) % 6 == 0:
            terrain.set_pixel(x + 2, y + 2, C_GRASS_SHAD)

# Tile 2: Cobblestone Path (64..95)
C_PATH_BASE = hex_to_rgba('#D6C29E')
C_PATH_DARK = hex_to_rgba('#9C8260')
C_PATH_LITE = hex_to_rgba('#EDE0C4')
C_PATH_OUTL = hex_to_rgba('#6E5438')

terrain.fill_rect(64, 0, 32, 32, C_PATH_BASE)
# Paver stones pattern
stones = [
    (66, 2, 12, 6), (80, 2, 13, 6),
    (65, 10, 14, 6), (81, 10, 12, 6),
    (67, 18, 11, 6), (80, 18, 13, 6),
    (65, 25, 13, 5), (80, 25, 14, 5)
]
for sx, sy, sw, sh in stones:
    terrain.fill_rect(sx, sy, sw, sh, C_PATH_DARK)
    terrain.fill_rect(sx+1, sy+1, sw-2, sh-2, C_PATH_BASE)
    terrain.fill_rect(sx+1, sy+1, sw-3, 1, C_PATH_LITE)
    terrain.fill_rect(sx+1, sy+2, 1, sh-3, C_PATH_LITE)
    terrain.fill_rect(sx+sw-2, sy+1, 1, sh-2, C_PATH_OUTL)
    terrain.fill_rect(sx+1, sy+sh-2, sw-2, 1, C_PATH_OUTL)

# Tile 3: Wildflowers on Grass (96..127)
terrain.fill_rect(96, 0, 32, 32, C_GRASS_BASE)
# Small flowers
flowers = [
    (100, 6, '#F84444', '#FFE460'),
    (118, 8, '#4488F8', '#FFFFFF'),
    (106, 16, '#F8E044', '#F88020'),
    (120, 22, '#F84488', '#FFFFFF'),
    (102, 24, '#FFFFFF', '#F8E044')
]
for fx, fy, petal_hex, center_hex in flowers:
    p_col = hex_to_rgba(petal_hex)
    c_col = hex_to_rgba(center_hex)
    terrain.set_pixel(fx, fy-1, p_col)
    terrain.set_pixel(fx-1, fy, p_col)
    terrain.set_pixel(fx, fy, c_col)
    terrain.set_pixel(fx+1, fy, p_col)
    terrain.set_pixel(fx, fy+1, p_col)

terrain.save('assets/tilesets/terrain/terrain.png')
print("Saved assets/tilesets/terrain/terrain.png")

# =============================================================================
# 2. NATURE (128x64: Tree 64x64, Hydrangea 32x32, Rose 32x32, Picket Fence, Hedge)
# =============================================================================
nature = Canvas(128, 64)

# Tree 64x64 at (0, 0)
C_LEAF_DARK = hex_to_rgba('#1A4422')
C_LEAF_MID  = hex_to_rgba('#2E6E36')
C_LEAF_LITE = hex_to_rgba('#4E9E56')
C_LEAF_HIGH = hex_to_rgba('#74D07E')
C_TRUNK_DARK = hex_to_rgba('#382014')
C_TRUNK_MID  = hex_to_rgba('#603822')
C_TRUNK_LITE = hex_to_rgba('#8C5A38')

# Canopy circles
for cy in range(6, 42):
    for cx in range(6, 58):
        dist_c = math.sqrt((cx - 32)**2 + (cy - 24)**2)
        dist_l = math.sqrt((cx - 20)**2 + (cy - 22)**2)
        dist_r = math.sqrt((cx - 44)**2 + (cy - 22)**2)
        dist_t = math.sqrt((cx - 32)**2 + (cy - 14)**2)
        m_dist = min(dist_c, dist_l, dist_r, dist_t)
        if m_dist <= 16:
            col = C_LEAF_MID
            if cy < 20 and cx < 36:
                col = C_LEAF_LITE
            if cy < 16 and cx < 32 and m_dist < 10:
                col = C_LEAF_HIGH
            if cy > 32 or (cx > 42 and cy > 24):
                col = C_LEAF_DARK
            nature.set_pixel(cx, cy, col)

# Tree trunk (32x22 at bottom)
nature.fill_rect(27, 36, 10, 24, C_TRUNK_MID)
nature.fill_rect(26, 42, 2, 18, C_TRUNK_DARK)
nature.fill_rect(36, 42, 2, 18, C_TRUNK_DARK)
nature.fill_rect(28, 38, 2, 20, C_TRUNK_LITE)
nature.fill_rect(24, 54, 4, 6, C_TRUNK_DARK) # Root L
nature.fill_rect(36, 54, 5, 6, C_TRUNK_DARK) # Root R

# Pink Hydrangea Bush (64..95, 0..31)
C_ROSE_DARK = hex_to_rgba('#2A1220')
C_ROSE_LEAF = hex_to_rgba('#2A6832')
C_ROSE_LITE = hex_to_rgba('#489E54')
C_ROSE_PINK = hex_to_rgba('#E04884')
C_ROSE_LPK  = hex_to_rgba('#FFA0C8')

for cy in range(6, 28):
    for cx in range(68, 92):
        if math.sqrt((cx - 80)**2 + (cy - 18)**2) <= 11:
            nature.set_pixel(cx, cy, C_ROSE_LEAF if cy > 16 else C_ROSE_LITE)

# Blossom clusters
clusters = [(74, 14), (84, 13), (78, 19), (86, 21), (72, 21)]
for bx, by in clusters:
    nature.fill_rect(bx-2, by-2, 5, 5, C_ROSE_PINK)
    nature.set_pixel(bx, by, C_ROSE_LPK)
    nature.set_pixel(bx-1, by, hex_to_rgba('#FFFFFF'))

# White Picket Fence with Stone Post (64..95, 32..63)
C_FENCE_WOOD = hex_to_rgba('#FFFFFF')
C_FENCE_SHAD = hex_to_rgba('#CCD4DC')
C_STONE_POST = hex_to_rgba('#8492A0')
C_STONE_SHAD = hex_to_rgba('#485260')
C_STONE_LITE = hex_to_rgba('#C0CCE0')

# Stone Post on left (64..72, 34..62)
nature.fill_rect(64, 36, 9, 26, C_STONE_POST)
nature.fill_rect(64, 36, 9, 2, C_STONE_LITE)
nature.fill_rect(64, 36, 2, 26, C_STONE_LITE)
nature.fill_rect(71, 36, 2, 26, C_STONE_SHAD)

# Pickets (75, 81, 87, 93)
for px in [75, 81, 87, 93]:
    nature.fill_rect(px, 40, 4, 22, C_FENCE_WOOD)
    nature.set_pixel(px+1, 38, C_FENCE_WOOD)
    nature.set_pixel(px+2, 38, C_FENCE_WOOD)
    nature.set_pixel(px, 39, C_FENCE_WOOD)
    nature.set_pixel(px+3, 39, C_FENCE_WOOD)
    nature.fill_rect(px+3, 40, 1, 22, C_FENCE_SHAD)
# Rails
nature.fill_rect(73, 44, 23, 3, C_FENCE_WOOD)
nature.fill_rect(73, 47, 23, 1, C_FENCE_SHAD)
nature.fill_rect(73, 54, 23, 3, C_FENCE_WOOD)
nature.fill_rect(73, 57, 23, 1, C_FENCE_SHAD)

# Round Clipped Topiary Hedge (96..127, 0..31)
C_HEDGE_DARK = hex_to_rgba('#1C4624')
C_HEDGE_MID  = hex_to_rgba('#327C3E')
C_HEDGE_LITE = hex_to_rgba('#56B464')
C_HEDGE_HIGH = hex_to_rgba('#88DC96')

for cy in range(4, 30):
    for cx in range(100, 124):
        dist = math.sqrt((cx - 112)**2 + (cy - 18)**2)
        if dist <= 12:
            col = C_HEDGE_MID
            if cx < 112 and cy < 18:
                col = C_HEDGE_LITE
            if dist < 6 and cx < 110 and cy < 16:
                col = C_HEDGE_HIGH
            if cy > 22 or cx > 118:
                col = C_HEDGE_DARK
            nature.set_pixel(cx, cy, col)

# Red Mailbox on Post (96..127, 32..63)
nature.fill_rect(110, 46, 4, 16, hex_to_rgba('#5A3C26')) # Post
nature.fill_rect(106, 38, 12, 9, hex_to_rgba('#DC3434')) # Box
nature.fill_rect(106, 38, 12, 2, hex_to_rgba('#F46868'))
nature.fill_rect(106, 45, 12, 2, hex_to_rgba('#9E1C1C'))
nature.fill_rect(117, 36, 3, 5, hex_to_rgba('#F8E044'))  # Yellow flag

nature.save('assets/tilesets/nature/nature.png')
print("Saved assets/tilesets/nature/nature.png")

# =============================================================================
# 3. HERO HOUSE (128x128: 4x4 32x32 tiles matching Panel 1)
# =============================================================================
house = Canvas(128, 128)

C_ROOF_OUTL = hex_to_rgba('#1C0E0A')
C_ROOF_DARK = hex_to_rgba('#682016')
C_ROOF_MID  = hex_to_rgba('#BA3E2C')
C_ROOF_LITE = hex_to_rgba('#E6583E')
C_ROOF_HIGH = hex_to_rgba('#FFA088')

C_WALL_CREAM = hex_to_rgba('#FAF6EE')
C_WALL_SHAD  = hex_to_rgba('#E0D4C0')
C_WALL_TIMB  = hex_to_rgba('#6A422A')
C_WALL_TIMB_D= hex_to_rgba('#3E2214')

C_STONE_WALL = hex_to_rgba('#687280')
C_STONE_LITE = hex_to_rgba('#9EACB8')
C_STONE_DARK = hex_to_rgba('#3E4650')

C_WIN_FRAME  = hex_to_rgba('#FFFFFF')
C_WIN_GLASS  = hex_to_rgba('#386494')
C_WIN_REFL   = hex_to_rgba('#8AC0F0')

C_DOOR_WOOD  = hex_to_rgba('#5A3622')
C_DOOR_LITE  = hex_to_rgba('#845438')
C_DOOR_DARK  = hex_to_rgba('#341E12')
C_LANTERN_GLOW=hex_to_rgba('#FFE464')

# Row 0: Roof Tops (y: 0..31)
# Left roof slope
for y in range(8, 32):
    for x in range(4, 32):
        if y >= (24 - x * 0.6):
            col = C_ROOF_MID if y % 4 != 0 else C_ROOF_DARK
            house.set_pixel(x, y, col)
# Left roof ridge
for x in range(20, 32):
    house.fill_rect(x, 10, 1, 3, C_ROOF_HIGH)

# Dormer roof (32..63, Row 0)
for y in range(4, 32):
    for x in range(32, 64):
        col = C_ROOF_MID if y % 4 != 0 else C_ROOF_DARK
        house.set_pixel(x, y, col)
# Small dormer peak
for y in range(16, 32):
    for x in range(40, 56):
        if y >= (32 - abs(x - 48) * 1.5):
            house.set_pixel(x, y, C_ROOF_HIGH if y < 22 else C_ROOF_MID)

# Peaked Gable Ridge (64..95, Row 0)
for y in range(0, 32):
    for x in range(64, 96):
        dist_from_peak = abs(x - 80)
        if y >= dist_from_peak * 1.2:
            col = C_ROOF_MID
            if y < dist_from_peak * 1.2 + 3:
                col = C_ROOF_HIGH
            elif y % 4 == 0:
                col = C_ROOF_DARK
            house.set_pixel(x, y, col)

# Right roof + Stone Chimney (96..127, Row 0)
for y in range(8, 32):
    for x in range(96, 124):
        if y >= (x - 96) * 0.6 + 6:
            col = C_ROOF_MID if y % 4 != 0 else C_ROOF_DARK
            house.set_pixel(x, y, col)
# Chimney (110..122, 2..28)
house.fill_rect(110, 4, 13, 26, C_STONE_WALL)
house.fill_rect(108, 2, 17, 4, C_STONE_DARK)   # Cap top
house.fill_rect(110, 2, 13, 2, C_STONE_LITE)   # Cap highlight
house.fill_rect(110, 6, 2, 24, C_STONE_LITE)   # L highlight
house.fill_rect(121, 6, 2, 24, C_STONE_DARK)   # R shadow

# Row 1: Upper Floor & Dormer/Gable Windows (y: 32..63)
# Eaves across roof
house.fill_rect(4, 32, 120, 6, C_ROOF_DARK)
house.fill_rect(4, 36, 120, 3, C_WALL_TIMB_D)

# Wall background behind gable
house.fill_rect(6, 38, 116, 26, C_WALL_CREAM)
# Horizontal & vertical timber framing
house.fill_rect(6, 38, 4, 26, C_WALL_TIMB)
house.fill_rect(118, 38, 4, 26, C_WALL_TIMB)
house.fill_rect(60, 38, 4, 26, C_WALL_TIMB)
house.fill_rect(6, 60, 116, 4, C_WALL_TIMB)

# Dormer window (40..56, 34..52)
house.fill_rect(42, 34, 12, 15, C_WIN_FRAME)
house.fill_rect(44, 36, 8, 11, C_WIN_GLASS)
house.fill_rect(45, 37, 3, 4, C_WIN_REFL)
# Flowerbox
house.fill_rect(40, 49, 16, 5, C_WALL_TIMB_D)
house.fill_rect(41, 47, 14, 3, hex_to_rgba('#E04880')) # Pink flowers

# Peaked Gable Window (70..90, 36..56)
house.fill_rect(71, 36, 18, 18, C_WIN_FRAME)
house.fill_rect(73, 38, 6, 14, C_WIN_GLASS)
house.fill_rect(81, 38, 6, 14, C_WIN_GLASS)
house.fill_rect(74, 39, 2, 5, C_WIN_REFL)
house.fill_rect(82, 39, 2, 5, C_WIN_REFL)
# Gable Flowerbox
house.fill_rect(69, 54, 22, 6, C_WALL_TIMB_D)
house.fill_rect(70, 52, 20, 3, hex_to_rgba('#FFA0C8')) # Flower blooms

# Row 2: 1F Ground Floor Walls, Windows & Porch Canopy (y: 64..95)
house.fill_rect(6, 64, 116, 32, C_WALL_CREAM)
# Corner timbers
house.fill_rect(6, 64, 4, 32, C_WALL_TIMB)
house.fill_rect(118, 64, 4, 32, C_WALL_TIMB)

# Left ground window with flowerbox (14..30, 68..88)
house.fill_rect(15, 68, 14, 15, C_WIN_FRAME)
house.fill_rect(17, 70, 10, 11, C_WIN_GLASS)
house.fill_rect(18, 71, 4, 4, C_WIN_REFL)
house.fill_rect(13, 83, 18, 6, C_WALL_TIMB_D)
house.fill_rect(14, 81, 16, 3, hex_to_rgba('#FF5488'))

# Center Porch Canopy (42..54, 64..78)
for py in range(64, 76):
    pw = 22 - (76 - py) * 0.8
    px = int(48 - pw / 2)
    house.fill_rect(px, py, int(pw), 1, C_STONE_WALL)
house.fill_rect(42, 74, 12, 3, C_STONE_DARK)
# Warm lantern (46..50, 77..84)
house.fill_rect(46, 76, 5, 8, C_DOOR_DARK)
house.fill_rect(47, 77, 3, 5, C_LANTERN_GLOW)
house.set_pixel(48, 79, hex_to_rgba('#FFFFFF'))

# Right ground window with flowerbox (98..114, 68..88)
house.fill_rect(99, 68, 14, 15, C_WIN_FRAME)
house.fill_rect(101, 70, 10, 11, C_WIN_GLASS)
house.fill_rect(102, 71, 4, 4, C_WIN_REFL)
house.fill_rect(97, 83, 18, 6, C_WALL_TIMB_D)
house.fill_rect(98, 81, 16, 3, hex_to_rgba('#FFA0C8'))

# Row 3: Entrance Door & Ashlar Stone Foundation Plinth (y: 96..127)
# Plinth across base
house.fill_rect(6, 110, 116, 18, C_STONE_WALL)
for fy in [110, 119, 127]:
    house.fill_rect(6, fy, 116, 1, C_STONE_DARK)
for fx in [20, 36, 68, 84, 100]:
    house.fill_rect(fx, 110, 1, 9, C_STONE_DARK)
for fx in [12, 28, 76, 92, 108]:
    house.fill_rect(fx, 119, 1, 8, C_STONE_DARK)

# Arched Stone Entrance & Oak Door (38..58, 86..127)
# Stone pillars
house.fill_rect(38, 86, 4, 41, C_STONE_DARK)
house.fill_rect(39, 86, 2, 41, C_STONE_LITE)
house.fill_rect(56, 86, 4, 41, C_STONE_DARK)
house.fill_rect(57, 86, 2, 41, C_STONE_LITE)

# Oak Door (42..56, 88..125)
house.fill_rect(42, 88, 14, 37, C_DOOR_WOOD)
house.fill_rect(43, 90, 5, 14, C_DOOR_LITE) # Upper panel L
house.fill_rect(49, 90, 5, 14, C_DOOR_LITE) # Upper panel R
house.fill_rect(43, 108, 5, 14, C_DOOR_DARK) # Lower panel L
house.fill_rect(49, 108, 5, 14, C_DOOR_DARK) # Lower panel R
house.set_pixel(52, 106, hex_to_rgba('#FFE464')) # Brass knob
# Stone doorstep
house.fill_rect(40, 125, 18, 3, C_STONE_LITE)

house.save('assets/tilesets/buildings/hero_house.png')
print("Saved assets/tilesets/buildings/hero_house.png")

# =============================================================================
# 4. PLAYER CHARACTER SPRITESHEET (96x192: 3 cols x 4 rows, 32x48 per frame)
# =============================================================================
player = Canvas(96, 192)

C_SKIN = hex_to_rgba('#FCD8B8')
C_SKIN_SHAD = hex_to_rgba('#D8A888')
C_CAP_RED = hex_to_rgba('#E03838')
C_CAP_DARK = hex_to_rgba('#9C2020')
C_CAP_WHITE = hex_to_rgba('#FFFFFF')
C_HAIR_BLK = hex_to_rgba('#22242E')
C_JACKET_BLU = hex_to_rgba('#2E4A78')
C_JACKET_RED = hex_to_rgba('#D83838')
C_PANTS_NAVY = hex_to_rgba('#242E44')
C_PANTS_LITE = hex_to_rgba('#384A6C')
C_SHOE_RED = hex_to_rgba('#E03838')
C_SHOE_WHT = hex_to_rgba('#FFFFFF')

def draw_player_frame(sheet, fx, fy, direction, frame_idx):
    ox = fx * 32
    oy = fy * 48
    leg_offset = 0
    if frame_idx == 0:
        leg_offset = -2
    elif frame_idx == 2:
        leg_offset = 2

    if direction == 'down':
        # Head & Cap
        sheet.fill_rect(ox+10, oy+8, 12, 10, C_HAIR_BLK)
        sheet.fill_rect(ox+10, oy+6, 12, 6, C_CAP_RED)
        sheet.fill_rect(ox+9, oy+11, 14, 2, C_CAP_WHITE) # Visor
        # Face
        sheet.fill_rect(ox+11, oy+13, 10, 6, C_SKIN)
        sheet.set_pixel(ox+13, oy+15, C_HAIR_BLK) # Eye L
        sheet.set_pixel(ox+18, oy+15, C_HAIR_BLK) # Eye R
        # Torso / Jacket
        sheet.fill_rect(ox+10, oy+19, 12, 12, C_JACKET_RED)
        sheet.fill_rect(ox+12, oy+19, 8, 12, C_JACKET_BLU)
        sheet.fill_rect(ox+8, oy+20, 2, 9, C_JACKET_RED)  # Arm L
        sheet.fill_rect(ox+22, oy+20, 2, 9, C_JACKET_RED) # Arm R
        sheet.fill_rect(ox+8, oy+29, 2, 3, C_SKIN)        # Hand L
        sheet.fill_rect(ox+22, oy+29, 2, 3, C_SKIN)       # Hand R
        # Legs
        sheet.fill_rect(ox+11, oy+31, 4, 10 + leg_offset, C_PANTS_NAVY)
        sheet.fill_rect(ox+17, oy+31, 4, 10 - leg_offset, C_PANTS_NAVY)
        # Shoes
        sheet.fill_rect(ox+10, oy+41 + leg_offset, 5, 4, C_SHOE_RED)
        sheet.fill_rect(ox+17, oy+41 - leg_offset, 5, 4, C_SHOE_RED)
        sheet.fill_rect(ox+10, oy+44 + leg_offset, 5, 1, C_SHOE_WHT)
        sheet.fill_rect(ox+17, oy+44 - leg_offset, 5, 1, C_SHOE_WHT)

    elif direction == 'up':
        # Back of Head & Cap
        sheet.fill_rect(ox+10, oy+6, 12, 10, C_CAP_RED)
        sheet.fill_rect(ox+9, oy+14, 14, 5, C_HAIR_BLK)
        # Torso
        sheet.fill_rect(ox+10, oy+19, 12, 12, C_JACKET_RED)
        sheet.fill_rect(ox+12, oy+20, 8, 10, C_JACKET_BLU)
        sheet.fill_rect(ox+8, oy+20, 2, 9, C_JACKET_RED)
        sheet.fill_rect(ox+22, oy+20, 2, 9, C_JACKET_RED)
        # Legs
        sheet.fill_rect(ox+11, oy+31, 4, 10 - leg_offset, C_PANTS_NAVY)
        sheet.fill_rect(ox+17, oy+31, 4, 10 + leg_offset, C_PANTS_NAVY)
        # Shoes
        sheet.fill_rect(ox+11, oy+41 - leg_offset, 4, 4, C_SHOE_RED)
        sheet.fill_rect(ox+17, oy+41 + leg_offset, 4, 4, C_SHOE_RED)

    elif direction == 'left':
        # Profile Head L
        sheet.fill_rect(ox+11, oy+6, 11, 8, C_CAP_RED)
        sheet.fill_rect(ox+7, oy+11, 6, 2, C_CAP_WHITE) # Visor left
        sheet.fill_rect(ox+14, oy+11, 8, 7, C_HAIR_BLK)
        sheet.fill_rect(ox+10, oy+13, 5, 6, C_SKIN)
        sheet.set_pixel(ox+10, oy+15, C_HAIR_BLK) # Eye
        # Torso
        sheet.fill_rect(ox+11, oy+19, 10, 12, C_JACKET_BLU)
        sheet.fill_rect(ox+12, oy+20, 4, 9, C_JACKET_RED)
        sheet.fill_rect(ox+12, oy+29, 3, 3, C_SKIN)
        # Legs
        sheet.fill_rect(ox+12, oy+31, 5, 10 + leg_offset, C_PANTS_NAVY)
        # Shoes
        sheet.fill_rect(ox+9, oy+41 + leg_offset, 7, 4, C_SHOE_RED)
        sheet.fill_rect(ox+9, oy+44 + leg_offset, 7, 1, C_SHOE_WHT)

    elif direction == 'right':
        # Profile Head R
        sheet.fill_rect(ox+10, oy+6, 11, 8, C_CAP_RED)
        sheet.fill_rect(ox+19, oy+11, 6, 2, C_CAP_WHITE) # Visor right
        sheet.fill_rect(ox+10, oy+11, 8, 7, C_HAIR_BLK)
        sheet.fill_rect(ox+17, oy+13, 5, 6, C_SKIN)
        sheet.set_pixel(ox+21, oy+15, C_HAIR_BLK) # Eye
        # Torso
        sheet.fill_rect(ox+11, oy+19, 10, 12, C_JACKET_BLU)
        sheet.fill_rect(ox+16, oy+20, 4, 9, C_JACKET_RED)
        sheet.fill_rect(ox+17, oy+29, 3, 3, C_SKIN)
        # Legs
        sheet.fill_rect(ox+15, oy+31, 5, 10 + leg_offset, C_PANTS_NAVY)
        # Shoes
        sheet.fill_rect(ox+16, oy+41 + leg_offset, 7, 4, C_SHOE_RED)
        sheet.fill_rect(ox+16, oy+44 + leg_offset, 7, 1, C_SHOE_WHT)

dirs = ['down', 'up', 'left', 'right']
for row_idx, d in enumerate(dirs):
    for col_idx in range(3):
        draw_player_frame(player, col_idx, row_idx, d, col_idx)

player.save('assets/characters/player.png')
print("Saved assets/characters/player.png")

print("All prototype assets generated successfully!")
