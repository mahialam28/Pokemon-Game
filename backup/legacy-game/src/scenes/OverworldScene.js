/**
 * HD-2D / Classic Gen 3 Layered Overworld Scene (Phase 1 + Phase 2 + Phase 3).
 * - Seamless map connections (Dawnleaf Town <-> Route 1 <-> Verdant City) with Gen 3 area banners
 * - Phase 3 story unlocks: Mom's 2 Potions on house exit + Professor's 5 Poké Balls & Pokédex at town north exit
 * - Tall-grass wild encounters (1/10 chance on Route 1), hidden items (Z), Route 1 Mart sample
 * - Verdant City Pokémon Center (Nurse Joy healing cutscene w/ Poké Balls on glowing machine + PC box count)
 * - Verdant City Poké Mart shop, enterable Collector's house, resting Old Man north blocker
 * - Full Gen 3 Start Menu (POKéDEX, POKéMON, BAG, {PLAYER} Trainer Card, SAVE, OPTION, EXIT)
 * - Debug keys (CONFIG.DEBUG): B (instant battle), G (toggle encounters), H (heal party)
 */

import { audio } from '../audio.js';
import { CONFIG, ZOOM_FACTORS } from '../config.js';
import { rollWildEncounter } from '../data/encounters.js';
import { getItem } from '../data/items.js';
import {
  createPokemon,
  fetchSpeciesFromPokeApi,
  getCounterStarterId,
  healParty,
} from '../data/pokemon.js';
import { STARTERS } from '../data/starters.js';
import { NPC } from '../entities/NPC.js';
import { DIR_VECTORS, Player } from '../entities/Player.js';
import { drawPokeBall } from '../entities/sprites.js';
import {
  addItem,
  gameState,
  getFirstHealthyPartyIndex,
  getLeadPokemon,
  saveGame,
} from '../state.js';
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
import { HERO_OVERHEAD_TILES } from '../world/heroHouseTiles.js';
import { RIVAL_OVERHEAD_TILES } from '../world/rivalHouseTiles.js';
import { FRIEND_OVERHEAD_TILES } from '../world/friendHouseTiles.js';

const SCREEN_W = 480;
const SCREEN_H = 270;

const ANIMATED_TILES = new Set([
  TILE.FLOWER,
  TILE.TALL_GRASS,
  TILE.WATER,
  TILE.TV,
  TILE.LAB_MACHINE,
  TILE.FOUNTAIN,
  TILE.HEAL_MACHINE,
]);

const OVERHEAD_ROOF_TILES = new Set([
  TILE.ROOF_RED,
  TILE.ROOF_BLUE,
  TILE.ROOF_LAB,
  TILE.PC_ROOF_00,
  TILE.PC_ROOF_10,
  TILE.PC_ROOF_20,
  TILE.PC_ROOF_30,
  TILE.PC_ROOF_01,
  TILE.PC_ROOF_11,
  TILE.PC_ROOF_21,
  TILE.PC_ROOF_31,
  TILE.HERO_ROOF_L,
  TILE.HERO_ROOF_M,
  TILE.HERO_ROOF_DORMER,
  TILE.HERO_ROOF_R,
  TILE.FRIEND_ROOF_L,
  TILE.FRIEND_ROOF_M,
  TILE.FRIEND_ROOF_R,
  TILE.RIVAL_ROOF_L,
  TILE.RIVAL_ROOF_PEAK,
  TILE.RIVAL_ROOF_R,
  TILE.MART_ROOF_00,
  TILE.MART_ROOF_10,
  TILE.MART_ROOF_20,
  TILE.MART_ROOF_30,
  TILE.MART_ROOF_01,
  TILE.MART_ROOF_11,
  TILE.MART_ROOF_21,
  TILE.MART_ROOF_31,
  TILE.GYM_ROOF_00,
  TILE.GYM_ROOF_10,
  TILE.GYM_ROOF_20,
  TILE.GYM_ROOF_30,
  TILE.GYM_ROOF_01,
  TILE.GYM_ROOF_11,
  TILE.GYM_ROOF_21,
  TILE.GYM_ROOF_31,
  TILE.ROOF_AMBER,
  TILE.ROOF_AMBER_TRIM,
  TILE.DOME_ROOF,
  ...HERO_OVERHEAD_TILES,
  ...RIVAL_OVERHEAD_TILES,
  ...FRIEND_OVERHEAD_TILES,
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

    this.zoom = ZOOM_FACTORS[gameState.settings.zoom] || 2;
    this.camX = 0;
    this.camY = 0;

    this.tick = 0;
    this.cutsceneActive = false;
    this.pendingCutscene = null;
    this.cutsceneDelay = 0;
    this.cutsceneCallback = null;

    // Esc Start Menu, Option Submenu & contextual Yes/No prompt (Nurse Joy)
    this.pauseMenu = null;
    this.optionMenu = null;
    this.yesNoMenu = null;

    // Pokémon Center healing machine visual state
    this.centerHealBalls = 0;
    this.centerHealGlow = false;

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
      : map.id === 'pokecenter'
        ? TILE.CENTER_FLOOR
        : map.id === 'lab' || map.id === 'pokemart'
          ? TILE.LAB_FLOOR
          : TILE.WOOD_FLOOR;

    for (let r = 0; r < map.height; r++) {
      for (let col = 0; col < map.width; col++) {
        if (!map.isIndoor) {
          drawTile(gctx, TILE.GRASS, col * TILE_SIZE, r * TILE_SIZE, 0);
        }
        const tid = map.tiles[r][col];
        if (Y_SORT_TILES.has(tid)) {
          if (map.isIndoor) drawTile(gctx, baseFloorTile, col * TILE_SIZE, r * TILE_SIZE, 0);
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
            above === TILE.LAB_DOOR ||
            above === TILE.PC_WALL_03 ||
            above === TILE.PC_DOOR_13 ||
            above === TILE.PC_DOOR_23 ||
            above === TILE.PC_WALL_33 ||
            above === TILE.HERO_DOOR ||
            above === TILE.HERO_WALL_R ||
            above === TILE.HERO_EXT_PORCH_DOOR ||
            above === TILE.HERO_EXT_WALL_WIN_L ||
            above === TILE.HERO_EXT_WALL_GABLE_L ||
            above === TILE.HERO_EXT_WALL_WIN_R ||
            above === TILE.HERO_EXT_WALL_R_BASE ||
            above === TILE.RIVAL_EXT_PORCH_DOOR ||
            above === TILE.RIVAL_EXT_WALL_L_BASE ||
            above === TILE.RIVAL_EXT_AWNING_WIN_BOT ||
            above === TILE.RIVAL_EXT_WALL_WIN_R ||
            above === TILE.RIVAL_EXT_WALL_R_BASE ||
            above === TILE.FRIEND_EXT_DOOR_PORCH ||
            above === TILE.FRIEND_EXT_WALL_WIN_L ||
            above === TILE.FRIEND_EXT_WALL_GABLE_B ||
            above === TILE.FRIEND_EXT_WALL_R_BASE ||
            above === TILE.RIVAL_WALL_BRICK ||
            above === TILE.RIVAL_DOOR ||
            above === TILE.MART_WALL_03 ||
            above === TILE.MART_DOOR_13 ||
            above === TILE.MART_DOOR_23 ||
            above === TILE.MART_WALL_33 ||
            above === TILE.GYM_WALL_03 ||
            above === TILE.GYM_DOOR_13 ||
            above === TILE.GYM_DOOR_23 ||
            above === TILE.GYM_WALL_33;
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
    else if (this.map.id === 'route1') audio.playTrack('route1');
    else if (this.map.id === 'city') audio.playTrack('city');
    else if (this.map.id === 'lab') audio.playTrack('lab');
    else audio.playTrack('indoors');
  }

  loadMap(mapId, x, y, facing = 'down', { seamless = false } = {}) {
    this.map = getMap(mapId);
    this.player.setPosition(x, y, facing);
    this.npcs = (this.map.npcs || []).map((cfg) => new NPC(cfg));
    this.textBox.close();
    this.pauseMenu = null;
    this.optionMenu = null;
    this.yesNoMenu = null;
    this.centerHealBalls = 0;
    this.centerHealGlow = false;

    this._playMapMusic();

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

    const showBannerMaps = new Set(['town', 'lab', 'route1', 'city', 'pokecenter', 'pokemart']);
    if (seamless || showBannerMaps.has(this.map.id)) {
      this.bannerText = this.map.name;
      this.bannerTimer = 120;
    } else {
      this.bannerTimer = 0;
    }

    if (!seamless) {
      if (this.map.id === 'downstairs' && !gameState.flags.talkedToMom) {
        this.pendingCutscene = 'momIntro';
      } else if (this.map.id === 'lab' && !gameState.flags.metProf) {
        this.pendingCutscene = 'profIntro';
      }
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

  _spawnFriendNpc(x, y, facing = 'up') {
    let friend = this._findNpcById('friend');
    if (friend) return friend;
    friend = new NPC({
      id: 'friend',
      name: gameState.friendName || 'FRIEND',
      sprite: 'friend',
      x,
      y,
      facing,
      idleLook: false,
      getDialogue: () => {
        if (gameState.flags.goalsDiscussed) {
          return [
            "{FRIEND}: I want to find and catch every single POKéMON!",
            "{FRIEND}: Best of luck on your journey to defeat the Champion, {PLAYER}!",
          ];
        }
        if (gameState.flags.friendReceivedStarter) {
          return [
            "{FRIEND}: {FRIEND_STARTER} and I are going to be wonderful partners!",
          ];
        }
        return [
          "{FRIEND}: POKéMON are such amazing creatures, aren't they, {PLAYER}?",
        ];
      },
    });
    this.npcs.push(friend);
    return friend;
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
  // PHASE 1, PHASE 2 & PHASE 3 STORY CUTSCENES
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

  _runPostStarterSequence() {
    this.cutsceneActive = true;
    const prof = this._findNpcById('prof');
    if (prof) prof.facing = 'right';

    this.textBox.show('PROF: {STARTER} looks happy to be with you!', {
      onComplete: () => {
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

            // Friend enters the lab right behind rival
            audio.door();
            const friend = this._spawnFriendNpc(5, 11, 'up');

            this.textBox.show(
              [
                "{RIVAL}: Gramps! I'm here! ... Huh? {PLAYER}, you're already here?",
                '{RIVAL}: No fair! I wanted to pick first!',
              ],
              {
                onComplete: () => {
                  friend.walkPath(['up', 'up', 'up', 'left'], () => {
                    friend.facing = 'up';

                    const rivalId = gameState.rivalStarter ? gameState.rivalStarter.id : 4;
                    const ballIdx = STARTERS.findIndex((s) => s.id === rivalId);
                    const ball = (this.map.pokeballs || [])[Math.max(0, ballIdx)] || { x: 8, y: 4 };

                    const pathToBall = ['up'];
                    const dx = ball.x - 5;
                    for (let i = 0; i < Math.abs(dx); i++) {
                      pathToBall.push(dx > 0 ? 'right' : 'left');
                    }
                    const targetStandingFree = !(this.player.x === ball.x && this.player.y === 5);
                    if (targetStandingFree) {
                      pathToBall.push('up');
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
                              const backPath = [];
                              if (rival.y === 5) backPath.push('down');
                              const bx = 6 - rival.x;
                              for (let i = 0; i < Math.abs(bx); i++) {
                                backPath.push(bx > 0 ? 'right' : 'left');
                              }
                              backPath.push('down');

                              rival.walkPath(backPath, () => {
                                rival.facing = 'up';

                                // Friend steps up to take the remaining starter
                                const friendId = gameState.friendStarter ? gameState.friendStarter.id : 1;
                                const fBallIdx = STARTERS.findIndex((s) => s.id === friendId);
                                const fBall = (this.map.pokeballs || [])[Math.max(0, fBallIdx)] || { x: 6, y: 4 };

                                this.textBox.show(
                                  [
                                    "{FRIEND}: Hello Professor! Hello {PLAYER}!",
                                    "{FRIEND}: Is the last POKéMON for me? I love POKéMON more than anything!",
                                    "{FRIEND}: I promise to take wonderful care of you!",
                                  ],
                                  {
                                    onComplete: () => {
                                      const pathToFriendBall = ['right', 'up', 'up'];
                                      const fdx = fBall.x - 5;
                                      for (let i = 0; i < Math.abs(fdx); i++) {
                                        pathToFriendBall.push(fdx > 0 ? 'right' : 'left');
                                      }

                                      friend.walkPath(pathToFriendBall, () => {
                                        friend.facing = 'up';
                                        audio.fanfare();
                                        gameState.flags.friendReceivedStarter = true;
                                        saveGame();

                                        this.textBox.show('{FRIEND} received {FRIEND_STARTER}!', {
                                          onComplete: () => {
                                            const fBack = ['down', 'left', 'left'];
                                            friend.walkPath(fBack, () => {
                                              friend.facing = 'right';
                                              saveGame();
                                              this.cutsceneActive = false;
                                            });
                                          },
                                        });
                                      });
                                    },
                                  }
                                );
                              });
                            },
                          });
                        },
                      });
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

  _runRivalChallengeCutscene() {
    const rival = this._findNpcById('rival') || this._spawnRivalNpc(5, 7, 'down');
    this.cutsceneActive = true;
    rival.facing = 'down';
    rival.showAlert = true;
    audio.alert();

    this._waitFrames(20, () => {
      rival.showAlert = false;
      this.player.facing = 'up';

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
              const enemyMon = createPokemon(rivalSpeciesId, 5, { allowShiny: false });

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

  _onRivalBattleEnd({ won }) {
    this._playMapMusic();
    this.cutsceneActive = true;
    gameState.flags.rivalBattleDone = true;
    gameState.flags.rivalBattleWon = Boolean(won);
    saveGame();

    const rival = this._findNpcById('rival');
    const friend = this._findNpcById('friend');
    const prof = this._findNpcById('prof');

    this.textBox.show(
      "{RIVAL}: Okay! I'll make my POKéMON fight to toughen it up! {PLAYER}! Gramps! Smell you later!",
      {
        onComplete: () => {
          const runGoalsSequence = () => {
            if (prof) prof.facing = 'down';
            if (friend) friend.facing = 'up';
            this.player.facing = 'up';

            this.textBox.show(
              'PROF: What an incredible battle! Now, before you both set out into the wider world, tell me: what are your dreams for the future?',
              {
                onComplete: () => {
                  this.textBox.show(
                    '{PLAYER}: I want to become the Champion by defeating the legendary trainer who defeated Leo.',
                    {
                      onComplete: () => {
                        this.textBox.show(
                          '{FRIEND}: I love Pokémon more than anything. I want to find and catch every Pokémon and become the best Pokémon researcher.',
                          {
                            onComplete: () => {
                              this.textBox.show(
                                'PROF: Magnificent! Those are wonderful goals. Work hard with your partners and you will both accomplish great things! Let me heal your POKéMON.',
                                {
                                  onComplete: () => {
                                    audio.heal();
                                    healParty(gameState.party);
                                    this.particles.spawnHealSparkles(this.player.px, this.player.py);
                                    gameState.flags.goalsDiscussed = true;
                                    saveGame();

                                    this._waitFrames(46, () => {
                                      if (friend) {
                                        friend.facing = 'right';
                                        this.player.facing = 'left';
                                        this.textBox.show(
                                          [
                                            '{FRIEND}: Let us both give it our all, {PLAYER}!',
                                            "{FRIEND}: I'll be exploring the routes to see every kind of POKéMON. See you soon!",
                                          ],
                                          {
                                            onComplete: () => {
                                              friend.walkPath(['down', 'down', 'down', 'down', 'down'], () => {
                                                audio.door();
                                                this._removeNpcById('friend');
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
                                          }
                                        );
                                      } else {
                                        this.textBox.show(
                                          'PROF: Battles like that are how you and your POKéMON grow stronger. Go show your MOM!',
                                          {
                                            onComplete: () => {
                                              saveGame();
                                              this.cutsceneActive = false;
                                            },
                                          }
                                        );
                                      }
                                    });
                                  },
                                }
                              );
                            },
                          }
                        );
                      },
                    }
                  );
                },
              }
            );
          };

          if (!rival) {
            runGoalsSequence();
            return;
          }

          const exitPath = [];
          let rx = rival.x;
          let ry = rival.y;
          if (rx === this.player.x && ry < this.player.y) {
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
            this._waitFrames(12, runGoalsSequence);
          });
        },
      }
    );
  }

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
          gameState.respawn = { mapId: 'downstairs', x: 4, y: 5, facing: 'down' };
          saveGame();
        });
        this._waitFrames(24, () => {
          this.particles.spawnHealSparkles(this.player.px, this.player.py);
          this.textBox.show(
            firstTime
              ? 'MOM: There! You and {STARTER} are looking fresh and full of energy! Now head north toward ROUTE 1!'
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

  /**
   * PHASE 3 PART 1: Before leaving Dawnleaf Town north onto Route 1,
   * Professor runs up and gives 5 POKé BALLS + POKéDEX!
   */
  _runProfStarterKitCutscene(tx) {
    this.cutsceneActive = true;
    this.player.facing = 'down';
    audio.alert();

    const prof = new NPC({
      id: 'profTownGift',
      name: 'PROF',
      sprite: 'prof',
      x: tx,
      y: 6,
      facing: 'up',
      idleLook: false,
      getDialogue: () => ['PROF: Good luck on ROUTE 1!'],
    });
    this.npcs.push(prof);
    prof.showAlert = true;

    this._waitFrames(16, () => {
      prof.showAlert = false;
      prof.walkPath(['up', 'up', 'up', 'up'], () => {
        prof.facing = 'up';
        this.player.facing = 'down';
        this.textBox.show(
          'PROF: Wait, {PLAYER}! Take these POKé BALLS. Weaken wild POKéMON, then throw one to catch them!',
          {
            onComplete: () => {
              addItem('pokeball', 5);
              gameState.flags.receivedStarterKit = true;
              saveGame();
              audio.fanfare();
              this.textBox.show(
                [
                  '{PLAYER} received 5 POKé BALLS!',
                  '{PLAYER} received the POKéDEX!',
                  'PROF: Head north through ROUTE 1 to VERDANT CITY. Good luck!',
                ],
                {
                  onComplete: () => {
                    prof.walkPath(['down', 'down', 'down', 'down'], () => {
                      this._removeNpcById('profTownGift');
                      this.cutsceneActive = false;
                    });
                  },
                }
              );
            },
          }
        );
      });
    });
  }

  /**
   * PHASE 3 PART 5: Pokémon Center Nurse Joy healing cutscene!
   * Places balls one-by-one on glowing healing machine + heal jingle + bow + sets respawn.
   */
  _runNurseHealCutscene() {
    const nurse = this._findNpcById('nurse');
    this.cutsceneActive = true;
    this.textBox.show(
      'NURSE: Welcome to our POKéMON CENTER! Shall we heal your POKéMON?',
      { waitForConfirm: false }
    );

    this.yesNoMenu = new Menu({
      options: [
        { label: 'YES', value: 'yes' },
        { label: 'NO', value: 'no' },
      ],
      x: 374,
      y: 128,
      width: 86,
      scale: 1,
      cancelable: true,
      onSelect: (opt) => {
        this.yesNoMenu = null;
        if (opt.value === 'no') {
          this.textBox.show('NURSE: We hope to see you again!', {
            onComplete: () => {
              this.cutsceneActive = false;
            },
          });
          return;
        }

        this.textBox.show("NURSE: Okay, I'll take your POKéMON for a few seconds.", {
          onComplete: () => {
            if (nurse) nurse.facing = 'left';
            const count = Math.max(1, (gameState.party || []).length);
            let placed = 0;

            const placeNextBall = () => {
              placed += 1;
              this.centerHealBalls = placed;
              audio.blip();
              if (placed < count) {
                this._waitFrames(10, placeNextBall);
              } else {
                this._waitFrames(8, () => {
                  this.centerHealGlow = true;
                  audio.heal();
                  let hx = 5, hy = 1;
                  for (let r = 0; r < this.map.height; r++) {
                    for (let c = 0; c < this.map.width; c++) {
                      if (this.map.tiles[r][c] === TILE.HEAL_MACHINE) {
                        hx = c; hy = r; break;
                      }
                    }
                  }
                  this.particles.spawnHealSparkles(hx * TILE_SIZE, hy * TILE_SIZE);
                  healParty(gameState.party);
                  gameState.respawn = {
                    mapId: 'pokecenter',
                    x: 6,
                    y: 4,
                    facing: 'up',
                  };
                  saveGame();

                  this._waitFrames(46, () => {
                    this.centerHealGlow = false;
                    this.centerHealBalls = 0;
                    if (nurse) {
                      nurse.facing = 'down';
                      nurse.bowY = 2;
                    }
                    this._waitFrames(16, () => {
                      if (nurse) nurse.bowY = 0;
                      this.textBox.show(
                        [
                          "NURSE: Thank you for waiting. We've restored your POKéMON to full health!",
                          'NURSE: We hope to see you again!',
                        ],
                        {
                          onComplete: () => {
                            this.cutsceneActive = false;
                          },
                        }
                      );
                    });
                  });
                });
              }
            };

            this._waitFrames(8, placeNextBall);
          },
        });
      },
      onCancel: () => {
        this.yesNoMenu = null;
        this.textBox.show('NURSE: We hope to see you again!', {
          onComplete: () => {
            this.cutsceneActive = false;
          },
        });
      },
    });
  }

  // =========================================================================
  // WILD ENCOUNTERS & DEBUG KEYS (B, G, H)
  // =========================================================================

  _startWildEncounter(speciesId, level) {
    const healthyIdx = getFirstHealthyPartyIndex();
    const playerMon = healthyIdx >= 0 ? gameState.party[healthyIdx] : getLeadPokemon();
    if (!playerMon) return;

    this.cutsceneActive = true;
    const wildMon = createPokemon(speciesId, level, {
      otName: 'WILD',
      otId: '00000',
      allowShiny: true,
    });
    // Opportunistically fetch & cache species stats from PokéAPI in background
    fetchSpeciesFromPokeApi(speciesId).catch(() => {});

    this.manager.pushScene('battle', {
      playerMon,
      enemyMon: wildMon,
      partyIndex: healthyIdx >= 0 ? healthyIdx : 0,
      location: 'grass',
      isWild: true,
      isTrainer: false,
      onBattleEnd: (res) => {
        this.cutsceneActive = false;
        if (res && res.blackout) {
          const sp = gameState.respawn || { mapId: 'downstairs', x: 4, y: 5, facing: 'down' };
          this.loadMap(sp.mapId, sp.x, sp.y, sp.facing);
          saveGame();
        } else {
          this._playMapMusic();
        }
      },
    });
  }

  /** Debug 'B' key: Wild Route 1 battle on Route 1; Rival test battle elsewhere. */
  _startDebugBattle() {
    const healthyIdx = getFirstHealthyPartyIndex();
    let playerMon = healthyIdx >= 0 ? gameState.party[healthyIdx] : getLeadPokemon();
    let tempStarter = false;
    if (!playerMon) {
      playerMon = createPokemon(1, 5);
      tempStarter = true;
    } else {
      healParty([playerMon]);
    }

    if (this.map && this.map.id === 'route1') {
      const sampleIds = [16, 19, 10, 13, 25, 29, 32];
      const pick = sampleIds[Math.floor(Math.random() * sampleIds.length)];
      const wildMon = createPokemon(pick, 3 + Math.floor(Math.random() * 3), { allowShiny: true });
      this.manager.pushScene('battle', {
        playerMon,
        enemyMon: wildMon,
        partyIndex: healthyIdx >= 0 ? healthyIdx : 0,
        location: 'grass',
        isWild: true,
        isTrainer: false,
        onBattleEnd: (res) => {
          if (res && res.blackout) {
            const sp = gameState.respawn || { mapId: 'downstairs', x: 4, y: 5, facing: 'down' };
            this.loadMap(sp.mapId, sp.x, sp.y, sp.facing);
          } else {
            this._playMapMusic();
          }
        },
      });
      return;
    }

    const enemyId = getCounterStarterId(playerMon.speciesId);
    const enemyMon = createPokemon(enemyId, 5, { allowShiny: false });

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
          this.manager.pushScene('pokedex');
        } else if (opt.value === 'party') {
          this.pauseMenu = null;
          this.manager.pushScene('party', { mode: 'overworld' });
        } else if (opt.value === 'bag') {
          this.pauseMenu = null;
          this.manager.pushScene('bag', { mode: 'overworld' });
        } else if (opt.value === 'trainer') {
          this.pauseMenu = null;
          this.manager.pushScene('trainerCard');
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
  // COLLISION, SEAMLESS CONNECTIONS, WARPS & INTERACTIONS
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

  /** Check if walking off the edge of the current map connects seamlessly to an adjacent map. */
  _trySeamlessEdgeTransition(input) {
    if (!this.map || !this.map.connections) return false;
    const dir = input.getHeldDirection();
    if (!dir || dir !== this.player.facing) return false;

    const v = DIR_VECTORS[dir];
    const nx = this.player.x + v.dx;
    const ny = this.player.y + v.dy;

    let conn = null;
    if (ny < 0 && this.map.connections.north) conn = this.map.connections.north;
    else if (ny >= this.map.height && this.map.connections.south) conn = this.map.connections.south;
    if (!conn) return false;

    const nextMap = getMap(conn.targetMap);
    const targetX = Math.max(0, Math.min(nextMap.width - 1, nx + (conn.targetXOffset || 0)));
    const targetY = conn.targetY;
    if (SOLID_TILES.has(nextMap.tiles[targetY][targetX])) return false;

    this.loadMap(conn.targetMap, targetX, targetY, dir, { seamless: true });
    saveGame();
    return true;
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

    // PHASE 2: Trying to leave the lab triggers the Rival's challenge
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

      // PHASE 3 PART 1: Mom gives 2 POTIONS when leaving home after Rival battle & heal!
      if (
        this.map.id === 'downstairs' &&
        warp.targetMap === 'town' &&
        gameState.flags.rivalBattleDone &&
        gameState.flags.healedByMom &&
        !gameState.flags.receivedMomPotions
      ) {
        const mom = this._findNpcById('mom');
        if (mom) {
          mom.facing = 'down';
          mom.showAlert = true;
        }
        this.cutsceneActive = true;
        audio.alert();
        this._waitFrames(14, () => {
          if (mom) mom.showAlert = false;
          this.player.facing = 'up';
          this.textBox.show('MOM: Wait, {PLAYER}! Take these, just in case!', {
            onComplete: () => {
              addItem('potion', 2);
              gameState.flags.receivedMomPotions = true;
              saveGame();
              audio.fanfare();
              this.textBox.show('{PLAYER} received 2 POTIONS!', {
                onComplete: () => {
                  audio.door();
                  this.manager.fadeAction(() => {
                    this.loadMap(warp.targetMap, warp.targetX, warp.targetY, warp.targetFacing);
                    saveGame();
                  });
                },
              });
            },
          });
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
        if (!gameState.flags.gotStarter) {
          this.cutsceneActive = true;
          audio.alert();
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
          this.cutsceneActive = true;
          audio.alert();
          this.textBox.show("You should head back to the PROFESSOR's lab first!", {
            onComplete: () => {
              this.player.forceStep('down', () => {
                this.cutsceneActive = false;
              });
            },
          });
          return;
        }

        if (!gameState.flags.healedByMom) {
          this.cutsceneActive = true;
          audio.alert();
          this.textBox.show('Go say hi to your MOM at home before heading out onto ROUTE 1!', {
            onComplete: () => {
              this.player.forceStep('down', () => {
                this.cutsceneActive = false;
              });
            },
          });
          return;
        }

        // PHASE 3 PART 1: Professor hands over 5 POKé BALLS + POKéDEX, opening Route 1!
        if (!gameState.flags.receivedStarterKit) {
          this._runProfStarterKitCutscene(tx);
          return;
        }
        // Otherwise: OPEN! Let the player continue north seamlessly into Route 1!
      }

      if (trigger.type === 'oldManBlock') {
        this.cutsceneActive = true;
        audio.blip();
        const oldMan = this._findNpcById('oldManBlocker');
        if (oldMan) oldMan.facing = 'up';
        this.textBox.show("OLD MAN: Sorry, I'm resting here. Come back later.", {
          onComplete: () => {
            if (oldMan) oldMan.facing = 'down';
            this.player.forceStep('down', () => {
              this.cutsceneActive = false;
            });
          },
        });
        return;
      }

      if (trigger.type === 'cityHouseLocked') {
        this.cutsceneActive = true;
        audio.blip();
        this.textBox.show("The door is locked. Nobody's home right now.", {
          onComplete: () => {
            this.player.forceStep('down', () => {
              this.cutsceneActive = false;
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
        return;
      }

      if (trigger.type === 'gymClosed') {
        this.cutsceneActive = true;
        audio.blip();
        this.textBox.show(trigger.text || 'The Gym is currently closed. Please come back later!', {
          onComplete: () => {
            this.player.forceStep('down', () => {
              this.cutsceneActive = false;
            });
          },
        });
        return;
      }
    }

    // PHASE 3 PART 3: Tall Grass Wild Encounters!
    if (
      this.map.tiles[ty][tx] === TILE.TALL_GRASS &&
      gameState.encountersEnabled &&
      gameState.party &&
      gameState.party.length > 0 &&
      getFirstHealthyPartyIndex() >= 0
    ) {
      const hit = rollWildEncounter(this.map.id);
      if (hit) {
        this._startWildEncounter(hit.speciesId, hit.level);
      }
    }
  }

  _handleInteract() {
    const target = this.player.getFacingTile();

    const npc = this.npcs.find((n) => n.x === target.x && n.y === target.y && !n.moving);
    if (npc) {
      if (npc.id === 'mom' && gameState.flags.rivalBattleDone) {
        audio.blip();
        this._runMomHealDialogue(npc);
        return;
      }
      if (npc.id === 'martEmployee' && !gameState.flags.receivedMartSample) {
        npc.facePlayer(this.player.facing);
        audio.blip();
        this.textBox.show(
          [
            'CLERK: Hi there! I work at the POKé MART in VERDANT CITY!',
            'CLERK: Here — take this free sample to try out!',
          ],
          {
            onComplete: () => {
              addItem('potion', 1);
              gameState.flags.receivedMartSample = true;
              saveGame();
              audio.fanfare();
              this.textBox.show('{PLAYER} received a POTION!');
            },
          }
        );
        return;
      }
      if (npc.id === 'martClerk') {
        npc.facePlayer(this.player.facing);
        audio.blip();
        this.manager.pushScene('shop');
        return;
      }

      npc.facePlayer(this.player.facing);
      audio.blip();
      const lines = npc.getDialogue ? npc.getDialogue() : ['...'];
      this.textBox.show(lines);
      return;
    }

    // Sparkle-free hidden items (Route 1 Potion & Poké Ball)
    const hidden = (this.map.hiddenItems || []).find(
      (h) =>
        h.x === target.x &&
        h.y === target.y &&
        !(gameState.pickedItems || []).includes(h.id)
    );
    if (hidden) {
      if (!gameState.pickedItems) gameState.pickedItems = [];
      gameState.pickedItems.push(hidden.id);
      addItem(hidden.itemId, hidden.qty || 1);
      saveGame();
      const itemDef = getItem(hidden.itemId);
      audio.fanfare();
      this.textBox.show(`{PLAYER} found a hidden ${itemDef ? itemDef.name : 'ITEM'}!`);
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
      if (lines[0] === '__NURSE_COUNTER__') {
        audio.blip();
        this._runNurseHealCutscene();
        return;
      }
      if (lines[0] === '__CENTER_PC__') {
        audio.confirm();
        const boxCount = (gameState.pcBox || []).length;
        this.textBox.show([
          "{PLAYER} booted up the POKéMON CENTER PC.",
          `Box system coming soon — POKéMON stored in Box: ${boxCount}.`,
        ]);
        return;
      }
      if (lines[0] === '__MART_SHOP__') {
        audio.blip();
        this.manager.pushScene('shop');
        return;
      }

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

    if (this.yesNoMenu) {
      this.yesNoMenu.update(input);
      this._updateCamera();
      return;
    }

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

    // Esc Start Menu & Debug Keys (B = battle, G = toggle encounters, H = heal party)
    if (!locked && !this.player.moving) {
      if (input.wasJustPressed('pause')) {
        this._openPauseMenu();
        return;
      }
      if (CONFIG.DEBUG && input.wasJustPressed('debugBattle')) {
        this._startDebugBattle();
        return;
      }
      if (CONFIG.DEBUG && input.wasJustPressed('debugEncounters')) {
        gameState.encountersEnabled = !gameState.encountersEnabled;
        audio.blip();
        if (this.manager.showToast) {
          this.manager.showToast(
            gameState.encountersEnabled ? 'GRASS: ON' : 'GRASS: OFF',
            gameState.encountersEnabled ? '#90F0A0' : '#FFB070'
          );
        }
        return;
      }
      if (CONFIG.DEBUG && input.wasJustPressed('debugHeal')) {
        healParty(gameState.party);
        audio.heal();
        this.particles.spawnHealSparkles(this.player.px, this.player.py);
        if (this.manager.showToast) {
          this.manager.showToast('PARTY HEALED', '#90F0A0');
        }
        return;
      }

      // Check seamless edge map transition before stepping!
      if (this._trySeamlessEdgeTransition(input)) {
        this._updateCamera();
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
  // 7-LAYER RENDER PIPELINE
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

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // LAYER 1: Ground + animated tiles
    if (this.groundCache) {
      ctx.drawImage(this.groundCache, 0, 0);
    }
    for (let r = startRow; r <= endRow; r++) {
      const row = this.map.tiles[r];
      for (let c = startCol; c <= endCol; c++) {
        const tid = row[c];
        if (ANIMATED_TILES.has(tid)) {
          const frame =
            tid === TILE.HEAL_MACHINE
              ? this.centerHealGlow
                ? Math.floor(this.tick / 6) % 2
                : 0
              : animFrame;
          drawMapTile(ctx, this.map, c, r, c * TILE_SIZE, r * TILE_SIZE, frame);
        }
      }
    }

    // Poké Balls placed on the Pokémon Center healing machine
    if (this.map.id === 'pokecenter' && this.centerHealBalls > 0) {
      let hx = 5, hy = 1;
      for (let r = 0; r < this.map.height; r++) {
        for (let c = 0; c < this.map.width; c++) {
          if (this.map.tiles[r][c] === TILE.HEAL_MACHINE) {
            hx = c; hy = r; break;
          }
        }
      }
      const slots = [
        [hx * TILE_SIZE + 3, hy * TILE_SIZE + 5],
        [hx * TILE_SIZE + 9, hy * TILE_SIZE + 5],
        [hx * TILE_SIZE + 3, hy * TILE_SIZE + 9],
        [hx * TILE_SIZE + 9, hy * TILE_SIZE + 9],
        [hx * TILE_SIZE + 6, hy * TILE_SIZE + 3],
        [hx * TILE_SIZE + 6, hy * TILE_SIZE + 11],
      ];
      for (let i = 0; i < Math.min(this.centerHealBalls, slots.length); i++) {
        const [bx, by] = slots[i];
        ctx.fillStyle = '#1C1E2A';
        ctx.fillRect(bx, by, 4, 4);
        ctx.fillStyle = this.centerHealGlow && Math.floor(this.tick / 5) % 2 === 0 ? '#FFE878' : '#E84840';
        ctx.fillRect(bx + 1, by, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bx + 1, by + 2, 2, 2);
      }
    }

    // LAYER 2: Ground details (shadows + dust/rustles/heal sparkles)
    this.player.renderShadow(ctx);
    for (const npc of this.npcs) {
      npc.renderShadow(ctx);
    }
    this.particles.renderGroundFx(ctx);

    // LAYER 3: Y-sorted Objects & Entities
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

    // LAYER 4: Overhead layer (tree canopies, roofs, chimneys)
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

    // SCREEN-SPACE LAYERS
    const isEnhanced = gameState.settings && gameState.settings.graphicsMode === 'enhanced';
    if (isEnhanced) {
      this.lighting.render(ctx, this.map, camX, camY, zoom, this.tick);
      this.particles.renderAirborne(ctx, camX, camY, zoom);
    }

    // Area Nameplate Banner (top-left slide-in)
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

    if (this.yesNoMenu) {
      this.yesNoMenu.render(ctx);
    }
    if (this.pauseMenu) {
      this.pauseMenu.render(ctx);
    }
    if (this.optionMenu) {
      this.optionMenu.render(ctx);
    }
  }
}
