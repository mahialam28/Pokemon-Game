/**
 * HD-2D Layered Overworld Scene (Phase 1 + Phase 2).
 * - 7-layer HD-2D renderer + smooth lerped camera + Zoom setting (Close 3x / Normal 2x)
 * - Esc Pause Menu (POKéMON party view, SAVE, ZOOM toggle, TEXT SPEED toggle)
 * - Phase 2 Rival lab burst-in, counter starter pick, lab exit challenge -> BattleScene
 * - Post-battle Professor heal with sparkle burst + Mom healing anytime at home
 * - Town Neighbour NPC reacting to rival battle + North exit -> End of Phase 2 screen
 * - Debug 'B' key (when CONFIG.DEBUG = true) to launch an instant test battle anywhere
 */

import { audio } from '../audio.js';
import { renderPartyOverlay } from '../battle/BattleUI.js';
import { CONFIG, ZOOM_FACTORS } from '../config.js';
import { createPokemon, getCounterStarterId, healParty } from '../data/pokemon.js';
import { STARTERS } from '../data/starters.js';
import { NPC } from '../entities/NPC.js';
import { Player } from '../entities/Player.js';
import { drawPokeBall } from '../entities/sprites.js';
import { gameState, getLeadPokemon, saveGame } from '../state.js';
import { drawGbaBox, drawText, measureText } from '../ui/font.js';
import { Menu } from '../ui/Menu.js';
import { TextBox } from '../ui/TextBox.js';
import { LightingEngine } from '../world/lighting.js';
import { getMap } from '../world/maps.js';
import { ParticleSystem } from '../world/particles.js';
import {
  drawChimneyOverhead,
  drawMapTile,
  drawTallGrassOverlay,
  drawTile,
  drawTreeOverhead,
  SOLID_TILES,
  TILE,
  TILE_SIZE,
  Y_SORT_TILES,
} from '../world/tiles.js';

const SCREEN_W = 480;
const SCREEN_H = 270;

const ANIMATED_TILES = new Set([
  TILE.FLOWER,
  TILE.TALL_GRASS,
  TILE.WATER,
  TILE.TV,
  TILE.LAB_MACHINE,
]);

const OVERHEAD_ROOF_TILES = new Set([
  TILE.ROOF_RED,
  TILE.ROOF_BLUE,
  TILE.ROOF_LAB,
]);

const TEXT_SPEED_CYCLE = ['normal', 'fast', 'slow'];

export class OverworldScene {
  constructor(manager) {
    this.manager = manager;
    this.map = null;
    this.player = new Player(2, 4, 'down');
    this.npcs = [];
    this.textBox = new TextBox();

    this.lighting = new LightingEngine(SCREEN_W, SCREEN_H);
    this.particles = new ParticleSystem();
    this.groundCache = null;

    // Smooth lerped camera & smooth zoom (Normal 2x by default)
    this.zoom = ZOOM_FACTORS[gameState.settings.zoom] || 2;
    this.camX = 0;
    this.camY = 0;

    this.tick = 0;
    this.cutsceneActive = false;
    this.pendingCutscene = null;
    this.cutsceneDelay = 0;
    this.cutsceneCallback = null;

    // Esc Start Menu, Option Submenu & Party overlay state
    this.pauseMenu = null;
    this.optionMenu = null;
    this.showingParty = false;

    this.bannerText = '';
    this.bannerTimer = 0;
  }

  onEnter(params = {}) {
    if (params.restoreFromState) {
      const loc = gameState.location || { mapId: 'bedroom', x: 2, y: 4, facing: 'down' };
      this.loadMap(loc.mapId, loc.x, loc.y, loc.facing);
    } else if (params.mapId) {
      this.loadMap(params.mapId, params.x, params.y, params.facing || 'down');
    } else if (!this.map) {
      this.loadMap('bedroom', 2, 4, 'down');
    }
  }

  _buildGroundCache(map) {
    const c = document.createElement('canvas');
    c.width = map.width * TILE_SIZE;
    c.height = map.height * TILE_SIZE;
    const gctx = c.getContext('2d');
    gctx.imageSmoothingEnabled = false;

    const baseFloorTile = !map.isIndoor
      ? TILE.GRASS
      : map.id === 'lab'
        ? TILE.LAB_FLOOR
        : TILE.WOOD_FLOOR;

    for (let r = 0; r < map.height; r++) {
      for (let col = 0; col < map.width; col++) {
        const tid = map.tiles[r][col];
        if (Y_SORT_TILES.has(tid)) {
          drawTile(gctx, baseFloorTile, col * TILE_SIZE, r * TILE_SIZE, 0);
        } else {
          drawMapTile(gctx, map, col, r, col * TILE_SIZE, r * TILE_SIZE, 0);
        }
      }
    }

    if (!map.isIndoor) {
      gctx.fillStyle = 'rgba(18, 28, 24, 0.22)';
      for (let r = 1; r < map.height; r++) {
        for (let col = 0; col < map.width; col++) {
          const above = map.tiles[r - 1][col];
          const curr = map.tiles[r][col];
          const isBuildingWall =
            above === TILE.HOUSE_WALL ||
            above === TILE.LAB_WALL ||
            above === TILE.DOOR ||
            above === TILE.LAB_DOOR;
          if (isBuildingWall && !SOLID_TILES.has(curr)) {
            gctx.fillRect(col * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, 3);
          }
        }
      }
    }

    this.groundCache = c;
  }

  _playMapMusic() {
    if (!this.map) return;
    if (this.map.id === 'town') audio.playTrack('town');
    else if (this.map.id === 'lab') audio.playTrack('lab');
    else audio.playTrack('indoors');
  }

  loadMap(mapId, x, y, facing = 'down') {
    this.map = getMap(mapId);
    this.player.setPosition(x, y, facing);
    this.npcs = (this.map.npcs || []).map((cfg) => new NPC(cfg));
    this.textBox.close();
    this.pauseMenu = null;
    this.optionMenu = null;
    this.showingParty = false;

    this._playMapMusic();

    // If loading lab while Rival is waiting to challenge the player, spawn Rival cleanly
    if (
      this.map.id === 'lab' &&
      gameState.flags.rivalPickedStarter &&
      !gameState.flags.rivalBattleDone
    ) {
      this._spawnRivalNpc(5, 7, 'up');
    }

    this._buildGroundCache(this.map);
    this.particles.resetForMap(this.map);

    this.zoom = ZOOM_FACTORS[gameState.settings.zoom] || 2;
    const target = this._getTargetCamera();
    this.camX = target.x;
    this.camY = target.y;

    this.cutsceneActive = false;
    this.pendingCutscene = null;
    this.cutsceneDelay = 0;
    this.cutsceneCallback = null;

    gameState.location = { mapId: this.map.id, x, y, facing };

    if (this.map.id === 'town' || this.map.id === 'lab') {
      this.bannerText = this.map.name;
      this.bannerTimer = 120;
    } else {
      this.bannerTimer = 0;
    }

    if (this.map.id === 'downstairs' && !gameState.flags.talkedToMom) {
      this.pendingCutscene = 'momIntro';
    } else if (this.map.id === 'lab' && !gameState.flags.metProf) {
      this.pendingCutscene = 'profIntro';
    }
  }

  _spawnRivalNpc(x, y, facing = 'up') {
    let rival = this._findNpcById('rival');
    if (rival) return rival;
    rival = new NPC({
      id: 'rival',
      name: gameState.rivalName || 'GARY',
      sprite: 'rival',
      x,
      y,
      facing,
      idleLook: false,
      getDialogue: () => [
        "{RIVAL}: Heh, my {RIVAL_STARTER} is way stronger than yours! Try walking out when you're ready!",
      ],
    });
    this.npcs.push(rival);
    return rival;
  }

  _removeNpcById(id) {
    this.npcs = this.npcs.filter((n) => n.id !== id);
  }

  _findNpcById(id) {
    return this.npcs.find((n) => n.id === id) || null;
  }

  _waitFrames(frames, callback) {
    this.cutsceneDelay = frames;
    this.cutsceneCallback = callback;
  }

  // =========================================================================
  // PHASE 1 & PHASE 2 STORY CUTSCENES
  // =========================================================================

  _startPendingCutscene() {
    const id = this.pendingCutscene;
    this.pendingCutscene = null;

    if (id === 'momIntro') {
      this._runMomCutscene();
    } else if (id === 'profIntro') {
      this._runProfCutscene();
    }
  }

  _runMomCutscene() {
    const mom = this._findNpcById('mom');
    if (!mom) return;

    this.cutsceneActive = true;
    this._waitFrames(10, () => {
      mom.facing = 'right';
      mom.showAlert = true;
      audio.alert();

      this._waitFrames(22, () => {
        mom.showAlert = false;
        mom.walkPath(['up', 'right'], () => {
          mom.facing = 'right';
          this.player.facing = 'left';

          this.textBox.show(
            [
              "MOM: Oh, {PLAYER}! You're finally awake.",
              'MOM: Professor Oak... I mean, the PROFESSOR next door was looking for you.',
              "MOM: He said today's the day you get your very first partner!",
              "MOM: Go on, don't keep him waiting. And be careful!",
            ],
            {
              onComplete: () => {
                gameState.flags.talkedToMom = true;
                saveGame();
                mom.walkPath(['left', 'down'], () => {
                  mom.facing = 'left';
                  this.cutsceneActive = false;
                });
              },
            }
          );
        });
      });
    });
  }

  _runProfCutscene() {
    const prof = this._findNpcById('prof');
    if (!prof) return;

    this.cutsceneActive = true;
    this._waitFrames(10, () => {
      prof.facing = 'down';
      prof.showAlert = true;
      audio.alert();

      this._waitFrames(22, () => {
        prof.showAlert = false;
        prof.walkPath(['down', 'down', 'down', 'down', 'down'], () => {
          prof.facing = 'down';
          this.player.facing = 'up';

          this.textBox.show(
            [
              'PROF: Ah, {PLAYER}! There you are.',
              'PROF: The world is full of creatures called POKéMON.',
              'PROF: On that table are three POKéMON. Choose one to be your partner!',
            ],
            {
              onComplete: () => {
                gameState.flags.metProf = true;
                saveGame();
                prof.walkPath(['up', 'up', 'up', 'up', 'up'], () => {
                  prof.facing = 'down';
                  this.cutsceneActive = false;
                });
              },
            }
          );
        });
      });
    });
  }

  /**
   * PHASE 2: Immediately after player picks their starter in the lab:
   * 1. Rival bursts in through the lab door ("!" bubble over player's head)
   * 2. Rival walks to the table and picks the type-advantage counter starter
   * 3. Rival waits in the lab until the player tries to leave!
   */
  _runPostStarterSequence() {
    this.cutsceneActive = true;
    const prof = this._findNpcById('prof');
    if (prof) prof.facing = 'right';

    this.textBox.show('PROF: {STARTER} looks happy to be with you!', {
      onComplete: () => {
        // Rival bursts through the lab door!
        audio.door();
        const rival = this._spawnRivalNpc(5, 11, 'up');
        this.player.showAlert = true;
        audio.alert();

        this._waitFrames(20, () => {
          this.player.showAlert = false;
          this.player.facing = 'down';
          if (prof) prof.facing = 'down';

          rival.walkPath(['up', 'up', 'up', 'up'], () => {
            rival.facing = 'up';
            this.textBox.show(
              [
                "{RIVAL}: Gramps! I'm here! ... Huh? {PLAYER}, you're already here?",
                '{RIVAL}: No fair! I wanted to pick first!',
              ],
              {
                onComplete: () => {
                  // Route Rival around the player to the counter starter's Poké Ball on the table
                  const rivalId = gameState.rivalStarter ? gameState.rivalStarter.id : 4;
                  const ballIdx = STARTERS.findIndex((s) => s.id === rivalId);
                  const ball = (this.map.pokeballs || [])[Math.max(0, ballIdx)] || { x: 8, y: 4 };

                  // Walk up to y=6, slide horizontally to ball.x, then step up if unoccupied
                  const pathToBall = ['up']; // (5,7) -> (5,6)
                  const dx = ball.x - 5;
                  for (let i = 0; i < Math.abs(dx); i++) {
                    pathToBall.push(dx > 0 ? 'right' : 'left');
                  }
                  const targetStandingFree = !(this.player.x === ball.x && this.player.y === 5);
                  if (targetStandingFree) {
                    pathToBall.push('up'); // (ball.x, 6) -> (ball.x, 5)
                  }

                  rival.walkPath(pathToBall, () => {
                    rival.facing = 'up';
                    this.player.facing = rival.x >= this.player.x ? 'right' : 'left';

                    this.textBox.show("{RIVAL}: I'll take this one, then!", {
                      onComplete: () => {
                        gameState.flags.rivalPickedStarter = true;
                        saveGame();
                        audio.fanfare();

                        this.textBox.show('{RIVAL} received {RIVAL_STARTER}!', {
                          onComplete: () => {
                            // Rival steps back to wait near the center-south aisle
                            const backPath = [];
                            if (rival.y === 5) backPath.push('down');
                            const bx = 5 - rival.x;
                            for (let i = 0; i < Math.abs(bx); i++) {
                              backPath.push(bx > 0 ? 'right' : 'left');
                            }
                            backPath.push('down'); // -> (5, 7)

                            rival.walkPath(backPath, () => {
                              rival.facing = 'up';
                              saveGame();
                              this.cutsceneActive = false;
                            });
                          },
                        });
                      },
                    });
                  });
                },
              }
            );
          });
        });
      },
    });
  }

  /**
   * PHASE 2: Triggered when the player tries to leave the lab after Rival picked their starter.
   */
  _runRivalChallengeCutscene() {
    const rival = this._findNpcById('rival') || this._spawnRivalNpc(5, 7, 'down');
    this.cutsceneActive = true;
    rival.facing = 'down';
    rival.showAlert = true;
    audio.alert();

    this._waitFrames(20, () => {
      rival.showAlert = false;
      this.player.facing = 'up';

      // Build clean path from rival to directly above the player (player.x, player.y - 1)
      const path = [];
      const targetX = this.player.x;
      const targetY = Math.max(7, this.player.y - 1);
      let cx = rival.x;
      let cy = rival.y;

      while (cx !== targetX) {
        path.push(targetX > cx ? 'right' : 'left');
        cx += targetX > cx ? 1 : -1;
      }
      while (cy < targetY) {
        path.push('down');
        cy += 1;
      }

      rival.walkPath(path, () => {
        rival.facing = 'down';
        this.player.facing = 'up';

        this.textBox.show(
          [
            "{RIVAL}: Wait, {PLAYER}! Let's check out our POKéMON!",
            "{RIVAL}: Come on, I'll take you on!",
          ],
          {
            onComplete: () => {
              const playerMon = getLeadPokemon();
              const rivalSpeciesId = gameState.rivalStarter
                ? gameState.rivalStarter.id
                : getCounterStarterId(playerMon.speciesId);
              const enemyMon = createPokemon(rivalSpeciesId, 5);

              this.manager.pushScene('battle', {
                playerMon,
                enemyMon,
                isTrainer: true,
                trainerName: gameState.rivalName || 'GARY',
                canLoseStory: true,
                onBattleEnd: (result) => this._onRivalBattleEnd(result),
              });
            },
          }
        );
      });
    });
  }

  /**
   * PHASE 2: Post-battle lab resolution (both Win & Lose continue story!).
   */
  _onRivalBattleEnd({ won }) {
    this._playMapMusic();
    this.cutsceneActive = true;
    gameState.flags.rivalBattleDone = true;
    gameState.flags.rivalBattleWon = Boolean(won);
    saveGame(); // Auto-save right after rival battle

    const rival = this._findNpcById('rival');
    const prof = this._findNpcById('prof');

    this.textBox.show(
      "{RIVAL}: Okay! I'll make my POKéMON fight to toughen it up! {PLAYER}! Gramps! Smell you later!",
      {
        onComplete: () => {
          const finishWithProf = () => {
            if (prof) prof.facing = 'down';
            this.player.facing = 'up';
            this.textBox.show('PROF: Your POKéMON looks tired. Let me heal it.', {
              onComplete: () => {
                // Heal jingle + sparkle burst -> full HP/PP
                audio.heal();
                healParty(gameState.party);
                this.particles.spawnHealSparkles(this.player.px, this.player.py);

                this._waitFrames(46, () => {
                  this.textBox.show(
                    'PROF: Battles like that are how you and your POKéMON grow stronger. Go show your MOM!',
                    {
                      onComplete: () => {
                        saveGame();
                        this.cutsceneActive = false;
                      },
                    }
                  );
                });
              },
            });
          };

          if (!rival) {
            finishWithProf();
            return;
          }

          // Rival walks around player if needed and exits through lab door (5, 11)
          const exitPath = [];
          let rx = rival.x;
          let ry = rival.y;
          if (rx === this.player.x && ry < this.player.y) {
            // Sidestep to avoid walking through player
            const sideDir = rx <= 5 ? 'right' : 'left';
            exitPath.push(sideDir);
            rx += sideDir === 'right' ? 1 : -1;
          }
          while (ry < 11) {
            exitPath.push('down');
            ry += 1;
          }
          while (rx !== 5) {
            exitPath.push(rx > 5 ? 'left' : 'right');
            rx += rx > 5 ? -1 : 1;
          }

          rival.walkPath(exitPath, () => {
            audio.door();
            this._removeNpcById('rival');
            this._waitFrames(12, finishWithProf);
          });
        },
      }
    );
  }

  /**
   * PHASE 2: Talking to Mom after the Rival battle heals your party anytime!
   */
  _runMomHealDialogue(mom) {
    this.cutsceneActive = true;
    mom.facePlayer(this.player.facing);

    const firstTime = !gameState.flags.healedByMom;
    const introLines = firstTime
      ? [
          'MOM: {PLAYER}! You got a POKéMON! ... And you battled {RIVAL}? Oh my!',
          'MOM: You both look tired. Take a rest.',
        ]
      : ['MOM: Welcome home, {PLAYER}! You and {STARTER} should take a quick rest.'];

    this.textBox.show(introLines, {
      onComplete: () => {
        audio.heal();
        this.manager.fadeAction(() => {
          healParty(gameState.party);
          gameState.flags.healedByMom = true;
          saveGame();
        });
        this._waitFrames(24, () => {
          this.particles.spawnHealSparkles(this.player.px, this.player.py);
          this.textBox.show(
            firstTime
              ? 'MOM: There! You and {STARTER} are looking fresh and full of energy!'
              : 'MOM: All healed up! Come home anytime if you need a rest, sweetie!',
            {
              onComplete: () => {
                this.cutsceneActive = false;
              },
            }
          );
        });
      },
    });
  }

  /** Debug 'B' key: launch an immediate test battle anywhere when CONFIG.DEBUG = true. */
  _startDebugBattle() {
    let playerMon = getLeadPokemon();
    let tempStarter = false;
    if (!playerMon) {
      playerMon = createPokemon(1, 5);
      tempStarter = true;
    } else {
      // Ensure full HP for quick debug testing
      healParty([playerMon]);
    }
    const enemyId = getCounterStarterId(playerMon.speciesId);
    const enemyMon = createPokemon(enemyId, 5);

    this.manager.pushScene('battle', {
      playerMon,
      enemyMon,
      location: this.map && !this.map.isIndoor ? 'grass' : 'lab',
      isTrainer: true,
      trainerName: gameState.rivalName || 'GARY',
      canLoseStory: true,
      isDebug: true,
      onBattleEnd: () => {
        this._playMapMusic();
        if (!tempStarter) {
          healParty(gameState.party);
        }
      },
    });
  }

  // =========================================================================
  // CLASSIC GEN 3 START MENU (ESC):
  //   POKéDEX / POKéMON / BAG / {PLAYER} / SAVE / OPTION / EXIT
  // =========================================================================

  _openPauseMenu() {
    audio.blip();
    this.optionMenu = null;
    const playerLabel = (gameState.playerName || 'RED').toUpperCase();

    this.pauseMenu = new Menu({
      options: [
        { label: 'POKéDEX', value: 'pokedex' },
        { label: 'POKéMON', value: 'party' },
        { label: 'BAG', value: 'bag' },
        { label: playerLabel, value: 'trainer' },
        { label: 'SAVE', value: 'save' },
        { label: 'OPTION', value: 'option' },
        { label: 'EXIT', value: 'close' },
      ],
      x: 332,
      y: 16,
      width: 132,
      scale: 1,
      cancelable: true,
      onSelect: (opt) => {
        if (opt.value === 'pokedex') {
          this.pauseMenu = null;
          this.textBox.show('POKéDEX is coming soon!');
        } else if (opt.value === 'party') {
          this.pauseMenu = null;
          this.showingParty = true;
        } else if (opt.value === 'bag') {
          this.pauseMenu = null;
          this.textBox.show('BAG is coming soon!');
        } else if (opt.value === 'trainer') {
          this.pauseMenu = null;
          this.textBox.show(
            `${playerLabel} — Money: ₽${gameState.money || 0} | Badges: 0. Full Trainer Card coming soon!`
          );
        } else if (opt.value === 'save') {
          this.pauseMenu = null;
          gameState.location = {
            mapId: this.map.id,
            x: this.player.x,
            y: this.player.y,
            facing: this.player.facing,
          };
          saveGame();
          audio.heal();
          this.textBox.show('{PLAYER} saved the game!');
        } else if (opt.value === 'option') {
          this.pauseMenu = null;
          this._openOptionMenu();
        } else {
          this.pauseMenu = null;
        }
      },
      onCancel: () => {
        this.pauseMenu = null;
      },
    });
  }

  _openOptionMenu() {
    const gfxLabel = `STYLE: ${(gameState.settings.graphicsMode || 'classic').toUpperCase()}`;
    const zoomLabel = `ZOOM: ${(gameState.settings.zoom || 'normal').toUpperCase()}`;
    const speedLabel = `TEXT: ${(gameState.settings.textSpeed || 'normal').toUpperCase()}`;
    const musicLabel = `MUSIC: ${audio.isMusicEnabled() ? 'ON' : 'OFF'}`;

    this.optionMenu = new Menu({
      options: [
        { label: gfxLabel, value: 'graphics' },
        { label: zoomLabel, value: 'zoom' },
        { label: speedLabel, value: 'textSpeed' },
        { label: musicLabel, value: 'music' },
        { label: 'BACK', value: 'back' },
      ],
      x: 278,
      y: 22,
      width: 186,
      scale: 1,
      cancelable: true,
      onSelect: (opt) => {
        if (opt.value === 'graphics') {
          gameState.settings.graphicsMode =
            gameState.settings.graphicsMode === 'classic' ? 'enhanced' : 'classic';
          saveGame();
          this._openOptionMenu();
        } else if (opt.value === 'zoom') {
          gameState.settings.zoom = gameState.settings.zoom === 'normal' ? 'close' : 'normal';
          saveGame();
          this._openOptionMenu();
        } else if (opt.value === 'textSpeed') {
          const cur = gameState.settings.textSpeed || 'normal';
          const nextIdx = (TEXT_SPEED_CYCLE.indexOf(cur) + 1) % TEXT_SPEED_CYCLE.length;
          gameState.settings.textSpeed = TEXT_SPEED_CYCLE[nextIdx];
          saveGame();
          this._openOptionMenu();
        } else if (opt.value === 'music') {
          audio.toggleMusic();
          this._openOptionMenu();
        } else {
          this.optionMenu = null;
          this._openPauseMenu();
        }
      },
      onCancel: () => {
        this.optionMenu = null;
        this._openPauseMenu();
      },
    });
  }

  // =========================================================================
  // COLLISION, WARPS & INTERACTIONS
  // =========================================================================

  isBlocked(tx, ty) {
    if (!this.map) return true;
    if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) {
      return true;
    }

    const tileId = this.map.tiles[ty][tx];
    if (SOLID_TILES.has(tileId)) {
      return true;
    }

    for (const npc of this.npcs) {
      if (npc.occupies(tx, ty)) return true;
    }

    return false;
  }

  _onStepStart(fromX, fromY, toX, toY) {
    const fromTile = this.map.tiles[fromY][fromX];
    const toTile = this.map.tiles[toY][toX];

    if (fromTile === TILE.PATH || toTile === TILE.PATH) {
      this.particles.spawnFootstepDust(fromX * TILE_SIZE, fromY * TILE_SIZE);
    }
    if (toTile === TILE.TALL_GRASS) {
      this.particles.spawnGrassRustle(toX * TILE_SIZE, toY * TILE_SIZE);
    }
  }

  _onTileEntered(tx, ty) {
    gameState.location = {
      mapId: this.map.id,
      x: tx,
      y: ty,
      facing: this.player.facing,
    };

    // PHASE 2: Trying to leave the lab triggers the Rival's challenge!
    if (
      this.map.id === 'lab' &&
      gameState.flags.rivalPickedStarter &&
      !gameState.flags.rivalBattleDone &&
      ty >= 9
    ) {
      this._runRivalChallengeCutscene();
      return;
    }

    const warp = (this.map.warps || []).find((w) => w.x === tx && w.y === ty);
    if (warp) {
      if (warp.guard === 'requireMom' && !gameState.flags.talkedToMom) {
        const mom = this._findNpcById('mom');
        if (mom) mom.facing = 'down';
        this.cutsceneActive = true;
        audio.alert();
        this.textBox.show('MOM: {PLAYER}! Come here first, sweetie.', {
          onComplete: () => {
            this.player.forceStep('up', () => {
              this.cutsceneActive = false;
            });
          },
        });
        return;
      }

      audio.door();
      this.cutsceneActive = true;
      this.manager.fadeAction(() => {
        this.loadMap(warp.targetMap, warp.targetX, warp.targetY, warp.targetFacing);
        saveGame();
      });
      return;
    }

    const trigger = (this.map.triggers || []).find((t) => t.x === tx && t.y === ty);
    if (trigger) {
      if (trigger.type === 'northExit') {
        this.cutsceneActive = true;
        audio.alert();

        if (!gameState.flags.gotStarter) {
          this.textBox.show("You shouldn't go out without a partner POKéMON!", {
            onComplete: () => {
              this.player.forceStep('down', () => {
                this.cutsceneActive = false;
              });
            },
          });
          return;
        }

        if (!gameState.flags.rivalBattleDone) {
          this.textBox.show("You should head back to the PROFESSOR's lab first!", {
            onComplete: () => {
              this.player.forceStep('down', () => {
                this.cutsceneActive = false;
              });
            },
          });
          return;
        }

        // End of Phase 2 trigger!
        this.textBox.show('Route 1 is coming soon! (End of Phase 2)', {
          onComplete: () => {
            gameState.flags.demoCompleted = true;
            this.player.forceStep('down', () => {
              gameState.location = {
                mapId: this.map.id,
                x: this.player.x,
                y: this.player.y,
                facing: 'down',
              };
              saveGame();
              this.cutsceneActive = false;
              this.manager.transitionTo('endOfDemo');
            });
          },
        });
        return;
      }

      if (trigger.type === 'neighbourDoor') {
        this.cutsceneActive = true;
        audio.blip();
        this.textBox.show("It's your neighbour's house. Nobody seems to be home right now.", {
          onComplete: () => {
            this.player.forceStep('down', () => {
              this.cutsceneActive = false;
            });
          },
        });
      }
    }
  }

  _handleInteract() {
    const target = this.player.getFacingTile();

    const npc = this.npcs.find((n) => n.x === target.x && n.y === target.y && !n.moving);
    if (npc) {
      // Special Mom healing interaction after Rival battle
      if (npc.id === 'mom' && gameState.flags.rivalBattleDone) {
        audio.blip();
        this._runMomHealDialogue(npc);
        return;
      }
      npc.facePlayer(this.player.facing);
      audio.blip();
      const lines = npc.getDialogue ? npc.getDialogue() : ['...'];
      this.textBox.show(lines);
      return;
    }

    const ball = (this.map.pokeballs || []).find(
      (b) => b.x === target.x && b.y === target.y
    );
    if (ball) {
      const starter = STARTERS[ball.starterIndex];
      audio.blip();

      if (gameState.starter) {
        if (gameState.starter.id === starter.id) {
          this.textBox.show("The spot where {STARTER}'s POKé BALL rested is now empty.");
        } else if (
          gameState.flags.rivalPickedStarter &&
          gameState.rivalStarter &&
          gameState.rivalStarter.id === starter.id
        ) {
          this.textBox.show("{RIVAL} took {RIVAL_STARTER}'s POKé BALL from here.");
        } else {
          this.textBox.show(
            'You already chose {STARTER}! Leave this POKé BALL for another trainer.'
          );
        }
        return;
      }

      this.manager.pushScene('starterSelect', {
        starter,
        onAccepted: () => this._runPostStarterSequence(),
      });
      return;
    }

    const key = `${target.x},${target.y}`;
    const lines = this.map.interactables && this.map.interactables[key];
    if (lines) {
      audio.blip();
      this.textBox.show(lines);
    }
  }

  // =========================================================================
  // CAMERA (SMOOTH ZOOM + EASING LERP + CLAMP)
  // =========================================================================

  _getTargetCamera() {
    const viewW = SCREEN_W / this.zoom;
    const viewH = SCREEN_H / this.zoom;
    const mapPxW = this.map.width * TILE_SIZE;
    const mapPxH = this.map.height * TILE_SIZE;

    let tx;
    if (mapPxW <= viewW) {
      tx = -(viewW - mapPxW) / 2;
    } else {
      tx = this.player.px + TILE_SIZE / 2 - viewW / 2;
      tx = Math.max(0, Math.min(mapPxW - viewW, tx));
    }

    let ty;
    if (mapPxH <= viewH) {
      ty = -(viewH - mapPxH) / 2;
    } else {
      ty = this.player.py + TILE_SIZE / 2 - viewH / 2;
      ty = Math.max(0, Math.min(mapPxH - viewH, ty));
    }

    return { x: tx, y: ty };
  }

  _updateCamera() {
    if (!this.map) return;
    const targetZoom = ZOOM_FACTORS[gameState.settings.zoom] || 2;
    if (Math.abs(targetZoom - this.zoom) < 0.01) {
      this.zoom = targetZoom;
    } else {
      this.zoom += (targetZoom - this.zoom) * 0.16;
    }

    const target = this._getTargetCamera();
    const dx = target.x - this.camX;
    const dy = target.y - this.camY;
    this.camX = Math.abs(dx) < 0.12 ? target.x : this.camX + dx * 0.14;
    this.camY = Math.abs(dy) < 0.12 ? target.y : this.camY + dy * 0.14;
  }

  // =========================================================================
  // FIXED-TIMESTEP UPDATE
  // =========================================================================

  update(input) {
    this.tick += 1;

    if (this.bannerTimer > 0) {
      this.bannerTimer -= 1;
    }

    // Party view overlay (opened from Esc Pause Menu)
    if (this.showingParty) {
      if (
        input.wasJustPressed('cancel') ||
        input.wasJustPressed('pause') ||
        input.wasJustPressed('confirm')
      ) {
        audio.cancel();
        this.showingParty = false;
      }
      return;
    }

    // Option Submenu
    if (this.optionMenu) {
      if (input.wasJustPressed('pause')) {
        audio.cancel();
        this.optionMenu = null;
        this._openPauseMenu();
        return;
      }
      this.optionMenu.update(input);
      this._updateCamera();
      return;
    }

    // Esc Start Menu
    if (this.pauseMenu) {
      if (input.wasJustPressed('pause')) {
        audio.cancel();
        this.pauseMenu = null;
        return;
      }
      this.pauseMenu.update(input);
      this._updateCamera();
      return;
    }

    if (this.pendingCutscene && !this.manager.isTransitioning()) {
      this._startPendingCutscene();
    }

    if (this.cutsceneDelay > 0) {
      this.cutsceneDelay -= 1;
      if (this.cutsceneDelay === 0 && this.cutsceneCallback) {
        const cb = this.cutsceneCallback;
        this.cutsceneCallback = null;
        cb();
      }
    }

    const locked =
      this.textBox.active ||
      this.cutsceneActive ||
      this.pendingCutscene !== null ||
      this.manager.isTransitioning();

    const canNpcStep = (nx, ny) => {
      if (this.isBlocked(nx, ny)) return false;
      if (this.player.x === nx && this.player.y === ny) return false;
      if (this.player.moving && this.player.targetX === nx && this.player.targetY === ny) {
        return false;
      }
      return true;
    };

    for (const npc of this.npcs) {
      npc.update({ frozen: locked, canStepTo: canNpcStep });
    }

    this.particles.update(this.player);

    if (this.textBox.active) {
      this.textBox.update(input);
      if (this.player.moving) {
        this.player.update(null, (x, y) => this.isBlocked(x, y), null);
      }
      this._updateCamera();
      return;
    }

    // Open Esc Start Menu or Debug 'B' Battle when standing freely
    if (!locked && !this.player.moving) {
      if (input.wasJustPressed('pause')) {
        this._openPauseMenu();
        return;
      }
      if (CONFIG.DEBUG && input.wasJustPressed('debugBattle')) {
        this._startDebugBattle();
        return;
      }
    }

    const canHopLedge = (tx, ty, dir) => {
      if (dir !== 'down' || !this.map) return false;
      if (ty < 0 || tx < 0 || ty >= this.map.height || tx >= this.map.width) return false;
      return this.map.tiles[ty][tx] === TILE.LEDGE;
    };

    this.player.update(
      locked ? null : input,
      (tx, ty) => this.isBlocked(tx, ty),
      (tx, ty) => this._onTileEntered(tx, ty),
      (fx, fy, tx, ty) => this._onStepStart(fx, fy, tx, ty),
      canHopLedge
    );

    if (!locked && !this.player.moving && input.wasJustPressed('confirm')) {
      this._handleInteract();
    }

    this._updateCamera();
  }

  // =========================================================================
  // 7-LAYER HD-2D RENDER PIPELINE
  // =========================================================================

  render(ctx) {
    if (!this.map) return;

    ctx.fillStyle = this.map.bgColor || '#0E1018';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    const zoom = this.zoom;
    const viewW = SCREEN_W / zoom;
    const viewH = SCREEN_H / zoom;
    const camX = Math.round(this.camX * zoom) / zoom;
    const camY = Math.round(this.camY * zoom) / zoom;

    const animFrame = Math.floor(this.tick / 18) % 4;

    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const endCol = Math.min(this.map.width - 1, Math.ceil((camX + viewW) / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
    const endRow = Math.min(this.map.height - 1, Math.ceil((camY + viewH) / TILE_SIZE) + 1);

    // --- WORLD LAYERS (1..4) AT CRISP PIXEL ZOOM (2x Normal or 3x Close) ---
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // LAYER 1: Ground
    if (this.groundCache) {
      ctx.drawImage(this.groundCache, 0, 0);
    }
    for (let r = startRow; r <= endRow; r++) {
      const row = this.map.tiles[r];
      for (let c = startCol; c <= endCol; c++) {
        if (ANIMATED_TILES.has(row[c])) {
          drawMapTile(ctx, this.map, c, r, c * TILE_SIZE, r * TILE_SIZE, animFrame);
        }
      }
    }

    // LAYER 2: Ground details (character shadows + footstep dust/rustles/heal sparkles)
    this.player.renderShadow(ctx);
    for (const npc of this.npcs) {
      npc.renderShadow(ctx);
    }
    this.particles.renderGroundFx(ctx);

    // LAYER 3: Y-sorted Objects & 24x36 Entities
    const drawList = [];

    for (let r = startRow; r <= endRow; r++) {
      const row = this.map.tiles[r];
      for (let c = startCol; c <= endCol; c++) {
        const tid = row[c];
        if (Y_SORT_TILES.has(tid)) {
          drawList.push({
            sortY: r * TILE_SIZE + 12,
            draw: () => drawTile(ctx, tid, c * TILE_SIZE, r * TILE_SIZE, animFrame),
          });
        }
      }
    }

    // Remaining starter Poké Balls on the Lab Table
    const ballPulse = Math.sin(this.tick * 0.1) * 0.5 + 0.5;
    for (const ball of this.map.pokeballs || []) {
      const starter = STARTERS[ball.starterIndex];
      if (!starter) continue;
      if (gameState.starter && gameState.starter.id === starter.id) continue;
      if (
        gameState.flags.rivalPickedStarter &&
        gameState.rivalStarter &&
        gameState.rivalStarter.id === starter.id
      ) {
        continue;
      }
      drawList.push({
        sortY: ball.y * TILE_SIZE + 13,
        draw: () => drawPokeBall(ctx, ball.x * TILE_SIZE, ball.y * TILE_SIZE, ballPulse),
      });
    }

    drawList.push({
      sortY: this.player.py + 14,
      draw: () => this.player.render(ctx),
    });
    for (const npc of this.npcs) {
      drawList.push({
        sortY: npc.py + 14,
        draw: () => npc.render(ctx),
      });
    }

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) {
      item.draw();
    }

    // Gen 3 tall-grass foreground blades hiding the lower legs of anyone standing in tall grass
    const checkTallGrassCover = (ent) => {
      if (ent.jumping) return;
      const cx = Math.round(ent.px / TILE_SIZE);
      const cy = Math.round(ent.py / TILE_SIZE);
      if (
        cy >= 0 &&
        cx >= 0 &&
        cy < this.map.height &&
        cx < this.map.width &&
        this.map.tiles[cy][cx] === TILE.TALL_GRASS
      ) {
        drawTallGrassOverlay(ctx, cx * TILE_SIZE, cy * TILE_SIZE);
      }
    };
    checkTallGrassCover(this.player);
    for (const npc of this.npcs) {
      checkTallGrassCover(npc);
    }

    // LAYER 4: Overhead layer (32x24 Gen 3 tree canopies, roof overhangs, chimneys)
    const overStartRow = Math.max(0, startRow - 1);
    const overEndRow = Math.min(this.map.height - 1, endRow + 1);
    for (let r = overStartRow; r <= overEndRow; r++) {
      const row = this.map.tiles[r];
      for (let c = startCol; c <= endCol; c++) {
        const tid = row[c];
        if (tid === TILE.TREE) {
          drawTreeOverhead(ctx, c * TILE_SIZE, r * TILE_SIZE);
        } else if (OVERHEAD_ROOF_TILES.has(tid)) {
          drawTile(ctx, tid, c * TILE_SIZE, r * TILE_SIZE, 0);
        }
      }
    }
    for (const ch of this.map.chimneys || []) {
      drawChimneyOverhead(ctx, ch.x * TILE_SIZE, ch.y * TILE_SIZE);
    }

    ctx.restore();

    // --- SCREEN-SPACE LAYERS (5..7) ---
    const isEnhanced = gameState.settings && gameState.settings.graphicsMode === 'enhanced';

    // Classic mode (default): pure Gen 3 pixel art — no vignette, bloom, grading, or drifting particles.
    // Enhanced mode: enables HD lighting, sunbeams, vignette & ambient particles/birds.
    if (isEnhanced) {
      this.lighting.render(ctx, this.map, camX, camY, zoom, this.tick);
      this.particles.renderAirborne(ctx, camX, camY, zoom);
    }

    // LAYER 7: UI (Area Nameplate, Dialogue Box, Esc Start Menu, Option Menu, Party Overlay)
    if (this.bannerTimer > 0 && !this.textBox.active && !this.pauseMenu && !this.optionMenu) {
      const slide =
        this.bannerTimer > 104
          ? -(this.bannerTimer - 104) * 3
          : this.bannerTimer < 16
            ? -(16 - this.bannerTimer) * 3
            : 0;
      const bw = measureText(this.bannerText, 2) + 32;
      drawGbaBox(ctx, 14, 12 + slide, bw, 30, {
        fill: '#F8F8F8',
        outerBorder: '#384452',
        accentBorder: isEnhanced ? '#4C86A8' : '#80A4C4',
        accentHighlight: isEnhanced ? '#80BCE0' : '#C4DCEE',
        innerBorder: '#445464',
        shadow: isEnhanced,
      });
      drawText(ctx, this.bannerText, 30, 20 + slide, {
        color: '#222C3A',
        shadow: '#D4DCE4',
        scale: 2,
      });
    }

    this.textBox.render(ctx);

    if (this.pauseMenu) {
      this.pauseMenu.render(ctx);
    }
    if (this.optionMenu) {
      this.optionMenu.render(ctx);
    }

    if (this.showingParty) {
      renderPartyOverlay(ctx, gameState.party);
    }
  }
}
