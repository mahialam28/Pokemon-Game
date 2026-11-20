/**
 * Entry point for HD-2D Monster Quest: Dawn Version (480x270 native 16:9).
 * Features:
 * - Responsive integer pixel scaling syncing #game-viewport, #game-canvas,
 *   #battle-sprite-layer (animated Gen 5 GIFs), and #battle-vfx-canvas
 * - F-key fullscreen toggle & M-key audio mute toggle
 * - Boot Loading Screen with real progress bar & graceful procedural fallbacks
 * - 60fps fixed-timestep game loop & scene stack manager
 */

import { loadAllAssets } from './assets.js';
import { audio } from './audio.js';
import { BattleScene } from './battle/BattleScene.js';
import { input } from './input.js';
import { EndOfDemoScene } from './scenes/EndOfDemoScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { StarterSelectScene } from './scenes/StarterSelectScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { gameState } from './state.js';
import { BagScene } from './ui/BagScene.js';
import { drawGbaBox, drawText } from './ui/font.js';
import { PartyScene } from './ui/PartyScene.js';
import { PokedexScene } from './ui/PokedexScene.js';
import { ShopScene } from './ui/ShopScene.js';
import { TrainerCardScene } from './ui/TrainerCardScene.js';

const NATIVE_W = 480;
const NATIVE_H = 270;
const FIXED_DT = 1000 / 60;

const FADE_HALF_FRAMES = 9;
const FADE_HOLD_FRAMES = 2;

class LoadingScene {
  constructor(manager) {
    this.manager = manager;
    this.progress = 0;
    this.displayProgress = 0;
    this.label = 'INITIALIZING...';
    this.done = false;
    this.transitionStarted = false;
    this.tick = 0;
  }

  onEnter() {
    loadAllAssets(({ progress, label }) => {
      this.progress = progress;
      this.label = label;
    }).then(() => {
      this.progress = 1;
      this.done = true;
    }).catch((err) => {
      console.error('Failed to load assets:', err);
    });
  }

  update() {
    this.tick += 1;
    this.displayProgress += (this.progress - this.displayProgress) * 0.22;
    if (this.done && this.displayProgress > 0.97 && !this.transitionStarted) {
      this.displayProgress = 1;
      this.transitionStarted = true;
      const urlParams = new URLSearchParams(window.location.search);
      const testMap = urlParams.get('map');
      if (testMap) {
        const tx = Number(urlParams.get('x')) || (testMap === 'town' ? 4 : 5);
        const ty = Number(urlParams.get('y')) || (testMap === 'town' ? 7 : 4);
        this.manager.transitionTo('overworld', { mapId: testMap, x: tx, y: ty, facing: 'down' });
      } else {
        this.manager.transitionTo('title');
      }
    }
  }

  render(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, NATIVE_H);
    bg.addColorStop(0, '#12182C');
    bg.addColorStop(1, '#1E2842');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, NATIVE_W, NATIVE_H);

    drawText(ctx, 'MONSTER QUEST', NATIVE_W / 2, 74, {
      color: '#FFF8D8',
      shadow: '#0C1020',
      scale: 2,
      align: 'center',
    });
    drawText(ctx, 'DAWN VERSION', NATIVE_W / 2, 96, {
      color: '#F29C68',
      scale: 1,
      align: 'center',
    });

    const barW = 260;
    const barH = 22;
    const barX = (NATIVE_W - barW) / 2;
    const barY = 128;

    drawGbaBox(ctx, barX, barY, barW, barH, {
      fill: '#182034',
      outerBorder: '#0C101C',
      accentBorder: '#4C86A8',
      accentHighlight: '#82BCE0',
      innerBorder: '#28364C',
      shadow: false,
    });

    const fillMax = barW - 14;
    const fillW = Math.round(fillMax * Math.min(1, this.displayProgress));
    if (fillW > 0) {
      const barGrad = ctx.createLinearGradient(barX + 7, 0, barX + 7 + fillMax, 0);
      barGrad.addColorStop(0, '#4EA878');
      barGrad.addColorStop(0.6, '#78DC88');
      barGrad.addColorStop(1, '#FFE078');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barX + 7, barY + 7, fillW, barH - 14);
    }

    const pct = `${Math.round(this.displayProgress * 100)}%`;
    drawText(ctx, `${this.label}  ${pct}`, NATIVE_W / 2, barY + 32, {
      color: '#B8C8DC',
      scale: 1,
      align: 'center',
    });
  }
}

class SceneManager {
  constructor(getCanvasScaleFn) {
    this.getCanvasScale = getCanvasScaleFn;
    this.factories = new Map();
    this.stack = [];
    this.fade = {
      active: false,
      phase: 'idle',
      frame: 0,
      alpha: 0,
      midpointAction: null,
    };
  }

  register(name, factory) {
    this.factories.set(name, factory);
  }

  _create(name) {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Unknown scene: ${name}`);
    }
    return factory(this);
  }

  setScene(name, params = {}) {
    for (const s of this.stack) {
      if (s && s.onExit) s.onExit();
    }
    const scene = this._create(name);
    this.stack = [scene];
    if (scene.onEnter) scene.onEnter(params);
  }

  pushScene(name, params = {}) {
    const scene = this._create(name);
    this.stack.push(scene);
    if (scene.onEnter) scene.onEnter(params);
  }

  popScene() {
    if (this.stack.length > 1) {
      const popped = this.stack.pop();
      if (popped && popped.onExit) popped.onExit();
    }
  }

  transitionTo(name, params = {}) {
    this.fadeAction(() => {
      this.setScene(name, params);
    });
  }

  fadeAction(midpointAction) {
    if (this.fade.active) return;
    this.fade.active = true;
    this.fade.phase = 'out';
    this.fade.frame = 0;
    this.fade.alpha = 0;
    this.fade.midpointAction = midpointAction;
  }

  isTransitioning() {
    return this.fade.active;
  }

  update(inp) {
    if (this.fade.active) {
      this.fade.frame += 1;
      if (this.fade.phase === 'out') {
        this.fade.alpha = Math.min(1, this.fade.frame / FADE_HALF_FRAMES);
        if (this.fade.frame >= FADE_HALF_FRAMES) {
          this.fade.phase = 'hold';
          this.fade.frame = 0;
          if (this.fade.midpointAction) {
            const fn = this.fade.midpointAction;
            this.fade.midpointAction = null;
            fn();
          }
        }
      } else if (this.fade.phase === 'hold') {
        this.fade.alpha = 1;
        if (this.fade.frame >= FADE_HOLD_FRAMES) {
          this.fade.phase = 'in';
          this.fade.frame = 0;
        }
      } else if (this.fade.phase === 'in') {
        this.fade.alpha = Math.max(0, 1 - this.fade.frame / FADE_HALF_FRAMES);
        if (this.fade.frame >= FADE_HALF_FRAMES) {
          this.fade.active = false;
          this.fade.phase = 'idle';
          this.fade.alpha = 0;
        }
      }
    }

    const activeScene = this.stack[this.stack.length - 1];
    if (activeScene && activeScene.update) {
      activeScene.update(inp);
    }
  }

  render(ctx, vfxCtx) {
    vfxCtx.clearRect(0, 0, NATIVE_W, NATIVE_H);

    let startIdx = this.stack.length - 1;
    while (startIdx > 0 && this.stack[startIdx].isOverlay) {
      startIdx -= 1;
    }

    for (let i = startIdx; i < this.stack.length; i++) {
      const scene = this.stack[i];
      if (scene && scene.render) {
        scene.render(ctx, vfxCtx);
      }
    }

    // Draw fade curtain on the topmost canvas so it fades DOM battle GIFs too!
    if (this.fade.active && this.fade.alpha > 0) {
      vfxCtx.fillStyle = `rgba(0, 0, 0, ${this.fade.alpha.toFixed(3)})`;
      vfxCtx.fillRect(0, 0, NATIVE_W, NATIVE_H);
    }
  }
}

// =========================================================================
// BOOTSTRAP, RESPONSIVE INTEGER SCALING & FULLSCREEN (F KEY)
// =========================================================================

const viewportEl = document.getElementById('game-viewport');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const vfxCanvas = document.getElementById('battle-vfx-canvas');
const vfxCtx = vfxCanvas.getContext('2d');

ctx.imageSmoothingEnabled = false;
vfxCtx.imageSmoothingEnabled = false;

let currentCanvasScale = 2;

function applyIntegerScale() {
  const isFull = Boolean(document.fullscreenElement);
  const pad = isFull ? 0 : 16;
  const maxScaleX = Math.floor((window.innerWidth - pad) / NATIVE_W);
  const maxScaleY = Math.floor((window.innerHeight - pad) / NATIVE_H);
  currentCanvasScale = Math.max(1, Math.min(maxScaleX, maxScaleY));

  const cssW = `${NATIVE_W * currentCanvasScale}px`;
  const cssH = `${NATIVE_H * currentCanvasScale}px`;
  if (viewportEl) {
    viewportEl.style.width = cssW;
    viewportEl.style.height = cssH;
  }
}

applyIntegerScale();
window.addEventListener('resize', applyIntegerScale);
document.addEventListener('fullscreenchange', applyIntegerScale);

let hudToastTimer = 0;
let hudToastText = '';
let hudToastColor = '#90F0A0';

function showToast(text, color = '#90F0A0') {
  hudToastText = text;
  hudToastColor = color;
  hudToastTimer = 75;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen()
      .then(() => showToast('FULLSCREEN', '#9CE0FF'))
      .catch(() => {});
  } else {
    document
      .exitFullscreen()
      .then(() => showToast('WINDOWED', '#9CE0FF'))
      .catch(() => {});
  }
}

const manager = new SceneManager(() => currentCanvasScale);
manager.showToast = showToast;
manager.register('loading', (m) => new LoadingScene(m));
manager.register('title', (m) => new TitleScene(m));
manager.register('overworld', (m) => new OverworldScene(m));
manager.register('starterSelect', (m) => new StarterSelectScene(m));
manager.register('battle', (m) => new BattleScene(m));
manager.register('endOfDemo', (m) => new EndOfDemoScene(m));
manager.register('party', (m) => new PartyScene(m));
manager.register('bag', (m) => new BagScene(m));
manager.register('pokedex', (m) => new PokedexScene(m));
manager.register('shop', (m) => new ShopScene(m));
manager.register('trainerCard', (m) => new TrainerCardScene(m));

manager.setScene('loading');
window.gameManager = manager;

function renderHudOverlay(context) {
  if (hudToastTimer > 0) {
    const w = 96;
    const x = NATIVE_W - w - 10;
    context.fillStyle = 'rgba(14, 18, 30, 0.84)';
    context.fillRect(x, 10, w, 18);
    context.fillStyle = 'rgba(255, 255, 255, 0.16)';
    context.fillRect(x, 10, w, 1);
    drawText(context, hudToastText, x + w / 2, 15, {
      color: hudToastColor,
      scale: 1,
      align: 'center',
    });
    return;
  }

  if (audio.isMuted()) {
    context.fillStyle = 'rgba(14, 18, 30, 0.72)';
    context.fillRect(NATIVE_W - 44, 10, 34, 15);
    drawText(context, 'MUTE', NATIVE_W - 40, 14, {
      color: '#FF9088',
      scale: 1,
    });
  }
}

// =========================================================================
// FIXED-TIMESTEP 60FPS GAME LOOP
// =========================================================================

let lastTime = performance.now();
let accumulator = 0;

function tick() {
  if (input.wasJustPressed('mute')) {
    const muted = audio.toggleMute();
    showToast(muted ? 'AUDIO MUTED' : 'SOUND ON', muted ? '#FF8880' : '#90F0A0');
  }
  if (input.wasJustPressed('fullscreen')) {
    toggleFullscreen();
  }
  if (hudToastTimer > 0) hudToastTimer -= 1;

  // Track live play time when in gameplay (outside loading/title screens)
  const topScene = manager.stack[manager.stack.length - 1];
  if (
    topScene &&
    !(topScene instanceof LoadingScene) &&
    !(topScene instanceof TitleScene)
  ) {
    gameState.playTimeFrames = (gameState.playTimeFrames || 0) + 1;
  }

  manager.update(input);
  input.endFrame();
}

function frame(now) {
  const delta = Math.min(100, now - lastTime);
  lastTime = now;
  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    tick();
    accumulator -= FIXED_DT;
  }

  ctx.imageSmoothingEnabled = false;
  vfxCtx.imageSmoothingEnabled = false;
  manager.render(ctx, vfxCtx);
  renderHudOverlay(vfxCtx);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
