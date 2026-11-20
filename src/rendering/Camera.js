/**
 * Camera — Smooth 2D camera with target tracking, viewport centering, and boundary clamping.
 */

export class Camera {
  constructor(viewportWidth, viewportHeight, verticalOffset = 32) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.verticalOffset = verticalOffset; // Upward bias for classic RPG architectural framing
    this.x = 0;
    this.y = 0;
    this.target = null;
    this.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.smoothing = 0.14; // Lerp smoothing factor
  }

  setBounds(minX, minY, maxX, maxY) {
    this.bounds.minX = minX;
    this.bounds.minY = minY;
    this.bounds.maxX = Math.max(minX, maxX - this.viewportWidth);
    this.bounds.maxY = Math.max(minY, maxY - this.viewportHeight);
  }

  follow(target) {
    this.target = target;
    if (target) {
      // Immediate snap to target on initial lock
      this.x = target.x + target.width / 2 - this.viewportWidth / 2;
      this.y = target.y + target.height / 2 - this.viewportHeight / 2 - this.verticalOffset;
      this._clamp();
    }
  }

  update() {
    if (!this.target) return;

    const targetX = this.target.x + this.target.width / 2 - this.viewportWidth / 2;
    const targetY = this.target.y + this.target.height / 2 - this.viewportHeight / 2 - this.verticalOffset;

    this.x += (targetX - this.x) * this.smoothing;
    this.y += (targetY - this.y) * this.smoothing;

    this._clamp();
  }

  _clamp() {
    if (this.x < this.bounds.minX) this.x = this.bounds.minX;
    if (this.x > this.bounds.maxX) this.x = this.bounds.maxX;
    if (this.y < this.bounds.minY) this.y = this.bounds.minY;
    if (this.y > this.bounds.maxY) this.y = this.bounds.maxY;
  }

  // Integer pixel coordinates for crisp rendering without blur
  getRenderOffset() {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
    };
  }
}
