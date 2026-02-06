import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { expForLevel, SKILLS, EXPLORE_TEXTS, CHARACTER_CLASSES } from '../data/gameData';
import { SKILL_TREES, getTreeSkill } from '../data/skillTrees';
import { calcDamage, getClassData, playerHasSkill, getEffectiveManaCost, getPlayerAtk, getPlayerDef, getPlayerDodgeChance, getBattleMaxHp, getSkillPassiveBonus, rollSpellEcho, getEffectiveDef, getExecuteMultiplier } from '../engine/combat';
import { applySkillEffect } from '../engine/skillEffects';
import { applyAttackPassives, applySkillPassives, applyLifeTap, tryBladeDance, tryLuckyStrike, applyTurnStartPassives, applyDamageReduction, applyManaShield, checkDodge, applySurvivalPassives, applyCursedBlood } from '../engine/passives';
import { scaleMonster, scaleBoss } from '../engine/scaling';
import { rollDrop, generateItem, generateRewardItem } from '../engine/loot';
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
    screen: 'username-entry',
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
  // Don't save setup screens; they'll see them on load based on player state
  if (screen === 'class-select') screen = 'class-select';
  if (screen === 'username-entry') screen = 'username-entry';
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
      // If the player has no custom name, send them to username entry
      // If they have a name but no class, send them to class select
      let resolvedScreen = screen || 'town';
      if (!mergedPlayer.characterClass) resolvedScreen = 'class-select';
      if (mergedPlayer.name === 'Hero') resolvedScreen = 'username-entry';
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

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log });
      }
      return { ...state, player: p, battle: b, battleLog: log };
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

      if (m.hp <= 0) {
        return handleVictory({ ...state, player: p, battle: b, battleLog: log });
      }
      return { ...state, player: p, battle: b, battleLog: log };
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
    setUsername: (name) => dispatch({ type: 'SET_USERNAME', name }),
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
    claimDailyReward: (rewards, label) => dispatch({ type: 'CLAIM_DAILY_REWARD', rewards, label }),
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
    loadSave: (saveData) => dispatch({ type: 'LOAD_SAVE', saveData }),
  }), []);

  return { state, actions, playerAtk, playerDef };
}
