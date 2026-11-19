/**
 * Move definitions for the Gen 3 battle system.
 * Structured so future level-up moves, TMs, and status moves drop right in.
 */

export const MOVES = {
  tackle: {
    id: 'tackle',
    name: 'TACKLE',
    type: 'NORMAL',
    category: 'physical',
    power: 40,
    accuracy: 100,
    maxPp: 35,
    anim: 'tackle',
    description: 'A full-body charge attack.',
  },
  scratch: {
    id: 'scratch',
    name: 'SCRATCH',
    type: 'NORMAL',
    category: 'physical',
    power: 40,
    accuracy: 100,
    maxPp: 35,
    anim: 'scratch',
    description: 'Scratches the foe with sharp claws.',
  },
  growl: {
    id: 'growl',
    name: 'GROWL',
    type: 'NORMAL',
    category: 'status',
    power: 0,
    accuracy: 100,
    maxPp: 40,
    anim: 'growl',
    statChange: { target: 'foe', stat: 'atk', stages: -1 },
    description: "Lowers the foe's ATTACK.",
  },
  tailWhip: {
    id: 'tailWhip',
    name: 'TAIL WHIP',
    type: 'NORMAL',
    category: 'status',
    power: 0,
    accuracy: 100,
    maxPp: 30,
    anim: 'tailWhip',
    statChange: { target: 'foe', stat: 'def', stages: -1 },
    description: "Lowers the foe's DEFENSE.",
  },

  // Ready for future level-ups / Phase 3+
  vineWhip: {
    id: 'vineWhip',
    name: 'VINE WHIP',
    type: 'GRASS',
    category: 'physical',
    power: 45,
    accuracy: 100,
    maxPp: 25,
    anim: 'tackle',
    description: 'Strikes the foe with slender vines.',
  },
  ember: {
    id: 'ember',
    name: 'EMBER',
    type: 'FIRE',
    category: 'special',
    power: 40,
    accuracy: 100,
    maxPp: 25,
    anim: 'tackle',
    description: 'A weak fire attack that may burn.',
  },
  waterGun: {
    id: 'waterGun',
    name: 'WATER GUN',
    type: 'WATER',
    category: 'special',
    power: 40,
    accuracy: 100,
    maxPp: 25,
    anim: 'tackle',
    description: 'Squirts water to attack the foe.',
  },
};

export function getMove(moveId) {
  return MOVES[moveId] || MOVES.tackle;
}
