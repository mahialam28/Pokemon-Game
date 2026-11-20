import fs from 'fs';

// Verify that all tiles are valid
export function validatePixelMap(name, rows, pal) {
  if (!Array.isArray(rows)) throw new Error(`${name} is not an array`);
  if (rows.length !== 16) throw new Error(`${name} has ${rows.length} rows, expected 16`);
  for (let r = 0; r < 16; r++) {
    const line = rows[r];
    if (typeof line !== 'string') throw new Error(`${name} row ${r} is not a string`);
    if (line.length !== 16) throw new Error(`${name} row ${r} has length ${line.length}, expected 16: "${line}"`);
    for (let c = 0; c < 16; c++) {
      const ch = line[c];
      if (ch === '.' || ch === ' ') continue;
      if (pal[ch] === undefined) throw new Error(`${name} contains unknown char '${ch}' at (${c}, ${r}) in row "${line}"`);
    }
  }
}

