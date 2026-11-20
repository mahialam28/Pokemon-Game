/**
 * Monster Quest: Dawn Version — GBA Visual Test Bootstrap
 * Sets up 240x160 native GBA resolution with crisp nearest-neighbor integer scaling.
 */

import { Game } from './core/Game.js';
import { WorldScene } from './scenes/WorldScene.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const game = new Game('game-canvas', 240, 160);
    window.game = game;
    const worldScene = new WorldScene('maps/towns/gba_test.json');
    await game.setScene(worldScene);
    game.start();
    console.log('✨ Monster Quest: Dawn Version — Classic GBA Pokémon 16x16 Test initialized.');
  } catch (err) {
    console.error('Fatal bootstrap error:', err);
  }
});
