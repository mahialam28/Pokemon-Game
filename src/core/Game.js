/**
 * Game — Core engine coordinator managing the canvas, fixed 60fps loop, and scene transitions.
 */

import { InputManager } from '../input/InputManager.js';

export class Game {
  constructor(canvasId = 'game-canvas', width = 240, height = 160) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas #${canvasId} not found`);
    }
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.input = new InputManager();
    this.currentScene = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedStep = 1000 / 60; // 60 updates per second
    this.isRunning = false;

    // Viewport scaling
    this._setupResponsiveScaling();
  }

  _setupResponsiveScaling() {
    const resize = () => {
      const container = document.getElementById('game-viewport') || document.body;
      const availW = window.innerWidth;
      const availH = window.innerHeight;

      // Integer scale factor (min 1, max based on available screen space)
      let scale = Math.floor(Math.min(availW / this.width, availH / this.height));
      if (scale < 1) scale = 1;

      // Apply to viewport container
      const vp = document.getElementById('game-viewport');
      if (vp) {
        vp.style.width = `${this.width * scale}px`;
        vp.style.height = `${this.height * scale}px`;
      }
    };

    window.addEventListener('resize', resize);
    resize();
  }

  async setScene(scene) {
    if (this.currentScene && typeof this.currentScene.destroy === 'function') {
      this.currentScene.destroy();
    }
    this.currentScene = scene;
    if (scene && typeof scene.init === 'function') {
      await scene.init(this);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(time) {
    if (!this.isRunning) return;

    const delta = Math.min(time - this.lastTime, 100); // Clamp huge spikes
    this.lastTime = time;
    this.accumulator += delta;

    while (this.accumulator >= this.fixedStep) {
      if (this.currentScene && typeof this.currentScene.update === 'function') {
        this.currentScene.update(this.input, this.fixedStep / 1000);
      }
      this.input.update();
      this.accumulator -= this.fixedStep;
    }

    if (this.currentScene && typeof this.currentScene.render === 'function') {
      this.ctx.imageSmoothingEnabled = false;
      this.currentScene.render(this.ctx);
    }

    requestAnimationFrame((t) => this._loop(t));
  }
}

