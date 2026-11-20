/**
 * InputManager — Handles keyboard input with multi-key binding and action mapping.
 */

export class InputManager {
  constructor() {
    this.keysDown = new Set();
    this.justPressed = new Set();

    this.bindings = {
      up: ['ArrowUp', 'KeyW'],
      down: ['ArrowDown', 'KeyS'],
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      action: ['Space', 'KeyZ', 'Enter'],
      cancel: ['KeyX', 'Escape', 'Backspace'],
      run: ['ShiftLeft', 'ShiftRight'],
      fullscreen: ['KeyF'],
    };

    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
    window.addEventListener('blur', () => this.clear());
  }

  _onKeyDown(e) {
    // Prevent default scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!this.keysDown.has(e.code)) {
      this.justPressed.add(e.code);
    }
    this.keysDown.add(e.code);
  }

  _onKeyUp(e) {
    this.keysDown.delete(e.code);
  }

  isDown(action) {
    const codes = this.bindings[action] || [action];
    return codes.some((c) => this.keysDown.has(c));
  }

  isJustPressed(action) {
    const codes = this.bindings[action] || [action];
    return codes.some((c) => this.justPressed.has(c));
  }

  getAxis() {
    let x = 0;
    let y = 0;
    if (this.isDown('left')) x -= 1;
    if (this.isDown('right')) x += 1;
    if (this.isDown('up')) y -= 1;
    if (this.isDown('down')) y += 1;
    return { x, y };
  }

  update() {
    // Clear transient single-frame keypresses
    this.justPressed.clear();
  }

  clear() {
    this.keysDown.clear();
    this.justPressed.clear();
  }
}

