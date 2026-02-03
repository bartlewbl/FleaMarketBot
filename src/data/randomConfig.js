// Centralized knobs for tuning all random chances in the game.
// Adjust numbers here to rebalance encounter pacing, drop frequency,
// battle mechanics, and progression without digging through the rest
// of the codebase.

export const RANDOM_CONFIG = {

  // ---- LOCATION EXPLORATION ----
  // encounterRate: chance (0-1) of a battle each exploration step
  // lootRate:      chance (0-1) of finding an item when no battle occurs
  // goldFindChance: chance (0-1) of finding gold when no item is found
  locationActions: {
    defaults: {
      encounterRate: 0.55,
      lootRate: 0.3,
      goldFindChance: 0.3,
    },
    overrides: {
      'neon-mile':          { encounterRate: 0.50, lootRate: 0.22, goldFindChance: 0.35 },
      'shadow-alley':       { encounterRate: 0.55, lootRate: 0.24, goldFindChance: 0.32 },
      'fungal-drain':       { encounterRate: 0.52, lootRate: 0.28, goldFindChance: 0.30 },
      'metro-underpass':    { encounterRate: 0.60, lootRate: 0.27, goldFindChance: 0.30 },
      'wolf-district':      { encounterRate: 0.62, lootRate: 0.26, goldFindChance: 0.28 },
      'skyline-rooftops':   { encounterRate: 0.65, lootRate: 0.30, goldFindChance: 0.28 },
      'bone-crypt':         { encounterRate: 0.68, lootRate: 0.32, goldFindChance: 0.25 },
      'ironworks-yard':     { encounterRate: 0.70, lootRate: 0.33, goldFindChance: 0.24 },
      'midnight-terminal':  { encounterRate: 0.72, lootRate: 0.38, goldFindChance: 0.22 },
      'holo-bazaar':        { encounterRate: 0.74, lootRate: 0.42, goldFindChance: 0.20 },
      'reactor-spire':      { encounterRate: 0.78, lootRate: 0.45, goldFindChance: 0.18 },
    },
  },

  // ---- GOLD DISCOVERY ----
  // When the gold-find roll succeeds, how much gold is found.
  // formula: floor(baseGoldFind + random() * max(minGoldVariance, playerLevel * goldPerLevel))
  goldFind: {
    baseGoldFind: 3,
    minGoldVariance: 2,
    goldPerLevel: 2,
  },

  // ---- LOOT DROPS ----
  loot: {
    // Chance (0-1) that a defeated monster drops an item at all.
    monsterDropChance: 0.9,

    // Rarity weights — higher weight = more common.
    // Adjust these to shift the overall rarity curve for ALL drops.
    rarityWeights: {
      Common: 60,
      Uncommon: 25,
      Rare: 10,
      Epic: 4,
      Legendary: 1,
    },
  },

  // ---- BATTLE ----
  battle: {
    // Chance (0-1) a monster uses a skill instead of a basic attack.
    monsterSkillChance: 0.3,

    // Damage variance range: final damage = base * (damageVarianceLow + random() * damageVarianceRange)
    damageVarianceLow: 0.85,
    damageVarianceRange: 0.3,

    // Defense multiplier when player defends.
    defendMultiplier: 0.5,

    // Player power-strike multiplier.
    playerSkillMultiplier: 1.5,

    // Chance (0-1) to escape a battle.
    runChance: 0.5,
  },

  // ---- SKILL EFFECTS ----
  skillEffects: {
    // Poison: how many turns, and % of max HP per tick.
    poisonTurns: 3,
    poisonDamagePercent: 0.05,

    // Stat debuff amount applied per skill hit.
    defDebuffAmount: 2,
    atkDebuffAmount: 2,

    // Gold steal range: floor(random() * stealGoldMax + stealGoldMin)
    stealGoldMin: 1,
    stealGoldMax: 10,
  },

  // ---- DEFEAT PENALTIES ----
  defeat: {
    goldLostPercent: 0.20,     // fraction of gold lost on death
    hpRecoveryPercent: 0.30,   // fraction of maxHp you revive with
    manaRecoveryPercent: 0.50, // fraction of maxMana you revive with
  },

  // ---- LEVEL-UP GAINS ----
  // Each stat gain = base + floor(random() * variance)
  levelUp: {
    hpGainBase: 8,
    hpGainVariance: 5,
    atkGainBase: 1,
    atkGainVariance: 2,
    defGainBase: 1,
    defGainVariance: 2,
    manaGainBase: 4,
    manaGainVariance: 3,
  },

  // ---- MONSTER SCALING ----
  // scale = 1 + (areaLevel - 1) * scaleFactor
  // gold variance on spawn: floor(random() * goldSpawnVariance)
  monsterScaling: {
    scaleFactor: 0.2,
    goldSpawnVariance: 5,
  },
};
