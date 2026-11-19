/**
 * Pure Gen 3 Battle Engine (ZERO rendering or DOM dependencies).
 * Reusable for Rival battles, future wild encounters, and Gym/route trainers.
 *
 * Implements:
 * - Stat stages (-6..+6)
 * - Turn order by effective Speed (random tie-breaker)
 * - Accuracy checks
 * - Gen 3 damage formula (STAB 1.5x, 18-type effectiveness, 0.85-1.0 random, 1/16 crit 2x)
 * - Rival AI (~30% stat-lowering move in turns 1-2, primarily attacks)
 * - EXP & prize money calculation
 */

import { getMove } from '../data/moves.js';
import { getTypeEffectiveness } from '../data/typeChart.js';

const STAT_LABELS = {
  atk: 'ATTACK',
  def: 'DEFENSE',
  spa: 'SP. ATK',
  spd: 'SP. DEF',
  spe: 'SPEED',
};

/** Gen 3 stat stage multiplier (-6 to +6). */
export function stageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage));
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}

export function createStages() {
  return { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

export class BattleEngine {
  /**
   * @param {object} config
   * @param {object} config.playerMon  Full Pokémon object from gameState.party[0]
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

  getEffectiveStat(mon, stages, stat, { ignoreNeg = false, ignorePos = false } = {}) {
    let stage = stages[stat] || 0;
    if (ignoreNeg && stage < 0) stage = 0;
    if (ignorePos && stage > 0) stage = 0;
    return Math.max(1, Math.floor(mon.stats[stat] * stageMultiplier(stage)));
  }

  /**
   * Rival / Trainer AI move picker:
   * Primarily attacks; ~30% chance to use its stat-lowering move in turns 1-2
   * if the player's target stat isn't already lowered to -6.
   */
  chooseEnemyMove() {
    const moves = this.enemyMon.moves || [];
    const usable = moves.filter((m) => m.pp > 0);
    if (usable.length === 0) {
      return { id: 'tackle', pp: 1, maxPp: 35 };
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
   * Returns ['player', 'enemy'] or ['enemy', 'player'].
   */
  determineTurnOrder() {
    const pSpe = this.getEffectiveStat(this.playerMon, this.playerStages, 'spe');
    const eSpe = this.getEffectiveStat(this.enemyMon, this.enemyStages, 'spe');
    if (pSpe > eSpe) return ['player', 'enemy'];
    if (eSpe > pSpe) return ['enemy', 'player'];
    return Math.random() < 0.5 ? ['player', 'enemy'] : ['enemy', 'player'];
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
    const targetSide = isPlayer ? 'enemy' : 'player';

    const move = getMove(moveSlot.id);
    if (moveSlot.pp > 0) {
      moveSlot.pp -= 1;
    }

    const events = [
      {
        type: 'useMove',
        actorSide,
        targetSide,
        attackerName: attacker.name,
        move,
      },
    ];

    // Accuracy check
    if (move.accuracy < 100 && Math.random() * 100 >= move.accuracy) {
      events.push({
        type: 'miss',
        actorSide,
        attackerName: attacker.name,
      });
      return events;
    }

    // Status / stat-lowering move (Growl, Tail Whip, etc.)
    if (move.category === 'status' && move.statChange) {
      const { stat, stages } = move.statChange;
      const prev = defStages[stat];
      const next = Math.max(-6, Math.min(6, prev + stages));
      defStages[stat] = next;

      events.push({
        type: 'anim',
        anim: move.anim,
        moveType: move.type,
        statDirection: stages > 0 ? 'up' : 'down',
        actorSide,
        targetSide,
      });

      const statLabel = STAT_LABELS[stat] || stat.toUpperCase();
      if (next === prev) {
        events.push({
          type: 'statLimit',
          targetSide,
          text: `${defender.name}'s ${statLabel} won't go any lower!`,
        });
      } else {
        events.push({
          type: 'statChange',
          targetSide,
          stat,
          delta: next - prev,
          text: `${defender.name}'s ${statLabel} fell!`,
        });
      }
      return events;
    }

    // Damaging move — Gen 3 formula
    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    if (effectiveness === 0) {
      events.push({
        type: 'effectiveness',
        multiplier: 0,
        text: `It doesn't affect ${defender.name}...`,
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

    // Random factor 0.85..1.00
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
      targetSide,
      isCrit,
      effectiveness,
    });

    events.push({
      type: 'damage',
      targetSide,
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
        targetSide,
        pokemon: defender,
        text:
          targetSide === 'enemy'
            ? `Foe ${defender.name} fainted!`
            : `${defender.name} fainted!`,
      });
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
    const order = this.determineTurnOrder();
    const allEvents = [];

    for (const side of order) {
      if (this.playerMon.currentHp <= 0 || this.enemyMon.currentHp <= 0) break;
      const slot = side === 'player' ? playerMoveSlot : enemyMoveSlot;
      const stepEvents = this.executeMove(side, slot);
      allEvents.push(...stepEvents);
    }

    return allEvents;
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
