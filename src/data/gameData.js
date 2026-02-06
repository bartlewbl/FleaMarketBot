// All game data: locations, monsters, items, skills

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
export const LOCATIONS = [
  {
    id: 'neon-mile', name: 'Neon Mile',
    description: 'Flickering billboards and cracked asphalt full of gutter pests.',
    levelReq: 1,
    monsters: ['rat', 'slime', 'sewer-roach', 'stray-cat', 'neon-beetle', 'alley-mutt', 'junk-spider', 'rust-moth', 'grime-crawler', 'pixel-pest'],
    encounterRate: 0.5, lootRate: 0.2, bgKey: 'street',
    boss: 'boss-king-rat', bossRate: 0.005,
  },
  {
    id: 'shadow-alley', name: 'Shadow Alley',
    description: 'Tight passages where feral vagrants lurk between dumpsters.',
    levelReq: 3,
    monsters: ['rat', 'vagrant', 'slime', 'shadow-bat', 'dumpster-snake', 'gutter-goblin', 'alley-wolf', 'trash-golem', 'sewer-lurker', 'neon-phantom', 'wire-rat'],
    encounterRate: 0.55, lootRate: 0.2, bgKey: 'alley',
    boss: 'boss-shadow-lord', bossRate: 0.005,
  },
  {
    id: 'metro-underpass', name: 'Metro Underpass',
    description: 'Abandoned train tunnels dripping with mutant slime.',
    levelReq: 6,
    monsters: ['slime', 'alpha-rat', 'rogue-vagrant', 'tunnel-bat', 'rail-wraith', 'metro-snake', 'pipe-golem', 'sludge-slime', 'volt-spider', 'rust-skeleton', 'signal-ghost'],
    encounterRate: 0.6, lootRate: 0.25, bgKey: 'station',
    boss: 'boss-conductor', bossRate: 0.005,
  },
  {
    id: 'skyline-rooftops', name: 'Skyline Rooftops',
    description: 'Windy roofs patrolled by organized scavenger crews.',
    levelReq: 10,
    monsters: ['vagrant', 'rogue-vagrant', 'alpha-rat', 'sky-hawk', 'roof-stalker', 'antenna-golem', 'wind-phantom', 'drone-wasp', 'scaffold-wolf', 'neon-gargoyle', 'rooftop-sniper', 'sky-serpent'],
    encounterRate: 0.65, lootRate: 0.3, bgKey: 'rooftop',
    boss: 'boss-storm-sentinel', bossRate: 0.005,
  },
  {
    id: 'ironworks-yard', name: 'Ironworks Yard',
    description: 'Industrial lots buzzing with toxic runoff and slime.',
    levelReq: 14,
    monsters: ['toxic-slime', 'rogue-vagrant', 'alpha-rat', 'forge-elemental', 'scrap-golem', 'molten-slime', 'factory-drone', 'acid-sprayer', 'iron-wolf', 'chain-wraith', 'furnace-bat', 'steam-skeleton'],
    encounterRate: 0.7, lootRate: 0.35, bgKey: 'industrial',
    boss: 'boss-iron-titan', bossRate: 0.005,
  },
  {
    id: 'midnight-terminal', name: 'Midnight Terminal',
    description: 'Final stop where bold-face enforcers push back the grime.',
    levelReq: 18,
    monsters: ['rogue-vagrant', 'toxic-slime', 'terminal-enforcer', 'midnight-wolf', 'phantom-conductor', 'glitch-golem', 'void-slime', 'dark-assassin', 'shadow-dragon', 'neon-reaper'],
    encounterRate: 0.72, lootRate: 0.4, bgKey: 'station',
    boss: 'boss-void-overlord', bossRate: 0.005,
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

  // ---- NEON MILE ENEMIES (Lv.1 area) ----
  'sewer-roach': {
    name: 'Sewer Roach', sprite: 'rat', baseHp: 18, baseAtk: 4, baseDef: 1,
    baseExp: 10, baseGold: 4, skills: ['sting'],
    dropTable: [{ type: 'potion', weight: 40 }, { type: 'boots', weight: 5 }],
  },
  'stray-cat': {
    name: 'Stray Cat', sprite: 'rat', baseHp: 20, baseAtk: 6, baseDef: 1,
    baseExp: 11, baseGold: 5, skills: ['scratch'],
    dropTable: [{ type: 'potion', weight: 35 }, { type: 'ring', weight: 6 }],
  },
  'neon-beetle': {
    name: 'Neon Beetle', sprite: 'rat', baseHp: 16, baseAtk: 3, baseDef: 3,
    baseExp: 9, baseGold: 5, skills: [],
    dropTable: [{ type: 'potion', weight: 40 }, { type: 'helmet', weight: 5 }],
  },
  'alley-mutt': {
    name: 'Alley Mutt', sprite: 'wolf', baseHp: 26, baseAtk: 7, baseDef: 2,
    baseExp: 14, baseGold: 7, skills: ['bite'],
    dropTable: [{ type: 'potion', weight: 30 }, { type: 'boots', weight: 8 }, { type: 'sword', weight: 5 }],
  },
  'junk-spider': {
    name: 'Junk Spider', sprite: 'rat', baseHp: 15, baseAtk: 5, baseDef: 1,
    baseExp: 10, baseGold: 4, skills: ['web'],
    dropTable: [{ type: 'potion', weight: 40 }, { type: 'ring', weight: 4 }],
  },
  'rust-moth': {
    name: 'Rust Moth', sprite: 'bat', baseHp: 14, baseAtk: 4, baseDef: 0,
    baseExp: 8, baseGold: 3, skills: ['screech'],
    dropTable: [{ type: 'potion', weight: 45 }],
  },
  'grime-crawler': {
    name: 'Grime Crawler', sprite: 'snake', baseHp: 20, baseAtk: 5, baseDef: 2,
    baseExp: 11, baseGold: 6, skills: ['poison'],
    dropTable: [{ type: 'potion', weight: 35 }, { type: 'boots', weight: 6 }],
  },
  'pixel-pest': {
    name: 'Pixel Pest', sprite: 'slime', baseHp: 12, baseAtk: 3, baseDef: 0,
    baseExp: 7, baseGold: 3, skills: [],
    dropTable: [{ type: 'potion', weight: 50 }],
  },

  // ---- SHADOW ALLEY ENEMIES (Lv.3 area) ----
  'shadow-bat': {
    name: 'Shadow Bat', sprite: 'bat', baseHp: 24, baseAtk: 8, baseDef: 2,
    baseExp: 18, baseGold: 9, skills: ['screech', 'bite'],
    dropTable: [{ type: 'potion', weight: 30 }, { type: 'helmet', weight: 8 }],
  },
  'dumpster-snake': {
    name: 'Dumpster Snake', sprite: 'snake', baseHp: 28, baseAtk: 9, baseDef: 3,
    baseExp: 20, baseGold: 10, skills: ['venom', 'bite'],
    dropTable: [{ type: 'potion', weight: 30 }, { type: 'ring', weight: 7 }, { type: 'boots', weight: 6 }],
  },
  'gutter-goblin': {
    name: 'Gutter Goblin', sprite: 'goblin', baseHp: 30, baseAtk: 10, baseDef: 3,
    baseExp: 22, baseGold: 12, skills: ['slash', 'steal'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'helmet', weight: 7 }, { type: 'potion', weight: 25 }],
  },
  'alley-wolf': {
    name: 'Alley Wolf', sprite: 'wolf', baseHp: 32, baseAtk: 11, baseDef: 4,
    baseExp: 24, baseGold: 13, skills: ['bite', 'howl'],
    dropTable: [{ type: 'armor', weight: 7 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 25 }],
  },
  'trash-golem': {
    name: 'Trash Golem', sprite: 'golem', baseHp: 42, baseAtk: 8, baseDef: 6,
    baseExp: 26, baseGold: 14, skills: ['bash'],
    dropTable: [{ type: 'shield', weight: 10 }, { type: 'armor', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  'sewer-lurker': {
    name: 'Sewer Lurker', sprite: 'snake', baseHp: 26, baseAtk: 10, baseDef: 3,
    baseExp: 19, baseGold: 11, skills: ['poison'],
    dropTable: [{ type: 'potion', weight: 35 }, { type: 'ring', weight: 5 }],
  },
  'neon-phantom': {
    name: 'Neon Phantom', sprite: 'ghost', baseHp: 22, baseAtk: 12, baseDef: 2,
    baseExp: 21, baseGold: 10, skills: ['curse', 'drain'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'potion', weight: 30 }],
  },
  'wire-rat': {
    name: 'Wire Rat', sprite: 'rat', baseHp: 25, baseAtk: 9, baseDef: 2,
    baseExp: 17, baseGold: 9, skills: ['shock', 'bite'],
    dropTable: [{ type: 'potion', weight: 30 }, { type: 'ring', weight: 6 }],
  },

  // ---- METRO UNDERPASS ENEMIES (Lv.6 area) ----
  'tunnel-bat': {
    name: 'Tunnel Bat', sprite: 'bat', baseHp: 32, baseAtk: 13, baseDef: 4,
    baseExp: 28, baseGold: 15, skills: ['screech', 'drain'],
    dropTable: [{ type: 'potion', weight: 25 }, { type: 'helmet', weight: 10 }],
  },
  'rail-wraith': {
    name: 'Rail Wraith', sprite: 'ghost', baseHp: 38, baseAtk: 15, baseDef: 5,
    baseExp: 34, baseGold: 18, skills: ['curse', 'drain'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'sword', weight: 8 }, { type: 'potion', weight: 22 }],
  },
  'metro-snake': {
    name: 'Metro Snake', sprite: 'snake', baseHp: 35, baseAtk: 14, baseDef: 4,
    baseExp: 30, baseGold: 16, skills: ['venom', 'slash'],
    dropTable: [{ type: 'potion', weight: 28 }, { type: 'boots', weight: 8 }, { type: 'ring', weight: 6 }],
  },
  'pipe-golem': {
    name: 'Pipe Golem', sprite: 'golem', baseHp: 55, baseAtk: 12, baseDef: 8,
    baseExp: 36, baseGold: 20, skills: ['bash', 'slam'],
    dropTable: [{ type: 'shield', weight: 12 }, { type: 'armor', weight: 10 }, { type: 'potion', weight: 18 }],
  },
  'sludge-slime': {
    name: 'Sludge Slime', sprite: 'slime', baseHp: 40, baseAtk: 11, baseDef: 5,
    baseExp: 30, baseGold: 15, skills: ['poison'],
    dropTable: [{ type: 'potion', weight: 35 }, { type: 'ring', weight: 6 }],
  },
  'volt-spider': {
    name: 'Volt Spider', sprite: 'rat', baseHp: 30, baseAtk: 16, baseDef: 3,
    baseExp: 32, baseGold: 17, skills: ['shock', 'web'],
    dropTable: [{ type: 'ring', weight: 9 }, { type: 'potion', weight: 28 }],
  },
  'rust-skeleton': {
    name: 'Rust Skeleton', sprite: 'skeleton', baseHp: 42, baseAtk: 14, baseDef: 6,
    baseExp: 33, baseGold: 18, skills: ['slash', 'curse'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'shield', weight: 8 }, { type: 'potion', weight: 22 }],
  },
  'signal-ghost': {
    name: 'Signal Ghost', sprite: 'ghost', baseHp: 34, baseAtk: 15, baseDef: 4,
    baseExp: 31, baseGold: 16, skills: ['shock', 'curse'],
    dropTable: [{ type: 'ring', weight: 8 }, { type: 'helmet', weight: 7 }, { type: 'potion', weight: 25 }],
  },

  // ---- SKYLINE ROOFTOPS ENEMIES (Lv.10 area) ----
  'sky-hawk': {
    name: 'Sky Hawk', sprite: 'bat', baseHp: 44, baseAtk: 20, baseDef: 6,
    baseExp: 42, baseGold: 22, skills: ['slash', 'screech'],
    dropTable: [{ type: 'helmet', weight: 10 }, { type: 'boots', weight: 9 }, { type: 'potion', weight: 22 }],
  },
  'roof-stalker': {
    name: 'Roof Stalker', sprite: 'vagrant', baseHp: 50, baseAtk: 22, baseDef: 7,
    baseExp: 46, baseGold: 25, skills: ['backstab', 'steal'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  'antenna-golem': {
    name: 'Antenna Golem', sprite: 'golem', baseHp: 70, baseAtk: 16, baseDef: 10,
    baseExp: 48, baseGold: 26, skills: ['shock', 'bash'],
    dropTable: [{ type: 'shield', weight: 12 }, { type: 'armor', weight: 10 }, { type: 'potion', weight: 16 }],
  },
  'wind-phantom': {
    name: 'Wind Phantom', sprite: 'ghost', baseHp: 40, baseAtk: 23, baseDef: 5,
    baseExp: 44, baseGold: 23, skills: ['curse', 'drain'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'potion', weight: 25 }],
  },
  'drone-wasp': {
    name: 'Drone Wasp', sprite: 'bat', baseHp: 38, baseAtk: 21, baseDef: 5,
    baseExp: 40, baseGold: 22, skills: ['sting', 'poison'],
    dropTable: [{ type: 'potion', weight: 28 }, { type: 'boots', weight: 8 }, { type: 'ring', weight: 6 }],
  },
  'scaffold-wolf': {
    name: 'Scaffold Wolf', sprite: 'wolf', baseHp: 52, baseAtk: 20, baseDef: 8,
    baseExp: 45, baseGold: 24, skills: ['bite', 'howl', 'charge'],
    dropTable: [{ type: 'armor', weight: 9 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 22 }],
  },
  'neon-gargoyle': {
    name: 'Neon Gargoyle', sprite: 'golem', baseHp: 58, baseAtk: 19, baseDef: 9,
    baseExp: 47, baseGold: 25, skills: ['slam', 'screech'],
    dropTable: [{ type: 'shield', weight: 10 }, { type: 'helmet', weight: 9 }, { type: 'potion', weight: 18 }],
  },
  'rooftop-sniper': {
    name: 'Rooftop Sniper', sprite: 'vagrant', baseHp: 42, baseAtk: 25, baseDef: 5,
    baseExp: 44, baseGold: 24, skills: ['backstab'],
    dropTable: [{ type: 'sword', weight: 12 }, { type: 'ring', weight: 7 }, { type: 'potion', weight: 20 }],
  },
  'sky-serpent': {
    name: 'Sky Serpent', sprite: 'snake', baseHp: 48, baseAtk: 21, baseDef: 7,
    baseExp: 43, baseGold: 23, skills: ['venom', 'charge'],
    dropTable: [{ type: 'ring', weight: 8 }, { type: 'boots', weight: 7 }, { type: 'potion', weight: 25 }],
  },

  // ---- IRONWORKS YARD ENEMIES (Lv.14 area) ----
  'forge-elemental': {
    name: 'Forge Elemental', sprite: 'slime', baseHp: 62, baseAtk: 24, baseDef: 8,
    baseExp: 55, baseGold: 30, skills: ['firebreath', 'slam'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  'scrap-golem': {
    name: 'Scrap Golem', sprite: 'golem', baseHp: 80, baseAtk: 20, baseDef: 12,
    baseExp: 58, baseGold: 32, skills: ['bash', 'slam', 'charge'],
    dropTable: [{ type: 'shield', weight: 12 }, { type: 'armor', weight: 10 }, { type: 'potion', weight: 16 }],
  },
  'molten-slime': {
    name: 'Molten Slime', sprite: 'slime', baseHp: 55, baseAtk: 22, baseDef: 7,
    baseExp: 52, baseGold: 28, skills: ['firebreath', 'poison'],
    dropTable: [{ type: 'potion', weight: 28 }, { type: 'ring', weight: 8 }, { type: 'armor', weight: 6 }],
  },
  'factory-drone': {
    name: 'Factory Drone', sprite: 'bat', baseHp: 48, baseAtk: 26, baseDef: 7,
    baseExp: 54, baseGold: 29, skills: ['shock', 'charge'],
    dropTable: [{ type: 'helmet', weight: 9 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 22 }],
  },
  'acid-sprayer': {
    name: 'Acid Sprayer', sprite: 'snake', baseHp: 50, baseAtk: 23, baseDef: 6,
    baseExp: 52, baseGold: 27, skills: ['venom', 'screech'],
    dropTable: [{ type: 'potion', weight: 25 }, { type: 'ring', weight: 8 }, { type: 'boots', weight: 7 }],
  },
  'iron-wolf': {
    name: 'Iron Wolf', sprite: 'wolf', baseHp: 65, baseAtk: 24, baseDef: 10,
    baseExp: 56, baseGold: 30, skills: ['bite', 'charge', 'howl'],
    dropTable: [{ type: 'armor', weight: 10 }, { type: 'sword', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  'chain-wraith': {
    name: 'Chain Wraith', sprite: 'ghost', baseHp: 52, baseAtk: 25, baseDef: 7,
    baseExp: 54, baseGold: 28, skills: ['curse', 'drain', 'slash'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'sword', weight: 8 }, { type: 'potion', weight: 20 }],
  },
  'furnace-bat': {
    name: 'Furnace Bat', sprite: 'bat', baseHp: 45, baseAtk: 27, baseDef: 6,
    baseExp: 53, baseGold: 28, skills: ['firebreath', 'screech'],
    dropTable: [{ type: 'helmet', weight: 9 }, { type: 'potion', weight: 25 }],
  },
  'steam-skeleton': {
    name: 'Steam Skeleton', sprite: 'skeleton', baseHp: 58, baseAtk: 23, baseDef: 9,
    baseExp: 55, baseGold: 29, skills: ['slash', 'bash', 'curse'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'shield', weight: 9 }, { type: 'potion', weight: 18 }],
  },

  // ---- MIDNIGHT TERMINAL ENEMIES (Lv.18 area) ----
  'terminal-enforcer': {
    name: 'Terminal Enforcer', sprite: 'vagrant', baseHp: 72, baseAtk: 28, baseDef: 10,
    baseExp: 65, baseGold: 35, skills: ['slash', 'bash', 'charge'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'armor', weight: 9 }, { type: 'potion', weight: 18 }],
  },
  'midnight-wolf': {
    name: 'Midnight Wolf', sprite: 'wolf', baseHp: 70, baseAtk: 27, baseDef: 11,
    baseExp: 63, baseGold: 34, skills: ['bite', 'howl', 'frenzy'],
    dropTable: [{ type: 'armor', weight: 10 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 18 }],
  },
  'phantom-conductor': {
    name: 'Phantom Conductor', sprite: 'ghost', baseHp: 60, baseAtk: 30, baseDef: 8,
    baseExp: 66, baseGold: 35, skills: ['shock', 'curse', 'drain'],
    dropTable: [{ type: 'ring', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 18 }],
  },
  'glitch-golem': {
    name: 'Glitch Golem', sprite: 'golem', baseHp: 90, baseAtk: 24, baseDef: 14,
    baseExp: 68, baseGold: 36, skills: ['slam', 'shock', 'bash'],
    dropTable: [{ type: 'shield', weight: 12 }, { type: 'armor', weight: 10 }, { type: 'potion', weight: 15 }],
  },
  'void-slime': {
    name: 'Void Slime', sprite: 'slime', baseHp: 65, baseAtk: 26, baseDef: 9,
    baseExp: 64, baseGold: 33, skills: ['drain', 'poison', 'curse'],
    dropTable: [{ type: 'ring', weight: 9 }, { type: 'potion', weight: 25 }],
  },
  'dark-assassin': {
    name: 'Dark Assassin', sprite: 'vagrant', baseHp: 55, baseAtk: 32, baseDef: 7,
    baseExp: 67, baseGold: 36, skills: ['backstab', 'steal', 'slash'],
    dropTable: [{ type: 'sword', weight: 12 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 18 }],
  },
  'shadow-dragon': {
    name: 'Shadow Dragon', sprite: 'dragon', baseHp: 85, baseAtk: 30, baseDef: 12,
    baseExp: 72, baseGold: 40, skills: ['firebreath', 'slash', 'charge'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'armor', weight: 10 }, { type: 'shield', weight: 8 }, { type: 'potion', weight: 15 }],
  },
  'neon-reaper': {
    name: 'Neon Reaper', sprite: 'skeleton', baseHp: 68, baseAtk: 31, baseDef: 9,
    baseExp: 70, baseGold: 38, skills: ['curse', 'drain', 'slash'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'ring', weight: 9 }, { type: 'potion', weight: 18 }],
  },
};

// ---- BOSSES ----
export const BOSSES = {
  'boss-king-rat': {
    name: 'King Rat', sprite: 'rat', isBoss: true, baseHp: 120, baseAtk: 14, baseDef: 5,
    baseExp: 80, baseGold: 50, skills: ['bite', 'screech', 'frenzy'],
    dropTable: [{ type: 'sword', weight: 15 }, { type: 'armor', weight: 12 }, { type: 'ring', weight: 10 }, { type: 'potion', weight: 20 }],
    title: 'Monarch of the Gutter',
  },
  'boss-shadow-lord': {
    name: 'Shadow Lord', sprite: 'vagrant', isBoss: true, baseHp: 180, baseAtk: 22, baseDef: 8,
    baseExp: 150, baseGold: 90, skills: ['shadowstrike', 'curse', 'drain'],
    dropTable: [{ type: 'sword', weight: 12 }, { type: 'armor', weight: 12 }, { type: 'ring', weight: 10 }, { type: 'shield', weight: 8 }, { type: 'potion', weight: 18 }],
    title: 'Lord of the Dark Alleys',
  },
  'boss-conductor': {
    name: 'The Conductor', sprite: 'ghost', isBoss: true, baseHp: 250, baseAtk: 28, baseDef: 10,
    baseExp: 240, baseGold: 140, skills: ['shock', 'thunderclap', 'drain', 'curse'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 15 }],
    title: 'Spectral Master of the Rails',
  },
  'boss-storm-sentinel': {
    name: 'Storm Sentinel', sprite: 'golem', isBoss: true, baseHp: 340, baseAtk: 34, baseDef: 14,
    baseExp: 350, baseGold: 200, skills: ['thunderclap', 'slam', 'charge', 'roar'],
    dropTable: [{ type: 'shield', weight: 12 }, { type: 'armor', weight: 12 }, { type: 'helmet', weight: 10 }, { type: 'sword', weight: 8 }, { type: 'potion', weight: 12 }],
    title: 'Guardian of the Skyline',
  },
  'boss-iron-titan': {
    name: 'Iron Titan', sprite: 'golem', isBoss: true, baseHp: 450, baseAtk: 40, baseDef: 18,
    baseExp: 480, baseGold: 280, skills: ['ironcrush', 'firebreath', 'slam', 'charge'],
    dropTable: [{ type: 'armor', weight: 12 }, { type: 'sword', weight: 12 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 10 }],
    title: 'Colossus of the Ironworks',
  },
  'boss-void-overlord': {
    name: 'Void Overlord', sprite: 'dragon', isBoss: true, baseHp: 600, baseAtk: 48, baseDef: 20,
    baseExp: 650, baseGold: 400, skills: ['voidblast', 'inferno', 'deathgrip', 'frenzy'],
    dropTable: [{ type: 'sword', weight: 10 }, { type: 'armor', weight: 10 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 8 }],
    title: 'Final Terminus Overlord',
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
  // New skills for expanded enemy roster
  sting:      { name: 'Sting',       multiplier: 1.2 },
  scratch:    { name: 'Scratch',     multiplier: 1.1 },
  web:        { name: 'Web',         multiplier: 0.5, effect: 'lower_def' },
  howl:       { name: 'Howl',        multiplier: 0.9, effect: 'lower_atk' },
  drain:      { name: 'Drain',       multiplier: 1.0, effect: 'drain_hp' },
  venom:      { name: 'Venom',       multiplier: 0.8, effect: 'poison' },
  shock:      { name: 'Shock',       multiplier: 1.5 },
  backstab:   { name: 'Backstab',    multiplier: 1.7 },
  bash:       { name: 'Bash',        multiplier: 1.4 },
  roar:       { name: 'Roar',        multiplier: 0.6, effect: 'lower_atk' },
  frenzy:     { name: 'Frenzy',      multiplier: 1.9 },
  charge:     { name: 'Charge',      multiplier: 1.6 },
  shadowstrike: { name: 'Shadow Strike', multiplier: 1.8 },
  inferno:    { name: 'Inferno',     multiplier: 2.0 },
  voidblast:  { name: 'Void Blast',  multiplier: 2.2 },
  ironcrush:  { name: 'Iron Crush',  multiplier: 1.7 },
  thunderclap: { name: 'Thunderclap', multiplier: 1.9, effect: 'lower_def' },
  deathgrip:  { name: 'Death Grip',  multiplier: 1.5, effect: 'poison' },
};

// ---- RARITIES ----
const RARITIES = [
  { name: 'Common',    cssClass: 'rarity-common',    color: '#ccc',    multiplier: 1.0, weight: 60 },
  { name: 'Uncommon',  cssClass: 'rarity-uncommon',  color: '#4fc3f7', multiplier: 1.3, weight: 25 },
  { name: 'Rare',      cssClass: 'rarity-rare',      color: '#ab47bc', multiplier: 1.7, weight: 10 },
  { name: 'Epic',      cssClass: 'rarity-epic',      color: '#ffa726', multiplier: 2.2, weight: 4 },
  { name: 'Legendary', cssClass: 'rarity-legendary', color: '#ffd700', multiplier: 3.0, weight: 1 },
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
    { name: 'Rusty Shiv', rarity: 'Uncommon', level: 1, baseAtk: 3 },
    { name: 'Copper Dagger', rarity: 'Common', level: 2, baseAtk: 4 },
    { name: 'Scrap Axe', rarity: 'Rare', level: 3, baseAtk: 5 },
    { name: 'Rebar Club', rarity: 'Common', level: 4, baseAtk: 6, baseDef: 1 },
    { name: 'Iron Shortsword', rarity: 'Epic', level: 5, baseAtk: 7 },
    { name: 'Tempered Rod', rarity: 'Common', level: 6, baseAtk: 8 },
    { name: 'Serrated Baton', rarity: 'Legendary', level: 7, baseAtk: 9 },
    { name: 'Carbon Spear', rarity: 'Rare', level: 8, baseAtk: 10, baseDef: 1 },
    { name: 'Twin Cleavers', rarity: 'Common', level: 9, baseAtk: 11 },
    { name: 'Storm Falchion', rarity: 'Uncommon', level: 10, baseAtk: 12 },
    { name: 'Chainbreaker Axe', rarity: 'Epic', level: 11, baseAtk: 13, baseDef: 1 },
    { name: 'Volt Edge', rarity: 'Common', level: 12, baseAtk: 14 },
    { name: 'Neon Katana', rarity: 'Legendary', level: 13, baseAtk: 15 },
    { name: 'Solar Halberd', rarity: 'Uncommon', level: 14, baseAtk: 16, baseDef: 1 },
    { name: 'Tempest Claymore', rarity: 'Rare', level: 15, baseAtk: 17 },
    { name: 'Graviton Pike', rarity: 'Common', level: 16, baseAtk: 19, baseDef: 1 },
    { name: 'Phantom Rapier', rarity: 'Epic', level: 17, baseAtk: 20 },
    { name: 'Apex Warstaff', rarity: 'Rare', level: 18, baseAtk: 21 },
    { name: 'Singularity Edge', rarity: 'Uncommon', level: 19, baseAtk: 23 },
    { name: 'Cosmic Guillotine', rarity: 'Epic', level: 20, baseAtk: 25, baseDef: 2 },
    // Offensive strategy: glass-cannon weapons with high ATK, no DEF
    { name: 'Plasma Cutter', rarity: 'Legendary', level: 2, baseAtk: 5 },
    { name: 'Voltage Switchblade', rarity: 'Rare', level: 5, baseAtk: 9 },
    { name: 'Overclocked Cleaver', rarity: 'Epic', level: 8, baseAtk: 13 },
    { name: 'Berserker Maul', rarity: 'Common', level: 11, baseAtk: 15 },
    { name: 'Crimson Buzzsaw', rarity: 'Uncommon', level: 14, baseAtk: 19 },
    { name: 'Wrath of Neon', rarity: 'Rare', level: 16, baseAtk: 21 },
    { name: 'Oblivion Reaver', rarity: 'Common', level: 18, baseAtk: 24 },
    { name: 'Doomsday Splicer', rarity: 'Uncommon', level: 20, baseAtk: 28 },
    // Rarity-decoupled: high-level commons, low-level legendaries, mixed combos
    { name: 'Concrete Greatsword', rarity: 'Common', level: 15, baseAtk: 14 },
    { name: 'Gridline Machete', rarity: 'Common', level: 18, baseAtk: 16 },
    { name: 'Rusted Titan Blade', rarity: 'Common', level: 20, baseAtk: 18 },
    { name: 'Neon Whisper', rarity: 'Legendary', level: 3, baseAtk: 4 },
    { name: 'Chrono Fang', rarity: 'Legendary', level: 6, baseAtk: 6 },
    { name: 'Spectral Tanto', rarity: 'Rare', level: 2, baseAtk: 3 },
    { name: 'Glitch Knife', rarity: 'Epic', level: 4, baseAtk: 5 },
    { name: 'Salvaged Vorpal Edge', rarity: 'Uncommon', level: 16, baseAtk: 15 },
  ]),
  shield: createGearList('shield', 'shield', [
    { name: 'Splintered Plank', rarity: 'Rare', level: 1, baseDef: 3 },
    { name: 'Tin Buckler', rarity: 'Common', level: 2, baseDef: 4 },
    { name: 'Patchwork Guard', rarity: 'Epic', level: 3, baseDef: 5 },
    { name: 'Riveted Disc', rarity: 'Common', level: 4, baseDef: 6 },
    { name: 'Bronze Kite Shield', rarity: 'Legendary', level: 5, baseDef: 7 },
    { name: 'Chainmail Barrier', rarity: 'Common', level: 6, baseDef: 8 },
    { name: 'Iron Tower Shield', rarity: 'Uncommon', level: 7, baseDef: 9 },
    { name: 'Reinforced Pavise', rarity: 'Common', level: 8, baseDef: 10 },
    { name: 'Shock Bumper', rarity: 'Epic', level: 9, baseDef: 11, baseAtk: 1 },
    { name: 'Mirror Aegis', rarity: 'Rare', level: 10, baseDef: 12 },
    { name: 'Bulwark of Cogs', rarity: 'Uncommon', level: 11, baseDef: 13 },
    { name: 'Helios Ward', rarity: 'Legendary', level: 12, baseDef: 14 },
    { name: 'Stormbreaker Rampart', rarity: 'Common', level: 13, baseDef: 15 },
    { name: 'Dragon Spine Shield', rarity: 'Rare', level: 14, baseDef: 16 },
    { name: 'Obsidian Bulwark', rarity: 'Uncommon', level: 15, baseDef: 17 },
    { name: 'Nova Barrier', rarity: 'Epic', level: 16, baseDef: 18 },
    { name: 'Eternity Wall', rarity: 'Common', level: 17, baseDef: 19 },
    { name: 'Voidcarapace', rarity: 'Rare', level: 18, baseDef: 20 },
    { name: 'Celestial Rampart', rarity: 'Uncommon', level: 19, baseDef: 21 },
    { name: 'Infinity Guard', rarity: 'Legendary', level: 20, baseDef: 23 },
    // Defensive strategy: ultra-tank shields with boosted DEF
    { name: 'Junkyard Barricade', rarity: 'Epic', level: 1, baseDef: 4 },
    { name: 'Scrapwall Gate', rarity: 'Uncommon', level: 3, baseDef: 6 },
    { name: 'Titanium Kiteshield', rarity: 'Legendary', level: 6, baseDef: 10 },
    { name: 'Hardlight Projector', rarity: 'Common', level: 9, baseDef: 13 },
    { name: 'Fortress Matrix', rarity: 'Uncommon', level: 12, baseDef: 16 },
    { name: 'Impenetrable Ward', rarity: 'Common', level: 15, baseDef: 19 },
    { name: 'Dimensional Barricade', rarity: 'Rare', level: 18, baseDef: 22 },
    { name: 'Absolute Zero Wall', rarity: 'Epic', level: 20, baseDef: 25 },
    // Rarity-decoupled shields
    { name: 'Blast Door Fragment', rarity: 'Common', level: 16, baseDef: 14 },
    { name: 'Manhole Cover Shield', rarity: 'Common', level: 19, baseDef: 16 },
    { name: 'Scrap Titan Shield', rarity: 'Common', level: 20, baseDef: 17 },
    { name: 'Pixelated Ward', rarity: 'Legendary', level: 2, baseDef: 3 },
    { name: 'Data Lattice Buckler', rarity: 'Legendary', level: 5, baseDef: 5 },
    { name: 'Hologram Deflector', rarity: 'Epic', level: 3, baseDef: 4 },
    { name: 'Corroded Riot Shield', rarity: 'Uncommon', level: 17, baseDef: 14 },
  ]),
  helmet: createGearList('helmet', 'helmet', [
    { name: 'Frayed Bandana', rarity: 'Common', level: 1, baseDef: 2 },
    { name: 'Cloth Cap', rarity: 'Legendary', level: 2, baseDef: 2 },
    { name: 'Leather Hood', rarity: 'Uncommon', level: 3, baseDef: 3 },
    { name: 'Welded Visor', rarity: 'Rare', level: 4, baseDef: 4 },
    { name: 'Scrap Helm', rarity: 'Common', level: 5, baseDef: 4, baseAtk: 1 },
    { name: 'Chainmail Cowl', rarity: 'Epic', level: 6, baseDef: 5 },
    { name: 'Iron Dome', rarity: 'Common', level: 7, baseDef: 6 },
    { name: 'Carbon Mask', rarity: 'Legendary', level: 8, baseDef: 6, baseAtk: 1 },
    { name: 'Tactical Goggles', rarity: 'Uncommon', level: 9, baseDef: 7 },
    { name: 'Hazard Rebreather', rarity: 'Common', level: 10, baseDef: 8 },
    { name: 'Sentinel Helm', rarity: 'Rare', level: 11, baseDef: 9 },
    { name: 'Aurora Crown', rarity: 'Epic', level: 12, baseDef: 9, baseAtk: 1 },
    { name: 'Stormcall Circlet', rarity: 'Common', level: 13, baseDef: 10 },
    { name: 'Dragon Crest Helm', rarity: 'Uncommon', level: 14, baseDef: 11 },
    { name: 'Vanguard Visage', rarity: 'Rare', level: 15, baseDef: 12 },
    { name: 'Celestial Veil', rarity: 'Uncommon', level: 16, baseDef: 13 },
    { name: 'Phoenix Halo', rarity: 'Epic', level: 17, baseDef: 14 },
    { name: 'Void Prophet Hood', rarity: 'Common', level: 18, baseDef: 15 },
    { name: 'Astral Mindguard', rarity: 'Rare', level: 19, baseDef: 16 },
    { name: 'Infinity Circlet', rarity: 'Legendary', level: 20, baseDef: 17, baseAtk: 2 },
    // Offensive strategy: ATK-focused headgear for aggressive builds
    { name: 'Targeting Visor', rarity: 'Rare', level: 2, baseAtk: 2, baseDef: 1 },
    { name: 'Neural Amp Helm', rarity: 'Epic', level: 5, baseAtk: 3, baseDef: 2 },
    { name: 'Fury Circuit Crown', rarity: 'Common', level: 9, baseAtk: 5, baseDef: 3 },
    { name: 'Warhead Casing', rarity: 'Uncommon', level: 13, baseAtk: 7, baseDef: 4 },
    { name: 'Berserker Faceplate', rarity: 'Common', level: 16, baseAtk: 9, baseDef: 4 },
    { name: 'Annihilator Helm', rarity: 'Rare', level: 20, baseAtk: 11, baseDef: 5 },
    // Rarity-decoupled helmets
    { name: 'Welder\'s Full Mask', rarity: 'Common', level: 14, baseDef: 9 },
    { name: 'Hardhat Mk-IX', rarity: 'Common', level: 18, baseDef: 12 },
    { name: 'Concrete Cranium', rarity: 'Common', level: 20, baseDef: 13 },
    { name: 'Glitchborn Tiara', rarity: 'Legendary', level: 2, baseDef: 2, baseAtk: 1 },
    { name: 'Flickering Diadem', rarity: 'Legendary', level: 5, baseDef: 3, baseAtk: 2 },
    { name: 'Cracked Oracle Visor', rarity: 'Epic', level: 4, baseDef: 3, baseAtk: 1 },
    { name: 'Makeshift Cage Helm', rarity: 'Uncommon', level: 15, baseDef: 10 },
  ]),
  armor: createGearList('armor', 'armor', [
    { name: 'Tattered Vest', rarity: 'Uncommon', level: 1, baseDef: 4 },
    { name: 'Scrap Leathers', rarity: 'Common', level: 2, baseDef: 5 },
    { name: 'Patchwork Coat', rarity: 'Legendary', level: 3, baseDef: 6 },
    { name: 'Street Brigandine', rarity: 'Rare', level: 4, baseDef: 7 },
    { name: 'Chainmail Vest', rarity: 'Common', level: 5, baseDef: 8 },
    { name: 'Iron Carapace', rarity: 'Epic', level: 6, baseDef: 9 },
    { name: 'Reinforced Jacket', rarity: 'Common', level: 7, baseDef: 9, baseAtk: 1 },
    { name: 'Alloy Breastplate', rarity: 'Uncommon', level: 8, baseDef: 10 },
    { name: 'Composite Harness', rarity: 'Legendary', level: 9, baseDef: 11 },
    { name: 'Dynamo Mail', rarity: 'Common', level: 10, baseDef: 12 },
    { name: 'Riot Gear Hauberk', rarity: 'Uncommon', level: 11, baseDef: 13 },
    { name: 'Arctic Exo-Shell', rarity: 'Rare', level: 12, baseDef: 14 },
    { name: 'Solar Scale Armor', rarity: 'Common', level: 13, baseDef: 15 },
    { name: 'Thunderborn Plate', rarity: 'Rare', level: 14, baseDef: 16 },
    { name: 'Obsidian Warplate', rarity: 'Uncommon', level: 15, baseDef: 17 },
    { name: 'Voidwoven Raiment', rarity: 'Epic', level: 16, baseDef: 18 },
    { name: 'Phoenix Bodyguard', rarity: 'Rare', level: 17, baseDef: 19 },
    { name: 'Celestial Bulwark Suit', rarity: 'Common', level: 18, baseDef: 20 },
    { name: 'Eternium Aegis Frame', rarity: 'Epic', level: 19, baseDef: 21 },
    { name: 'Singularity Battlesuit', rarity: 'Legendary', level: 20, baseDef: 23, baseAtk: 1 },
    // Defensive strategy: ultra-tank armor with boosted DEF
    { name: 'Lead-Lined Poncho', rarity: 'Rare', level: 2, baseDef: 6 },
    { name: 'Riot Suppression Suit', rarity: 'Legendary', level: 6, baseDef: 11 },
    { name: 'Neutronium Plate', rarity: 'Common', level: 10, baseDef: 15 },
    { name: 'Monolith Exoskeleton', rarity: 'Uncommon', level: 14, baseDef: 19 },
    { name: 'Event Horizon Shell', rarity: 'Common', level: 18, baseDef: 23 },
    { name: 'Omega Fortress Armor', rarity: 'Epic', level: 20, baseDef: 26 },
    // Rarity-decoupled armor
    { name: 'Industrial Coveralls', rarity: 'Common', level: 15, baseDef: 13 },
    { name: 'Sewer Plate Carrier', rarity: 'Common', level: 19, baseDef: 16 },
    { name: 'Forklift Exo-Rig', rarity: 'Common', level: 20, baseDef: 17 },
    { name: 'Phantom Weave Vest', rarity: 'Legendary', level: 3, baseDef: 4 },
    { name: 'Starthread Robe', rarity: 'Legendary', level: 6, baseDef: 6 },
    { name: 'Wraithcloth Tunic', rarity: 'Epic', level: 4, baseDef: 5 },
    { name: 'Surplus Combat Jacket', rarity: 'Uncommon', level: 17, baseDef: 15 },
  ]),
  boots: createGearList('boots', 'boots', [
    { name: 'Cracked Sandals', rarity: 'Epic', level: 1, baseDef: 1 },
    { name: 'Street Sneakers', rarity: 'Common', level: 2, baseDef: 1 },
    { name: 'Reinforced Work Boots', rarity: 'Uncommon', level: 3, baseDef: 2 },
    { name: 'Courier Striders', rarity: 'Legendary', level: 4, baseDef: 2, baseAtk: 1 },
    { name: 'Chain-Lashed Greaves', rarity: 'Common', level: 5, baseDef: 3 },
    { name: 'Iron March Boots', rarity: 'Rare', level: 6, baseDef: 3, baseAtk: 1 },
    { name: 'Shock Dampers', rarity: 'Common', level: 7, baseDef: 4 },
    { name: 'Carbon Skates', rarity: 'Epic', level: 8, baseDef: 4, baseAtk: 1 },
    { name: 'Scout Talons', rarity: 'Common', level: 9, baseDef: 5 },
    { name: 'Dynamo Greaves', rarity: 'Legendary', level: 10, baseDef: 5, baseAtk: 1 },
    { name: 'Meteor Treads', rarity: 'Uncommon', level: 11, baseDef: 6 },
    { name: 'Stormsurge Boots', rarity: 'Rare', level: 12, baseDef: 6, baseAtk: 1 },
    { name: 'Phoenix Spurs', rarity: 'Common', level: 13, baseDef: 7, baseAtk: 1 },
    { name: 'Grav-null Boots', rarity: 'Uncommon', level: 14, baseDef: 7 },
    { name: 'Tempest Striders', rarity: 'Rare', level: 15, baseDef: 8 },
    { name: 'Voidstep Boots', rarity: 'Common', level: 16, baseDef: 8, baseAtk: 2 },
    { name: 'Celestial Walkers', rarity: 'Epic', level: 17, baseDef: 9 },
    { name: 'Chrono Greaves', rarity: 'Uncommon', level: 18, baseDef: 9, baseAtk: 1 },
    { name: 'Rift Sabatons', rarity: 'Rare', level: 19, baseDef: 10 },
    { name: 'Infinity Marchers', rarity: 'Legendary', level: 20, baseDef: 11, baseAtk: 2 },
    // Offensive strategy: ATK-focused boots for rush/aggressive play
    { name: 'Spike-Tipped Runners', rarity: 'Epic', level: 3, baseAtk: 2, baseDef: 1 },
    { name: 'Blitz Stompers', rarity: 'Legendary', level: 7, baseAtk: 3, baseDef: 2 },
    { name: 'Razor Striders', rarity: 'Common', level: 10, baseAtk: 4, baseDef: 3 },
    { name: 'Assault Thrusters', rarity: 'Uncommon', level: 14, baseAtk: 5, baseDef: 4 },
    { name: 'Havoc Tramples', rarity: 'Rare', level: 17, baseAtk: 6, baseDef: 5 },
    { name: 'Annihilation Treads', rarity: 'Common', level: 20, baseAtk: 8, baseDef: 5 },
    // Rarity-decoupled boots
    { name: 'Steel-Toed Waders', rarity: 'Common', level: 14, baseDef: 6 },
    { name: 'Foundry Stompers', rarity: 'Common', level: 18, baseDef: 8 },
    { name: 'Concrete Crushers', rarity: 'Common', level: 20, baseDef: 9 },
    { name: 'Phantom Step Wraps', rarity: 'Legendary', level: 2, baseDef: 1, baseAtk: 1 },
    { name: 'Holo-Sprint Anklets', rarity: 'Legendary', level: 5, baseDef: 2, baseAtk: 2 },
    { name: 'Flickerstep Sandals', rarity: 'Epic', level: 3, baseDef: 2, baseAtk: 1 },
    { name: 'Patched Running Shoes', rarity: 'Uncommon', level: 16, baseDef: 7 },
  ]),
  ring: createGearList('accessory', 'ring', [
    { name: 'Copper Ring', rarity: 'Legendary', level: 1, baseAtk: 1 },
    { name: 'Wired Loop', rarity: 'Rare', level: 2, baseAtk: 1, baseDef: 1 },
    { name: 'Scrap Charm', rarity: 'Common', level: 3, baseAtk: 1, baseDef: 1 },
    { name: 'Fiber Bracelet', rarity: 'Epic', level: 4, baseAtk: 2, baseDef: 1 },
    { name: 'Chainlink Pendant', rarity: 'Common', level: 5, baseAtk: 2, baseDef: 1 },
    { name: 'Silver Band', rarity: 'Common', level: 6, baseAtk: 2, baseDef: 2 },
    { name: 'Static Anklet', rarity: 'Rare', level: 7, baseAtk: 3, baseDef: 1 },
    { name: 'Neon Choker', rarity: 'Legendary', level: 8, baseAtk: 3, baseDef: 2 },
    { name: 'Dynamo Locket', rarity: 'Common', level: 9, baseAtk: 4, baseDef: 2 },
    { name: 'Quartz Signet', rarity: 'Uncommon', level: 10, baseAtk: 4, baseDef: 3 },
    { name: 'Reactor Torque', rarity: 'Epic', level: 11, baseAtk: 5, baseDef: 2 },
    { name: 'Stormcall Ring', rarity: 'Common', level: 12, baseAtk: 5, baseDef: 3 },
    { name: 'Phoenix Emblem', rarity: 'Uncommon', level: 13, baseAtk: 6, baseDef: 3 },
    { name: 'Void Harmonizer', rarity: 'Rare', level: 14, baseAtk: 6, baseDef: 4 },
    { name: 'Celestial Prism', rarity: 'Common', level: 15, baseAtk: 7, baseDef: 4 },
    { name: 'Chrono Loop', rarity: 'Rare', level: 16, baseAtk: 8, baseDef: 4 },
    { name: 'Nova Signet', rarity: 'Uncommon', level: 17, baseAtk: 8, baseDef: 5 },
    { name: 'Infinity Anklet', rarity: 'Epic', level: 18, baseAtk: 9, baseDef: 5 },
    { name: 'Singularity Charm', rarity: 'Uncommon', level: 19, baseAtk: 10, baseDef: 5 },
    { name: 'Paradox Halo', rarity: 'Legendary', level: 20, baseAtk: 11, baseDef: 6 },
    // Offensive strategy: ATK-heavy accessories for glass cannon builds
    { name: 'Jagged Tooth Necklace', rarity: 'Rare', level: 1, baseAtk: 2 },
    { name: 'Voltage Coil', rarity: 'Epic', level: 3, baseAtk: 3 },
    { name: 'Razorwire Bracelet', rarity: 'Legendary', level: 6, baseAtk: 4, baseDef: 1 },
    { name: 'Plasma Core Pendant', rarity: 'Common', level: 9, baseAtk: 6, baseDef: 1 },
    { name: 'Warcry Amplifier', rarity: 'Uncommon', level: 12, baseAtk: 7, baseDef: 2 },
    { name: 'Berserker Torque', rarity: 'Common', level: 15, baseAtk: 9, baseDef: 2 },
    { name: 'Destruction Matrix', rarity: 'Uncommon', level: 18, baseAtk: 11, baseDef: 3 },
    { name: 'Apocalypse Sigil', rarity: 'Rare', level: 20, baseAtk: 13, baseDef: 3 },
    // Defensive strategy: DEF-heavy accessories for tank builds
    { name: 'Iron Wristguard', rarity: 'Epic', level: 2, baseDef: 2, baseAtk: 1 },
    { name: 'Hardened Amulet', rarity: 'Legendary', level: 4, baseDef: 3 },
    { name: 'Dampening Coil', rarity: 'Common', level: 7, baseDef: 4, baseAtk: 1 },
    { name: 'Shield Emitter Band', rarity: 'Uncommon', level: 10, baseDef: 5, baseAtk: 2 },
    { name: 'Aegis Frequency Ring', rarity: 'Common', level: 12, baseDef: 6, baseAtk: 2 },
    { name: 'Bastion Core', rarity: 'Rare', level: 15, baseDef: 7, baseAtk: 3 },
    { name: 'Immortal Shell Locket', rarity: 'Common', level: 18, baseDef: 9, baseAtk: 3 },
    { name: 'Eternity Ward Halo', rarity: 'Uncommon', level: 20, baseDef: 10, baseAtk: 4 },
    // Rarity-decoupled accessories
    { name: 'Bent Nail Pendant', rarity: 'Common', level: 13, baseAtk: 4, baseDef: 3 },
    { name: 'Duct Tape Bracelet', rarity: 'Common', level: 16, baseAtk: 5, baseDef: 4 },
    { name: 'Rebar Knuckle Ring', rarity: 'Common', level: 19, baseAtk: 6, baseDef: 5 },
    { name: 'Junkyard Dog Tags', rarity: 'Common', level: 20, baseAtk: 7, baseDef: 5 },
    { name: 'Glitch Prism', rarity: 'Legendary', level: 1, baseAtk: 1, baseDef: 1 },
    { name: 'Neon Ghost Locket', rarity: 'Legendary', level: 4, baseAtk: 2, baseDef: 1 },
    { name: 'Starfall Shard', rarity: 'Legendary', level: 7, baseAtk: 3, baseDef: 2 },
    { name: 'Wraithbone Charm', rarity: 'Epic', level: 2, baseAtk: 1, baseDef: 1 },
    { name: 'Pixelated Amulet', rarity: 'Epic', level: 5, baseAtk: 2, baseDef: 2 },
    { name: 'Cursed Lucky Penny', rarity: 'Epic', level: 8, baseAtk: 3, baseDef: 2 },
    { name: 'Faded Heirloom Ring', rarity: 'Rare', level: 1, baseAtk: 1 },
    { name: 'Recycled Coil Band', rarity: 'Rare', level: 16, baseAtk: 6, baseDef: 3 },
    { name: 'Jury-Rigged Scope', rarity: 'Uncommon', level: 15, baseAtk: 5, baseDef: 3 },
    { name: 'Cracked Data Chip', rarity: 'Uncommon', level: 18, baseAtk: 6, baseDef: 4 },
  ]),
};

// ---- PUBLIC FUNCTIONS ----

export function expForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function scaleMonster(monsterId, areaLevel) {
  const base = MONSTERS[monsterId];
  if (!base) return null;
  const scale = 1 + (areaLevel - 1) * 0.2;
  return {
    id: monsterId,
    name: base.name,
    sprite: base.sprite,
    maxHp: Math.floor(base.baseHp * scale),
    hp: Math.floor(base.baseHp * scale),
    atk: Math.floor(base.baseAtk * scale),
    def: Math.floor(base.baseDef * scale),
    exp: Math.floor(base.baseExp * scale),
    gold: Math.floor(base.baseGold * scale) + Math.floor(Math.random() * 5),
    skills: base.skills,
    dropTable: base.dropTable,
    level: areaLevel,
  };
}

export function scaleBoss(bossId, areaLevel) {
  const base = BOSSES[bossId];
  if (!base) return null;
  const scale = 1 + (areaLevel - 1) * 0.25;
  return {
    id: bossId,
    name: base.name,
    sprite: base.sprite,
    isBoss: true,
    title: base.title,
    maxHp: Math.floor(base.baseHp * scale),
    hp: Math.floor(base.baseHp * scale),
    atk: Math.floor(base.baseAtk * scale),
    def: Math.floor(base.baseDef * scale),
    exp: Math.floor(base.baseExp * scale),
    gold: Math.floor(base.baseGold * scale) + Math.floor(Math.random() * 15),
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
  const drop = pickWeighted(dropTable);
  return generateItem(drop.type, monsterLevel);
}

// Seeded RNG for deterministic daily results
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seededPickWeighted(items, rng) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function getDailyFeaturedItems(playerLevel) {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rng = seededRandom(daySeed + playerLevel);

  const extraordinaryRarities = RARITIES.filter(r => r.name === 'Rare' || r.name === 'Epic' || r.name === 'Legendary');
  const gearTypes = ['sword', 'shield', 'helmet', 'armor', 'boots', 'ring'];
  const featured = [];
  const usedNames = new Set();

  const count = 3;
  for (let i = 0; i < count; i++) {
    const typeIdx = Math.floor(rng() * gearTypes.length);
    const type = gearTypes[typeIdx];
    const pool = ITEM_LIBRARY[type];
    if (!pool) continue;

    const rarity = seededPickWeighted(extraordinaryRarities, rng);
    const candidates = pool.filter(item => item.rarity === rarity.name && item.level <= Math.max(playerLevel + 3, 5));
    if (candidates.length === 0) continue;

    const template = candidates[Math.floor(rng() * candidates.length)];
    if (usedNames.has(template.name)) continue;
    usedNames.add(template.name);

    const rarityData = RARITY_LOOKUP[template.rarity] || RARITIES[0];
    const baseLevelFactor = 1 + template.level * 0.05;
    const atk = template.baseAtk > 0
      ? Math.max(0, Math.round(template.baseAtk * baseLevelFactor * rarityData.multiplier))
      : 0;
    const def = template.baseDef > 0
      ? Math.max(0, Math.round(template.baseDef * baseLevelFactor * rarityData.multiplier))
      : 0;

    const buyPrice = Math.floor((atk + def) * 8 + template.level * 6 + rarityData.multiplier * 20);

    featured.push({
      id: uid(),
      name: template.name,
      type,
      slot: template.slot,
      level: template.level,
      rarity: template.rarity,
      rarityClass: rarityData.cssClass,
      rarityColor: rarityData.color,
      atk,
      def,
      icon: template.icon,
      buyPrice,
      sellPrice: Math.max(10, Math.floor((atk + def) * 4 + template.level * 3 + rarityData.multiplier * 10)),
    });
  }

  return featured;
}

export function calcDamage(atk, def) {
  const base = Math.max(1, atk - def * 0.5);
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance));
}

// ---- CHARACTER CLASSES ----
export const CHARACTER_CLASSES = {
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'A reckless brawler who trades defense for overwhelming aggression. Grows stronger as HP drops.',
    color: '#ff4444',
    baseStats: { maxHp: 55, maxMana: 15, baseAtk: 8, baseDef: 1 },
    growth: { hp: 10, hpRand: 6, atk: 2, atkRand: 2, def: 1, defRand: 1, mana: 2, manaRand: 2 },
    passive: 'Rage',
    passiveDesc: '+30% ATK when below 40% HP',
    skillName: 'Frenzy',
    skillDesc: '2.0x ATK damage, take 10% max HP recoil',
    skillMultiplier: 2.0,
    skillEffect: 'recoil',
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    description: 'A disciplined fighter with balanced offense and strong defense. Hard to kill.',
    color: '#4488ff',
    baseStats: { maxHp: 65, maxMana: 25, baseAtk: 5, baseDef: 4 },
    growth: { hp: 10, hpRand: 4, atk: 1, atkRand: 2, def: 2, defRand: 2, mana: 3, manaRand: 2 },
    passive: 'Fortify',
    passiveDesc: 'Defend blocks 70% damage instead of 50%',
    skillName: 'Shield Bash',
    skillDesc: '1.4x ATK damage, reduces enemy ATK by 15% for the fight',
    skillMultiplier: 1.4,
    skillEffect: 'weaken',
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    description: 'A cunning rogue who strikes fast and steals more. Higher escape chance and bonus gold.',
    color: '#44dd44',
    baseStats: { maxHp: 42, maxMana: 25, baseAtk: 7, baseDef: 2 },
    growth: { hp: 7, hpRand: 4, atk: 2, atkRand: 2, def: 1, defRand: 1, mana: 3, manaRand: 3 },
    passive: 'Greed',
    passiveDesc: '+25% gold from battles, 75% escape chance',
    skillName: 'Backstab',
    skillDesc: '2.2x ATK damage, ignores 50% of enemy DEF',
    skillMultiplier: 2.2,
    skillEffect: 'pierce',
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'A scholar of arcane arts who channels devastating spells. High mana, fragile body.',
    color: '#bb66ff',
    baseStats: { maxHp: 38, maxMana: 50, baseAtk: 6, baseDef: 1 },
    growth: { hp: 6, hpRand: 3, atk: 2, atkRand: 1, def: 1, defRand: 1, mana: 6, manaRand: 4 },
    passive: 'Arcane Mind',
    passiveDesc: 'Skill attacks deal +40% damage',
    skillName: 'Arcane Blast',
    skillDesc: '1.8x ATK damage, ignores all enemy DEF',
    skillMultiplier: 1.8,
    skillEffect: 'true_damage',
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'A dark caster who siphons life from enemies. Sustains through draining attacks.',
    color: '#cc44cc',
    baseStats: { maxHp: 45, maxMana: 40, baseAtk: 6, baseDef: 2 },
    growth: { hp: 7, hpRand: 4, atk: 1, atkRand: 2, def: 1, defRand: 2, mana: 5, manaRand: 3 },
    passive: 'Lifetap',
    passiveDesc: 'Normal attacks heal 15% of damage dealt',
    skillName: 'Drain Life',
    skillDesc: '1.5x ATK damage, heal 40% of damage dealt',
    skillMultiplier: 1.5,
    skillEffect: 'drain',
  },
};

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
  industrial: [
    'Conveyor belts sit silent beneath layers of grime...',
    'You squeeze between shipping containers stained with chemicals...',
    'Loose chains rattle as steam hisses from cracked pipes...',
    'Old forklifts rest like sleeping beasts in the dark...',
    'Puddles of toxic runoff glow faint green under the moon...',
  ],
};
