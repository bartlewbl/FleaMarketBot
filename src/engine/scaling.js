// Monster and boss scaling functions

import { MONSTERS, BOSSES } from '../data/gameData';

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

export function scaleBoss(bossId, areaLevel) {
  const base = BOSSES[bossId];
  if (!base) return null;
  const scale = 1 + (areaLevel - 1) * 0.25;
  return {
    id: bossId,
    name: base.name,
    sprite: base.sprite,
    isBoss: true,
    title: base.title,
    maxHp: Math.floor(base.baseHp * scale),
    hp: Math.floor(base.baseHp * scale),
    atk: Math.floor(base.baseAtk * scale),
    def: Math.floor(base.baseDef * scale),
    exp: Math.floor(base.baseExp * scale),
    gold: Math.floor(base.baseGold * scale) + Math.floor(Math.random() * 15),
    skills: base.skills,
    dropTable: base.dropTable,
    level: areaLevel,
  };
}
