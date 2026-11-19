/**
 * HD-2D Lighting, Bloom & Atmosphere Renderer.
 * Uses a dedicated offscreen lighting canvas for:
 * - Configurable time-of-day ambient tint ('morning' golden sunlight by default)
 * - Diagonal morning window sunbeams indoors & warm sun shafts outdoors
 * - Additive radial glows on lamps, PC/TV screens, lab machines, windows & Poké Balls
 * - Subtle atmospheric screen-edge vignette
 */

import { STARTERS } from '../data/starters.js';
import { gameState } from '../state.js';
import { TILE_SIZE } from './tiles.js';

export const LIGHTING_CONFIG = {
  /** 'morning' (default warm golden light) | 'day' | 'sunset' | 'night' */
  timeOfDay: 'morning',
};

const TIME_PRESETS = {
  morning: {
    outdoorMultiply: '#FFF1D6', // Warm golden morning light
    outdoorSunTint: 'rgba(255, 224, 150, 0.11)',
    indoorMultiply: '#EDE2D4',
    labMultiply: '#E6F0F8',
  },
  day: {
    outdoorMultiply: '#FFFFFF',
    outdoorSunTint: 'rgba(255, 250, 225, 0.06)',
    indoorMultiply: '#F2ECE4',
    labMultiply: '#EEF5FA',
  },
  sunset: {
    outdoorMultiply: '#F2B892',
    outdoorSunTint: 'rgba(255, 148, 86, 0.16)',
    indoorMultiply: '#DFC4B2',
    labMultiply: '#D8DEE8',
  },
  night: {
    outdoorMultiply: '#6A7AA8',
    outdoorSunTint: 'rgba(90, 120, 200, 0.08)',
    indoorMultiply: '#B8B8CE',
    labMultiply: '#B6C8DF',
  },
};

export class LightingEngine {
  constructor(width = 480, height = 270) {
    this.w = width;
    this.h = height;

    // Offscreen multiply ambient canvas
    this.lightCanvas = document.createElement('canvas');
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
    this.lctx = this.lightCanvas.getContext('2d');

    // Pre-rendered subtle vignette canvas (built once for zero per-frame cost)
    this.vignetteCanvas = this._buildVignetteCanvas(width, height);
  }

  _buildVignetteCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const vctx = c.getContext('2d');
    const grad = vctx.createRadialGradient(
      w * 0.5,
      h * 0.48,
      Math.min(w, h) * 0.42,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.66
    );
    grad.addColorStop(0, 'rgba(10, 12, 22, 0)');
    grad.addColorStop(0.7, 'rgba(10, 12, 22, 0.08)');
    grad.addColorStop(1, 'rgba(8, 10, 20, 0.34)');
    vctx.fillStyle = grad;
    vctx.fillRect(0, 0, w, h);
    return c;
  }

  /**
   * Render the lighting, light beams, bloom halos, and vignette directly over the
   * 480x270 viewport given the current world-space camera offset & 2x zoom.
   */
  render(ctx, map, camX, camY, zoom, tick) {
    const preset = TIME_PRESETS[LIGHTING_CONFIG.timeOfDay] || TIME_PRESETS.morning;
    const toScreenX = (tileX) => (tileX * TILE_SIZE - camX) * zoom;
    const toScreenY = (tileY) => (tileY * TILE_SIZE - camY) * zoom;

    // -----------------------------------------------------------------------
    // 1. MULTIPLY AMBIENT PASS (offscreen canvas -> multiply onto main canvas)
    // -----------------------------------------------------------------------
    const lctx = this.lctx;
    lctx.globalCompositeOperation = 'source-over';
    if (!map.isIndoor) {
      lctx.fillStyle = preset.outdoorMultiply;
    } else if (map.id === 'lab') {
      lctx.fillStyle = preset.labMultiply;
    } else {
      lctx.fillStyle = preset.indoorMultiply;
    }
    lctx.fillRect(0, 0, this.w, this.h);

    // Brighten ambient around local light sources so lamps/windows pierce indoor shade
    lctx.globalCompositeOperation = 'lighter';
    for (const light of map.lights || []) {
      const sx = toScreenX(light.x);
      const sy = toScreenY(light.y);
      const r = light.radius * zoom;
      const g = lctx.createRadialGradient(sx, sy, 2, sx, sy, r);
      const [cr, cg, cb] = light.color;
      g.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.55)`);
      g.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      lctx.fillStyle = g;
      lctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.lightCanvas, 0, 0);
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. ADDITIVE BLOOM, WINDOW SUNBEAMS & RADIAL GLOWS
    // -----------------------------------------------------------------------
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Warm morning sun wash in top-left corner outdoors
    if (!map.isIndoor) {
      const sunGrad = ctx.createRadialGradient(54, 18, 12, 70, 30, 340);
      sunGrad.addColorStop(0, preset.outdoorSunTint);
      sunGrad.addColorStop(1, 'rgba(255, 224, 150, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    for (const light of map.lights || []) {
      const sx = toScreenX(light.x);
      const sy = toScreenY(light.y);
      const [cr, cg, cb] = light.color;

      // Subtle dynamic flicker / breathing per light source type
      let pulse = 1;
      if (light.type === 'tv') {
        pulse = 0.85 + Math.sin(tick * 0.27) * 0.1 + Math.sin(tick * 0.63) * 0.08;
      } else if (light.type === 'lab' || light.type === 'pc') {
        pulse = 0.9 + Math.sin(tick * 0.09) * 0.12;
      } else if (light.type === 'lamp') {
        pulse = 0.96 + Math.sin(tick * 0.05) * 0.04;
      }

      const alpha = light.intensity * pulse;

      // Diagonal sunbeam shaft streaming down from indoor windows
      if (light.type === 'windowBeam') {
        ctx.save();
        const beamGrad = ctx.createLinearGradient(sx, sy, sx + 26 * zoom, sy + 52 * zoom);
        beamGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${(alpha * 0.58).toFixed(3)})`);
        beamGrad.addColorStop(0.65, `rgba(${cr}, ${cg}, ${cb}, ${(alpha * 0.22).toFixed(3)})`);
        beamGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(sx - 7 * zoom, sy);
        ctx.lineTo(sx + 7 * zoom, sy);
        ctx.lineTo(sx + 28 * zoom, sy + 54 * zoom);
        ctx.lineTo(sx + 2 * zoom, sy + 54 * zoom);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Soft radial bloom halo
      const r = light.radius * zoom * 0.85;
      const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, r);
      grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${(alpha * 0.65).toFixed(3)})`);
      grad.addColorStop(0.45, `rgba(${cr}, ${cg}, ${cb}, ${(alpha * 0.22).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    }

    // Subtle radiant bloom on remaining Poké Balls sitting on the Lab table
    for (const ball of map.pokeballs || []) {
      const starter = STARTERS[ball.starterIndex];
      if (!starter) continue;
      if (gameState.starter && gameState.starter.id === starter.id) continue;
      if (
        gameState.flags.rivalPickedStarter &&
        gameState.rivalStarter &&
        gameState.rivalStarter.id === starter.id
      ) {
        continue;
      }
      const bx = toScreenX(ball.x + 0.5);
      const by = toScreenY(ball.y + 0.4);
      const pulse = 0.72 + Math.sin(tick * 0.08 + ball.starterIndex * 1.6) * 0.28;
      const r = 16 * zoom;
      const grad = ctx.createRadialGradient(bx, by, 1, bx, by, r);
      grad.addColorStop(0, `rgba(255, 246, 210, ${(0.34 * pulse).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(255, 224, 150, ${(0.14 * pulse).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(255, 224, 150, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - r, by - r, r * 2, r * 2);
    }

    ctx.restore();

    // -----------------------------------------------------------------------
    // 3. SUBTLE SCREEN-EDGE VIGNETTE
    // -----------------------------------------------------------------------
    ctx.drawImage(this.vignetteCanvas, 0, 0);
  }
}
