import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { expForLevel, SKILLS, EXPLORE_TEXTS, CHARACTER_CLASSES, REGIONS } from '../data/gameData';
import { SKILL_TREES, getTreeSkill } from '../data/skillTrees';
import { calcDamage, getClassData, playerHasSkill, getEffectiveManaCost, getPlayerAtk, getPlayerDef, getPlayerDodgeChance, getBattleMaxHp, getBattleMaxMana, getSkillPassiveBonus, rollSpellEcho, getEffectiveDef, getExecuteMultiplier, getCharismaPriceBonus } from '../engine/combat';
import { applySkillEffect } from '../engine/skillEffects';
import { applyAttackPassives, applySkillPassives, applyLifeTap, tryBladeDance, tryLuckyStrike, applyTurnStartPassives, applyDamageReduction, applyManaShield, checkDodge, applySurvivalPassives, applyCursedBlood } from '../engine/passives';
import { scaleMonster, scaleBoss } from '../engine/scaling';
import { rollDrop, generateItem, generateRewardItem, rollMaterialDrop, generateCraftedItem, generateCampLoot } from '../engine/loot';
import { createInitialBase, BUILDINGS, BREWERY_RECIPES, SMELTER_RECIPES, WORKSHOP_RECIPES, BUILDING_MATERIALS, FUEL_ITEMS, getChamberBuffs, getInnExpBonus, createMaterialItem, SPARRING_DUMMIES } from '../data/baseData';
import { saveGame } from '../api';
import {
  createInitialStats, createInitialTaskProgress,
  getActiveDailyTasks, getActiveWeeklyTasks, getActiveMonthlyTasks,
  STORY_TASKS,
  isDailyExpired, isWeeklyExpired, isMonthlyExpired,
  getDailySeed, getWeeklySeed, getMonthlySeed,
} from '../data/tasks';

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
    charisma: 3,
    wisdom: 3,
    athletics: 3,
    gold: 30,
    equipment: { weapon: null, shield: null, helmet: null, armor: null, boots: null, accessory: null },
    inventory: [],
    maxInventory: 20,
    skillTree: [],
  };
}

function createInitialState() {
  return {
    screen: 'username-entry',
    player: createInitialPlayer(),
    currentRegion: null,
    currentLocation: null,
    battle: null,
    battleLog: [],
    battleResult: null,
    exploreText: '',
    message: null,
    energy: ENERGY_MAX,
    lastEnergyUpdate: Date.now(),
    pendingBoss: null,
    stats: createInitialStats(),
    tasks: createInitialTaskProgress(),
    base: createInitialBase(),
  };
}

// ---- STAT TRACKING HELPERS ----
function addStat(stats, key, amount = 1) {
  return { ...stats, [key]: (stats[key] || 0) + amount };
}

function setStatMax(stats, key, value) {
  return { ...stats, [key]: Math.max(stats[key] || 0, value) };
}

// Check if any resettable task cycles have expired and reset them
function refreshTaskCycles(tasks) {
  const now = Date.now();
  let t = tasks;
  if (isDailyExpired(t.lastDailySeed, now)) {
    t = { ...t, dailyProgress: {}, dailyClaimed: [], lastDailySeed: getDailySeed(now) };
  }
  if (isWeeklyExpired(t.lastWeeklySeed, now)) {
    t = { ...t, weeklyProgress: {}, weeklyClaimed: [], lastWeeklySeed: getWeeklySeed(now) };
  }
  if (isMonthlyExpired(t.lastMonthlySeed, now)) {
    t = { ...t, monthlyProgress: {}, monthlyClaimed: [], lastMonthlySeed: getMonthlySeed(now) };
  }
  return t;
}

// Increment task progress for matching stat key
function incrementTaskProgress(tasks, statKey, amount = 1) {
  const now = Date.now();
  let t = refreshTaskCycles(tasks);

  // Helper to update progress for a task list
  const updateProgress = (activeTasks, progress) => {
    const updated = { ...progress };
    for (const task of activeTasks) {
      if (task.stat === statKey) {
        updated[task.id] = (updated[task.id] || 0) + amount;
      }
    }
    return updated;
  };

  return {
    ...t,
    dailyProgress: updateProgress(getActiveDailyTasks(now), t.dailyProgress),
    weeklyProgress: updateProgress(getActiveWeeklyTasks(now), t.weeklyProgress),
    monthlyProgress: updateProgress(getActiveMonthlyTasks(now), t.monthlyProgress),
  };
}

// ---- HELPERS ----
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
    const charismaGain = (growth?.charisma ?? 0) + Math.floor(Math.random() * (growth?.charismaRand ?? 1));
    const wisdomGain = (growth?.wisdom ?? 0) + Math.floor(Math.random() * (growth?.wisdomRand ?? 1));
    const athleticsGain = (growth?.athletics ?? 0) + Math.floor(Math.random() * (growth?.athleticsRand ?? 1));
    p.maxHp += hpGain;
    p.hp = p.maxHp;
    p.maxMana += manaGain;
    p.mana = p.maxMana;
    p.baseAtk += atkGain;
    p.baseDef += defGain;
    p.charisma = (p.charisma || 0) + charismaGain;
    p.wisdom = (p.wisdom || 0) + wisdomGain;
    p.athletics = (p.athletics || 0) + athleticsGain;
    gains.push({ hpGain, atkGain, defGain, manaGain, charismaGain, wisdomGain, athleticsGain });
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
  // Don't save setup screens; they'll see them on load based on player state
  if (screen === 'class-select') screen = 'class-select';
  if (screen === 'username-entry') screen = 'username-entry';
  return {
    player: state.player,
    screen: (state.screen === 'battle' || state.screen === 'battle-result' || state.screen === 'boss-confirm') ? 'town' : state.screen,
    energy: state.energy,
    lastEnergyUpdate: state.lastEnergyUpdate,
    currentRegionId: state.currentRegion?.id || null,
    stats: state.stats,
    tasks: state.tasks,
    base: state.base,
  };
}

// ---- REDUCER ----
function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_SAVE': {
      const { player, screen, energy, lastEnergyUpdate, currentRegionId, stats, tasks, base: savedBase } = action.saveData || {};
      const baseState = createInitialState();
      const regen = regenEnergy(
        energy ?? baseState.energy,
        lastEnergyUpdate ?? baseState.lastEnergyUpdate,
      );
      const mergedPlayer = { ...baseState.player, ...player };
      // If the player has no custom name, send them to username entry
      // If they have a name but no class, send them to class select
      let resolvedScreen = screen || 'town';
      if (!mergedPlayer.characterClass) resolvedScreen = 'class-select';
      if (mergedPlayer.name === 'Hero') resolvedScreen = 'username-entry';
      const savedRegion = currentRegionId ? REGIONS.find(r => r.id === currentRegionId) : null;
      const mergedStats = { ...createInitialStats(), ...stats };
      const mergedTasks = refreshTaskCycles({ ...createInitialTaskProgress(), ...tasks });
      const mergedBase = { ...createInitialBase(), ...savedBase };
      return {
        ...baseState,
        screen: resolvedScreen,
        player: mergedPlayer,
        energy: regen.energy,
        lastEnergyUpdate: regen.lastEnergyUpdate,
        currentRegion: savedRegion,
        stats: mergedStats,
        tasks: mergedTasks,
        base: mergedBase,
      };
    }

    case 'START_GAME':
      return createInitialState();

    case 'SET_USERNAME': {
      const name = action.name;
      if (!name || name.length < 2) return state;
      return {
        ...state,
        screen: 'class-select',
        player: { ...state.player, name },
      };
    }

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
        charisma: cls.baseStats.charisma,
        wisdom: cls.baseStats.wisdom,
        athletics: cls.baseStats.athletics,
      };
      return { ...state, screen: 'town', player: p };
    }

    case 'GO_TO_TOWN':
      return { ...state, screen: 'town', currentRegion: null, currentLocation: null, battle: null, battleResult: null, battleLog: [], pendingBoss: null };

    case 'SHOW_SCREEN':
      return { ...state, screen: action.screen };

    case 'SELECT_REGION': {
      const region = action.region;
      if (!region) return state;
      const cost = region.travelCost || 0;
      if (cost > 0 && state.player.gold < cost) {
        return { ...state, message: `Not enough gold for the ticket! (${cost}g needed)` };
      }
      return {
        ...state,
        screen: 'locations',
        currentRegion: region,
        player: cost > 0
          ? { ...state.player, gold: state.player.gold - cost }
          : state.player,
      };
    }

    case 'BACK_TO_REGIONS':
      return { ...state, screen: 'regions', currentRegion: null };

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

      // Drain energy each time the player continues exploring
      const nowExplore = Date.now();
      const exploreRegen = regenEnergy(state.energy, state.lastEnergyUpdate, nowExplore);
      if (exploreRegen.energy < ENERGY_COST_PER_TRIP) {
        return {
          ...state,
          energy: exploreRegen.energy,
          lastEnergyUpdate: exploreRegen.lastEnergyUpdate,
          screen: 'town',
          currentLocation: null,
          message: 'Too exhausted to continue. Wait for energy to recover.',
        };
      }
      const exploreEnergy = exploreRegen.energy - ENERGY_COST_PER_TRIP;
      const exploreLastUpdate = exploreRegen.lastEnergyUpdate;

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
            energy: exploreEnergy,
            lastEnergyUpdate: exploreLastUpdate,
          };
        }
      }

      if (Math.random() < loc.encounterRate) {
        const monsterId = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
        const monster = scaleMonster(monsterId, loc.levelReq);
        return {
          ...state, screen: 'battle',
          exploreText: text,
          energy: exploreEnergy,
          lastEnergyUpdate: exploreLastUpdate,
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
      const lootTable = ['potion', 'ring', 'boots', 'helmet', 'armor', 'sword', 'shield', 'energy-drink'];

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
      // Track exploration
      let newStats = addStat(state.stats, 'explorationsCompleted');
      let newTasks = incrementTaskProgress(state.tasks, 'explorationsCompleted');
      if (newPlayer !== state.player && newPlayer.inventory.length > state.player.inventory.length) {
        newStats = addStat(newStats, 'itemsLooted');
        newTasks = incrementTaskProgress(newTasks, 'itemsLooted');
      }
      if (newPlayer !== state.player && newPlayer.gold > state.player.gold) {
        const goldFound = newPlayer.gold - state.player.gold;
        newStats = addStat(newStats, 'goldEarned', goldFound);
        newTasks = incrementTaskProgress(newTasks, 'goldEarned', goldFound);
      }
      return { ...state, exploreText: newText, player: newPlayer, stats: newStats, tasks: newTasks, energy: exploreEnergy, lastEnergyUpdate: exploreLastUpdate };
    }

    case 'BATTLE_PLAYER_ATTACK': {
      let b = { ...state.battle };
      let m = { ...b.monster };
      let p = { ...state.player };
      const cls = getClassData(p);
      let dmg = calcDamage(getPlayerAtk(p, b), m.def);

      const lucky = tryLuckyStrike(p, dmg);
      dmg = lucky.dmg;

      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      let log = [...state.battleLog];
      if (lucky.procced) {
        log.push({ text: `Lucky Strike! Double damage for ${dmg}!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `You attack for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Post-attack passives (lifetap, vampiric aura, soul siphon, bloodlust, etc.)
      ({ player: p, monster: m, battle: b, log } = applyAttackPassives({ player: p, monster: m, battle: b, log, dmg, cls }));

      // Blade Dance: 10% chance to attack twice
      const blade = tryBladeDance(p, b, calcDamage, getPlayerAtk);
      if (blade.attacked) {
        m = { ...m, hp: Math.max(0, m.hp - blade.dmg) };
        b = { ...b, monster: m };
        log.push({ text: `Blade Dance! Extra attack for ${blade.dmg}!`, type: 'dmg-monster' });
      }

      // Track total damage dealt
      let totalDmg = dmg + (blade.attacked ? blade.dmg : 0);
      let newStats = addStat(state.stats, 'damageDealt', totalDmg);
      newStats = setStatMax(newStats, 'highestDamage', dmg);
      let newTasks = incrementTaskProgress(state.tasks, 'damageDealt', totalDmg);

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks });
      }
      return { ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks };
    }

    case 'BATTLE_PLAYER_SKILL': {
      let b = { ...state.battle };
      let m = { ...b.monster };
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

      let passiveBonus = getSkillPassiveBonus(p);
      const echoProc = rollSpellEcho(p);
      if (echoProc) passiveBonus *= 2;
      const atkValue = Math.floor(getPlayerAtk(p, b) * skillMult * passiveBonus);

      p = applyLifeTap(p, manaCost);

      const effectiveDef = getEffectiveDef(m.def, skillEffect);
      const dmg = calcDamage(atkValue, effectiveDef);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      let log = [...state.battleLog];
      if (echoProc) {
        log.push({ text: `Spell Echo! ${skillName} for ${dmg} damage!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `${skillName} for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Apply class skill effect (recoil, weaken, drain, etc.)
      if (skillEffect) {
        const battleMaxHp = getBattleMaxHp(p);
        const fx = applySkillEffect(skillEffect, { dmg, player: p, monster: m, battle: b, battleMaxHp, log, manaCost });
        p = fx.player || p;
        m = fx.monster || m;
        b = fx.battle || b;
        log = fx.log || log;
        if (fx.monster) b = { ...b, monster: m };
      }

      // Post-skill passives (vampiric aura, bloodlust, soul siphon)
      ({ player: p, log } = applySkillPassives({ player: p, log, dmg }));

      // Track damage
      let newStats = addStat(state.stats, 'damageDealt', dmg);
      newStats = setStatMax(newStats, 'highestDamage', dmg);
      let newTasks = incrementTaskProgress(state.tasks, 'damageDealt', dmg);

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks });
      }
      return { ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks };
    }

    case 'BATTLE_USE_TREE_SKILL': {
      let b = { ...state.battle };
      let m = { ...b.monster };
      let p = { ...state.player };
      const skill = getTreeSkill(action.skillId);
      if (!skill || skill.type !== 'active') return state;
      const manaCost = getEffectiveManaCost(p, skill.manaCost || 0);
      if (manaCost > 0 && p.mana < manaCost) {
        return { ...state, message: `Not enough mana! (${manaCost} needed)` };
      }
      p = { ...p, mana: p.mana - manaCost };

      let passiveBonus = getSkillPassiveBonus(p);
      const echoProc = rollSpellEcho(p);
      if (echoProc) passiveBonus *= 2;
      const atkValue = Math.floor(getPlayerAtk(p, b) * skill.multiplier * passiveBonus);
      const battleMaxHp = getBattleMaxHp(p);

      p = applyLifeTap(p, manaCost);

      const effectiveDef = getEffectiveDef(m.def, skill.effect);
      let finalMult = getExecuteMultiplier(skill.effect, m.hp, m.maxHp);
      if (skill.effect === 'counter' && b.defendedLastTurn) finalMult = 1.25;

      const dmg = calcDamage(Math.floor(atkValue * finalMult), effectiveDef);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      b.defendedLastTurn = false;
      b.showSkillMenu = false;
      let log = [...state.battleLog];
      if (echoProc) {
        log.push({ text: `Spell Echo! ${skill.name} for ${dmg} damage!`, type: 'dmg-monster' });
      } else {
        log.push({ text: `${skill.name} for ${dmg} damage!`, type: 'dmg-monster' });
      }

      // Apply skill effect via data-driven registry
      if (skill.effect) {
        const fx = applySkillEffect(skill.effect, { dmg, player: p, monster: m, battle: b, battleMaxHp, log, manaCost });
        p = fx.player || p;
        m = fx.monster || m;
        b = fx.battle || b;
        log = fx.log || log;
        if (fx.monster) b = { ...b, monster: m };
      }

      // Spellweaver: after using a skill, next normal attack +50%
      if (playerHasSkill(p, 'mag_t8a')) {
        b = { ...b, spellweaverActive: true };
      }

      // Post-skill passives (vampiric aura, bloodlust, soul siphon)
      ({ player: p, log } = applySkillPassives({ player: p, log, dmg }));

      // Track damage
      let newStats = addStat(state.stats, 'damageDealt', dmg);
      newStats = setStatMax(newStats, 'highestDamage', dmg);
      let newTasks = incrementTaskProgress(state.tasks, 'damageDealt', dmg);

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks });
      }
      return { ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks };
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
      const newStats = addStat(state.stats, 'skillsUnlocked');
      const newTasks = incrementTaskProgress(state.tasks, 'skillsUnlocked');
      return { ...state, player: p, stats: newStats, tasks: newTasks };
    }

    case 'BATTLE_DEFEND': {
      const b = { ...state.battle, defending: true, defendedLastTurn: true, showSkillMenu: false };
      let p = { ...state.player };
      const log = [...state.battleLog, { text: 'You brace for impact!', type: 'info' }];
      // Arcane Barrier: defend restores 10 mana
      if (playerHasSkill(p, 'mag_t7a')) {
        const battleMana = getBattleMaxMana(p);
        p = { ...p, mana: Math.min(battleMana, p.mana + 10) };
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
      let newStats = addStat(state.stats, 'potionsUsed');
      newStats = addStat(newStats, 'totalHealing', healed);
      let newTasks = incrementTaskProgress(state.tasks, 'potionsUsed');
      return { ...state, player: p, battle: b, battleLog: log, stats: newStats, tasks: newTasks };
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
        const newStats = addStat(state.stats, 'battlesRun');
        return {
          ...state, screen: 'explore', battle: null, battleLog: [],
          exploreText: 'You escaped the battle...',
          stats: newStats,
        };
      }
      const b = { ...state.battle, defending: false };
      const log = [...state.battleLog, { text: 'Failed to escape!', type: 'info' }];
      return { ...state, battle: b, battleLog: log };
    }

    case 'MONSTER_TURN': {
      let b = { ...state.battle };
      let m = { ...b.monster };
      let log = [...state.battleLog];
      let p = { ...state.player };
      const cls = getClassData(p);

      // Monster poison tick
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

      // Tick down buffs
      if (b.avatarTurns > 0) b.avatarTurns--;
      if (b.armorBreakTurns > 0) b.armorBreakTurns--;

      // Turn-start passives (regeneration, meditation, mana regen, dark pact)
      ({ player: p, log } = applyTurnStartPassives({ player: p, battle: b, log }));

      // Check dodge (shadow step, evasion mastery, shadow dance, aegis)
      let dodged;
      ({ dodged, battle: b, log } = checkDodge(p, b, log));

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

        // Damage reduction passives (defend, iron skin, thick skin, fortress)
        dmg = applyDamageReduction(dmg, p, b, cls);

        // Mana Shield absorption
        const shield = applyManaShield(dmg, p);
        dmg = shield.dmg;
        if (shield.manaUsed > 0) {
          p = { ...p, mana: p.mana - shield.manaUsed };
          log.push({ text: `Mana Shield absorbs ${shield.manaUsed} damage!`, type: 'info' });
        }

        dmg = Math.max(1, dmg);
        p = { ...p, hp: Math.max(0, p.hp - dmg) };

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
            p = { ...p, gold: Math.max(0, p.gold - stolen) };
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

      // Player poison tick
      if (b.poisonTurns > 0) {
        const poisonDmg = Math.floor(p.maxHp * 0.05);
        if (playerHasSkill(p, 'war_t9a')) {
          p = { ...p, hp: Math.max(1, p.hp - poisonDmg) };
        } else {
          p = { ...p, hp: Math.max(0, p.hp - poisonDmg) };
        }
        b.poisonTurns--;
        log.push({ text: `Poison deals ${poisonDmg} damage!`, type: 'dmg-player' });
      }

      // Cursed Blood: chance to poison attacker when hit
      if (!dodged) {
        ({ battle: b, log } = applyCursedBlood(p, b, log));
      }

      // Survival passives (undying will, death's embrace)
      ({ player: p, battle: b, log } = applySurvivalPassives({ player: p, battle: b, log }));

      b.monster = m;
      b.isPlayerTurn = true;
      b.defending = false;

      // Track damage taken (difference from start hp)
      const hpLost = Math.max(0, state.player.hp - p.hp);
      const newStats = hpLost > 0 ? addStat(state.stats, 'damageTaken', hpLost) : state.stats;

      if (p.hp <= 0) {
        return handleDefeat({ ...state, player: p, battle: b, battleLog: log, stats: newStats });
      }

      return { ...state, player: p, battle: b, battleLog: log, stats: newStats };
    }

    case 'CONTINUE_AFTER_BATTLE': {
      if (state.battleResult?.defeated) {
        return { ...state, screen: 'town', battle: null, battleResult: null, battleLog: [], currentLocation: null, currentRegion: null };
      }
      return {
        ...state, screen: 'explore', battle: null, battleResult: null, battleLog: [],
        exploreText: 'You continue exploring ' + (state.currentLocation?.name || '') + '...',
      };
    }

    case 'REST_AT_INN': {
      if (state.player.gold < 10) return { ...state, message: 'Not enough gold! (10g needed)' };
      const chamberBuffs = getChamberBuffs(state.base);
      const healBonus = chamberBuffs.healBonus || 0;
      const newStats = addStat(state.stats, 'goldSpent', 10);
      const maxHpWithBuff = state.player.maxHp + (chamberBuffs.hpBuff || 0);
      const maxManaWithBuff = state.player.maxMana + (chamberBuffs.manaBuff || 0);
      return {
        ...state, message: healBonus > 0 ? `HP restored! (+${Math.round(healBonus * 100)}% chamber bonus)` : 'HP restored!',
        stats: newStats,
        player: {
          ...state.player,
          gold: state.player.gold - 10,
          hp: maxHpWithBuff,
          mana: maxManaWithBuff,
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
        let newStats = addStat(state.stats, 'potionsUsed');
        newStats = addStat(newStats, 'totalHealing', healed);
        const newTasks = incrementTaskProgress(state.tasks, 'potionsUsed');
        return { ...state, player: p, message: `Healed ${healed} HP!`, stats: newStats, tasks: newTasks };
      }
      if (item.type === 'energy-drink') {
        const now = Date.now();
        const { energy: currentEnergy, lastEnergyUpdate: currentLEU } = regenEnergy(state.energy, state.lastEnergyUpdate, now);
        if (currentEnergy >= ENERGY_MAX) return { ...state, message: 'Energy is already full!' };
        const restored = Math.min(item.energyAmount, ENERGY_MAX - currentEnergy);
        const p = {
          ...state.player,
          inventory: state.player.inventory.filter(i => i.id !== item.id),
        };
        return {
          ...state,
          player: p,
          energy: currentEnergy + restored,
          lastEnergyUpdate: now,
          message: `Restored ${restored} energy!`,
        };
      }
      // Material items: "use" stores them in base
      if (item.type === 'material') {
        const matId = item.materialId;
        const qty = item.stackQuantity || 1;
        const mats = { ...state.base.materials };
        mats[matId] = (mats[matId] || 0) + qty;
        const p = { ...state.player, inventory: state.player.inventory.filter(i => i.id !== item.id) };
        return {
          ...state,
          player: p,
          base: { ...state.base, materials: mats },
          message: `Stored ${qty}x ${item.name} in base.`,
        };
      }
      return state;
    }

    case 'SELL_ITEM': {
      const item = action.item;
      const charismaBonus = getCharismaPriceBonus(state.player);
      const adjustedSellPrice = Math.floor(item.sellPrice * (1 + charismaBonus));
      const p = {
        ...state.player,
        gold: state.player.gold + adjustedSellPrice,
        inventory: state.player.inventory.filter(i => i.id !== item.id),
      };
      let newStats = addStat(state.stats, 'itemsSold');
      newStats = addStat(newStats, 'goldEarned', item.sellPrice);
      let newTasks = incrementTaskProgress(state.tasks, 'itemsSold');
      newTasks = incrementTaskProgress(newTasks, 'goldEarned', item.sellPrice);
      return { ...state, player: p, message: `Sold for ${item.sellPrice}g!`, stats: newStats, tasks: newTasks };
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
      const charismaBuyBonus = getCharismaPriceBonus(state.player);
      const adjustedBuyPrice = Math.max(1, Math.floor(item.buyPrice * (1 - charismaBuyBonus)));
      if (state.player.gold < adjustedBuyPrice) return { ...state, message: 'Not enough gold!' };
      if (state.player.inventory.length >= state.player.maxInventory) return { ...state, message: 'Inventory full!' };
      const newItem = { ...item, id: 'item_' + Date.now() + '_' + Math.random() };
      delete newItem.buyPrice;
      const p = {
        ...state.player,
        gold: state.player.gold - adjustedBuyPrice,
        inventory: [...state.player.inventory, newItem],
      };
      const newStats = addStat(state.stats, 'goldSpent', item.buyPrice);
      return { ...state, player: p, message: `Purchased ${item.name}!`, stats: newStats };
    }

    case 'APPLY_TRADE': {
      // After accepting a trade: add received items, remove given items, adjust gold
      const { receivedItems, receivedGold, givenItems, givenGold } = action;
      let p = { ...state.player, inventory: [...state.player.inventory] };
      // Remove given items
      if (givenItems && givenItems.length > 0) {
        const givenIds = new Set(givenItems.map(i => i.id));
        p.inventory = p.inventory.filter(i => !givenIds.has(i.id));
      }
      // Add received items
      if (receivedItems && receivedItems.length > 0) {
        p.inventory = p.inventory.concat(receivedItems);
      }
      // Adjust gold
      p.gold = (p.gold || 0) + (receivedGold || 0) - (givenGold || 0);
      return { ...state, player: p, message: 'Trade completed!' };
    }

    case 'MARKET_TRANSACTION': {
      const tx = action.transaction;
      let p = { ...state.player, inventory: [...state.player.inventory] };
      if (tx.type === 'buy') {
        // Add purchased item, update gold to server-reported value
        if (tx.item) p.inventory = [...p.inventory, tx.item];
        if (tx.newGold !== undefined) p.gold = tx.newGold;
      } else if (tx.type === 'list') {
        // Remove listed item, update gold (listing fee deducted)
        if (tx.removedItemId) p.inventory = p.inventory.filter(i => i.id !== tx.removedItemId);
        if (tx.newGold !== undefined) p.gold = tx.newGold;
      } else if (tx.type === 'cancel') {
        // Return cancelled item to inventory
        if (tx.returnedItem) p.inventory = [...p.inventory, tx.returnedItem];
      }
      return { ...state, player: p };
    }

    case 'CLEAR_MESSAGE':
      return { ...state, message: null };

    case 'CLAIM_DAILY_REWARD': {
      const { rewards, label } = action;
      if (!rewards || rewards.length === 0) return state;
      let p = { ...state.player, inventory: [...state.player.inventory] };
      let newEnergy = state.energy;
      const itemNames = [];
      for (const r of rewards) {
        switch (r.kind) {
          case 'gold':
            p.gold += r.amount;
            break;
          case 'energy':
            newEnergy = Math.min(ENERGY_MAX, newEnergy + r.amount);
            break;
          case 'item':
          case 'potion': {
            if (p.inventory.length < p.maxInventory) {
              const generated = generateRewardItem(r, p.level);
              if (generated) {
                p.inventory.push(generated);
                itemNames.push(generated.name);
              }
            }
            break;
          }
        }
      }
      const msg = itemNames.length > 0
        ? `Day reward: ${label} (${itemNames.join(', ')})`
        : `Day reward: ${label}`;
      return { ...state, player: p, energy: newEnergy, message: msg };
    }

    case 'CLAIM_TASK': {
      const { taskId, taskType } = action;
      const tasks = refreshTaskCycles(state.tasks);
      const claimedKey = taskType + 'Claimed';
      if (tasks[claimedKey]?.includes(taskId)) return state; // already claimed

      // Find the task definition and verify completion
      const now = Date.now();
      let taskDef = null;
      let progress = 0;
      if (taskType === 'daily') {
        taskDef = getActiveDailyTasks(now).find(t => t.id === taskId);
        progress = tasks.dailyProgress[taskId] || 0;
      } else if (taskType === 'weekly') {
        taskDef = getActiveWeeklyTasks(now).find(t => t.id === taskId);
        progress = tasks.weeklyProgress[taskId] || 0;
      } else if (taskType === 'monthly') {
        taskDef = getActiveMonthlyTasks(now).find(t => t.id === taskId);
        progress = tasks.monthlyProgress[taskId] || 0;
      } else if (taskType === 'story') {
        taskDef = STORY_TASKS.find(t => t.id === taskId);
        progress = state.stats[taskDef?.stat] || 0;
      }

      if (!taskDef || progress < taskDef.target) return state;

      // Apply reward
      let p = { ...state.player };
      if (taskDef.reward.gold) {
        p.gold += taskDef.reward.gold;
      }

      const newStats = taskDef.reward.gold ? addStat(state.stats, 'goldEarned', taskDef.reward.gold) : state.stats;
      const newTasks = {
        ...tasks,
        [claimedKey]: [...(tasks[claimedKey] || []), taskId],
      };

      return {
        ...state,
        player: p,
        stats: newStats,
        tasks: newTasks,
        message: `Task complete: ${taskDef.name}! +${taskDef.reward.gold || 0}g`,
      };
    }

    case 'ENERGY_TICK': {
      const now = action.now ?? Date.now();
      const { energy, lastEnergyUpdate } = regenEnergy(state.energy, state.lastEnergyUpdate, now);
      if (energy === state.energy && lastEnergyUpdate === state.lastEnergyUpdate) return state;
      return { ...state, energy, lastEnergyUpdate };
    }

    // ========== BASE BUILDING SYSTEM ==========

    case 'BASE_BUILD': {
      const buildingDef = BUILDINGS[action.buildingId];
      if (!buildingDef) return state;
      if (state.base.buildings[action.buildingId]?.built) return { ...state, message: 'Already built!' };
      if (state.player.level < buildingDef.levelReq) return { ...state, message: `Requires level ${buildingDef.levelReq}!` };

      const cost = buildingDef.buildCost;
      if (state.player.gold < cost.gold) return { ...state, message: `Need ${cost.gold}g! (have ${state.player.gold}g)` };

      const mats = { ...state.base.materials };
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        if ((mats[matId] || 0) < qty) {
          const matName = BUILDING_MATERIALS[matId]?.name || matId;
          return { ...state, message: `Need ${qty}x ${matName}! (have ${mats[matId] || 0})` };
        }
      }

      // Deduct costs
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        mats[matId] = (mats[matId] || 0) - qty;
      }

      const newBase = {
        ...state.base,
        materials: mats,
        buildings: { ...state.base.buildings, [action.buildingId]: { built: true, level: 1 } },
      };

      return {
        ...state,
        base: newBase,
        player: { ...state.player, gold: state.player.gold - cost.gold },
        message: `${buildingDef.name} constructed!`,
      };
    }

    case 'BASE_ADD_FUEL': {
      const item = action.item;
      if (!item || item.type !== 'material' || !item.isFuel) return { ...state, message: 'This item cannot be used as fuel!' };
      const fuelData = FUEL_ITEMS[item.materialId];
      if (!fuelData) return { ...state, message: 'Not a valid fuel!' };

      const p = { ...state.player, inventory: state.player.inventory.filter(i => i.id !== item.id) };
      const now = Date.now();
      let currentFuel = state.base.fuel || 0;
      // Recalculate elapsed fuel
      if (state.base.fuelLastUpdate) {
        const elapsed = (now - state.base.fuelLastUpdate) / 60000; // minutes
        currentFuel = Math.max(0, currentFuel - elapsed);
      }

      return {
        ...state,
        player: p,
        base: {
          ...state.base,
          fuel: currentFuel + fuelData.burnTime,
          fuelLastUpdate: now,
        },
        message: `Added ${fuelData.name}! +${fuelData.burnTime} min fuel.`,
      };
    }

    case 'BASE_ADD_FUEL_FROM_STORAGE': {
      const matId = action.materialId;
      const fuelData = FUEL_ITEMS[matId];
      if (!fuelData) return { ...state, message: 'Not a valid fuel!' };
      const mats = { ...state.base.materials };
      if ((mats[matId] || 0) < 1) return { ...state, message: 'No fuel materials in storage!' };
      mats[matId] = (mats[matId] || 0) - 1;

      const now = Date.now();
      let currentFuel = state.base.fuel || 0;
      if (state.base.fuelLastUpdate) {
        const elapsed = (now - state.base.fuelLastUpdate) / 60000;
        currentFuel = Math.max(0, currentFuel - elapsed);
      }

      return {
        ...state,
        base: { ...state.base, materials: mats, fuel: currentFuel + fuelData.burnTime, fuelLastUpdate: now },
        message: `Burned ${fuelData.name}! +${fuelData.burnTime} min fuel.`,
      };
    }

    case 'BASE_STORE_MATERIAL': {
      const item = action.item;
      if (!item || item.type !== 'material') return state;
      const matId = item.materialId;
      const qty = item.stackQuantity || 1;
      const mats = { ...state.base.materials };
      mats[matId] = (mats[matId] || 0) + qty;
      const p = { ...state.player, inventory: state.player.inventory.filter(i => i.id !== item.id) };
      return {
        ...state,
        player: p,
        base: { ...state.base, materials: mats },
        message: `Stored ${qty}x ${item.name}.`,
      };
    }

    case 'BASE_BREW': {
      if (!state.base.buildings.brewery?.built) return { ...state, message: 'Build a Brewery first!' };
      if (state.base.craftingQueue) return { ...state, message: 'Already crafting something!' };

      // Check fuel
      const now = Date.now();
      let currentFuel = state.base.fuel || 0;
      if (state.base.fuelLastUpdate) {
        const elapsed = (now - state.base.fuelLastUpdate) / 60000;
        currentFuel = Math.max(0, currentFuel - elapsed);
      }
      if (currentFuel <= 0) return { ...state, message: 'No fuel! Add wood, charcoal, or other fuel.' };

      const recipe = BREWERY_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      const mats = { ...state.base.materials };
      for (const [matId, qty] of Object.entries(recipe.materials)) {
        if ((mats[matId] || 0) < qty) {
          const matName = BUILDING_MATERIALS[matId]?.name || matId;
          return { ...state, message: `Need ${qty}x ${matName}!` };
        }
      }
      for (const [matId, qty] of Object.entries(recipe.materials)) {
        mats[matId] -= qty;
      }

      return {
        ...state,
        base: {
          ...state.base,
          materials: mats,
          fuel: currentFuel,
          fuelLastUpdate: now,
          craftingQueue: { recipeId: recipe.id, building: 'brewery', startTime: now, craftTime: recipe.craftTime },
        },
        message: `Brewing ${recipe.name}...`,
      };
    }

    case 'BASE_SMELT': {
      if (!state.base.buildings.smelter?.built) return { ...state, message: 'Build a Smelter first!' };
      if (state.base.craftingQueue) return { ...state, message: 'Already crafting something!' };

      const now = Date.now();
      let currentFuel = state.base.fuel || 0;
      if (state.base.fuelLastUpdate) {
        const elapsed = (now - state.base.fuelLastUpdate) / 60000;
        currentFuel = Math.max(0, currentFuel - elapsed);
      }
      if (currentFuel <= 0) return { ...state, message: 'No fuel! Add wood, charcoal, or other fuel.' };

      const recipe = SMELTER_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      const mats = { ...state.base.materials };
      if (recipe.materials) {
        for (const [matId, qty] of Object.entries(recipe.materials)) {
          if ((mats[matId] || 0) < qty) {
            const matName = BUILDING_MATERIALS[matId]?.name || matId;
            return { ...state, message: `Need ${qty}x ${matName}!` };
          }
        }
        for (const [matId, qty] of Object.entries(recipe.materials)) {
          mats[matId] -= qty;
        }
      }

      // Handle salvage gear (smelt equipment from inventory)
      let p = state.player;
      if (recipe.salvageGear) {
        const gearItem = action.gearItem;
        if (!gearItem || !gearItem.slot) return { ...state, message: 'Select an equipment item to salvage!' };
        p = { ...state.player, inventory: state.player.inventory.filter(i => i.id !== gearItem.id) };
      }

      return {
        ...state,
        player: p,
        base: {
          ...state.base,
          materials: mats,
          fuel: currentFuel,
          fuelLastUpdate: now,
          craftingQueue: { recipeId: recipe.id, building: 'smelter', startTime: now, craftTime: recipe.craftTime },
        },
        message: `Smelting ${recipe.name}...`,
      };
    }

    case 'BASE_CRAFT': {
      if (!state.base.buildings.workshop?.built) return { ...state, message: 'Build a Workshop first!' };
      if (state.base.craftingQueue) return { ...state, message: 'Already crafting something!' };

      const now = Date.now();
      let currentFuel = state.base.fuel || 0;
      if (state.base.fuelLastUpdate) {
        const elapsed = (now - state.base.fuelLastUpdate) / 60000;
        currentFuel = Math.max(0, currentFuel - elapsed);
      }
      if (currentFuel <= 0) return { ...state, message: 'No fuel! Add wood, charcoal, or other fuel.' };

      const recipe = WORKSHOP_RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;

      const mats = { ...state.base.materials };
      for (const [matId, qty] of Object.entries(recipe.materials)) {
        if ((mats[matId] || 0) < qty) {
          const matName = BUILDING_MATERIALS[matId]?.name || matId;
          return { ...state, message: `Need ${qty}x ${matName}!` };
        }
      }
      for (const [matId, qty] of Object.entries(recipe.materials)) {
        mats[matId] -= qty;
      }

      return {
        ...state,
        base: {
          ...state.base,
          materials: mats,
          fuel: currentFuel,
          fuelLastUpdate: now,
          craftingQueue: { recipeId: recipe.id, building: 'workshop', startTime: now, craftTime: recipe.craftTime },
        },
        message: `Crafting ${recipe.name}...`,
      };
    }

    case 'BASE_COLLECT_CRAFT': {
      const queue = state.base.craftingQueue;
      if (!queue) return { ...state, message: 'Nothing is being crafted!' };
      const now = Date.now();
      if (now - queue.startTime < queue.craftTime) return { ...state, message: 'Still crafting...' };

      let p = { ...state.player, inventory: [...state.player.inventory] };
      let msg = 'Collected!';

      if (queue.building === 'brewery') {
        const recipe = BREWERY_RECIPES.find(r => r.id === queue.recipeId);
        if (recipe) {
          const item = generateItem(recipe.result.type, Math.max(1, state.player.level));
          if (item && p.inventory.length < p.maxInventory) {
            p.inventory.push(item);
            msg = `Brewed ${item.name}!`;
          } else {
            return { ...state, message: 'Inventory full!' };
          }
        }
      } else if (queue.building === 'smelter') {
        const recipe = SMELTER_RECIPES.find(r => r.id === queue.recipeId);
        if (recipe?.result) {
          const mats = { ...state.base.materials };
          mats[recipe.result.materialId] = (mats[recipe.result.materialId] || 0) + recipe.result.quantity;
          const matName = BUILDING_MATERIALS[recipe.result.materialId]?.name || recipe.result.materialId;
          msg = `Smelted ${recipe.result.quantity}x ${matName}!`;
          return {
            ...state,
            player: p,
            base: { ...state.base, materials: mats, craftingQueue: null },
            message: msg,
          };
        }
      } else if (queue.building === 'workshop') {
        const recipe = WORKSHOP_RECIPES.find(r => r.id === queue.recipeId);
        if (recipe?.result?.template) {
          const item = generateCraftedItem(recipe.result.template, state.player.level);
          if (item && p.inventory.length < p.maxInventory) {
            p.inventory.push(item);
            msg = `Crafted ${item.name}!`;
          } else {
            return { ...state, message: 'Inventory full!' };
          }
        }
      }

      return {
        ...state,
        player: p,
        base: { ...state.base, craftingQueue: null },
        message: msg,
      };
    }

    case 'BASE_UPGRADE_INN': {
      if (!state.base.buildings.inn?.built) return { ...state, message: 'Build an Inn first!' };
      const currentLevel = state.base.innLevel || 1;
      const nextUpgrade = BUILDINGS.inn.upgrades.find(u => u.level === currentLevel + 1);
      if (!nextUpgrade) return { ...state, message: 'Inn is at max level!' };
      const cost = nextUpgrade.upgradeCost;
      if (!cost) return state;
      if (state.player.gold < cost.gold) return { ...state, message: `Need ${cost.gold}g!` };

      const mats = { ...state.base.materials };
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        if ((mats[matId] || 0) < qty) {
          const matName = BUILDING_MATERIALS[matId]?.name || matId;
          return { ...state, message: `Need ${qty}x ${matName}!` };
        }
      }
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        mats[matId] -= qty;
      }

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - cost.gold },
        base: { ...state.base, materials: mats, innLevel: currentLevel + 1 },
        message: `Inn upgraded to ${nextUpgrade.name}! ${nextUpgrade.desc}`,
      };
    }

    case 'BASE_BUY_INN_BOOST': {
      if (!state.base.buildings.inn?.built) return { ...state, message: 'Build an Inn first!' };
      const innLvl = state.base.innLevel || 1;
      const tierData = BUILDINGS.inn.upgrades.find(u => u.level === innLvl);
      if (!tierData || !tierData.boosts) return state;
      const boost = tierData.boosts.find(b => b.id === action.boostId);
      if (!boost) return state;
      if (state.player.gold < boost.cost) return { ...state, message: `Need ${boost.cost}g!` };

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - boost.cost },
        base: {
          ...state.base,
          innBoost: {
            expBonus: tierData.expBonus,
            startTime: Date.now(),
            duration: boost.duration,
            boostName: boost.name,
          },
        },
        message: `${boost.name} activated! ${boost.desc}`,
      };
    }

    case 'BASE_UPGRADE_CHAMBER': {
      if (!state.base.buildings.chamber?.built) return { ...state, message: 'Build a Chamber first!' };
      const subId = action.subUpgradeId; // 'bed', 'kitchen', 'study'
      const subDef = BUILDINGS.chamber.subUpgrades[subId];
      if (!subDef) return state;

      const currentLevel = (state.base.chamberUpgrades || {})[subId] || 0;
      const nextLevel = subDef.levels[currentLevel]; // 0-indexed, currentLevel is next to unlock
      if (!nextLevel) return { ...state, message: `${subDef.name} is at max level!` };

      const cost = nextLevel.cost;
      if (state.player.gold < cost.gold) return { ...state, message: `Need ${cost.gold}g!` };

      const mats = { ...state.base.materials };
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        if ((mats[matId] || 0) < qty) {
          const matName = BUILDING_MATERIALS[matId]?.name || matId;
          return { ...state, message: `Need ${qty}x ${matName}!` };
        }
      }
      for (const [matId, qty] of Object.entries(cost.materials || {})) {
        mats[matId] -= qty;
      }

      const chamberUpgrades = { ...state.base.chamberUpgrades, [subId]: currentLevel + 1 };

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - cost.gold },
        base: { ...state.base, materials: mats, chamberUpgrades },
        message: `${nextLevel.name} installed! ${nextLevel.desc}`,
      };
    }

    case 'BASE_SEND_MISSION': {
      if (!state.base.buildings.adventureCamp?.built) return { ...state, message: 'Build an Adventure Camp first!' };
      if (state.base.activeMission) return { ...state, message: 'A squad is already out!' };
      const mission = BUILDINGS.adventureCamp.missions.find(m => m.id === action.missionId);
      if (!mission) return state;

      return {
        ...state,
        base: {
          ...state.base,
          activeMission: { missionId: mission.id, startTime: Date.now(), duration: mission.duration },
        },
        message: `Squad sent on ${mission.name}! Returns in ${mission.desc.split(' - ')[0]}.`,
      };
    }

    case 'BASE_COLLECT_MISSION': {
      const mission = state.base.activeMission;
      if (!mission) return { ...state, message: 'No active mission!' };
      const now = Date.now();
      if (now - mission.startTime < mission.duration) {
        const remaining = Math.ceil((mission.duration - (now - mission.startTime)) / 60000);
        return { ...state, message: `Squad returns in ${remaining} min!` };
      }

      const missionDef = BUILDINGS.adventureCamp.missions.find(m => m.id === mission.missionId);
      if (!missionDef) return state;

      // Generate gold
      const goldMin = missionDef.goldRange[0];
      const goldMax = missionDef.goldRange[1];
      const goldReward = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));

      // Generate loot
      const lootItems = generateCampLoot(missionDef.lootTier, state.player.level);

      let p = { ...state.player, gold: state.player.gold + goldReward, inventory: [...state.player.inventory] };
      const mats = { ...state.base.materials };
      const addedNames = [];

      for (const item of lootItems) {
        if (item.type === 'material') {
          const matId = item.materialId;
          const qty = item.stackQuantity || 1;
          mats[matId] = (mats[matId] || 0) + qty;
          addedNames.push(`${qty}x ${item.name}`);
        } else if (p.inventory.length < p.maxInventory) {
          p.inventory.push(item);
          addedNames.push(item.name);
        }
      }

      const lootMsg = addedNames.length > 0 ? ` Loot: ${addedNames.join(', ')}` : '';

      return {
        ...state,
        player: p,
        base: { ...state.base, materials: mats, activeMission: null },
        message: `Squad returned! +${goldReward}g.${lootMsg}`,
      };
    }

    case 'BASE_BANK_DEPOSIT': {
      if (!state.base.buildings.bank?.built) return { ...state, message: 'Build a Bank first!' };
      const amount = Math.floor(action.amount || 0);
      if (amount <= 0) return state;
      if (state.player.gold < amount) return { ...state, message: 'Not enough gold!' };
      const fee = Math.floor(amount * BUILDINGS.bank.depositFee);
      const deposited = amount - fee;

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - amount },
        base: { ...state.base, bankDeposit: (state.base.bankDeposit || 0) + deposited },
        message: `Deposited ${deposited}g (${fee}g fee). Safe balance: ${(state.base.bankDeposit || 0) + deposited}g`,
      };
    }

    case 'BASE_BANK_WITHDRAW': {
      if (!state.base.buildings.bank?.built) return { ...state, message: 'Build a Bank first!' };
      const amount = Math.floor(action.amount || 0);
      if (amount <= 0) return state;
      if ((state.base.bankDeposit || 0) < amount) return { ...state, message: 'Not enough in deposit!' };

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold + amount },
        base: { ...state.base, bankDeposit: (state.base.bankDeposit || 0) - amount },
        message: `Withdrew ${amount}g. Wallet: ${state.player.gold + amount}g`,
      };
    }

    case 'BASE_BANK_FREEZE': {
      if (!state.base.buildings.bank?.built) return { ...state, message: 'Build a Bank first!' };
      if (state.base.frozenGold) return { ...state, message: 'Already have frozen gold!' };
      const amount = Math.floor(action.amount || 0);
      const option = BUILDINGS.bank.freezeOptions.find(o => o.id === action.freezeOptionId);
      if (!option) return state;
      if (amount <= 0 || amount > BUILDINGS.bank.maxFreezeAmount) return { ...state, message: `Freeze limit: 1-${BUILDINGS.bank.maxFreezeAmount}g` };
      if ((state.base.bankDeposit || 0) < amount) return { ...state, message: 'Not enough in deposit!' };

      return {
        ...state,
        base: {
          ...state.base,
          bankDeposit: (state.base.bankDeposit || 0) - amount,
          frozenGold: {
            amount,
            startTime: Date.now(),
            duration: option.days * 24 * 60 * 60 * 1000,
            interestRate: option.interestRate,
            optionDesc: option.desc,
          },
        },
        message: `Froze ${amount}g for ${option.days} days at ${option.interestRate * 100}% interest.`,
      };
    }

    case 'BASE_BANK_COLLECT_FROZEN': {
      if (!state.base.frozenGold) return { ...state, message: 'No frozen gold!' };
      const frozen = state.base.frozenGold;
      const now = Date.now();
      if (now - frozen.startTime < frozen.duration) {
        const daysLeft = Math.ceil((frozen.duration - (now - frozen.startTime)) / (24 * 60 * 60 * 1000));
        return { ...state, message: `${daysLeft} day(s) remaining before unfreezing.` };
      }
      const interest = Math.floor(frozen.amount * frozen.interestRate);
      const total = frozen.amount + interest;

      return {
        ...state,
        base: {
          ...state.base,
          bankDeposit: (state.base.bankDeposit || 0) + total,
          frozenGold: null,
        },
        message: `Unfroze ${frozen.amount}g + ${interest}g interest = ${total}g!`,
      };
    }

    case 'BASE_BANK_LOAN': {
      if (!state.base.buildings.bank?.built) return { ...state, message: 'Build a Bank first!' };
      if (state.base.loan) return { ...state, message: 'Already have an active loan!' };
      const amount = Math.floor(action.amount || 0);
      if (amount <= 0 || amount > BUILDINGS.bank.maxLoanAmount) return { ...state, message: `Loan limit: 1-${BUILDINGS.bank.maxLoanAmount}g` };

      // Loan due in 7 days with 15% interest
      const dueTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const repayAmount = Math.floor(amount * 1.15);

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold + amount },
        base: { ...state.base, loan: { amount: repayAmount, dueTime } },
        message: `Borrowed ${amount}g. Repay ${repayAmount}g within 7 days.`,
      };
    }

    case 'BASE_BANK_REPAY': {
      if (!state.base.loan) return { ...state, message: 'No active loan!' };
      const owed = state.base.loan.amount;
      if (state.player.gold < owed) return { ...state, message: `Need ${owed}g to repay! (have ${state.player.gold}g)` };

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold - owed },
        base: { ...state.base, loan: null },
        message: `Loan repaid! (${owed}g)`,
      };
    }

    case 'BASE_START_SPAR': {
      if (!state.base.buildings.sparringRange?.built) return { ...state, message: 'Build a Sparring Range first!' };
      const dummy = SPARRING_DUMMIES.find(d => d.id === action.dummyId);
      if (!dummy) return state;
      return {
        ...state,
        base: { ...state.base, sparringDummy: dummy, sparringHp: dummy.hp },
      };
    }

    case 'BASE_SPAR_ATTACK': {
      if (!state.base.sparringDummy) return state;
      const dummy = state.base.sparringDummy;
      const p = state.player;
      const atkBonus = Object.values(p.equipment || {}).reduce((sum, item) => sum + (item?.atk || 0), 0);
      const chamberBuffs = getChamberBuffs(state.base);
      const totalAtk = p.baseAtk + atkBonus + (chamberBuffs.atkBuff || 0);
      const dmg = Math.max(1, totalAtk - dummy.def + Math.floor(Math.random() * 5));
      const newHp = Math.max(0, (state.base.sparringHp || 0) - dmg);

      return {
        ...state,
        base: { ...state.base, sparringHp: newHp },
        message: newHp <= 0 ? `Dummy destroyed! You dealt ${dmg} damage.` : `Hit for ${dmg}! Dummy HP: ${newHp}/${dummy.hp}`,
      };
    }

    case 'BASE_SPAR_SKILL': {
      if (!state.base.sparringDummy) return state;
      const dummy = state.base.sparringDummy;
      const p = state.player;
      const cls = getClassData(p);
      const skillMult = cls?.skillMultiplier || 1.5;
      const atkBonus = Object.values(p.equipment || {}).reduce((sum, item) => sum + (item?.atk || 0), 0);
      const chamberBuffs = getChamberBuffs(state.base);
      const totalAtk = p.baseAtk + atkBonus + (chamberBuffs.atkBuff || 0);
      const rawDmg = Math.floor(totalAtk * skillMult);
      const dmg = Math.max(1, rawDmg - dummy.def + Math.floor(Math.random() * 5));
      const newHp = Math.max(0, (state.base.sparringHp || 0) - dmg);

      return {
        ...state,
        base: { ...state.base, sparringHp: newHp },
        message: newHp <= 0 ? `Dummy destroyed! Skill dealt ${dmg} damage.` : `Skill hit for ${dmg}! Dummy HP: ${newHp}/${dummy.hp}`,
      };
    }

    case 'BASE_RESET_SPAR': {
      return {
        ...state,
        base: { ...state.base, sparringDummy: null, sparringHp: 0 },
      };
    }

    default:
      return state;
  }
}

function handleVictory(state) {
  const m = state.battle.monster;
  const innBonus = getInnExpBonus(state.base);
  const expGain = Math.floor(m.exp * (1 + innBonus));
  const cls = getClassData(state.player);
  let goldMult = 1.0;
  if (cls?.passive === 'Greed') goldMult *= 1.25;
  if (playerHasSkill(state.player, 'thf_t2a')) goldMult *= 1.50;
  const goldGain = Math.floor(m.gold * goldMult);

  let p = { ...state.player, exp: state.player.exp + expGain, gold: state.player.gold + goldGain };

  // Roll for building material drop based on region
  let materialDrop = null;
  const regionId = state.currentRegion?.id;
  if (regionId) {
    materialDrop = rollMaterialDrop(regionId);
    if (materialDrop && p.inventory.length < p.maxInventory) {
      p.inventory = [...p.inventory, materialDrop];
    } else if (materialDrop) {
      materialDrop = null; // inventory full
    }
  }

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

  const prevLevel = state.player.level;
  const { player: leveledPlayer, gains } = processLevelUps(p);

  // Track stats
  let newStats = state.stats || createInitialStats();
  newStats = addStat(newStats, 'monstersKilled');
  newStats = addStat(newStats, 'battlesWon');
  newStats = addStat(newStats, 'goldEarned', goldGain);
  if (m.isBoss) newStats = addStat(newStats, 'bossesKilled');
  if (lootAdded) newStats = addStat(newStats, 'itemsLooted');
  if (leveledPlayer.level > prevLevel) {
    newStats = addStat(newStats, 'levelsGained', leveledPlayer.level - prevLevel);
  }

  // Track tasks
  let newTasks = state.tasks || createInitialTaskProgress();
  newTasks = incrementTaskProgress(newTasks, 'monstersKilled');
  newTasks = incrementTaskProgress(newTasks, 'battlesWon');
  newTasks = incrementTaskProgress(newTasks, 'goldEarned', goldGain);
  if (m.isBoss) newTasks = incrementTaskProgress(newTasks, 'bossesKilled');
  if (lootAdded) newTasks = incrementTaskProgress(newTasks, 'itemsLooted');
  if (leveledPlayer.level > prevLevel) {
    newTasks = incrementTaskProgress(newTasks, 'levelsGained', leveledPlayer.level - prevLevel);
  }

  return {
    ...state,
    screen: 'battle-result',
    player: leveledPlayer,
    stats: newStats,
    tasks: newTasks,
    battleResult: {
      victory: true, expGain, goldGain,
      droppedItem: lootAdded ? droppedItem : null,
      materialDrop: materialDrop || null,
      lostItemName,
      levelUps: gains,
      newLevel: leveledPlayer.level,
      isBoss: !!m.isBoss,
      bossName: m.isBoss ? m.name : null,
      innBonus: innBonus > 0 ? innBonus : null,
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

  const newStats = addStat(state.stats || createInitialStats(), 'battlesLost');

  return {
    ...state,
    screen: 'battle-result',
    player: p,
    stats: newStats,
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
  }, [state.player, state.screen, state.energy, state.lastEnergyUpdate, state.stats, state.tasks, state.base, isLoggedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'ENERGY_TICK', now: Date.now() });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const actions = useMemo(() => ({
    startGame: () => dispatch({ type: 'START_GAME' }),
    setUsername: (name) => dispatch({ type: 'SET_USERNAME', name }),
    selectClass: (classId) => dispatch({ type: 'SELECT_CLASS', classId }),
    goToTown: () => dispatch({ type: 'GO_TO_TOWN' }),
    showScreen: (screen) => dispatch({ type: 'SHOW_SCREEN', screen }),
    selectRegion: (region) => dispatch({ type: 'SELECT_REGION', region }),
    backToRegions: () => dispatch({ type: 'BACK_TO_REGIONS' }),
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
    claimDailyReward: (rewards, label) => dispatch({ type: 'CLAIM_DAILY_REWARD', rewards, label }),
    claimTask: (taskId, taskType) => dispatch({ type: 'CLAIM_TASK', taskId, taskType }),
    applyTrade: (receivedItems, receivedGold, givenItems, givenGold) => dispatch({ type: 'APPLY_TRADE', receivedItems, receivedGold, givenItems, givenGold }),
    applyMarketTransaction: (transaction) => dispatch({ type: 'MARKET_TRANSACTION', transaction }),
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
    loadSave: (saveData) => dispatch({ type: 'LOAD_SAVE', saveData }),
    // Base building actions
    baseBuild: (buildingId) => dispatch({ type: 'BASE_BUILD', buildingId }),
    baseAddFuel: (item) => dispatch({ type: 'BASE_ADD_FUEL', item }),
    baseAddFuelFromStorage: (materialId) => dispatch({ type: 'BASE_ADD_FUEL_FROM_STORAGE', materialId }),
    baseStoreMaterial: (item) => dispatch({ type: 'BASE_STORE_MATERIAL', item }),
    baseBrew: (recipeId) => dispatch({ type: 'BASE_BREW', recipeId }),
    baseSmelt: (recipeId, gearItem) => dispatch({ type: 'BASE_SMELT', recipeId, gearItem }),
    baseCraft: (recipeId) => dispatch({ type: 'BASE_CRAFT', recipeId }),
    baseCollectCraft: () => dispatch({ type: 'BASE_COLLECT_CRAFT' }),
    baseUpgradeInn: () => dispatch({ type: 'BASE_UPGRADE_INN' }),
    baseBuyInnBoost: (boostId) => dispatch({ type: 'BASE_BUY_INN_BOOST', boostId }),
    baseUpgradeChamber: (subUpgradeId) => dispatch({ type: 'BASE_UPGRADE_CHAMBER', subUpgradeId }),
    baseSendMission: (missionId) => dispatch({ type: 'BASE_SEND_MISSION', missionId }),
    baseCollectMission: () => dispatch({ type: 'BASE_COLLECT_MISSION' }),
    baseBankDeposit: (amount) => dispatch({ type: 'BASE_BANK_DEPOSIT', amount }),
    baseBankWithdraw: (amount) => dispatch({ type: 'BASE_BANK_WITHDRAW', amount }),
    baseBankFreeze: (amount, freezeOptionId) => dispatch({ type: 'BASE_BANK_FREEZE', amount, freezeOptionId }),
    baseBankCollectFrozen: () => dispatch({ type: 'BASE_BANK_COLLECT_FROZEN' }),
    baseBankLoan: (amount) => dispatch({ type: 'BASE_BANK_LOAN', amount }),
    baseBankRepay: () => dispatch({ type: 'BASE_BANK_REPAY' }),
    baseStartSpar: (dummyId) => dispatch({ type: 'BASE_START_SPAR', dummyId }),
    baseSparAttack: () => dispatch({ type: 'BASE_SPAR_ATTACK' }),
    baseSparSkill: () => dispatch({ type: 'BASE_SPAR_SKILL' }),
    baseResetSpar: () => dispatch({ type: 'BASE_RESET_SPAR' }),
  }), []);

  return { state, actions, playerAtk, playerDef };
}
