// Centralized passive skill application
// Handles all passive triggers during: attacks, skill use, defense, potions, monster turns

import { playerHasSkill, getBattleMaxHp, getBattleMaxMana } from './combat';

/**
 * Apply post-attack passives (after a normal attack deals damage).
 * Returns updated { player, monster, battle, log }.
 */
export function applyAttackPassives({ player, monster, battle, log, dmg, cls }) {
  const battleMaxHp = getBattleMaxHp(player);
  let p = player;
  let m = monster;
  let b = battle;

  // Necromancer Lifetap: heal 15% of damage dealt on normal attacks
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
    const battleMana = getBattleMaxMana(p);
    p = { ...p, mana: Math.min(battleMana, p.mana + 5) };
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
    const battleMana = getBattleMaxMana(p);
    p = { ...p, mana: Math.min(battleMana, p.mana + 3) };
  }
  // Necrotic Touch: reduce enemy DEF by 1
  if (playerHasSkill(p, 'nec_t5a') && m.def > 0) {
    m = { ...m, def: Math.max(0, m.def - 1) };
    b = { ...b, monster: m };
  }
  // Opportunist: +15% damage against poisoned enemies
  if (playerHasSkill(p, 'thf_t6a') && b.monsterPoisonTurns > 0) {
    const bonus = Math.floor(dmg * 0.15);
    m = { ...m, hp: Math.max(0, m.hp - bonus) };
    b = { ...b, monster: m };
    if (bonus > 0) log.push({ text: `Opportunist bonus: ${bonus} damage!`, type: 'dmg-monster' });
  }
  // Spellweaver: clear after normal attack
  if (b.spellweaverActive) {
    b = { ...b, spellweaverActive: false };
  }

  return { player: p, monster: m, battle: b, log };
}

/**
 * Apply post-skill passives (after a class skill or tree skill deals damage).
 * Returns updated { player, log }.
 */
export function applySkillPassives({ player, log, dmg }) {
  const battleMaxHp = getBattleMaxHp(player);
  let p = player;

  // Vampiric Aura on skill
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
    const battleMana = getBattleMaxMana(p);
    p = { ...p, mana: Math.min(battleMana, p.mana + 5) };
    log.push({ text: `Soul Siphon restores 5 mana!`, type: 'heal' });
  }

  return { player: p, log };
}

/**
 * Apply Life Tap: spending mana heals 50% as HP.
 */
export function applyLifeTap(player, manaCost) {
  if (!playerHasSkill(player, 'nec_t6a') || manaCost <= 0) return player;
  const ltHeal = Math.floor(manaCost * 0.5);
  return { ...player, hp: Math.min(getBattleMaxHp(player), player.hp + ltHeal) };
}

/**
 * Apply Blade Dance: 10% chance to attack twice.
 * Returns { attacked, dmg } where attacked is true if a second attack was made.
 */
export function tryBladeDance(player, battle, calcDamageFn, getPlayerAtkFn) {
  if (!playerHasSkill(player, 'thf_t9a')) return { attacked: false, dmg: 0 };
  if (Math.random() >= 0.1) return { attacked: false, dmg: 0 };
  if (battle.monster.hp <= 0) return { attacked: false, dmg: 0 };
  const dmg = calcDamageFn(getPlayerAtkFn(player, battle), battle.monster.def);
  return { attacked: true, dmg };
}

/**
 * Apply Lucky Strike: 20% chance to deal double damage.
 */
export function tryLuckyStrike(player, dmg) {
  if (!playerHasSkill(player, 'thf_t4a')) return { procced: false, dmg };
  if (Math.random() >= 0.2) return { procced: false, dmg };
  return { procced: true, dmg: dmg * 2 };
}

/**
 * Apply start-of-turn passives (regeneration, meditation, dark pact).
 * Returns updated { player, log }.
 */
export function applyTurnStartPassives({ player, battle, log }) {
  const battleMaxHp = getBattleMaxHp(player);
  let p = player;

  // Regeneration: heal 3% max HP
  if (playerHasSkill(p, 'war_t6a')) {
    const healAmt = Math.floor(battleMaxHp * 0.03);
    if (p.hp < battleMaxHp) {
      p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
      log.push({ text: `Regeneration heals ${healAmt} HP!`, type: 'heal' });
    }
  }
  // Meditation: restore 4 mana
  if (playerHasSkill(p, 'mag_t5a')) {
    const battleMana = getBattleMaxMana(p);
    p = { ...p, mana: Math.min(battleMana, p.mana + 4) };
    log.push({ text: `Meditation restores 4 mana!`, type: 'heal' });
  }
  // Mana Regeneration: restore 8% max mana (uses wisdom-boosted max)
  if (playerHasSkill(p, 'mag_t9a')) {
    const battleMana = getBattleMaxMana(p);
    const manaAmt = Math.floor(battleMana * 0.08);
    p = { ...p, mana: Math.min(battleMana, p.mana + manaAmt) };
    log.push({ text: `Mana Regen restores ${manaAmt} mana!`, type: 'heal' });
  }
  // Dark Pact: sacrifice 5% HP per turn
  if (playerHasSkill(p, 'nec_t4a')) {
    const sacrifice = Math.floor(p.maxHp * 0.05);
    p = { ...p, hp: Math.max(1, p.hp - sacrifice) };
    log.push({ text: `Dark Pact drains ${sacrifice} HP!`, type: 'dmg-player' });
  }

  return { player: p, log };
}

/**
 * Apply damage reduction passives to incoming monster damage.
 * Returns the modified damage value.
 */
export function applyDamageReduction(dmg, player, battle, cls) {
  let d = dmg;

  // Defend block
  if (battle.defending) {
    let blockMult = 0.5;
    if (cls?.passive === 'Fortify') blockMult = 0.3;
    if (playerHasSkill(player, 'war_t2a')) blockMult = 0.15; // Bulwark: 85% block
    d = Math.floor(d * blockMult);
  }
  // Iron Skin: 10% less damage
  if (playerHasSkill(player, 'war_t1a')) {
    d = Math.floor(d * 0.9);
  }
  // Thick Skin: 8% less damage
  if (playerHasSkill(player, 'brs_t5a')) {
    d = Math.floor(d * 0.92);
  }
  // Fortress: 20% less damage
  if (playerHasSkill(player, 'war_t10a')) {
    d = Math.floor(d * 0.8);
  }
  // Mana Shield: 20% absorbed by mana (handled separately for mana deduction)
  return Math.max(1, d);
}

/**
 * Apply Mana Shield absorption. Returns { dmg, manaUsed }.
 */
export function applyManaShield(dmg, player) {
  if (!playerHasSkill(player, 'mag_t1a') || player.mana <= 0) return { dmg, manaUsed: 0 };
  const absorbRate = playerHasSkill(player, 'mag_t10a') ? 0.4 : 0.2;
  const manaAbsorb = Math.floor(dmg * absorbRate);
  const actualAbsorb = Math.min(manaAbsorb, player.mana);
  return { dmg: dmg - actualAbsorb, manaUsed: actualAbsorb };
}

/**
 * Check dodge (Shadow Step, Evasion Mastery, Shadow Dance, dodge charges).
 * Returns { dodged, battle, log }.
 */
export function checkDodge(player, battle, log) {
  let b = { ...battle };

  if (b.dodgeNextTurn) {
    b.dodgeNextTurn = false;
    log.push({ text: 'You dodge the attack from the shadows!', type: 'info' });
    return { dodged: true, battle: b, log };
  }
  if (b.dodgeCharges > 0) {
    b.dodgeCharges--;
    log.push({ text: 'You dodge the attack from the shadows!', type: 'info' });
    return { dodged: true, battle: b, log };
  }
  const dodgeChance = (() => {
    let chance = 0;
    // Athletics: each point gives +0.5% dodge chance
    const athletics = player.athletics || 0;
    chance += athletics * 0.005;
    if (playerHasSkill(player, 'thf_t1a')) chance += 0.15;
    if (playerHasSkill(player, 'thf_t3a')) chance += 0.10;
    return chance;
  })();
  if (dodgeChance > 0 && Math.random() < dodgeChance) {
    log.push({ text: 'You dodge the attack!', type: 'info' });
    return { dodged: true, battle: b, log };
  }
  // Aegis: 15% chance to fully block
  if (playerHasSkill(player, 'war_t4a') && Math.random() < 0.15) {
    log.push({ text: 'Aegis fully blocks the attack!', type: 'info' });
    return { dodged: true, battle: b, log };
  }

  return { dodged: false, battle: b, log };
}

/**
 * Apply survival passives after taking damage (Undying Will, Death's Embrace).
 * Returns updated { player, battle, log }.
 */
export function applySurvivalPassives({ player, battle, log }) {
  const battleMaxHp = getBattleMaxHp(player);
  let p = player;
  let b = battle;

  // Undying Will: survive lethal at 1 HP
  if (p.hp <= 0 && playerHasSkill(p, 'brs_t2a') && !b.undyingWillUsed) {
    p = { ...p, hp: 1 };
    b = { ...b, undyingWillUsed: true };
    log.push({ text: `Undying Will! You survive at 1 HP!`, type: 'heal' });
  }
  // Death's Embrace: heal when below 25% HP (once/battle)
  if (playerHasSkill(p, 'nec_t2a') && !b.deathsEmbraceUsed && p.hp > 0 && p.hp < battleMaxHp * 0.25) {
    const healAmt = Math.floor(battleMaxHp * 0.15);
    p = { ...p, hp: Math.min(battleMaxHp, p.hp + healAmt) };
    b = { ...b, deathsEmbraceUsed: true };
    log.push({ text: `Death's Embrace heals ${healAmt} HP!`, type: 'heal' });
  }

  return { player: p, battle: b, log };
}

/**
 * Apply Cursed Blood passive (20% chance to poison attacker when hit).
 */
export function applyCursedBlood(player, battle, log) {
  if (!playerHasSkill(player, 'nec_t8a') || Math.random() >= 0.2) return { battle, log };
  const b = { ...battle, monsterPoisonTurns: Math.max(battle.monsterPoisonTurns, 2) };
  log.push({ text: `Cursed Blood poisons ${battle.monster.name}!`, type: 'info' });
  return { battle: b, log };
}
