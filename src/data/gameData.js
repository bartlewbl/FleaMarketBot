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
    id: 'forest', name: 'Whispering Forest',
    description: 'Dense forest with low-level creatures.',
    levelReq: 1, monsters: ['slime', 'mushroom', 'wolf'],
    encounterRate: 0.6, bgKey: 'forest',
  },
  {
    id: 'cave', name: 'Dark Caverns',
    description: 'Underground tunnels with bats and undead.',
    levelReq: 3, monsters: ['bat', 'skeleton', 'slime'],
    encounterRate: 0.65, bgKey: 'cave',
  },
  {
    id: 'swamp', name: 'Murky Swamp',
    description: 'Foul swamp with goblins and serpents.',
    levelReq: 5, monsters: ['snake', 'goblin', 'mushroom'],
    encounterRate: 0.7, bgKey: 'swamp',
  },
  {
    id: 'ruins', name: 'Ancient Ruins',
    description: 'Crumbling ruins guarded by golems and spirits.',
    levelReq: 8, monsters: ['ghost', 'golem', 'skeleton'],
    encounterRate: 0.7, bgKey: 'ruins',
  },
  {
    id: 'desert', name: 'Scorching Desert',
    description: 'Harsh desert where only the strong survive.',
    levelReq: 12, monsters: ['snake', 'golem', 'goblin'],
    encounterRate: 0.75, bgKey: 'desert',
  },
  {
    id: 'volcano', name: "Dragon's Volcano",
    description: 'Fiery mountain with the deadliest monsters.',
    levelReq: 16, monsters: ['golem', 'dragon', 'ghost'],
    encounterRate: 0.8, bgKey: 'volcano',
  },
];

// ---- MONSTERS ----
const MONSTERS = {
  slime:    { name: 'Green Slime',       sprite: 'slime',    baseHp: 20,  baseAtk: 4,  baseDef: 1,  baseExp: 10, baseGold: 5,  skills: [],            dropTable: [{ type: 'potion', weight: 40 }, { type: 'armor', weight: 5 }] },
  mushroom: { name: 'Toxic Mushroom',    sprite: 'mushroom', baseHp: 15,  baseAtk: 6,  baseDef: 0,  baseExp: 12, baseGold: 6,  skills: ['poison'],    dropTable: [{ type: 'potion', weight: 50 }, { type: 'ring', weight: 3 }] },
  wolf:     { name: 'Shadow Wolf',       sprite: 'wolf',     baseHp: 30,  baseAtk: 8,  baseDef: 2,  baseExp: 18, baseGold: 10, skills: ['bite'],      dropTable: [{ type: 'sword', weight: 8 }, { type: 'boots', weight: 10 }, { type: 'potion', weight: 30 }] },
  bat:      { name: 'Cave Bat',          sprite: 'bat',      baseHp: 18,  baseAtk: 7,  baseDef: 1,  baseExp: 14, baseGold: 7,  skills: ['screech'],   dropTable: [{ type: 'potion', weight: 40 }, { type: 'ring', weight: 5 }] },
  skeleton: { name: 'Skeleton Warrior',  sprite: 'skeleton', baseHp: 40,  baseAtk: 12, baseDef: 5,  baseExp: 28, baseGold: 18, skills: ['slash'],     dropTable: [{ type: 'sword', weight: 12 }, { type: 'shield', weight: 10 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 25 }] },
  goblin:   { name: 'Goblin Thief',      sprite: 'goblin',   baseHp: 35,  baseAtk: 14, baseDef: 4,  baseExp: 32, baseGold: 25, skills: ['steal'],     dropTable: [{ type: 'sword', weight: 10 }, { type: 'armor', weight: 8 }, { type: 'ring', weight: 6 }, { type: 'potion', weight: 30 }] },
  snake:    { name: 'Venom Serpent',      sprite: 'snake',    baseHp: 28,  baseAtk: 16, baseDef: 2,  baseExp: 25, baseGold: 15, skills: ['poison'],    dropTable: [{ type: 'ring', weight: 10 }, { type: 'boots', weight: 8 }, { type: 'potion', weight: 35 }] },
  ghost:    { name: 'Phantom',           sprite: 'ghost',    baseHp: 45,  baseAtk: 18, baseDef: 8,  baseExp: 40, baseGold: 22, skills: ['curse'],     dropTable: [{ type: 'ring', weight: 15 }, { type: 'helmet', weight: 8 }, { type: 'potion', weight: 25 }] },
  golem:    { name: 'Stone Golem',       sprite: 'golem',    baseHp: 70,  baseAtk: 15, baseDef: 15, baseExp: 50, baseGold: 30, skills: ['slam'],      dropTable: [{ type: 'armor', weight: 15 }, { type: 'shield', weight: 12 }, { type: 'helmet', weight: 10 }, { type: 'potion', weight: 20 }] },
  dragon:   { name: 'Fire Drake',        sprite: 'dragon',   baseHp: 100, baseAtk: 25, baseDef: 12, baseExp: 80, baseGold: 60, skills: ['firebreath', 'slash'], dropTable: [{ type: 'sword', weight: 15 }, { type: 'armor', weight: 12 }, { type: 'shield', weight: 10 }, { type: 'ring', weight: 8 }, { type: 'potion', weight: 20 }] },
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
const RARITIES = [
  { name: 'Common',    cssClass: 'rarity-common',    color: '#ccc',    multiplier: 1.0, weight: 60 },
  { name: 'Uncommon',  cssClass: 'rarity-uncommon',  color: '#4fc3f7', multiplier: 1.3, weight: 25 },
  { name: 'Rare',      cssClass: 'rarity-rare',      color: '#ab47bc', multiplier: 1.7, weight: 10 },
  { name: 'Epic',      cssClass: 'rarity-epic',      color: '#ffa726', multiplier: 2.2, weight: 4 },
  { name: 'Legendary', cssClass: 'rarity-legendary', color: '#ffd700', multiplier: 3.0, weight: 1 },
];

// ---- ITEM TEMPLATES ----
const ITEM_TEMPLATES = {
  sword:  { names: ['Rusty Sword','Iron Blade','Steel Saber','War Cleaver','Dragon Fang'],        slot: 'weapon',    baseAtk: 3, baseDef: 0, icon: 'sword' },
  shield: { names: ['Wooden Shield','Iron Buckler','Tower Shield','Knight Guard','Aegis'],         slot: 'shield',    baseAtk: 0, baseDef: 3, icon: 'shield' },
  helmet: { names: ['Leather Cap','Iron Helm','Steel Visor','War Helm','Crown of Might'],          slot: 'helmet',    baseAtk: 0, baseDef: 2, icon: 'helmet' },
  armor:  { names: ['Cloth Tunic','Chain Mail','Plate Armor','War Plate','Dragon Scale'],          slot: 'armor',     baseAtk: 0, baseDef: 4, icon: 'armor' },
  boots:  { names: ['Sandals','Leather Boots','Iron Greaves','Swift Boots','Wind Striders'],       slot: 'boots',     baseAtk: 1, baseDef: 1, icon: 'boots' },
  ring:   { names: ['Copper Ring','Silver Band','Gold Ring','Mystic Loop','Ring of Power'],         slot: 'accessory', baseAtk: 2, baseDef: 1, icon: 'ring' },
  potion: { names: ['Small Potion','Medium Potion','Large Potion','Mega Potion','Elixir'],         slot: null,        healPercent: 0.3, icon: 'potion' },
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

export function generateItem(dropType, monsterLevel) {
  const template = ITEM_TEMPLATES[dropType];
  if (!template) return null;

  const rarity = pickWeighted(RARITIES);
  const rarityIdx = RARITIES.indexOf(rarity);
  const nameIdx = Math.min(rarityIdx, template.names.length - 1);

  if (!template.slot) {
    const healAmount = Math.floor(20 + monsterLevel * 5 * rarity.multiplier);
    return {
      id: uid(), name: template.names[nameIdx], type: dropType,
      slot: null, rarity: rarity.name, rarityClass: rarity.cssClass,
      rarityColor: rarity.color, healAmount, icon: template.icon,
      sellPrice: Math.floor(healAmount * 0.5),
    };
  }

  const levelMod = 1 + monsterLevel * 0.15;
  const atk = template.baseAtk > 0 ? Math.floor(template.baseAtk * rarity.multiplier * levelMod) : 0;
  const def = template.baseDef > 0 ? Math.floor(template.baseDef * rarity.multiplier * levelMod) : 0;

  return {
    id: uid(), name: template.names[nameIdx], type: dropType,
    slot: template.slot, rarity: rarity.name, rarityClass: rarity.cssClass,
    rarityColor: rarity.color, atk, def, icon: template.icon,
    sellPrice: Math.floor((atk + def) * 3 + rarityIdx * 5),
  };
}

export function getShopItems(playerLevel) {
  return [0, 1, 2].map(i => {
    const healAmount = Math.floor(30 + playerLevel * 8 + i * 15);
    return {
      id: uid(),
      name: ['Small Potion', 'Medium Potion', 'Large Potion'][i],
      type: 'potion', slot: null, rarity: 'Common',
      rarityClass: 'rarity-common', rarityColor: '#ccc',
      healAmount, icon: 'potion',
      buyPrice: Math.floor(healAmount * 1.5),
      sellPrice: Math.floor(healAmount * 0.5),
    };
  });
}

export function rollDrop(dropTable, monsterLevel) {
  if (!dropTable || dropTable.length === 0) return null;
  const totalWeight = dropTable.reduce((s, d) => s + d.weight, 0);
  if (Math.random() * 100 >= totalWeight) return null;
  const drop = pickWeighted(dropTable);
  return generateItem(drop.type, monsterLevel);
}

export function calcDamage(atk, def) {
  const base = Math.max(1, atk - def * 0.5);
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance));
}

export const EXPLORE_TEXTS = {
  forest: [
    'You walk through dense undergrowth...',
    'Sunlight filters through the canopy...',
    'You hear rustling in the bushes...',
    'A narrow path winds deeper...',
    'The trees grow thicker ahead...',
  ],
  cave: [
    'Water drips from the ceiling...',
    'The tunnel narrows ahead...',
    'Strange markings cover the wall...',
    'A cold breeze blows from deeper within...',
    'Glowing crystals illuminate the passage...',
  ],
  swamp: [
    'The ground squelches beneath you...',
    'Thick fog rolls across the swamp...',
    'Bubbles rise from murky water...',
    'Dead trees stand like sentinels...',
    'An eerie glow flickers ahead...',
  ],
  ruins: [
    'Crumbling pillars line the hall...',
    'You decipher old runes on stone...',
    'Dust and debris cover the floor...',
    'Cold wind whistles through gaps...',
    'Faded murals depict a lost age...',
  ],
  desert: [
    'The scorching sun beats down...',
    'Sand swirls around your feet...',
    'A mirage shimmers in the distance...',
    'Ancient bones protrude from sand...',
    'The heat is almost unbearable...',
  ],
  volcano: [
    'The ground trembles beneath you...',
    'Rivers of lava flow nearby...',
    'Ash and embers fill the air...',
    'Heat radiates from every surface...',
    'A deep rumbling comes from below...',
  ],
};
