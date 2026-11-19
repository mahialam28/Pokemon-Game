/**
 * DS / Gen 5 ROM-style Battle Scene (480x270) — Phase 2 + Phase 3.
 * Supports:
 * - Trainer battles (Rival) with cinema bars & trainer send-out
 * - Wild Pokémon encounters with grass stripe wipe, slide-in wild foe, Shiny sparkle, & wild battle music
 * - Sandwiched DOM <img> layer for animated Gen 5 PokéAPI GIFs (auto-hidden when sub-scenes push on top)
 * - RUN (Gen 3 Speed escape formula), BAG (Potion / Antidote / Poké Ball catching + Nickname + PC Box),
 *   POKéMON (6-slot Gen 3 party switching + forced switch on faint), Poison (PSN) end-of-turn ticks,
 *   multi-participant EXP split, Level-Up stat panel, 4-move Forget/Learn flow, and Wild Blackout!
 */

import { audio } from '../audio.js';
import { CONFIG } from '../config.js';
import { getItem } from '../data/items.js';
import { getMove } from '../data/moves.js';
import {
  applyExpGain,
  checkEvolutionStub,
  drawBattlePlaceholder,
  getPokemonDisplayName,
  healParty,
  preloadBattleSprite,
} from '../data/pokemon.js';
import { drawBattleTrainer } from '../entities/sprites.js';
import {
  addCaughtPokemon,
  gameState,
  markPokedexCaught,
  markPokedexSeen,
  removeItem,
  saveGame,
} from '../state.js';
import { Menu } from '../ui/Menu.js';
import { TextBox } from '../ui/TextBox.js';
import {
  evaluateMoveAnim,
  renderBattleBarsClose,
  renderBattleBarsOpen,
  renderCatchSequence,
  renderDamagePopups,
  renderMoveOverlay,
  renderPoisonBubbles,
  renderPokeBallThrow,
  renderShinySparkle,
  renderWildEncounterWipe,
} from './animations.js';
import { BattleEngine } from './BattleEngine.js';
import {
  ENEMY_PLATFORM,
  NICKNAME_CHARS,
  PLAYER_PLATFORM,
  renderBattleBackground,
  renderBattlePlatform,
  renderEnemyHud,
  renderFightMenu,
  renderForgetMoveMenu,
  renderLevelUpPanel,
  renderMainActionMenu,
  renderNicknamePanel,
  renderPlayerHud,
} from './BattleUI.js';

export class BattleScene {
  constructor(manager) {
    this.manager = manager;
    this.engine = null;
    this.textBox = new TextBox();

    this.location = 'lab';
    this.onBattleEnd = null;
    this.isDebug = false;
    this.activePartyIndex = 0;
    this.participants = new Set();
    this.escapeAttempts = 0;

    this.phase = 'barsClose';
    this.tick = 0;
    this.phaseTimer = 0;

    // Preloaded Gen 5 GIF / fallback PNG metadata
    this.spritesReady = false;
    this.enemySpriteMeta = null;
    this.playerSpriteMeta = null;

    // DOM overlay references for animated Gen 5 GIFs
    this.spriteLayer = document.getElementById('battle-sprite-layer');
    this.enemyClipEl = document.getElementById('battle-enemy-clip');
    this.enemyImgEl = document.getElementById('battle-enemy-img');
    this.playerClipEl = document.getElementById('battle-player-clip');
    this.playerImgEl = document.getElementById('battle-player-img');

    // Slide-in positions (platforms, trainers, HP boxes)
    this.enemyPlatformOffsetX = 240;
    this.playerPlatformOffsetX = -240;
    this.enemyTrainerOffsetX = 240;
    this.playerTrainerOffsetX = -240;
    this.enemyHudOffsetX = -230;
    this.playerHudOffsetX = 230;
    this.targetEnemyHudOffsetX = -230;
    this.targetPlayerHudOffsetX = 230;

    this.showEnemyTrainer = true;
    this.showPlayerTrainer = true;
    this.playerThrowFrame = 0;
    this.playerThrowTimer = 0;
    this.showEnemyMon = false;
    this.showPlayerMon = false;
    this.enemyAppearScale = 1;
    this.playerAppearScale = 1;
    this.enemyAppearFlash = false;
    this.playerAppearFlash = false;
    this.enemyCatchTint = null;

    this.enemyMonAlpha = 1;
    this.playerMonAlpha = 1;
    this.enemyMonDrop = 0;
    this.playerMonDrop = 0;

    this.playerDisplayHp = 20;
    this.enemyDisplayHp = 20;
    this.playerDisplayExp = 0;

    this.ballThrow = null;
    this.appearAnim = null;
    this.catchAnim = null;
    this.shinyAnim = null;
    this.poisonAnim = null;
    this.eventQueue = [];
    this.activeAnim = null;
    this.hpDrain = null;
    this.hpHeal = null;
    this.faintAnim = null;
    this.expFill = null;
    this.damagePopups = [];

    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.lowHpBeepTimer = 0;

    this.mainCursor = 0;
    this.moveCursor = 0;
    this.levelUpInfo = null;

    // Inline sub-UIs: Yes/No prompt, Forget-Move picker, Nickname entry
    this.yesNoMenu = null;
    this.forgetContext = null;
    this.forgetCursor = 0;
    this.nicknameContext = null;
    this.nicknameText = '';
    this.nicknameCursor = 0;
  }

  /** Keep OverworldScene visible beneath the initial flash & wipe transition. */
  get isOverlay() {
    return this.phase === 'barsClose';
  }

  onEnter({
    playerMon,
    enemyMon,
    location = 'lab',
    isTrainer = true,
    isWild = false,
    trainerName = null,
    canLoseStory = true,
    isDebug = false,
    partyIndex = null,
    onBattleEnd = null,
  }) {
    const actualIsTrainer = isWild ? false : Boolean(isTrainer);
    const rivalDisplay = trainerName || gameState.rivalName || 'GARY';

    this.engine = new BattleEngine({
      playerMon,
      enemyMon,
      isTrainer: actualIsTrainer,
      trainerName: rivalDisplay,
      canLoseStory: actualIsTrainer ? canLoseStory : false,
    });

    this.location = location || (actualIsTrainer ? 'lab' : 'grass');
    this.onBattleEnd = onBattleEnd;
    this.isDebug = isDebug;
    this.escapeAttempts = 0;

    // Track party slot index & EXP participants
    if (typeof partyIndex === 'number') {
      this.activePartyIndex = partyIndex;
    } else {
      const idx = (gameState.party || []).indexOf(playerMon);
      this.activePartyIndex = idx >= 0 ? idx : 0;
    }
    this.participants = new Set([this.activePartyIndex]);

    // Mark foe as SEEN in Pokédex
    if (!isDebug && enemyMon && enemyMon.speciesId) {
      markPokedexSeen(enemyMon.speciesId);
    }

    this.tick = 0;
    this.phaseTimer = 0;
    this.phase = 'barsClose';

    this.playerDisplayHp = playerMon.currentHp;
    this.enemyDisplayHp = enemyMon.currentHp;
    this.playerDisplayExp = this._calcExpRatio(playerMon);

    this.enemyPlatformOffsetX = 240;
    this.playerPlatformOffsetX = -240;
    this.enemyTrainerOffsetX = 240;
    this.playerTrainerOffsetX = -240;
    this.enemyHudOffsetX = -230;
    this.playerHudOffsetX = 230;
    this.targetEnemyHudOffsetX = -230;
    this.targetPlayerHudOffsetX = 230;

    this.showEnemyTrainer = actualIsTrainer;
    this.showPlayerTrainer = true;
    this.playerThrowFrame = 0;
    this.playerThrowTimer = 0;
    // Wild Pokémon starts visible on its platform and slides in directly!
    this.showEnemyMon = !actualIsTrainer;
    this.showPlayerMon = false;
    this.enemyAppearScale = 1;
    this.playerAppearScale = 1;
    this.enemyAppearFlash = false;
    this.playerAppearFlash = false;
    this.enemyCatchTint = null;
    this.enemyMonAlpha = 1;
    this.playerMonAlpha = 1;
    this.enemyMonDrop = 0;
    this.playerMonDrop = 0;

    this.ballThrow = null;
    this.appearAnim = null;
    this.catchAnim = null;
    this.shinyAnim = null;
    this.poisonAnim = null;
    this.eventQueue = [];
    this.activeAnim = null;
    this.hpDrain = null;
    this.hpHeal = null;
    this.faintAnim = null;
    this.expFill = null;
    this.damagePopups = [];
    this.levelUpInfo = null;
    this.yesNoMenu = null;
    this.forgetContext = null;
    this.nicknameContext = null;
    this.lowHpBeepTimer = 0;
    this.mainCursor = 0;
    this.moveCursor = 0;

    // Preload animated Gen 5 GIFs (shiny-aware!) during intro wipe
    this.spritesReady = false;
    this.enemySpriteMeta = null;
    this.playerSpriteMeta = null;
    this._hideDomSprites();

    Promise.all([
      preloadBattleSprite(enemyMon.speciesId, 'front', Boolean(enemyMon.isShiny)),
      preloadBattleSprite(playerMon.speciesId, 'back', Boolean(playerMon.isShiny)),
    ]).then(([enemyMeta, playerMeta]) => {
      this.enemySpriteMeta = enemyMeta;
      this.playerSpriteMeta = playerMeta;
      if (this.enemyImgEl && enemyMeta.url) {
        this.enemyImgEl.src = enemyMeta.url;
      }
      if (this.playerImgEl && playerMeta.url) {
        this.playerImgEl.src = playerMeta.url;
      }
      this.spritesReady = true;
    });

    if (actualIsTrainer) {
      audio.battleStart();
    } else {
      audio.wildEncounter();
    }
  }

  onExit() {
    this._hideDomSprites();
    audio.playTrack(null);
  }

  _hideDomSprites() {
    if (this.spriteLayer) this.spriteLayer.style.display = 'none';
    if (this.enemyClipEl) this.enemyClipEl.style.display = 'none';
    if (this.playerClipEl) this.playerClipEl.style.display = 'none';
  }

  _calcExpRatio(mon) {
    const span = Math.max(1, (mon.expNext || 100) - (mon.expFloor || 0));
    return Math.max(0, Math.min(1, ((mon.exp || 0) - (mon.expFloor || 0)) / span));
  }

  // =========================================================================
  // INTRO SEQUENCE (TRAINER & WILD)
  // =========================================================================

  _startRivalSendOut() {
    this.phase = 'rivalSendOut';
    this.textBox.show(`${this.engine.trainerName} sent out ${this.engine.enemyMon.name}!`, {
      waitForConfirm: false,
    });
    audio.ballThrow();
    this.ballThrow = {
      startX: ENEMY_PLATFORM.x + 36,
      startY: ENEMY_PLATFORM.y - 36,
      endX: ENEMY_PLATFORM.x,
      endY: ENEMY_PLATFORM.y,
      frame: 0,
      duration: 30,
      onDone: () => {
        this.showEnemyMon = true;
        this.enemyAppearScale = 0.15;
        this.enemyAppearFlash = true;
        this.targetEnemyHudOffsetX = 0;
        audio.cry(this.engine.enemyMon.speciesId);

        this.appearAnim = {
          side: 'enemy',
          frame: 0,
          duration: 18,
          onDone: () => {
            this.enemyAppearScale = 1;
            this.enemyAppearFlash = false;
            this.phaseTimer = 18;
            this.phase = 'rivalSendOutWait';
          },
        };
      },
    };
  }

  _startPlayerSendOut(onAfterSendOut = null) {
    this.phase = 'playerSendOut';
    this.playerThrowTimer = 0;
    this.playerThrowFrame = 1;
    const pName = getPokemonDisplayName(this.engine.playerMon);
    this.textBox.show(`Go! ${pName}!`, {
      waitForConfirm: false,
    });
    audio.ballThrow();
    this.ballThrow = {
      startX: PLAYER_PLATFORM.x - 36,
      startY: PLAYER_PLATFORM.y - 38,
      endX: PLAYER_PLATFORM.x,
      endY: PLAYER_PLATFORM.y,
      frame: 0,
      duration: 30,
      onDone: () => {
        this.showPlayerMon = true;
        this.playerAppearScale = 0.15;
        this.playerAppearFlash = true;
        this.targetPlayerHudOffsetX = 0;
        audio.cry(this.engine.playerMon.speciesId);

        this.appearAnim = {
          side: 'player',
          frame: 0,
          duration: 18,
          onDone: () => {
            this.playerAppearScale = 1;
            this.playerAppearFlash = false;
            if (onAfterSendOut) {
              onAfterSendOut();
            } else {
              this.phaseTimer = 14;
              this.phase = 'playerSendOutWait';
            }
          },
        };
      },
    };
  }

  _enterMainMenu() {
    this.textBox.close();
    this.yesNoMenu = null;
    this.phase = 'mainMenu';
  }

  // =========================================================================
  // PARTY SWITCHING (VOLUNTARY OR FORCED AFTER FAINT)
  // =========================================================================

  _openPartySwitch(forced = false) {
    this._hideDomSprites();
    this.manager.pushScene('party', {
      mode: 'battleSwitch',
      activeIndex: this.activePartyIndex,
      forced,
      onSelect: (res) => {
        const idx = typeof res === 'number' ? res : res && typeof res.index === 'number' ? res.index : -1;
        if (idx < 0) {
          if (forced) {
            this._openPartySwitch(true);
          } else {
            this._enterMainMenu();
          }
          return;
        }
        this._switchToPartyIndex(idx, forced);
      },
    });
  }

  _switchToPartyIndex(newIdx, forced) {
    const nextMon = gameState.party && gameState.party[newIdx];
    if (!nextMon) {
      this._enterMainMenu();
      return;
    }

    const oldName = getPokemonDisplayName(this.engine.playerMon);
    this.activePartyIndex = newIdx;
    this.participants.add(newIdx);
    this.engine.setActivePlayerMon(nextMon);
    this.moveCursor = 0;

    this.playerDisplayHp = nextMon.currentHp;
    this.playerDisplayExp = this._calcExpRatio(nextMon);
    this.playerMonDrop = 0;
    this.playerMonAlpha = 1;
    this.showPlayerMon = false;
    this.targetPlayerHudOffsetX = 230;
    this.playerHudOffsetX = 230;

    // Preload new back sprite immediately
    preloadBattleSprite(nextMon.speciesId, 'back', Boolean(nextMon.isShiny)).then((meta) => {
      this.playerSpriteMeta = meta;
      if (this.playerImgEl && meta.url) {
        this.playerImgEl.src = meta.url;
      }
    });

    const sendNext = () => {
      this._startPlayerSendOut(() => {
        if (forced) {
          this._enterMainMenu();
        } else {
          this._startEnemyOnlyTurn();
        }
      });
    };

    if (!forced) {
      this.phase = 'menuMessage';
      this.textBox.show(`${oldName}, come back!`, {
        waitForConfirm: false,
        onComplete: () => {
          this._waitShort(14, sendNext);
        },
      });
    } else {
      sendNext();
    }
  }

  _waitShort(frames, cb) {
    this.phase = 'shortDelay';
    this.phaseTimer = frames;
    this.shortDelayCb = cb;
  }

  // =========================================================================
  // BAG ITEM EXECUTION (POTION, ANTIDOTE, POKé BALL)
  // =========================================================================

  _openBattleBag() {
    this._hideDomSprites();
    this.manager.pushScene('bag', {
      mode: 'battle',
      isTrainerBattle: this.engine.isTrainer,
      onUseItem: (res) => {
        if (!res || !res.itemId) {
          this._enterMainMenu();
          return;
        }
        this._useBattleItem(res.itemId);
      },
    });
  }

  _useBattleItem(itemId) {
    const item = getItem(itemId);
    const mon = this.engine.playerMon;
    if (!item) {
      this._enterMainMenu();
      return;
    }

    if (item.category === 'pokeballs') {
      removeItem(item.id, 1);
      this._startCatchSequence(item);
      return;
    }

    if (item.healHp) {
      if (mon.currentHp >= mon.maxHp) {
        audio.bump();
        this.phase = 'menuMessage';
        this.textBox.show("It won't have any effect!", {
          waitForConfirm: true,
          onComplete: () => this._enterMainMenu(),
        });
        return;
      }
      removeItem(item.id, 1);
      const healed = Math.min(mon.maxHp - mon.currentHp, item.healHp);
      mon.currentHp += healed;
      audio.heal();
      this.phase = 'itemHeal';
      this.hpHeal = {
        targetHp: mon.currentHp,
        onDone: () => {
          this.textBox.show(
            `Used ${item.name}! ${getPokemonDisplayName(mon)} recovered ${healed} HP!`,
            {
              waitForConfirm: true,
              onComplete: () => this._startEnemyOnlyTurn(),
            }
          );
        },
      };
      this.textBox.show(`{PLAYER} used ${item.name}!`, { waitForConfirm: false });
      return;
    }

    if (item.cureStatus) {
      if (mon.status !== item.cureStatus) {
        audio.bump();
        this.phase = 'menuMessage';
        this.textBox.show("It won't have any effect!", {
          waitForConfirm: true,
          onComplete: () => this._enterMainMenu(),
        });
        return;
      }
      removeItem(item.id, 1);
      mon.status = null;
      audio.heal();
      this.phase = 'menuMessage';
      this.textBox.show(
        `{PLAYER} used ${item.name}! ${getPokemonDisplayName(mon)} was cured of poison!`,
        {
          waitForConfirm: true,
          onComplete: () => this._startEnemyOnlyTurn(),
        }
      );
    }
  }

  // =========================================================================
  // POKé BALL CATCHING SEQUENCE + NICKNAME + PARTY/PC BOX
  // =========================================================================

  _startCatchSequence(item) {
    const outcome = this.engine.attemptCatch(item.catchBonus || 1.0);
    this.phase = 'catching';
    this.textBox.show(`{PLAYER} threw a ${item.name}!`, { waitForConfirm: false });
    audio.ballThrow();

    this.catchAnim = {
      stage: 'arc',
      frame: 0,
      duration: 24,
      shakesRemaining: outcome.shakes,
      totalShakes: outcome.shakes,
      caught: outcome.caught,
    };
  }

  _updateCatchAnim() {
    if (!this.catchAnim) return;
    const ca = this.catchAnim;
    ca.frame += 1;
    const u = Math.min(1, ca.frame / Math.max(1, ca.duration));

    if (ca.stage === 'absorb') {
      this.enemyAppearScale = Math.max(0.05, 1 - u * 0.95);
      this.enemyCatchTint = 'red';
    }

    if (ca.frame < ca.duration) return;

    if (ca.stage === 'arc') {
      ca.stage = 'absorb';
      ca.frame = 0;
      ca.duration = 18;
      audio.cry(this.engine.enemyMon.speciesId);
      return;
    }

    if (ca.stage === 'absorb') {
      this.showEnemyMon = false;
      this.enemyAppearScale = 1;
      this.enemyCatchTint = null;
      ca.stage = 'drop';
      ca.frame = 0;
      ca.duration = 26;
      return;
    }

    if (ca.stage === 'drop') {
      if (ca.shakesRemaining > 0) {
        ca.stage = 'shakePause';
        ca.frame = 0;
        ca.duration = 20;
      } else if (ca.caught) {
        this._triggerCatchSuccess();
      } else {
        this._triggerCatchBreakFree();
      }
      return;
    }

    if (ca.stage === 'shakePause') {
      ca.stage = 'shake';
      ca.frame = 0;
      ca.duration = 20;
      audio.ballShake();
      return;
    }

    if (ca.stage === 'shake') {
      ca.shakesRemaining -= 1;
      if (ca.shakesRemaining > 0) {
        ca.stage = 'shakePause';
        ca.frame = 0;
        ca.duration = 22;
      } else if (ca.caught) {
        this._triggerCatchSuccess();
      } else {
        this._triggerCatchBreakFree();
      }
      return;
    }

    if (ca.stage === 'caught') {
      ca.stage = 'caughtWait';
      ca.frame = 0;
      ca.duration = 99999;
      this._onPokemonCaught();
      return;
    }

    if (ca.stage === 'breakFree') {
      const total = ca.totalShakes;
      this.catchAnim = null;
      this.showEnemyMon = true;
      this.enemyAppearScale = 1;
      const msg =
        total === 0
          ? 'Oh no! The wild POKéMON broke free!'
          : total === 1
            ? 'Aww! It appeared to be caught!'
            : total === 2
              ? 'Aargh! Almost had it!'
              : 'Gah! It was so close, too!';

      this.phase = 'menuMessage';
      this.textBox.show(msg, {
        waitForConfirm: true,
        onComplete: () => this._startEnemyOnlyTurn(),
      });
    }
  }

  _triggerCatchSuccess() {
    this.catchAnim.stage = 'caught';
    this.catchAnim.frame = 0;
    this.catchAnim.duration = 30;
    audio.playTrack(null);
    audio.catchSuccess();
  }

  _triggerCatchBreakFree() {
    this.catchAnim.stage = 'breakFree';
    this.catchAnim.frame = 0;
    this.catchAnim.duration = 16;
    audio.ballThrow();
  }

  _onPokemonCaught() {
    const mon = this.engine.enemyMon;
    const isNewDex = !(gameState.pokedex && gameState.pokedex.caught.includes(mon.speciesId));
    markPokedexCaught(mon.speciesId);

    const lines = [`Gotcha! ${mon.name} was caught!`];
    if (isNewDex) {
      lines.push(`${mon.name}'s data was added to the POKéDEX!`);
    }

    this.phase = 'caughtPrompt';
    this.textBox.show(lines, {
      waitForConfirm: true,
      onComplete: () => {
        this.textBox.show(`Give a nickname to ${mon.name}?`, { waitForConfirm: false });
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
            if (opt.value === 'yes') {
              this.textBox.close();
              this.nicknameContext = { mon };
              this.nicknameText = '';
              this.nicknameCursor = 0;
              this.phase = 'nicknameEntry';
            } else {
              this._finalizeCaughtPokemon(mon);
            }
          },
          onCancel: () => {
            this.yesNoMenu = null;
            this._finalizeCaughtPokemon(mon);
          },
        });
      },
    });
  }

  _finalizeCaughtPokemon(mon) {
    mon.otName = gameState.playerName || 'RED';
    mon.otId = gameState.trainerId || '00001';
    const dest = addCaughtPokemon(mon);
    saveGame();

    if (dest === 'pc') {
      this.phase = 'menuMessage';
      this.textBox.show(
        `${getPokemonDisplayName(mon)} was sent to {PLAYER}'s PC!`,
        {
          waitForConfirm: true,
          onComplete: () => this._finishBattle(true, 0, { caught: true }),
        }
      );
    } else {
      this._finishBattle(true, 0, { caught: true });
    }
  }

  _updateNicknameEntry(input) {
    if (input.wasJustPressed('cancel')) {
      if (this.nicknameText.length > 0) {
        this.nicknameText = this.nicknameText.slice(0, -1);
        audio.cancel();
      }
      return;
    }

    if (input.wasJustPressed('left')) {
      if (this.nicknameCursor === 28) this.nicknameCursor = 27;
      else if (this.nicknameCursor < 27) {
        const row = Math.floor(this.nicknameCursor / 9);
        const col = (this.nicknameCursor % 9 + 8) % 9;
        this.nicknameCursor = row * 9 + col;
      }
      audio.blip();
    } else if (input.wasJustPressed('right')) {
      if (this.nicknameCursor === 27) this.nicknameCursor = 28;
      else if (this.nicknameCursor < 27) {
        const row = Math.floor(this.nicknameCursor / 9);
        const col = (this.nicknameCursor % 9 + 1) % 9;
        this.nicknameCursor = row * 9 + col;
      }
      audio.blip();
    } else if (input.wasJustPressed('up')) {
      if (this.nicknameCursor === 27) this.nicknameCursor = 20;
      else if (this.nicknameCursor === 28) this.nicknameCursor = 24;
      else if (this.nicknameCursor >= 9) this.nicknameCursor -= 9;
      else this.nicknameCursor = this.nicknameCursor < 5 ? 27 : 28;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      if (this.nicknameCursor >= 27) this.nicknameCursor = this.nicknameCursor === 27 ? 2 : 6;
      else if (this.nicknameCursor < 18) this.nicknameCursor += 9;
      else this.nicknameCursor = this.nicknameCursor % 9 < 5 ? 27 : 28;
      audio.blip();
    } else if (input.wasJustPressed('confirm')) {
      if (this.nicknameCursor === 27) {
        this.nicknameText = this.nicknameText.slice(0, -1);
        audio.cancel();
      } else if (this.nicknameCursor === 28) {
        audio.confirm();
        const mon = this.nicknameContext.mon;
        if (this.nicknameText.trim().length > 0) {
          mon.nickname = this.nicknameText.trim();
        }
        this.nicknameContext = null;
        this._finalizeCaughtPokemon(mon);
      } else if (this.nicknameText.length < 10) {
        this.nicknameText += NICKNAME_CHARS[this.nicknameCursor];
        audio.confirm();
      } else {
        audio.bump();
      }
    }
  }

  // =========================================================================
  // TURN EVENT PROCESSOR
  // =========================================================================

  _startTurn(moveSlot) {
    this.eventQueue = this.engine.resolveTurn(moveSlot);
    this.phase = 'turnEvents';
    this._processNextEvent();
  }

  _startEnemyOnlyTurn() {
    this.eventQueue = this.engine.resolveEnemyOnlyTurn();
    this.phase = 'turnEvents';
    this._processNextEvent();
  }

  _hasOtherHealthyPartyMember() {
    if (this.isDebug) return false;
    const party = gameState.party || [];
    return party.some((m, idx) => idx !== this.activePartyIndex && m.currentHp > 0);
  }

  _processNextEvent() {
    if (this.eventQueue.length === 0) {
      if (this.engine.enemyMon.currentHp <= 0) {
        this._startVictorySequence();
      } else if (this.engine.playerMon.currentHp <= 0) {
        if (this._hasOtherHealthyPartyMember()) {
          this._openPartySwitch(true);
        } else {
          this._startDefeatSequence();
        }
      } else {
        this._enterMainMenu();
      }
      return;
    }

    const ev = this.eventQueue.shift();

    if (ev.type === 'useMove') {
      this.textBox.show(`${ev.attackerName} used ${ev.move.name}!`, {
        waitForConfirm: false,
        onComplete: () => {
          this.phaseTimer = 12;
          this.phase = 'eventPause';
        },
      });
      return;
    }

    if (ev.type === 'miss') {
      this.textBox.show(`${ev.attackerName} missed!`, {
        waitForConfirm: true,
        onComplete: () => this._processNextEvent(),
      });
      return;
    }

    if (ev.type === 'anim') {
      if (ev.anim === 'scratch') audio.slash();
      else if (ev.anim === 'growl' || ev.anim === 'tailWhip') {
        if (ev.statDirection === 'up') audio.statUp();
        else audio.statDown();
      } else if (ev.isCrit || ev.effectiveness > 1) audio.hitSuper();
      else if (ev.effectiveness < 1) audio.hitWeak();
      else audio.hit();

      if (ev.isCrit || ev.effectiveness > 1) {
        this.shakeTimer = 16;
        this.shakeStrength = 5;
      }

      this.activeAnim = {
        anim: ev.anim,
        moveType: ev.moveType || 'NORMAL',
        statDirection: ev.statDirection || 'down',
        actorSide: ev.actorSide,
        targetSide: ev.targetSide,
        frame: 0,
        duration: ev.anim === 'growl' || ev.anim === 'tailWhip' ? 42 : 36,
      };
      return;
    }

    if (ev.type === 'damage') {
      if (CONFIG.SHOW_DAMAGE_NUMBERS) {
        const pos = ev.targetSide === 'enemy' ? ENEMY_PLATFORM : PLAYER_PLATFORM;
        this.damagePopups.push({
          text: ev.isCrit ? `CRIT -${ev.damage}!` : `-${ev.damage}`,
          x: pos.x,
          y: pos.y - 54,
          isCrit: Boolean(ev.isCrit),
          frame: 0,
          duration: 38,
        });
      }
      this.hpDrain = {
        side: ev.targetSide,
        targetHp: ev.newHp,
      };
      return;
    }

    if (ev.type === 'status') {
      audio.poisonTick();
      this.poisonAnim = { side: ev.targetSide, frame: 0, duration: 28 };
      this.textBox.show(ev.text, {
        waitForConfirm: true,
        onComplete: () => this._processNextEvent(),
      });
      return;
    }

    if (ev.type === 'poisonDamage') {
      audio.poisonTick();
      this.poisonAnim = { side: ev.targetSide, frame: 0, duration: 30 };
      this.textBox.show(ev.text, {
        waitForConfirm: false,
        onComplete: () => {
          this.hpDrain = {
            side: ev.targetSide,
            targetHp: ev.newHp,
          };
        },
      });
      return;
    }

    if (
      ev.type === 'statChange' ||
      ev.type === 'statLimit' ||
      ev.type === 'message' ||
      ev.type === 'effectiveness'
    ) {
      this.textBox.show(ev.text, {
        waitForConfirm: true,
        onComplete: () => this._processNextEvent(),
      });
      return;
    }

    if (ev.type === 'faint') {
      audio.cry(ev.pokemon.speciesId);
      audio.faint();
      if (ev.targetSide === 'enemy') this.targetEnemyHudOffsetX = -230;
      else this.targetPlayerHudOffsetX = 230;

      this.faintAnim = {
        side: ev.targetSide,
        frame: 0,
        duration: 28,
        onDone: () => {
          if (ev.targetSide === 'enemy') this.showEnemyMon = false;
          else this.showPlayerMon = false;
          this.textBox.show(ev.text, {
            waitForConfirm: true,
            onComplete: () => this._processNextEvent(),
          });
        },
      };
      return;
    }

    this._processNextEvent();
  }

  // =========================================================================
  // VICTORY, MULTI-PARTICIPANT EXP, MOVE LEARNING & DEFEAT / BLACKOUT
  // =========================================================================

  _startVictorySequence() {
    this.phase = 'victory';
    const totalExp = this.engine.getExpReward();
    const prizeMoney = this.engine.getPrizeMoney();

    // Collect surviving participant Pokémon to split EXP cleanly
    const party = gameState.party || [];
    const recipients = [];
    if (!this.isDebug && party.length > 0) {
      for (const idx of this.participants) {
        const m = party[idx];
        if (m && m.currentHp > 0) {
          recipients.push({ mon: m, isActive: idx === this.activePartyIndex });
        }
      }
    }
    if (recipients.length === 0) {
      recipients.push({ mon: this.engine.playerMon, isActive: true });
    }

    const shareExp = Math.max(1, Math.floor(totalExp / recipients.length));
    this._processExpQueue(recipients, shareExp, () => {
      if (this.engine.isTrainer) {
        this._showRivalOutro(true, prizeMoney);
      } else {
        saveGame();
        this._finishBattle(true, 0);
      }
    });
  }

  _processExpQueue(queue, shareExp, onAllDone) {
    if (queue.length === 0) {
      onAllDone();
      return;
    }
    const { mon, isActive } = queue.shift();
    const monName = getPokemonDisplayName(mon);
    const startRatio = this._calcExpRatio(mon);
    const result = applyExpGain(mon, shareExp);
    const endRatio = result.leveledUp ? 1 : this._calcExpRatio(mon);

    const afterLevelPanel = () => {
      const newMoves = [...(result.newMoveIds || [])];
      this._processNewMoves(mon, newMoves, () => {
        checkEvolutionStub(mon);
        this._processExpQueue(queue, shareExp, onAllDone);
      });
    };

    if (isActive) {
      this.textBox.show(`${monName} gained ${shareExp} EXP. Points!`, {
        waitForConfirm: false,
        onComplete: () => {
          this.expFill = {
            startRatio,
            targetRatio: endRatio,
            frame: 0,
            duration: 36,
            onDone: () => {
              if (result.leveledUp) {
                audio.levelUp();
                this.playerDisplayExp = this._calcExpRatio(mon);
                this.playerDisplayHp = mon.currentHp;
                this.levelUpInfo = result;
                this.textBox.show(`${monName} grew to Lv${result.newLevel}!`, {
                  waitForConfirm: true,
                  onComplete: () => {
                    this.levelUpInfo = null;
                    afterLevelPanel();
                  },
                });
              } else {
                afterLevelPanel();
              }
            },
          };
        },
      });
    } else {
      const lines = [`${monName} gained ${shareExp} EXP. Points!`];
      if (result.leveledUp) {
        audio.levelUp();
        lines.push(`${monName} grew to Lv${result.newLevel}!`);
      }
      this.textBox.show(lines, {
        waitForConfirm: true,
        onComplete: afterLevelPanel,
      });
    }
  }

  _processNewMoves(mon, moveQueue, onDone) {
    if (moveQueue.length === 0) {
      onDone();
      return;
    }
    const moveId = moveQueue.shift();
    const def = getMove(moveId);
    const monName = getPokemonDisplayName(mon);

    if ((mon.moves || []).some((m) => m.id === moveId)) {
      this._processNewMoves(mon, moveQueue, onDone);
      return;
    }

    if ((mon.moves || []).length < 4) {
      mon.moves.push({ id: def.id, pp: def.maxPp, maxPp: def.maxPp });
      audio.fanfare();
      this.textBox.show(`${monName} learned ${def.name}!`, {
        waitForConfirm: true,
        onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
      });
      return;
    }

    // Already knows 4 moves -> prompt to forget one
    this.textBox.show(
      [
        `${monName} is trying to learn ${def.name}.`,
        `But ${monName} can't learn more than four moves!`,
      ],
      {
        waitForConfirm: true,
        onComplete: () => {
          this.textBox.show(`Delete an older move to make room for ${def.name}?`, {
            waitForConfirm: false,
          });
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
              if (opt.value === 'yes') {
                this.textBox.close();
                this.forgetContext = { mon, moveId, moveQueue, onDone };
                this.forgetCursor = 0;
                this.phase = 'forgetMove';
              } else {
                this.textBox.show(`${monName} did not learn ${def.name}.`, {
                  waitForConfirm: true,
                  onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
                });
              }
            },
            onCancel: () => {
              this.yesNoMenu = null;
              this.textBox.show(`${monName} did not learn ${def.name}.`, {
                waitForConfirm: true,
                onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
              });
            },
          });
        },
      }
    );
  }

  _updateForgetMove(input) {
    if (!this.forgetContext) return;
    if (input.wasJustPressed('up')) {
      this.forgetCursor = (this.forgetCursor + 4) % 5;
      audio.blip();
    } else if (input.wasJustPressed('down')) {
      this.forgetCursor = (this.forgetCursor + 1) % 5;
      audio.blip();
    } else if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
      audio.cancel();
      const { mon, moveId, moveQueue, onDone } = this.forgetContext;
      this.forgetContext = null;
      this.phase = 'victory';
      this.textBox.show(`${getPokemonDisplayName(mon)} did not learn ${getMove(moveId).name}.`, {
        waitForConfirm: true,
        onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
      });
    } else if (input.wasJustPressed('confirm')) {
      const { mon, moveId, moveQueue, onDone } = this.forgetContext;
      const monName = getPokemonDisplayName(mon);
      const newDef = getMove(moveId);
      this.forgetContext = null;
      this.phase = 'victory';

      if (this.forgetCursor === 4) {
        audio.cancel();
        this.textBox.show(`${monName} did not learn ${newDef.name}.`, {
          waitForConfirm: true,
          onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
        });
        return;
      }

      const oldSlot = mon.moves[this.forgetCursor];
      const oldDef = getMove(oldSlot.id);
      mon.moves[this.forgetCursor] = { id: newDef.id, pp: newDef.maxPp, maxPp: newDef.maxPp };
      audio.fanfare();
      this.textBox.show(
        [
          `1, 2, and... Poof! ${monName} forgot ${oldDef.name}!`,
          `And... ${monName} learned ${newDef.name}!`,
        ],
        {
          waitForConfirm: true,
          onComplete: () => this._processNewMoves(mon, moveQueue, onDone),
        }
      );
    }
  }

  _startDefeatSequence() {
    this.phase = 'defeat';
    if (this.engine.isTrainer) {
      this.textBox.show('{PLAYER} is out of usable POKéMON!', {
        waitForConfirm: true,
        onComplete: () => this._showRivalOutro(false, 0),
      });
    } else {
      // Wild Battle Blackout: lose half money, heal party, warp back to last healing spot!
      const lost = Math.floor((gameState.money || 0) / 2);
      if (!this.isDebug) {
        gameState.money = Math.max(0, (gameState.money || 0) - lost);
        healParty(gameState.party);
        saveGame();
      }
      this.textBox.show(
        [
          '{PLAYER} is out of usable POKéMON!',
          '{PLAYER} whited out!',
        ],
        {
          waitForConfirm: true,
          onComplete: () => this._finishBattle(false, 0, { blackout: true }),
        }
      );
    }
  }

  _showRivalOutro(won, prizeMoney) {
    this.showEnemyTrainer = true;
    this.enemyTrainerOffsetX = 200;
    this.phase = 'rivalOutroSlide';
    this.pendingWon = won;
    this.pendingPrize = prizeMoney;
  }

  _finishBattle(won, money, extra = {}) {
    if (won && money > 0 && !this.isDebug) {
      gameState.money = (gameState.money || 0) + money;
    }
    const cb = this.onBattleEnd;
    this.manager.fadeAction(() => {
      this._hideDomSprites();
      this.manager.popScene();
      if (cb) cb({ won, money, ...extra });
    });
  }

  // =========================================================================
  // FIXED-TIMESTEP UPDATE
  // =========================================================================

  update(input) {
    this.tick += 1;
    if (this.shakeTimer > 0) this.shakeTimer -= 1;

    this.enemyHudOffsetX += (this.targetEnemyHudOffsetX - this.enemyHudOffsetX) * 0.2;
    this.playerHudOffsetX += (this.targetPlayerHudOffsetX - this.playerHudOffsetX) * 0.2;

    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      this.damagePopups[i].frame += 1;
      if (this.damagePopups[i].frame >= this.damagePopups[i].duration) {
        this.damagePopups.splice(i, 1);
      }
    }

    if (this.shinyAnim) {
      this.shinyAnim.frame += 1;
      if (this.shinyAnim.frame >= this.shinyAnim.duration) {
        this.shinyAnim = null;
      }
    }
    if (this.poisonAnim) {
      this.poisonAnim.frame += 1;
      if (this.poisonAnim.frame >= this.poisonAnim.duration) {
        this.poisonAnim = null;
      }
    }

    // Low-HP warning beep loop
    const inActiveFight =
      this.showPlayerMon &&
      this.engine.playerMon.currentHp > 0 &&
      this.engine.enemyMon.currentHp > 0 &&
      this.phase !== 'barsClose' &&
      this.phase !== 'barsOpen' &&
      this.phase !== 'victory' &&
      this.phase !== 'defeat' &&
      this.phase !== 'catching' &&
      this.phase !== 'caughtPrompt' &&
      this.phase !== 'nicknameEntry' &&
      this.phase !== 'rivalOutroSlide' &&
      this.phase !== 'rivalOutroDialogue';

    if (
      inActiveFight &&
      this.playerDisplayHp / Math.max(1, this.engine.playerMon.maxHp) <= 0.2
    ) {
      this.lowHpBeepTimer -= 1;
      if (this.lowHpBeepTimer <= 0) {
        audio.lowHpBeep();
        this.lowHpBeepTimer = 54;
      }
    } else {
      this.lowHpBeepTimer = 10;
    }

    // Inline Yes/No menu takes priority when open
    if (this.yesNoMenu) {
      this.yesNoMenu.update(input);
      return;
    }

    if (this.phase === 'forgetMove') {
      this._updateForgetMove(input);
      return;
    }

    if (this.phase === 'nicknameEntry') {
      this._updateNicknameEntry(input);
      return;
    }

    if (this.phase === 'shortDelay') {
      this.phaseTimer -= 1;
      if (this.phaseTimer <= 0 && this.shortDelayCb) {
        const cb = this.shortDelayCb;
        this.shortDelayCb = null;
        cb();
      }
      return;
    }

    // 1. Intro Flash + Wipe Close
    if (this.phase === 'barsClose') {
      this.phaseTimer += 1;
      const minDone = this.phaseTimer >= 36;
      const timeoutDone = this.phaseTimer >= 120;
      if (minDone && (this.spritesReady || timeoutDone)) {
        this.phase = 'barsOpen';
        this.phaseTimer = 0;
        audio.playTrack(this.engine.isTrainer ? 'battle' : 'wildBattle');
      }
      return;
    }

    // 2. Bars open + platforms & trainers / wild Pokémon slide in
    if (this.phase === 'barsOpen') {
      this.phaseTimer += 1;
      this.enemyPlatformOffsetX *= 0.82;
      this.playerPlatformOffsetX *= 0.82;
      this.enemyTrainerOffsetX *= 0.82;
      this.playerTrainerOffsetX *= 0.82;

      if (this.phaseTimer >= 26) {
        this.enemyPlatformOffsetX = 0;
        this.playerPlatformOffsetX = 0;
        this.enemyTrainerOffsetX = 0;
        this.playerTrainerOffsetX = 0;
        this.phase = 'introDialogue';

        if (this.engine.isTrainer) {
          this.textBox.show(`${this.engine.trainerName} wants to battle!`, {
            waitForConfirm: true,
            onComplete: () => this._startRivalSendOut(),
          });
        } else {
          this.targetEnemyHudOffsetX = 0;
          audio.cry(this.engine.enemyMon.speciesId);
          if (this.engine.enemyMon.isShiny) {
            audio.fanfare();
            this.shinyAnim = { frame: 0, duration: 48 };
            this.textBox.show(
              [`A wild ${this.engine.enemyMon.name} appeared!`, 'Shiny!'],
              {
                waitForConfirm: true,
                onComplete: () => this._startPlayerSendOut(),
              }
            );
          } else {
            this.textBox.show(`A wild ${this.engine.enemyMon.name} appeared!`, {
              waitForConfirm: true,
              onComplete: () => this._startPlayerSendOut(),
            });
          }
        }
      }
      return;
    }

    if (this.phase === 'introDialogue') {
      this.textBox.update(input);
      return;
    }

    // 3. Rival & Player ball throws + scale-in appear flash
    if (this.phase === 'rivalSendOut') {
      this.enemyTrainerOffsetX += 7;
      if (this.enemyTrainerOffsetX > 200) this.showEnemyTrainer = false;
      this.textBox.update(input);
      this._updateBallThrow();
      this._updateAppearAnim();
      return;
    }
    if (this.phase === 'rivalSendOutWait') {
      this.phaseTimer -= 1;
      if (this.phaseTimer <= 0) this._startPlayerSendOut();
      return;
    }
    if (this.phase === 'playerSendOut') {
      this.playerThrowTimer += 1;
      if (this.playerThrowTimer < 6) {
        this.playerThrowFrame = 1;
      } else if (this.playerThrowTimer < 12) {
        this.playerThrowFrame = 2;
      } else {
        this.playerThrowFrame = 3;
        this.playerTrainerOffsetX -= 6.5;
        if (this.playerTrainerOffsetX < -220) this.showPlayerTrainer = false;
      }
      this.textBox.update(input);
      this._updateBallThrow();
      this._updateAppearAnim();
      return;
    }
    if (this.phase === 'playerSendOutWait') {
      this.phaseTimer -= 1;
      if (this.phaseTimer <= 0) this._enterMainMenu();
      return;
    }

    // 3b. Catching Sequence
    if (this.phase === 'catching') {
      this.textBox.update(input);
      this._updateCatchAnim();
      return;
    }

    // 3c. Potion HP Heal Animation
    if (this.hpHeal) {
      if (this.playerDisplayHp < this.hpHeal.targetHp) {
        this.playerDisplayHp = Math.min(this.hpHeal.targetHp, this.playerDisplayHp + 0.55);
        return;
      }
      const cb = this.hpHeal.onDone;
      this.hpHeal = null;
      if (cb) cb();
      return;
    }

    // 4. Rival slide back in on battle conclusion
    if (this.phase === 'rivalOutroSlide') {
      this.enemyTrainerOffsetX *= 0.82;
      if (Math.abs(this.enemyTrainerOffsetX) < 1.5) {
        this.enemyTrainerOffsetX = 0;
        this.phase = 'rivalOutroDialogue';
        if (this.pendingWon) {
          this.textBox.show(
            `${this.engine.trainerName}: What? Unbelievable! I picked the wrong POKéMON!`,
            {
              waitForConfirm: true,
              onComplete: () => {
                audio.coin();
                this.textBox.show(`{PLAYER} got ₽${this.pendingPrize} for winning!`, {
                  waitForConfirm: true,
                  onComplete: () => this._finishBattle(true, this.pendingPrize),
                });
              },
            }
          );
        } else {
          this.textBox.show(`${this.engine.trainerName}: Yeah! Am I great or what?`, {
            waitForConfirm: true,
            onComplete: () => this._finishBattle(false, 0),
          });
        }
      }
      return;
    }

    // 5. Menus
    if (this.phase === 'mainMenu') {
      this._updateMainMenu(input);
      return;
    }
    if (this.phase === 'fightMenu') {
      this._updateFightMenu(input);
      return;
    }

    // 6. Active animations
    if (this.activeAnim) {
      this.activeAnim.frame += 1;
      if (this.activeAnim.frame >= this.activeAnim.duration) {
        this.activeAnim = null;
        this._processNextEvent();
      }
      return;
    }

    if (this.hpDrain) {
      const speed = 0.45;
      if (this.hpDrain.side === 'enemy') {
        if (this.enemyDisplayHp > this.hpDrain.targetHp) {
          this.enemyDisplayHp = Math.max(this.hpDrain.targetHp, this.enemyDisplayHp - speed);
          return;
        }
      } else {
        if (this.playerDisplayHp > this.hpDrain.targetHp) {
          this.playerDisplayHp = Math.max(this.hpDrain.targetHp, this.playerDisplayHp - speed);
          return;
        }
      }
      this.hpDrain = null;
      this._processNextEvent();
      return;
    }

    if (this.faintAnim) {
      this.faintAnim.frame += 1;
      const u = this.faintAnim.frame / this.faintAnim.duration;
      if (this.faintAnim.side === 'enemy') {
        this.enemyMonDrop = u * 96;
        this.enemyMonAlpha = Math.max(0, 1 - u * 0.7);
      } else {
        this.playerMonDrop = u * 116;
        this.playerMonAlpha = Math.max(0, 1 - u * 0.7);
      }
      if (this.faintAnim.frame >= this.faintAnim.duration) {
        const cb = this.faintAnim.onDone;
        this.faintAnim = null;
        if (cb) cb();
      }
      return;
    }

    if (this.expFill) {
      this.expFill.frame += 1;
      const u = Math.min(1, this.expFill.frame / this.expFill.duration);
      this.playerDisplayExp =
        this.expFill.startRatio + (this.expFill.targetRatio - this.expFill.startRatio) * u;
      if (this.expFill.frame >= this.expFill.duration) {
        const cb = this.expFill.onDone;
        this.expFill = null;
        if (cb) cb();
      }
      return;
    }

    if (this.phase === 'eventPause') {
      this.phaseTimer -= 1;
      if (this.phaseTimer <= 0) {
        this.phase = 'turnEvents';
        this._processNextEvent();
      }
      return;
    }

    if (this.textBox.active) {
      this.textBox.update(input);
    }
  }

  _updateBallThrow() {
    if (!this.ballThrow) return;
    this.ballThrow.frame += 1;
    if (this.ballThrow.frame >= this.ballThrow.duration) {
      const cb = this.ballThrow.onDone;
      this.ballThrow = null;
      if (cb) cb();
    }
  }

  _updateAppearAnim() {
    if (!this.appearAnim) return;
    this.appearAnim.frame += 1;
    const u = Math.min(1, this.appearAnim.frame / this.appearAnim.duration);
    const scale = 0.15 + 0.85 * (1 - Math.pow(1 - u, 3));
    const flash = u < 0.55;
    if (this.appearAnim.side === 'enemy') {
      this.enemyAppearScale = scale;
      this.enemyAppearFlash = flash;
    } else {
      this.playerAppearScale = scale;
      this.playerAppearFlash = flash;
    }
    if (this.appearAnim.frame >= this.appearAnim.duration) {
      const cb = this.appearAnim.onDone;
      this.appearAnim = null;
      if (cb) cb();
    }
  }

  _updateMainMenu(input) {
    if (input.wasJustPressed('left') || input.wasJustPressed('right')) {
      this.mainCursor ^= 1;
      audio.blip();
    } else if (input.wasJustPressed('up') || input.wasJustPressed('down')) {
      this.mainCursor ^= 2;
      audio.blip();
    } else if (input.wasJustPressed('confirm')) {
      audio.confirm();
      if (this.mainCursor === 0) {
        // FIGHT
        this.phase = 'fightMenu';
        this.moveCursor = Math.min(
          this.moveCursor,
          Math.max(0, this.engine.playerMon.moves.length - 1)
        );
      } else if (this.mainCursor === 1) {
        // BAG
        this._openBattleBag();
      } else if (this.mainCursor === 2) {
        // POKéMON
        this._openPartySwitch(false);
      } else if (this.mainCursor === 3) {
        // RUN
        if (this.engine.isTrainer) {
          this.phase = 'menuMessage';
          this.textBox.show("No! There's no running from a trainer battle!", {
            waitForConfirm: true,
            onComplete: () => this._enterMainMenu(),
          });
        } else {
          this.escapeAttempts += 1;
          const escaped = this.engine.attemptEscape(this.escapeAttempts);
          this.phase = 'menuMessage';
          if (escaped) {
            audio.cancel();
            this.textBox.show('Got away safely!', {
              waitForConfirm: true,
              onComplete: () => this._finishBattle(false, 0, { escaped: true }),
            });
          } else {
            this.textBox.show("Can't escape!", {
              waitForConfirm: true,
              onComplete: () => this._startEnemyOnlyTurn(),
            });
          }
        }
      }
    }
  }

  _updateFightMenu(input) {
    const moveCount = this.engine.playerMon.moves.length;

    if (input.wasJustPressed('cancel') || input.wasJustPressed('pause')) {
      audio.cancel();
      this.phase = 'mainMenu';
      return;
    }

    if (input.wasJustPressed('left') || input.wasJustPressed('right')) {
      const next = this.moveCursor ^ 1;
      if (next < moveCount) {
        this.moveCursor = next;
        audio.blip();
      }
    } else if (input.wasJustPressed('up') || input.wasJustPressed('down')) {
      const next = this.moveCursor ^ 2;
      if (next < moveCount) {
        this.moveCursor = next;
        audio.blip();
      }
    } else if (input.wasJustPressed('confirm')) {
      const chosen = this.engine.playerMon.moves[this.moveCursor];
      if (!chosen) return;
      if (chosen.pp <= 0) {
        audio.bump();
        this.phase = 'menuMessage';
        this.textBox.show("There's no PP left for this move!", {
          waitForConfirm: true,
          onComplete: () => {
            this.phase = 'fightMenu';
          },
        });
        return;
      }
      audio.confirm();
      this._startTurn(chosen);
    }
  }

  // =========================================================================
  // DOM GEN 5 ANIMATED GIF LAYER SYNC
  // =========================================================================

  _syncDomSprite(clipEl, imgEl, meta, {
    visible,
    centerX,
    bottomY,
    spriteScale,
    ox = 0,
    oy = 0,
    dropY = 0,
    scale = 1,
    alpha = 1,
    flash = false,
    blinkHide = false,
    tint = null,
  }) {
    if (!clipEl || !imgEl) return;
    if (!visible || !meta || !meta.url || blinkHide || alpha <= 0.01) {
      clipEl.style.display = 'none';
      return;
    }

    const canvasScale = this.manager.getCanvasScale ? this.manager.getCanvasScale() : 2;
    const natW = meta.width || 56;
    const natH = meta.height || 56;

    const logicalW = Math.round(natW * spriteScale);
    const logicalH = Math.round(natH * spriteScale);

    const clipW = logicalW + 80;
    const clipH = logicalH + 64;
    const clipLeft = (centerX - clipW / 2) * canvasScale;
    const clipTop = (bottomY - clipH) * canvasScale;

    clipEl.style.display = 'flex';
    clipEl.style.left = `${Math.round(clipLeft)}px`;
    clipEl.style.top = `${Math.round(clipTop)}px`;
    clipEl.style.width = `${Math.round(clipW * canvasScale)}px`;
    clipEl.style.height = `${Math.round(clipH * canvasScale)}px`;

    imgEl.style.width = `${Math.round(logicalW * canvasScale)}px`;
    imgEl.style.height = `${Math.round(logicalH * canvasScale)}px`;
    imgEl.style.opacity = String(Math.max(0, Math.min(1, alpha)));

    const tx = Math.round(ox * canvasScale);
    const ty = Math.round((oy + dropY) * canvasScale);
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale.toFixed(3)})`;

    if (flash) {
      imgEl.style.filter = 'brightness(8) contrast(0) brightness(2)';
    } else if (tint === 'blue') {
      imgEl.style.filter = 'sepia(1) saturate(4) hue-rotate(185deg) brightness(1.05)';
    } else if (tint === 'red') {
      imgEl.style.filter = 'sepia(1) saturate(5) hue-rotate(-30deg) brightness(1.1)';
    } else {
      imgEl.style.filter = 'drop-shadow(0 2px 0 rgba(16, 24, 38, 0.25))';
    }
  }

  // =========================================================================
  // LAYERED RENDER
  // =========================================================================

  render(ctx, vfxCtx) {
    const top = vfxCtx || ctx;

    // Never leak DOM GIFs when BagScene / PartyScene is pushed on top of BattleScene!
    const isTopScene =
      this.manager.stack && this.manager.stack[this.manager.stack.length - 1] === this;
    if (!isTopScene) {
      this._hideDomSprites();
    }

    // Step 1: Intro Wipe over live overworld (cinema bars for trainer, grass stripes for wild!)
    if (this.phase === 'barsClose') {
      this._hideDomSprites();
      const progress = Math.min(1, this.phaseTimer / 34);
      if (this.engine.isTrainer) {
        renderBattleBarsClose(top, progress);
      } else {
        renderWildEncounterWipe(top, progress);
      }
      return;
    }

    const swayX = Math.sin(this.tick * 0.022) * 1.6;
    const swayY = Math.cos(this.tick * 0.017) * 0.9;
    const shakeX =
      this.shakeTimer > 0 ? Math.round((Math.random() - 0.5) * 2 * this.shakeStrength) : 0;
    const shakeY =
      this.shakeTimer > 0 ? Math.round((Math.random() - 0.5) * 2 * this.shakeStrength) : 0;

    let animEval = null;
    if (this.activeAnim) {
      const t = this.activeAnim.frame / this.activeAnim.duration;
      animEval = evaluateMoveAnim(
        this.activeAnim.anim,
        this.activeAnim.moveType,
        this.activeAnim.statDirection,
        this.activeAnim.actorSide,
        t
      );
    }

    let pOx = 0;
    let pOy = 0;
    let pFlash = this.playerAppearFlash;
    let pBlink = false;
    let pTint = null;

    let eOx = 0;
    let eOy = 0;
    let eFlash = this.enemyAppearFlash;
    let eBlink = false;
    let eTint = this.enemyCatchTint;

    if (animEval && this.activeAnim) {
      if (this.activeAnim.actorSide === 'player') {
        pOx += animEval.actorOx;
        pOy += animEval.actorOy;
        if (this.activeAnim.targetSide === 'player') {
          pTint = animEval.targetTint;
        } else {
          eOx += animEval.targetOx;
          eOy += animEval.targetOy;
          eFlash = eFlash || animEval.targetFlash;
          eBlink = animEval.targetBlinkHide;
          eTint = eTint || animEval.targetTint;
        }
      } else {
        eOx += animEval.actorOx;
        eOy += animEval.actorOy;
        if (this.activeAnim.targetSide === 'enemy') {
          eTint = eTint || animEval.targetTint;
        } else {
          pOx += animEval.targetOx;
          pOy += animEval.targetOy;
          pFlash = pFlash || animEval.targetFlash;
          pBlink = animEval.targetBlinkHide;
          pTint = animEval.targetTint;
        }
      }
    }

    // --- BASE CANVAS: Background, Platforms, Trainers ---
    ctx.save();
    ctx.translate(shakeX, shakeY);

    renderBattleBackground(ctx, this.location, swayX, swayY);

    const enemyPlatX = ENEMY_PLATFORM.x + this.enemyPlatformOffsetX + swayX;
    const enemyPlatY = ENEMY_PLATFORM.y + swayY;
    const playerPlatX = PLAYER_PLATFORM.x + this.playerPlatformOffsetX + swayX;
    const playerPlatY = PLAYER_PLATFORM.y + swayY;

    renderBattlePlatform(ctx, enemyPlatX, enemyPlatY, 76, 20, this.location);
    renderBattlePlatform(ctx, playerPlatX, playerPlatY, 94, 24, this.location);

    if (this.showEnemyTrainer) {
      drawBattleTrainer(
        ctx,
        'rival',
        ENEMY_PLATFORM.x + this.enemyTrainerOffsetX + swayX,
        enemyPlatY + 6,
        1.55
      );
    }
    if (this.showPlayerTrainer) {
      drawBattleTrainer(
        ctx,
        'playerBack',
        PLAYER_PLATFORM.x - 10 + this.playerTrainerOffsetX + swayX,
        playerPlatY + 20,
        1.95,
        this.playerThrowFrame
      );
    }

    // Offline fallback placeholders
    if (this.showEnemyMon && (!this.enemySpriteMeta || !this.enemySpriteMeta.url) && !eBlink) {
      drawBattlePlaceholder(
        ctx,
        this.engine.enemyMon,
        enemyPlatX + eOx,
        enemyPlatY + 2 + eOy + this.enemyMonDrop,
        72,
        { alpha: this.enemyMonAlpha }
      );
    }
    if (this.showPlayerMon && (!this.playerSpriteMeta || !this.playerSpriteMeta.url) && !pBlink) {
      drawBattlePlaceholder(
        ctx,
        this.engine.playerMon,
        playerPlatX + pOx,
        playerPlatY + 16 + pOy + this.playerMonDrop,
        88,
        { alpha: this.playerMonAlpha }
      );
    }

    ctx.restore();

    // --- MIDDLE DOM LAYER: Animated Gen 5 Pixel GIFs ---
    const hideForOverlay = !isTopScene || this.phase === 'forgetMove' || this.phase === 'nicknameEntry';
    if (hideForOverlay) {
      this._hideDomSprites();
    } else {
      if (this.spriteLayer) {
        this.spriteLayer.style.display = 'block';
      }

      const enemyScale = this.enemySpriteMeta && !this.enemySpriteMeta.isAnimated ? 1.25 : 2.0;
      const playerScale = this.playerSpriteMeta && !this.playerSpriteMeta.isAnimated ? 1.55 : 2.35;

      this._syncDomSprite(this.enemyClipEl, this.enemyImgEl, this.enemySpriteMeta, {
        visible: this.showEnemyMon,
        centerX: enemyPlatX + shakeX,
        bottomY: enemyPlatY + 6 + shakeY,
        spriteScale: enemyScale,
        ox: eOx,
        oy: eOy,
        dropY: this.enemyMonDrop,
        scale: this.enemyAppearScale,
        alpha: this.enemyMonAlpha,
        flash: eFlash,
        blinkHide: eBlink,
        tint: eTint,
      });

      this._syncDomSprite(this.playerClipEl, this.playerImgEl, this.playerSpriteMeta, {
        visible: this.showPlayerMon,
        centerX: playerPlatX - 4 + shakeX,
        bottomY: playerPlatY + 22 + shakeY,
        spriteScale: playerScale,
        ox: pOx,
        oy: pOy,
        dropY: this.playerMonDrop,
        scale: this.playerAppearScale,
        alpha: this.playerMonAlpha,
        flash: pFlash,
        blinkHide: pBlink,
        tint: pTint,
      });
    }

    // --- TOP VFX & UI CANVAS ---
    top.save();
    top.translate(shakeX, shakeY);

    if (this.ballThrow) {
      const t = this.ballThrow.frame / this.ballThrow.duration;
      renderPokeBallThrow(
        top,
        this.ballThrow.startX + swayX,
        this.ballThrow.startY + swayY,
        this.ballThrow.endX + swayX,
        this.ballThrow.endY + swayY,
        t
      );
    }

    if (this.catchAnim) {
      renderCatchSequence(top, this.catchAnim, { x: enemyPlatX, y: enemyPlatY });
    }

    if (this.shinyAnim) {
      renderShinySparkle(
        top,
        enemyPlatX,
        enemyPlatY,
        this.shinyAnim.frame / this.shinyAnim.duration
      );
    }

    if (this.poisonAnim) {
      const pPos =
        this.poisonAnim.side === 'enemy'
          ? { x: enemyPlatX, y: enemyPlatY }
          : { x: playerPlatX, y: playerPlatY };
      renderPoisonBubbles(
        top,
        pPos.x,
        pPos.y,
        this.poisonAnim.frame / this.poisonAnim.duration
      );
    }

    if (animEval && animEval.overlay && this.activeAnim) {
      const actorPos =
        this.activeAnim.actorSide === 'player'
          ? { x: playerPlatX, y: playerPlatY }
          : { x: enemyPlatX, y: enemyPlatY };
      const targetPos =
        this.activeAnim.targetSide === 'player'
          ? { x: playerPlatX, y: playerPlatY }
          : { x: enemyPlatX, y: enemyPlatY };
      renderMoveOverlay(top, animEval.overlay, actorPos, targetPos);
    }

    renderDamagePopups(top, this.damagePopups);
    top.restore();

    renderEnemyHud(top, this.engine.enemyMon, this.enemyDisplayHp, this.enemyHudOffsetX, this.tick);
    renderPlayerHud(top, this.engine.playerMon, this.playerDisplayHp, this.playerDisplayExp, {
      offsetX: this.playerHudOffsetX,
      tick: this.tick,
      expShimmer: Boolean(this.expFill),
    });

    if (this.levelUpInfo) {
      renderLevelUpPanel(top, this.levelUpInfo);
    }

    if (this.phase === 'mainMenu') {
      renderMainActionMenu(top, this.engine.playerMon, this.mainCursor, this.tick);
    } else if (this.phase === 'fightMenu') {
      renderFightMenu(top, this.engine.playerMon, this.moveCursor, this.tick);
    } else if (this.textBox.active) {
      this.textBox.render(top);
    }

    if (this.yesNoMenu) {
      this.yesNoMenu.render(top);
    }

    if (this.phase === 'forgetMove' && this.forgetContext) {
      renderForgetMoveMenu(
        top,
        this.forgetContext.mon,
        this.forgetContext.moveId,
        this.forgetCursor,
        this.tick
      );
    }

    if (this.phase === 'nicknameEntry' && this.nicknameContext) {
      renderNicknamePanel(
        top,
        this.nicknameContext.mon,
        this.nicknameText,
        this.nicknameCursor,
        this.tick
      );
    }

    if (this.phase === 'barsOpen') {
      renderBattleBarsOpen(top, Math.min(1, this.phaseTimer / 18));
    }
  }
}
