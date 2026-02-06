// Skill tree definitions - pure data, no logic
// Each class has 10 tiers (20 skills total). At each tier the player picks A or B (permanent choice).
// type: 'passive' (always active) or 'active' (usable in battle, costs mana)

import { CHARACTER_CLASSES } from './gameData';

export const SKILL_TREES = {
  berserker: {
    tiers: [
      { level: 2, label: 'Tier 1', choices: [
        { id: 'brs_t1a', name: 'Blood Frenzy', type: 'passive', desc: '+3% ATK for each 10% HP missing', icon: 'P' },
        { id: 'brs_t1b', name: 'Savage Strike', type: 'active', desc: '2.2x damage, take 5% max HP recoil', manaCost: 8, multiplier: 2.2, effect: 'recoil_small', icon: 'A' },
      ]},
      { level: 4, label: 'Tier 2', choices: [
        { id: 'brs_t2a', name: 'Undying Will', type: 'passive', desc: 'Survive one lethal hit per battle at 1 HP', icon: 'P' },
        { id: 'brs_t2b', name: 'Cleave', type: 'active', desc: '1.8x damage, ignores 30% DEF', manaCost: 10, multiplier: 1.8, effect: 'pierce_30', icon: 'A' },
      ]},
      { level: 6, label: 'Tier 3', choices: [
        { id: 'brs_t3a', name: 'Bloodlust', type: 'passive', desc: 'Heal 20% of damage dealt when below 30% HP', icon: 'P' },
        { id: 'brs_t3b', name: 'Rampage', type: 'active', desc: '3.0x damage, take 20% max HP recoil', manaCost: 15, multiplier: 3.0, effect: 'recoil_heavy', icon: 'A' },
      ]},
      { level: 8, label: 'Tier 4', choices: [
        { id: 'brs_t4a', name: 'War Machine', type: 'passive', desc: '+15% ATK, +25% ATK when below 50% HP', icon: 'P' },
        { id: 'brs_t4b', name: 'Skull Crusher', type: 'active', desc: '3.5x damage, reduce enemy DEF by 40%', manaCost: 18, multiplier: 3.5, effect: 'shred_def', icon: 'A' },
      ]},
      { level: 10, label: 'Tier 5', choices: [
        { id: 'brs_t5a', name: 'Thick Skin', type: 'passive', desc: 'Take 8% less damage from all sources', icon: 'P' },
        { id: 'brs_t5b', name: 'Whirlwind', type: 'active', desc: '2.5x damage, ignores 20% DEF', manaCost: 12, multiplier: 2.5, effect: 'pierce_20', icon: 'A' },
      ]},
      { level: 12, label: 'Tier 6', choices: [
        { id: 'brs_t6a', name: 'Adrenaline Rush', type: 'passive', desc: 'Restore 3 mana each time you attack', icon: 'P' },
        { id: 'brs_t6b', name: 'Decimate', type: 'active', desc: '2.8x damage, enemy ATK -15%', manaCost: 14, multiplier: 2.8, effect: 'weaken_15', icon: 'A' },
      ]},
      { level: 14, label: 'Tier 7', choices: [
        { id: 'brs_t7a', name: 'Tenacity', type: 'passive', desc: 'Poison and debuff durations reduced by 1 turn', icon: 'P' },
        { id: 'brs_t7b', name: 'Execution', type: 'active', desc: '4.0x damage if enemy below 25% HP, else 1.5x', manaCost: 16, multiplier: 1.5, effect: 'execute_25', icon: 'A' },
      ]},
      { level: 16, label: 'Tier 8', choices: [
        { id: 'brs_t8a', name: 'Bloodbath', type: 'passive', desc: 'Heal 5% max HP on every kill', icon: 'P' },
        { id: 'brs_t8b', name: 'Devastating Blow', type: 'active', desc: '3.2x damage, ignores 50% DEF', manaCost: 18, multiplier: 3.2, effect: 'pierce_50', icon: 'A' },
      ]},
      { level: 18, label: 'Tier 9', choices: [
        { id: 'brs_t9a', name: 'Relentless', type: 'passive', desc: '+20% ATK when above 80% HP', icon: 'P' },
        { id: 'brs_t9b', name: 'Blood Nova', type: 'active', desc: '3.8x damage, heal 25% of damage dealt, 10% recoil', manaCost: 22, multiplier: 3.8, effect: 'blood_nova', icon: 'A' },
      ]},
      { level: 20, label: 'Tier 10', choices: [
        { id: 'brs_t10a', name: 'Immortal Rage', type: 'passive', desc: 'When below 10% HP, ATK doubled', icon: 'P' },
        { id: 'brs_t10b', name: 'Apocalypse', type: 'active', desc: '5.0x damage, take 30% max HP recoil', manaCost: 28, multiplier: 5.0, effect: 'recoil_extreme', icon: 'A' },
      ]},
    ],
  },
  warrior: {
    tiers: [
      { level: 2, label: 'Tier 1', choices: [
        { id: 'war_t1a', name: 'Iron Skin', type: 'passive', desc: 'Take 10% less damage from all attacks', icon: 'P' },
        { id: 'war_t1b', name: 'War Cry', type: 'active', desc: 'Reduce enemy ATK by 25% for the fight', manaCost: 8, multiplier: 0.8, effect: 'war_cry', icon: 'A' },
      ]},
      { level: 4, label: 'Tier 2', choices: [
        { id: 'war_t2a', name: 'Bulwark', type: 'passive', desc: 'Defend blocks 85% damage instead of 70%', icon: 'P' },
        { id: 'war_t2b', name: 'Counter Strike', type: 'active', desc: '2.0x damage, 2.5x if defended last turn', manaCost: 10, multiplier: 2.0, effect: 'counter', icon: 'A' },
      ]},
      { level: 6, label: 'Tier 3', choices: [
        { id: 'war_t3a', name: 'Unbreakable', type: 'passive', desc: '+15% max HP during battle', icon: 'P' },
        { id: 'war_t3b', name: 'Earthquake', type: 'active', desc: '2.2x damage, lower enemy DEF by 30%', manaCost: 15, multiplier: 2.2, effect: 'quake', icon: 'A' },
      ]},
      { level: 8, label: 'Tier 4', choices: [
        { id: 'war_t4a', name: 'Aegis', type: 'passive', desc: '15% chance to fully block any attack', icon: 'P' },
        { id: 'war_t4b', name: 'Final Stand', type: 'active', desc: '2.8x damage, heal 30% of damage dealt', manaCost: 18, multiplier: 2.8, effect: 'final_stand', icon: 'A' },
      ]},
      { level: 10, label: 'Tier 5', choices: [
        { id: 'war_t5a', name: 'Stalwart', type: 'passive', desc: '+5 DEF permanently in battle', icon: 'P' },
        { id: 'war_t5b', name: 'Shield Slam', type: 'active', desc: '1.8x damage + DEF added to ATK for this hit', manaCost: 12, multiplier: 1.8, effect: 'shield_slam', icon: 'A' },
      ]},
      { level: 12, label: 'Tier 6', choices: [
        { id: 'war_t6a', name: 'Regeneration', type: 'passive', desc: 'Heal 3% max HP at the start of each turn', icon: 'P' },
        { id: 'war_t6b', name: 'Heroic Strike', type: 'active', desc: '2.5x damage, restore 5 mana', manaCost: 10, multiplier: 2.5, effect: 'heroic_mana', icon: 'A' },
      ]},
      { level: 14, label: 'Tier 7', choices: [
        { id: 'war_t7a', name: 'Armor Mastery', type: 'passive', desc: 'Equipment DEF bonuses increased by 15%', icon: 'P' },
        { id: 'war_t7b', name: 'Mighty Cleave', type: 'active', desc: '2.6x damage, ignores 25% DEF', manaCost: 14, multiplier: 2.6, effect: 'pierce_25', icon: 'A' },
      ]},
      { level: 16, label: 'Tier 8', choices: [
        { id: 'war_t8a', name: 'Last Stand', type: 'passive', desc: '+30% DEF when below 40% HP', icon: 'P' },
        { id: 'war_t8b', name: 'Rallying Blow', type: 'active', desc: '2.2x damage, heal 20% max HP', manaCost: 16, multiplier: 2.2, effect: 'rally_heal', icon: 'A' },
      ]},
      { level: 18, label: 'Tier 9', choices: [
        { id: 'war_t9a', name: 'Indomitable', type: 'passive', desc: 'Cannot be reduced below 1 HP by poison or DoT', icon: 'P' },
        { id: 'war_t9b', name: 'Colossus Smash', type: 'active', desc: '3.5x damage, reduce enemy DEF to 0 for 2 turns', manaCost: 22, multiplier: 3.5, effect: 'armor_break', icon: 'A' },
      ]},
      { level: 20, label: 'Tier 10', choices: [
        { id: 'war_t10a', name: 'Fortress', type: 'passive', desc: 'All damage taken reduced by 20%', icon: 'P' },
        { id: 'war_t10b', name: 'Avatar of War', type: 'active', desc: '4.0x damage, +50% DEF for 3 turns', manaCost: 28, multiplier: 4.0, effect: 'avatar', icon: 'A' },
      ]},
    ],
  },
  thief: {
    tiers: [
      { level: 2, label: 'Tier 1', choices: [
        { id: 'thf_t1a', name: 'Shadow Step', type: 'passive', desc: '15% chance to dodge enemy attacks', icon: 'P' },
        { id: 'thf_t1b', name: 'Poison Blade', type: 'active', desc: '1.5x damage, poison enemy for 3 turns', manaCost: 8, multiplier: 1.5, effect: 'apply_poison', icon: 'A' },
      ]},
      { level: 4, label: 'Tier 2', choices: [
        { id: 'thf_t2a', name: 'Plunder', type: 'passive', desc: '+50% gold from battles', icon: 'P' },
        { id: 'thf_t2b', name: 'Assassinate', type: 'active', desc: '3.0x damage if enemy <30% HP, else 1.5x', manaCost: 10, multiplier: 1.5, effect: 'execute', icon: 'A' },
      ]},
      { level: 6, label: 'Tier 3', choices: [
        { id: 'thf_t3a', name: 'Evasion Mastery', type: 'passive', desc: 'Dodge chance +10% (stacks with Shadow Step)', icon: 'P' },
        { id: 'thf_t3b', name: 'Shadow Dance', type: 'active', desc: '2.0x damage, dodge the next enemy attack', manaCost: 15, multiplier: 2.0, effect: 'shadow_dance', icon: 'A' },
      ]},
      { level: 8, label: 'Tier 4', choices: [
        { id: 'thf_t4a', name: 'Lucky Strike', type: 'passive', desc: '20% chance to deal double damage on attacks', icon: 'P' },
        { id: 'thf_t4b', name: 'Death Mark', type: 'active', desc: '2.5x damage, ignores all enemy DEF', manaCost: 18, multiplier: 2.5, effect: 'true_damage', icon: 'A' },
      ]},
      { level: 10, label: 'Tier 5', choices: [
        { id: 'thf_t5a', name: 'Quick Hands', type: 'passive', desc: 'Potions heal 30% more', icon: 'P' },
        { id: 'thf_t5b', name: 'Fan of Knives', type: 'active', desc: '2.0x damage, apply poison for 2 turns', manaCost: 10, multiplier: 2.0, effect: 'apply_poison_short', icon: 'A' },
      ]},
      { level: 12, label: 'Tier 6', choices: [
        { id: 'thf_t6a', name: 'Opportunist', type: 'passive', desc: '+15% damage against poisoned enemies', icon: 'P' },
        { id: 'thf_t6b', name: 'Cheap Shot', type: 'active', desc: '1.8x damage, reduce enemy ATK by 20%', manaCost: 10, multiplier: 1.8, effect: 'cheap_shot', icon: 'A' },
      ]},
      { level: 14, label: 'Tier 7', choices: [
        { id: 'thf_t7a', name: 'Slippery', type: 'passive', desc: '100% escape chance from non-boss fights', icon: 'P' },
        { id: 'thf_t7b', name: 'Garrote', type: 'active', desc: '2.2x damage, strong poison for 3 turns', manaCost: 14, multiplier: 2.2, effect: 'strong_poison_3', icon: 'A' },
      ]},
      { level: 16, label: 'Tier 8', choices: [
        { id: 'thf_t8a', name: 'Treasure Hunter', type: 'passive', desc: 'Better loot drop rates from monsters', icon: 'P' },
        { id: 'thf_t8b', name: 'Ambush', type: 'active', desc: '3.0x damage, ignores 50% DEF', manaCost: 16, multiplier: 3.0, effect: 'pierce_50', icon: 'A' },
      ]},
      { level: 18, label: 'Tier 9', choices: [
        { id: 'thf_t9a', name: 'Blade Dance', type: 'passive', desc: '10% chance to attack twice', icon: 'P' },
        { id: 'thf_t9b', name: 'Shadowstrike', type: 'active', desc: '3.5x damage, dodge next 2 attacks', manaCost: 22, multiplier: 3.5, effect: 'shadow_dance_2', icon: 'A' },
      ]},
      { level: 20, label: 'Tier 10', choices: [
        { id: 'thf_t10a', name: 'Master Thief', type: 'passive', desc: 'Double gold + guaranteed rare+ loot drops', icon: 'P' },
        { id: 'thf_t10b', name: 'Phantom Blade', type: 'active', desc: '4.5x true damage, dodge next attack', manaCost: 28, multiplier: 4.5, effect: 'phantom_blade', icon: 'A' },
      ]},
    ],
  },
  mage: {
    tiers: [
      { level: 2, label: 'Tier 1', choices: [
        { id: 'mag_t1a', name: 'Mana Shield', type: 'passive', desc: '20% of damage taken is absorbed by mana', icon: 'P' },
        { id: 'mag_t1b', name: 'Fireball', type: 'active', desc: '2.0x true damage (ignores DEF)', manaCost: 10, multiplier: 2.0, effect: 'true_damage', icon: 'A' },
      ]},
      { level: 4, label: 'Tier 2', choices: [
        { id: 'mag_t2a', name: 'Spell Echo', type: 'passive', desc: '20% chance for skills to deal double damage', icon: 'P' },
        { id: 'mag_t2b', name: 'Ice Lance', type: 'active', desc: '1.6x damage, reduce enemy ATK by 20%', manaCost: 10, multiplier: 1.6, effect: 'freeze', icon: 'A' },
      ]},
      { level: 6, label: 'Tier 3', choices: [
        { id: 'mag_t3a', name: 'Arcane Overflow', type: 'passive', desc: '+1 ATK for every 10 current mana', icon: 'P' },
        { id: 'mag_t3b', name: 'Meteor', type: 'active', desc: '3.0x true damage (ignores DEF)', manaCost: 20, multiplier: 3.0, effect: 'true_damage', icon: 'A' },
      ]},
      { level: 8, label: 'Tier 4', choices: [
        { id: 'mag_t4a', name: 'Mana Surge', type: 'passive', desc: 'All skills cost 25% less mana', icon: 'P' },
        { id: 'mag_t4b', name: 'Chain Lightning', type: 'active', desc: '2.5x damage, reduce enemy DEF by 25%', manaCost: 16, multiplier: 2.5, effect: 'chain_lightning', icon: 'A' },
      ]},
      { level: 10, label: 'Tier 5', choices: [
        { id: 'mag_t5a', name: 'Meditation', type: 'passive', desc: 'Restore 4 mana at the start of each turn', icon: 'P' },
        { id: 'mag_t5b', name: 'Frost Nova', type: 'active', desc: '1.8x damage, enemy ATK -30%', manaCost: 14, multiplier: 1.8, effect: 'frost_nova', icon: 'A' },
      ]},
      { level: 12, label: 'Tier 6', choices: [
        { id: 'mag_t6a', name: 'Elemental Mastery', type: 'passive', desc: 'All skill damage +20%', icon: 'P' },
        { id: 'mag_t6b', name: 'Lightning Bolt', type: 'active', desc: '2.2x true damage', manaCost: 14, multiplier: 2.2, effect: 'true_damage', icon: 'A' },
      ]},
      { level: 14, label: 'Tier 7', choices: [
        { id: 'mag_t7a', name: 'Arcane Barrier', type: 'passive', desc: 'Defend also restores 10 mana', icon: 'P' },
        { id: 'mag_t7b', name: 'Blizzard', type: 'active', desc: '2.0x damage, enemy ATK & DEF -15%', manaCost: 16, multiplier: 2.0, effect: 'blizzard', icon: 'A' },
      ]},
      { level: 16, label: 'Tier 8', choices: [
        { id: 'mag_t8a', name: 'Spellweaver', type: 'passive', desc: 'After using a skill, next attack deals +50% damage', icon: 'P' },
        { id: 'mag_t8b', name: 'Pyroblast', type: 'active', desc: '3.5x true damage', manaCost: 22, multiplier: 3.5, effect: 'true_damage', icon: 'A' },
      ]},
      { level: 18, label: 'Tier 9', choices: [
        { id: 'mag_t9a', name: 'Mana Regeneration', type: 'passive', desc: 'Restore 8% max mana each turn', icon: 'P' },
        { id: 'mag_t9b', name: 'Arcane Torrent', type: 'active', desc: '3.0x damage, restore 50% mana spent', manaCost: 20, multiplier: 3.0, effect: 'mana_refund', icon: 'A' },
      ]},
      { level: 20, label: 'Tier 10', choices: [
        { id: 'mag_t10a', name: 'Transcendence', type: 'passive', desc: 'Mana Shield absorbs 40% instead of 20%', icon: 'P' },
        { id: 'mag_t10b', name: 'Cataclysm', type: 'active', desc: '5.0x true damage', manaCost: 30, multiplier: 5.0, effect: 'true_damage', icon: 'A' },
      ]},
    ],
  },
  necromancer: {
    tiers: [
      { level: 2, label: 'Tier 1', choices: [
        { id: 'nec_t1a', name: 'Soul Siphon', type: 'passive', desc: 'Attacks have 25% chance to restore 5 mana', icon: 'P' },
        { id: 'nec_t1b', name: 'Bone Spear', type: 'active', desc: '1.8x damage, ignores 40% DEF', manaCost: 8, multiplier: 1.8, effect: 'pierce_40', icon: 'A' },
      ]},
      { level: 4, label: 'Tier 2', choices: [
        { id: 'nec_t2a', name: "Death's Embrace", type: 'passive', desc: 'When below 25% HP, heal 15% max HP (once/battle)', icon: 'P' },
        { id: 'nec_t2b', name: 'Plague', type: 'active', desc: '1.2x damage, strong poison for 4 turns', manaCost: 10, multiplier: 1.2, effect: 'strong_poison', icon: 'A' },
      ]},
      { level: 6, label: 'Tier 3', choices: [
        { id: 'nec_t3a', name: 'Vampiric Aura', type: 'passive', desc: 'All attacks heal 10% of damage dealt', icon: 'P' },
        { id: 'nec_t3b', name: 'Soul Harvest', type: 'active', desc: '2.5x damage, heal 60% of damage dealt', manaCost: 15, multiplier: 2.5, effect: 'soul_harvest', icon: 'A' },
      ]},
      { level: 8, label: 'Tier 4', choices: [
        { id: 'nec_t4a', name: 'Dark Pact', type: 'passive', desc: 'Sacrifice 5% HP per turn, gain +25% ATK', icon: 'P' },
        { id: 'nec_t4b', name: 'Doom', type: 'active', desc: '2.0x damage, enemy takes 8% max HP/turn for 3 turns', manaCost: 20, multiplier: 2.0, effect: 'doom', icon: 'A' },
      ]},
      { level: 10, label: 'Tier 5', choices: [
        { id: 'nec_t5a', name: 'Necrotic Touch', type: 'passive', desc: 'Normal attacks reduce enemy DEF by 1 each hit', icon: 'P' },
        { id: 'nec_t5b', name: 'Corpse Explosion', type: 'active', desc: '2.2x damage, +50% if enemy is poisoned', manaCost: 12, multiplier: 2.2, effect: 'corpse_explode', icon: 'A' },
      ]},
      { level: 12, label: 'Tier 6', choices: [
        { id: 'nec_t6a', name: 'Life Tap', type: 'passive', desc: 'Spending mana heals 50% of mana spent as HP', icon: 'P' },
        { id: 'nec_t6b', name: 'Shadow Bolt', type: 'active', desc: '2.4x damage, ignores 30% DEF', manaCost: 12, multiplier: 2.4, effect: 'pierce_30', icon: 'A' },
      ]},
      { level: 14, label: 'Tier 7', choices: [
        { id: 'nec_t7a', name: 'Undead Fortitude', type: 'passive', desc: '+10% max HP and +10% DEF', icon: 'P' },
        { id: 'nec_t7b', name: 'Death Coil', type: 'active', desc: '2.0x damage, heal 100% of damage dealt', manaCost: 18, multiplier: 2.0, effect: 'full_drain', icon: 'A' },
      ]},
      { level: 16, label: 'Tier 8', choices: [
        { id: 'nec_t8a', name: 'Cursed Blood', type: 'passive', desc: 'When hit, 20% chance to poison the attacker for 2 turns', icon: 'P' },
        { id: 'nec_t8b', name: 'Wither', type: 'active', desc: '1.5x damage, reduce enemy ATK and DEF by 25%', manaCost: 16, multiplier: 1.5, effect: 'wither', icon: 'A' },
      ]},
      { level: 18, label: 'Tier 9', choices: [
        { id: 'nec_t9a', name: 'Eternal Hunger', type: 'passive', desc: 'Lifesteal from all sources increased by 50%', icon: 'P' },
        { id: 'nec_t9b', name: 'Army of the Dead', type: 'active', desc: '3.5x damage, heal 40% of damage dealt', manaCost: 22, multiplier: 3.5, effect: 'army_drain', icon: 'A' },
      ]},
      { level: 20, label: 'Tier 10', choices: [
        { id: 'nec_t10a', name: 'Lich Form', type: 'passive', desc: 'All healing doubled, +20% ATK, immune to poison', icon: 'P' },
        { id: 'nec_t10b', name: 'Apocalypse', type: 'active', desc: '4.5x damage, doom for 4 turns, heal 30%', manaCost: 30, multiplier: 4.5, effect: 'nec_apocalypse', icon: 'A' },
      ]},
    ],
  },
};

// Build a fast lookup map at module load time
const _allTreeSkills = {};
for (const cls of Object.values(SKILL_TREES)) {
  for (const tier of cls.tiers) {
    for (const choice of tier.choices) {
      _allTreeSkills[choice.id] = choice;
    }
  }
}

export function getTreeSkill(id) {
  return _allTreeSkills[id] || null;
}

// Get all unlocked active skills for a player (class skill + tree actives)
export function getPlayerActiveSkills(player) {
  const cls = player.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;
  if (!cls) return [];
  const skills = [];
  skills.push({
    id: 'class_skill',
    name: cls.skillName,
    desc: cls.skillDesc,
    manaCost: cls.skillManaCost,
    multiplier: cls.skillMultiplier,
    effect: cls.skillEffect,
    isClassSkill: true,
  });
  const tree = player.skillTree || [];
  for (const skillId of tree) {
    const skill = _allTreeSkills[skillId];
    if (skill && skill.type === 'active') {
      skills.push(skill);
    }
  }
  return skills;
}

// Get all unlocked passive skills for a player (class passive + tree passives)
export function getPlayerPassiveSkills(player) {
  const cls = player.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;
  if (!cls) return [];
  const passives = [];
  passives.push({
    id: 'class_passive',
    name: cls.passive,
    desc: cls.passiveDesc,
  });
  const tree = player.skillTree || [];
  for (const skillId of tree) {
    const skill = _allTreeSkills[skillId];
    if (skill && skill.type === 'passive') {
      passives.push(skill);
    }
  }
  return passives;
}
