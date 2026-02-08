// Combat calculations - damage formulas, stat modifiers, dodge/HP
// All functions are pure (no side effects), taking player/battle state as arguments.

import { CHARACTER_CLASSES } from '../data/gameData';
import { getTreeSkill } from '../data/skillTrees';

export function calcDamage(atk, def) {
  const base = Math.max(1, atk - def * 0.5);
  const variance = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.floor(base * variance));
}

export function getClassData(player) {
  return player.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;
}

export function playerHasSkill(player, skillId) {
  return (player.skillTree || []).includes(skillId);
}

export function getEffectiveManaCost(player, baseCost) {
  // Mage Mana Surge: skills cost 25% less
  if (playerHasSkill(player, 'mag_t4a')) {
    return Math.floor(baseCost * 0.75);
  }
  return baseCost;
}

export function getPlayerAtk(player, battle) {
  let atk = player.baseAtk;
  for (const item of Object.values(player.equipment)) {
    if (item) atk += (item.atk || 0);
  }
  const cls = getClassData(player);
  // Berserker Rage: +30% ATK when below 40% HP
  if (cls?.passive === 'Rage' && player.hp < player.maxHp * 0.4) {
    atk = Math.floor(atk * 1.3);
  }
  // Blood Frenzy: +3% ATK per 10% HP missing
  if (playerHasSkill(player, 'brs_t1a')) {
    const missingPct = Math.floor((1 - player.hp / player.maxHp) * 10);
    atk = Math.floor(atk * (1 + missingPct * 0.03));
  }
  // War Machine: +15% ATK, +25% when below 50% HP
  if (playerHasSkill(player, 'brs_t4a')) {
    atk = Math.floor(atk * 1.15);
    if (player.hp < player.maxHp * 0.5) {
      atk = Math.floor(atk * 1.25);
    }
  }
  // Relentless: +20% ATK when above 80% HP
  if (playerHasSkill(player, 'brs_t9a') && player.hp > player.maxHp * 0.8) {
    atk = Math.floor(atk * 1.2);
  }
  // Immortal Rage: ATK doubled when below 10% HP
  if (playerHasSkill(player, 'brs_t10a') && player.hp < player.maxHp * 0.1) {
    atk = atk * 2;
  }
  // Dark Pact: +25% ATK
  if (playerHasSkill(player, 'nec_t4a')) {
    atk = Math.floor(atk * 1.25);
  }
  // Lich Form: +20% ATK
  if (playerHasSkill(player, 'nec_t10a')) {
    atk = Math.floor(atk * 1.2);
  }
  // Arcane Overflow: +1 ATK per 10 current mana
  if (playerHasSkill(player, 'mag_t3a')) {
    atk += Math.floor(player.mana / 10);
  }
  // Spellweaver bonus tracked via battle.spellweaverActive
  if (battle?.spellweaverActive && playerHasSkill(player, 'mag_t8a')) {
    atk = Math.floor(atk * 1.5);
  }
  return Math.max(1, atk - (battle?.atkDebuff || 0));
}

export function getPlayerDef(player, battle) {
  let def = player.baseDef;
  for (const item of Object.values(player.equipment)) {
    if (item) def += (item.def || 0);
  }
  // Armor Mastery: equipment DEF +15%
  if (playerHasSkill(player, 'war_t7a')) {
    let equipDef = 0;
    for (const item of Object.values(player.equipment)) {
      if (item) equipDef += (item.def || 0);
    }
    def += Math.floor(equipDef * 0.15);
  }
  // Stalwart: +5 DEF in battle
  if (playerHasSkill(player, 'war_t5a')) {
    def += 5;
  }
  // Undead Fortitude: +10% DEF
  if (playerHasSkill(player, 'nec_t7a')) {
    def = Math.floor(def * 1.1);
  }
  // Last Stand: +30% DEF when below 40% HP
  if (playerHasSkill(player, 'war_t8a') && player.hp < player.maxHp * 0.4) {
    def = Math.floor(def * 1.3);
  }
  // Avatar of War buff
  if (battle?.avatarTurns > 0) {
    def = Math.floor(def * 1.5);
  }
  return Math.max(0, def - (battle?.defDebuff || 0));
}

export function getPlayerDodgeChance(player) {
  let chance = 0;
  // Athletics: each point gives +0.5% dodge chance
  const athletics = player.athletics || 0;
  chance += athletics * 0.005;
  if (playerHasSkill(player, 'thf_t1a')) chance += 0.15;
  if (playerHasSkill(player, 'thf_t3a')) chance += 0.10;
  return chance;
}

export function getBattleMaxHp(player) {
  let maxHp = player.maxHp;
  if (playerHasSkill(player, 'war_t3a')) maxHp = Math.floor(maxHp * 1.15);
  if (playerHasSkill(player, 'nec_t7a')) maxHp = Math.floor(maxHp * 1.1);
  return maxHp;
}

// Wisdom bonus: each point gives +2% max mana
export function getBattleMaxMana(player) {
  const wisdom = player.wisdom || 0;
  const wisdomBonus = 1 + wisdom * 0.02;
  return Math.floor(player.maxMana * wisdomBonus);
}

// Compute passive skill damage bonus for class skills and tree skills
export function getSkillPassiveBonus(player) {
  const cls = getClassData(player);
  let bonus = (cls?.passive === 'Arcane Mind') ? 1.4 : 1.0;
  if (playerHasSkill(player, 'mag_t6a')) bonus *= 1.2;
  return bonus;
}

// Check Spell Echo proc (20% chance for double damage)
export function rollSpellEcho(player) {
  if (playerHasSkill(player, 'mag_t2a') && Math.random() < 0.2) return true;
  return false;
}

// Compute the effective DEF multiplier based on a skill's pierce/true_damage effect
export function getEffectiveDef(monsterDef, effect) {
  if (effect === 'true_damage' || effect === 'phantom_blade') return 0;
  if (effect === 'pierce_20') return Math.floor(monsterDef * 0.8);
  if (effect === 'pierce_25') return Math.floor(monsterDef * 0.75);
  if (effect === 'pierce_30') return Math.floor(monsterDef * 0.7);
  if (effect === 'pierce_40') return Math.floor(monsterDef * 0.6);
  if (effect === 'pierce_50') return Math.floor(monsterDef * 0.5);
  if (effect === 'pierce') return Math.floor(monsterDef * 0.5);
  return monsterDef;
}

// Charisma price modifier: each point gives 1% better prices (capped at 25%)
export function getCharismaPriceBonus(player) {
  const charisma = player.charisma || 0;
  return Math.min(0.25, charisma * 0.01);
}

// Check execute multiplier for conditional damage skills
export function getExecuteMultiplier(effect, monsterHp, monsterMaxHp) {
  if (effect === 'execute' && monsterHp < monsterMaxHp * 0.3) return 2;
  if (effect === 'execute_25' && monsterHp < monsterMaxHp * 0.25) return 2.67;
  if (effect === 'counter') return 1; // handled separately with defendedLastTurn
  return 1;
}
