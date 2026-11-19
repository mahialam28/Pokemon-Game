/**
 * Per-map wild Pokémon encounter tables and encounter rate config.
 * Adding new routes or caves in future phases is just adding an entry to ENCOUNTERS.
 */

export const ENCOUNTERS = {
  route1: {
    chance: 0.1, // 1-in-10 chance per step in tall grass
    table: [
      { speciesId: 16, minLv: 2, maxLv: 5, weight: 35 }, // Pidgey (35%)
      { speciesId: 19, minLv: 2, maxLv: 4, weight: 35 }, // Rattata (35%)
      { speciesId: 10, minLv: 3, maxLv: 4, weight: 10 }, // Caterpie (10%)
      { speciesId: 13, minLv: 3, maxLv: 4, weight: 10 }, // Weedle (10%)
      { speciesId: 25, minLv: 3, maxLv: 5, weight: 5 },  // Pikachu (5% rare!)
      { speciesId: 29, minLv: 3, maxLv: 4, weight: 2.5 }, // Nidoran♀ (2.5%)
      { speciesId: 32, minLv: 3, maxLv: 4, weight: 2.5 }, // Nidoran♂ (2.5%)
    ],
  },
};

/**
 * Roll a wild encounter for `mapId`.
 * Returns { speciesId, level } or null if no encounter triggers.
 */
export function rollWildEncounter(mapId) {
  const cfg = ENCOUNTERS[mapId];
  if (!cfg || !cfg.table || cfg.table.length === 0) return null;
  if (Math.random() >= cfg.chance) return null;

  const totalWeight = cfg.table.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * totalWeight;
  let picked = cfg.table[0];
  for (const entry of cfg.table) {
    r -= entry.weight;
    if (r <= 0) {
      picked = entry;
      break;
    }
  }

  const level =
    picked.minLv + Math.floor(Math.random() * (picked.maxLv - picked.minLv + 1));
  return { speciesId: picked.speciesId, level };
}
