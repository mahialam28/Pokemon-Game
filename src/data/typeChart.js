/**
 * Complete 18-type effectiveness chart & type badge color palette.
 * Reusable across all Phase 2+ trainer and wild battles.
 */

export const TYPE_COLORS = {
  NORMAL:   { bg: '#909488', light: '#C0C4B8', dark: '#5C6056' },
  FIRE:     { bg: '#E85D32', light: '#FFA068', dark: '#8F2D14' },
  WATER:    { bg: '#3D88DC', light: '#82C4FF', dark: '#1E4C8C' },
  GRASS:    { bg: '#4BA64A', light: '#82D478', dark: '#265E2B' },
  ELECTRIC: { bg: '#E8B828', light: '#FFE478', dark: '#8E6C10' },
  ICE:      { bg: '#58C4D4', light: '#A8EEFA', dark: '#2C7280' },
  FIGHTING: { bg: '#C03C34', light: '#EE7C72', dark: '#721E1A' },
  POISON:   { bg: '#984EA8', light: '#CE8CE0', dark: '#562664' },
  GROUND:   { bg: '#C8A04C', light: '#ECCE86', dark: '#7A5C22' },
  FLYING:   { bg: '#7E90E0', light: '#B8C4FA', dark: '#465496' },
  PSYCHIC:  { bg: '#E65884', light: '#FF98B8', dark: '#8C284C' },
  BUG:      { bg: '#8EA82C', light: '#C4DC68', dark: '#506414' },
  ROCK:     { bg: '#AC9648', light: '#D8C884', dark: '#685822' },
  GHOST:    { bg: '#685496', light: '#A490CC', dark: '#3A2C5C' },
  DRAGON:   { bg: '#6454E0', light: '#A498FF', dark: '#34288C' },
  DARK:     { bg: '#5C4A40', light: '#968276', dark: '#322620' },
  STEEL:    { bg: '#8C98A8', light: '#C4D0DE', dark: '#525C68' },
  FAIRY:    { bg: '#E084B0', light: '#FFB8D8', dark: '#8C4468' },
};

/**
 * Sparse multiplier matrix: attackerType -> { defenderType: multiplier }.
 * Unlisted matchups default to 1.0 (neutral).
 */
export const TYPE_CHART = {
  NORMAL:   { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:     { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:    { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  GRASS:    { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ELECTRIC: { WATER: 2, GRASS: 0.5, ELECTRIC: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  ICE:      { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON:   { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND:   { FIRE: 2, GRASS: 0.5, ELECTRIC: 2, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:   { GRASS: 2, ELECTRIC: 0.5, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:  { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:      { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK:     { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:    { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:   { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK:     { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL:    { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2 },
  FAIRY:    { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 },
};

/**
 * Compute combined type effectiveness multiplier against a 1- or 2-type defender.
 */
export function getTypeEffectiveness(moveType, defenderTypes = []) {
  const row = TYPE_CHART[String(moveType).toUpperCase()];
  if (!row) return 1;

  let mult = 1;
  for (const dt of defenderTypes) {
    const m = row[String(dt).toUpperCase()];
    if (m !== undefined) {
      mult *= m;
    }
  }
  return mult;
}

export function getTypeColor(type) {
  return TYPE_COLORS[String(type).toUpperCase()] || TYPE_COLORS.NORMAL;
}
