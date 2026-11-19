/**
 * Global game configuration & debug flags.
 */

export const CONFIG = {
  /** When true, pressing 'B' in the overworld immediately starts a test battle. */
  DEBUG: true,

  /** Configurable default name for the Rival (e.g. 'GARY' or 'BLUE'). */
  DEFAULT_RIVAL_NAME: 'GARY',

  /** Default overworld graphics mode: 'classic' (pure Gen 3 GBA) or 'enhanced' (HD lighting/particles). */
  DEFAULT_GRAPHICS_MODE: 'classic',

  /** Default overworld camera zoom mode: 'normal' (2x classic ROM) or 'close' (3x). */
  DEFAULT_ZOOM: 'normal',

  /** Default dialogue typewriter speed: 'slow' | 'normal' | 'fast'. */
  DEFAULT_TEXT_SPEED: 'normal',

  /** Show floating damage number popups during battles. */
  SHOW_DAMAGE_NUMBERS: true,

  /** Use PokémonDB HD renders on Starter Select & End screens. */
  USE_HD_SPRITES: true,
};

export const ZOOM_FACTORS = {
  normal: 2,
  close: 3,
};

export const TEXT_SPEED_RATES = {
  slow: 0.38,
  normal: 0.6,
  fast: 1.25,
};
