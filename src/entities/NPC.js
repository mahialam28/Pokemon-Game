/**
 * Non-player character (NPC) entity with:
 * - Scripted cutscene walking queues
 * - Autonomous bounded wandering for living town NPCs (fat man, girl, kid)
 * - Face-the-player interaction helper
 * - Light idle head-turn animation & periodic blink
 * - Crisp Gen 3 pixel-art ground shadow & optional "!" alert bubble
 */

import { TILE_SIZE } from '../world/tiles.js';
import { DIR_VECTORS, oppositeDir } from './Player.js';
import { drawAlertBubble, drawCharacter, drawCharacterShadow } from './sprites.js';

const NPC_STEP_FRAMES = 10;
const ALL_DIRS = ['up', 'down', 'left', 'right'];

export class NPC {
  constructor({
    id,
    name = '',
    sprite = 'mom',
    x = 0,
    y = 0,
    facing = 'down',
    idleLook = false,
    idleDirs = ['down', 'left', 'right'],
    wanderBounds = null, // Optional { minX, maxX, minY, maxY } for strolling town NPCs
    getDialogue = null,
  }) {
    this.id = id;
    this.name = name;
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.px = x * TILE_SIZE;
    this.py = y * TILE_SIZE;
    this.facing = facing;
    this.defaultFacing = facing;

    this.idleLook = idleLook;
    this.idleDirs = idleDirs;
    this.wanderBounds = wanderBounds;
    this.idleTimer = this._nextIdleDelay();
    this.getDialogue = getDialogue;

    this.moveQueue = [];
    this.onQueueComplete = null;
    this.moving = false;
    this.startX = this.px;
    this.startY = this.py;
    this.targetX = x;
    this.targetY = y;
    this.moveTimer = 0;
    this.stepParity = 0;
    this.blinkTimer = 120 + Math.floor(Math.random() * 160);

    this.showAlert = false;
  }

  _nextIdleDelay() {
    return 95 + Math.floor(Math.random() * 135);
  }

  facePlayer(playerFacing) {
    this.facing = oppositeDir(playerFacing);
    this.idleTimer = this._nextIdleDelay();
  }

  walkPath(dirs, onComplete = null) {
    this.moveQueue = [...dirs];
    this.onQueueComplete = onComplete;
    this._startNextStep();
  }

  _startNextStep() {
    if (this.moveQueue.length === 0) {
      if (this.onQueueComplete) {
        const cb = this.onQueueComplete;
        this.onQueueComplete = null;
        cb();
      }
      return;
    }

    const dir = this.moveQueue.shift();
    const v = DIR_VECTORS[dir];
    if (!v) {
      this._startNextStep();
      return;
    }

    this.facing = dir;
    this.moving = true;
    this.startX = this.x * TILE_SIZE;
    this.startY = this.y * TILE_SIZE;
    this.targetX = this.x + v.dx;
    this.targetY = this.y + v.dy;
    this.moveTimer = 0;
    this.stepParity = 1 - this.stepParity;
  }

  occupies(tx, ty) {
    if (this.x === tx && this.y === ty) return true;
    if (this.moving && this.targetX === tx && this.targetY === ty) return true;
    return false;
  }

  update({ frozen = false, canStepTo = null } = {}) {
    this.blinkTimer -= 1;
    if (this.blinkTimer <= -7) {
      this.blinkTimer = 160 + Math.floor(Math.random() * 160);
    }

    if (this.moving) {
      this.moveTimer += 1;
      const t = this.moveTimer / NPC_STEP_FRAMES;
      this.px = this.startX + (this.targetX * TILE_SIZE - this.startX) * t;
      this.py = this.startY + (this.targetY * TILE_SIZE - this.startY) * t;

      if (this.moveTimer >= NPC_STEP_FRAMES) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.px = this.x * TILE_SIZE;
        this.py = this.y * TILE_SIZE;
        this.moving = false;
        this.moveTimer = 0;
        this._startNextStep();
      }
      return;
    }

    if (frozen) return;

    // Wandering town NPCs randomly turn or take a 1-tile stroll inside their area
    if (this.wanderBounds) {
      this.idleTimer -= 1;
      if (this.idleTimer <= 0) {
        this.idleTimer = this._nextIdleDelay();
        const dir = ALL_DIRS[Math.floor(Math.random() * ALL_DIRS.length)];
        this.facing = dir;
        if (Math.random() < 0.55) {
          const v = DIR_VECTORS[dir];
          const nx = this.x + v.dx;
          const ny = this.y + v.dy;
          const b = this.wanderBounds;
          if (
            nx >= b.minX &&
            nx <= b.maxX &&
            ny >= b.minY &&
            ny <= b.maxY &&
            (!canStepTo || canStepTo(nx, ny, this))
          ) {
            this.moving = true;
            this.startX = this.x * TILE_SIZE;
            this.startY = this.y * TILE_SIZE;
            this.targetX = nx;
            this.targetY = ny;
            this.moveTimer = 0;
            this.stepParity = 1 - this.stepParity;
          }
        }
      }
      return;
    }

    if (this.idleLook) {
      this.idleTimer -= 1;
      if (this.idleTimer <= 0) {
        this.idleTimer = this._nextIdleDelay();
        const choices = this.idleDirs.filter((d) => d !== this.facing);
        if (choices.length > 0) {
          this.facing = choices[Math.floor(Math.random() * choices.length)];
        }
      }
    }
  }

  getAnimFrame() {
    if (!this.moving) return 0;
    if (this.moveTimer <= 1) return 0;
    if (this.moveTimer <= NPC_STEP_FRAMES - 3) return this.stepParity === 0 ? 1 : 3;
    return 2;
  }

  renderShadow(ctx) {
    drawCharacterShadow(ctx, this.px, this.py);
  }

  render(ctx) {
    drawCharacter(ctx, this.sprite, this.facing, this.getAnimFrame(), this.px, this.py, {
      idle: !this.moving,
      blinking: this.blinkTimer <= 0,
    });
    if (this.showAlert) {
      drawAlertBubble(ctx, this.px, this.py);
    }
  }
}
