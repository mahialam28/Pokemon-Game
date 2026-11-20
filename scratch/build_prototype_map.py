#!/usr/bin/env python3
"""
build_prototype_map.py
Creates maps/towns/prototype.json with the updated 6x5 Hero House,
nature decorations, cobblestone pathways, and collision layers.
"""

import json

width = 24
height = 18
tile_size = 32

ground = [1] * (width * height)      # Base grass
paths = [0] * (width * height)
decorations = [0] * (width * height)
buildings = [0] * (width * height)
trees_base = [0] * (width * height)
overhead = [0] * (width * height)
collision = [0] * (width * height)

def idx(x, y):
    return y * width + x

# 1. Ground & Grass Variations
for y in range(height):
    for x in range(width):
        # Subtle sunlight patches
        if (x * 7 + y * 13) % 7 == 0:
            ground[idx(x, y)] = 2
        # Flower patches in open meadows
        elif (x * 11 + y * 17) % 19 == 0:
            ground[idx(x, y)] = 4

# 2. Border Trees (North, West, East)
# Mature Oak Tree: 2x2 tiles. GIDs: top-left=5, top-right=6, bottom-left=9, bottom-right=10
# North border trees (y = 0..1, x = 0..22, step 2)
for x in range(0, width, 2):
    overhead[idx(x, 0)] = 5
    overhead[idx(x + 1, 0)] = 6
    if not (8 <= x <= 14): # Don't block house with tree trunks
        trees_base[idx(x, 1)] = 9
        trees_base[idx(x + 1, 1)] = 10
        collision[idx(x, 1)] = 1
        collision[idx(x + 1, 1)] = 1

# West border trees (x = 0..1, y = 2..16, step 2)
for y in range(2, height - 1, 2):
    overhead[idx(0, y)] = 5
    overhead[idx(1, y)] = 6
    trees_base[idx(0, y + 1)] = 9
    trees_base[idx(1, y + 1)] = 10
    collision[idx(0, y + 1)] = 1
    collision[idx(1, y + 1)] = 1

# East border trees (x = 22..23, y = 2..16, step 2)
for y in range(2, height - 1, 2):
    overhead[idx(22, y)] = 5
    overhead[idx(23, y)] = 6
    trees_base[idx(22, y + 1)] = 9
    trees_base[idx(23, y + 1)] = 10
    collision[idx(22, y + 1)] = 1
    collision[idx(23, y + 1)] = 1

# Flanking mature trees beside house (x = 4..5 and x = 18..19 at y = 1..2)
overhead[idx(4, 1)] = 5
overhead[idx(5, 1)] = 6
trees_base[idx(4, 2)] = 9
trees_base[idx(5, 2)] = 10
collision[idx(4, 2)] = 1
collision[idx(5, 2)] = 1

overhead[idx(18, 1)] = 5
overhead[idx(19, 1)] = 6
trees_base[idx(18, 2)] = 9
trees_base[idx(19, 2)] = 10
collision[idx(18, 2)] = 1
collision[idx(19, 2)] = 1

# 3. HERO HOUSE (6x5 tiles placed at x = 9..14, y = 1..5)
# GID base = 17
# Row 0 (y = 1): Chimney cap & roof peaks (Overhead)
for col in range(6):
    overhead[idx(9 + col, 1)] = 17 + col
    collision[idx(9 + col, 1)] = 1

# Row 1 (y = 2): Roof slope & dormer window (Overhead)
for col in range(6):
    overhead[idx(9 + col, 2)] = 23 + col
    collision[idx(9 + col, 2)] = 1

# Row 2 (y = 3): Roof eaves & porch canopy (Overhead)
for col in range(6):
    overhead[idx(9 + col, 3)] = 29 + col
    collision[idx(9 + col, 3)] = 1

# Row 3 (y = 4): 1F walls, windows, lantern (Building)
for col in range(6):
    buildings[idx(9 + col, 4)] = 35 + col
    collision[idx(9 + col, 4)] = 1

# Row 4 (y = 5): Foundation plinth, oak door & steps (Building)
for col in range(6):
    buildings[idx(9 + col, 5)] = 41 + col
    # Door and steps at col 2 (which is x = 11) is walkable entrance!
    if col == 2:
        collision[idx(9 + col, 5)] = 0
    else:
        collision[idx(9 + col, 5)] = 1

# 4. Cobblestone Pathways
# Path leading south from door (x = 11, y = 6..14)
for y in range(6, 15):
    paths[idx(11, y)] = 3

# Cross path boulevard (x = 3..21, y = 14)
for x in range(3, 21):
    paths[idx(x, 14)] = 3

# 5. Garden Walls and Picket Fence
# Front yard fence along y = 9 (x = 6..10 on left, x = 12..16 on right)
# GID 7 = Picket fence with post
for x in [6, 7, 8, 9, 10]:
    decorations[idx(x, 9)] = 7
    collision[idx(x, 9)] = 1

for x in [12, 13, 14, 15, 16]:
    decorations[idx(x, 9)] = 7
    collision[idx(x, 9)] = 1

# Side garden stone walls (GID 15)
# Left side wall at x = 5, y = 5..8
for y in range(5, 9):
    decorations[idx(5, y)] = 15
    collision[idx(5, y)] = 1

# Right side wall at x = 17, y = 5..8
for y in range(5, 9):
    decorations[idx(17, y)] = 15
    collision[idx(17, y)] = 1

# 6. Garden Plants & Objects
# Red Mailbox (GID 8) at (10, 8)
decorations[idx(10, 8)] = 8
collision[idx(10, 8)] = 1

# Pink Hydrangea bushes (GID 11)
decorations[idx(7, 5)] = 11
collision[idx(7, 5)] = 1
decorations[idx(8, 5)] = 11
collision[idx(8, 5)] = 1
decorations[idx(15, 5)] = 11
collision[idx(15, 5)] = 1

# Topiary Boxwood hedges (GID 12)
decorations[idx(7, 8)] = 12
collision[idx(7, 8)] = 1
decorations[idx(15, 8)] = 12
collision[idx(15, 8)] = 1

# Build JSON structure
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
            "image": "../../assets/tilesets/terrain/terrain.png",
            "imagewidth": 128,
            "imageheight": 32,
            "tilewidth": 32,
            "tileheight": 32,
            "tilecount": 4,
            "columns": 4
        },
        {
            "firstgid": 5,
            "name": "nature",
            "image": "../../assets/tilesets/nature/nature.png",
            "imagewidth": 128,
            "imageheight": 96,
            "tilewidth": 32,
            "tileheight": 32,
            "tilecount": 12,
            "columns": 4
        },
        {
            "firstgid": 17,
            "name": "hero_house",
            "image": "../../assets/tilesets/buildings/hero_house.png",
            "imagewidth": 192,
            "imageheight": 160,
            "tilewidth": 32,
            "tileheight": 32,
            "tilecount": 30,
            "columns": 6
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

with open("maps/towns/prototype.json", "w") as f:
    json.dump(map_data, f, indent=2)

print("Generated maps/towns/prototype.json successfully!")
