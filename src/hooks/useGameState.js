import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  expForLevel, scaleMonster, calcDamage, rollDrop, SKILLS, EXPLORE_TEXTS, generateItem,
  CHARACTER_CLASSES, scaleBoss, SKILL_TREES, getTreeSkill, getPlayerActiveSkills, getPlayerPassiveSkills,
} from '../data/gameData';
import { saveGame } from '../api';

export const ENERGY_MAX = 100;
export const ENERGY_COST_PER_TRIP = 10;
const ENERGY_REGEN_PERCENT = 0.1;
const ENERGY_REGEN_INTERVAL_MS = 15 * 60 * 1000;

// ---- INITIAL STATE ----
function createInitialPlayer() {
  return {
    name: 'Hero',
    characterClass: null,
    level: 1,
    exp: 0,
    expToLevel: expForLevel(1),
    maxHp: 50,
    hp: 50,
    maxMana: 30,
    mana: 30,
    baseAtk: 5,
    baseDef: 2,
    gold: 30,
    equipment: { weapon: null, shield: null, helmet: null, armor: null, boots: null, accessory: null },
    inventory: [],
    maxInventory: 20,
    skillTree: [],
  };
}

function createInitialState() {
  return {
    screen: 'class-select',
    player: createInitialPlayer(),
    currentLocation: null,
    battle: null,
    battleLog: [],
    battleResult: null,
    exploreText: '',
    message: null,
    energy: ENERGY_MAX,
    lastEnergyUpdate: Date.now(),
    pendingBoss: null,
  };
}

function getClassData(player) {
  return player.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;
}

// ---- HELPERS ----
function playerHasSkill(player, skillId) {
  return (player.skillTree || []).includes(skillId);
}

function getEffectiveManaCost(player, baseCost) {
  // Mage Mana Surge: skills cost 25% less
  if (playerHasSkill(player, 'mag_t4a')) {
    return Math.floor(baseCost * 0.75);
  }
  return baseCost;
}

function getPlayerAtk(player, battle) {
  let atk = player.baseAtk;
  for (const item of Object.values(player.equipment)) {
    if (item) atk += (item.atk || 0);
  }
  // Berserker Rage: +30% ATK when below 40% HP
  const cls = getClassData(player);
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

function getPlayerDef(player, battle) {
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

// Calculate dodge chance based on passives
function getPlayerDodgeChance(player) {
  let chance = 0;
  if (playerHasSkill(player, 'thf_t1a')) chance += 0.15;
  if (playerHasSkill(player, 'thf_t3a')) chance += 0.10;
  return chance;
}

// Get effective max HP in battle (Unbreakable + Undead Fortitude)
function getBattleMaxHp(player) {
  let maxHp = player.maxHp;
  if (playerHasSkill(player, 'war_t3a')) maxHp = Math.floor(maxHp * 1.15);
  if (playerHasSkill(player, 'nec_t7a')) maxHp = Math.floor(maxHp * 1.1);
  return maxHp;
}

function processLevelUps(player) {
  const p = { ...player };
  const gains = [];
  const cls = getClassData(p);
  const growth = cls?.growth;
  while (p.exp >= p.expToLevel) {
    p.exp -= p.expToLevel;
    p.level++;
    p.expToLevel = expForLevel(p.level);
    const hpGain = (growth?.hp ?? 8) + Math.floor(Math.random() * (growth?.hpRand ?? 5));
    const atkGain = (growth?.atk ?? 1) + Math.floor(Math.random() * (growth?.atkRand ?? 2));
    const defGain = (growth?.def ?? 1) + Math.floor(Math.random() * (growth?.defRand ?? 2));
    const manaGain = (growth?.mana ?? 4) + Math.floor(Math.random() * (growth?.manaRand ?? 3));
    p.maxHp += hpGain;
    p.hp = p.maxHp;
    p.maxMana += manaGain;
    p.mana = p.maxMana;
    p.baseAtk += atkGain;
    p.baseDef += defGain;
    gains.push({ hpGain, atkGain, defGain, manaGain });
  }
  return { player: p, gains };
}

function regenEnergy(currentEnergy, lastEnergyUpdate, now = Date.now()) {
  const sanitizedEnergy = Math.max(0, Math.min(currentEnergy ?? ENERGY_MAX, ENERGY_MAX));
  const last = lastEnergyUpdate ?? now;
  if (sanitizedEnergy >= ENERGY_MAX) {
    return { energy: ENERGY_MAX, lastEnergyUpdate: now };
  }
  const elapsed = Math.max(0, now - last);
  const ticks = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
  if (ticks <= 0) {
    return { energy: sanitizedEnergy, lastEnergyUpdate: last };
  }
  const gainPerTick = Math.max(1, Math.round(ENERGY_MAX * ENERGY_REGEN_PERCENT));
  const gained = gainPerTick * ticks;
  const nextEnergy = Math.min(ENERGY_MAX, sanitizedEnergy + gained);
  const consumed = ticks * ENERGY_REGEN_INTERVAL_MS;
  if (nextEnergy >= ENERGY_MAX) {
    return { energy: ENERGY_MAX, lastEnergyUpdate: now };
  }
  return { energy: nextEnergy, lastEnergyUpdate: last + consumed };
}

// Extract the saveable portion of state (no transient battle data)
function extractSaveData(state) {
  let screen = state.screen;
  if (screen === 'battle' || screen === 'battle-result') screen = 'town';
  // Don't save class-select; if no class is chosen yet, they'll see it on load
  if (screen === 'class-select') screen = 'class-select';
  return {
    player: state.player,
    screen: (state.screen === 'battle' || state.screen === 'battle-result' || state.screen === 'boss-confirm') ? 'town' : state.screen,
    energy: state.energy,
    lastEnergyUpdate: state.lastEnergyUpdate,
  };
}

// ---- REDUCER ----
function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_SAVE': {
      const { player, screen, energy, lastEnergyUpdate } = action.saveData || {};
      const base = createInitialState();
      const regen = regenEnergy(
        energy ?? base.energy,
        lastEnergyUpdate ?? base.lastEnergyUpdate,
      );
      const mergedPlayer = { ...base.player, ...player };
      // If the player has no class, send them to class select
      const resolvedScreen = !mergedPlayer.characterClass ? 'class-select' : (screen || 'town');
      return {
        ...base,
        screen: resolvedScreen,
        player: mergedPlayer,
        energy: regen.energy,
        lastEnergyUpdate: regen.lastEnergyUpdate,
      };
    }

    case 'START_GAME':
      return createInitialState();

    case 'SELECT_CLASS': {
      const cls = CHARACTER_CLASSES[action.classId];
      if (!cls) return state;
      const p = {
        ...state.player,
        characterClass: cls.id,
        maxHp: cls.baseStats.maxHp,
        hp: cls.baseStats.maxHp,
        maxMana: cls.baseStats.maxMana,
        mana: cls.baseStats.maxMana,
        baseAtk: cls.baseStats.baseAtk,
        baseDef: cls.baseStats.baseDef,
      };
      return { ...state, screen: 'town', player: p };
    }

    case 'GO_TO_TOWN':
      return { ...state, screen: 'town', currentLocation: null, battle: null, battleResult: null, battleLog: [], pendingBoss: null };

    case 'SHOW_SCREEN':
      return { ...state, screen: action.screen };

    case 'ENTER_LOCATION': {
      const now = Date.now();
      const { energy, lastEnergyUpdate } = regenEnergy(state.energy, state.lastEnergyUpdate, now);
      if (energy < ENERGY_COST_PER_TRIP) {
        return {
          ...state,
          energy,
          lastEnergyUpdate,
          message: 'Too exhausted to travel. Wait for energy to recover.',
        };
      }
      return {
        ...state,
        screen: 'explore',
        currentLocation: action.location,
        exploreText: 'You enter ' + action.location.name + '...',
        energy: energy - ENERGY_COST_PER_TRIP,
        lastEnergyUpdate,
      };
    }

    case 'EXPLORE_STEP': {
      const loc = state.currentLocation;
      if (!loc) return state;
      const texts = EXPLORE_TEXTS[loc.bgKey] || EXPLORE_TEXTS.street;
      const text = texts[Math.floor(Math.random() * texts.length)];

      // Boss encounter check (0.5% chance when location has a boss)
      if (loc.boss && Math.random() < (loc.bossRate || 0.005)) {
        const boss = scaleBoss(loc.boss, loc.levelReq);
        if (boss) {
          return {
            ...state, screen: 'boss-confirm',
            exploreText: text,
            pendingBoss: boss,
          };
        }
      }

      if (Math.random() < loc.encounterRate) {
        const monsterId = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
        const monster = scaleMonster(monsterId, loc.levelReq);
        return {
          ...state, screen: 'battle',
          exploreText: text,
          battle: {
            monster, isPlayerTurn: true, defending: false,
            poisonTurns: 0, atkDebuff: 0, defDebuff: 0, animating: false,
            monsterPoisonTurns: 0, monsterDoomTurns: 0,
            undyingWillUsed: false, deathsEmbraceUsed: false,
            defendedLastTurn: false, dodgeNextTurn: false, dodgeCharges: 0,
            showSkillMenu: false, spellweaverActive: false,
            avatarTurns: 0, armorBreakTurns: 0, cursedBloodPoison: 0,
          },
          battleLog: [{ text: `A ${monster.name} appears!`, type: 'info' }],
          battleResult: null,
        };
      }

      // No encounter - chance to find loot, gold, or nothing
      const lootChance = loc.lootRate ?? 0.3;
      let newText = text;
      let newPlayer = state.player;
      const lootTable = ['potion', 'ring', 'boots', 'helmet', 'armor', 'sword', 'shield'];

      if (Math.random() < lootChance) {
        if (state.player.inventory.length < state.player.maxInventory) {
          const dropType = lootTable[Math.floor(Math.random() * lootTable.length)];
          const foundItem = generateItem(dropType, Math.max(loc.levelReq, state.player.level));
          newPlayer = { ...state.player, inventory: [...state.player.inventory, foundItem] };
          newText = text + `\n\nYou scavenge ${foundItem.name} from a busted crate.`;
        } else {
          newText = text + '\n\nYou find loot but your pack is full.';
        }
      } else if (Math.random() < 0.3) {
        const found = Math.floor(3 + Math.random() * Math.max(2, state.player.level * 2));
        newPlayer = { ...state.player, gold: state.player.gold + found };
        newText = text + `\n\nYou find ${found} gold tucked under debris.`;
      } else {
        newText = text + '\n\nNothing but distant sirens... for now.';
      }
      return { ...state, exploreText: newText, player: newPlayer };
    }

    case 'BATTLE_PLAYER_ATTACK': {
      const b = { ...state.battle };
      const m = { ...b.monster };
      let p = { ...state.player };
      let dmg = calcDamage(getPlayerAtk(p, b), m.def);
      let luckyProc = false;
      // Lucky Strike: 20% chance to deal double damage
      if (playerHasSkill(p, 'thf_t4a') && Math.random() < 0.2) {
        dmg = dmg * 2;
        luckyProc = true;
      }
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      const log = [...state.battleLog];
      if (luckyProc) {
        log.push({ text: `Lucky Strike! Double damage for ${dmg}!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `You attack for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Necromancer Lifetap: heal 15% of damage dealt on normal attacks
      const cls = getClassData(p);
      const battleMaxHp = getBattleMaxHp(p);
      if (cls?.passive === 'Lifetap') {
        const healAmt = Math.floor(dmg * 0.15);
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Lifetap heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Vampiric Aura: all attacks heal 10% of damage dealt
      if (playerHasSkill(p, 'nec_t3a')) {
        const healAmt = Math.floor(dmg * 0.10);
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Vampiric Aura heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Soul Siphon: 25% chance to restore 5 mana
      if (playerHasSkill(p, 'nec_t1a') && Math.random() < 0.25) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 5) };
        log.push({ text: `Soul Siphon restores 5 mana!`, type: 'heal' });
      }
      // Bloodlust: heal 20% of damage dealt when below 30% HP
      if (playerHasSkill(p, 'brs_t3a') && p.hp < battleMaxHp * 0.3) {
        let healAmt = Math.floor(dmg * 0.20);
        if (playerHasSkill(p, 'nec_t9a')) healAmt = Math.floor(healAmt * 1.5); // Eternal Hunger
        if (playerHasSkill(p, 'nec_t10a')) healAmt = healAmt * 2; // Lich Form
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Bloodlust heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Adrenaline Rush: restore 3 mana on attack
      if (playerHasSkill(p, 'brs_t6a')) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 3) };
      }
      // Necrotic Touch: reduce enemy DEF by 1
      if (playerHasSkill(p, 'nec_t5a') && m.def > 0) {
        m.def = Math.max(0, m.def - 1);
        b.monster = m;
      }
      // Opportunist: +15% damage against poisoned enemies (already dealt, so add bonus)
      if (playerHasSkill(p, 'thf_t6a') && b.monsterPoisonTurns > 0) {
        const bonus = Math.floor(dmg * 0.15);
        m.hp = Math.max(0, m.hp - bonus);
        b.monster = m;
        if (bonus > 0) log.push({ text: `Opportunist bonus: ${bonus} damage!`, type: 'dmg-monster' });
      }
      // Spellweaver: clear after normal attack
      if (b.spellweaverActive) {
        b.spellweaverActive = false;
      }
      // Blade Dance: 10% chance to attack twice
      if (playerHasSkill(p, 'thf_t9a') && Math.random() < 0.1 && m.hp > 0) {
        const dmg2 = calcDamage(getPlayerAtk(p, b), m.def);
        m.hp = Math.max(0, m.hp - dmg2);
        b.monster = m;
        log.push({ text: `Blade Dance! Extra attack for ${dmg2}!`, type: 'dmg-monster' });
      }

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log });
      }
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'BATTLE_PLAYER_SKILL': {
      const b = { ...state.battle };
      const m = { ...b.monster };
      let p = { ...state.player };
      const cls = getClassData(p);
      const skillName = cls?.skillName || 'Power Strike';
      const skillMult = cls?.skillMultiplier || 1.5;
      const skillEffect = cls?.skillEffect || null;
      const manaCost = getEffectiveManaCost(p, cls?.skillManaCost || 0);

      if (manaCost > 0 && p.mana < manaCost) {
        return { ...state, message: `Not enough mana! (${manaCost} needed)` };
      }
      p = { ...p, mana: p.mana - manaCost };

      // Mage passive: +40% skill damage
      let passiveBonus = (cls?.passive === 'Arcane Mind') ? 1.4 : 1.0;
      // Elemental Mastery: +20% skill damage
      if (playerHasSkill(p, 'mag_t6a')) passiveBonus *= 1.2;
      // Spell Echo: 20% chance for double damage
      let echoProc = false;
      if (playerHasSkill(p, 'mag_t2a') && Math.random() < 0.2) {
        passiveBonus *= 2;
        echoProc = true;
      }
      const atkValue = Math.floor(getPlayerAtk(p, b) * skillMult * passiveBonus);

      // Life Tap: spending mana heals 50% as HP
      if (playerHasSkill(p, 'nec_t6a') && manaCost > 0) {
        const ltHeal = Math.floor(manaCost * 0.5);
        p = { ...p, hp: Math.min(getBattleMaxHp(p), p.hp + ltHeal) };
      }

      // Thief pierce: ignore 50% DEF
      const effectiveDef = (skillEffect === 'pierce') ? Math.floor(m.def * 0.5)
        : (skillEffect === 'true_damage') ? 0
        : m.def;

      const dmg = calcDamage(atkValue, effectiveDef);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      const log = [...state.battleLog];
      if (echoProc) {
        log.push({ text: `Spell Echo! ${skillName} for ${dmg} damage!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `${skillName} for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Berserker recoil: take 10% max HP
      if (skillEffect === 'recoil') {
        const recoil = Math.floor(p.maxHp * 0.1);
        p = { ...p, hp: Math.max(1, p.hp - recoil) };
        log.push({ text: `Recoil deals ${recoil} damage to you!`, type: 'dmg-player' });
      }

      // Warrior weaken: reduce monster ATK by 15%
      if (skillEffect === 'weaken') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.15));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }

      // Necromancer drain: heal 40% of damage dealt
      const battleMaxHp = getBattleMaxHp(p);
      if (skillEffect === 'drain') {
        const healAmt = Math.floor(dmg * 0.4);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Drained ${healAmt} HP!`, type: 'heal' });
      }

      // Vampiric Aura on skill
      if (playerHasSkill(p, 'nec_t3a')) {
        const healAmt = Math.floor(dmg * 0.10);
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Vampiric Aura heals ${healAmt} HP!`, type: 'heal' });
        }
      }

      // Soul Siphon on skill use too
      if (playerHasSkill(p, 'nec_t1a') && Math.random() < 0.25) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 5) };
        log.push({ text: `Soul Siphon restores 5 mana!`, type: 'heal' });
      }

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log });
      }
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'BATTLE_USE_TREE_SKILL': {
      const b = { ...state.battle };
      const m = { ...b.monster };
      let p = { ...state.player };
      const skill = getTreeSkill(action.skillId);
      if (!skill || skill.type !== 'active') return state;
      const manaCost = getEffectiveManaCost(p, skill.manaCost || 0);
      if (manaCost > 0 && p.mana < manaCost) {
        return { ...state, message: `Not enough mana! (${manaCost} needed)` };
      }
      p = { ...p, mana: p.mana - manaCost };

      const cls = getClassData(p);
      let passiveBonus = (cls?.passive === 'Arcane Mind') ? 1.4 : 1.0;
      if (playerHasSkill(p, 'mag_t6a')) passiveBonus *= 1.2;
      // Spell Echo
      let echoProc = false;
      if (playerHasSkill(p, 'mag_t2a') && Math.random() < 0.2) {
        passiveBonus *= 2;
        echoProc = true;
      }
      const atkValue = Math.floor(getPlayerAtk(p, b) * skill.multiplier * passiveBonus);
      const battleMaxHp = getBattleMaxHp(p);

      // Life Tap: spending mana heals 50% as HP
      if (playerHasSkill(p, 'nec_t6a') && manaCost > 0) {
        const ltHeal = Math.floor(manaCost * 0.5);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + ltHeal) };
      }

      // Determine effective DEF based on skill effect
      let effectiveDef = m.def;
      if (skill.effect === 'true_damage' || skill.effect === 'phantom_blade') effectiveDef = 0;
      else if (skill.effect === 'pierce_20') effectiveDef = Math.floor(m.def * 0.8);
      else if (skill.effect === 'pierce_25') effectiveDef = Math.floor(m.def * 0.75);
      else if (skill.effect === 'pierce_30') effectiveDef = Math.floor(m.def * 0.7);
      else if (skill.effect === 'pierce_40') effectiveDef = Math.floor(m.def * 0.6);
      else if (skill.effect === 'pierce_50') effectiveDef = Math.floor(m.def * 0.5);

      // Assassinate: 3.0x if enemy <30% HP
      let finalMult = 1;
      if (skill.effect === 'execute' && m.hp < m.maxHp * 0.3) {
        finalMult = 2; // 1.5x * 2 = 3.0x effective
      }
      // Execution: 4.0x if enemy below 25% HP
      if (skill.effect === 'execute_25' && m.hp < m.maxHp * 0.25) {
        finalMult = 2.67; // 1.5x * 2.67 ≈ 4.0x effective
      }

      // Counter Strike: 2.5x if defended last turn
      if (skill.effect === 'counter' && b.defendedLastTurn) {
        finalMult = 1.25; // 2.0x * 1.25 = 2.5x effective
      }

      let dmg = calcDamage(Math.floor(atkValue * finalMult), effectiveDef);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      const log = [...state.battleLog];
      if (echoProc) {
        log.push({ text: `Spell Echo! ${skill.name} for ${dmg} damage!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `${skill.name} for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Handle skill-specific effects
      if (skill.effect === 'recoil_small') {
        const recoil = Math.floor(p.maxHp * 0.05);
        p = { ...p, hp: Math.max(1, p.hp - recoil) };
        log.push({ text: `Recoil deals ${recoil} to you!`, type: 'dmg-player' });
      }
      if (skill.effect === 'recoil_heavy') {
        const recoil = Math.floor(p.maxHp * 0.2);
        p = { ...p, hp: Math.max(1, p.hp - recoil) };
        log.push({ text: `Recoil deals ${recoil} to you!`, type: 'dmg-player' });
      }
      if (skill.effect === 'war_cry') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.25));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'shred_def') {
        const reduction = Math.max(1, Math.floor(m.def * 0.4));
        m.def = Math.max(0, m.def - reduction);
        b.monster = m;
        log.push({ text: `Enemy DEF reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'quake') {
        const reduction = Math.max(1, Math.floor(m.def * 0.3));
        m.def = Math.max(0, m.def - reduction);
        b.monster = m;
        log.push({ text: `Earthquake! Enemy DEF reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'chain_lightning') {
        const reduction = Math.max(1, Math.floor(m.def * 0.25));
        m.def = Math.max(0, m.def - reduction);
        b.monster = m;
        log.push({ text: `Chain Lightning! Enemy DEF reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'freeze') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.20));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Ice Lance! Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'apply_poison') {
        b.monsterPoisonTurns = 3;
        log.push({ text: `Enemy is poisoned!`, type: 'info' });
      }
      if (skill.effect === 'strong_poison') {
        b.monsterPoisonTurns = 4;
        log.push({ text: `Enemy is plagued!`, type: 'info' });
      }
      if (skill.effect === 'doom') {
        b.monsterDoomTurns = 3;
        log.push({ text: `Doom! Enemy will take damage over time!`, type: 'info' });
      }
      if (skill.effect === 'shadow_dance') {
        b.dodgeNextTurn = true;
        log.push({ text: `You vanish into shadows! Dodge next attack!`, type: 'info' });
      }
      if (skill.effect === 'shadow_dance_2') {
        b.dodgeCharges = 2;
        log.push({ text: `You vanish into shadows! Dodge next 2 attacks!`, type: 'info' });
      }
      if (skill.effect === 'phantom_blade') {
        b.dodgeNextTurn = true;
        // true_damage already handled above via effectiveDef = 0
        log.push({ text: `Phantom Blade! Dodge next attack!`, type: 'info' });
      }
      if (skill.effect === 'final_stand') {
        const healAmt = Math.floor(dmg * 0.30);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Final Stand heals ${healAmt} HP!`, type: 'heal' });
      }
      if (skill.effect === 'soul_harvest') {
        const healAmt = Math.floor(dmg * 0.60);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Soul Harvest heals ${healAmt} HP!`, type: 'heal' });
      }
      // New warrior effects
      if (skill.effect === 'shield_slam') {
        // DEF added as bonus damage already in atkValue via getPlayerAtk
        log.push({ text: `Shield Slam! DEF adds to damage!`, type: 'info' });
      }
      if (skill.effect === 'heroic_mana') {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 5) };
        log.push({ text: `Heroic Strike restores 5 mana!`, type: 'heal' });
      }
      if (skill.effect === 'rally_heal') {
        const healAmt = Math.floor(battleMaxHp * 0.20);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Rallying Blow heals ${healAmt} HP!`, type: 'heal' });
      }
      if (skill.effect === 'armor_break') {
        b.armorBreakTurns = 2;
        const oldDef = m.def;
        m.def = 0;
        b.monster = m;
        log.push({ text: `Colossus Smash! Enemy DEF reduced to 0 for 2 turns!`, type: 'info' });
      }
      if (skill.effect === 'avatar') {
        b.avatarTurns = 3;
        log.push({ text: `Avatar of War! DEF +50% for 3 turns!`, type: 'info' });
      }
      // New berserker effects
      if (skill.effect === 'weaken_15') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.15));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'execute_25') {
        // Already handled via finalMult if enemy < 25%
      }
      if (skill.effect === 'blood_nova') {
        const healAmt = Math.floor(dmg * 0.25);
        const recoil = Math.floor(p.maxHp * 0.1);
        p = { ...p, hp: Math.min(battleMaxHp, Math.max(1, p.hp + healAmt - recoil)) };
        log.push({ text: `Blood Nova heals ${healAmt}, recoil ${recoil}!`, type: 'info' });
      }
      if (skill.effect === 'recoil_extreme') {
        const recoil = Math.floor(p.maxHp * 0.3);
        p = { ...p, hp: Math.max(1, p.hp - recoil) };
        log.push({ text: `Extreme recoil deals ${recoil} to you!`, type: 'dmg-player' });
      }
      // New thief effects
      if (skill.effect === 'apply_poison_short') {
        b.monsterPoisonTurns = Math.max(b.monsterPoisonTurns, 2);
        log.push({ text: `Enemy is poisoned!`, type: 'info' });
      }
      if (skill.effect === 'cheap_shot') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.20));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Cheap Shot! Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'strong_poison_3') {
        b.monsterPoisonTurns = Math.max(b.monsterPoisonTurns, 3);
        log.push({ text: `Enemy is severely poisoned!`, type: 'info' });
      }
      // New mage effects
      if (skill.effect === 'frost_nova') {
        const reduction = Math.max(1, Math.floor(m.atk * 0.30));
        m.atk = Math.max(1, m.atk - reduction);
        b.monster = m;
        log.push({ text: `Frost Nova! Enemy ATK reduced by ${reduction}!`, type: 'info' });
      }
      if (skill.effect === 'blizzard') {
        const atkRed = Math.max(1, Math.floor(m.atk * 0.15));
        const defRed = Math.max(1, Math.floor(m.def * 0.15));
        m.atk = Math.max(1, m.atk - atkRed);
        m.def = Math.max(0, m.def - defRed);
        b.monster = m;
        log.push({ text: `Blizzard! Enemy ATK -${atkRed}, DEF -${defRed}!`, type: 'info' });
      }
      if (skill.effect === 'mana_refund') {
        const refund = Math.floor(manaCost * 0.5);
        p = { ...p, mana: Math.min(p.maxMana, p.mana + refund) };
        log.push({ text: `Arcane Torrent refunds ${refund} mana!`, type: 'heal' });
      }
      // New necromancer effects
      if (skill.effect === 'corpse_explode') {
        if (b.monsterPoisonTurns > 0) {
          const bonusDmg = Math.floor(dmg * 0.5);
          m.hp = Math.max(0, m.hp - bonusDmg);
          b.monster = m;
          log.push({ text: `Corpse Explosion bonus! ${bonusDmg} extra damage!`, type: 'dmg-monster' });
        }
      }
      if (skill.effect === 'full_drain') {
        const healAmt = dmg;
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Death Coil heals ${healAmt} HP!`, type: 'heal' });
      }
      if (skill.effect === 'wither') {
        const atkRed = Math.max(1, Math.floor(m.atk * 0.25));
        const defRed = Math.max(1, Math.floor(m.def * 0.25));
        m.atk = Math.max(1, m.atk - atkRed);
        m.def = Math.max(0, m.def - defRed);
        b.monster = m;
        log.push({ text: `Wither! Enemy ATK -${atkRed}, DEF -${defRed}!`, type: 'info' });
      }
      if (skill.effect === 'army_drain') {
        const healAmt = Math.floor(dmg * 0.40);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Army of the Dead heals ${healAmt} HP!`, type: 'heal' });
      }
      if (skill.effect === 'nec_apocalypse') {
        b.monsterDoomTurns = 4;
        const healAmt = Math.floor(dmg * 0.30);
        p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
        log.push({ text: `Apocalypse! Doom for 4 turns, heals ${healAmt} HP!`, type: 'info' });
      }

      // Spellweaver: after using a skill, next normal attack +50%
      if (playerHasSkill(p, 'mag_t8a')) {
        b.spellweaverActive = true;
      }

      // Vampiric Aura on tree skill
      if (playerHasSkill(p, 'nec_t3a')) {
        const healAmt = Math.floor(dmg * 0.10);
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Vampiric Aura heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Bloodlust
      if (playerHasSkill(p, 'brs_t3a') && p.hp < battleMaxHp * 0.3) {
        const healAmt = Math.floor(dmg * 0.20);
        if (healAmt > 0 && p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Bloodlust heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Soul Siphon
      if (playerHasSkill(p, 'nec_t1a') && Math.random() < 0.25) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 5) };
        log.push({ text: `Soul Siphon restores 5 mana!`, type: 'heal' });
      }

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log });
      }
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'TOGGLE_SKILL_MENU': {
      if (!state.battle) return state;
      return { ...state, battle: { ...state.battle, showSkillMenu: !state.battle.showSkillMenu } };
    }

    case 'UNLOCK_SKILL': {
      const { skillId } = action;
      const p = { ...state.player };
      const tree = p.skillTree || [];
      // Prevent duplicates
      if (tree.includes(skillId)) return state;
      // Verify the skill exists and the player meets requirements
      const classTree = SKILL_TREES[p.characterClass];
      if (!classTree) return state;
      let valid = false;
      for (const tier of classTree.tiers) {
        if (p.level < tier.level) break;
        // Check if this tier already has a choice
        const tierChoiceIds = tier.choices.map(c => c.id);
        const alreadyChosen = tree.some(id => tierChoiceIds.includes(id));
        if (alreadyChosen) continue;
        if (tierChoiceIds.includes(skillId)) {
          // Check that all previous tiers have been filled
          const tierIdx = classTree.tiers.indexOf(tier);
          let prevFilled = true;
          for (let i = 0; i < tierIdx; i++) {
            const prevIds = classTree.tiers[i].choices.map(c => c.id);
            if (!tree.some(id => prevIds.includes(id))) {
              prevFilled = false;
              break;
            }
          }
          if (prevFilled) valid = true;
          break;
        }
      }
      if (!valid) return state;
      p.skillTree = [...tree, skillId];
      return { ...state, player: p };
    }

    case 'BATTLE_DEFEND': {
      const b = { ...state.battle, defending: true, defendedLastTurn: true, showSkillMenu: false };
      let p = { ...state.player };
      const log = [...state.battleLog, { text: 'You brace for impact!', type: 'info' }];
      // Arcane Barrier: defend restores 10 mana
      if (playerHasSkill(p, 'mag_t7a')) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 10) };
        log.push({ text: 'Arcane Barrier restores 10 mana!', type: 'heal' });
      }
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'BATTLE_USE_POTION': {
      const potionIdx = state.player.inventory.findIndex(i => i.type === 'potion');
      if (potionIdx === -1) return { ...state, message: 'No potions!' };
      const potion = state.player.inventory[potionIdx];
      const bMaxHp = getBattleMaxHp(state.player);
      let potionHeal = potion.healAmount;
      if (playerHasSkill(state.player, 'thf_t5a')) potionHeal = Math.floor(potionHeal * 1.3);
      if (playerHasSkill(state.player, 'nec_t10a')) potionHeal = potionHeal * 2; // Lich Form
      const healed = Math.min(potionHeal, bMaxHp - state.player.hp);
      if (healed === 0) return { ...state, message: 'HP is already full!' };
      const newInv = state.player.inventory.filter((_, i) => i !== potionIdx);
      const p = { ...state.player, hp: state.player.hp + healed, inventory: newInv };
      const b = { ...state.battle, defending: false, showSkillMenu: false };
      const log = [...state.battleLog, { text: `Used ${potion.name}, healed ${healed} HP!`, type: 'heal' }];
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'BOSS_ACCEPT': {
      const boss = state.pendingBoss;
      if (!boss) return { ...state, screen: 'explore', pendingBoss: null };
      return {
        ...state, screen: 'battle',
        pendingBoss: null,
        battle: {
          monster: boss, isPlayerTurn: true, defending: false,
          poisonTurns: 0, atkDebuff: 0, defDebuff: 0, animating: false,
          monsterPoisonTurns: 0, monsterDoomTurns: 0,
          undyingWillUsed: false, deathsEmbraceUsed: false,
          defendedLastTurn: false, dodgeNextTurn: false, dodgeCharges: 0,
          showSkillMenu: false, spellweaverActive: false,
          avatarTurns: 0, armorBreakTurns: 0, cursedBloodPoison: 0,
        },
        battleLog: [
          { text: `BOSS BATTLE!`, type: 'info' },
          { text: `${boss.name} - ${boss.title} appears!`, type: 'info' },
        ],
        battleResult: null,
      };
    }

    case 'BOSS_DECLINE': {
      return {
        ...state, screen: 'explore', pendingBoss: null,
        exploreText: 'You sense a powerful presence but decide to retreat...',
      };
    }

    case 'BATTLE_RUN': {
      const cls = getClassData(state.player);
      let escapeChance = (cls?.passive === 'Greed') ? 0.75 : 0.5;
      if (playerHasSkill(state.player, 'thf_t7a')) escapeChance = 1.0;
      if (Math.random() < escapeChance) {
        return {
          ...state, screen: 'explore', battle: null, battleLog: [],
          exploreText: 'You escaped the battle...',
        };
      }
      const b = { ...state.battle, defending: false };
      const log = [...state.battleLog, { text: 'Failed to escape!', type: 'info' }];
      return { ...state, battle: b, battleLog: log };
    }

    case 'MONSTER_TURN': {
      const b = { ...state.battle };
      let m = { ...b.monster };
      let log = [...state.battleLog];
      let p = { ...state.player };
      const cls = getClassData(p);
      const battleMaxHp = getBattleMaxHp(p);

      // Monster poison tick (from player skills)
      if (b.monsterPoisonTurns > 0) {
        const poisonDmg = Math.floor(m.maxHp * 0.06);
        m.hp = Math.max(0, m.hp - poisonDmg);
        b.monsterPoisonTurns--;
        log.push({ text: `Poison deals ${poisonDmg} to ${m.name}!`, type: 'dmg-monster' });
        if (m.hp <= 0) {
          b.monster = m;
          return handleVictory({ ...state, player: p, battle: b, battleLog: log });
        }
      }
      // Monster doom tick
      if (b.monsterDoomTurns > 0) {
        const doomDmg = Math.floor(m.maxHp * 0.08);
        m.hp = Math.max(0, m.hp - doomDmg);
        b.monsterDoomTurns--;
        log.push({ text: `Doom deals ${doomDmg} to ${m.name}!`, type: 'dmg-monster' });
        if (m.hp <= 0) {
          b.monster = m;
          return handleVictory({ ...state, player: p, battle: b, battleLog: log });
        }
      }

      // Tick down avatar buff
      if (b.avatarTurns > 0) b.avatarTurns--;
      // Tick down armor break
      if (b.armorBreakTurns > 0) {
        b.armorBreakTurns--;
        if (b.armorBreakTurns === 0) {
          // DEF stays reduced (permanent for this fight)
        }
      }

      // Regeneration: heal 3% max HP at start of turn
      if (playerHasSkill(p, 'war_t6a')) {
        const healAmt = Math.floor(battleMaxHp * 0.03);
        if (p.hp < battleMaxHp) {
          p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
          log.push({ text: `Regeneration heals ${healAmt} HP!`, type: 'heal' });
        }
      }
      // Meditation: restore 4 mana
      if (playerHasSkill(p, 'mag_t5a')) {
        p = { ...p, mana: Math.min(p.maxMana, p.mana + 4) };
        log.push({ text: `Meditation restores 4 mana!`, type: 'heal' });
      }
      // Mana Regeneration: restore 8% max mana
      if (playerHasSkill(p, 'mag_t9a')) {
        const manaAmt = Math.floor(p.maxMana * 0.08);
        p = { ...p, mana: Math.min(p.maxMana, p.mana + manaAmt) };
        log.push({ text: `Mana Regen restores ${manaAmt} mana!`, type: 'heal' });
      }

      // Dark Pact: sacrifice 5% HP per turn, ATK boost handled in getPlayerAtk
      if (playerHasSkill(p, 'nec_t4a')) {
        const sacrifice = Math.floor(p.maxHp * 0.05);
        p.hp = Math.max(1, p.hp - sacrifice);
        log.push({ text: `Dark Pact drains ${sacrifice} HP!`, type: 'dmg-player' });
      }

      // Check dodge (Shadow Step, Evasion Mastery, Shadow Dance)
      let dodged = false;
      if (b.dodgeNextTurn) {
        dodged = true;
        b.dodgeNextTurn = false;
        log.push({ text: 'You dodge the attack from the shadows!', type: 'info' });
      } else if (b.dodgeCharges > 0) {
        dodged = true;
        b.dodgeCharges--;
        log.push({ text: 'You dodge the attack from the shadows!', type: 'info' });
      } else {
        const dodgeChance = getPlayerDodgeChance(p);
        if (dodgeChance > 0 && Math.random() < dodgeChance) {
          dodged = true;
          log.push({ text: 'You dodge the attack!', type: 'info' });
        }
      }
      // Aegis: 15% chance to fully block
      if (!dodged && playerHasSkill(p, 'war_t4a') && Math.random() < 0.15) {
        dodged = true;
        log.push({ text: 'Aegis fully blocks the attack!', type: 'info' });
      }

      if (!dodged) {
        const useSkill = m.skills.length > 0 && Math.random() < 0.3;
        const mSkillId = useSkill ? m.skills[Math.floor(Math.random() * m.skills.length)] : null;
        const mSkill = mSkillId ? SKILLS[mSkillId] : null;

        let dmg;
        if (mSkill) {
          const rawAtk = Math.floor(m.atk * mSkill.multiplier);
          dmg = calcDamage(rawAtk, getPlayerDef(p, b));
        } else {
          dmg = calcDamage(m.atk, getPlayerDef(p, b));
        }

        // Defend block
        if (b.defending) {
          let blockMult = 0.5;
          if (cls?.passive === 'Fortify') blockMult = 0.3;
          if (playerHasSkill(p, 'war_t2a')) blockMult = 0.15; // Bulwark: 85% block
          dmg = Math.floor(dmg * blockMult);
        }

        // Iron Skin: 10% less damage
        if (playerHasSkill(p, 'war_t1a')) {
          dmg = Math.floor(dmg * 0.9);
        }
        // Thick Skin: 8% less damage
        if (playerHasSkill(p, 'brs_t5a')) {
          dmg = Math.floor(dmg * 0.92);
        }
        // Fortress: 20% less damage
        if (playerHasSkill(p, 'war_t10a')) {
          dmg = Math.floor(dmg * 0.8);
        }

        // Mana Shield: 20% absorbed by mana
        if (playerHasSkill(p, 'mag_t1a') && p.mana > 0) {
          const manaAbsorb = Math.floor(dmg * 0.2);
          const actualAbsorb = Math.min(manaAbsorb, p.mana);
          p.mana -= actualAbsorb;
          dmg -= actualAbsorb;
          if (actualAbsorb > 0) {
            log.push({ text: `Mana Shield absorbs ${actualAbsorb} damage!`, type: 'info' });
          }
        }

        dmg = Math.max(1, dmg);
        p.hp = Math.max(0, p.hp - dmg);

        if (mSkill) {
          log.push({ text: `${m.name} uses ${mSkill.name} for ${dmg} damage!`, type: 'dmg-player' });
          if (mSkill.effect === 'poison') {
            if (playerHasSkill(p, 'nec_t10a')) {
              log.push({ text: 'Lich Form: immune to poison!', type: 'info' });
            } else {
              let dur = 3;
              if (playerHasSkill(p, 'brs_t7a')) dur = Math.max(1, dur - 1);
              b.poisonTurns = dur;
            }
            log.push({ text: 'You are poisoned!', type: 'dmg-player' });
          } else if (mSkill.effect === 'lower_def') {
            b.defDebuff = (b.defDebuff || 0) + 2;
            log.push({ text: 'Your defense dropped!', type: 'dmg-player' });
          } else if (mSkill.effect === 'lower_atk') {
            b.atkDebuff = (b.atkDebuff || 0) + 2;
            log.push({ text: 'Your attack dropped!', type: 'dmg-player' });
          } else if (mSkill.effect === 'steal_gold') {
            const stolen = Math.floor(Math.random() * 10 + 1);
            p.gold = Math.max(0, p.gold - stolen);
            log.push({ text: `Stole ${stolen} gold!`, type: 'dmg-player' });
          } else if (mSkill.effect === 'drain_hp') {
            const healed = Math.floor(dmg * 0.5);
            m = { ...m, hp: Math.min(m.maxHp, m.hp + healed) };
            log.push({ text: `${m.name} drained ${healed} HP!`, type: 'dmg-player' });
          }
        } else {
          log.push({ text: `${m.name} attacks for ${dmg} damage!`, type: 'dmg-player' });
        }
      }

      // Poison tick on player
      if (b.poisonTurns > 0) {
        const poisonDmg = Math.floor(p.maxHp * 0.05);
        // Indomitable: cannot be reduced below 1 HP by poison
        if (playerHasSkill(p, 'war_t9a')) {
          p.hp = Math.max(1, p.hp - poisonDmg);
        } else {
          p.hp = Math.max(0, p.hp - poisonDmg);
        }
        b.poisonTurns--;
        log.push({ text: `Poison deals ${poisonDmg} damage!`, type: 'dmg-player' });
      }

      // Cursed Blood: 20% chance to poison attacker when hit
      if (!dodged && playerHasSkill(p, 'nec_t8a') && Math.random() < 0.2) {
        b.monsterPoisonTurns = Math.max(b.monsterPoisonTurns, 2);
        log.push({ text: `Cursed Blood poisons ${m.name}!`, type: 'info' });
      }

      // Undying Will: survive lethal at 1 HP
      if (p.hp <= 0 && playerHasSkill(p, 'brs_t2a') && !b.undyingWillUsed) {
        p.hp = 1;
        b.undyingWillUsed = true;
        log.push({ text: `Undying Will! You survive at 1 HP!`, type: 'heal' });
      }

      // Death's Embrace: heal when below 25% HP (once/battle)
      if (playerHasSkill(p, 'nec_t2a') && !b.deathsEmbraceUsed && p.hp > 0 && p.hp < battleMaxHp * 0.25) {
        const healAmt = Math.floor(battleMaxHp * 0.15);
        p.hp = Math.min(battleMaxHp, p.hp + healAmt);
        b.deathsEmbraceUsed = true;
        log.push({ text: `Death's Embrace heals ${healAmt} HP!`, type: 'heal' });
      }

      b.monster = m;
      b.isPlayerTurn = true;
      b.defending = false;

      if (p.hp <= 0) {
        return handleDefeat({ ...state, player: p, battle: b, battleLog: log });
      }

      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'CONTINUE_AFTER_BATTLE': {
      if (state.battleResult?.defeated) {
        return { ...state, screen: 'town', battle: null, battleResult: null, battleLog: [], currentLocation: null };
      }
      return {
        ...state, screen: 'explore', battle: null, battleResult: null, battleLog: [],
        exploreText: 'You continue exploring ' + (state.currentLocation?.name || '') + '...',
      };
    }

    case 'REST_AT_INN': {
      if (state.player.gold < 10) return { ...state, message: 'Not enough gold! (10g needed)' };
      return {
        ...state, message: 'HP restored!',
        player: {
          ...state.player,
          gold: state.player.gold - 10,
          hp: state.player.maxHp,
          mana: state.player.maxMana,
        },
      };
    }

    case 'EQUIP_ITEM': {
      const item = action.item;
      const slot = item.slot;
      const p = { ...state.player, equipment: { ...state.player.equipment } };
      let inv = [...p.inventory];
      if (p.equipment[slot]) {
        inv.push(p.equipment[slot]);
      }
      p.equipment[slot] = item;
      inv = inv.filter(i => i.id !== item.id);
      p.inventory = inv;
      return { ...state, player: p };
    }

    case 'UNEQUIP_ITEM': {
      const p = { ...state.player, equipment: { ...state.player.equipment } };
      if (p.inventory.length >= p.maxInventory) return { ...state, message: 'Inventory full!' };
      const item = p.equipment[action.slot];
      if (!item) return state;
      p.inventory = [...p.inventory, item];
      p.equipment[action.slot] = null;
      return { ...state, player: p };
    }

    case 'USE_ITEM': {
      const item = action.item;
      if (item.type === 'potion') {
        const healed = Math.min(item.healAmount, state.player.maxHp - state.player.hp);
        if (healed === 0) return { ...state, message: 'HP is already full!' };
        const p = {
          ...state.player,
          hp: state.player.hp + healed,
          inventory: state.player.inventory.filter(i => i.id !== item.id),
        };
        return { ...state, player: p, message: `Healed ${healed} HP!` };
      }
      return state;
    }

    case 'SELL_ITEM': {
      const item = action.item;
      const p = {
        ...state.player,
        gold: state.player.gold + item.sellPrice,
        inventory: state.player.inventory.filter(i => i.id !== item.id),
      };
      return { ...state, player: p, message: `Sold for ${item.sellPrice}g!` };
    }

    case 'REORDER_INVENTORY': {
      const inventory = state.player.inventory || [];
      if (inventory.length < 2) return state;
      const fromIndex = Math.max(0, Math.min(action.fromIndex ?? 0, inventory.length - 1));
      let toIndex = Math.max(0, Math.min(action.toIndex ?? fromIndex, inventory.length));
      if (fromIndex === toIndex || fromIndex + 1 === toIndex) return state;
      const newInventory = [...inventory];
      const [moved] = newInventory.splice(fromIndex, 1);
      if (!moved) return state;
      if (fromIndex < toIndex) toIndex -= 1;
      newInventory.splice(toIndex, 0, moved);
      return {
        ...state,
        player: { ...state.player, inventory: newInventory },
      };
    }

    case 'BUY_ITEM': {
      const item = action.item;
      if (state.player.gold < item.buyPrice) return { ...state, message: 'Not enough gold!' };
      if (state.player.inventory.length >= state.player.maxInventory) return { ...state, message: 'Inventory full!' };
      const newItem = { ...item, id: 'item_' + Date.now() + '_' + Math.random() };
      delete newItem.buyPrice;
      const p = {
        ...state.player,
        gold: state.player.gold - item.buyPrice,
        inventory: [...state.player.inventory, newItem],
      };
      return { ...state, player: p, message: `Purchased ${item.name}!` };
    }

    case 'CLEAR_MESSAGE':
      return { ...state, message: null };

    case 'ENERGY_TICK': {
      const now = action.now ?? Date.now();
      const { energy, lastEnergyUpdate } = regenEnergy(state.energy, state.lastEnergyUpdate, now);
      if (energy === state.energy && lastEnergyUpdate === state.lastEnergyUpdate) return state;
      return { ...state, energy, lastEnergyUpdate };
    }

    default:
      return state;
  }
}

function handleVictory(state) {
  const m = state.battle.monster;
  const expGain = m.exp;
  const cls = getClassData(state.player);
  let goldMult = 1.0;
  if (cls?.passive === 'Greed') goldMult *= 1.25;
  if (playerHasSkill(state.player, 'thf_t2a')) goldMult *= 1.50;
  const goldGain = Math.floor(m.gold * goldMult);

  let p = { ...state.player, exp: state.player.exp + expGain, gold: state.player.gold + goldGain };

  const droppedItem = rollDrop(m.dropTable, m.level);
  let lootAdded = false;
  let lostItemName = null;
  if (droppedItem) {
    if (p.inventory.length < p.maxInventory) {
      p.inventory = [...p.inventory, droppedItem];
      lootAdded = true;
    } else {
      lostItemName = droppedItem.name;
    }
  }

  const { player: leveledPlayer, gains } = processLevelUps(p);

  return {
    ...state,
    screen: 'battle-result',
    player: leveledPlayer,
    battleResult: {
      victory: true, expGain, goldGain,
      droppedItem: lootAdded ? droppedItem : null,
      lostItemName,
      levelUps: gains,
      newLevel: leveledPlayer.level,
      isBoss: !!m.isBoss,
      bossName: m.isBoss ? m.name : null,
    },
  };
}

function handleDefeat(state) {
  const m = state.battle.monster;
  const goldLost = Math.floor(state.player.gold * 0.2);
  const p = {
    ...state.player,
    gold: state.player.gold - goldLost,
    hp: Math.floor(state.player.maxHp * 0.3),
    mana: Math.floor(state.player.maxMana * 0.5),
  };

  return {
    ...state,
    screen: 'battle-result',
    player: p,
    battleResult: {
      defeated: true, goldLost,
      isBoss: !!m?.isBoss,
      bossName: m?.isBoss ? m.name : null,
    },
  };
}

// ---- HOOK ----
export function useGameState(isLoggedIn) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const saveTimerRef = useRef(null);
  const lastSaveRef = useRef(null);

  const playerAtk = useMemo(() => getPlayerAtk(state.player, state.battle), [state.player, state.battle]);
  const playerDef = useMemo(() => getPlayerDef(state.player, state.battle), [state.player, state.battle]);

  // Auto-save to server on every meaningful state change (debounced)
  useEffect(() => {
    if (!isLoggedIn) return;
    if (state.screen === 'town' && state.player.level === 1 && state.player.exp === 0 && state.player.gold === 30) {
      // Don't save the initial default state
    }

    const data = extractSaveData(state);
    const serialized = JSON.stringify(data);

    // Skip if nothing changed
    if (serialized === lastSaveRef.current) return;
    lastSaveRef.current = serialized;

    // Debounce saves to avoid flooding the server
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveGame(data).catch(() => {
        // Silent fail - game continues locally
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.player, state.screen, state.energy, state.lastEnergyUpdate, isLoggedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'ENERGY_TICK', now: Date.now() });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const actions = useMemo(() => ({
    startGame: () => dispatch({ type: 'START_GAME' }),
    selectClass: (classId) => dispatch({ type: 'SELECT_CLASS', classId }),
    goToTown: () => dispatch({ type: 'GO_TO_TOWN' }),
    showScreen: (screen) => dispatch({ type: 'SHOW_SCREEN', screen }),
    enterLocation: (loc) => dispatch({ type: 'ENTER_LOCATION', location: loc }),
    exploreStep: () => dispatch({ type: 'EXPLORE_STEP' }),
    battleAttack: () => dispatch({ type: 'BATTLE_PLAYER_ATTACK' }),
    battleSkill: () => dispatch({ type: 'BATTLE_PLAYER_SKILL' }),
    battleTreeSkill: (skillId) => dispatch({ type: 'BATTLE_USE_TREE_SKILL', skillId }),
    battleDefend: () => dispatch({ type: 'BATTLE_DEFEND' }),
    battlePotion: () => dispatch({ type: 'BATTLE_USE_POTION' }),
    battleRun: () => dispatch({ type: 'BATTLE_RUN' }),
    toggleSkillMenu: () => dispatch({ type: 'TOGGLE_SKILL_MENU' }),
    unlockSkill: (skillId) => dispatch({ type: 'UNLOCK_SKILL', skillId }),
    bossAccept: () => dispatch({ type: 'BOSS_ACCEPT' }),
    bossDecline: () => dispatch({ type: 'BOSS_DECLINE' }),
    monsterTurn: () => dispatch({ type: 'MONSTER_TURN' }),
    continueAfterBattle: () => dispatch({ type: 'CONTINUE_AFTER_BATTLE' }),
    restAtInn: () => dispatch({ type: 'REST_AT_INN' }),
    equipItem: (item) => dispatch({ type: 'EQUIP_ITEM', item }),
    unequipItem: (slot) => dispatch({ type: 'UNEQUIP_ITEM', slot }),
    useItem: (item) => dispatch({ type: 'USE_ITEM', item }),
    sellItem: (item) => dispatch({ type: 'SELL_ITEM', item }),
    reorderInventory: (fromIndex, toIndex) => dispatch({ type: 'REORDER_INVENTORY', fromIndex, toIndex }),
    buyItem: (item) => dispatch({ type: 'BUY_ITEM', item }),
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
    loadSave: (saveData) => dispatch({ type: 'LOAD_SAVE', saveData }),
  }), []);

  return { state, actions, playerAtk, playerDef };
}
