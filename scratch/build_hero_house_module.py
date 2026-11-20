#!/usr/bin/env python3
"""
Generates src/world/heroHouseTiles.js with full GBA FireRed-quality pixel art
for Stage 1: Main Character House (Exterior, Ground Floor 1F, Second Floor 2F).
All pixel maps are strictly 16x16 and validated against PAL_HERO_EXT and PAL_HERO_INT.
"""

import sys

PAL_HERO_EXT = {
    '0': '#1A0C08', '1': '#3A1410', '2': '#681E16', '3': '#A83222', '4': '#DC4A32', '5': '#F27254', '6': '#FFA288',
    'd': '#1E120A', 'D': '#3E2416', 'b': '#683E26', 'B': '#9C623E', 'y': '#D8A820', 'Y': '#FFE068',
    'w': '#2A2622', 'W': '#FFFDF8', 'e': '#F8F2E6', 'E': '#E4DAC8',
    's': '#1C1E22', 'S': '#363C46', 'm': '#5E6674', 'M': '#8E98A8', 'l': '#D4DCE8',
    'c': '#16283C', 'C': '#2E5478', 'k': '#5088B8', 'K': '#8CC8F0',
    'g': '#143818', 'G': '#2C682C', 'h': '#50A844', 'H': '#84D870',
    'p': '#9E1840', 'P': '#E03C6C', 'f': '#FF78A0', 'o': '#FFFFFF', 'j': '#F0B820',
    'r': '#600C0C', 'R': '#CC2020', 'a': '#F05050',
    't': '#484440', 'T': '#D8D4D0',
    'z': '#444040', 'Z': '#747070', 'x': '#A4A0A0', 'X': '#D4D0D0',
    '.': None
}

PAL_HERO_INT = {
    '0': '#1C120C', '1': '#54280E', '2': '#7E421A', '3': '#A8602A', '4': '#D28240', '5': '#ECA462', '6': '#FAD094',
    'w': '#2C221A', 'W': '#FFFDF8', 'e': '#FBF6EE', 'E': '#ECE2D2', 'f': '#D8CABE',
    'd': '#180E08', 'D': '#3A2012', 'b': '#663A20', 'B': '#925832', 'q': '#BD7E4C',
    'm': '#1E2430', 'M': '#3E4858', 'i': '#748296', 'I': '#B0C0D4', 'l': '#E6EEF8', 'L': '#FFFFFF',
    'r': '#480E10', 'R': '#801818', 'k': '#BA2626', 'K': '#E44440', 'a': '#F86C64', 'A': '#FFA098',
    'u': '#0C162E', 'U': '#162854', 'c': '#244488', 'C': '#3C6CC0', 'n': '#649CE8', 'N': '#A8CEF8',
    'g': '#0E2412', 'G': '#1C4824', 'h': '#307438', 'H': '#4EA658', 'v': '#78CC82', 'V': '#A8E8B0',
    'y': '#64440C', 'Y': '#B07E18', 'z': '#E8AC24', 'Z': '#FFDA60',
    's': '#081420', 'S': '#142C44', 't': '#20608C', 'T': '#3CAAE8', 'x': '#8EE4FF',
    'p': '#502012', 'P': '#983E22', 'o': '#D46842',
    '.': None
}

def validate(name, rows, pal):
    if len(rows) != 16:
        raise ValueError(f"{name} has {len(rows)} rows, expected 16")
    for r_idx, r in enumerate(rows):
        if len(r) != 16:
            raise ValueError(f"{name} row {r_idx} has {len(r)} chars, expected 16: '{r}'")
        for c_idx, ch in enumerate(r):
            if ch not in pal:
                raise ValueError(f"{name} has unknown char '{ch}' at ({c_idx}, {r_idx})")

print("Validator loaded successfully.")

