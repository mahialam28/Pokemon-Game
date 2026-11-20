/**
 * HD-2D Particles & Ambient Wildlife System:
 * - Outdoors: drifting leaves/petals, fluttering butterflies, chimney smoke wisps,
 *   and perched birds that hop and fly away when the player gets close.
 * - Indoors: floating golden dust motes drifting inside window light beams.
 * - Movement effects: footstep dust puffs on dirt paths, grass rustles in tall grass.
 */

import { audio } from '../audio.js';
import { TILE_SIZE } from './tiles.js';

export class ParticleSystem {
  constructor() {
    this.leaves = [];
    this.butterflies = [];
    this.birds = [];
    this.dustMotes = [];
    this.smoke = [];
    this.fx = []; // Short-lived footstep dust & grass rustle particles
    this.map = null;
    this.tick = 0;
  }

  /** Seed ambient wildlife & particles whenever entering a map. */
  resetForMap(map) {
    this.map = map;
    this.leaves = [];
    this.butterflies = [];
    this.birds = [];
    this.dustMotes = [];
    this.smoke = [];
    this.fx = [];
    this.tick = 0;

    if (!map) return;
    const mapPxW = map.width * TILE_SIZE;
    const mapPxH = map.height * TILE_SIZE;

    if (!map.isIndoor) {
      // Drifting leaves & blossoms
      const leafColors = ['#90DC68', '#F6A8B8', '#FFE488', '#6EC458'];
      for (let i = 0; i < 14; i++) {
        this.leaves.push({
          x: Math.random() * mapPxW,
          y: Math.random() * mapPxH,
          vx: 0.16 + Math.random() * 0.14,
          vy: 0.12 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
          color: leafColors[i % leafColors.length],
          size: 1.5 + (i % 2) * 0.7,
        });
      }

      // Occasional fluttering butterflies near town flower beds
      const bColors = ['#FFE868', '#9CE8FF', '#FFA4C8'];
      for (let i = 0; i < 3; i++) {
        this.butterflies.push({
          x: 36 + Math.random() * (mapPxW - 72),
          y: 90 + Math.random() * (mapPxH - 130),
          angle: Math.random() * Math.PI * 2,
          turnTimer: 30 + Math.floor(Math.random() * 60),
          wingPhase: Math.random() * 10,
          color: bColors[i % bColors.length],
        });
      }

      // Perched little town birds that fly off when the player walks near
      for (const spot of map.birdSpots || []) {
        this.birds.push({
          x: spot.x * TILE_SIZE + 8,
          y: spot.y * TILE_SIZE + 10,
          state: 'perched', // 'perched' | 'flying' | 'gone'
          vx: 0,
          vy: 0,
          facing: Math.random() < 0.5 ? -1 : 1,
          hopTimer: 40 + Math.floor(Math.random() * 90),
          hopOffset: 0,
          wingTick: 0,
          color: '#7C98B8',
          belly: '#F4F0E8',
        });
      }
    } else {
      // Interior dust motes twinkling in window sunbeams
      const windows = (map.lights || []).filter((l) => l.type === 'windowBeam');
      for (const win of windows) {
        for (let i = 0; i < 6; i++) {
          this.dustMotes.push({
            baseX: win.x * TILE_SIZE + 6,
            baseY: win.y * TILE_SIZE + 22,
            x: win.x * TILE_SIZE + (Math.random() - 0.2) * 32,
            y: win.y * TILE_SIZE + 6 + Math.random() * 44,
            vx: 0.03 + Math.random() * 0.04,
            vy: -0.02 + Math.random() * 0.04,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }
  }

  /** Spawn soft dust puffs behind the player's footsteps on dirt paths. */
  spawnFootstepDust(worldX, worldY) {
    for (let i = 0; i < 3; i++) {
      this.fx.push({
        kind: 'dust',
        x: worldX + 6 + (Math.random() - 0.5) * 6,
        y: worldY + 13 + (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.08 - Math.random() * 0.12,
        life: 16 + Math.floor(Math.random() * 8),
        maxLife: 24,
        radius: 1.6 + Math.random() * 1.1,
        color: '238, 222, 186',
      });
    }
  }

  /** Spawn swaying green grass blade tufts when walking through tall grass. */
  spawnGrassRustle(worldX, worldY) {
    audio.rustle();
    const greens = ['#48AA4C', '#84DC6C', '#2F823B'];
    for (let i = 0; i < 5; i++) {
      this.fx.push({
        kind: 'blade',
        x: worldX + 8 + (Math.random() - 0.5) * 8,
        y: worldY + 10 + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.55,
        vy: -0.5 - Math.random() * 0.4,
        gravity: 0.045,
        life: 18 + Math.floor(Math.random() * 8),
        maxLife: 26,
        color: greens[i % greens.length],
      });
    }
  }

  /** Spawn golden & mint healing sparkles around the player during lab/mom heals. */
  spawnHealSparkles(worldX, worldY) {
    const colors = ['#FFE868', '#98F8B8', '#FFFFFF', '#A8E8FF'];
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      this.fx.push({
        kind: 'sparkle',
        x: worldX + 8 + Math.cos(ang) * (5 + Math.random() * 7),
        y: worldY + 4 + Math.sin(ang) * 5,
        vx: Math.cos(ang) * 0.14,
        vy: -0.35 - Math.random() * 0.25,
        life: 32 + Math.floor(Math.random() * 14),
        maxLife: 46,
        color: colors[i % colors.length],
      });
    }
  }

  update(player) {
    if (!this.map) return;
    this.tick += 1;
    const mapPxW = this.map.width * TILE_SIZE;
    const mapPxH = this.map.height * TILE_SIZE;

    // 1. Drifting outdoor leaves / petals
    for (const l of this.leaves) {
      l.phase += 0.05;
      l.x += l.vx + Math.sin(l.phase) * 0.14;
      l.y += l.vy;
      if (l.x > mapPxW + 8) l.x = -8;
      if (l.y > mapPxH + 8) {
        l.y = -8;
        l.x = Math.random() * mapPxW;
      }
    }

    // 2. Fluttering butterflies
    for (const b of this.butterflies) {
      b.wingPhase += 0.35;
      b.turnTimer -= 1;
      if (b.turnTimer <= 0) {
        b.turnTimer = 24 + Math.floor(Math.random() * 48);
        b.angle += (Math.random() - 0.5) * 1.8;
      }
      b.x += Math.cos(b.angle) * 0.24;
      b.y += Math.sin(b.angle) * 0.24 + Math.sin(b.wingPhase * 0.5) * 0.12;
      // Gently steer back inside town bounds
      if (b.x < 28 || b.x > mapPxW - 28 || b.y < 36 || b.y > mapPxH - 28) {
        b.angle = Math.atan2(mapPxH * 0.5 - b.y, mapPxW * 0.5 - b.x);
      }
    }

    // 3. Perched birds that take flight when player approaches
    const px = player.px + 8;
    const py = player.py + 8;
    for (const bird of this.birds) {
      if (bird.state === 'gone') continue;

      if (bird.state === 'perched') {
        const dist = Math.hypot(px - bird.x, py - bird.y);
        if (dist < 40) {
          // Frightened! Burst upward and away from player
          bird.state = 'flying';
          const awayX = bird.x >= px ? 1 : -1;
          bird.facing = awayX;
          bird.vx = awayX * (0.95 + Math.random() * 0.35);
          bird.vy = -(1.1 + Math.random() * 0.35);
          bird.wingTick = 0;
          audio.chirp();
        } else {
          bird.hopTimer -= 1;
          if (bird.hopTimer <= 0) {
            bird.hopTimer = 45 + Math.floor(Math.random() * 90);
            bird.hopOffset = 6;
            if (Math.random() < 0.45) bird.facing *= -1;
          }
          if (bird.hopOffset > 0) bird.hopOffset -= 1;
        }
      } else if (bird.state === 'flying') {
        bird.wingTick += 1;
        bird.x += bird.vx;
        bird.y += bird.vy;
        bird.vy -= 0.012; // Climb higher into sky
        if (bird.x < -30 || bird.x > mapPxW + 30 || bird.y < -30) {
          bird.state = 'gone';
        }
      }
    }

    // 4. Gentle chimney smoke wisps outdoors
    if (!this.map.isIndoor && this.map.chimneys && this.tick % 24 === 0) {
      for (const ch of this.map.chimneys) {
        this.smoke.push({
          x: ch.x * TILE_SIZE + 8,
          y: ch.y * TILE_SIZE - 8,
          vx: 0.08 + Math.random() * 0.06,
          vy: -0.14 - Math.random() * 0.05,
          life: 64,
          maxLife: 64,
          r: 2,
        });
      }
    }
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i];
      s.x += s.vx;
      s.y += s.vy;
      s.r += 0.04;
      s.life -= 1;
      if (s.life <= 0) this.smoke.splice(i, 1);
    }

    // 5. Interior sunbeam dust motes
    for (const m of this.dustMotes) {
      m.phase += 0.045;
      m.x += m.vx + Math.sin(m.phase) * 0.04;
      m.y += m.vy;
      if (Math.hypot(m.x - m.baseX, m.y - m.baseY) > 36) {
        m.x = m.baseX + (Math.random() - 0.5) * 18;
        m.y = m.baseY + (Math.random() - 0.5) * 18;
      }
    }

    // 6. Short-lived footstep dust & grass rustle FX
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const p = this.fx[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.life -= 1;
      if (p.life <= 0) this.fx.splice(i, 1);
    }
  }

  /** Render ground-level footstep dust & rustle particles (in world space). */
  renderGroundFx(ctx) {
    for (const p of this.fx) {
      const alpha = Math.max(0, p.life / p.maxLife);
      if (p.kind === 'dust') {
        ctx.fillStyle = `rgba(${p.color}, ${(alpha * 0.65).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1.2 - alpha * 0.4), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'blade') {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
        ctx.globalAlpha = 1;
      } else if (p.kind === 'sparkle') {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        const rx = Math.round(p.x);
        const ry = Math.round(p.y);
        ctx.fillRect(rx - 1, ry, 3, 1);
        ctx.fillRect(rx, ry - 1, 1, 3);
        ctx.globalAlpha = 1;
      }
    }
  }

  /** Render airborne particles & birds in high-res screen space (480x270). */
  renderAirborne(ctx, camX, camY, zoom) {
    const sx = (wx) => (wx - camX) * zoom;
    const sy = (wy) => (wy - camY) * zoom;

    // Chimney smoke wisps
    for (const s of this.smoke) {
      const a = (s.life / s.maxLife) * 0.28;
      ctx.fillStyle = `rgba(255, 250, 244, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx(s.x), sy(s.y), s.r * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drifting leaves / petals
    for (const l of this.leaves) {
      const x = sx(l.x);
      const y = sy(l.y);
      if (x < -10 || x > 490 || y < -10 || y > 280) continue;
      ctx.fillStyle = l.color;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(l.phase) * 0.7);
      ctx.fillRect(-l.size, -l.size * 0.6, l.size * 2, l.size * 1.2);
      ctx.restore();
    }

    // Butterflies
    for (const b of this.butterflies) {
      const x = Math.round(sx(b.x));
      const y = Math.round(sy(b.y));
      if (x < -10 || x > 490 || y < -10 || y > 280) continue;
      const flap = Math.sin(b.wingPhase) > 0 ? 3 : 1;
      ctx.fillStyle = b.color;
      ctx.fillRect(x - flap - 1, y - 2, flap, 3);
      ctx.fillRect(x + 1, y - 2, flap, 3);
      ctx.fillStyle = '#2A2838';
      ctx.fillRect(x, y - 1, 1, 3);
    }

    // Perched & flying little birds
    for (const bird of this.birds) {
      if (bird.state === 'gone') continue;
      const hopY = bird.state === 'perched' ? (bird.hopOffset > 2 ? -3 : 0) : 0;
      const x = Math.round(sx(bird.x));
      const y = Math.round(sy(bird.y) + hopY);
      if (x < -20 || x > 500 || y < -20 || y > 290) continue;

      if (bird.state === 'perched') {
        // Tiny ground shadow
        ctx.fillStyle = 'rgba(20, 28, 36, 0.25)';
        ctx.fillRect(x - 3, Math.round(sy(bird.y)) + 2, 7, 2);
        // Cute bird body
        ctx.fillStyle = '#2A303E';
        ctx.fillRect(x - 4, y - 4, 8, 6);
        ctx.fillStyle = bird.color;
        ctx.fillRect(x - 3, y - 3, 6, 3);
        ctx.fillStyle = bird.belly;
        ctx.fillRect(x - 2, y, 5, 2);
        // Beak
        ctx.fillStyle = '#F4B838';
        ctx.fillRect(bird.facing > 0 ? x + 4 : x - 6, y - 2, 2, 2);
      } else {
        // Flapping in flight
        const wingUp = Math.floor(bird.wingTick / 4) % 2 === 0;
        ctx.fillStyle = bird.color;
        ctx.fillRect(x - 4, y - 2, 8, 4);
        ctx.fillStyle = bird.belly;
        ctx.fillRect(x - 2, y, 4, 2);
        // Wings
        ctx.fillStyle = '#4C6480';
        if (wingUp) {
          ctx.fillRect(x - 5, y - 6, 4, 4);
          ctx.fillRect(x + 1, y - 6, 4, 4);
        } else {
          ctx.fillRect(x - 5, y + 1, 4, 3);
          ctx.fillRect(x + 1, y + 1, 4, 3);
        }
        ctx.fillStyle = '#F4B838';
        ctx.fillRect(bird.facing > 0 ? x + 4 : x - 6, y - 1, 2, 2);
      }
    }

    // Interior golden dust motes
    for (const m of this.dustMotes) {
      const x = sx(m.x);
      const y = sy(m.y);
      const twinkle = 0.22 + (Math.sin(m.phase) * 0.5 + 0.5) * 0.5;
      ctx.fillStyle = `rgba(255, 246, 204, ${twinkle.toFixed(3)})`;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
}
