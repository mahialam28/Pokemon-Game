/**
 * Grid-based Player entity with authentic Gen 3 Ruby/Sapphire/Emerald movement:
 * - Quick tap turns in place (~4 frames); holding walks tile-to-tile (8 frames/step)
 * - 1-way ledge hopping (2-tile jump with parabolic arc + flat ground shadow)
 * - Walking-in-place bump animation + soft bump sound when hitting a wall
 * - Periodic blink animation & alert "!" bubble for cutscenes
 */

import { audio } from '../audio.js';
import { TILE_SIZE } from '../world/tiles.js';
import { drawAlertBubble, drawCharacter, drawCharacterShadow } from './sprites.js';

export const DIR_VECTORS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function oppositeDir(dir) {
  if (dir === 'up') return 'down';
  if (dir === 'down') return 'up';
  if (dir === 'left') return 'right';
  if (dir === 'right') return 'left';
  return 'down';
}

const STEP_FRAMES = 8; // 2px/frame smooth walk
const JUMP_FRAMES = 18; // Classic Gen 3 ledge hop across 2 tiles
const TURN_HOLD_FRAMES = 4;
const BUMP_COOLDOWN_FRAMES = 16;

export class Player {
  constructor(x = 2, y = 4, facing = 'down') {
    this.x = x;
    this.y = y;
    this.px = x * TILE_SIZE;
    this.py = y * TILE_SIZE;
    this.facing = facing;

    this.moving = false;
    this.jumping = false;
    this.jumpY = 0;
    this.stepDuration = STEP_FRAMES;

    this.startX = this.px;
    this.startY = this.py;
    this.targetX = x;
    this.targetY = y;
    this.moveTimer = 0;

    this.stepParity = 0;
    this.turnTimer = 0;
    this.turnDir = null;
    this.bumpTimer = 0;
    this.bumpAnimTimer = 0;
    this.blinkTimer = 180;
    this.showAlert = false;

    this.onStepComplete = null;
  }

  setPosition(x, y, facing = this.facing) {
    this.x = x;
    this.y = y;
    this.px = x * TILE_SIZE;
    this.py = y * TILE_SIZE;
    this.targetX = x;
    this.targetY = y;
    this.facing = facing;
    this.moving = false;
    this.jumping = false;
    this.jumpY = 0;
    this.moveTimer = 0;
    this.turnTimer = 0;
    this.turnDir = null;
    this.bumpTimer = 0;
    this.bumpAnimTimer = 0;
    this.onStepComplete = null;
  }

  getFacingTile() {
    const v = DIR_VECTORS[this.facing] || DIR_VECTORS.down;
    return { x: this.x + v.dx, y: this.y + v.dy };
  }

  forceStep(dir, onComplete = null) {
    const v = DIR_VECTORS[dir];
    if (!v) return;
    this.facing = dir;
    this.moving = true;
    this.jumping = false;
    this.jumpY = 0;
    this.stepDuration = STEP_FRAMES;
    this.startX = this.x * TILE_SIZE;
    this.startY = this.y * TILE_SIZE;
    this.targetX = this.x + v.dx;
    this.targetY = this.y + v.dy;
    this.moveTimer = 0;
    this.stepParity = 1 - this.stepParity;
    this.onStepComplete = onComplete;
  }

  /**
   * Advance player one fixed 60fps tick.
   * @param {object|null} input
   * @param {Function} isBlockedFn (tx, ty) => boolean
   * @param {Function} onTileEntered (tx, ty) => void
   * @param {Function|null} onStepStart (fx, fy, tx, ty) => void
   * @param {Function|null} canHopLedgeFn (tx, ty, dir) => boolean
   */
  update(input, isBlockedFn, onTileEntered, onStepStart = null, canHopLedgeFn = null) {
    this.blinkTimer -= 1;
    if (this.blinkTimer <= -7) {
      this.blinkTimer = 170 + Math.floor(Math.random() * 140);
    }
    if (this.bumpTimer > 0) this.bumpTimer -= 1;
    if (this.bumpAnimTimer > 0) this.bumpAnimTimer -= 1;

    if (this.moving) {
      this.moveTimer += 1;
      const t = this.moveTimer / this.stepDuration;
      this.px = this.startX + (this.targetX * TILE_SIZE - this.startX) * t;
      this.py = this.startY + (this.targetY * TILE_SIZE - this.startY) * t;
      this.jumpY = this.jumping ? Math.round(Math.sin(t * Math.PI) * 11) : 0;

      if (this.moveTimer >= this.stepDuration) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.px = this.x * TILE_SIZE;
        this.py = this.y * TILE_SIZE;
        this.moving = false;
        this.jumping = false;
        this.jumpY = 0;
        this.moveTimer = 0;

        if (this.onStepComplete) {
          const cb = this.onStepComplete;
          this.onStepComplete = null;
          cb();
        } else if (onTileEntered) {
          onTileEntered(this.x, this.y);
        }
      }
      return;
    }

    if (!input) {
      this.turnTimer = 0;
      this.turnDir = null;
      return;
    }

    const dir = input.getHeldDirection();
    if (!dir) {
      this.turnTimer = 0;
      this.turnDir = null;
      return;
    }

    if (dir !== this.facing) {
      this.facing = dir;
      this.turnDir = dir;
      this.turnTimer = 1;
      return;
    }

    if (this.turnDir === dir && this.turnTimer > 0 && this.turnTimer < TURN_HOLD_FRAMES) {
      this.turnTimer += 1;
      return;
    }
    this.turnDir = null;
    this.turnTimer = 0;

    const v = DIR_VECTORS[dir];
    const nx = this.x + v.dx;
    const ny = this.y + v.dy;

    // Check one-way Gen 3 ledge jump (hopping down across 2 tiles)
    if (canHopLedgeFn && canHopLedgeFn(nx, ny, dir)) {
      const landX = nx + v.dx;
      const landY = ny + v.dy;
      if (!isBlockedFn(landX, landY)) {
        audio.hop();
        this.moving = true;
        this.jumping = true;
        this.jumpY = 0;
        this.stepDuration = JUMP_FRAMES;
        this.startX = this.x * TILE_SIZE;
        this.startY = this.y * TILE_SIZE;
        this.targetX = landX;
        this.targetY = landY;
        this.moveTimer = 0;
        this.stepParity = 1 - this.stepParity;
        return;
      }
    }

    if (isBlockedFn(nx, ny)) {
      // Gen 3 walk-in-place + bump thud when pushing into a wall
      if (this.bumpTimer === 0) {
        audio.bump();
        this.bumpTimer = BUMP_COOLDOWN_FRAMES;
        this.bumpAnimTimer = 10;
        this.stepParity = 1 - this.stepParity;
      }
      return;
    }

    this.moving = true;
    this.jumping = false;
    this.jumpY = 0;
    this.stepDuration = STEP_FRAMES;
    this.startX = this.x * TILE_SIZE;
    this.startY = this.y * TILE_SIZE;
    this.targetX = nx;
    this.targetY = ny;
    this.moveTimer = 0;
    this.stepParity = 1 - this.stepParity;

    if (onStepStart) {
      onStepStart(this.x, this.y, nx, ny);
    }
  }

  getAnimFrame() {
    if (this.jumping) {
      return this.stepParity === 0 ? 1 : 3;
    }
    if (this.moving) {
      if (this.moveTimer <= 1) return 0;
      if (this.moveTimer <= 5) return this.stepParity === 0 ? 1 : 3;
      return 2;
    }
    if (this.bumpAnimTimer > 2) {
      return this.stepParity === 0 ? 1 : 3;
    }
    return 0;
  }

  renderShadow(ctx) {
    drawCharacterShadow(ctx, this.px, this.py);
  }

  render(ctx) {
    drawCharacter(ctx, 'player', this.facing, this.getAnimFrame(), this.px, this.py, {
      idle: !this.moving,
      blinking: this.blinkTimer <= 0,
      jumpY: this.jumpY,
    });
    if (this.showAlert) {
      drawAlertBubble(ctx, this.px, this.py);
    }
  }
}
