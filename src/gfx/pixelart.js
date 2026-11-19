/**
 * Pixel-Map Sprite & Tile Compiler.
 * Turns hand-authored string pixel maps + palette dictionaries into crisp,
 * cached offscreen canvases with zero anti-aliasing, zero gradients, and zero blur.
 *
 * Example:
 *   const canvas = compilePixelMap([
 *     '..00..',
 *     '.0120.',
 *   ], { '.': null, '0': '#183018', '1': '#38a048', '2': '#78d068' });
 */

/**
 * Compile a string-array pixel map and palette into an offscreen HTMLCanvasElement.
 *
 * @param {string[]} rows     Array of equal-length strings (1 char = 1 pixel)
 * @param {Object} palette    Map of single-char key -> CSS hex color (or null/undefined for transparent)
 * @param {object} [options]
 * @param {boolean} [options.flipX=false]    Mirror horizontally
 * @param {HTMLCanvasElement} [options.underlay=null] Draw another canvas underneath first
 * @param {number} [options.offsetX=0]       X offset when compositing onto underlay
 * @param {number} [options.offsetY=0]       Y offset when compositing onto underlay
 * @returns {HTMLCanvasElement}
 */
export function compilePixelMap(
  rows,
  palette,
  { flipX = false, underlay = null, offsetX = 0, offsetY = 0 } = {}
) {
  const height = underlay ? underlay.height : rows.length;
  const width = underlay ? underlay.width : rows[0] ? rows[0].length : 16;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (underlay) {
    ctx.drawImage(underlay, 0, 0);
  }

  for (let y = 0; y < rows.length; y++) {
    const line = rows[y];
    const len = line.length;
    for (let x = 0; x < len; x++) {
      const ch = line[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      const dx = (flipX ? len - 1 - x : x) + offsetX;
      const dy = y + offsetY;
      ctx.fillStyle = color;
      ctx.fillRect(dx, dy, 1, 1);
    }
  }

  return canvas;
}

/**
 * Helper to stamp a small pixel map directly onto an existing 2D canvas context
 * at integer coordinates (ox, oy). Useful for composing multi-part tiles or auto-tiling edges.
 */
export function stampPixelMap(ctx, rows, palette, ox = 0, oy = 0, { flipX = false } = {}) {
  for (let y = 0; y < rows.length; y++) {
    const line = rows[y];
    const len = line.length;
    for (let x = 0; x < len; x++) {
      const ch = line[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      const dx = (flipX ? len - 1 - x : x) + ox;
      const dy = y + oy;
      ctx.fillStyle = color;
      ctx.fillRect(dx, dy, 1, 1);
    }
  }
}

/**
 * Combine multiple compiled layers in order onto a single cached offscreen canvas.
 */
export function composeLayers(width, height, canvases) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (const layer of canvases) {
    if (layer) ctx.drawImage(layer, 0, 0);
  }
  return c;
}
