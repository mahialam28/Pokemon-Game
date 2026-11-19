/**
 * Keyboard input handler tracking held keys, single-frame justPressed events,
 * and directional priority (most recently pressed direction wins while held).
 */

import { audio } from './audio.js';

const KEY_TO_ACTION = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyZ: 'confirm',
  Enter: 'confirm',
  Space: 'confirm',
  KeyX: 'cancel',
  Backspace: 'cancel',
  Escape: 'pause',
  KeyM: 'mute',
  KeyF: 'fullscreen',
  KeyB: 'debugBattle',
  KeyG: 'debugEncounters',
  KeyH: 'debugHeal',
};

const DIRECTIONS = ['up', 'down', 'left', 'right'];

class InputManager {
  constructor() {
    /** Map from action name -> Set of currently pressed physical key codes */
    this.heldKeys = new Map();
    /** Set of actions newly pressed since the previous fixed update tick */
    this.justPressed = new Set();
    /** Ordered stack of currently held directions (last entry = highest priority) */
    this.dirStack = [];

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onBlur = this._onBlur.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  _onKeyDown(e) {
    const action = KEY_TO_ACTION[e.code];
    if (!action) return;

    // Prevent browser scrolling on arrows / space
    if (
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'Space'
    ) {
      e.preventDefault();
    }

    // Unlock Web Audio on first keypress
    audio.unlock();

    let codes = this.heldKeys.get(action);
    if (!codes) {
      codes = new Set();
      this.heldKeys.set(action, codes);
    }

    const wasHeld = codes.size > 0;
    codes.add(e.code);

    if (!wasHeld && !e.repeat) {
      this.justPressed.add(action);
      if (DIRECTIONS.includes(action)) {
        this.dirStack = this.dirStack.filter((d) => d !== action);
        this.dirStack.push(action);
      }
    }
  }

  _onKeyUp(e) {
    const action = KEY_TO_ACTION[e.code];
    if (!action) return;

    const codes = this.heldKeys.get(action);
    if (codes) {
      codes.delete(e.code);
      if (codes.size === 0 && DIRECTIONS.includes(action)) {
        this.dirStack = this.dirStack.filter((d) => d !== action);
      }
    }
  }

  _onBlur() {
    this.heldKeys.clear();
    this.justPressed.clear();
    this.dirStack = [];
  }

  /** True while at least one bound key for this action is held down. */
  isHeld(action) {
    const codes = this.heldKeys.get(action);
    return Boolean(codes && codes.size > 0);
  }

  /** True only during the single fixed tick after the key was pressed. */
  wasJustPressed(action) {
    return this.justPressed.has(action);
  }

  /** Returns the active movement direction ('up'|'down'|'left'|'right') or null. */
  getHeldDirection() {
    if (this.dirStack.length === 0) return null;
    return this.dirStack[this.dirStack.length - 1];
  }

  /** Must be called at the end of every fixed update tick. */
  endFrame() {
    this.justPressed.clear();
  }
}

export const input = new InputManager();
