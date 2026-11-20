#!/usr/bin/env python3
"""
build_gba_map.py
Builds maps/towns/gba_test.json with the 16x16 classic GBA tilesets.
"""

import json

width = 18
height = 14
tile_size = 16

ground = [1] * (width * height)      # Base grass
paths = [0] * (width * height)
decorations = [0] * (width * height)
buildings = [0] * (width * height)
trees_base = [0] * (width * height)
overhead = [0] * (width * height)
collision = [0] * (width * height)

def idx(x, y):
    return y * width + x

# 1. Ground & Flower patches
for y in range(height):
    for x in range(width):
        # Small flower patches in grass
        if (x * 7 + y * 13) % 11 == 0:
            ground[idx(x, y)] = 2

# 2. Border & Framing Trees (2x3 tiles)
# Tree top: GID 9, 10
# Tree mid: GID 13, 14
# Tree base: GID 17, 18
def place_tree(tx, ty):
    # Top canopy (overhead)
    overhead[idx(tx, ty)] = 9
    overhead[idx(tx + 1, ty)] = 10
    # Mid canopy (overhead)
    overhead[idx(tx, ty + 1)] = 13
    overhead[idx(tx + 1, ty + 1)] = 14
    # Trunk & base (trees_base & solid collision)
    trees_base[idx(tx, ty + 2)] = 17
    trees_base[idx(tx + 1, ty + 2)] = 18
    collision[idx(tx, ty + 2)] = 1
    collision[idx(tx + 1, ty + 2)] = 1

# North trees
for x in [0, 2, 4, 12, 14, 16]:
    place_tree(x, 0)

# West border trees
for y in [3, 6, 9]:
    place_tree(0, y)

# East border trees
for y in [3, 6, 9]:
    place_tree(16, y)

# 3. CLASSIC GBA HOUSE (4x4 tiles at x = 7..10, y = 2..5)
# GID base = 21
# Row 0 (y = 2): Roof Peak (Overhead)
for c in range(4):
    overhead[idx(7 + c, 2)] = 21 + c
    collision[idx(7 + c, 2)] = 1

# Row 1 (y = 3): Roof Eaves (Overhead)
for c in range(4):
    overhead[idx(7 + c, 3)] = 25 + c
    collision[idx(7 + c, 3)] = 1

# Row 2 (y = 4): 1F Upper Wall & Windows (Building)
for c in range(4):
    buildings[idx(7 + c, 4)] = 29 + c
    collision[idx(7 + c, 4)] = 1

# Row 3 (y = 5): 1F Lower Wall & Door (Building)
for c in range(4):
    buildings[idx(7 + c, 5)] = 33 + c
    # Door tiles (c = 1 and c = 2, i.e. x = 8 and x = 9) are walkable entrance!
    if c in (1, 2):
        collision[idx(7 + c, 5)] = 0
    else:
        collision[idx(7 + c, 5)] = 1

# 4. Dirt Pathways
# Vertical path from door (cols 8..9, rows 6..12)
for y in range(6, 13):
    paths[idx(8, y)] = 4 # Left border dirt
    paths[idx(9, y)] = 5 # Right border dirt

# Horizontal cross path at row 12 (cols 2..15)
for x in range(2, 16):
    paths[idx(x, 12)] = 3 # Plain dirt center

# 5. White Picket Fence along row 8
# Left fence: cols 4..7
decorations[idx(4, 8)] = 19 # Post/corner
decorations[idx(5, 8)] = 15 # Rail
decorations[idx(6, 8)] = 15 # Rail
decorations[idx(7, 8)] = 11 # Post
for x in [4, 5, 6, 7]:
    collision[idx(x, 8)] = 1

# Right fence: cols 10..13
decorations[idx(10, 8)] = 11 # Post
decorations[idx(11, 8)] = 15 # Rail
decorations[idx(12, 8)] = 15 # Rail
decorations[idx(13, 8)] = 19 # Post/corner
for x in [10, 11, 12, 13]:
    collision[idx(x, 8)] = 1

# 6. Props & Decorations
# Mailbox beside path at (7, 7)
decorations[idx(7, 7)] = 12
collision[idx(7, 7)] = 1

# Small round bushes in front yard
decorations[idx(5, 6)] = 20
collision[idx(5, 6)] = 1
decorations[idx(12, 6)] = 20
collision[idx(12, 6)] = 1

# Wooden town sign at path junction (6, 11)
decorations[idx(6, 11)] = 16
collision[idx(6, 11)] = 1

map_data = {
    "width": width,
    "height": height,
    "tilewidth": tile_size,
    "tileheight": tile_size,
    "orientation": "orthogonal",
    "renderorder": "right-down",
    "tilesets": [
        {
            "firstgid": 1,
            "name": "terrain",
            "image": "../../assets/tilesets/gba/terrain.png",
            "imagewidth": 64,
            "imageheight": 32,
            "tilewidth": 16,
            "tileheight": 16,
            "tilecount": 8,
            "columns": 4
        },
        {
            "firstgid": 9,
            "name": "nature",
            "image": "../../assets/tilesets/gba/nature.png",
            "imagewidth": 64,
            "imageheight": 48,
            "tilewidth": 16,
            "tileheight": 16,
            "tilecount": 12,
            "columns": 4
        },
        {
            "firstgid": 21,
            "name": "house",
            "image": "../../assets/tilesets/gba/house.png",
            "imagewidth": 64,
            "imageheight": 64,
            "tilewidth": 16,
            "tileheight": 16,
            "tilecount": 16,
            "columns": 4
        }
    ],
    "layers": [
        {
            "name": "ground",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": ground
        },
        {
            "name": "paths",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": paths
        },
        {
            "name": "decorations",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": decorations
        },
        {
            "name": "buildings",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": buildings
        },
        {
            "name": "trees_base",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": trees_base
        },
        {
            "name": "overhead",
            "type": "tilelayer",
            "visible": True,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": overhead
        },
        {
            "name": "collision",
            "type": "tilelayer",
            "visible": False,
            "opacity": 1.0,
            "width": width,
            "height": height,
            "data": collision
        }
    ]
}

with open("maps/towns/gba_test.json", "w") as f:
    json.dump(map_data, f, indent=2)

print("Generated maps/towns/gba_test.json successfully!")

