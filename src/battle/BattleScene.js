/**
 * DS / Gen 5 ROM-style Battle Scene (480x270).
 * Uses a sandwiched DOM <img> layer for authentic animated Gen 5 PokéAPI GIFs
 * (crisp pixelated, synced to exact integer canvas scale on resize/fullscreen,
 * with overflow-hidden platform clip masks for faint slide-down) beneath a transparent
 * top VFX/UI canvas so move particles, slashes, damage popups, HP boxes, and menus
 * always render cleanly ON TOP of the animated Pokémon sprites.
 */

import { audio } from '../audio.js';
import { CONFIG } from '../config.js';
import {
  applyExpGain,
  drawBattlePlaceholder,
  preloadBattleSprite,
} from '../data/pokemon.js';
import { drawBattleTrainer } from '../entities/sprites.js';
import { gameState } from '../state.js';
import { TextBox } from '../ui/TextBox.js';
import {
  evaluateMoveAnim,
  renderBattleBarsClose,
  renderBattleBarsOpen,
  renderDamagePopups,
  renderMoveOverlay,
  renderPokeBallThrow,
} from './animations.js';
import { BattleEngine } from './BattleEngine.js';
import {
  ENEMY_PLATFORM,
  PLAYER_PLATFORM,
  renderBattleBackground,
  renderBattlePlatform,
  renderEnemyHud,
  renderFightMenu,
  renderLevelUpPanel,
  renderMainActionMenu,
  renderPartyOverlay,
  renderPlayerHud,
} from './BattleUI.js';

const NATIVE_W = 480;
const NATIVE_H = 270;

export class BattleScene {
  constructor(manager) {
    this.manager = manager;
    this.engine = null;
    this.textBox = new TextBox();

    this.location = 'lab';
    this.onBattleEnd = null;
    this.isDebug = false;

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

    this.enemyMonAlpha = 1;
    this.playerMonAlpha = 1;
    this.enemyMonDrop = 0;
    this.playerMonDrop = 0;

    this.playerDisplayHp = 20;
    this.enemyDisplayHp = 20;
    this.playerDisplayExp = 0;

    this.ballThrow = null;
    this.appearAnim = null;
    this.eventQueue = [];
    this.activeAnim = null;
    this.hpDrain = null;
    this.faintAnim = null;
    this.expFill = null;
    this.damagePopups = [];

    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.lowHpBeepTimer = 0;

    this.mainCursor = 0;
    this.moveCursor = 0;
    this.levelUpInfo = null;
  }

  /** Keep OverworldScene visible beneath the initial flash & closing cinema bars. */
  get isOverlay() {
    return this.phase === 'barsClose';
  }

  onEnter({
    playerMon,
    enemyMon,
    location = 'lab',
    isTrainer = true,
    trainerName = null,
    canLoseStory = true,
    isDebug = false,
    onBattleEnd = null,
  }) {
    const rivalDisplay = trainerName || gameState.rivalName || 'GARY';
    this.engine = new BattleEngine({
      playerMon,
      enemyMon,
      isTrainer,
      trainerName: rivalDisplay,
      canLoseStory,
    });

    this.location = location || 'lab';
    this.onBattleEnd = onBattleEnd;
    this.isDebug = isDebug;
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
    this.enemyMonAlpha = 1;
    this.playerMonAlpha = 1;
    this.enemyMonDrop = 0;
    this.playerMonDrop = 0;

    this.ballThrow = null;
    this.appearAnim = null;
    this.eventQueue = [];
    this.activeAnim = null;
    this.hpDrain = null;
    this.faintAnim = null;
    this.expFill = null;
    this.damagePopups = [];
    this.levelUpInfo = null;
    this.lowHpBeepTimer = 0;
    this.mainCursor = 0;
    this.moveCursor = 0;

    // Preload animated Gen 5 GIFs (with static PNG fallback) DURING intro bars transition
    this.spritesReady = false;
    this.enemySpriteMeta = null;
    this.playerSpriteMeta = null;
    this._hideDomSprites();

    Promise.all([
      preloadBattleSprite(enemyMon.speciesId, 'front'),
      preloadBattleSprite(playerMon.speciesId, 'back'),
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

    audio.battleStart();
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
  // INTRO SEQUENCE
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
        this.targetEnemyHudOffsetX = 0; // Slide enemy HP box in from left edge!
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

  _startPlayerSendOut() {
    this.phase = 'playerSendOut';
    this.playerThrowTimer = 0;
    this.playerThrowFrame = 1; // Wind-up frame!
    this.textBox.show(`Go! ${this.engine.playerMon.name}!`, {
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
        this.targetPlayerHudOffsetX = 0; // Slide player HP box in from right edge!
        audio.cry(this.engine.playerMon.speciesId);

        this.appearAnim = {
          side: 'player',
          frame: 0,
          duration: 18,
          onDone: () => {
            this.playerAppearScale = 1;
            this.playerAppearFlash = false;
            this.phaseTimer = 16;
            this.phase = 'playerSendOutWait';
          },
        };
      },
    };
  }

  _enterMainMenu() {
    this.textBox.close();
    this.phase = 'mainMenu';
  }

  // =========================================================================
  // TURN EVENT PROCESSOR
  // =========================================================================

  _startTurn(moveSlot) {
    this.eventQueue = this.engine.resolveTurn(moveSlot);
    this.phase = 'turnEvents';
    this._processNextEvent();
  }

  _processNextEvent() {
    if (this.eventQueue.length === 0) {
      if (this.engine.enemyMon.currentHp <= 0) {
        this._startVictorySequence();
      } else if (this.engine.playerMon.currentHp <= 0) {
        this._startDefeatSequence();
      } else {
        this._enterMainMenu();
      }
      return;
    }

    const ev = this.eventQueue.shift();

    if (ev.type === 'useMove') {
      const prefix = ev.actorSide === 'enemy' ? 'Foe ' : '';
      this.textBox.show(`${prefix}${ev.attackerName} used ${ev.move.name}!`, {
        waitForConfirm: false,
        onComplete: () => {
          this.phaseTimer = 12;
          this.phase = 'eventPause';
        },
      });
      return;
    }

    if (ev.type === 'miss') {
      const prefix = ev.actorSide === 'enemy' ? 'Foe ' : '';
      this.textBox.show(`${prefix}${ev.attackerName} missed!`, {
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
      // Slide fainted Pokémon's HP box cleanly off screen
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
  // VICTORY & DEFEAT
  // =========================================================================

  _startVictorySequence() {
    this.phase = 'victory';
    const playerMon = this.engine.playerMon;
    const expGain = this.engine.getExpReward();
    const prizeMoney = this.engine.getPrizeMoney();

    const startRatio = this._calcExpRatio(playerMon);
    const result = applyExpGain(playerMon, expGain);
    const endRatio = result.leveledUp ? 1 : this._calcExpRatio(playerMon);

    this.textBox.show(`${playerMon.name} gained ${expGain} EXP. Points!`, {
      waitForConfirm: false,
      onComplete: () => {
        this.expFill = {
          startRatio,
          targetRatio: endRatio,
          frame: 0,
          duration: 38,
          onDone: () => {
            if (result.leveledUp) {
              audio.levelUp();
              this.playerDisplayExp = this._calcExpRatio(playerMon);
              this.playerDisplayHp = playerMon.currentHp;
              this.levelUpInfo = result;
              this.textBox.show(`${playerMon.name} grew to Lv${result.newLevel}!`, {
                waitForConfirm: true,
                onComplete: () => {
                  this.levelUpInfo = null;
                  this._showRivalOutro(true, prizeMoney);
                },
              });
            } else {
              this._showRivalOutro(true, prizeMoney);
            }
          },
        };
      },
    });
  }

  _startDefeatSequence() {
    this.phase = 'defeat';
    this.textBox.show('{PLAYER} is out of usable POKéMON!', {
      waitForConfirm: true,
      onComplete: () => this._showRivalOutro(false, 0),
    });
  }

  _showRivalOutro(won, prizeMoney) {
    this.showEnemyTrainer = true;
    this.enemyTrainerOffsetX = 200;
    this.phase = 'rivalOutroSlide';
    this.pendingWon = won;
    this.pendingPrize = prizeMoney;
  }

  _finishBattle(won, money) {
    if (won && money > 0 && !this.isDebug) {
      gameState.money = (gameState.money || 0) + money;
    }
    const cb = this.onBattleEnd;
    this.manager.fadeAction(() => {
      this._hideDomSprites();
      this.manager.popScene();
      if (cb) cb({ won, money });
    });
  }

  // =========================================================================
  // FIXED-TIMESTEP UPDATE
  // =========================================================================

  update(input) {
    this.tick += 1;
    if (this.shakeTimer > 0) this.shakeTimer -= 1;

    // Smoothly ease HP boxes toward target slide positions
    this.enemyHudOffsetX += (this.targetEnemyHudOffsetX - this.enemyHudOffsetX) * 0.2;
    this.playerHudOffsetX += (this.targetPlayerHudOffsetX - this.playerHudOffsetX) * 0.2;

    // Update floating damage popups
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      this.damagePopups[i].frame += 1;
      if (this.damagePopups[i].frame >= this.damagePopups[i].duration) {
        this.damagePopups.splice(i, 1);
      }
    }

    // Low-HP warning beep loop when player Pokémon HP <= 20% and still battling
    const inActiveFight =
      this.showPlayerMon &&
      this.engine.playerMon.currentHp > 0 &&
      this.engine.enemyMon.currentHp > 0 &&
      this.phase !== 'barsClose' &&
      this.phase !== 'barsOpen' &&
      this.phase !== 'victory' &&
      this.phase !== 'defeat' &&
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

    // 1. Intro Flash + Black Bars Close (holds briefly if GIFs are still preloading)
    if (this.phase === 'barsClose') {
      this.phaseTimer += 1;
      const minDone = this.phaseTimer >= 36;
      const timeoutDone = this.phaseTimer >= 120;
      if (minDone && (this.spritesReady || timeoutDone)) {
        this.phase = 'barsOpen';
        this.phaseTimer = 0;
        audio.playTrack('battle');
      }
      return;
    }

    // 2. Bars open + platforms & trainers slide in from sides
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
        this.textBox.show(`${this.engine.trainerName} wants to battle!`, {
          waitForConfirm: true,
          onComplete: () => this._startRivalSendOut(),
        });
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
      // 4-frame Gen 3 throw animation: 1=wind-up -> 2=throw -> 3=follow-through while sliding out
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
    if (this.phase === 'partyView') {
      if (
        input.wasJustPressed('cancel') ||
        input.wasJustPressed('pause') ||
        input.wasJustPressed('confirm')
      ) {
        audio.cancel();
        this.phase = 'mainMenu';
      }
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
        this.phase = 'fightMenu';
        this.moveCursor = Math.min(
          this.moveCursor,
          Math.max(0, this.engine.playerMon.moves.length - 1)
        );
      } else if (this.mainCursor === 1) {
        this.phase = 'menuMessage';
        this.textBox.show("You don't have any items yet!", {
          waitForConfirm: true,
          onComplete: () => this._enterMainMenu(),
        });
      } else if (this.mainCursor === 2) {
        this.phase = 'partyView';
      } else if (this.mainCursor === 3) {
        this.phase = 'menuMessage';
        this.textBox.show("No! There's no running from a trainer battle!", {
          waitForConfirm: true,
          onComplete: () => this._enterMainMenu(),
        });
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

    // Native sprite size in 480x270 logical pixels (2x foe, 2.3x closer player back)
    const logicalW = Math.round(natW * spriteScale);
    const logicalH = Math.round(natH * spriteScale);

    // Clipping container sits right on the platform baseline so faint slide-down masks cleanly!
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
  // LAYERED RENDER:
  //   ctx    (base canvas)  -> Background, platforms, trainers, ball throws
  //   DOM    (middle layer) -> Animated Gen 5 GIFs (2x pixelated + clip masks)
  //   vfxCtx (top canvas)   -> Move VFX, damage numbers, HP boxes, dialogue, menus, bars
  // =========================================================================

  render(ctx, vfxCtx) {
    const top = vfxCtx || ctx;

    // Step 1: Closing black cinema bars directly over live overworld
    if (this.phase === 'barsClose') {
      this._hideDomSprites();
      renderBattleBarsClose(top, Math.min(1, this.phaseTimer / 34));
      return;
    }

    // Subtle DS-style idle camera sway (1-2 px gentle drift) + impact screen shake
    const swayX = Math.sin(this.tick * 0.022) * 1.6;
    const swayY = Math.cos(this.tick * 0.017) * 0.9;
    const shakeX =
      this.shakeTimer > 0 ? Math.round((Math.random() - 0.5) * 2 * this.shakeStrength) : 0;
    const shakeY =
      this.shakeTimer > 0 ? Math.round((Math.random() - 0.5) * 2 * this.shakeStrength) : 0;

    // Evaluate active move animation offsets & tints
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
    let eTint = null;

    if (animEval && this.activeAnim) {
      if (this.activeAnim.actorSide === 'player') {
        pOx += animEval.actorOx;
        pOy += animEval.actorOy;
        eOx += animEval.targetOx;
        eOy += animEval.targetOy;
        eFlash = eFlash || animEval.targetFlash;
        eBlink = animEval.targetBlinkHide;
        eTint = animEval.targetTint;
      } else {
        eOx += animEval.actorOx;
        eOy += animEval.actorOy;
        pOx += animEval.targetOx;
        pOy += animEval.targetOy;
        pFlash = pFlash || animEval.targetFlash;
        pBlink = animEval.targetBlinkHide;
        pTint = animEval.targetTint;
      }
    }

    // --- BASE CANVAS: Background, Platforms, Trainers, Poké Ball Throw ---
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

    // Offline fallback placeholder directly on canvas if GIF+PNG both failed
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
    if (this.spriteLayer) {
      this.spriteLayer.style.display = 'block';
    }

    // Foe front sprite at 2x pixel scale (note: PNG fallback is 96x96 padded, GIF is tight ~50x50)
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

    // Player back sprite positioned closer/larger bottom-left (tucked neatly behind dialogue box!)
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

    // --- TOP VFX & UI CANVAS (ALWAYS ABOVE THE ANIMATED GIFs!) ---
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

    // ROM-inspired sliding HP boxes
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

    if (this.phase === 'partyView') {
      renderPartyOverlay(top, [this.engine.playerMon]);
    }

    // Opening black cinema bars during intro reveal
    if (this.phase === 'barsOpen') {
      renderBattleBarsOpen(top, Math.min(1, this.phaseTimer / 18));
    }
  }
}
