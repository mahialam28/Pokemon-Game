/**
 * Pure Gen 3 Battle Engine (ZERO rendering or DOM dependencies).
 * Supports Trainer battles (Rival) and Phase 3 Wild Encounters.
 *
 * Implements:
 * - Stat stages (-6..+6) including Accuracy & Evasion
 * - Turn order by effective Speed (random tie-breaker)
 * - Accuracy checks with Gen 3 acc/eva stage multipliers
 * - Gen 3 damage formula (STAB 1.5x, 18-type effectiveness, 0.85-1.0 random, 1/16 crit 2x)
 * - Self & foe stat changes, Poison status (PSN) infliction & 1/8 end-of-turn damage
 * - Rival AI vs Wild random move AI
 * - Gen 3 Speed-based Escape formula & Gen 3 Catch Rate (shake checks) formula
 * - EXP & prize money calculation
 */

import { getMove } from '../data/moves.js';
import { getPokemonDisplayName } from '../data/pokemon.js';
import { getTypeEffectiveness } from '../data/typeChart.js';

const STAT_LABELS = {
  atk: 'ATTACK',
  def: 'DEFENSE',
  spa: 'SP. ATK',
  spd: 'SP. DEF',
  spe: 'SPEED',
  acc: 'ACCURACY',
  eva: 'EVASION',
};

/** Gen 3 stat stage multiplier (-6 to +6) for Atk/Def/SpA/SpD/Spe. */
export function stageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage));
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}

/** Gen 3 Accuracy / Evasion stage multiplier (-6 to +6). */
export function accEvaMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage));
  return s >= 0 ? (3 + s) / 3 : 3 / (3 - s);
}

export function createStages() {
  return { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
}

export class BattleEngine {
  /**
   * @param {object} config
   * @param {object} config.playerMon  Full Pokémon object from gameState.party
   * @param {object} config.enemyMon   Full Pokémon object for foe
   * @param {boolean} [config.isTrainer=true]
   * @param {string} [config.trainerName='RIVAL']
   * @param {boolean} [config.canLoseStory=false] True for Phase 2 lab rival battle
   */
  constructor({
    playerMon,
    enemyMon,
    isTrainer = true,
    trainerName = 'RIVAL',
    canLoseStory = false,
  }) {
    this.playerMon = playerMon;
    this.enemyMon = enemyMon;
    this.isTrainer = isTrainer;
    this.trainerName = trainerName;
    this.canLoseStory = canLoseStory;

    this.playerStages = createStages();
    this.enemyStages = createStages();
    this.turnNumber = 0;
  }

  /** Switch active player Pokémon and reset player stat stages. */
  setActivePlayerMon(newMon) {
    this.playerMon = newMon;
    this.playerStages = createStages();
  }

  getSideLabel(side, mon) {
    if (side === 'player') return getPokemonDisplayName(mon);
    return this.isTrainer ? `Foe ${mon.name}` : `Wild ${mon.name}`;
  }

  getEffectiveStat(mon, stages, stat, { ignoreNeg = false, ignorePos = false } = {}) {
    let stage = stages[stat] || 0;
    if (ignoreNeg && stage < 0) stage = 0;
    if (ignorePos && stage > 0) stage = 0;
    return Math.max(1, Math.floor(mon.stats[stat] * stageMultiplier(stage)));
  }

  /**
   * Enemy AI move picker:
   * - Wild Pokémon: random usable move.
   * - Trainer / Rival: primarily attacks; ~30% chance for status move in turns 1-2.
   */
  chooseEnemyMove() {
    const moves = this.enemyMon.moves || [];
    const usable = moves.filter((m) => m.pp > 0);
    if (usable.length === 0) {
      return { id: 'tackle', pp: 1, maxPp: 35 };
    }

    if (!this.isTrainer) {
      return usable[Math.floor(Math.random() * usable.length)];
    }

    const attackMoves = usable.filter((m) => getMove(m.id).power > 0);
    const statusMoves = usable.filter((m) => getMove(m.id).power === 0);

    if (this.turnNumber <= 2 && statusMoves.length > 0 && Math.random() < 0.3) {
      const candidate = statusMoves[Math.floor(Math.random() * statusMoves.length)];
      const def = getMove(candidate.id);
      const stat = def.statChange && def.statChange.stat;
      if (!stat || this.playerStages[stat] > -6) {
        return candidate;
      }
    }

    if (attackMoves.length > 0) {
      return attackMoves[Math.floor(Math.random() * attackMoves.length)];
    }
    return usable[0];
  }

  /**
   * Determine turn order by effective Speed (random tie-breaker).
   * Quick Attack grants +1 priority if chosen!
   */
  determineTurnOrder(playerMoveSlot = null, enemyMoveSlot = null) {
    const pPri = playerMoveSlot && playerMoveSlot.id === 'quickAttack' ? 1 : 0;
    const ePri = enemyMoveSlot && enemyMoveSlot.id === 'quickAttack' ? 1 : 0;
    if (pPri > ePri) return ['player', 'enemy'];
    if (ePri > pPri) return ['enemy', 'player'];

    const pSpe = this.getEffectiveStat(this.playerMon, this.playerStages, 'spe');
    const eSpe = this.getEffectiveStat(this.enemyMon, this.enemyStages, 'spe');
    if (pSpe > eSpe) return ['player', 'enemy'];
    if (eSpe > pSpe) return ['enemy', 'player'];
    return Math.random() < 0.5 ? ['player', 'enemy'] : ['enemy', 'player'];
  }

  _tryApplyStatus(targetMon, targetSide, statusEffect, events, isPrimaryStatusMove = false) {
    if (!statusEffect || targetMon.currentHp <= 0) return;
    if (statusEffect.status === 'PSN') {
      const targetName = this.getSideLabel(targetSide, targetMon);
      const types = targetMon.types || [];
      if (types.includes('POISON') || types.includes('STEEL')) {
        if (isPrimaryStatusMove) {
          events.push({ type: 'message', text: `It doesn't affect ${targetName}...` });
        }
        return;
      }
      if (targetMon.status) {
        if (isPrimaryStatusMove) {
          events.push({ type: 'message', text: `${targetName} is already poisoned!` });
        }
        return;
      }
      if (Math.random() < statusEffect.chance) {
        targetMon.status = 'PSN';
        events.push({
          type: 'status',
          targetSide,
          status: 'PSN',
          text: `${targetName} was poisoned!`,
        });
      }
    }
  }

  /**
   * Execute a single move by `actorSide` ('player' | 'enemy') and mutate HP/PP/stages.
   * Returns an ordered list of atomic battle events for BattleScene to animate.
   */
  executeMove(actorSide, moveSlot) {
    const isPlayer = actorSide === 'player';
    const attacker = isPlayer ? this.playerMon : this.enemyMon;
    const defender = isPlayer ? this.enemyMon : this.playerMon;
    const atkStages = isPlayer ? this.playerStages : this.enemyStages;
    const defStages = isPlayer ? this.enemyStages : this.playerStages;
    const foeSide = isPlayer ? 'enemy' : 'player';

    const attackerLabel = this.getSideLabel(actorSide, attacker);
    const defenderLabel = this.getSideLabel(foeSide, defender);

    const move = getMove(moveSlot.id);
    if (moveSlot.pp > 0) {
      moveSlot.pp -= 1;
    }

    const events = [
      {
        type: 'useMove',
        actorSide,
        targetSide: foeSide,
        attackerName: attackerLabel,
        move,
      },
    ];

    const isSelfTarget = move.statChange && move.statChange.target === 'self';

    // Accuracy check (skip for self-targeting moves like Withdraw)
    if (!isSelfTarget) {
      const netAccStage = Math.max(-6, Math.min(6, (atkStages.acc || 0) - (defStages.eva || 0)));
      const effectiveAcc = move.accuracy * accEvaMultiplier(netAccStage);
      if (Math.random() * 100 >= effectiveAcc) {
        events.push({
          type: 'miss',
          actorSide,
          attackerName: attackerLabel,
        });
        return events;
      }
    }

    // Status move: stat change (self or foe)
    if (move.category === 'status' && move.statChange) {
      const { target, stat, stages } = move.statChange;
      const affectSelf = target === 'self';
      const affectedSide = affectSelf ? actorSide : foeSide;
      const affectedMon = affectSelf ? attacker : defender;
      const affectedStages = affectSelf ? atkStages : defStages;
      const affectedLabel = this.getSideLabel(affectedSide, affectedMon);

      const prev = affectedStages[stat] || 0;
      const next = Math.max(-6, Math.min(6, prev + stages));
      affectedStages[stat] = next;

      events.push({
        type: 'anim',
        anim: move.anim,
        moveType: move.type,
        statDirection: stages > 0 ? 'up' : 'down',
        actorSide,
        targetSide: affectedSide,
      });

      const statLabel = STAT_LABELS[stat] || stat.toUpperCase();
      if (next === prev) {
        events.push({
          type: 'statLimit',
          targetSide: affectedSide,
          text:
            stages > 0
              ? `${affectedLabel}'s ${statLabel} won't go any higher!`
              : `${affectedLabel}'s ${statLabel} won't go any lower!`,
        });
      } else {
        events.push({
          type: 'statChange',
          targetSide: affectedSide,
          stat,
          delta: next - prev,
          text:
            stages > 0
              ? `${affectedLabel}'s ${statLabel} rose!`
              : `${affectedLabel}'s ${statLabel} fell!`,
        });
      }
      return events;
    }

    // Status move: primary status infliction (e.g. PoisonPowder)
    if (move.category === 'status' && move.statusEffect) {
      events.push({
        type: 'anim',
        anim: move.anim,
        moveType: move.type,
        statDirection: 'down',
        actorSide,
        targetSide: foeSide,
      });
      this._tryApplyStatus(defender, foeSide, move.statusEffect, events, true);
      return events;
    }

    // Damaging move — Gen 3 formula
    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    if (effectiveness === 0) {
      events.push({
        type: 'effectiveness',
        multiplier: 0,
        text: `It doesn't affect ${defenderLabel}...`,
      });
      return events;
    }

    const isCrit = Math.random() < 1 / 16;
    const atkStatKey = move.category === 'special' ? 'spa' : 'atk';
    const defStatKey = move.category === 'special' ? 'spd' : 'def';

    // Gen 3 crits ignore attacker negative stages & defender positive stages
    const atkVal = this.getEffectiveStat(attacker, atkStages, atkStatKey, { ignoreNeg: isCrit });
    const defVal = this.getEffectiveStat(defender, defStages, defStatKey, { ignorePos: isCrit });

    const levelTerm = Math.floor((2 * attacker.level) / 5) + 2;
    let damage = Math.floor((levelTerm * move.power * (atkVal / defVal)) / 50) + 2;

    if (isCrit) {
      damage = Math.floor(damage * 2);
    }

    const randFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randFactor);

    // STAB 1.5x
    if ((attacker.types || []).includes(move.type)) {
      damage = Math.floor(damage * 1.5);
    }

    // Type effectiveness
    damage = Math.floor(damage * effectiveness);
    damage = Math.max(1, damage);

    const prevHp = defender.currentHp;
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    events.push({
      type: 'anim',
      anim: move.anim,
      moveType: move.type,
      actorSide,
      targetSide: foeSide,
      isCrit,
      effectiveness,
    });

    events.push({
      type: 'damage',
      targetSide: foeSide,
      damage,
      prevHp,
      newHp: defender.currentHp,
      maxHp: defender.maxHp,
      isCrit,
      effectiveness,
    });

    if (isCrit) {
      events.push({ type: 'message', text: 'A critical hit!' });
    }
    if (effectiveness > 1) {
      events.push({ type: 'message', text: "It's super effective!" });
    } else if (effectiveness < 1) {
      events.push({ type: 'message', text: "It's not very effective..." });
    }

    if (defender.currentHp <= 0) {
      events.push({
        type: 'faint',
        targetSide: foeSide,
        pokemon: defender,
        text: `${defenderLabel} fainted!`,
      });
    } else if (move.statusEffect) {
      this._tryApplyStatus(defender, foeSide, move.statusEffect, events, false);
    }

    return events;
  }

  /** End-of-turn Poison (PSN) damage: 1/8 max HP per turn. */
  resolveEndOfTurnStatus() {
    const events = [];
    const pairs = [
      { side: 'player', mon: this.playerMon },
      { side: 'enemy', mon: this.enemyMon },
    ];

    for (const { side, mon } of pairs) {
      if (this.playerMon.currentHp <= 0 || this.enemyMon.currentHp <= 0) break;
      if (mon.status === 'PSN' && mon.currentHp > 0) {
        const dmg = Math.max(1, Math.floor(mon.maxHp / 8));
        const prevHp = mon.currentHp;
        mon.currentHp = Math.max(0, mon.currentHp - dmg);
        const label = this.getSideLabel(side, mon);

        events.push({
          type: 'poisonDamage',
          targetSide: side,
          damage: dmg,
          prevHp,
          newHp: mon.currentHp,
          maxHp: mon.maxHp,
          text: `${label} is hurt by poison!`,
        });

        if (mon.currentHp <= 0) {
          events.push({
            type: 'faint',
            targetSide: side,
            pokemon: mon,
            text: `${label} fainted!`,
          });
        }
      }
    }

    return events;
  }

  /**
   * Resolve a full turn (player chose `playerMoveSlot`; AI picks `enemyMoveSlot`).
   * Stops immediately if either Pokémon faints mid-turn.
   */
  resolveTurn(playerMoveSlot) {
    this.turnNumber += 1;
    const enemyMoveSlot = this.chooseEnemyMove();
    const order = this.determineTurnOrder(playerMoveSlot, enemyMoveSlot);
    const allEvents = [];

    for (const side of order) {
      if (this.playerMon.currentHp <= 0 || this.enemyMon.currentHp <= 0) break;
      const slot = side === 'player' ? playerMoveSlot : enemyMoveSlot;
      const stepEvents = this.executeMove(side, slot);
      allEvents.push(...stepEvents);
    }

    if (this.playerMon.currentHp > 0 && this.enemyMon.currentHp > 0) {
      allEvents.push(...this.resolveEndOfTurnStatus());
    }

    return allEvents;
  }

  /**
   * Resolve an enemy-only turn (after player uses an item, switches, or fails to run/catch).
   */
  resolveEnemyOnlyTurn() {
    this.turnNumber += 1;
    const allEvents = [];
    if (this.enemyMon.currentHp > 0 && this.playerMon.currentHp > 0) {
      const enemyMoveSlot = this.chooseEnemyMove();
      allEvents.push(...this.executeMove('enemy', enemyMoveSlot));
    }
    if (this.playerMon.currentHp > 0 && this.enemyMon.currentHp > 0) {
      allEvents.push(...this.resolveEndOfTurnStatus());
    }
    return allEvents;
  }

  /**
   * Gen 3 Wild Escape Formula:
   * - Guaranteed if Player Speed >= Wild Speed
   * - Otherwise F = floor((A * 128) / B) + 30 * attempts; escapes if random(0..255) < F % 256 (or F >= 256)
   */
  attemptEscape(attempts = 1) {
    if (this.isTrainer) return false;
    const pSpe = this.getEffectiveStat(this.playerMon, this.playerStages, 'spe');
    const eSpe = this.getEffectiveStat(this.enemyMon, this.enemyStages, 'spe');
    if (pSpe >= eSpe) return true;
    const f = Math.floor((pSpe * 128) / Math.max(1, eSpe)) + 30 * attempts;
    if (f >= 256) return true;
    return Math.floor(Math.random() * 256) < f;
  }

  /**
   * Gen 3 Catch Rate Formula:
   * a = (((3*MaxHP - 2*CurHP) * CatchRate * BallBonus) / (3*MaxHP)) * StatusBonus
   * b = floor(1048560 / sqrt(sqrt(16711680 / a)))
   * Performs 4 shake checks against b; returns { caught: boolean, shakes: 0..3 }.
   */
  attemptCatch(ballBonus = 1.0) {
    const mon = this.enemyMon;
    const maxHp = Math.max(1, mon.maxHp);
    const curHp = Math.max(1, mon.currentHp);
    const catchRate = mon.catchRate || 190;
    const statusBonus = mon.status ? 1.5 : 1.0;

    const a = (((3 * maxHp - 2 * curHp) * catchRate * ballBonus) / (3 * maxHp)) * statusBonus;
    if (a >= 255) {
      return { caught: true, shakes: 3 };
    }

    const clampedA = Math.max(1, a);
    const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / clampedA)));

    let passed = 0;
    for (let i = 0; i < 4; i++) {
      if (Math.floor(Math.random() * 65536) < b) {
        passed += 1;
      } else {
        break;
      }
    }

    if (passed === 4) {
      return { caught: true, shakes: 3 };
    }
    return { caught: false, shakes: Math.min(3, passed) };
  }

  /** Gen 3 EXP yield for defeating the enemy Pokémon. */
  getExpReward() {
    const trainerBonus = this.isTrainer ? 1.5 : 1.0;
    const baseExp = this.enemyMon.baseExp || 62;
    return Math.max(10, Math.floor((trainerBonus * baseExp * this.enemyMon.level) / 7));
  }

  /** Trainer prize money (e.g. Lv 5 Rival = ₽175). */
  getPrizeMoney() {
    if (!this.isTrainer) return 0;
    return this.enemyMon.level * 35;
  }
}
