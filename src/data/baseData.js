// ============================================================
// BASE BUILDING SYSTEM - Data definitions for player bases
// ============================================================

import { uid } from '../engine/utils';

// ---- FUEL ITEMS ----
// Items that can be burned to power buildings
export const FUEL_ITEMS = {
  'scrap-wood': { name: 'Scrap Wood', fuelValue: 5, burnTime: 30 },       // 30 min
  'charcoal': { name: 'Charcoal', fuelValue: 15, burnTime: 90 },          // 90 min
  'coal-chunk': { name: 'Coal Chunk', fuelValue: 25, burnTime: 150 },     // 150 min
  'oil-canister': { name: 'Oil Canister', fuelValue: 40, burnTime: 240 }, // 240 min
  'plasma-core': { name: 'Plasma Core', fuelValue: 80, burnTime: 480 },   // 480 min
};

// ---- BUILDING MATERIALS ----
// These drop from monsters in different regions with low drop rates
export const BUILDING_MATERIALS = {
  'scrap-wood': {
    id: 'scrap-wood', name: 'Scrap Wood', type: 'material',
    icon: 'material', description: 'Salvaged wooden planks. Burns well or used for construction.',
    rarity: 'Common', sellPrice: 3, isFuel: true,
    regions: ['neon-district', 'frozen-wastes'],
  },
  'iron-ore': {
    id: 'iron-ore', name: 'Iron Ore', type: 'material',
    icon: 'material', description: 'Raw iron chunks dug from rubble.',
    rarity: 'Common', sellPrice: 5,
    regions: ['neon-district', 'scorched-badlands'],
  },
  'charcoal': {
    id: 'charcoal', name: 'Charcoal', type: 'material',
    icon: 'material', description: 'Compressed burnt wood. Great fuel source.',
    rarity: 'Uncommon', sellPrice: 8, isFuel: true,
    regions: ['scorched-badlands', 'toxic-marshlands'],
  },
  'stone-block': {
    id: 'stone-block', name: 'Stone Block', type: 'material',
    icon: 'material', description: 'Heavy cut stone for sturdy construction.',
    rarity: 'Common', sellPrice: 4,
    regions: ['frozen-wastes', 'scorched-badlands'],
  },
  'copper-wire': {
    id: 'copper-wire', name: 'Copper Wire', type: 'material',
    icon: 'material', description: 'Salvaged copper wiring for mechanisms.',
    rarity: 'Uncommon', sellPrice: 10,
    regions: ['neon-district', 'abyssal-depths'],
  },
  'crystal-shard': {
    id: 'crystal-shard', name: 'Crystal Shard', type: 'material',
    icon: 'material', description: 'A glowing shard of raw crystal. Used in advanced crafting.',
    rarity: 'Rare', sellPrice: 25,
    regions: ['frozen-wastes', 'celestial-highlands'],
  },
  'toxic-resin': {
    id: 'toxic-resin', name: 'Toxic Resin', type: 'material',
    icon: 'material', description: 'Thick resin harvested from marsh plants. Used in potions.',
    rarity: 'Uncommon', sellPrice: 12,
    regions: ['toxic-marshlands'],
  },
  'deep-coral': {
    id: 'deep-coral', name: 'Deep Coral', type: 'material',
    icon: 'material', description: 'Rare coral from the ocean depths.',
    rarity: 'Rare', sellPrice: 20,
    regions: ['abyssal-depths'],
  },
  'coal-chunk': {
    id: 'coal-chunk', name: 'Coal Chunk', type: 'material',
    icon: 'material', description: 'Dense coal. Excellent fuel with long burn time.',
    rarity: 'Uncommon', sellPrice: 15, isFuel: true,
    regions: ['scorched-badlands', 'abyssal-depths'],
  },
  'starlight-dust': {
    id: 'starlight-dust', name: 'Starlight Dust', type: 'material',
    icon: 'material', description: 'Shimmering dust from the celestial realm.',
    rarity: 'Epic', sellPrice: 50,
    regions: ['celestial-highlands'],
  },
  'void-essence': {
    id: 'void-essence', name: 'Void Essence', type: 'material',
    icon: 'material', description: 'Distilled essence from the void between worlds.',
    rarity: 'Legendary', sellPrice: 100,
    regions: ['void-nexus'],
  },
  'oil-canister': {
    id: 'oil-canister', name: 'Oil Canister', type: 'material',
    icon: 'material', description: 'Salvaged petroleum. Burns very hot and long.',
    rarity: 'Rare', sellPrice: 30, isFuel: true,
    regions: ['neon-district', 'scorched-badlands'],
  },
  'plasma-core': {
    id: 'plasma-core', name: 'Plasma Core', type: 'material',
    icon: 'material', description: 'Concentrated energy core. The ultimate fuel.',
    rarity: 'Epic', sellPrice: 60, isFuel: true,
    regions: ['void-nexus', 'celestial-highlands'],
  },
  'iron-ingot': {
    id: 'iron-ingot', name: 'Iron Ingot', type: 'material',
    icon: 'material', description: 'Refined iron bar. Used in workshop crafting.',
    rarity: 'Uncommon', sellPrice: 15,
    smeltedFrom: 'iron-ore',
  },
  'herb-bundle': {
    id: 'herb-bundle', name: 'Herb Bundle', type: 'material',
    icon: 'material', description: 'A bundle of medicinal herbs for brewing.',
    rarity: 'Common', sellPrice: 6,
    regions: ['toxic-marshlands', 'frozen-wastes', 'celestial-highlands'],
  },
  'glass-vial': {
    id: 'glass-vial', name: 'Glass Vial', type: 'material',
    icon: 'material', description: 'Empty vial for holding brewed concoctions.',
    rarity: 'Common', sellPrice: 3,
    regions: ['neon-district', 'scorched-badlands'],
  },
};

// Material drop weights by region (added to monster drop tables)
export const MATERIAL_DROP_CONFIG = {
  'neon-district': {
    dropRate: 0.12,
    materials: [
      { id: 'scrap-wood', weight: 40 },
      { id: 'iron-ore', weight: 30 },
      { id: 'copper-wire', weight: 15 },
      { id: 'glass-vial', weight: 25 },
      { id: 'oil-canister', weight: 5 },
    ],
  },
  'frozen-wastes': {
    dropRate: 0.14,
    materials: [
      { id: 'scrap-wood', weight: 30 },
      { id: 'stone-block', weight: 35 },
      { id: 'crystal-shard', weight: 8 },
      { id: 'herb-bundle', weight: 20 },
    ],
  },
  'scorched-badlands': {
    dropRate: 0.15,
    materials: [
      { id: 'iron-ore', weight: 35 },
      { id: 'stone-block', weight: 30 },
      { id: 'charcoal', weight: 25 },
      { id: 'coal-chunk', weight: 15 },
      { id: 'glass-vial', weight: 20 },
      { id: 'oil-canister', weight: 8 },
    ],
  },
  'toxic-marshlands': {
    dropRate: 0.16,
    materials: [
      { id: 'charcoal', weight: 25 },
      { id: 'toxic-resin', weight: 30 },
      { id: 'herb-bundle', weight: 35 },
    ],
  },
  'abyssal-depths': {
    dropRate: 0.17,
    materials: [
      { id: 'deep-coral', weight: 25 },
      { id: 'copper-wire', weight: 20 },
      { id: 'coal-chunk', weight: 18 },
    ],
  },
  'celestial-highlands': {
    dropRate: 0.18,
    materials: [
      { id: 'crystal-shard', weight: 15 },
      { id: 'starlight-dust', weight: 10 },
      { id: 'herb-bundle', weight: 25 },
      { id: 'plasma-core', weight: 5 },
    ],
  },
  'void-nexus': {
    dropRate: 0.20,
    materials: [
      { id: 'void-essence', weight: 8 },
      { id: 'plasma-core', weight: 10 },
      { id: 'starlight-dust', weight: 15 },
      { id: 'crystal-shard', weight: 20 },
    ],
  },
};

// ---- BUILDINGS ----
export const BUILDINGS = {
  brewery: {
    id: 'brewery',
    name: 'Brewery',
    description: 'Craft potions and energy drinks from gathered herbs and materials.',
    buildCost: { gold: 500, materials: { 'scrap-wood': 10, 'stone-block': 5, 'copper-wire': 3, 'glass-vial': 5 } },
    icon: 'brewery',
    levelReq: 5,
  },
  smelter: {
    id: 'smelter',
    name: 'Smelter',
    description: 'Smelt raw ores and items into refined materials like iron ingots.',
    buildCost: { gold: 600, materials: { 'stone-block': 12, 'iron-ore': 8, 'charcoal': 5 } },
    icon: 'smelter',
    levelReq: 8,
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    description: 'Craft tools, gear, and medium-complexity items from refined materials.',
    buildCost: { gold: 800, materials: { 'scrap-wood': 15, 'iron-ore': 10, 'copper-wire': 8 } },
    icon: 'workshop',
    levelReq: 10,
  },
  inn: {
    id: 'inn',
    name: 'Inn',
    description: 'Pay gold for timed EXP boosts. Upgrade the inn for stronger boosts.',
    buildCost: { gold: 750, materials: { 'scrap-wood': 20, 'stone-block': 10 } },
    icon: 'inn',
    upgrades: [
      {
        level: 1, name: 'Basic Inn', expBonus: 0.10, desc: '+10% EXP boosts available',
        boosts: [
          { id: 'boost-1-short', name: 'Quick Meal', cost: 50, duration: 30 * 60 * 1000, desc: '+10% EXP for 30 min' },
          { id: 'boost-1-med', name: 'Hearty Dinner', cost: 120, duration: 2 * 60 * 60 * 1000, desc: '+10% EXP for 2 hours' },
        ],
      },
      {
        level: 2, name: 'Improved Inn', expBonus: 0.20, desc: '+20% EXP boosts available',
        upgradeCost: { gold: 1200, materials: { 'scrap-wood': 15, 'crystal-shard': 2 } },
        boosts: [
          { id: 'boost-2-short', name: 'Quick Feast', cost: 80, duration: 30 * 60 * 1000, desc: '+20% EXP for 30 min' },
          { id: 'boost-2-med', name: 'Tavern Special', cost: 180, duration: 2 * 60 * 60 * 1000, desc: '+20% EXP for 2 hours' },
          { id: 'boost-2-long', name: 'Room & Board', cost: 350, duration: 8 * 60 * 60 * 1000, desc: '+20% EXP for 8 hours' },
        ],
      },
      {
        level: 3, name: 'Grand Inn', expBonus: 0.35, desc: '+35% EXP boosts available',
        upgradeCost: { gold: 2500, materials: { 'scrap-wood': 25, 'crystal-shard': 5, 'starlight-dust': 2 } },
        boosts: [
          { id: 'boost-3-short', name: 'Grand Feast', cost: 120, duration: 30 * 60 * 1000, desc: '+35% EXP for 30 min' },
          { id: 'boost-3-med', name: 'VIP Dining', cost: 250, duration: 2 * 60 * 60 * 1000, desc: '+35% EXP for 2 hours' },
          { id: 'boost-3-long', name: 'Grand Suite', cost: 500, duration: 8 * 60 * 60 * 1000, desc: '+35% EXP for 8 hours' },
          { id: 'boost-3-day', name: 'Royal Treatment', cost: 900, duration: 24 * 60 * 60 * 1000, desc: '+35% EXP for 24 hours' },
        ],
      },
    ],
    levelReq: 7,
  },
  chamber: {
    id: 'chamber',
    name: 'Chamber',
    description: 'Your personal quarters. Upgrades improve healing and provide passive buffs.',
    buildCost: { gold: 400, materials: { 'scrap-wood': 12, 'stone-block': 8 } },
    icon: 'chamber',
    subUpgrades: {
      bed: {
        id: 'bed', name: 'Bed',
        levels: [
          { level: 1, name: 'Straw Mattress', healBonus: 0.10, desc: 'Rest heals 10% more', cost: { gold: 200, materials: { 'scrap-wood': 5 } } },
          { level: 2, name: 'Wooden Bed', healBonus: 0.25, desc: 'Rest heals 25% more', cost: { gold: 500, materials: { 'scrap-wood': 10, 'iron-ore': 3 } } },
          { level: 3, name: 'Royal Bed', healBonus: 0.50, desc: 'Rest heals 50% more + regen over time', cost: { gold: 1500, materials: { 'crystal-shard': 3, 'starlight-dust': 1 } } },
        ],
      },
      kitchen: {
        id: 'kitchen', name: 'Kitchen',
        levels: [
          { level: 1, name: 'Campfire Grill', atkBuff: 2, desc: '+2 ATK passive buff', cost: { gold: 300, materials: { 'stone-block': 5, 'scrap-wood': 3, 'charcoal': 2 } } },
          { level: 2, name: 'Proper Kitchen', atkBuff: 5, defBuff: 2, desc: '+5 ATK, +2 DEF passive buff', cost: { gold: 800, materials: { 'iron-ore': 5, 'copper-wire': 3, 'charcoal': 5 } } },
          { level: 3, name: 'Gourmet Kitchen', atkBuff: 10, defBuff: 5, hpBuff: 20, desc: '+10 ATK, +5 DEF, +20 Max HP', cost: { gold: 2000, materials: { 'crystal-shard': 2, 'deep-coral': 3, 'starlight-dust': 1 } } },
        ],
      },
      study: {
        id: 'study', name: 'Study',
        levels: [
          { level: 1, name: 'Bookshelf', wisdomBuff: 2, desc: '+2 Wisdom', cost: { gold: 250, materials: { 'scrap-wood': 8 } } },
          { level: 2, name: 'Library', wisdomBuff: 5, manaBuff: 10, desc: '+5 Wisdom, +10 Max Mana', cost: { gold: 700, materials: { 'scrap-wood': 15, 'crystal-shard': 2 } } },
          { level: 3, name: 'Arcane Study', wisdomBuff: 10, manaBuff: 25, desc: '+10 Wisdom, +25 Max Mana', cost: { gold: 1800, materials: { 'crystal-shard': 4, 'void-essence': 1 } } },
        ],
      },
    },
    levelReq: 3,
  },
  adventureCamp: {
    id: 'adventureCamp',
    name: 'Adventure Camp',
    description: 'Send squads to pillage for you. Returns random items and gold after a set time.',
    buildCost: { gold: 1000, materials: { 'scrap-wood': 20, 'stone-block': 15, 'iron-ore': 10 } },
    icon: 'camp',
    missions: [
      { id: 'quick-raid', name: 'Quick Raid', duration: 1 * 60 * 60 * 1000, desc: '1 hour - Small loot', lootTier: 1, goldRange: [10, 50] },
      { id: 'supply-run', name: 'Supply Run', duration: 4 * 60 * 60 * 1000, desc: '4 hours - Moderate loot', lootTier: 2, goldRange: [30, 120] },
      { id: 'deep-expedition', name: 'Deep Expedition', duration: 8 * 60 * 60 * 1000, desc: '8 hours - Good loot', lootTier: 3, goldRange: [80, 250] },
      { id: 'full-campaign', name: 'Full Campaign', duration: 24 * 60 * 60 * 1000, desc: '24 hours - Best loot', lootTier: 4, goldRange: [200, 600] },
    ],
    levelReq: 12,
  },
  sparringRange: {
    id: 'sparringRange',
    name: 'Sparring Range',
    description: 'Test your kits, spells, and strategies against training dummies.',
    buildCost: { gold: 600, materials: { 'scrap-wood': 15, 'iron-ore': 8, 'stone-block': 5 } },
    icon: 'spar',
    levelReq: 6,
  },
  bank: {
    id: 'bank',
    name: 'Bank',
    description: 'Deposit gold safely (10% fee), borrow funds, or freeze gold for interest.',
    buildCost: { gold: 1500, materials: { 'stone-block': 20, 'iron-ore': 15, 'copper-wire': 10, 'crystal-shard': 3 } },
    icon: 'bank',
    depositFee: 0.10,
    freezeOptions: [
      { id: 'freeze-7', days: 7, interestRate: 0.01, desc: '7 days - 1% return' },
      { id: 'freeze-14', days: 14, interestRate: 0.021, desc: '14 days - 2.1% return' },
      { id: 'freeze-31', days: 31, interestRate: 0.05, desc: '31 days - 5% return' },
    ],
    maxFreezeAmount: 1000,
    maxLoanAmount: 1000,
    levelReq: 15,
  },
};

// ---- BREWERY RECIPES ----
export const BREWERY_RECIPES = [
  {
    id: 'brew-small-potion', name: 'Brew Small Medkit',
    materials: { 'herb-bundle': 2, 'glass-vial': 1 },
    result: { type: 'potion', tier: 0 }, craftTime: 5000,
    desc: 'Brew a basic healing potion.',
  },
  {
    id: 'brew-medkit', name: 'Brew Standard Medkit',
    materials: { 'herb-bundle': 4, 'glass-vial': 1, 'toxic-resin': 1 },
    result: { type: 'potion', tier: 1 }, craftTime: 10000,
    desc: 'Brew a standard healing potion.',
  },
  {
    id: 'brew-combat-stim', name: 'Brew Combat Stim',
    materials: { 'herb-bundle': 5, 'glass-vial': 2, 'toxic-resin': 2, 'crystal-shard': 1 },
    result: { type: 'potion', tier: 2 }, craftTime: 15000,
    desc: 'Brew a powerful combat stimulant.',
  },
  {
    id: 'brew-energy-shot', name: 'Brew Cheap Energy Shot',
    materials: { 'herb-bundle': 1, 'glass-vial': 1 },
    result: { type: 'energy-drink', tier: 0 }, craftTime: 5000,
    desc: 'Brew a basic energy drink.',
  },
  {
    id: 'brew-energy-drink', name: 'Brew Standard Energy Drink',
    materials: { 'herb-bundle': 3, 'glass-vial': 1, 'toxic-resin': 1 },
    result: { type: 'energy-drink', tier: 1 }, craftTime: 10000,
    desc: 'Brew a decent energy drink.',
  },
  {
    id: 'brew-hyperdrive', name: 'Brew Hyperdrive Elixir',
    materials: { 'herb-bundle': 8, 'glass-vial': 3, 'toxic-resin': 3, 'starlight-dust': 1 },
    result: { type: 'energy-drink', tier: 3 }, craftTime: 20000,
    desc: 'Brew the ultimate energy restoration elixir.',
  },
];

// ---- SMELTER RECIPES ----
export const SMELTER_RECIPES = [
  {
    id: 'smelt-iron', name: 'Smelt Iron Ingot',
    materials: { 'iron-ore': 3 },
    fuelRequired: 5,
    result: { materialId: 'iron-ingot', quantity: 1 }, craftTime: 8000,
    desc: 'Refine iron ore into a usable ingot.',
  },
  {
    id: 'smelt-crystal', name: 'Refine Crystal',
    materials: { 'crystal-shard': 2, 'coal-chunk': 1 },
    fuelRequired: 15,
    result: { materialId: 'crystal-shard', quantity: 3 }, craftTime: 15000,
    desc: 'Purify crystal shards into more refined pieces.',
  },
  {
    id: 'smelt-scrap-to-iron', name: 'Reclaim Iron from Gear',
    salvageGear: true,
    fuelRequired: 10,
    result: { materialId: 'iron-ore', quantity: 2 }, craftTime: 10000,
    desc: 'Melt down equipment to extract raw iron ore.',
  },
  {
    id: 'smelt-copper', name: 'Refine Copper Wire',
    materials: { 'copper-wire': 2, 'coal-chunk': 1 },
    fuelRequired: 8,
    result: { materialId: 'copper-wire', quantity: 3 }, craftTime: 10000,
    desc: 'Purify and extend copper wiring.',
  },
];

// ---- WORKSHOP RECIPES ----
export const WORKSHOP_RECIPES = [
  // --- WEAPONS (5) ---
  {
    id: 'craft-iron-dagger', name: 'Forge Iron Dagger',
    materials: { 'iron-ingot': 2, 'scrap-wood': 1 },
    result: { type: 'sword', template: 'crafted-iron-dagger' }, craftTime: 8000,
    desc: 'A light, quick iron dagger.',
  },
  {
    id: 'craft-iron-sword', name: 'Forge Iron Blade',
    materials: { 'iron-ingot': 3, 'scrap-wood': 2 },
    result: { type: 'sword', template: 'crafted-iron-blade' }, craftTime: 12000,
    desc: 'Forge a sturdy iron blade.',
  },
  {
    id: 'craft-crystal-staff', name: 'Craft Crystal Staff',
    materials: { 'crystal-shard': 4, 'scrap-wood': 3, 'copper-wire': 1 },
    result: { type: 'sword', template: 'crafted-crystal-staff' }, craftTime: 14000,
    desc: 'Channel crystal energy through a wooden staff.',
  },
  {
    id: 'craft-plasma-edge', name: 'Forge Plasma Edge',
    materials: { 'plasma-core': 2, 'iron-ingot': 3, 'crystal-shard': 1 },
    result: { type: 'sword', template: 'crafted-plasma-edge' }, craftTime: 20000,
    desc: 'A blade infused with raw plasma energy.',
  },
  {
    id: 'craft-void-cleaver', name: 'Forge Void Cleaver',
    materials: { 'void-essence': 2, 'iron-ingot': 4, 'crystal-shard': 2 },
    result: { type: 'sword', template: 'crafted-void-cleaver' }, craftTime: 25000,
    desc: 'A devastating weapon forged from the void.',
  },
  // --- SHIELDS (4) ---
  {
    id: 'craft-iron-shield', name: 'Forge Iron Buckler',
    materials: { 'iron-ingot': 4, 'copper-wire': 2 },
    result: { type: 'shield', template: 'crafted-iron-buckler' }, craftTime: 12000,
    desc: 'Hammer out a reliable iron shield.',
  },
  {
    id: 'craft-reinforced-barricade', name: 'Forge Reinforced Barricade',
    materials: { 'iron-ingot': 5, 'stone-block': 4, 'copper-wire': 2 },
    result: { type: 'shield', template: 'crafted-reinforced-barricade' }, craftTime: 16000,
    desc: 'A heavy shield built to absorb massive blows.',
  },
  {
    id: 'craft-crystal-ward', name: 'Craft Crystal Ward',
    materials: { 'crystal-shard': 4, 'iron-ingot': 2, 'glass-vial': 1 },
    result: { type: 'shield', template: 'crafted-crystal-ward' }, craftTime: 14000,
    desc: 'A shimmering shield of woven crystal.',
  },
  {
    id: 'craft-coral-bulwark', name: 'Craft Coral Bulwark',
    materials: { 'deep-coral': 4, 'iron-ingot': 3, 'copper-wire': 2 },
    result: { type: 'shield', template: 'crafted-coral-bulwark' }, craftTime: 18000,
    desc: 'Deep-sea coral shaped into a resilient barrier.',
  },
  // --- HELMETS (4) ---
  {
    id: 'craft-iron-helm', name: 'Forge Iron Helm',
    materials: { 'iron-ingot': 2, 'copper-wire': 1 },
    result: { type: 'helmet', template: 'crafted-iron-helm' }, craftTime: 10000,
    desc: 'Shape iron into a protective helmet.',
  },
  {
    id: 'craft-copper-circlet', name: 'Craft Copper Circlet',
    materials: { 'copper-wire': 3, 'iron-ingot': 1 },
    result: { type: 'helmet', template: 'crafted-copper-circlet' }, craftTime: 10000,
    desc: 'A lightweight circlet woven from copper.',
  },
  {
    id: 'craft-crystal-tiara', name: 'Craft Crystal Tiara',
    materials: { 'crystal-shard': 3, 'copper-wire': 2, 'glass-vial': 1 },
    result: { type: 'helmet', template: 'crafted-crystal-tiara' }, craftTime: 14000,
    desc: 'A tiara set with focusing crystal shards.',
  },
  {
    id: 'craft-starlight-crown', name: 'Forge Starlight Crown',
    materials: { 'starlight-dust': 2, 'crystal-shard': 3, 'iron-ingot': 2 },
    result: { type: 'helmet', template: 'crafted-starlight-crown' }, craftTime: 22000,
    desc: 'A radiant crown forged from starlight.',
  },
  // --- ARMOR (4) ---
  {
    id: 'craft-iron-armor', name: 'Forge Iron Chestplate',
    materials: { 'iron-ingot': 5, 'copper-wire': 3 },
    result: { type: 'armor', template: 'crafted-iron-chestplate' }, craftTime: 15000,
    desc: 'Forge heavy iron body armor.',
  },
  {
    id: 'craft-stone-vest', name: 'Forge Stone Guard Vest',
    materials: { 'stone-block': 5, 'iron-ingot': 3, 'scrap-wood': 3 },
    result: { type: 'armor', template: 'crafted-stone-vest' }, craftTime: 14000,
    desc: 'Sturdy armor reinforced with cut stone.',
  },
  {
    id: 'craft-coral-chainmail', name: 'Craft Coral Chainmail',
    materials: { 'deep-coral': 3, 'iron-ingot': 4, 'copper-wire': 3 },
    result: { type: 'armor', template: 'crafted-coral-chainmail' }, craftTime: 18000,
    desc: 'Interlocking coral plates over iron chain.',
  },
  {
    id: 'craft-starlight-robe', name: 'Weave Starlight Robe',
    materials: { 'starlight-dust': 3, 'crystal-shard': 4, 'scrap-wood': 4 },
    result: { type: 'armor', template: 'crafted-starlight-robe' }, craftTime: 22000,
    desc: 'A radiant robe woven from celestial dust.',
  },
  // --- BOOTS (4) ---
  {
    id: 'craft-iron-greaves', name: 'Forge Iron Greaves',
    materials: { 'iron-ingot': 3, 'copper-wire': 2, 'stone-block': 2 },
    result: { type: 'boots', template: 'crafted-iron-greaves' }, craftTime: 12000,
    desc: 'Heavy iron greaves for maximum protection.',
  },
  {
    id: 'craft-explorer-boots', name: 'Craft Explorer Boots',
    materials: { 'iron-ingot': 2, 'toxic-resin': 2, 'deep-coral': 1 },
    result: { type: 'boots', template: 'crafted-explorer-boots' }, craftTime: 12000,
    desc: 'Sturdy boots for long expeditions.',
  },
  {
    id: 'craft-marsh-striders', name: 'Craft Marsh Striders',
    materials: { 'toxic-resin': 4, 'scrap-wood': 3, 'herb-bundle': 2 },
    result: { type: 'boots', template: 'crafted-marsh-striders' }, craftTime: 12000,
    desc: 'Resin-coated boots that grip any terrain.',
  },
  {
    id: 'craft-crystal-walkers', name: 'Craft Crystal Walkers',
    materials: { 'crystal-shard': 3, 'iron-ingot': 2, 'glass-vial': 2 },
    result: { type: 'boots', template: 'crafted-crystal-walkers' }, craftTime: 16000,
    desc: 'Boots lined with crystal for agility and defense.',
  },
  // --- ACCESSORIES (4) ---
  {
    id: 'craft-iron-bracelet', name: 'Craft Iron Bracelet',
    materials: { 'iron-ingot': 2, 'copper-wire': 2 },
    result: { type: 'ring', template: 'crafted-iron-bracelet' }, craftTime: 8000,
    desc: 'A solid iron bangle for wrist protection.',
  },
  {
    id: 'craft-crystal-ring', name: 'Craft Crystal Ring',
    materials: { 'crystal-shard': 3, 'copper-wire': 2, 'iron-ingot': 1 },
    result: { type: 'ring', template: 'crafted-crystal-ring' }, craftTime: 12000,
    desc: 'Set crystal into a powerful ring.',
  },
  {
    id: 'craft-coral-charm', name: 'Craft Coral Charm',
    materials: { 'deep-coral': 2, 'copper-wire': 2, 'glass-vial': 1 },
    result: { type: 'ring', template: 'crafted-coral-charm' }, craftTime: 12000,
    desc: 'A deep-sea coral amulet with protective properties.',
  },
  {
    id: 'craft-starlight-pendant', name: 'Craft Starlight Pendant',
    materials: { 'starlight-dust': 2, 'crystal-shard': 2, 'copper-wire': 1 },
    result: { type: 'ring', template: 'crafted-starlight-pendant' }, craftTime: 20000,
    desc: 'A pendant that radiates with celestial power.',
  },
];

// Crafted item templates (used by workshop)
export const CRAFTED_ITEMS = {
  // Weapons
  'crafted-iron-dagger': { name: 'Iron Dagger', slot: 'weapon', rarity: 'Common', baseAtk: 8, baseDef: 0, baseLevel: 6 },
  'crafted-iron-blade': { name: 'Iron Blade', slot: 'weapon', rarity: 'Uncommon', baseAtk: 12, baseDef: 0, baseLevel: 8 },
  'crafted-crystal-staff': { name: 'Crystal Staff', slot: 'weapon', rarity: 'Rare', baseAtk: 18, baseDef: 2, baseLevel: 15 },
  'crafted-plasma-edge': { name: 'Plasma Edge', slot: 'weapon', rarity: 'Epic', baseAtk: 26, baseDef: 3, baseLevel: 22 },
  'crafted-void-cleaver': { name: 'Void Cleaver', slot: 'weapon', rarity: 'Epic', baseAtk: 30, baseDef: 0, baseLevel: 25 },
  // Shields
  'crafted-iron-buckler': { name: 'Iron Buckler', slot: 'shield', rarity: 'Uncommon', baseAtk: 2, baseDef: 10, baseLevel: 8 },
  'crafted-reinforced-barricade': { name: 'Reinforced Barricade', slot: 'shield', rarity: 'Rare', baseAtk: 1, baseDef: 16, baseLevel: 14 },
  'crafted-crystal-ward': { name: 'Crystal Ward', slot: 'shield', rarity: 'Rare', baseAtk: 4, baseDef: 12, baseLevel: 16 },
  'crafted-coral-bulwark': { name: 'Coral Bulwark', slot: 'shield', rarity: 'Rare', baseAtk: 2, baseDef: 18, baseLevel: 18 },
  // Helmets
  'crafted-iron-helm': { name: 'Iron Helm', slot: 'helmet', rarity: 'Uncommon', baseAtk: 1, baseDef: 8, baseLevel: 8 },
  'crafted-copper-circlet': { name: 'Copper Circlet', slot: 'helmet', rarity: 'Uncommon', baseAtk: 3, baseDef: 5, baseLevel: 9 },
  'crafted-crystal-tiara': { name: 'Crystal Tiara', slot: 'helmet', rarity: 'Rare', baseAtk: 6, baseDef: 7, baseLevel: 15 },
  'crafted-starlight-crown': { name: 'Starlight Crown', slot: 'helmet', rarity: 'Epic', baseAtk: 8, baseDef: 12, baseLevel: 22 },
  // Armor
  'crafted-iron-chestplate': { name: 'Iron Chestplate', slot: 'armor', rarity: 'Uncommon', baseAtk: 0, baseDef: 14, baseLevel: 10 },
  'crafted-stone-vest': { name: 'Stone Guard Vest', slot: 'armor', rarity: 'Uncommon', baseAtk: 2, baseDef: 12, baseLevel: 11 },
  'crafted-coral-chainmail': { name: 'Coral Chainmail', slot: 'armor', rarity: 'Rare', baseAtk: 3, baseDef: 16, baseLevel: 16 },
  'crafted-starlight-robe': { name: 'Starlight Robe', slot: 'armor', rarity: 'Epic', baseAtk: 10, baseDef: 10, baseLevel: 22 },
  // Boots
  'crafted-iron-greaves': { name: 'Iron Greaves', slot: 'boots', rarity: 'Uncommon', baseAtk: 1, baseDef: 10, baseLevel: 10 },
  'crafted-explorer-boots': { name: 'Explorer Boots', slot: 'boots', rarity: 'Rare', baseAtk: 3, baseDef: 9, baseLevel: 12 },
  'crafted-marsh-striders': { name: 'Marsh Striders', slot: 'boots', rarity: 'Uncommon', baseAtk: 5, baseDef: 6, baseLevel: 12 },
  'crafted-crystal-walkers': { name: 'Crystal Walkers', slot: 'boots', rarity: 'Rare', baseAtk: 5, baseDef: 11, baseLevel: 17 },
  // Accessories
  'crafted-iron-bracelet': { name: 'Iron Bracelet', slot: 'accessory', rarity: 'Uncommon', baseAtk: 4, baseDef: 4, baseLevel: 8 },
  'crafted-crystal-ring': { name: 'Crystal Ring', slot: 'accessory', rarity: 'Rare', baseAtk: 8, baseDef: 5, baseLevel: 15 },
  'crafted-coral-charm': { name: 'Coral Charm', slot: 'accessory', rarity: 'Rare', baseAtk: 5, baseDef: 7, baseLevel: 14 },
  'crafted-starlight-pendant': { name: 'Starlight Pendant', slot: 'accessory', rarity: 'Epic', baseAtk: 12, baseDef: 8, baseLevel: 20 },
};

// ---- SHOP MATERIAL ITEMS (rarely available) ----
export const SHOP_MATERIALS = [
  { id: 'scrap-wood', buyPrice: 12, weight: 30 },
  { id: 'iron-ore', buyPrice: 18, weight: 20 },
  { id: 'glass-vial', buyPrice: 10, weight: 25 },
  { id: 'stone-block', buyPrice: 15, weight: 15 },
  { id: 'herb-bundle', buyPrice: 20, weight: 10 },
  { id: 'charcoal', buyPrice: 30, weight: 8 },
];

// Chance to show material items in the daily shop (low)
export const SHOP_MATERIAL_CHANCE = 0.25;
export const SHOP_MATERIAL_COUNT = 2;

// ---- SPARRING DUMMIES ----
export const SPARRING_DUMMIES = [
  { id: 'dummy-basic', name: 'Straw Dummy', hp: 100, def: 0, desc: 'No defense. Good for testing raw damage.' },
  { id: 'dummy-armored', name: 'Iron Dummy', hp: 200, def: 15, desc: 'High defense. Test your armor penetration.' },
  { id: 'dummy-tough', name: 'Reinforced Dummy', hp: 500, def: 8, desc: 'Lots of HP. Test sustained damage output.' },
  { id: 'dummy-boss', name: 'Boss Dummy', hp: 800, def: 20, desc: 'Boss-tier stats. Prepare for the real thing.' },
];

// ---- ADVENTURE CAMP LOOT TABLES ----
export const CAMP_LOOT_TABLES = {
  1: { // Quick Raid
    items: [
      { type: 'material', id: 'scrap-wood', weight: 35, qtyRange: [1, 3] },
      { type: 'material', id: 'iron-ore', weight: 25, qtyRange: [1, 2] },
      { type: 'material', id: 'glass-vial', weight: 20, qtyRange: [1, 2] },
      { type: 'material', id: 'herb-bundle', weight: 15, qtyRange: [1, 2] },
      { type: 'gear', gearType: 'potion', weight: 30 },
    ],
    maxItems: 2,
  },
  2: { // Supply Run
    items: [
      { type: 'material', id: 'scrap-wood', weight: 30, qtyRange: [2, 5] },
      { type: 'material', id: 'iron-ore', weight: 25, qtyRange: [2, 4] },
      { type: 'material', id: 'charcoal', weight: 15, qtyRange: [1, 3] },
      { type: 'material', id: 'copper-wire', weight: 12, qtyRange: [1, 2] },
      { type: 'material', id: 'stone-block', weight: 20, qtyRange: [2, 4] },
      { type: 'gear', gearType: 'potion', weight: 20 },
      { type: 'gear', gearType: 'energy-drink', weight: 15 },
    ],
    maxItems: 3,
  },
  3: { // Deep Expedition
    items: [
      { type: 'material', id: 'iron-ore', weight: 25, qtyRange: [3, 6] },
      { type: 'material', id: 'charcoal', weight: 20, qtyRange: [2, 4] },
      { type: 'material', id: 'crystal-shard', weight: 8, qtyRange: [1, 2] },
      { type: 'material', id: 'toxic-resin', weight: 15, qtyRange: [2, 3] },
      { type: 'material', id: 'deep-coral', weight: 10, qtyRange: [1, 2] },
      { type: 'material', id: 'coal-chunk', weight: 12, qtyRange: [1, 3] },
      { type: 'gear', gearType: 'sword', weight: 10 },
      { type: 'gear', gearType: 'armor', weight: 8 },
    ],
    maxItems: 4,
  },
  4: { // Full Campaign
    items: [
      { type: 'material', id: 'crystal-shard', weight: 15, qtyRange: [2, 4] },
      { type: 'material', id: 'starlight-dust', weight: 6, qtyRange: [1, 2] },
      { type: 'material', id: 'deep-coral', weight: 12, qtyRange: [2, 3] },
      { type: 'material', id: 'copper-wire', weight: 15, qtyRange: [3, 6] },
      { type: 'material', id: 'iron-ore', weight: 20, qtyRange: [4, 8] },
      { type: 'material', id: 'oil-canister', weight: 8, qtyRange: [1, 2] },
      { type: 'material', id: 'void-essence', weight: 3, qtyRange: [1, 1] },
      { type: 'gear', gearType: 'sword', weight: 12 },
      { type: 'gear', gearType: 'armor', weight: 10 },
      { type: 'gear', gearType: 'shield', weight: 8 },
      { type: 'gear', gearType: 'ring', weight: 8 },
    ],
    maxItems: 5,
  },
};

// ---- INITIAL BASE STATE ----
export function createInitialBase() {
  return {
    buildings: {},       // { buildingId: { built: true, level: 1, ... } }
    materials: {},       // { materialId: quantity }
    fuel: 0,             // current fuel minutes remaining
    fuelLastUpdate: null,
    // Adventure camp
    activeMission: null, // { missionId, startTime, duration }
    // Bank
    bankDeposit: 0,
    frozenGold: null,    // { amount, startTime, duration, interestRate }
    loan: null,          // { amount, dueTime }
    // Sparring
    sparringDummy: null,
    sparringHp: 0,
    // Chamber upgrades
    chamberUpgrades: {}, // { bed: 0, kitchen: 0, study: 0 }
    // Inn
    innLevel: 0,
    innBoost: null,  // { expBonus, startTime, duration, boostName }
    // Crafting
    craftingQueue: null, // { recipeId, building, startTime, craftTime }
  };
}

// ---- HELPER: Get total chamber buffs ----
export function getChamberBuffs(base) {
  const upgrades = base?.chamberUpgrades || {};
  const chamber = BUILDINGS.chamber;
  let buffs = { atkBuff: 0, defBuff: 0, hpBuff: 0, manaBuff: 0, healBonus: 0, wisdomBuff: 0 };

  for (const [subId, subData] of Object.entries(chamber.subUpgrades)) {
    const level = upgrades[subId] || 0;
    if (level > 0) {
      const levelData = subData.levels[level - 1];
      if (levelData) {
        if (levelData.atkBuff) buffs.atkBuff += levelData.atkBuff;
        if (levelData.defBuff) buffs.defBuff += levelData.defBuff;
        if (levelData.hpBuff) buffs.hpBuff += levelData.hpBuff;
        if (levelData.manaBuff) buffs.manaBuff += levelData.manaBuff;
        if (levelData.healBonus) buffs.healBonus += levelData.healBonus;
        if (levelData.wisdomBuff) buffs.wisdomBuff += levelData.wisdomBuff;
      }
    }
  }
  return buffs;
}

// ---- HELPER: Get inn EXP bonus (timed boost system) ----
export function getInnExpBonus(base) {
  if (!base?.buildings?.inn?.built) return 0;
  const boost = base.innBoost;
  if (!boost) return 0;
  const now = Date.now();
  if (now - boost.startTime >= boost.duration) return 0; // expired
  return boost.expBonus || 0;
}

// Generate a material item for inventory/drops
export function createMaterialItem(materialId, quantity = 1) {
  const mat = BUILDING_MATERIALS[materialId];
  if (!mat) return null;
  return {
    id: uid(),
    materialId: materialId,
    name: mat.name,
    type: 'material',
    slot: null,
    level: 1,
    rarity: mat.rarity,
    rarityClass: mat.rarity.toLowerCase(),
    rarityColor: null,
    icon: 'material',
    description: mat.description,
    sellPrice: mat.sellPrice,
    stackQuantity: quantity,
    isFuel: !!mat.isFuel,
  };
}
