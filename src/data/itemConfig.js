// ============================================================================
// ITEM CONFIG — every equippable item lives here. Edit, add, or remove items
// by changing these arrays. Each entry needs:
//   name    — display name
//   rarity  — Common | Uncommon | Rare | Epic | Legendary
//   level   — minimum level the item is meant for (1-30)
//   baseAtk — attack value (0 if purely defensive)
//   baseDef — defense value (0 if purely offensive)
//
// The game picks items that are close to the monster/player level, so spread
// items across levels for smooth progression. Rarity affects the stat
// multiplier applied on top of the base values.
// ============================================================================

// ---- SWORDS / WEAPONS ----
export const SWORDS = [
  // --- Tier 1: Levels 1-5 (street scraps) ---
  { name: 'Rusty Shiv',            rarity: 'Common',    level: 1,  baseAtk: 3,  baseDef: 0 },
  { name: 'Copper Dagger',         rarity: 'Common',    level: 2,  baseAtk: 4,  baseDef: 0 },
  { name: 'Scrap Axe',             rarity: 'Common',    level: 3,  baseAtk: 5,  baseDef: 0 },
  { name: 'Rebar Club',            rarity: 'Common',    level: 4,  baseAtk: 6,  baseDef: 1 },
  { name: 'Iron Shortsword',       rarity: 'Common',    level: 5,  baseAtk: 7,  baseDef: 0 },
  // --- Tier 2: Levels 6-10 (mid-city) ---
  { name: 'Tempered Rod',          rarity: 'Uncommon',  level: 6,  baseAtk: 8,  baseDef: 0 },
  { name: 'Serrated Baton',        rarity: 'Uncommon',  level: 7,  baseAtk: 9,  baseDef: 0 },
  { name: 'Carbon Spear',          rarity: 'Uncommon',  level: 8,  baseAtk: 10, baseDef: 1 },
  { name: 'Twin Cleavers',         rarity: 'Rare',      level: 9,  baseAtk: 11, baseDef: 0 },
  { name: 'Storm Falchion',        rarity: 'Rare',      level: 10, baseAtk: 12, baseDef: 0 },
  // --- Tier 3: Levels 11-15 (upper districts) ---
  { name: 'Chainbreaker Axe',      rarity: 'Rare',      level: 11, baseAtk: 13, baseDef: 1 },
  { name: 'Volt Edge',             rarity: 'Rare',      level: 12, baseAtk: 14, baseDef: 0 },
  { name: 'Neon Katana',           rarity: 'Epic',      level: 13, baseAtk: 15, baseDef: 0 },
  { name: 'Solar Halberd',         rarity: 'Epic',      level: 14, baseAtk: 16, baseDef: 1 },
  { name: 'Tempest Claymore',      rarity: 'Epic',      level: 15, baseAtk: 17, baseDef: 0 },
  // --- Tier 4: Levels 16-20 (end-game) ---
  { name: 'Graviton Pike',         rarity: 'Legendary', level: 16, baseAtk: 19, baseDef: 1 },
  { name: 'Phantom Rapier',        rarity: 'Legendary', level: 17, baseAtk: 20, baseDef: 0 },
  { name: 'Apex Warstaff',         rarity: 'Legendary', level: 18, baseAtk: 21, baseDef: 0 },
  { name: 'Singularity Edge',      rarity: 'Legendary', level: 19, baseAtk: 23, baseDef: 0 },
  { name: 'Cosmic Guillotine',     rarity: 'Legendary', level: 20, baseAtk: 25, baseDef: 2 },
  // --- Tier 5: Levels 21-25 (post-game) ---
  { name: 'Plasma Cleaver',        rarity: 'Epic',      level: 21, baseAtk: 24, baseDef: 1 },
  { name: 'Rift Saber',            rarity: 'Epic',      level: 22, baseAtk: 26, baseDef: 0 },
  { name: 'Antimatter Blade',      rarity: 'Legendary', level: 23, baseAtk: 28, baseDef: 1 },
  { name: 'Entropy Scythe',        rarity: 'Legendary', level: 24, baseAtk: 30, baseDef: 0 },
  { name: 'Quasar Lance',          rarity: 'Legendary', level: 25, baseAtk: 32, baseDef: 2 },
  // --- Tier 6: Levels 26-30 (ascension) ---
  { name: 'Stellar Flamberge',     rarity: 'Legendary', level: 26, baseAtk: 34, baseDef: 1 },
  { name: 'Null Reaver',           rarity: 'Legendary', level: 27, baseAtk: 36, baseDef: 2 },
  { name: 'Omega Glaive',          rarity: 'Legendary', level: 28, baseAtk: 38, baseDef: 1 },
  { name: 'Dimension Render',      rarity: 'Legendary', level: 29, baseAtk: 40, baseDef: 2 },
  { name: 'Oblivion\'s Edge',      rarity: 'Legendary', level: 30, baseAtk: 44, baseDef: 3 },
];

// ---- SHIELDS ----
export const SHIELDS = [
  { name: 'Splintered Plank',      rarity: 'Common',    level: 1,  baseAtk: 0,  baseDef: 3 },
  { name: 'Tin Buckler',           rarity: 'Common',    level: 2,  baseAtk: 0,  baseDef: 4 },
  { name: 'Patchwork Guard',       rarity: 'Common',    level: 3,  baseAtk: 0,  baseDef: 5 },
  { name: 'Riveted Disc',          rarity: 'Common',    level: 4,  baseAtk: 0,  baseDef: 6 },
  { name: 'Bronze Kite Shield',    rarity: 'Uncommon',  level: 5,  baseAtk: 0,  baseDef: 7 },
  { name: 'Chainmail Barrier',     rarity: 'Uncommon',  level: 6,  baseAtk: 0,  baseDef: 8 },
  { name: 'Iron Tower Shield',     rarity: 'Uncommon',  level: 7,  baseAtk: 0,  baseDef: 9 },
  { name: 'Reinforced Pavise',     rarity: 'Rare',      level: 8,  baseAtk: 0,  baseDef: 10 },
  { name: 'Shock Bumper',          rarity: 'Rare',      level: 9,  baseAtk: 1,  baseDef: 11 },
  { name: 'Mirror Aegis',          rarity: 'Rare',      level: 10, baseAtk: 0,  baseDef: 12 },
  { name: 'Bulwark of Cogs',       rarity: 'Rare',      level: 11, baseAtk: 0,  baseDef: 13 },
  { name: 'Helios Ward',           rarity: 'Epic',      level: 12, baseAtk: 0,  baseDef: 14 },
  { name: 'Stormbreaker Rampart',  rarity: 'Epic',      level: 13, baseAtk: 0,  baseDef: 15 },
  { name: 'Dragon Spine Shield',   rarity: 'Epic',      level: 14, baseAtk: 0,  baseDef: 16 },
  { name: 'Obsidian Bulwark',      rarity: 'Legendary', level: 15, baseAtk: 0,  baseDef: 17 },
  { name: 'Nova Barrier',          rarity: 'Legendary', level: 16, baseAtk: 0,  baseDef: 18 },
  { name: 'Eternity Wall',         rarity: 'Legendary', level: 17, baseAtk: 0,  baseDef: 19 },
  { name: 'Voidcarapace',          rarity: 'Legendary', level: 18, baseAtk: 0,  baseDef: 20 },
  { name: 'Celestial Rampart',     rarity: 'Legendary', level: 19, baseAtk: 0,  baseDef: 21 },
  { name: 'Infinity Guard',        rarity: 'Legendary', level: 20, baseAtk: 0,  baseDef: 23 },
  { name: 'Particle Deflector',    rarity: 'Epic',      level: 21, baseAtk: 1,  baseDef: 22 },
  { name: 'Flux Barricade',        rarity: 'Epic',      level: 22, baseAtk: 0,  baseDef: 24 },
  { name: 'Antimatter Shell',      rarity: 'Legendary', level: 23, baseAtk: 0,  baseDef: 26 },
  { name: 'Neutron Curtain',       rarity: 'Legendary', level: 24, baseAtk: 1,  baseDef: 28 },
  { name: 'Quantum Aegis',         rarity: 'Legendary', level: 25, baseAtk: 0,  baseDef: 30 },
  { name: 'Stellar Fortress',      rarity: 'Legendary', level: 26, baseAtk: 1,  baseDef: 31 },
  { name: 'Null Bulwark',          rarity: 'Legendary', level: 27, baseAtk: 0,  baseDef: 33 },
  { name: 'Omega Shield',          rarity: 'Legendary', level: 28, baseAtk: 1,  baseDef: 35 },
  { name: 'Dimension Wall',        rarity: 'Legendary', level: 29, baseAtk: 0,  baseDef: 37 },
  { name: 'Oblivion Bastion',      rarity: 'Legendary', level: 30, baseAtk: 2,  baseDef: 40 },
];

// ---- HELMETS ----
export const HELMETS = [
  { name: 'Frayed Bandana',        rarity: 'Common',    level: 1,  baseAtk: 0,  baseDef: 2 },
  { name: 'Cloth Cap',             rarity: 'Common',    level: 2,  baseAtk: 0,  baseDef: 2 },
  { name: 'Leather Hood',          rarity: 'Common',    level: 3,  baseAtk: 0,  baseDef: 3 },
  { name: 'Welded Visor',          rarity: 'Common',    level: 4,  baseAtk: 0,  baseDef: 4 },
  { name: 'Scrap Helm',            rarity: 'Common',    level: 5,  baseAtk: 1,  baseDef: 4 },
  { name: 'Chainmail Cowl',        rarity: 'Uncommon',  level: 6,  baseAtk: 0,  baseDef: 5 },
  { name: 'Iron Dome',             rarity: 'Uncommon',  level: 7,  baseAtk: 0,  baseDef: 6 },
  { name: 'Carbon Mask',           rarity: 'Uncommon',  level: 8,  baseAtk: 1,  baseDef: 6 },
  { name: 'Tactical Goggles',      rarity: 'Rare',      level: 9,  baseAtk: 0,  baseDef: 7 },
  { name: 'Hazard Rebreather',     rarity: 'Rare',      level: 10, baseAtk: 0,  baseDef: 8 },
  { name: 'Sentinel Helm',         rarity: 'Rare',      level: 11, baseAtk: 0,  baseDef: 9 },
  { name: 'Aurora Crown',          rarity: 'Rare',      level: 12, baseAtk: 1,  baseDef: 9 },
  { name: 'Stormcall Circlet',     rarity: 'Epic',      level: 13, baseAtk: 0,  baseDef: 10 },
  { name: 'Dragon Crest Helm',     rarity: 'Epic',      level: 14, baseAtk: 0,  baseDef: 11 },
  { name: 'Vanguard Visage',       rarity: 'Epic',      level: 15, baseAtk: 0,  baseDef: 12 },
  { name: 'Celestial Veil',        rarity: 'Legendary', level: 16, baseAtk: 0,  baseDef: 13 },
  { name: 'Phoenix Halo',          rarity: 'Legendary', level: 17, baseAtk: 0,  baseDef: 14 },
  { name: 'Void Prophet Hood',     rarity: 'Legendary', level: 18, baseAtk: 0,  baseDef: 15 },
  { name: 'Astral Mindguard',      rarity: 'Legendary', level: 19, baseAtk: 0,  baseDef: 16 },
  { name: 'Infinity Circlet',      rarity: 'Legendary', level: 20, baseAtk: 2,  baseDef: 17 },
  { name: 'Plasma Visor',          rarity: 'Epic',      level: 21, baseAtk: 1,  baseDef: 17 },
  { name: 'Rift Cowl',             rarity: 'Epic',      level: 22, baseAtk: 0,  baseDef: 19 },
  { name: 'Antimatter Crest',      rarity: 'Legendary', level: 23, baseAtk: 1,  baseDef: 20 },
  { name: 'Entropy Mask',          rarity: 'Legendary', level: 24, baseAtk: 2,  baseDef: 21 },
  { name: 'Quasar Crown',          rarity: 'Legendary', level: 25, baseAtk: 1,  baseDef: 23 },
  { name: 'Stellar Diadem',        rarity: 'Legendary', level: 26, baseAtk: 2,  baseDef: 24 },
  { name: 'Null Helm',             rarity: 'Legendary', level: 27, baseAtk: 1,  baseDef: 26 },
  { name: 'Omega Coronet',         rarity: 'Legendary', level: 28, baseAtk: 2,  baseDef: 27 },
  { name: 'Dimension Veil',        rarity: 'Legendary', level: 29, baseAtk: 2,  baseDef: 29 },
  { name: 'Oblivion Crown',        rarity: 'Legendary', level: 30, baseAtk: 3,  baseDef: 31 },
];

// ---- ARMOR ----
export const ARMORS = [
  { name: 'Tattered Vest',         rarity: 'Common',    level: 1,  baseAtk: 0,  baseDef: 4 },
  { name: 'Scrap Leathers',        rarity: 'Common',    level: 2,  baseAtk: 0,  baseDef: 5 },
  { name: 'Patchwork Coat',        rarity: 'Common',    level: 3,  baseAtk: 0,  baseDef: 6 },
  { name: 'Street Brigandine',     rarity: 'Common',    level: 4,  baseAtk: 0,  baseDef: 7 },
  { name: 'Chainmail Vest',        rarity: 'Common',    level: 5,  baseAtk: 0,  baseDef: 8 },
  { name: 'Iron Carapace',         rarity: 'Uncommon',  level: 6,  baseAtk: 0,  baseDef: 9 },
  { name: 'Reinforced Jacket',     rarity: 'Uncommon',  level: 7,  baseAtk: 1,  baseDef: 9 },
  { name: 'Alloy Breastplate',     rarity: 'Uncommon',  level: 8,  baseAtk: 0,  baseDef: 10 },
  { name: 'Composite Harness',     rarity: 'Rare',      level: 9,  baseAtk: 0,  baseDef: 11 },
  { name: 'Dynamo Mail',           rarity: 'Rare',      level: 10, baseAtk: 0,  baseDef: 12 },
  { name: 'Riot Gear Hauberk',     rarity: 'Rare',      level: 11, baseAtk: 0,  baseDef: 13 },
  { name: 'Arctic Exo-Shell',      rarity: 'Rare',      level: 12, baseAtk: 0,  baseDef: 14 },
  { name: 'Solar Scale Armor',     rarity: 'Epic',      level: 13, baseAtk: 0,  baseDef: 15 },
  { name: 'Thunderborn Plate',     rarity: 'Epic',      level: 14, baseAtk: 0,  baseDef: 16 },
  { name: 'Obsidian Warplate',     rarity: 'Epic',      level: 15, baseAtk: 0,  baseDef: 17 },
  { name: 'Voidwoven Raiment',     rarity: 'Legendary', level: 16, baseAtk: 0,  baseDef: 18 },
  { name: 'Phoenix Bodyguard',     rarity: 'Legendary', level: 17, baseAtk: 0,  baseDef: 19 },
  { name: 'Celestial Bulwark Suit', rarity: 'Legendary', level: 18, baseAtk: 0,  baseDef: 20 },
  { name: 'Eternium Aegis Frame',  rarity: 'Legendary', level: 19, baseAtk: 0,  baseDef: 21 },
  { name: 'Singularity Battlesuit', rarity: 'Legendary', level: 20, baseAtk: 1,  baseDef: 23 },
  { name: 'Plasma Cuirass',        rarity: 'Epic',      level: 21, baseAtk: 1,  baseDef: 23 },
  { name: 'Rift Hauberk',          rarity: 'Epic',      level: 22, baseAtk: 0,  baseDef: 25 },
  { name: 'Antimatter Plate',      rarity: 'Legendary', level: 23, baseAtk: 1,  baseDef: 27 },
  { name: 'Entropy Shell',         rarity: 'Legendary', level: 24, baseAtk: 0,  baseDef: 29 },
  { name: 'Quasar Harness',        rarity: 'Legendary', level: 25, baseAtk: 1,  baseDef: 31 },
  { name: 'Stellar Exo-Frame',     rarity: 'Legendary', level: 26, baseAtk: 2,  baseDef: 33 },
  { name: 'Null Carapace',         rarity: 'Legendary', level: 27, baseAtk: 1,  baseDef: 35 },
  { name: 'Omega Plating',         rarity: 'Legendary', level: 28, baseAtk: 2,  baseDef: 37 },
  { name: 'Dimension Mantle',      rarity: 'Legendary', level: 29, baseAtk: 1,  baseDef: 39 },
  { name: 'Oblivion Fortress',     rarity: 'Legendary', level: 30, baseAtk: 3,  baseDef: 42 },
];

// ---- BOOTS ----
export const BOOTS = [
  { name: 'Cracked Sandals',       rarity: 'Common',    level: 1,  baseAtk: 0,  baseDef: 1 },
  { name: 'Street Sneakers',       rarity: 'Common',    level: 2,  baseAtk: 0,  baseDef: 1 },
  { name: 'Reinforced Work Boots', rarity: 'Common',    level: 3,  baseAtk: 0,  baseDef: 2 },
  { name: 'Courier Striders',      rarity: 'Common',    level: 4,  baseAtk: 1,  baseDef: 2 },
  { name: 'Chain-Lashed Greaves',  rarity: 'Common',    level: 5,  baseAtk: 0,  baseDef: 3 },
  { name: 'Iron March Boots',      rarity: 'Uncommon',  level: 6,  baseAtk: 1,  baseDef: 3 },
  { name: 'Shock Dampers',         rarity: 'Uncommon',  level: 7,  baseAtk: 0,  baseDef: 4 },
  { name: 'Carbon Skates',         rarity: 'Uncommon',  level: 8,  baseAtk: 1,  baseDef: 4 },
  { name: 'Scout Talons',          rarity: 'Rare',      level: 9,  baseAtk: 0,  baseDef: 5 },
  { name: 'Dynamo Greaves',        rarity: 'Rare',      level: 10, baseAtk: 1,  baseDef: 5 },
  { name: 'Meteor Treads',         rarity: 'Rare',      level: 11, baseAtk: 0,  baseDef: 6 },
  { name: 'Stormsurge Boots',      rarity: 'Rare',      level: 12, baseAtk: 1,  baseDef: 6 },
  { name: 'Phoenix Spurs',         rarity: 'Epic',      level: 13, baseAtk: 1,  baseDef: 7 },
  { name: 'Grav-null Boots',       rarity: 'Epic',      level: 14, baseAtk: 0,  baseDef: 7 },
  { name: 'Tempest Striders',      rarity: 'Epic',      level: 15, baseAtk: 0,  baseDef: 8 },
  { name: 'Voidstep Boots',        rarity: 'Legendary', level: 16, baseAtk: 2,  baseDef: 8 },
  { name: 'Celestial Walkers',     rarity: 'Legendary', level: 17, baseAtk: 0,  baseDef: 9 },
  { name: 'Chrono Greaves',        rarity: 'Legendary', level: 18, baseAtk: 1,  baseDef: 9 },
  { name: 'Rift Sabatons',         rarity: 'Legendary', level: 19, baseAtk: 0,  baseDef: 10 },
  { name: 'Infinity Marchers',     rarity: 'Legendary', level: 20, baseAtk: 2,  baseDef: 11 },
  { name: 'Plasma Kicks',          rarity: 'Epic',      level: 21, baseAtk: 1,  baseDef: 11 },
  { name: 'Rift Runners',          rarity: 'Epic',      level: 22, baseAtk: 2,  baseDef: 12 },
  { name: 'Antimatter Treads',     rarity: 'Legendary', level: 23, baseAtk: 1,  baseDef: 13 },
  { name: 'Entropy Striders',      rarity: 'Legendary', level: 24, baseAtk: 2,  baseDef: 14 },
  { name: 'Quasar Boots',          rarity: 'Legendary', level: 25, baseAtk: 2,  baseDef: 15 },
  { name: 'Stellar Treads',        rarity: 'Legendary', level: 26, baseAtk: 2,  baseDef: 16 },
  { name: 'Null Walkers',          rarity: 'Legendary', level: 27, baseAtk: 3,  baseDef: 17 },
  { name: 'Omega Boots',           rarity: 'Legendary', level: 28, baseAtk: 2,  baseDef: 18 },
  { name: 'Dimension Striders',    rarity: 'Legendary', level: 29, baseAtk: 3,  baseDef: 19 },
  { name: 'Oblivion Marchers',     rarity: 'Legendary', level: 30, baseAtk: 3,  baseDef: 21 },
];

// ---- RINGS / ACCESSORIES ----
export const RINGS = [
  { name: 'Copper Ring',           rarity: 'Common',    level: 1,  baseAtk: 1,  baseDef: 0 },
  { name: 'Wired Loop',            rarity: 'Common',    level: 2,  baseAtk: 1,  baseDef: 1 },
  { name: 'Scrap Charm',           rarity: 'Common',    level: 3,  baseAtk: 1,  baseDef: 1 },
  { name: 'Fiber Bracelet',        rarity: 'Common',    level: 4,  baseAtk: 2,  baseDef: 1 },
  { name: 'Chainlink Pendant',     rarity: 'Common',    level: 5,  baseAtk: 2,  baseDef: 1 },
  { name: 'Silver Band',           rarity: 'Uncommon',  level: 6,  baseAtk: 2,  baseDef: 2 },
  { name: 'Static Anklet',         rarity: 'Uncommon',  level: 7,  baseAtk: 3,  baseDef: 1 },
  { name: 'Neon Choker',           rarity: 'Uncommon',  level: 8,  baseAtk: 3,  baseDef: 2 },
  { name: 'Dynamo Locket',         rarity: 'Rare',      level: 9,  baseAtk: 4,  baseDef: 2 },
  { name: 'Quartz Signet',         rarity: 'Rare',      level: 10, baseAtk: 4,  baseDef: 3 },
  { name: 'Reactor Torque',        rarity: 'Rare',      level: 11, baseAtk: 5,  baseDef: 2 },
  { name: 'Stormcall Ring',        rarity: 'Rare',      level: 12, baseAtk: 5,  baseDef: 3 },
  { name: 'Phoenix Emblem',        rarity: 'Epic',      level: 13, baseAtk: 6,  baseDef: 3 },
  { name: 'Void Harmonizer',       rarity: 'Epic',      level: 14, baseAtk: 6,  baseDef: 4 },
  { name: 'Celestial Prism',       rarity: 'Epic',      level: 15, baseAtk: 7,  baseDef: 4 },
  { name: 'Chrono Loop',           rarity: 'Legendary', level: 16, baseAtk: 8,  baseDef: 4 },
  { name: 'Nova Signet',           rarity: 'Legendary', level: 17, baseAtk: 8,  baseDef: 5 },
  { name: 'Infinity Anklet',       rarity: 'Legendary', level: 18, baseAtk: 9,  baseDef: 5 },
  { name: 'Singularity Charm',     rarity: 'Legendary', level: 19, baseAtk: 10, baseDef: 5 },
  { name: 'Paradox Halo',          rarity: 'Legendary', level: 20, baseAtk: 11, baseDef: 6 },
  { name: 'Plasma Band',           rarity: 'Epic',      level: 21, baseAtk: 10, baseDef: 6 },
  { name: 'Rift Talisman',         rarity: 'Epic',      level: 22, baseAtk: 11, baseDef: 7 },
  { name: 'Antimatter Ring',       rarity: 'Legendary', level: 23, baseAtk: 12, baseDef: 7 },
  { name: 'Entropy Pendant',       rarity: 'Legendary', level: 24, baseAtk: 13, baseDef: 8 },
  { name: 'Quasar Charm',          rarity: 'Legendary', level: 25, baseAtk: 14, baseDef: 8 },
  { name: 'Stellar Signet',        rarity: 'Legendary', level: 26, baseAtk: 15, baseDef: 9 },
  { name: 'Null Loop',             rarity: 'Legendary', level: 27, baseAtk: 16, baseDef: 9 },
  { name: 'Omega Ring',            rarity: 'Legendary', level: 28, baseAtk: 17, baseDef: 10 },
  { name: 'Dimension Seal',        rarity: 'Legendary', level: 29, baseAtk: 18, baseDef: 10 },
  { name: 'Oblivion Halo',         rarity: 'Legendary', level: 30, baseAtk: 20, baseDef: 12 },
];

// ---- POTIONS ----
// Potion tiers are level-gated (tier index = floor(monsterLevel / 4)).
// healAmount = baseHeal + monsterLevel * 4 * rarityMultiplier
export const POTIONS = [
  { name: 'Small Medkit',     baseHeal: 35 },
  { name: 'Field Syringe',    baseHeal: 55 },
  { name: 'Combat Stims',     baseHeal: 75 },
  { name: 'Mega Infusion',    baseHeal: 100 },
  { name: 'Phoenix Serum',    baseHeal: 130 },
  { name: 'Nova Elixir',      baseHeal: 165 },
  { name: 'Quantum Draught',  baseHeal: 200 },
  { name: 'Oblivion Nectar',  baseHeal: 250 },
];
