// Centralized knobs for tuning location exploration flow and loot behavior.
// Adjust numbers here to rebalance encounter pacing or drop frequency without
// digging through the rest of the codebase.

export const RANDOM_CONFIG = {
  locationActions: {
    defaults: {
      encounterRate: 0.55,
      lootRate: 0.3,
      goldFindChance: 0.3,
    },
    overrides: {
      'neon-mile': { encounterRate: 0.5, lootRate: 0.22, goldFindChance: 0.35 },
      'shadow-alley': { encounterRate: 0.55, lootRate: 0.24, goldFindChance: 0.32 },
      'metro-underpass': { encounterRate: 0.6, lootRate: 0.27, goldFindChance: 0.3 },
      'skyline-rooftops': { encounterRate: 0.65, lootRate: 0.3, goldFindChance: 0.28 },
      'ironworks-yard': { encounterRate: 0.7, lootRate: 0.33, goldFindChance: 0.24 },
      'midnight-terminal': { encounterRate: 0.72, lootRate: 0.4, goldFindChance: 0.22 },
      'holo-bazaar': { encounterRate: 0.74, lootRate: 0.42, goldFindChance: 0.2 },
      'reactor-spire': { encounterRate: 0.78, lootRate: 0.45, goldFindChance: 0.18 },
    },
  },
  loot: {
    monsterDropChance: 0.9,
  },
};
