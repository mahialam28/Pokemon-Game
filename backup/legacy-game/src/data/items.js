/**
 * Item database & Mart catalog (Phase 3).
 * Categories: 'items' | 'pokeballs'.
 */

export const ITEMS = {
  pokeball: {
    id: 'pokeball',
    name: 'POKé BALL',
    category: 'pokeballs',
    price: 200,
    sellPrice: 100,
    catchBonus: 1.0,
    description: 'A ball thrown to catch a wild POKéMON.',
  },
  potion: {
    id: 'potion',
    name: 'POTION',
    category: 'items',
    price: 300,
    sellPrice: 150,
    healHp: 20,
    description: 'Restores 20 HP to a single POKéMON.',
  },
  antidote: {
    id: 'antidote',
    name: 'ANTIDOTE',
    category: 'items',
    price: 100,
    sellPrice: 50,
    cureStatus: 'PSN',
    description: 'Cures a poisoned POKéMON.',
  },
  superPotion: {
    id: 'superPotion',
    name: 'SUPER POTION',
    category: 'items',
    price: 700,
    sellPrice: 350,
    healHp: 50,
    description: 'Restores 50 HP to a single POKéMON.',
  },
  paralyzeHeal: {
    id: 'paralyzeHeal',
    name: 'PARALYZE HEAL',
    category: 'items',
    price: 200,
    sellPrice: 100,
    cureStatus: 'PAR',
    description: 'Heals a paralyzed POKéMON.',
  },
  revive: {
    id: 'revive',
    name: 'REVIVE',
    category: 'items',
    price: 1500,
    sellPrice: 750,
    reviveHpPercent: 0.5,
    description: 'Revives a fainted POKéMON with half HP.',
  },
};

export const MART_STOCK = ['pokeball', 'potion', 'superPotion', 'antidote', 'paralyzeHeal', 'revive'];

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
