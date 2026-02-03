import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  expForLevel, scaleMonster, calcDamage, rollDrop, SKILLS, EXPLORE_TEXTS, generateItem,
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
  };
}

function createInitialState() {
  return {
    screen: 'town',
    player: createInitialPlayer(),
    currentLocation: null,
    battle: null,
    battleLog: [],
    battleResult: null,
    exploreText: '',
    message: null,
    energy: ENERGY_MAX,
    lastEnergyUpdate: Date.now(),
  };
}

// ---- HELPERS ----
function getPlayerAtk(player, battle) {
  let atk = player.baseAtk;
  for (const item of Object.values(player.equipment)) {
    if (item) atk += (item.atk || 0);
  }
  return Math.max(1, atk - (battle?.atkDebuff || 0));
}

function getPlayerDef(player, battle) {
  let def = player.baseDef;
  for (const item of Object.values(player.equipment)) {
    if (item) def += (item.def || 0);
  }
  return Math.max(0, def - (battle?.defDebuff || 0));
}

function processLevelUps(player) {
  const p = { ...player };
  const gains = [];
  while (p.exp >= p.expToLevel) {
    p.exp -= p.expToLevel;
    p.level++;
    p.expToLevel = expForLevel(p.level);
    const hpGain = 8 + Math.floor(Math.random() * 5);
    const atkGain = 1 + Math.floor(Math.random() * 2);
    const defGain = 1 + Math.floor(Math.random() * 2);
    const manaGain = 4 + Math.floor(Math.random() * 3);
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
  return {
    player: state.player,
    screen: (state.screen === 'battle' || state.screen === 'battle-result') ? 'town' : state.screen,
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
      return {
        ...base,
        screen: screen || 'town',
        player: { ...base.player, ...player },
        energy: regen.energy,
        lastEnergyUpdate: regen.lastEnergyUpdate,
      };
    }

    case 'START_GAME':
      return createInitialState();

    case 'GO_TO_TOWN':
      return { ...state, screen: 'town', currentLocation: null, battle: null, battleResult: null, battleLog: [] };

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

      if (Math.random() < loc.encounterRate) {
        const monsterId = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
        const monster = scaleMonster(monsterId, loc.levelReq);
        return {
          ...state, screen: 'battle',
          exploreText: text,
          battle: {
            monster, isPlayerTurn: true, defending: false,
            poisonTurns: 0, atkDebuff: 0, defDebuff: 0, animating: false,
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
      const dmg = calcDamage(getPlayerAtk(state.player, b), m.def);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      const log = [...state.battleLog, { text: `You attack for ${dmg} damage!`, type: 'dmg-monster' }];

      if (m.hp <= 0) {
        return handleVictory({ ...state, battle: b, battleLog: log });
      }
      return { ...state, battle: b, battleLog: log };
    }

    case 'BATTLE_PLAYER_SKILL': {
      const b = { ...state.battle };
      const m = { ...b.monster };
      const dmg = calcDamage(Math.floor(getPlayerAtk(state.player, b) * 1.5), m.def);
      m.hp = Math.max(0, m.hp - dmg);
      b.monster = m;
      b.defending = false;
      const log = [...state.battleLog, { text: `Power Strike for ${dmg} damage!`, type: 'dmg-monster' }];

      if (m.hp <= 0) {
        return handleVictory({ ...state, battle: b, battleLog: log });
      }
      return { ...state, battle: b, battleLog: log };
    }

    case 'BATTLE_DEFEND': {
      const b = { ...state.battle, defending: true };
      const log = [...state.battleLog, { text: 'You brace for impact!', type: 'info' }];
      return { ...state, battle: b, battleLog: log };
    }

    case 'BATTLE_USE_POTION': {
      const potionIdx = state.player.inventory.findIndex(i => i.type === 'potion');
      if (potionIdx === -1) return { ...state, message: 'No potions!' };
      const potion = state.player.inventory[potionIdx];
      const healed = Math.min(potion.healAmount, state.player.maxHp - state.player.hp);
      if (healed === 0) return { ...state, message: 'HP is already full!' };
      const newInv = state.player.inventory.filter((_, i) => i !== potionIdx);
      const p = { ...state.player, hp: state.player.hp + healed, inventory: newInv };
      const b = { ...state.battle, defending: false };
      const log = [...state.battleLog, { text: `Used ${potion.name}, healed ${healed} HP!`, type: 'heal' }];
      return { ...state, player: p, battle: b, battleLog: log };
    }

    case 'BATTLE_RUN': {
      if (Math.random() < 0.5) {
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
      const m = b.monster;
      let log = [...state.battleLog];
      let p = { ...state.player };

      const useSkill = m.skills.length > 0 && Math.random() < 0.3;
      const skillId = useSkill ? m.skills[Math.floor(Math.random() * m.skills.length)] : null;
      const skill = skillId ? SKILLS[skillId] : null;

      if (skill) {
        const rawAtk = Math.floor(m.atk * skill.multiplier);
        let dmg = calcDamage(rawAtk, getPlayerDef(p, b));
        if (b.defending) dmg = Math.floor(dmg * 0.5);
        p.hp = Math.max(0, p.hp - dmg);
        log.push({ text: `${m.name} uses ${skill.name} for ${dmg} damage!`, type: 'dmg-player' });

        if (skill.effect === 'poison') {
          b.poisonTurns = 3;
          log.push({ text: 'You are poisoned!', type: 'dmg-player' });
        } else if (skill.effect === 'lower_def') {
          b.defDebuff = (b.defDebuff || 0) + 2;
          log.push({ text: 'Your defense dropped!', type: 'dmg-player' });
        } else if (skill.effect === 'lower_atk') {
          b.atkDebuff = (b.atkDebuff || 0) + 2;
          log.push({ text: 'Your attack dropped!', type: 'dmg-player' });
        } else if (skill.effect === 'steal_gold') {
          const stolen = Math.floor(Math.random() * 10 + 1);
          p.gold = Math.max(0, p.gold - stolen);
          log.push({ text: `Stole ${stolen} gold!`, type: 'dmg-player' });
        }
      } else {
        let dmg = calcDamage(m.atk, getPlayerDef(p, b));
        if (b.defending) dmg = Math.floor(dmg * 0.5);
        p.hp = Math.max(0, p.hp - dmg);
        log.push({ text: `${m.name} attacks for ${dmg} damage!`, type: 'dmg-player' });
      }

      // Poison tick
      if (b.poisonTurns > 0) {
        const poisonDmg = Math.floor(p.maxHp * 0.05);
        p.hp = Math.max(0, p.hp - poisonDmg);
        b.poisonTurns--;
        log.push({ text: `Poison deals ${poisonDmg} damage!`, type: 'dmg-player' });
      }

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
  const goldGain = m.gold;

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
    },
  };
}

function handleDefeat(state) {
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
    battleResult: { defeated: true, goldLost },
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
    goToTown: () => dispatch({ type: 'GO_TO_TOWN' }),
    showScreen: (screen) => dispatch({ type: 'SHOW_SCREEN', screen }),
    enterLocation: (loc) => dispatch({ type: 'ENTER_LOCATION', location: loc }),
    exploreStep: () => dispatch({ type: 'EXPLORE_STEP' }),
    battleAttack: () => dispatch({ type: 'BATTLE_PLAYER_ATTACK' }),
    battleSkill: () => dispatch({ type: 'BATTLE_PLAYER_SKILL' }),
    battleDefend: () => dispatch({ type: 'BATTLE_DEFEND' }),
    battlePotion: () => dispatch({ type: 'BATTLE_USE_POTION' }),
    battleRun: () => dispatch({ type: 'BATTLE_RUN' }),
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
