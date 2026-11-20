#!/usr/bin/env python3
"""
generate_hd_gba_assets.py
Generates authentic GBA-quality 32x32 pixel-art assets matching the reference image Panel 1.
Zero dependencies (uses standard library struct and zlib).
"""

import zlib
import struct
import math

def save_png(filename, width, height, pixels):
    """Saves RGBA pixels (list of [r,g,b,a]) as a standard PNG."""
    raw = bytearray()
    for y in range(height):
        raw.append(0) # Filter type 0 (None)
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
            r, g, b, a = color
            idx = y * self.w + x
            if a == 255:
                self.pixels[idx] = [r, g, b, a]
            elif a > 0:
                # Alpha blend
                bg = self.pixels[idx]
                alpha = a / 255.0
                inv = 1.0 - alpha
                self.pixels[idx] = [
                    int(r * alpha + bg[0] * inv),
                    int(g * alpha + bg[1] * inv),
                    int(b * alpha + bg[2] * inv),
                    int(255 * (alpha + (bg[3]/255.0) * inv))
                ]

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
# 1. TERRAIN TILESET (128x32 = 4 tiles of 32x32)
# ==============================================================================
def make_terrain():
    c = Canvas(128, 32)

    # Color palettes
    GRASS_BASE = [74, 168, 88, 255]
    GRASS_LIGHT = [96, 188, 106, 255]
    GRASS_DARK = [54, 142, 68, 255]
    GRASS_SHADOW = [40, 115, 54, 255]

    # Tile 0: Base Grass
    for y in range(32):
        for x in range(32):
            # Gentle dithered noise pattern
            n = (math.sin(x * 0.4) * math.cos(y * 0.4) + math.sin((x + y) * 0.7)) * 0.5
            if n > 0.4:
                col = GRASS_LIGHT
            elif n < -0.4:
                col = GRASS_DARK
            else:
                col = GRASS_BASE
            c.set_pixel(x, y, col)
            # Small grass tuft blades
            if (x * 11 + y * 17) % 31 == 0:
                c.set_pixel(x, y, GRASS_LIGHT)
                c.set_pixel(x, y + 1, GRASS_SHADOW)

    # Tile 1: Soft Sunlight Grass (slight floral/warm speckles)
    for y in range(32):
        for x in range(32):
            base_col = c.pixels[y * 128 + x]
            col = [min(255, base_col[0] + 12), min(255, base_col[1] + 10), min(255, base_col[2] + 4), 255]
            c.set_pixel(32 + x, y, col)

    # Tile 2: Detailed GBA Cobblestone Path (irregular rounded flagstones with sandy grout)
    SAND_GROUT = [218, 198, 164, 255]
    SAND_DARK = [186, 164, 130, 255]
    STONE_LIGHT = [242, 234, 218, 255]
    STONE_MID = [214, 202, 184, 255]
    STONE_SHADOW = [170, 154, 134, 255]
    STONE_OUTLINE = [136, 120, 102, 255]

    # Fill sandy grout base
    c.fill_rect(64, 0, 32, 32, SAND_GROUT)
    for y in range(32):
        for x in range(32):
            if (x * 7 + y * 13) % 4 == 0:
                c.set_pixel(64 + x, y, SAND_DARK)

    # Draw rounded paving stones in staggered courses
    stones = [
        # (x, y, w, h)
        (2, 2, 12, 6), (16, 2, 14, 6),
        (1, 10, 14, 6), (17, 10, 13, 6),
        (3, 18, 11, 6), (16, 18, 14, 6),
        (1, 26, 14, 5), (17, 26, 13, 5),
    ]
    for sx, sy, sw, sh in stones:
        # Outline
        c.fill_rect(64 + sx, sy, sw, sh, STONE_OUTLINE)
        # Inner body
        c.fill_rect(64 + sx + 1, sy + 1, sw - 2, sh - 2, STONE_MID)
        # Highlight (top & left inner)
        for i in range(1, sw - 2):
            c.set_pixel(64 + sx + i, sy + 1, STONE_LIGHT)
        for i in range(1, sh - 2):
            c.set_pixel(64 + sx + 1, sy + i, STONE_LIGHT)
        # Shadow (bottom & right inner)
        for i in range(1, sw - 1):
            c.set_pixel(64 + sx + i, sy + sh - 2, STONE_SHADOW)
        for i in range(1, sh - 1):
            c.set_pixel(64 + sx + sw - 2, sy + i, STONE_SHADOW)

    # Tile 3: Wildflower Meadow Grass (red, blue, white, yellow flowers with leaves)
    for y in range(32):
        for x in range(32):
            c.set_pixel(96 + x, y, c.pixels[y * 128 + x])

    flower_spots = [
        (6, 7, [238, 70, 80, 255]),     # Red
        (22, 9, [70, 140, 240, 255]),   # Blue
        (14, 18, [248, 210, 60, 255]),  # Yellow
        (8, 25, [250, 250, 250, 255]),  # White
        (24, 24, [240, 100, 170, 255]), # Pink
    ]
    for fx, fy, fcol in flower_spots:
        # Petals cross
        c.set_pixel(96 + fx, fy, [255, 255, 255, 255] if fcol != [250, 250, 250, 255] else [250, 230, 80, 255])
        c.set_pixel(96 + fx - 1, fy, fcol)
        c.set_pixel(96 + fx + 1, fy, fcol)
        c.set_pixel(96 + fx, fy - 1, fcol)
        c.set_pixel(96 + fx, fy + 1, fcol)
        # Stem / leaf
        c.set_pixel(96 + fx - 1, fy + 2, [40, 115, 54, 255])

    save_png("assets/tilesets/terrain/terrain.png", 128, 32, c.pixels)


# ==============================================================================
# 2. NATURE & GARDEN TILESET (128x96 = 4 cols x 3 rows of 32x32)
# ==============================================================================
def make_nature():
    c = Canvas(128, 96)

    # 1. 64x64 Mature Oak Tree (spans cols 0-1, rows 0-1)
    TREE_HIGHLIGHT = [120, 210, 110, 255]
    TREE_LIGHT     = [80, 182, 90, 255]
    TREE_MID       = [50, 145, 70, 255]
    TREE_DARK      = [32, 102, 52, 255]
    TREE_DEEP      = [20, 68, 38, 255]
    TREE_OUTLINE   = [12, 45, 25, 255]

    TRUNK_LIGHT    = [160, 105, 60, 255]
    TRUNK_MID      = [122, 75, 40, 255]
    TRUNK_DARK     = [85, 48, 24, 255]
    TRUNK_OUTLINE  = [55, 30, 15, 255]

    # Draw Tree Trunk (in lower 32x32, x=22..42, y=36..62)
    # Roots spreading out
    for y in range(36, 62):
        spread = int(math.pow((y - 36) / 26.0, 2) * 8)
        w = 12 + spread
        x_start = 32 - w // 2
        for x in range(x_start, x_start + w):
            c.set_pixel(x, y, TRUNK_MID)
            if x == x_start or x == x_start + w - 1:
                c.set_pixel(x, y, TRUNK_OUTLINE)
            elif x < x_start + 4:
                c.set_pixel(x, y, TRUNK_LIGHT)
            elif x > x_start + w - 4:
                c.set_pixel(x, y, TRUNK_DARK)
            # Bark vertical grooves
            if (x - x_start) == 5 or (x - x_start) == 9:
                c.set_pixel(x, y, TRUNK_DARK)

    # Draw Foliage Canopy (Volumetric clusters with GBA circular masses)
    # Centers of foliage puff clusters: (cx, cy, radius)
    clusters = [
        (32, 24, 22), # Main center
        (20, 20, 16), # Left puff
        (44, 20, 16), # Right puff
        (32, 12, 16), # Top center puff
        (16, 28, 14), # Lower left puff
        (48, 28, 14), # Lower right puff
    ]

    # First pass: fill with dark outline
    for cx, cy, r in clusters:
        for y in range(cy - r - 2, cy + r + 3):
            for x in range(cx - r - 2, cx + r + 3):
                d = math.hypot(x - cx, y - cy)
                if d <= r + 1.2:
                    c.set_pixel(x, y, TREE_OUTLINE)

    # Second pass: cluster shading
    for cx, cy, r in clusters:
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                d = math.hypot(x - cx, y - cy)
                if d <= r:
                    # Angle and distance from light source (top-left)
                    dx = x - (cx - r * 0.35)
                    dy = y - (cy - r * 0.35)
                    light_dist = math.hypot(dx, dy) / r
                    if light_dist < 0.45:
                        col = TREE_HIGHLIGHT
                    elif light_dist < 0.75:
                        col = TREE_LIGHT
                    elif light_dist < 1.05:
                        col = TREE_MID
                    elif light_dist < 1.25:
                        col = TREE_DARK
                    else:
                        col = TREE_DEEP
                    c.set_pixel(x, y, col)

    # Add leaf cluster texture / dither highlights
    for y in range(2, 48):
        for x in range(4, 60):
            p = c.pixels[y * 128 + x]
            if p[3] > 0 and p != TREE_OUTLINE and p != TRUNK_OUTLINE:
                if (x + y * 2) % 7 == 0 and p == TREE_LIGHT:
                    c.set_pixel(x, y, TREE_HIGHLIGHT)
                elif (x * 2 + y) % 9 == 0 and p == TREE_MID:
                    c.set_pixel(x, y, TREE_DARK)

    # 2. White Picket Garden Fence with Post (col 2, row 0: x=64..95, y=0..31)
    FENCE_WHITE = [250, 252, 255, 255]
    FENCE_SHADE = [205, 215, 228, 255]
    FENCE_DARK  = [150, 165, 185, 255]
    FENCE_POST  = [175, 188, 205, 255]

    # Post at left (x=64..70, y=6..30)
    c.fill_rect(65, 6, 6, 24, FENCE_POST)
    c.fill_rect(66, 7, 4, 23, FENCE_WHITE)
    c.fill_rect(69, 7, 1, 23, FENCE_SHADE)
    # Post cap bevel
    c.fill_rect(64, 5, 8, 2, FENCE_WHITE)
    c.fill_rect(64, 7, 8, 1, FENCE_DARK)

    # Rails
    c.fill_rect(71, 12, 24, 3, FENCE_SHADE)
    c.fill_rect(71, 12, 24, 1, FENCE_WHITE)
    c.fill_rect(71, 22, 24, 3, FENCE_SHADE)
    c.fill_rect(71, 22, 24, 1, FENCE_WHITE)

    # Pickets (3 pickets with pointed tips)
    picket_xs = [74, 82, 90]
    for px in picket_xs:
        # Pointed top
        c.set_pixel(px + 2, 7, FENCE_WHITE)
        c.fill_rect(px + 1, 8, 3, 1, FENCE_WHITE)
        # Picket body
        c.fill_rect(px, 9, 5, 21, FENCE_WHITE)
        c.fill_rect(px + 3, 9, 2, 21, FENCE_SHADE)
        # Outlines
        for py in range(9, 31):
            c.set_pixel(px, py, FENCE_DARK)
            c.set_pixel(px + 4, py, FENCE_DARK)

    # 3. Red Mailbox on Wooden Post (col 3, row 0: x=96..127, y=0..31)
    # Wooden Post (x=110..113, y=14..31)
    c.fill_rect(110, 14, 4, 17, TRUNK_MID)
    c.fill_rect(110, 14, 1, 17, TRUNK_LIGHT)
    c.fill_rect(113, 14, 1, 17, TRUNK_DARK)
    # Red Mailbox curved top
    BOX_RED_HI = [245, 78, 66, 255]
    BOX_RED_MID = [210, 42, 38, 255]
    BOX_RED_SHD = [152, 24, 24, 255]
    BOX_OUTLINE = [85, 12, 12, 255]

    c.fill_rect(102, 6, 18, 10, BOX_RED_MID)
    c.fill_rect(103, 5, 16, 2, BOX_RED_HI)
    c.fill_rect(104, 4, 14, 1, BOX_RED_HI)
    # Mailbox door & shadow
    c.fill_rect(102, 14, 18, 2, BOX_RED_SHD)
    # Outlines
    c.draw_line(104, 3, 117, 3, BOX_OUTLINE)
    c.draw_line(101, 6, 101, 16, BOX_OUTLINE)
    c.draw_line(120, 6, 120, 16, BOX_OUTLINE)
    c.draw_line(102, 16, 119, 16, BOX_OUTLINE)
    # Mail slot / handle
    c.fill_rect(105, 9, 12, 2, [60, 10, 10, 255])
    # Yellow indicator flag on right
    c.fill_rect(120, 5, 2, 8, [245, 195, 35, 255])
    c.fill_rect(122, 5, 4, 4, [245, 195, 35, 255])

    # 4. Lush Pink Hydrangea Bush (col 2, row 1: x=64..95, y=32..63)
    BUSH_CX, BUSH_CY = 80, 48
    for y in range(36, 61):
        for x in range(68, 93):
            d = math.hypot(x - BUSH_CX, y - BUSH_CY)
            if d <= 12:
                c.set_pixel(x, y, TREE_MID)
                if y > 53:
                    c.set_pixel(x, y, TREE_DARK)
                elif d < 6 and y < 46:
                    c.set_pixel(x, y, TREE_LIGHT)
    # Hydrangea pink/magenta flower blossoms clusters
    flower_heads = [(74, 43), (84, 42), (79, 49), (72, 51), (86, 50)]
    for hx, hy in flower_heads:
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                if abs(dx) + abs(dy) <= 3:
                    c.set_pixel(hx + dx, hy + dy, [235, 110, 165, 255])
        c.set_pixel(hx, hy, [255, 190, 220, 255])
        c.set_pixel(hx + 1, hy + 1, [180, 60, 110, 255])

    # 5. Spherical Boxwood Topiary Hedge (col 3, row 1: x=96..127, y=32..63)
    TOPIARY_CX, TOPIARY_CY = 112, 48
    for y in range(35, 61):
        for x in range(99, 125):
            d = math.hypot(x - TOPIARY_CX, y - TOPIARY_CY)
            if d <= 12:
                # Spherical lighting from top-left
                lx = x - (TOPIARY_CX - 4)
                ly = y - (TOPIARY_CY - 4)
                ld = math.hypot(lx, ly)
                if ld < 5:
                    c.set_pixel(x, y, TREE_HIGHLIGHT)
                elif ld < 9:
                    c.set_pixel(x, y, TREE_LIGHT)
                elif ld < 12:
                    c.set_pixel(x, y, TREE_MID)
                else:
                    c.set_pixel(x, y, TREE_DARK)
                if d > 11.2:
                    c.set_pixel(x, y, TREE_OUTLINE)

    # 6. Stone Garden Wall with Pier (col 2, row 2: x=64..95, y=64..95)
    # Low stone wall with coping stone
    WALL_COPING = [220, 228, 238, 255]
    WALL_STONE  = [168, 180, 196, 255]
    WALL_SHADOW = [120, 134, 152, 255]
    WALL_DARK   = [82, 94, 112, 255]

    # Coping top slab
    c.fill_rect(64, 72, 32, 4, WALL_COPING)
    c.fill_rect(64, 75, 32, 1, WALL_SHADOW)
    # Stone body
    c.fill_rect(64, 76, 32, 18, WALL_STONE)
    # Mortar lines
    for y in [81, 87, 93]:
        c.fill_rect(64, y, 32, 1, WALL_SHADOW)
    for x in [72, 84]:
        c.fill_rect(x, 76, 1, 5, WALL_SHADOW)
    for x in [68, 80, 90]:
        c.fill_rect(x, 82, 1, 5, WALL_SHADOW)
    for x in [74, 86]:
        c.fill_rect(x, 88, 1, 6, WALL_SHADOW)

    # Wall base shadow
    c.fill_rect(64, 94, 32, 2, WALL_DARK)

    save_png("assets/tilesets/nature/nature.png", 128, 96, c.pixels)


# ==============================================================================
# 3. HERO HOUSE EXTERIOR TILESET (192x160 = 6 cols x 5 rows of 32x32)
# Matching Panel 1 in the Reference Concept Sheet
# ==============================================================================
def make_hero_house():
    width = 192   # 6 tiles
    height = 160  # 5 tiles
    c = Canvas(width, height)

    # Rich GBA Architectural Palettes
    ROOF_HI    = [244, 126, 92, 255]   # Scalloped terracotta highlight
    ROOF_LIGHT = [224, 92, 64, 255]    # Primary terracotta tile
    ROOF_MID   = [186, 62, 42, 255]    # Terracotta midtone
    ROOF_DARK  = [140, 40, 26, 255]    # Ridge shadow
    ROOF_DEEP  = [92, 24, 16, 255]     # Under-eave occlusion shadow

    TIMBER_HI   = [128, 84, 52, 255]
    TIMBER_MID  = [92, 56, 32, 255]    # Dark Tudor timber beam
    TIMBER_DARK = [60, 34, 18, 255]

    WALL_HI    = [254, 250, 240, 255]  # Warm sunlit stucco
    WALL_MID   = [244, 236, 222, 255]  # Cream stucco
    WALL_SHADE = [218, 206, 188, 255]  # Ambient stucco shade
    WALL_DARK  = [184, 170, 150, 255]  # Deep eave wall shadow

    STONE_HI   = [196, 204, 214, 255]  # Ashlar plinth highlight
    STONE_MID  = [152, 162, 176, 255]  # Ashlar stone
    STONE_SHD  = [108, 118, 132, 255]  # Shadow mortar
    STONE_DARK = [70, 78, 90, 255]     # Dark outline

    GLASS_HI   = [190, 225, 255, 255]  # Sun reflection on window
    GLASS_MID  = [96, 165, 245, 255]   # Sky reflection
    GLASS_DEEP = [38, 98, 180, 255]    # Deep interior shadow

    DOOR_LIGHT = [148, 88, 48, 255]
    DOOR_MID   = [112, 62, 32, 255]
    DOOR_DARK  = [76, 38, 18, 255]
    BRASS_GOLD = [245, 195, 45, 255]

    # --- Architectural Layout ---
    # House bounds: x = 12..180 (168px wide), y = 6..156 (150px tall)
    # Left hipped section: x = 12..92 (80px wide)
    # Right gable section: x = 92..180 (88px wide)

    # 1. STONE CHIMNEY (on right ridge at x = 152..168, y = 6..38)
    CHIMNEY_X, CHIMNEY_Y = 152, 6
    # Chimney cap
    c.fill_rect(CHIMNEY_X - 2, CHIMNEY_Y, 20, 5, STONE_MID)
    c.fill_rect(CHIMNEY_X - 1, CHIMNEY_Y, 18, 2, STONE_HI)
    c.fill_rect(CHIMNEY_X - 2, CHIMNEY_Y + 4, 20, 1, STONE_DARK)
    # Chimney flue opening
    c.fill_rect(CHIMNEY_X + 2, CHIMNEY_Y + 1, 12, 2, [35, 40, 48, 255])
    # Chimney shaft
    c.fill_rect(CHIMNEY_X, CHIMNEY_Y + 5, 16, 32, STONE_MID)
    c.fill_rect(CHIMNEY_X, CHIMNEY_Y + 5, 4, 32, STONE_HI)
    c.fill_rect(CHIMNEY_X + 12, CHIMNEY_Y + 5, 4, 32, STONE_SHD)
    # Stone brick grooves
    for by in range(CHIMNEY_Y + 10, CHIMNEY_Y + 36, 6):
        c.fill_rect(CHIMNEY_X, by, 16, 1, STONE_DARK)

    # 2. MAIN ROOF STRUCTURE
    # Left roof: hipped slope from ridge y=16 down to eave y=64
    for y in range(16, 64):
        # Left hip angle
        left_x = int(12 + max(0, (64 - y) * 0.45))
        right_x = 100
        for x in range(left_x, right_x):
            # Terracotta tile ridges (scallop bands every 6 pixels)
            tile_row = (y - 16) % 6
            if tile_row == 0:
                col = ROOF_HI
            elif tile_row == 1:
                col = ROOF_LIGHT
            elif tile_row in (2, 3, 4):
                col = ROOF_MID
            else:
                col = ROOF_DARK
            # Horizontal tile scallop texture
            if (x + y * 2) % 8 == 0:
                col = ROOF_DARK
            c.set_pixel(x, y, col)

    # Left Dormer Window (centered at x = 46, y = 28..56)
    DORMER_X = 36
    # Dormer gable roof
    for dy in range(0, 14):
        hw = int(dy * 1.1)
        c.fill_rect(DORMER_X + 10 - hw, 26 + dy, hw * 2, 1, ROOF_MID)
        c.set_pixel(DORMER_X + 10 - hw, 26 + dy, TIMBER_MID)
        c.set_pixel(DORMER_X + 10 + hw - 1, 26 + dy, TIMBER_MID)
    # Dormer wall face
    c.fill_rect(DORMER_X + 2, 40, 16, 18, WALL_MID)
    # Dormer window
    c.fill_rect(DORMER_X + 5, 42, 10, 12, GLASS_DEEP)
    c.fill_rect(DORMER_X + 6, 43, 8, 10, GLASS_MID)
    c.fill_rect(DORMER_X + 7, 44, 2, 6, GLASS_HI)
    # Window mullion
    c.fill_rect(DORMER_X + 9, 42, 1, 12, [255, 255, 255, 255])
    # Dormer wooden flowerbox with flowers
    c.fill_rect(DORMER_X + 3, 53, 14, 5, TIMBER_DARK)
    c.fill_rect(DORMER_X + 4, 54, 12, 3, TIMBER_MID)
    # Flowers
    for fx in range(DORMER_X + 4, DORMER_X + 16, 3):
        c.set_pixel(fx, 52, [240, 90, 150, 255])
        c.set_pixel(fx + 1, 52, [255, 180, 210, 255])
        c.set_pixel(fx, 53, [50, 140, 60, 255])

    # Right Gable Roof: Large triangular front-facing A-frame
    # Peak at (136, 12), sloping down to eave at (92, 68) and (180, 68)
    GABLE_PEAK_X = 136
    GABLE_PEAK_Y = 10
    for y in range(GABLE_PEAK_Y, 70):
        half_w = int((y - GABLE_PEAK_Y) * 0.76)
        gx1 = max(92, GABLE_PEAK_X - half_w)
        gx2 = min(180, GABLE_PEAK_X + half_w)
        # Bargeboard timber edge
        c.set_pixel(gx1, y, TIMBER_DARK)
        c.set_pixel(gx1 + 1, y, TIMBER_MID)
        c.set_pixel(gx2 - 1, y, TIMBER_MID)
        c.set_pixel(gx2, y, TIMBER_DARK)
        # Inside gable
        for x in range(gx1 + 2, gx2 - 1):
            if y < 40:
                # Upper roof tile surface
                tile_row = (y - GABLE_PEAK_Y) % 5
                if tile_row == 0:
                    c.set_pixel(x, y, ROOF_HI)
                elif tile_row == 1:
                    c.set_pixel(x, y, ROOF_LIGHT)
                else:
                    c.set_pixel(x, y, ROOF_MID)
            else:
                # Gable wall face (cream stucco)
                c.set_pixel(x, y, WALL_MID)

    # Half-timbered cross trussing inside Gable Face (y = 28..50)
    # Vertical timber post down center
    c.fill_rect(GABLE_PEAK_X - 1, 24, 3, 24, TIMBER_MID)
    # Diagonal truss struts
    c.draw_line(GABLE_PEAK_X - 22, 46, GABLE_PEAK_X - 2, 26, TIMBER_MID)
    c.draw_line(GABLE_PEAK_X + 22, 46, GABLE_PEAK_X + 2, 26, TIMBER_MID)
    # Horizontal collar tie beam
    c.fill_rect(GABLE_PEAK_X - 24, 46, 49, 3, TIMBER_MID)

    # 2F Double Casement Window in Right Gable (x = 120..152, y = 50..68)
    WIN2_X = 122
    WIN2_Y = 48
    c.fill_rect(WIN2_X, WIN2_Y, 28, 18, TIMBER_DARK)
    c.fill_rect(WIN2_X + 1, WIN2_Y + 1, 26, 16, [240, 244, 250, 255]) # White frame
    # Left pane
    c.fill_rect(WIN2_X + 3, WIN2_Y + 3, 10, 12, GLASS_DEEP)
    c.fill_rect(WIN2_X + 4, WIN2_Y + 4, 8, 10, GLASS_MID)
    c.fill_rect(WIN2_X + 5, WIN2_Y + 5, 2, 6, GLASS_HI)
    # Right pane
    c.fill_rect(WIN2_X + 15, WIN2_Y + 3, 10, 12, GLASS_DEEP)
    c.fill_rect(WIN2_X + 16, WIN2_Y + 4, 8, 10, GLASS_MID)
    c.fill_rect(WIN2_X + 17, WIN2_Y + 5, 2, 6, GLASS_HI)
    # Flowerbox under 2F window
    c.fill_rect(WIN2_X - 1, WIN2_Y + 17, 30, 6, TIMBER_DARK)
    c.fill_rect(WIN2_X, WIN2_Y + 18, 28, 4, TIMBER_MID)
    # Overflowing colorful flowers
    for fx in range(WIN2_X, WIN2_X + 28, 3):
        col = [245, 80, 140, 255] if fx % 2 == 0 else [250, 200, 60, 255]
        c.set_pixel(fx, WIN2_Y + 16, col)
        c.set_pixel(fx + 1, WIN2_Y + 16, [255, 255, 255, 255])
        c.set_pixel(fx, WIN2_Y + 17, [40, 130, 50, 255])

    # 3. HORIZONTAL TIMBER BEAM & EAVE SHADOW (between roof and 1F, y = 68..74)
    for x in range(18, 174):
        c.set_pixel(x, 68, ROOF_DEEP)
        c.set_pixel(x, 69, TIMBER_DARK)
        c.set_pixel(x, 70, TIMBER_MID)
        c.set_pixel(x, 71, TIMBER_MID)
        c.set_pixel(x, 72, WALL_DARK)
        c.set_pixel(x, 73, WALL_SHADE)

    # 4. GROUND FLOOR (1F) WALLS (y = 74..134)
    # Fill cream stucco with vertical corner timbers
    for y in range(74, 134):
        for x in range(20, 172):
            c.set_pixel(x, y, WALL_MID)
        # Left corner timber post
        c.fill_rect(20, y, 4, 1, TIMBER_MID)
        c.set_pixel(20, y, TIMBER_DARK)
        # Right corner timber post
        c.fill_rect(168, y, 4, 1, TIMBER_MID)
        c.set_pixel(171, y, TIMBER_DARK)
        # Mid-wall timber division
        c.fill_rect(96, y, 3, 1, TIMBER_MID)

    # Ground Floor Left Window (x = 36..56, y = 86..106)
    W1_X, W1_Y = 36, 86
    c.fill_rect(W1_X, W1_Y, 20, 18, TIMBER_DARK)
    c.fill_rect(W1_X + 1, W1_Y + 1, 18, 16, [250, 250, 250, 255])
    c.fill_rect(W1_X + 3, W1_Y + 3, 14, 12, GLASS_DEEP)
    c.fill_rect(W1_X + 4, W1_Y + 4, 12, 10, GLASS_MID)
    c.fill_rect(W1_X + 5, W1_Y + 5, 3, 6, GLASS_HI)
    # Mullion cross
    c.fill_rect(W1_X + 9, W1_Y + 3, 2, 12, [250, 250, 250, 255])
    c.fill_rect(W1_X + 3, W1_Y + 8, 14, 2, [250, 250, 250, 255])
    # Flowerbox
    c.fill_rect(W1_X - 1, W1_Y + 18, 22, 6, TIMBER_DARK)
    c.fill_rect(W1_X, W1_Y + 19, 20, 4, TIMBER_MID)
    for fx in range(W1_X, W1_X + 20, 3):
        c.set_pixel(fx, W1_Y + 17, [240, 70, 90, 255])
        c.set_pixel(fx + 1, W1_Y + 17, [255, 170, 190, 255])
        c.set_pixel(fx, W1_Y + 18, [45, 130, 55, 255])

    # Ground Floor Right Window (x = 130..150, y = 86..106)
    W2_X, W2_Y = 132, 86
    c.fill_rect(W2_X, W2_Y, 20, 18, TIMBER_DARK)
    c.fill_rect(W2_X + 1, W2_Y + 1, 18, 16, [250, 250, 250, 255])
    c.fill_rect(W2_X + 3, W2_Y + 3, 14, 12, GLASS_DEEP)
    c.fill_rect(W2_X + 4, W2_Y + 4, 12, 10, GLASS_MID)
    c.fill_rect(W2_X + 5, W2_Y + 5, 3, 6, GLASS_HI)
    c.fill_rect(W2_X + 9, W2_Y + 3, 2, 12, [250, 250, 250, 255])
    c.fill_rect(W2_X + 3, W2_Y + 8, 14, 2, [250, 250, 250, 255])
    c.fill_rect(W2_X - 1, W2_Y + 18, 22, 6, TIMBER_DARK)
    c.fill_rect(W2_X, W2_Y + 19, 20, 4, TIMBER_MID)
    for fx in range(W2_X, W2_X + 20, 3):
        c.set_pixel(fx, W2_Y + 17, [245, 180, 50, 255])
        c.set_pixel(fx + 1, W2_Y + 17, [255, 240, 160, 255])
        c.set_pixel(fx, W2_Y + 18, [45, 130, 55, 255])

    # 5. FRONT ENTRANCEWAY & PORCH (centered at x = 74..118, y = 78..148)
    PORCH_CX = 96
    # Gabled Porch Canopy Roof (y = 76..88)
    for py in range(76, 88):
        pw = int((py - 76) * 1.5)
        c.fill_rect(PORCH_CX - pw, py, pw * 2, 1, ROOF_MID)
        c.set_pixel(PORCH_CX - pw, py, TIMBER_DARK)
        c.set_pixel(PORCH_CX + pw - 1, py, TIMBER_DARK)
    c.fill_rect(PORCH_CX - 18, 87, 36, 2, TIMBER_DARK)

    # Glowing Iron Wall Lantern (x = 94..98, y = 88..96)
    c.fill_rect(95, 89, 3, 7, [254, 220, 80, 255]) # Warm glow
    c.set_pixel(96, 92, [255, 255, 230, 255])      # Center bright point
    c.fill_rect(94, 88, 5, 1, [40, 35, 45, 255])   # Iron cap
    c.fill_rect(94, 96, 5, 1, [40, 35, 45, 255])   # Iron base
    # Ambient lantern light spill on stucco
    for ly in range(86, 99):
        for lx in range(90, 103):
            ld = math.hypot(lx - 96, ly - 92)
            if ld < 6 and c.pixels[ly * width + lx] == WALL_MID:
                c.set_pixel(lx, ly, [255, 246, 200, 255])

    # Stone Arch Doorway Surround (x = 82..110, y = 96..144)
    c.fill_rect(82, 96, 28, 48, STONE_MID)
    # Carved stone voussoirs / arch
    for ay in range(96, 144):
        c.set_pixel(82, ay, STONE_HI)
        c.set_pixel(83, ay, STONE_MID)
        c.set_pixel(108, ay, STONE_SHD)
        c.set_pixel(109, ay, STONE_DARK)
        if (ay - 96) % 8 == 0:
            c.draw_line(82, ay, 86, ay, STONE_DARK)
            c.draw_line(105, ay, 109, ay, STONE_DARK)

    # Oak Front Door (x = 86..105, y = 100..144, 20x44 px)
    DOOR_X = 86
    DOOR_Y = 100
    c.fill_rect(DOOR_X, DOOR_Y, 20, 44, DOOR_MID)
    # Recessed panels (6 panels)
    panel_rects = [
        (DOOR_X + 2, DOOR_Y + 3, 6, 10), (DOOR_X + 11, DOOR_Y + 3, 6, 10),
        (DOOR_X + 2, DOOR_Y + 16, 6, 10), (DOOR_X + 11, DOOR_Y + 16, 6, 10),
        (DOOR_X + 2, DOOR_Y + 29, 6, 11), (DOOR_X + 11, DOOR_Y + 29, 6, 11),
    ]
    for px, py, pw, ph in panel_rects:
        c.fill_rect(px, py, pw, ph, DOOR_DARK)
        c.draw_line(px, py, px + pw - 1, py, DOOR_LIGHT)
        c.draw_line(px, py, px, py + ph - 1, DOOR_LIGHT)

    # Brass Polished Doorknob (at x = 88, y = 122)
    c.set_pixel(88, 122, BRASS_GOLD)
    c.set_pixel(89, 122, [255, 235, 120, 255])
    c.set_pixel(88, 123, [160, 110, 20, 255])

    # 6. ASHLAR MASONRY FOUNDATION PLINTH (y = 134..152)
    for y in range(134, 152):
        for x in range(18, 174):
            # Skip door opening
            if 82 <= x <= 109 and y < 144:
                continue
            c.set_pixel(x, y, STONE_MID)
            # Ashlar block bevels
            if y == 134:
                c.set_pixel(x, y, STONE_HI)
            elif y == 151:
                c.set_pixel(x, y, STONE_DARK)
            # Vertical mortar grooves
            if y > 134:
                row_block = (y - 134) // 6
                shift = (row_block % 2) * 16
                if (x + shift) % 32 == 0:
                    c.set_pixel(x, y, STONE_DARK)

    # Porch Stone Steps (x = 80..112, y = 144..156)
    # Step 1
    c.fill_rect(82, 144, 28, 6, STONE_MID)
    c.fill_rect(82, 144, 28, 2, STONE_HI)
    c.fill_rect(82, 149, 28, 1, STONE_DARK)
    # Step 2
    c.fill_rect(80, 150, 32, 6, STONE_MID)
    c.fill_rect(80, 150, 32, 2, STONE_HI)
    c.fill_rect(80, 155, 32, 1, STONE_DARK)

    save_png("assets/tilesets/buildings/hero_house.png", width, height, c.pixels)


# ==============================================================================
# 4. GBA TRAINER PLAYER SPRITESHEET (96x192 = 3 cols x 4 rows of 32x48)
# ==============================================================================
def make_player():
    width = 96
    height = 192
    c = Canvas(width, height)

    SKIN_HI   = [255, 224, 192, 255]
    SKIN_MID  = [240, 190, 152, 255]
    SKIN_SHD  = [204, 148, 112, 255]

    CAP_RED_HI  = [240, 72, 60, 255]
    CAP_RED_MID = [210, 42, 36, 255]
    CAP_RED_SHD = [150, 24, 24, 255]
    CAP_WHITE   = [250, 252, 255, 255]

    HAIR_MID  = [64, 42, 28, 255]
    HAIR_DARK = [40, 24, 14, 255]

    VEST_RED   = [210, 42, 36, 255]
    SHIRT_BLK  = [36, 40, 52, 255]
    PANTS_BLUE = [48, 86, 156, 255]
    PANTS_SHD  = [32, 58, 108, 255]
    SHOE_RED   = [200, 38, 38, 255]
    SHOE_WHITE = [245, 248, 252, 255]

    def draw_trainer_sprite(base_x, base_y, direction, frame):
        # direction: 0=down, 1=up, 2=left, 3=right
        # frame: 0=walk1, 1=idle, 2=walk2
        cx = base_x + 16
        head_y = base_y + 10

        # Step leg offsets for walk cycle
        leg_l_off = 0
        leg_r_off = 0
        body_bob = 0
        if frame == 0: # Walk 1
            leg_l_off = -2
            leg_r_off = 2
            body_bob = -1
        elif frame == 2: # Walk 2
            leg_l_off = 2
            leg_r_off = -2
            body_bob = -1

        cy = head_y + body_bob

        if direction == 0: # DOWN
            # Hair back
            c.fill_rect(cx - 7, cy + 2, 14, 8, HAIR_DARK)
            # Cap crown
            c.fill_rect(cx - 6, cy - 6, 12, 8, CAP_RED_MID)
            c.fill_rect(cx - 5, cy - 7, 10, 2, CAP_RED_HI)
            # Cap white front emblem
            c.fill_rect(cx - 3, cy - 4, 6, 4, CAP_WHITE)
            # Cap visor
            c.fill_rect(cx - 7, cy + 1, 14, 3, CAP_WHITE)
            # Face
            c.fill_rect(cx - 5, cy + 4, 10, 7, SKIN_MID)
            c.set_pixel(cx - 3, cy + 6, [30, 30, 35, 255]) # Left eye
            c.set_pixel(cx + 2, cy + 6, [30, 30, 35, 255]) # Right eye
            c.set_pixel(cx, cy + 9, SKIN_SHD)              # Mouth

            # Body / Vest
            by = cy + 12
            c.fill_rect(cx - 6, by, 12, 10, VEST_RED)
            c.fill_rect(cx - 2, by, 4, 10, SHIRT_BLK)
            # Arms
            c.fill_rect(cx - 8, by + 1, 2, 8, SKIN_MID)
            c.fill_rect(cx + 6, by + 1, 2, 8, SKIN_MID)

            # Pants
            py = by + 10
            c.fill_rect(cx - 5, py, 4, 10 + leg_l_off, PANTS_BLUE)
            c.fill_rect(cx + 1, py, 4, 10 + leg_r_off, PANTS_BLUE)

            # Shoes
            sy_l = py + 10 + leg_l_off
            sy_r = py + 10 + leg_r_off
            c.fill_rect(cx - 6, sy_l, 5, 3, SHOE_RED)
            c.fill_rect(cx - 6, sy_l + 3, 5, 1, SHOE_WHITE)
            c.fill_rect(cx + 1, sy_r, 5, 3, SHOE_RED)
            c.fill_rect(cx + 1, sy_r + 3, 5, 1, SHOE_WHITE)

        elif direction == 1: # UP
            # Cap back
            c.fill_rect(cx - 6, cy - 6, 12, 9, CAP_RED_MID)
            c.fill_rect(cx - 5, cy - 7, 10, 2, CAP_RED_HI)
            # Hair back & nape
            c.fill_rect(cx - 7, cy + 3, 14, 9, HAIR_MID)
            c.fill_rect(cx - 6, cy + 11, 12, 2, HAIR_DARK)

            # Back of Vest & Backpack
            by = cy + 12
            c.fill_rect(cx - 6, by, 12, 10, VEST_RED)
            # Yellow backpack
            c.fill_rect(cx - 4, by + 1, 8, 9, [235, 180, 40, 255])
            c.fill_rect(cx - 3, by + 2, 6, 7, [250, 210, 60, 255])
            # Arms
            c.fill_rect(cx - 8, by + 1, 2, 8, SKIN_MID)
            c.fill_rect(cx + 6, by + 1, 2, 8, SKIN_MID)

            # Pants
            py = by + 10
            c.fill_rect(cx - 5, py, 4, 10 + leg_l_off, PANTS_BLUE)
            c.fill_rect(cx + 1, py, 4, 10 + leg_r_off, PANTS_BLUE)

            # Shoes
            sy_l = py + 10 + leg_l_off
            sy_r = py + 10 + leg_r_off
            c.fill_rect(cx - 5, sy_l, 4, 3, SHOE_RED)
            c.fill_rect(cx - 5, sy_l + 3, 4, 1, SHOE_WHITE)
            c.fill_rect(cx + 1, sy_r, 4, 3, SHOE_RED)
            c.fill_rect(cx + 1, sy_r + 3, 4, 1, SHOE_WHITE)

        elif direction == 2: # LEFT
            # Cap turned left with visor pointing left
            c.fill_rect(cx - 4, cy - 6, 10, 8, CAP_RED_MID)
            c.fill_rect(cx - 3, cy - 7, 8, 2, CAP_RED_HI)
            c.fill_rect(cx - 8, cy, 6, 3, CAP_WHITE) # Visor left
            # Face profile left
            c.fill_rect(cx - 5, cy + 3, 8, 8, SKIN_MID)
            c.set_pixel(cx - 4, cy + 5, [30, 30, 35, 255])
            # Hair back
            c.fill_rect(cx + 1, cy + 2, 5, 10, HAIR_DARK)

            # Vest profile
            by = cy + 12
            c.fill_rect(cx - 4, by, 8, 10, VEST_RED)
            c.fill_rect(cx - 2, by + 2, 4, 7, [235, 180, 40, 255]) # Backpack side
            # Arm
            arm_swing = leg_l_off * -1
            c.fill_rect(cx - 3 + arm_swing, by + 2, 3, 8, SKIN_MID)

            # Pants
            py = by + 10
            c.fill_rect(cx - 3 + leg_l_off, py, 4, 10, PANTS_BLUE)
            c.fill_rect(cx - 1 + leg_r_off, py, 4, 10, PANTS_SHD)

            # Shoes
            c.fill_rect(cx - 5 + leg_l_off, py + 10, 6, 3, SHOE_RED)
            c.fill_rect(cx - 5 + leg_l_off, py + 13, 6, 1, SHOE_WHITE)

        elif direction == 3: # RIGHT
            # Cap turned right with visor pointing right
            c.fill_rect(cx - 6, cy - 6, 10, 8, CAP_RED_MID)
            c.fill_rect(cx - 5, cy - 7, 8, 2, CAP_RED_HI)
            c.fill_rect(cx + 2, cy, 6, 3, CAP_WHITE) # Visor right
            # Face profile right
            c.fill_rect(cx - 3, cy + 3, 8, 8, SKIN_MID)
            c.set_pixel(cx + 3, cy + 5, [30, 30, 35, 255])
            # Hair back
            c.fill_rect(cx - 6, cy + 2, 5, 10, HAIR_DARK)

            # Vest profile
            by = cy + 12
            c.fill_rect(cx - 4, by, 8, 10, VEST_RED)
            c.fill_rect(cx - 2, by + 2, 4, 7, [235, 180, 40, 255]) # Backpack side
            # Arm
            arm_swing = leg_r_off * -1
            c.fill_rect(cx + arm_swing, by + 2, 3, 8, SKIN_MID)

            # Pants
            py = by + 10
            c.fill_rect(cx - 1 + leg_l_off, py, 4, 10, PANTS_BLUE)
            c.fill_rect(cx - 3 + leg_r_off, py, 4, 10, PANTS_SHD)

            # Shoes
            c.fill_rect(cx - 1 + leg_r_off, py + 10, 6, 3, SHOE_RED)
            c.fill_rect(cx - 1 + leg_r_off, py + 13, 6, 1, SHOE_WHITE)

    # Render 4 directions x 3 frames
    directions = [0, 1, 2, 3] # down, up, left, right
    for dir_idx in directions:
        for frame in range(3):
            draw_trainer_sprite(frame * 32, dir_idx * 48, dir_idx, frame)

    save_png("assets/characters/player.png", width, height, c.pixels)


if __name__ == "__main__":
    make_terrain()
    make_nature()
    make_hero_house()
    make_player()
    print("All HD GBA assets generated successfully!")

