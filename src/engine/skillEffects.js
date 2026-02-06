// Data-driven skill effect registry
// Each effect handler receives { dmg, player, monster, battle, battleMaxHp, log, manaCost }
// and returns { player, monster, battle, log } with modifications applied.
//
// To add a new skill effect, simply add a new entry to EFFECT_HANDLERS.
// No need to touch the reducer or battle logic.

const EFFECT_HANDLERS = {
  // ---- Recoil effects (self-damage) ----
  recoil_small: ({ player, log }) => {
    const recoil = Math.floor(player.maxHp * 0.05);
    player = { ...player, hp: Math.max(1, player.hp - recoil) };
    log.push({ text: `Recoil deals ${recoil} to you!`, type: 'dmg-player' });
    return { player, log };
  },
  recoil_heavy: ({ player, log }) => {
    const recoil = Math.floor(player.maxHp * 0.2);
    player = { ...player, hp: Math.max(1, player.hp - recoil) };
    log.push({ text: `Recoil deals ${recoil} to you!`, type: 'dmg-player' });
    return { player, log };
  },
  recoil_extreme: ({ player, log }) => {
    const recoil = Math.floor(player.maxHp * 0.3);
    player = { ...player, hp: Math.max(1, player.hp - recoil) };
    log.push({ text: `Extreme recoil deals ${recoil} to you!`, type: 'dmg-player' });
    return { player, log };
  },
  recoil: ({ player, log }) => {
    const recoil = Math.floor(player.maxHp * 0.1);
    player = { ...player, hp: Math.max(1, player.hp - recoil) };
    log.push({ text: `Recoil deals ${recoil} damage to you!`, type: 'dmg-player' });
    return { player, log };
  },

  // ---- Enemy ATK reduction ----
  war_cry: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.25));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  weaken: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.15));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  weaken_15: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.15));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  freeze: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.20));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Ice Lance! Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  frost_nova: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.30));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Frost Nova! Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  cheap_shot: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.atk * 0.20));
    monster = { ...monster, atk: Math.max(1, monster.atk - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Cheap Shot! Enemy ATK reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },

  // ---- Enemy DEF reduction ----
  shred_def: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.def * 0.4));
    monster = { ...monster, def: Math.max(0, monster.def - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Enemy DEF reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  quake: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.def * 0.3));
    monster = { ...monster, def: Math.max(0, monster.def - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Earthquake! Enemy DEF reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },
  chain_lightning: ({ monster, battle, log }) => {
    const reduction = Math.max(1, Math.floor(monster.def * 0.25));
    monster = { ...monster, def: Math.max(0, monster.def - reduction) };
    battle = { ...battle, monster };
    log.push({ text: `Chain Lightning! Enemy DEF reduced by ${reduction}!`, type: 'info' });
    return { monster, battle, log };
  },

  // ---- Combined ATK+DEF reduction ----
  blizzard: ({ monster, battle, log }) => {
    const atkRed = Math.max(1, Math.floor(monster.atk * 0.15));
    const defRed = Math.max(1, Math.floor(monster.def * 0.15));
    monster = { ...monster, atk: Math.max(1, monster.atk - atkRed), def: Math.max(0, monster.def - defRed) };
    battle = { ...battle, monster };
    log.push({ text: `Blizzard! Enemy ATK -${atkRed}, DEF -${defRed}!`, type: 'info' });
    return { monster, battle, log };
  },
  wither: ({ monster, battle, log }) => {
    const atkRed = Math.max(1, Math.floor(monster.atk * 0.25));
    const defRed = Math.max(1, Math.floor(monster.def * 0.25));
    monster = { ...monster, atk: Math.max(1, monster.atk - atkRed), def: Math.max(0, monster.def - defRed) };
    battle = { ...battle, monster };
    log.push({ text: `Wither! Enemy ATK -${atkRed}, DEF -${defRed}!`, type: 'info' });
    return { monster, battle, log };
  },

  // ---- Poison/DoT effects ----
  apply_poison: ({ battle, log }) => {
    battle = { ...battle, monsterPoisonTurns: 3 };
    log.push({ text: `Enemy is poisoned!`, type: 'info' });
    return { battle, log };
  },
  apply_poison_short: ({ battle, log }) => {
    battle = { ...battle, monsterPoisonTurns: Math.max(battle.monsterPoisonTurns, 2) };
    log.push({ text: `Enemy is poisoned!`, type: 'info' });
    return { battle, log };
  },
  strong_poison: ({ battle, log }) => {
    battle = { ...battle, monsterPoisonTurns: 4 };
    log.push({ text: `Enemy is plagued!`, type: 'info' });
    return { battle, log };
  },
  strong_poison_3: ({ battle, log }) => {
    battle = { ...battle, monsterPoisonTurns: Math.max(battle.monsterPoisonTurns, 3) };
    log.push({ text: `Enemy is severely poisoned!`, type: 'info' });
    return { battle, log };
  },
  doom: ({ battle, log }) => {
    battle = { ...battle, monsterDoomTurns: 3 };
    log.push({ text: `Doom! Enemy will take damage over time!`, type: 'info' });
    return { battle, log };
  },

  // ---- Dodge effects ----
  shadow_dance: ({ battle, log }) => {
    battle = { ...battle, dodgeNextTurn: true };
    log.push({ text: `You vanish into shadows! Dodge next attack!`, type: 'info' });
    return { battle, log };
  },
  shadow_dance_2: ({ battle, log }) => {
    battle = { ...battle, dodgeCharges: 2 };
    log.push({ text: `You vanish into shadows! Dodge next 2 attacks!`, type: 'info' });
    return { battle, log };
  },
  phantom_blade: ({ battle, log }) => {
    battle = { ...battle, dodgeNextTurn: true };
    log.push({ text: `Phantom Blade! Dodge next attack!`, type: 'info' });
    return { battle, log };
  },

  // ---- Heal-on-hit effects ----
  final_stand: ({ dmg, player, battleMaxHp, log }) => {
    const healAmt = Math.floor(dmg * 0.30);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Final Stand heals ${healAmt} HP!`, type: 'heal' });
    return { player, log };
  },
  soul_harvest: ({ dmg, player, battleMaxHp, log }) => {
    const healAmt = Math.floor(dmg * 0.60);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Soul Harvest heals ${healAmt} HP!`, type: 'heal' });
    return { player, log };
  },
  drain: ({ dmg, player, battleMaxHp, log }) => {
    const healAmt = Math.floor(dmg * 0.4);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Drained ${healAmt} HP!`, type: 'heal' });
    return { player, log };
  },
  full_drain: ({ dmg, player, battleMaxHp, log }) => {
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + dmg) };
    log.push({ text: `Death Coil heals ${dmg} HP!`, type: 'heal' });
    return { player, log };
  },
  army_drain: ({ dmg, player, battleMaxHp, log }) => {
    const healAmt = Math.floor(dmg * 0.40);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Army of the Dead heals ${healAmt} HP!`, type: 'heal' });
    return { player, log };
  },
  rally_heal: ({ player, battleMaxHp, log }) => {
    const healAmt = Math.floor(battleMaxHp * 0.20);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Rallying Blow heals ${healAmt} HP!`, type: 'heal' });
    return { player, log };
  },

  // ---- Mana effects ----
  heroic_mana: ({ player, log }) => {
    player = { ...player, mana: Math.min(player.maxMana, player.mana + 5) };
    log.push({ text: `Heroic Strike restores 5 mana!`, type: 'heal' });
    return { player, log };
  },
  mana_refund: ({ player, manaCost, log }) => {
    const refund = Math.floor(manaCost * 0.5);
    player = { ...player, mana: Math.min(player.maxMana, player.mana + refund) };
    log.push({ text: `Arcane Torrent refunds ${refund} mana!`, type: 'heal' });
    return { player, log };
  },

  // ---- Armor break / buff ----
  armor_break: ({ monster, battle, log }) => {
    monster = { ...monster, def: 0 };
    battle = { ...battle, armorBreakTurns: 2, monster };
    log.push({ text: `Colossus Smash! Enemy DEF reduced to 0 for 2 turns!`, type: 'info' });
    return { monster, battle, log };
  },
  avatar: ({ battle, log }) => {
    battle = { ...battle, avatarTurns: 3 };
    log.push({ text: `Avatar of War! DEF +50% for 3 turns!`, type: 'info' });
    return { battle, log };
  },

  // ---- Blood Nova: heal + recoil combo ----
  blood_nova: ({ dmg, player, battleMaxHp, log }) => {
    const healAmt = Math.floor(dmg * 0.25);
    const recoil = Math.floor(player.maxHp * 0.1);
    player = { ...player, hp: Math.min(battleMaxHp, Math.max(1, player.hp + healAmt - recoil)) };
    log.push({ text: `Blood Nova heals ${healAmt}, recoil ${recoil}!`, type: 'info' });
    return { player, log };
  },

  // ---- Conditional bonus damage ----
  corpse_explode: ({ dmg, monster, battle, log }) => {
    if (battle.monsterPoisonTurns > 0) {
      const bonusDmg = Math.floor(dmg * 0.5);
      monster = { ...monster, hp: Math.max(0, monster.hp - bonusDmg) };
      battle = { ...battle, monster };
      log.push({ text: `Corpse Explosion bonus! ${bonusDmg} extra damage!`, type: 'dmg-monster' });
    }
    return { monster, battle, log };
  },

  // ---- Complex combo effects ----
  nec_apocalypse: ({ dmg, player, battle, battleMaxHp, log }) => {
    battle = { ...battle, monsterDoomTurns: 4 };
    const healAmt = Math.floor(dmg * 0.30);
    player = { ...player, hp: Math.min(battleMaxHp, player.hp + healAmt) };
    log.push({ text: `Apocalypse! Doom for 4 turns, heals ${healAmt} HP!`, type: 'info' });
    return { player, battle, log };
  },

  // ---- No-op effects (handled elsewhere via pierce/execute logic) ----
  shield_slam: ({ log }) => {
    log.push({ text: `Shield Slam! DEF adds to damage!`, type: 'info' });
    return { log };
  },
};

// Pierce and execute effects are handled in combat.js (getEffectiveDef / getExecuteMultiplier)
// so they don't need handlers here. But we register them as no-ops so lookups don't fail.
for (const key of ['true_damage', 'pierce', 'pierce_20', 'pierce_25', 'pierce_30', 'pierce_40', 'pierce_50',
                    'execute', 'execute_25', 'counter']) {
  if (!EFFECT_HANDLERS[key]) {
    EFFECT_HANDLERS[key] = () => ({});
  }
}

/**
 * Apply a skill effect by name. Returns partial state updates to merge.
 * Unknown effects are silently ignored (returns empty object).
 */
export function applySkillEffect(effectName, context) {
  const handler = EFFECT_HANDLERS[effectName];
  if (!handler) return {};
  return handler(context);
}

/**
 * Check if an effect name has a registered handler.
 */
export function hasEffect(effectName) {
  return !!EFFECT_HANDLERS[effectName];
}
