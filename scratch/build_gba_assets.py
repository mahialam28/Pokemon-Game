#!/usr/bin/env python3
"""
build_gba_assets.py
Generates 100% authentic 16x16 classic GBA Pokémon FireRed/LeafGreen style pixel-art tilesets:
- terrain.png (16x16 tiles: grass, dirt path with transitions, flowers)
- nature.png (16x16 tiles: 32x48 classic GBA trees, fences, mailbox, flowers)
- house.png (16x16 tiles: 64x64 classic GBA red-roof house with windows, door, shadows)
- player.png (16x20 classic GBA overworld trainer sprites: 4 directions x 3 animation frames)
Zero external dependencies.
"""

import zlib
import struct
import math
import os

def save_png(filename, width, height, pixels):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    raw = bytearray()
    for y in range(height):
        raw.append(0) # Filter type 0
        row_offset = y * width
        for x in range(width):
            r, g, b, a = pixels[row_offset + x]
            raw.extend((int(r) & 0xFF, int(g) & 0xFF, int(b) & 0xFF, int(a) & 0xFF))

    def make_chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack('>I', crc)

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(make_chunk(b'IHDR', ihdr))
    compressed = zlib.compress(bytes(raw), 9)
    png.extend(make_chunk(b'IDAT', compressed))
    png.extend(make_chunk(b'IEND', b''))

    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")


class Canvas:
    def __init__(self, width, height):
        self.w = width
        self.h = height
        self.pixels = [[0, 0, 0, 0] for _ in range(width * height)]

    def set_pixel(self, x, y, color):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.pixels[y * self.w + x] = list(color)

    def fill_rect(self, x, y, w, h, color):
        for cy in range(y, y + h):
            for cx in range(x, x + w):
                self.set_pixel(cx, cy, color)

    def draw_line(self, x1, y1, x2, y2, color):
        dx = abs(x2 - x1)
        dy = abs(y2 - y1)
        sx = 1 if x1 < x2 else -1
        sy = 1 if y1 < y2 else -1
        err = dx - dy
        while True:
            self.set_pixel(x1, y1, color)
            if x1 == x2 and y1 == y2:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x1 += sx
            if e2 < dx:
                err += dx
                y1 += sy


# ==============================================================================
# 1. TERRAIN (16x16 tiles, 64x32 image = 4 cols x 2 rows)
# Tile 0: GBA Grass
# Tile 1: Grass with small yellow flower
# Tile 2: Dirt path center
# Tile 3: Dirt path edge with grass transition
# ==============================================================================
def make_terrain():
    c = Canvas(64, 32)

    # Classic GBA FireRed Grass Palette
    G_BASE  = [72, 168, 72, 255]   # Main leafy green
    G_LIGHT = [104, 192, 88, 255]  # Blade highlight
    G_DARK  = [48, 128, 48, 255]   # Subtle blade shadow
    G_SPEC  = [128, 216, 96, 255]  # Crisp blade tip

    # Tile (0, 0): Plain Grass (x=0..15, y=0..15)
    c.fill_rect(0, 0, 16, 16, G_BASE)
    # Subtle GBA checker/blade flecks
    flecks = [(2, 3), (6, 9), (11, 4), (13, 12), (4, 13), (9, 14)]
    for fx, fy in flecks:
        c.set_pixel(fx, fy, G_LIGHT)
        c.set_pixel(fx, fy + 1, G_DARK)

    # Tile (1, 0): Grass with small GBA Flowers (x=16..31, y=0..15)
    c.fill_rect(16, 0, 16, 16, G_BASE)
    for fx, fy in flecks:
        c.set_pixel(16 + fx, fy, G_LIGHT)
        c.set_pixel(16 + fx, fy + 1, G_DARK)
    # Red/yellow tiny flower cluster (classic FireRed style)
    c.set_pixel(22, 6, [248, 88, 56, 255])
    c.set_pixel(23, 6, [255, 224, 72, 255])
    c.set_pixel(22, 7, [248, 88, 56, 255])
    c.set_pixel(23, 7, [200, 48, 32, 255])
    c.set_pixel(27, 10, [255, 232, 96, 255])
    c.set_pixel(28, 10, [248, 152, 40, 255])

    # Tile (2, 0): Classic GBA Dirt Path (x=32..47, y=0..15)
    D_BASE  = [232, 192, 120, 255] # Warm light tan
    D_LIGHT = [248, 216, 152, 255] # Sunlit dirt speck
    D_DARK  = [192, 144, 80, 255]  # Dirt shadow / edge
    D_DEEP  = [152, 104, 56, 255]  # Border outline

    c.fill_rect(32, 0, 16, 16, D_BASE)
    dirt_flecks = [(35, 3), (42, 6), (36, 11), (43, 12), (39, 8)]
    for dx, dy in dirt_flecks:
        c.set_pixel(dx, dy, D_LIGHT)
        c.set_pixel(dx + 1, dy, D_DARK)

    # Tile (3, 0): Dirt path with left grass border (x=48..63, y=0..15)
    c.fill_rect(48, 0, 16, 16, D_BASE)
    for dx, dy in [(52, 4), (58, 7), (54, 12)]:
        c.set_pixel(dx, dy, D_LIGHT)
        c.set_pixel(dx + 1, dy, D_DARK)
    # Left jagged grass edge
    for y in range(16):
        w = 3 + (1 if (y % 3 == 0) else 0)
        for x in range(w):
            c.set_pixel(48 + x, y, G_BASE)
        c.set_pixel(48 + w - 1, y, G_DARK)
        c.set_pixel(48 + w, y, D_DEEP)

    # Tile (0, 1): Dirt path with right grass border (x=0..15, y=16..31)
    c.fill_rect(0, 16, 16, 16, D_BASE)
    for y in range(16):
        w = 3 + (1 if (y % 4 == 0) else 0)
        for x in range(w):
            c.set_pixel(15 - x, 16 + y, G_BASE)
        c.set_pixel(16 - w, 16 + y, G_DARK)
        c.set_pixel(15 - w, 16 + y, D_DEEP)

    # Tile (1, 1): Tall Grass patch (x=16..31, y=16..31)
    TG_LIGHT = [120, 208, 96, 255]
    TG_MID   = [64, 152, 64, 255]
    TG_DARK  = [32, 96, 40, 255]
    c.fill_rect(16, 16, 16, 16, TG_MID)
    # Classic tall grass tufts
    for tx in [18, 22, 26]:
        c.fill_rect(tx, 18, 2, 10, TG_LIGHT)
        c.fill_rect(tx + 2, 20, 1, 8, TG_DARK)
        c.set_pixel(tx + 1, 17, TG_LIGHT)

    # Tile (2, 1): Water puddle / stream (x=32..47, y=16..31)
    W_BASE  = [64, 144, 208, 255]
    W_LIGHT = [112, 184, 240, 255]
    W_DARK  = [40, 104, 168, 255]
    c.fill_rect(32, 16, 16, 16, W_BASE)
    c.fill_rect(34, 18, 6, 2, W_LIGHT)
    c.fill_rect(41, 24, 4, 2, W_LIGHT)

    save_png("assets/tilesets/gba/terrain.png", 64, 32, c.pixels)


# ==============================================================================
# 2. NATURE & PROPS (64x48 = 4 cols x 3 rows of 16x16)
# Spans:
# - Cols 0-1, Rows 0-2 (32x48 px): Classic GBA Pokémon Tree!
# - Col 2: White Picket Fence (Row 0=post, Row 1=rail, Row 2=corner)
# - Col 3: Mailbox & Signpost (Row 0=Mailbox, Row 1=Signpost, Row 2=Bush)
# ==============================================================================
def make_nature():
    c = Canvas(64, 48)

    # Classic FireRed Tree Palette
    T_HI      = [152, 224, 104, 255] # Sunlit top crown
    T_LIGHT   = [104, 192, 72, 255]  # Upper leaf mass
    T_MID     = [56, 144, 56, 255]   # Main foliage
    T_DARK    = [32, 88, 40, 255]    # Lower foliage shadow
    T_OUTLINE = [16, 48, 24, 255]    # Dark pixel outline

    TRK_LIGHT = [168, 112, 64, 255]  # Wood highlight
    TRK_MID   = [128, 72, 32, 255]   # Wood trunk
    TRK_DARK  = [80, 40, 16, 255]    # Trunk shadow
    TRK_OUT   = [48, 24, 8, 255]     # Trunk outline

    # --- 32x48 GBA TREE (Cols 0-1, Rows 0-2: x=0..31, y=0..47) ---
    # Row 0 (y=0..15): Top Tree Crown
    # Row 1 (y=16..31): Mid Tree Foliage
    # Row 2 (y=32..47): Bottom Foliage & Wooden Trunk Base

    # Draw rounded foliage dome (centered at cx=16, cy=18, radius approx 14)
    for y in range(2, 36):
        # FireRed tree is bulbous: round top, widest around y=18..24, tucks in near trunk
        if y < 14:
            hw = int(math.sqrt(max(0, 14**2 - (14 - y)**2)))
        elif y <= 26:
            hw = 14
        else:
            hw = max(8, 14 - (y - 26))

        for x in range(16 - hw, 16 + hw):
            # Distance from top-left light source
            lx = x - 10
            ly = y - 8
            ld = math.hypot(lx, ly)
            if ld < 7:
                col = T_HI
            elif ld < 12:
                col = T_LIGHT
            elif ld < 18:
                col = T_MID
            else:
                col = T_DARK
            c.set_pixel(x, y, col)

        # Outlines
        c.set_pixel(16 - hw, y, T_OUTLINE)
        c.set_pixel(16 + hw - 1, y, T_OUTLINE)

    # Top outline of tree
    c.fill_rect(12, 1, 8, 1, T_OUTLINE)

    # Leaf cluster indent notches (classic GBA layered foliage lobes)
    c.set_pixel(8, 12, T_OUTLINE)
    c.set_pixel(9, 13, T_DARK)
    c.set_pixel(24, 14, T_OUTLINE)
    c.set_pixel(23, 15, T_DARK)
    c.set_pixel(7, 24, T_OUTLINE)
    c.set_pixel(25, 23, T_OUTLINE)

    # Tree Trunk (y=30..47, centered at x=12..19, 8px wide)
    for y in range(30, 47):
        # Flare at base
        w = 8 if y < 42 else (10 if y < 45 else 12)
        x_start = 16 - w // 2
        for x in range(x_start, x_start + w):
            # If behind foliage, foliage overlaps
            if y < 35 and c.pixels[y * 64 + x][3] > 0 and c.pixels[y * 64 + x] != T_OUTLINE:
                continue
            c.set_pixel(x, y, TRK_MID)
            if x == x_start:
                c.set_pixel(x, y, TRK_LIGHT)
            elif x >= x_start + w - 2:
                c.set_pixel(x, y, TRK_DARK)
        c.set_pixel(x_start, y, TRK_OUT)
        c.set_pixel(x_start + w - 1, y, TRK_OUT)

    # Ground root flare
    c.fill_rect(10, 46, 12, 1, TRK_OUT)

    # --- PROPS (Cols 2 & 3) ---
    # White Fence Post (Col 2, Row 0: x=32..47, y=0..15)
    F_WHT = [248, 248, 248, 255]
    F_SHD = [184, 192, 208, 255]
    F_OUT = [88, 96, 112, 255]

    # Post with pointed top & horizontal rails
    c.fill_rect(38, 2, 4, 13, F_WHT)
    c.fill_rect(41, 2, 1, 13, F_SHD)
    c.set_pixel(39, 1, F_WHT) # Pointed cap
    c.set_pixel(40, 1, F_SHD)
    # Outlines
    for py in range(2, 15):
        c.set_pixel(37, py, F_OUT)
        c.set_pixel(42, py, F_OUT)
    c.set_pixel(39, 0, F_OUT)
    c.set_pixel(40, 0, F_OUT)
    # Rails connecting through
    c.fill_rect(32, 5, 16, 2, F_WHT)
    c.fill_rect(32, 7, 16, 1, F_SHD)
    c.fill_rect(32, 11, 16, 2, F_WHT)
    c.fill_rect(32, 13, 16, 1, F_SHD)

    # White Fence Rail Only (Col 2, Row 1: x=32..47, y=16..31)
    c.fill_rect(32, 16 + 5, 16, 2, F_WHT)
    c.fill_rect(32, 16 + 7, 16, 1, F_SHD)
    c.fill_rect(32, 16 + 11, 16, 2, F_WHT)
    c.fill_rect(32, 16 + 13, 16, 1, F_SHD)
    c.fill_rect(32, 16 + 4, 16, 1, F_OUT)
    c.fill_rect(32, 16 + 8, 16, 1, F_OUT)
    c.fill_rect(32, 16 + 10, 16, 1, F_OUT)
    c.fill_rect(32, 16 + 14, 16, 1, F_OUT)

    # Fence Corner / End (Col 2, Row 2: x=32..47, y=32..47)
    c.fill_rect(38, 32 + 2, 4, 13, F_WHT)
    c.fill_rect(41, 32 + 2, 1, 13, F_SHD)
    c.set_pixel(39, 32 + 1, F_WHT)
    c.set_pixel(40, 32 + 1, F_SHD)
    for py in range(32 + 2, 32 + 15):
        c.set_pixel(37, py, F_OUT)
        c.set_pixel(42, py, F_OUT)
    c.set_pixel(39, 32 + 0, F_OUT)
    c.set_pixel(40, 32 + 0, F_OUT)

    # Classic GBA Mailbox (Col 3, Row 0: x=48..63, y=0..15)
    # Wooden post (x=55..56, y=8..15)
    c.fill_rect(55, 8, 2, 8, TRK_MID)
    c.fill_rect(55, 8, 1, 8, TRK_LIGHT)
    c.set_pixel(54, 8, TRK_OUT)
    c.set_pixel(57, 8, TRK_OUT)
    # Red box (x=51..60, y=2..8)
    M_RED_HI  = [248, 88, 56, 255]
    M_RED_MID = [216, 40, 32, 255]
    M_RED_DRK = [144, 24, 24, 255]
    M_RED_OUT = [80, 16, 16, 255]
    c.fill_rect(51, 3, 10, 5, M_RED_MID)
    c.fill_rect(52, 2, 8, 1, M_RED_HI)
    c.fill_rect(51, 7, 10, 1, M_RED_DRK)
    # Outlines
    c.fill_rect(52, 1, 8, 1, M_RED_OUT)
    c.fill_rect(51, 8, 10, 1, M_RED_OUT)
    c.fill_rect(50, 3, 1, 5, M_RED_OUT)
    c.fill_rect(61, 3, 1, 5, M_RED_OUT)
    # Mail slot & yellow flag
    c.fill_rect(53, 4, 6, 1, [40, 8, 8, 255])
    c.fill_rect(61, 2, 2, 3, [255, 216, 48, 255])

    # Classic GBA Wooden Town Sign (Col 3, Row 1: x=48..63, y=16..31)
    c.fill_rect(54, 16 + 8, 4, 8, TRK_MID)
    c.fill_rect(50, 16 + 2, 12, 7, TRK_LIGHT)
    c.fill_rect(51, 16 + 3, 10, 5, TRK_MID)
    c.fill_rect(50, 16 + 1, 12, 1, TRK_OUT)
    c.fill_rect(50, 16 + 9, 12, 1, TRK_OUT)
    c.fill_rect(49, 16 + 2, 1, 7, TRK_OUT)
    c.fill_rect(62, 16 + 2, 1, 7, TRK_OUT)

    # Small Round Hedge Bush (Col 3, Row 2: x=48..63, y=32..47)
    for by in range(32 + 3, 32 + 15):
        hw = int(math.sqrt(max(0, 6**2 - (by - (32 + 9))**2)))
        for bx in range(56 - hw, 56 + hw):
            c.set_pixel(bx, by, T_MID if by > 32 + 9 else T_LIGHT)
        c.set_pixel(56 - hw, by, T_OUTLINE)
        c.set_pixel(56 + hw - 1, by, T_OUTLINE)

    save_png("assets/tilesets/gba/nature.png", 64, 48, c.pixels)


# ==============================================================================
# 3. CLASSIC GBA HOUSE (64x64 = 4 cols x 4 rows of 16x16 tiles)
# Authentic FireRed Pallet Town House:
# - Row 0 (Overhead): Roof Peak (Left edge, center tiles, right edge)
# - Row 1 (Overhead): Roof Slope & Eaves with front lip
# - Row 2 (Building): Upper White Wall with dark roof drop-shadow & 16x16 Window
# - Row 3 (Building): Lower White Wall with Blue/Black Trim, Door & Entrance Mat
# ==============================================================================
def make_house():
    c = Canvas(64, 64)

    # Classic GBA House Colors
    R_HI   = [248, 104, 72, 255]   # Roof highlight
    R_MID  = [216, 48, 40, 255]    # Primary red roof
    R_DARK = [160, 24, 24, 255]    # Roof shadow / ridge
    R_DEEP = [96, 16, 16, 255]     # Under-eave shadow
    R_OUT  = [64, 8, 8, 255]       # Roof outline

    W_WALL = [248, 248, 240, 255]  # Clean cream/white stucco wall
    W_SHD  = [208, 208, 200, 255]  # Eave drop-shadow on wall
    W_DEEP = [160, 160, 152, 255]  # Corner occlusion shadow
    W_OUT  = [64, 64, 72, 255]     # Wall dark outline

    WIN_FRAME = [248, 248, 248, 255]
    WIN_GLASS = [56, 120, 184, 255]
    WIN_SHINE = [136, 192, 248, 255]
    WIN_DEEP  = [24, 56, 96, 255]

    DOOR_OUT  = [48, 24, 16, 255]
    DOOR_BODY = [136, 72, 32, 255]
    DOOR_HI   = [184, 112, 56, 255]
    DOOR_KNOB = [255, 216, 64, 255]
    MAT_BLUE  = [72, 136, 192, 255]

    # --- ROW 0 (y=0..15): Roof Ridge & Peaks ---
    # Left slope, center tiles with chimney on right, right slope
    # Roof bounds: x=2..61
    for y in range(4, 16):
        # Left gable slant
        x_left = max(2, 8 - (y - 4))
        # Right gable slant
        x_right = min(61, 55 + (y - 4))

        for x in range(x_left, x_right):
            # Horizontal red tile courses
            tile_row = (y - 4) % 3
            if tile_row == 0:
                col = R_HI
            elif tile_row == 1:
                col = R_MID
            else:
                col = R_DARK
            c.set_pixel(x, y, col)

        c.set_pixel(x_left, y, R_OUT)
        c.set_pixel(x_right - 1, y, R_OUT)

    # Roof top apex outline
    c.fill_rect(8, 3, 48, 1, R_OUT)

    # Small GBA Chimney on upper right (x=48..53, y=1..8)
    c.fill_rect(48, 1, 6, 7, [176, 184, 192, 255])
    c.fill_rect(48, 1, 6, 2, [224, 232, 240, 255])
    c.fill_rect(47, 0, 8, 1, [72, 80, 88, 255])
    c.fill_rect(47, 8, 8, 1, [72, 80, 88, 255])
    c.fill_rect(47, 1, 1, 7, [72, 80, 88, 255])
    c.fill_rect(54, 1, 1, 7, [72, 80, 88, 255])

    # --- ROW 1 (y=16..31): Roof Eaves & Overhang ---
    for y in range(16, 28):
        for x in range(2, 62):
            tile_row = y % 3
            if tile_row == 0:
                col = R_HI
            elif tile_row == 1:
                col = R_MID
            else:
                col = R_DARK
            c.set_pixel(x, y, col)
        c.set_pixel(1, y, R_OUT)
        c.set_pixel(62, y, R_OUT)

    # Roof front fascia / eave edge (y=26..29)
    c.fill_rect(1, 26, 62, 2, R_DARK)
    c.fill_rect(1, 28, 62, 1, R_DEEP)
    c.fill_rect(0, 29, 64, 1, R_OUT)

    # Eave dark drop shadow cast on upper wall (y=30..31)
    c.fill_rect(4, 30, 56, 1, W_DEEP)
    c.fill_rect(4, 31, 56, 1, W_SHD)

    # --- ROW 2 (y=32..47): 1F Upper Wall & Window ---
    # Wall background
    c.fill_rect(4, 32, 56, 16, W_WALL)
    # Left and right wall corner outlines
    for y in range(30, 63):
        c.set_pixel(3, y, W_OUT)
        c.set_pixel(4, y, W_DEEP)
        c.set_pixel(59, y, W_DEEP)
        c.set_pixel(60, y, W_OUT)

    # Left Window (Col 0-1 area: centered at x=14, y=34, size 12x11)
    WIN_X, WIN_Y = 12, 34
    c.fill_rect(WIN_X, WIN_Y, 12, 11, WIN_FRAME)
    c.fill_rect(WIN_X - 1, WIN_Y - 1, 14, 1, W_OUT)
    c.fill_rect(WIN_X - 1, WIN_Y + 11, 14, 1, W_OUT)
    c.fill_rect(WIN_X - 1, WIN_Y, 1, 11, W_OUT)
    c.fill_rect(WIN_X + 12, WIN_Y, 1, 11, W_OUT)
    # Glass panes
    c.fill_rect(WIN_X + 1, WIN_Y + 1, 4, 4, WIN_GLASS)
    c.fill_rect(WIN_X + 7, WIN_Y + 1, 4, 4, WIN_GLASS)
    c.fill_rect(WIN_X + 1, WIN_Y + 6, 4, 4, WIN_DEEP)
    c.fill_rect(WIN_X + 7, WIN_Y + 6, 4, 4, WIN_DEEP)
    # Glass shine reflection
    c.set_pixel(WIN_X + 2, WIN_Y + 1, WIN_SHINE)
    c.set_pixel(WIN_X + 3, WIN_Y + 1, WIN_SHINE)
    c.set_pixel(WIN_X + 2, WIN_Y + 2, WIN_SHINE)
    c.set_pixel(WIN_X + 8, WIN_Y + 1, WIN_SHINE)

    # Right Window (Col 2-3 area: centered at x=40, y=34, size 12x11)
    WIN2_X = 40
    c.fill_rect(WIN2_X, WIN_Y, 12, 11, WIN_FRAME)
    c.fill_rect(WIN2_X - 1, WIN_Y - 1, 14, 1, W_OUT)
    c.fill_rect(WIN2_X - 1, WIN_Y + 11, 14, 1, W_OUT)
    c.fill_rect(WIN2_X - 1, WIN_Y, 1, 11, W_OUT)
    c.fill_rect(WIN2_X + 12, WIN_Y, 1, 11, W_OUT)
    c.fill_rect(WIN2_X + 1, WIN_Y + 1, 4, 4, WIN_GLASS)
    c.fill_rect(WIN2_X + 7, WIN_Y + 1, 4, 4, WIN_GLASS)
    c.fill_rect(WIN2_X + 1, WIN_Y + 6, 4, 4, WIN_DEEP)
    c.fill_rect(WIN2_X + 7, WIN_Y + 6, 4, 4, WIN_DEEP)
    c.set_pixel(WIN2_X + 2, WIN_Y + 1, WIN_SHINE)
    c.set_pixel(WIN2_X + 3, WIN_Y + 1, WIN_SHINE)
    c.set_pixel(WIN2_X + 2, WIN_Y + 2, WIN_SHINE)
    c.set_pixel(WIN2_X + 8, WIN_Y + 1, WIN_SHINE)

    # --- ROW 3 (y=48..63): 1F Lower Wall, Door & Welcome Mat ---
    c.fill_rect(4, 48, 56, 14, W_WALL)

    # Blue wall base plinth line (classic Pokémon GBA wall footing)
    c.fill_rect(4, 59, 56, 2, [72, 96, 128, 255])
    c.fill_rect(3, 61, 58, 1, W_OUT)

    # Classic GBA Front Door (centered at x=25..38, y=46..62)
    DOOR_X = 26
    c.fill_rect(DOOR_X - 1, 45, 14, 16, DOOR_OUT)
    c.fill_rect(DOOR_X, 46, 12, 14, DOOR_BODY)
    c.fill_rect(DOOR_X + 1, 47, 10, 1, DOOR_HI)
    # Door vertical panels
    c.fill_rect(DOOR_X + 2, 49, 3, 4, DOOR_OUT)
    c.fill_rect(DOOR_X + 7, 49, 3, 4, DOOR_OUT)
    c.fill_rect(DOOR_X + 2, 54, 3, 5, DOOR_OUT)
    c.fill_rect(DOOR_X + 7, 54, 3, 5, DOOR_OUT)
    # Brass doorknob
    c.set_pixel(DOOR_X + 9, 52, DOOR_KNOB)

    # Welcome Mat / Step in front of door (x=24..39, y=60..63)
    c.fill_rect(24, 60, 16, 3, MAT_BLUE)
    c.fill_rect(24, 60, 16, 1, [112, 176, 232, 255])
    c.fill_rect(24, 63, 16, 1, [40, 72, 104, 255])

    save_png("assets/tilesets/gba/house.png", 64, 64, c.pixels)


# ==============================================================================
# 4. GBA PLAYER SPRITESHEET (48x80 = 3 frames x 4 directions of 16x20 sprites)
# Directions:
# - Row 0: DOWN (y=0..19)
# - Row 1: UP (y=20..39)
# - Row 2: LEFT (y=40..59)
# - Row 3: RIGHT (y=60..79)
# Frames: 0=Walk1, 1=Idle, 2=Walk2
# ==============================================================================
def make_player():
    width = 48   # 3 frames x 16px
    height = 80  # 4 directions x 20px
    c = Canvas(width, height)

    # Authentic GBA FireRed Red Trainer Palette
    C_OUT = [24, 24, 32, 255]       # Dark sprite outline
    C_CAP = [224, 40, 32, 255]      # Red cap
    C_CAP_HI = [248, 88, 72, 255]
    C_WHT = [248, 248, 248, 255]    # White cap visor / shoes
    C_SKN = [248, 192, 152, 255]    # Skin tone
    C_SKN_SHD = [208, 144, 112, 255]# Skin shade
    C_EYE = [24, 24, 32, 255]       # 1-pixel eyes
    C_HAIR = [56, 40, 32, 255]      # Brown hair tips
    C_VEST = [216, 40, 32, 255]     # Red vest
    C_SHRT = [32, 32, 40, 255]      # Black undershirt
    C_PNT  = [48, 80, 144, 255]     # Blue jeans
    C_PNT_SHD = [32, 48, 96, 255]
    C_BAG  = [240, 184, 48, 255]    # Yellow bag

    def draw_gba_sprite(bx, by, direction, frame):
        # direction: 0=DOWN, 1=UP, 2=LEFT, 3=RIGHT
        # frame: 0=Walk1, 1=Idle, 2=Walk2
        cx = bx + 8
        cy = by + 1

        bob = -1 if frame in (0, 2) else 0
        leg_l = 0
        leg_r = 0
        if frame == 0:
            leg_l = -1
            leg_r = 1
        elif frame == 2:
            leg_l = 1
            leg_r = -1

        head_y = cy + bob

        if direction == 0: # DOWN
            # Cap crown
            c.fill_rect(cx - 4, head_y, 8, 4, C_CAP)
            c.fill_rect(cx - 3, head_y, 6, 1, C_CAP_HI)
            # Cap white brim / visor
            c.fill_rect(cx - 4, head_y + 4, 8, 1, C_WHT)
            # Hair under cap sides
            c.set_pixel(cx - 4, head_y + 5, C_HAIR)
            c.set_pixel(cx + 3, head_y + 5, C_HAIR)
            # Face
            c.fill_rect(cx - 3, head_y + 5, 6, 4, C_SKN)
            # Eyes
            c.set_pixel(cx - 2, head_y + 6, C_EYE)
            c.set_pixel(cx + 1, head_y + 6, C_EYE)
            # Outlines head
            c.draw_line(cx - 3, head_y - 1, cx + 2, head_y - 1, C_OUT)
            c.draw_line(cx - 5, head_y + 1, cx - 5, head_y + 6, C_OUT)
            c.draw_line(cx + 4, head_y + 1, cx + 4, head_y + 6, C_OUT)

            # Torso (Vest & Black shirt)
            ty = head_y + 9
            c.fill_rect(cx - 4, ty, 8, 5, C_VEST)
            c.fill_rect(cx - 1, ty, 2, 5, C_SHRT)
            # Hands
            c.set_pixel(cx - 5, ty + 3, C_SKN)
            c.set_pixel(cx + 4, ty + 3, C_SKN)

            # Legs / Pants
            ly = ty + 5
            c.fill_rect(cx - 3, ly, 3, 4 + leg_l, C_PNT)
            c.fill_rect(cx, ly, 3, 4 + leg_r, C_PNT)

            # Shoes
            c.fill_rect(cx - 3, ly + 4 + leg_l, 3, 1, C_WHT)
            c.fill_rect(cx, ly + 4 + leg_r, 3, 1, C_WHT)

        elif direction == 1: # UP
            # Cap back
            c.fill_rect(cx - 4, head_y, 8, 5, C_CAP)
            c.fill_rect(cx - 3, head_y, 6, 1, C_CAP_HI)
            # Hair nape
            c.fill_rect(cx - 4, head_y + 5, 8, 4, C_HAIR)
            # Yellow backpack
            ty = head_y + 9
            c.fill_rect(cx - 4, ty, 8, 5, C_VEST)
            c.fill_rect(cx - 3, ty + 1, 6, 4, C_BAG)

            # Legs / Shoes
            ly = ty + 5
            c.fill_rect(cx - 3, ly, 3, 4 + leg_l, C_PNT)
            c.fill_rect(cx, ly, 3, 4 + leg_r, C_PNT)
            c.fill_rect(cx - 3, ly + 4 + leg_l, 3, 1, C_WHT)
            c.fill_rect(cx, ly + 4 + leg_r, 3, 1, C_WHT)

        elif direction == 2: # LEFT
            # Cap facing left with visor pointing left
            c.fill_rect(cx - 2, head_y, 6, 4, C_CAP)
            c.fill_rect(cx - 5, head_y + 3, 4, 2, C_WHT) # Visor left
            # Hair back
            c.fill_rect(cx + 2, head_y + 3, 2, 6, C_HAIR)
            # Face profile left
            c.fill_rect(cx - 3, head_y + 5, 5, 4, C_SKN)
            c.set_pixel(cx - 3, head_y + 6, C_EYE)

            # Torso profile
            ty = head_y + 9
            c.fill_rect(cx - 2, ty, 5, 5, C_VEST)
            c.fill_rect(cx + 1, ty + 1, 3, 4, C_BAG) # Bag on back
            c.set_pixel(cx - 3, ty + 3, C_SKN)

            # Legs
            ly = ty + 5
            c.fill_rect(cx - 2 + leg_l, ly, 3, 4, C_PNT)
            c.fill_rect(cx + leg_r, ly, 3, 4, C_PNT_SHD)
            c.fill_rect(cx - 3 + leg_l, ly + 4, 3, 1, C_WHT)
            c.fill_rect(cx - 1 + leg_r, ly + 4, 3, 1, C_WHT)

        elif direction == 3: # RIGHT
            # Cap facing right with visor pointing right
            c.fill_rect(cx - 4, head_y, 6, 4, C_CAP)
            c.fill_rect(cx + 1, head_y + 3, 4, 2, C_WHT) # Visor right
            # Hair back
            c.fill_rect(cx - 4, head_y + 3, 2, 6, C_HAIR)
            # Face profile right
            c.fill_rect(cx - 2, head_y + 5, 5, 4, C_SKN)
            c.set_pixel(cx + 2, head_y + 6, C_EYE)

            # Torso profile
            ty = head_y + 9
            c.fill_rect(cx - 3, ty, 5, 5, C_VEST)
            c.fill_rect(cx - 4, ty + 1, 3, 4, C_BAG)
            c.set_pixel(cx + 2, ty + 3, C_SKN)

            # Legs
            ly = ty + 5
            c.fill_rect(cx - 1 + leg_l, ly, 3, 4, C_PNT)
            c.fill_rect(cx - 3 + leg_r, ly, 3, 4, C_PNT_SHD)
            c.fill_rect(cx + leg_l, ly + 4, 3, 1, C_WHT)
            c.fill_rect(cx - 2 + leg_r, ly + 4, 3, 1, C_WHT)

    for d in range(4):
        for f in range(3):
            draw_gba_sprite(f * 16, d * 20, d, f)

    save_png("assets/characters/gba_player.png", width, height, c.pixels)


if __name__ == "__main__":
    make_terrain()
    make_nature()
    make_house()
    make_player()
    print("All classic GBA FireRed/LeafGreen style assets generated successfully!")
