/**
 * Player — Authentic GBA-proportioned overworld character (16x20)
 * 4-direction animations, tile-aware collision detection, and smooth movement.
 */

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 20;

    // Compact foot collision box (aligned with 16x16 tile grid)
    this.hitbox = {
      offsetX: 2,
      offsetY: 10,
      width: 12,
      height: 8,
    };

    this.direction = 'down';
    this.walkSpeed = 1.25; // Authentic GBA walking pace
    this.runSpeed = 2.5;

    this.isMoving = false;
    this.animFrame = 1; // 0 = walk1, 1 = idle, 2 = walk2
    this.animTimer = 0;

    this.sprite = null;
    this.loaded = false;
  }

  async load(src = 'assets/characters/gba_player.png') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprite = img;
        this.loaded = true;
        resolve(this);
      };
      img.onerror = () => reject(new Error(`Failed to load player sprite: ${src}`));
      img.src = src;
    });
  }

  update(input, tileMap) {
    const axis = input.getAxis();
    const isRunning = input.isDown('run');
    const speed = isRunning ? this.runSpeed : this.walkSpeed;

    this.isMoving = axis.x !== 0 || axis.y !== 0;

    if (this.isMoving) {
      if (axis.x < 0) this.direction = 'left';
      else if (axis.x > 0) this.direction = 'right';
      else if (axis.y < 0) this.direction = 'up';
      else if (axis.y > 0) this.direction = 'down';

      let dx = axis.x * speed;
      let dy = axis.y * speed;
      if (axis.x !== 0 && axis.y !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      // X collision
      const nextX = this.x + dx;
      if (!tileMap.isBlocked(nextX + this.hitbox.offsetX, this.y + this.hitbox.offsetY, this.hitbox.width, this.hitbox.height)) {
        this.x = nextX;
      }

      // Y collision
      const nextY = this.y + dy;
      if (!tileMap.isBlocked(this.x + this.hitbox.offsetX, nextY + this.hitbox.offsetY, this.hitbox.width, this.hitbox.height)) {
        this.y = nextY;
      }

      // Animation cycle
      this.animTimer += 1;
      const speedDiv = isRunning ? 6 : 9;
      if (this.animTimer >= speedDiv) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 1; // Idle frame
      this.animTimer = 0;
    }
  }

  render(ctx, cameraOffset) {
    if (!this.loaded || !this.sprite) return;

    const rowMap = { down: 0, up: 1, left: 2, right: 3 };
    const row = rowMap[this.direction] || 0;

    const colSeq = [0, 1, 2, 1];
    const col = colSeq[this.animFrame] || 1;

    const sx = col * this.width;
    const sy = row * this.height;

    const dx = Math.round(this.x - cameraOffset.x);
    const dy = Math.round(this.y - cameraOffset.y);

    // Subtle GBA drop shadow under feet
    ctx.save();
    ctx.fillStyle = 'rgba(16, 32, 16, 0.35)';
    ctx.beginPath();
    ctx.ellipse(dx + 8, dy + 18, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(this.sprite, sx, sy, this.width, this.height, dx, dy, this.width, this.height);
  }

  getDepth() {
    return this.y + this.height;
  }
}
