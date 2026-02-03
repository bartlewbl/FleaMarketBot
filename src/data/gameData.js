// All game data: locations, monsters, items, skills
import { RANDOM_CONFIG } from './randomConfig';

let _uid = 0;
function uid() {
  return 'item_' + (++_uid) + '_' + Date.now();
}

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

// ---- LOCATIONS ----
// Each location has a lootTable that weights what gear types are found
// while scavenging (outside of monster drops). This keeps loot thematic.
export const LOCATIONS = [
  {
    id: 'neon-mile', name: 'Neon Mile',
    description: 'Flickering billboards and cracked asphalt full of gutter pests.',
    levelReq: 1, monsters: ['rat', 'slime', 'bat'],
    bgKey: 'street',
    lootTable: [{ type: 'potion', weight: 40 }, { type: 'boots', weight: 15 }, { type: 'ring', weight: 10 }],
  },
  {
    id: 'shadow-alley', name: 'Shadow Alley',
    description: 'Tight passages where feral vagrants lurk between dumpsters.',
    levelReq: 3, monsters: ['rat', 'vagrant', 'goblin'],
    bgKey: 'alley',
    lootTable: [{ type: 'potion', weight: 30 }, { type: 'sword', weight: 15 }, { type: 'boots', weight: 12 }, { type: 'helmet', weight: 10 }],
  },
  {
    id: 'fungal-drain', name: 'Fungal Drain',
    description: 'Damp sewer tunnels choked with bioluminescent spore colonies.',
    levelReq: 4, monsters: ['mushroom', 'slime', 'snake'],
    bgKey: 'sewer',
    lootTable: [{ type: 'potion', weight: 45 }, { type: 'ring', weight: 15 }, { type: 'helmet', weight: 10 }],
  },
  {
    id: 'metro-underpass', name: 'Metro Underpass',
    description: 'Abandoned train tunnels dripping with mutant slime.',
    levelReq: 6, monsters: ['slime', 'alpha-rat', 'ghost'],
    bgKey: 'station',
    lootTable: [{ type: 'potion', weight: 25 }, { type: 'armor', weight: 15 }, { type: 'shield', weight: 12 }, { type: 'ring', weight: 10 }],
  },
  {
    id: 'wolf-district', name: 'Wolf District',
    description: 'Fenced-off blocks where packs of augmented wolves roam free.',
    levelReq: 8, monsters: ['wolf', 'alpha-rat', 'snake'],
    bgKey: 'alley',
    lootTable: [{ type: 'boots', weight: 18 }, { type: 'helmet', weight: 14 }, { type: 'potion', weight: 25 }, { type: 'sword', weight: 10 }],
  },
  {
    id: 'skyline-rooftops', name: 'Skyline Rooftops',
    description: 'Windy roofs patrolled by organized scavenger crews.',
    levelReq: 10, monsters: ['vagrant', 'rogue-vagrant', 'bat'],
    bgKey: 'rooftop',
    lootTable: [{ type: 'sword', weight: 15 }, { type: 'ring', weight: 14 }, { type: 'potion', weight: 20 }, { type: 'helmet', weight: 12 }],
  },
  {
    id: 'bone-crypt', name: 'Bone Crypt',
    description: 'Sealed sub-basement filled with reanimated security frames.',
    levelReq: 12, monsters: ['skeleton', 'ghost', 'bat'],
    bgKey: 'crypt',
    lootTable: [{ type: 'shield', weight: 16 }, { type: 'helmet', weight: 14 }, { type: 'sword', weight: 12 }, { type: 'potion', weight: 20 }],
  },
  {
    id: 'ironworks-yard', name: 'Ironworks Yard',
    description: 'Industrial lots buzzing with toxic runoff and molten slag.',
    levelReq: 14, monsters: ['toxic-slime', 'golem', 'goblin'],
    bgKey: 'industrial',
    lootTable: [{ type: 'armor', weight: 18 }, { type: 'shield', weight: 14 }, { type: 'potion', weight: 20 }, { type: 'boots', weight: 10 }],
  },
  {
    id: 'midnight-terminal', name: 'Midnight Terminal',
    description: 'Final stop where bold-face enforcers push back the grime.',
    levelReq: 17, monsters: ['rogue-vagrant', 'skeleton', 'toxic-slime'],
    bgKey: 'station',
    lootTable: [{ type: 'sword', weight: 14 }, { type: 'armor', weight: 14 }, { type: 'shield', weight: 12 }, { type: 'potion', weight: 18 }],
  },
  {
    id: 'holo-bazaar', name: 'Holo Bazaar',
    description: 'A glitching market dimension where data wraiths guard corrupted wares.',
    levelReq: 20, monsters: ['ghost', 'golem', 'rogue-vagrant'],
    bgKey: 'bazaar',
    lootTable: [{ type: 'ring', weight: 18 }, { type: 'sword', weight: 14 }, { type: 'armor', weight: 12 }, { type: 'potion', weight: 16 }],
  },
  {
    id: 'reactor-spire', name: 'Reactor Spire',
    description: 'The irradiated tower core where mech dragons nest among fusion coils.',
    levelReq: 23, monsters: ['dragon', 'golem', 'ghost'],
    bgKey: 'reactor',
    lootTable: [{ type: 'sword', weight: 16 }, { type: 'armor', weight: 16 }, { type: 'shield', weight: 14 }, { type: 'ring', weight: 12 }, { type: 'potion', weight: 12 }],
  },
];

// ---- MONSTERS ----
const MONSTERS = {
  rat: {
    name: 'Gutter Rat', sprite: 'rat', baseHp: 22, baseAtk: 5, baseDef: 1,
    baseExp: 12, baseGold: 6, skills: ['bite'],
    dropTable: [{ type: 'potion', weight: 35 }, { type: 'boots', weight: 8 }],
  },
  'alpha-rat': {
    name: 'Alpha Rat', sprite: 'rat', baseHp: 40, baseAtk: 10, baseDef: 3,
    baseExp: 24, baseGold: 15, skills: ['bite'],
    dropTable: [{ type: 'sword', weight: 12 }, { type: 'armor', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  slime: {
    name: 'Neon Slime', sprite: 'slime', baseHp: 28, baseAtk: 6, baseDef: 2,
    baseExp: 16, baseGold: 8, skills: [],
    dropTable: [{ type: 'potion', weight: 45 }, { type: 'ring', weight: 5 }],
  },
  'toxic-slime': {
    name: 'Toxic Slime', sprite: 'slime', baseHp: 45, baseAtk: 12, baseDef: 4,
    baseExp: 34, baseGold: 20, skills: ['poison'],
    dropTable: [{ type: 'armor', weight: 10 }, { type: 'ring', weight: 7 }, { type: 'potion', weight: 35 }],
  },
  vagrant: {
    name: 'Feral Vagrant', sprite: 'vagrant', baseHp: 36, baseAtk: 12, baseDef: 5,
    baseExp: 30, baseGold: 18, skills: ['slash'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 25 }],
  },
  'rogue-vagrant': {
    name: 'Rogue Vagrant', sprite: 'vagrant', baseHp: 60, baseAtk: 18, baseDef: 7,
    baseExp: 48, baseGold: 28, skills: ['slash', 'steal'],
    dropTable: [{ type: 'armor', weight: 12 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 6 }, { type: 'potion', weight: 30 }],
  },
  wolf: {
    name: 'Circuit Wolf', sprite: 'wolf', baseHp: 34, baseAtk: 11, baseDef: 3,
    baseExp: 22, baseGold: 12, skills: ['bite'],
    dropTable: [{ type: 'boots', weight: 14 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 25 }],
  },
  bat: {
    name: 'Voltage Bat', sprite: 'bat', baseHp: 18, baseAtk: 8, baseDef: 1,
    baseExp: 10, baseGold: 5, skills: ['screech'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'potion', weight: 40 }],
  },
  skeleton: {
    name: 'Rust Skeleton', sprite: 'skeleton', baseHp: 48, baseAtk: 14, baseDef: 6,
    baseExp: 36, baseGold: 22, skills: ['slash', 'curse'],
    dropTable: [{ type: 'sword', weight: 14 }, { type: 'shield', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  goblin: {
    name: 'Scrap Goblin', sprite: 'goblin', baseHp: 30, baseAtk: 9, baseDef: 4,
    baseExp: 18, baseGold: 20, skills: ['steal'],
    dropTable: [{ type: 'ring', weight: 12 }, { type: 'boots', weight: 10 }, { type: 'potion', weight: 30 }],
  },
  golem: {
    name: 'Iron Golem', sprite: 'golem', baseHp: 80, baseAtk: 16, baseDef: 12,
    baseExp: 55, baseGold: 35, skills: ['slam'],
    dropTable: [{ type: 'armor', weight: 16 }, { type: 'shield', weight: 14 }, { type: 'helmet', weight: 10 }, { type: 'potion', weight: 15 }],
  },
  snake: {
    name: 'Neon Viper', sprite: 'snake', baseHp: 26, baseAtk: 10, baseDef: 2,
    baseExp: 14, baseGold: 9, skills: ['poison', 'bite'],
    dropTable: [{ type: 'ring', weight: 12 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 35 }],
  },
  dragon: {
    name: 'Mech Dragon', sprite: 'dragon', baseHp: 120, baseAtk: 24, baseDef: 14,
    baseExp: 80, baseGold: 55, skills: ['firebreath', 'slam'],
    dropTable: [{ type: 'sword', weight: 14 }, { type: 'armor', weight: 12 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 15 }],
  },
  ghost: {
    name: 'Data Wraith', sprite: 'ghost', baseHp: 42, baseAtk: 13, baseDef: 3,
    baseExp: 32, baseGold: 18, skills: ['curse', 'poison'],
    dropTable: [{ type: 'ring', weight: 15 }, { type: 'helmet', weight: 10 }, { type: 'potion', weight: 30 }],
  },
  mushroom: {
    name: 'Spore Cluster', sprite: 'mushroom', baseHp: 35, baseAtk: 7, baseDef: 5,
    baseExp: 20, baseGold: 14, skills: ['poison'],
    dropTable: [{ type: 'potion', weight: 40 }, { type: 'ring', weight: 10 }, { type: 'helmet', weight: 8 }],
  },
};

// ---- SKILLS ----
export const SKILLS = {
  bite:       { name: 'Bite',        multiplier: 1.3 },
  slash:      { name: 'Slash',       multiplier: 1.4 },
  screech:    { name: 'Screech',     multiplier: 0.8, effect: 'lower_def' },
  poison:     { name: 'Poison',      multiplier: 0.6, effect: 'poison' },
  steal:      { name: 'Steal',       multiplier: 0.5, effect: 'steal_gold' },
  curse:      { name: 'Curse',       multiplier: 0.7, effect: 'lower_atk' },
  slam:       { name: 'Slam',        multiplier: 1.6 },
  firebreath: { name: 'Fire Breath', multiplier: 1.8 },
};

// ---- RARITIES ----
const _rw = RANDOM_CONFIG.loot.rarityWeights;
const RARITIES = [
  { name: 'Common',    cssClass: 'rarity-common',    color: '#ccc',    multiplier: 1.0, weight: _rw.Common },
  { name: 'Uncommon',  cssClass: 'rarity-uncommon',  color: '#4fc3f7', multiplier: 1.3, weight: _rw.Uncommon },
  { name: 'Rare',      cssClass: 'rarity-rare',      color: '#ab47bc', multiplier: 1.7, weight: _rw.Rare },
  { name: 'Epic',      cssClass: 'rarity-epic',      color: '#ffa726', multiplier: 2.2, weight: _rw.Epic },
  { name: 'Legendary', cssClass: 'rarity-legendary', color: '#ffd700', multiplier: 3.0, weight: _rw.Legendary },
];

const RARITY_LOOKUP = RARITIES.reduce((acc, rarity) => {
  acc[rarity.name] = rarity;
  return acc;
}, {});

function createGearList(slot, icon, entries) {
  return entries.map(entry => ({
    ...entry,
    slot,
    icon,
    baseAtk: entry.baseAtk ?? 0,
    baseDef: entry.baseDef ?? 0,
    weight: entry.weight ?? (RARITY_LOOKUP[entry.rarity]?.weight ?? 1),
  }));
}

const ITEM_LIBRARY = {
  sword: createGearList('weapon', 'sword', [
    { name: 'Rusty Shiv', rarity: 'Common', level: 1, baseAtk: 3 },
    { name: 'Copper Dagger', rarity: 'Common', level: 2, baseAtk: 4 },
    { name: 'Scrap Axe', rarity: 'Common', level: 3, baseAtk: 5 },
    { name: 'Rebar Club', rarity: 'Common', level: 4, baseAtk: 6, baseDef: 1 },
    { name: 'Iron Shortsword', rarity: 'Common', level: 5, baseAtk: 7 },
    { name: 'Tempered Rod', rarity: 'Uncommon', level: 6, baseAtk: 8 },
    { name: 'Serrated Baton', rarity: 'Uncommon', level: 7, baseAtk: 9 },
    { name: 'Carbon Spear', rarity: 'Uncommon', level: 8, baseAtk: 10, baseDef: 1 },
    { name: 'Twin Cleavers', rarity: 'Rare', level: 9, baseAtk: 11 },
    { name: 'Storm Falchion', rarity: 'Rare', level: 10, baseAtk: 12 },
    { name: 'Chainbreaker Axe', rarity: 'Rare', level: 11, baseAtk: 13, baseDef: 1 },
    { name: 'Volt Edge', rarity: 'Rare', level: 12, baseAtk: 14 },
    { name: 'Neon Katana', rarity: 'Epic', level: 13, baseAtk: 15 },
    { name: 'Solar Halberd', rarity: 'Epic', level: 14, baseAtk: 16, baseDef: 1 },
    { name: 'Tempest Claymore', rarity: 'Epic', level: 15, baseAtk: 17 },
    { name: 'Graviton Pike', rarity: 'Legendary', level: 16, baseAtk: 19, baseDef: 1 },
    { name: 'Phantom Rapier', rarity: 'Legendary', level: 17, baseAtk: 20 },
    { name: 'Apex Warstaff', rarity: 'Legendary', level: 18, baseAtk: 21 },
    { name: 'Singularity Edge', rarity: 'Legendary', level: 19, baseAtk: 23 },
    { name: 'Cosmic Guillotine', rarity: 'Legendary', level: 20, baseAtk: 25, baseDef: 2 },
  ]),
  shield: createGearList('shield', 'shield', [
    { name: 'Splintered Plank', rarity: 'Common', level: 1, baseDef: 3 },
    { name: 'Tin Buckler', rarity: 'Common', level: 2, baseDef: 4 },
    { name: 'Patchwork Guard', rarity: 'Common', level: 3, baseDef: 5 },
    { name: 'Riveted Disc', rarity: 'Common', level: 4, baseDef: 6 },
    { name: 'Bronze Kite Shield', rarity: 'Uncommon', level: 5, baseDef: 7 },
    { name: 'Chainmail Barrier', rarity: 'Uncommon', level: 6, baseDef: 8 },
    { name: 'Iron Tower Shield', rarity: 'Uncommon', level: 7, baseDef: 9 },
    { name: 'Reinforced Pavise', rarity: 'Rare', level: 8, baseDef: 10 },
    { name: 'Shock Bumper', rarity: 'Rare', level: 9, baseDef: 11, baseAtk: 1 },
    { name: 'Mirror Aegis', rarity: 'Rare', level: 10, baseDef: 12 },
    { name: 'Bulwark of Cogs', rarity: 'Rare', level: 11, baseDef: 13 },
    { name: 'Helios Ward', rarity: 'Epic', level: 12, baseDef: 14 },
    { name: 'Stormbreaker Rampart', rarity: 'Epic', level: 13, baseDef: 15 },
    { name: 'Dragon Spine Shield', rarity: 'Epic', level: 14, baseDef: 16 },
    { name: 'Obsidian Bulwark', rarity: 'Legendary', level: 15, baseDef: 17 },
    { name: 'Nova Barrier', rarity: 'Legendary', level: 16, baseDef: 18 },
    { name: 'Eternity Wall', rarity: 'Legendary', level: 17, baseDef: 19 },
    { name: 'Voidcarapace', rarity: 'Legendary', level: 18, baseDef: 20 },
    { name: 'Celestial Rampart', rarity: 'Legendary', level: 19, baseDef: 21 },
    { name: 'Infinity Guard', rarity: 'Legendary', level: 20, baseDef: 23 },
  ]),
  helmet: createGearList('helmet', 'helmet', [
    { name: 'Frayed Bandana', rarity: 'Common', level: 1, baseDef: 2 },
    { name: 'Cloth Cap', rarity: 'Common', level: 2, baseDef: 2 },
    { name: 'Leather Hood', rarity: 'Common', level: 3, baseDef: 3 },
    { name: 'Welded Visor', rarity: 'Common', level: 4, baseDef: 4 },
    { name: 'Scrap Helm', rarity: 'Common', level: 5, baseDef: 4, baseAtk: 1 },
    { name: 'Chainmail Cowl', rarity: 'Uncommon', level: 6, baseDef: 5 },
    { name: 'Iron Dome', rarity: 'Uncommon', level: 7, baseDef: 6 },
    { name: 'Carbon Mask', rarity: 'Uncommon', level: 8, baseDef: 6, baseAtk: 1 },
    { name: 'Tactical Goggles', rarity: 'Rare', level: 9, baseDef: 7 },
    { name: 'Hazard Rebreather', rarity: 'Rare', level: 10, baseDef: 8 },
    { name: 'Sentinel Helm', rarity: 'Rare', level: 11, baseDef: 9 },
    { name: 'Aurora Crown', rarity: 'Rare', level: 12, baseDef: 9, baseAtk: 1 },
    { name: 'Stormcall Circlet', rarity: 'Epic', level: 13, baseDef: 10 },
    { name: 'Dragon Crest Helm', rarity: 'Epic', level: 14, baseDef: 11 },
    { name: 'Vanguard Visage', rarity: 'Epic', level: 15, baseDef: 12 },
    { name: 'Celestial Veil', rarity: 'Legendary', level: 16, baseDef: 13 },
    { name: 'Phoenix Halo', rarity: 'Legendary', level: 17, baseDef: 14 },
    { name: 'Void Prophet Hood', rarity: 'Legendary', level: 18, baseDef: 15 },
    { name: 'Astral Mindguard', rarity: 'Legendary', level: 19, baseDef: 16 },
    { name: 'Infinity Circlet', rarity: 'Legendary', level: 20, baseDef: 17, baseAtk: 2 },
  ]),
  armor: createGearList('armor', 'armor', [
    { name: 'Tattered Vest', rarity: 'Common', level: 1, baseDef: 4 },
    { name: 'Scrap Leathers', rarity: 'Common', level: 2, baseDef: 5 },
    { name: 'Patchwork Coat', rarity: 'Common', level: 3, baseDef: 6 },
    { name: 'Street Brigandine', rarity: 'Common', level: 4, baseDef: 7 },
    { name: 'Chainmail Vest', rarity: 'Common', level: 5, baseDef: 8 },
    { name: 'Iron Carapace', rarity: 'Uncommon', level: 6, baseDef: 9 },
    { name: 'Reinforced Jacket', rarity: 'Uncommon', level: 7, baseDef: 9, baseAtk: 1 },
    { name: 'Alloy Breastplate', rarity: 'Uncommon', level: 8, baseDef: 10 },
    { name: 'Composite Harness', rarity: 'Rare', level: 9, baseDef: 11 },
    { name: 'Dynamo Mail', rarity: 'Rare', level: 10, baseDef: 12 },
    { name: 'Riot Gear Hauberk', rarity: 'Rare', level: 11, baseDef: 13 },
    { name: 'Arctic Exo-Shell', rarity: 'Rare', level: 12, baseDef: 14 },
    { name: 'Solar Scale Armor', rarity: 'Epic', level: 13, baseDef: 15 },
    { name: 'Thunderborn Plate', rarity: 'Epic', level: 14, baseDef: 16 },
    { name: 'Obsidian Warplate', rarity: 'Epic', level: 15, baseDef: 17 },
    { name: 'Voidwoven Raiment', rarity: 'Legendary', level: 16, baseDef: 18 },
    { name: 'Phoenix Bodyguard', rarity: 'Legendary', level: 17, baseDef: 19 },
    { name: 'Celestial Bulwark Suit', rarity: 'Legendary', level: 18, baseDef: 20 },
    { name: 'Eternium Aegis Frame', rarity: 'Legendary', level: 19, baseDef: 21 },
    { name: 'Singularity Battlesuit', rarity: 'Legendary', level: 20, baseDef: 23, baseAtk: 1 },
  ]),
  boots: createGearList('boots', 'boots', [
    { name: 'Cracked Sandals', rarity: 'Common', level: 1, baseDef: 1 },
    { name: 'Street Sneakers', rarity: 'Common', level: 2, baseDef: 1 },
    { name: 'Reinforced Work Boots', rarity: 'Common', level: 3, baseDef: 2 },
    { name: 'Courier Striders', rarity: 'Common', level: 4, baseDef: 2, baseAtk: 1 },
    { name: 'Chain-Lashed Greaves', rarity: 'Common', level: 5, baseDef: 3 },
    { name: 'Iron March Boots', rarity: 'Uncommon', level: 6, baseDef: 3, baseAtk: 1 },
    { name: 'Shock Dampers', rarity: 'Uncommon', level: 7, baseDef: 4 },
    { name: 'Carbon Skates', rarity: 'Uncommon', level: 8, baseDef: 4, baseAtk: 1 },
    { name: 'Scout Talons', rarity: 'Rare', level: 9, baseDef: 5 },
    { name: 'Dynamo Greaves', rarity: 'Rare', level: 10, baseDef: 5, baseAtk: 1 },
    { name: 'Meteor Treads', rarity: 'Rare', level: 11, baseDef: 6 },
    { name: 'Stormsurge Boots', rarity: 'Rare', level: 12, baseDef: 6, baseAtk: 1 },
    { name: 'Phoenix Spurs', rarity: 'Epic', level: 13, baseDef: 7, baseAtk: 1 },
    { name: 'Grav-null Boots', rarity: 'Epic', level: 14, baseDef: 7 },
    { name: 'Tempest Striders', rarity: 'Epic', level: 15, baseDef: 8 },
    { name: 'Voidstep Boots', rarity: 'Legendary', level: 16, baseDef: 8, baseAtk: 2 },
    { name: 'Celestial Walkers', rarity: 'Legendary', level: 17, baseDef: 9 },
    { name: 'Chrono Greaves', rarity: 'Legendary', level: 18, baseDef: 9, baseAtk: 1 },
    { name: 'Rift Sabatons', rarity: 'Legendary', level: 19, baseDef: 10 },
    { name: 'Infinity Marchers', rarity: 'Legendary', level: 20, baseDef: 11, baseAtk: 2 },
  ]),
  ring: createGearList('accessory', 'ring', [
    { name: 'Copper Ring', rarity: 'Common', level: 1, baseAtk: 1 },
    { name: 'Wired Loop', rarity: 'Common', level: 2, baseAtk: 1, baseDef: 1 },
    { name: 'Scrap Charm', rarity: 'Common', level: 3, baseAtk: 1, baseDef: 1 },
    { name: 'Fiber Bracelet', rarity: 'Common', level: 4, baseAtk: 2, baseDef: 1 },
    { name: 'Chainlink Pendant', rarity: 'Common', level: 5, baseAtk: 2, baseDef: 1 },
    { name: 'Silver Band', rarity: 'Uncommon', level: 6, baseAtk: 2, baseDef: 2 },
    { name: 'Static Anklet', rarity: 'Uncommon', level: 7, baseAtk: 3, baseDef: 1 },
    { name: 'Neon Choker', rarity: 'Uncommon', level: 8, baseAtk: 3, baseDef: 2 },
    { name: 'Dynamo Locket', rarity: 'Rare', level: 9, baseAtk: 4, baseDef: 2 },
    { name: 'Quartz Signet', rarity: 'Rare', level: 10, baseAtk: 4, baseDef: 3 },
    { name: 'Reactor Torque', rarity: 'Rare', level: 11, baseAtk: 5, baseDef: 2 },
    { name: 'Stormcall Ring', rarity: 'Rare', level: 12, baseAtk: 5, baseDef: 3 },
    { name: 'Phoenix Emblem', rarity: 'Epic', level: 13, baseAtk: 6, baseDef: 3 },
    { name: 'Void Harmonizer', rarity: 'Epic', level: 14, baseAtk: 6, baseDef: 4 },
    { name: 'Celestial Prism', rarity: 'Epic', level: 15, baseAtk: 7, baseDef: 4 },
    { name: 'Chrono Loop', rarity: 'Legendary', level: 16, baseAtk: 8, baseDef: 4 },
    { name: 'Nova Signet', rarity: 'Legendary', level: 17, baseAtk: 8, baseDef: 5 },
    { name: 'Infinity Anklet', rarity: 'Legendary', level: 18, baseAtk: 9, baseDef: 5 },
    { name: 'Singularity Charm', rarity: 'Legendary', level: 19, baseAtk: 10, baseDef: 5 },
    { name: 'Paradox Halo', rarity: 'Legendary', level: 20, baseAtk: 11, baseDef: 6 },
  ]),
};

// ---- PUBLIC FUNCTIONS ----

export function expForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function scaleMonster(monsterId, areaLevel) {
  const base = MONSTERS[monsterId];
  if (!base) return null;
  const cfg = RANDOM_CONFIG.monsterScaling;
  const scale = 1 + (areaLevel - 1) * cfg.scaleFactor;
  return {
    id: monsterId,
    name: base.name,
    sprite: base.sprite,
    maxHp: Math.floor(base.baseHp * scale),
    hp: Math.floor(base.baseHp * scale),
    atk: Math.floor(base.baseAtk * scale),
    def: Math.floor(base.baseDef * scale),
    exp: Math.floor(base.baseExp * scale),
    gold: Math.floor(base.baseGold * scale) + Math.floor(Math.random() * cfg.goldSpawnVariance),
    skills: base.skills,
    dropTable: base.dropTable,
    level: areaLevel,
  };
}

const POTION_TIERS = [
  { name: 'Small Medkit', baseHeal: 35 },
  { name: 'Field Syringe', baseHeal: 55 },
  { name: 'Combat Stims', baseHeal: 75 },
  { name: 'Mega Infusion', baseHeal: 100 },
  { name: 'Phoenix Serum', baseHeal: 130 },
];

function pickFromLibrary(pool, targetLevel) {
  if (!pool || pool.length === 0) return null;
  const weighted = pool.map(item => {
    const levelDiff = Math.abs(item.level - targetLevel);
    const levelWeight = Math.max(1, 18 - levelDiff * 2);
    return { item, weight: (item.weight || 1) * levelWeight };
  });
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return weighted[weighted.length - 1].item;
}

function buildGearDrop(template, monsterLevel, dropType) {
  const rarityData = RARITY_LOOKUP[template.rarity] || RARITIES[0];
  const baseLevelFactor = 1 + template.level * 0.05;
  const adaptFactor = 1 + Math.max(0, monsterLevel - template.level) * 0.04;
  const atk = template.baseAtk > 0
    ? Math.max(0, Math.round(template.baseAtk * baseLevelFactor * adaptFactor * rarityData.multiplier))
    : 0;
  const def = template.baseDef > 0
    ? Math.max(0, Math.round(template.baseDef * baseLevelFactor * adaptFactor * rarityData.multiplier))
    : 0;
  const effectiveLevel = Math.max(template.level, monsterLevel);

  return {
    id: uid(),
    name: template.name,
    type: dropType,
    slot: template.slot,
    level: effectiveLevel,
    rarity: template.rarity,
    rarityClass: rarityData.cssClass,
    rarityColor: rarityData.color,
    atk,
    def,
    icon: template.icon,
    sellPrice: Math.max(10, Math.floor((atk + def) * 4 + effectiveLevel * 3 + rarityData.multiplier * 10)),
  };
}

export function generateItem(dropType, monsterLevel) {
  if (dropType === 'potion') {
    const rarity = pickWeighted(RARITIES);
    const tierIndex = Math.min(POTION_TIERS.length - 1, Math.floor(monsterLevel / 4));
    const tier = POTION_TIERS[tierIndex];
    const healAmount = Math.floor(tier.baseHeal + monsterLevel * 4 * rarity.multiplier);
    return {
      id: uid(),
      name: tier.name,
      type: 'potion',
      slot: null,
      level: Math.max(1, monsterLevel),
      rarity: rarity.name,
      rarityClass: rarity.cssClass,
      rarityColor: rarity.color,
      healAmount,
      icon: 'potion',
      sellPrice: Math.floor(healAmount * 0.6),
    };
  }

  const pool = ITEM_LIBRARY[dropType];
  if (!pool) return null;
  const template = pickFromLibrary(pool, monsterLevel);
  if (!template) return null;

  return buildGearDrop(template, monsterLevel, dropType);
}

export function getShopItems(playerLevel) {
  const tierIndex = Math.min(POTION_TIERS.length - 1, Math.floor(playerLevel / 4));
  const start = Math.max(0, tierIndex - 1);
  const end = Math.min(POTION_TIERS.length - 1, start + 2);
  const normalizedStart = Math.max(0, end - 2);
  const tiers = POTION_TIERS.slice(normalizedStart, end + 1);

  return tiers.map((tier, offset) => {
    const absoluteIdx = normalizedStart + offset;
    const rarity = RARITIES[Math.min(RARITIES.length - 1, absoluteIdx)];
    const effectiveLevel = Math.max(1, absoluteIdx * 4 + 1);
    const healAmount = Math.floor(tier.baseHeal + playerLevel * 3 + absoluteIdx * 10);
    const buyPrice = Math.floor(healAmount * 1.4 + effectiveLevel * 5);

    return {
      id: uid(),
      name: tier.name,
      type: 'potion',
      slot: null,
      level: effectiveLevel,
      rarity: rarity.name,
      rarityClass: rarity.cssClass,
      rarityColor: rarity.color,
      healAmount,
      icon: 'potion',
      buyPrice,
      sellPrice: Math.floor(healAmount * 0.6),
    };
  });
}

export function rollDrop(dropTable, monsterLevel) {
  if (!dropTable || dropTable.length === 0) return null;
  if (Math.random() > RANDOM_CONFIG.loot.monsterDropChance) return null;
  const drop = pickWeighted(dropTable);
  return generateItem(drop.type, monsterLevel);
}

export function calcDamage(atk, def) {
  const cfg = RANDOM_CONFIG.battle;
  const base = Math.max(1, atk - def * 0.5);
  const variance = cfg.damageVarianceLow + Math.random() * cfg.damageVarianceRange;
  return Math.max(1, Math.floor(base * variance));
}

export const EXPLORE_TEXTS = {
  street: [
    'Neon signs buzz overhead as you weave between rusted cars...',
    'A busted hydrant steams, bathing the block in hazy pink light...',
    'You sidestep shattered glass and listen for skittering claws...',
    'Graffiti tags glow faintly under ultraviolet lamps...',
    'The hum of distant transformers blankets the asphalt...',
  ],
  alley: [
    'Water drips from fire escapes onto the cracked pavement...',
    'Dumpster fires flicker against the brick walls...',
    'You pass overturned crates and torn tarps fluttering like ghosts...',
    'Echoes bounce between walls, masking careful footsteps...',
    'A chain-link gate creaks somewhere deeper in the maze...',
  ],
  sewer: [
    'Bioluminescent mold coats the curved walls in sickly blue...',
    'You wade through ankle-deep runoff that reeks of copper...',
    'Mushroom caps the size of dinner plates sprout from cracks...',
    'Spores drift lazily in the stale underground air...',
    'A distant drip echoes through the pipe network like a heartbeat...',
  ],
  station: [
    'The underpass lights flicker, revealing streaks of neon slime...',
    'Broken railcars loom like beasts in the dim glow...',
    'You follow old maintenance lines painted across concrete...',
    'Vents exhale metallic air that smells of ozone...',
    'The distant rumble of trains that no longer run shakes dust loose...',
  ],
  rooftop: [
    'Wind howls between aerials and satellite dishes...',
    'You leap rooftop gaps, scanning for hostile silhouettes...',
    'Glass gardens glimmer beside jury-rigged antenna towers...',
    'Warning strobes pulse red, painting the skyline...',
    'You duck behind a billboard as drones buzz overhead...',
  ],
  crypt: [
    'Corroded security drones line the walls like standing coffins...',
    'Your boots crunch on old circuit boards littering the floor...',
    'Flickering emergency strips paint everything in dim red...',
    'A cold draft carries the smell of ozone and rust...',
    'Bone-white support beams arch overhead like ribs of a beast...',
  ],
  industrial: [
    'Conveyor belts sit silent beneath layers of grime...',
    'You squeeze between shipping containers stained with chemicals...',
    'Loose chains rattle as steam hisses from cracked pipes...',
    'Old forklifts rest like sleeping beasts in the dark...',
    'Puddles of toxic runoff glow faint green under the moon...',
  ],
  bazaar: [
    'Holographic stall signs flicker and glitch mid-sentence...',
    'Phantom merchants hawk wares that phase in and out of reality...',
    'Data streams cascade down invisible walls like digital rain...',
    'The floor shifts between tile and pure static under your feet...',
    'Corrupted price tags display impossible numbers...',
  ],
  reactor: [
    'Radiation warnings blare from speakers caked in rust...',
    'The air itself hums with raw electromagnetic energy...',
    'Fusion coils tower overhead, still pulsing with faint light...',
    'Heat waves distort your vision as you pass venting shafts...',
    'Scorch marks trace the path of something massive on the walls...',
  ],
};
