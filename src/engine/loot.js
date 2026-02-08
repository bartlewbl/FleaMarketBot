// Item generation, loot tables, and shop logic
// All item creation logic extracted from gameData.js

import { RARITIES, RARITY_LOOKUP, ITEM_LIBRARY, POTION_TIERS, ENERGY_DRINK_TIERS } from '../data/gameData';
import { MATERIAL_DROP_CONFIG, BUILDING_MATERIALS, CRAFTED_ITEMS, CAMP_LOOT_TABLES, createMaterialItem } from '../data/baseData';
import { uid, pickWeighted, seededRandom, seededPickWeighted } from './utils';

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

  if (dropType === 'energy-drink') {
    const rarity = pickWeighted(RARITIES);
    const tierIndex = Math.min(ENERGY_DRINK_TIERS.length - 1, Math.floor(monsterLevel / 4));
    const tier = ENERGY_DRINK_TIERS[tierIndex];
    const energyAmount = Math.floor(tier.baseEnergy * rarity.multiplier);
    return {
      id: uid(),
      name: tier.name,
      type: 'energy-drink',
      slot: null,
      level: Math.max(1, monsterLevel),
      rarity: rarity.name,
      rarityClass: rarity.cssClass,
      rarityColor: rarity.color,
      energyAmount,
      icon: 'energy-drink',
      sellPrice: Math.floor(energyAmount * 0.8),
    };
  }

  const pool = ITEM_LIBRARY[dropType];
  if (!pool) return null;
  const template = pickFromLibrary(pool, monsterLevel);
  if (!template) return null;

  return buildGearDrop(template, monsterLevel, dropType);
}

export function rollDrop(dropTable, monsterLevel) {
  if (!dropTable || dropTable.length === 0) return null;
  const drop = pickWeighted(dropTable);
  return generateItem(drop.type, monsterLevel);
}

// Generate an item from a daily reward spec: { kind:'item'|'potion', type, rarity, minLevel }
// Picks a random template of the given type + rarity, scaled to player level.
export function generateRewardItem(spec, playerLevel) {
  const effectiveLevel = Math.max(spec.minLevel || 1, playerLevel);

  if (spec.kind === 'potion') {
    const rarityData = RARITY_LOOKUP[spec.rarity] || RARITIES[0];
    const tierIndex = Math.min(POTION_TIERS.length - 1, Math.floor(effectiveLevel / 4));
    const tier = POTION_TIERS[tierIndex];
    const healAmount = Math.floor(tier.baseHeal + effectiveLevel * 4 * rarityData.multiplier);
    return {
      id: uid(),
      name: tier.name,
      type: 'potion',
      slot: null,
      level: effectiveLevel,
      rarity: rarityData.name,
      rarityClass: rarityData.cssClass,
      rarityColor: rarityData.color,
      healAmount,
      icon: 'potion',
      sellPrice: Math.floor(healAmount * 0.6),
    };
  }

  const pool = ITEM_LIBRARY[spec.type];
  if (!pool) return null;

  // Filter to matching rarity candidates near the player's level
  const candidates = pool.filter(t => t.rarity === spec.rarity && t.level <= effectiveLevel + 3);
  const source = candidates.length > 0
    ? candidates
    : pool.filter(t => t.rarity === spec.rarity);
  if (source.length === 0) return generateItem(spec.type, effectiveLevel);

  const template = source[Math.floor(Math.random() * source.length)];
  return buildGearDrop(template, effectiveLevel, spec.type);
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

export function getShopEnergyDrinks(playerLevel) {
  const tierIndex = Math.min(ENERGY_DRINK_TIERS.length - 1, Math.floor(playerLevel / 4));
  const start = Math.max(0, tierIndex - 1);
  const end = Math.min(ENERGY_DRINK_TIERS.length - 1, start + 2);
  const normalizedStart = Math.max(0, end - 2);
  const tiers = ENERGY_DRINK_TIERS.slice(normalizedStart, end + 1);

  return tiers.map((tier, offset) => {
    const absoluteIdx = normalizedStart + offset;
    const rarity = RARITIES[Math.min(RARITIES.length - 1, absoluteIdx)];
    const energyAmount = Math.floor(tier.baseEnergy * rarity.multiplier);
    const buyPrice = Math.floor(energyAmount * 2 + (absoluteIdx + 1) * 8);

    return {
      id: uid(),
      name: tier.name,
      type: 'energy-drink',
      slot: null,
      level: Math.max(1, absoluteIdx * 4 + 1),
      rarity: rarity.name,
      rarityClass: rarity.cssClass,
      rarityColor: rarity.color,
      energyAmount,
      icon: 'energy-drink',
      buyPrice,
      sellPrice: Math.floor(energyAmount * 0.8),
    };
  });
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

// ---- BASE BUILDING: Material drops ----

// Roll for a material drop based on the region the player is in
export function rollMaterialDrop(regionId) {
  const config = MATERIAL_DROP_CONFIG[regionId];
  if (!config) return null;
  if (Math.random() > config.dropRate) return null;

  const totalWeight = config.materials.reduce((s, m) => s + m.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const mat of config.materials) {
    roll -= mat.weight;
    if (roll <= 0) {
      return createMaterialItem(mat.id, 1);
    }
  }
  return createMaterialItem(config.materials[config.materials.length - 1].id, 1);
}

// Generate a crafted item from workshop template
export function generateCraftedItem(templateId, playerLevel) {
  const template = CRAFTED_ITEMS[templateId];
  if (!template) return null;

  const rarityData = RARITY_LOOKUP[template.rarity] || RARITIES[0];
  const levelFactor = 1 + Math.max(template.baseLevel, playerLevel) * 0.05;
  const atk = template.baseAtk > 0
    ? Math.max(0, Math.round(template.baseAtk * levelFactor * rarityData.multiplier))
    : 0;
  const def = template.baseDef > 0
    ? Math.max(0, Math.round(template.baseDef * levelFactor * rarityData.multiplier))
    : 0;
  const effectiveLevel = Math.max(template.baseLevel, playerLevel);

  return {
    id: uid(),
    name: template.name,
    type: template.slot === 'accessory' ? 'ring' : template.slot === 'weapon' ? 'sword' : template.slot,
    slot: template.slot,
    level: effectiveLevel,
    rarity: template.rarity,
    rarityClass: rarityData.cssClass,
    rarityColor: rarityData.color,
    atk,
    def,
    icon: template.slot,
    sellPrice: Math.max(10, Math.floor((atk + def) * 4 + effectiveLevel * 3 + rarityData.multiplier * 10)),
  };
}

// Generate loot from adventure camp mission
export function generateCampLoot(lootTier, playerLevel) {
  const table = CAMP_LOOT_TABLES[lootTier];
  if (!table) return { items: [], gold: 0 };

  const mission = table;
  const results = [];
  const usedIds = new Set();

  for (let i = 0; i < mission.maxItems; i++) {
    const totalWeight = mission.items.reduce((s, item) => s + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of mission.items) {
      roll -= entry.weight;
      if (roll <= 0) {
        if (entry.type === 'material') {
          const qty = entry.qtyRange
            ? entry.qtyRange[0] + Math.floor(Math.random() * (entry.qtyRange[1] - entry.qtyRange[0] + 1))
            : 1;
          results.push(createMaterialItem(entry.id, qty));
        } else if (entry.type === 'gear') {
          const item = generateItem(entry.gearType, playerLevel);
          if (item) results.push(item);
        }
        break;
      }
    }
  }

  return results;
}
