import { useEffect, useRef, useCallback } from 'react';
import { getPlayerPassiveSkills, getPlayerActiveSkills, getTreeSkill } from '../../data/skillTrees';

export default function BattleScreen({
  battle, battleLog, player,
  onAttack, onSkill, onDefend, onPotion, onRun, onMonsterTurn,
  onTreeSkill, onToggleSkillMenu,
}) {
  const logRef = useRef(null);
  const pendingTurnRef = useRef(false);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const handlePlayerAction = useCallback((actionFn) => {
    if (!battle?.isPlayerTurn || pendingTurnRef.current) return;
    actionFn();
    pendingTurnRef.current = true;
    setTimeout(() => {
      onMonsterTurn();
      pendingTurnRef.current = false;
    }, 500);
  }, [battle?.isPlayerTurn, onMonsterTurn]);

  const handleRun = useCallback(() => {
    if (!battle?.isPlayerTurn || pendingTurnRef.current) return;
    onRun();
  }, [battle?.isPlayerTurn, onRun]);

  const handleDefend = useCallback(() => {
    if (!battle?.isPlayerTurn || pendingTurnRef.current) return;
    onDefend();
    pendingTurnRef.current = true;
    setTimeout(() => {
      onMonsterTurn();
      pendingTurnRef.current = false;
    }, 500);
  }, [battle?.isPlayerTurn, onDefend, onMonsterTurn]);

  const handleTreeSkill = useCallback((skillId) => {
    if (!battle?.isPlayerTurn || pendingTurnRef.current) return;
    onTreeSkill(skillId);
    pendingTurnRef.current = true;
    setTimeout(() => {
      onMonsterTurn();
      pendingTurnRef.current = false;
    }, 500);
  }, [battle?.isPlayerTurn, onTreeSkill, onMonsterTurn]);

  if (!battle?.monster) return null;
  const m = battle.monster;
  const mHpPct = (m.hp / m.maxHp) * 100;
  const disabled = !battle.isPlayerTurn;
  const isBoss = !!m.isBoss;
  const showSkillMenu = battle.showSkillMenu;

  const passives = getPlayerPassiveSkills(player);
  const activeSkills = getPlayerActiveSkills(player);
  const treeActives = activeSkills.filter(s => !s.isClassSkill);

  return (
    <div className="screen screen-battle">
      <div className="monster-info">
        {isBoss && <span className="boss-badge">BOSS</span>}
        <span className={`monster-name ${isBoss ? 'boss-name' : ''}`}>{m.name} (Lv.{m.level})</span>
        {isBoss && m.title && <div className="boss-subtitle">{m.title}</div>}
        <div className="stat-bar">
          <span className="bar-label">HP</span>
          <div className={`bar hp-bar monster ${isBoss ? 'boss-hp' : ''}`}>
            <div className="bar-fill" style={{ width: mHpPct + '%' }} />
          </div>
          <span className="bar-text">{m.hp}/{m.maxHp}</span>
        </div>
        {/* Monster debuffs */}
        <div className="battle-debuffs-monster">
          {battle.monsterPoisonTurns > 0 && (
            <span className="battle-debuff poison">Poison ({battle.monsterPoisonTurns})</span>
          )}
          {battle.monsterDoomTurns > 0 && (
            <span className="battle-debuff doom">Doom ({battle.monsterDoomTurns})</span>
          )}
        </div>
      </div>

      {/* Passive effects display */}
      {passives.length > 0 && (
        <div className="battle-passives">
          <span className="battle-passives-label">Passives:</span>
          {passives.map(p => (
            <span key={p.id} className="battle-passive-tag" title={p.desc}>
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* Player status effects */}
      <div className="battle-debuffs-player">
        {battle.poisonTurns > 0 && (
          <span className="battle-debuff poison">Poisoned ({battle.poisonTurns})</span>
        )}
        {battle.atkDebuff > 0 && (
          <span className="battle-debuff debuff">ATK -{battle.atkDebuff}</span>
        )}
        {battle.defDebuff > 0 && (
          <span className="battle-debuff debuff">DEF -{battle.defDebuff}</span>
        )}
        {battle.dodgeNextTurn && (
          <span className="battle-debuff buff">Dodge Ready</span>
        )}
        {battle.dodgeCharges > 0 && (
          <span className="battle-debuff buff">Dodge x{battle.dodgeCharges}</span>
        )}
        {battle.avatarTurns > 0 && (
          <span className="battle-debuff buff">Avatar ({battle.avatarTurns})</span>
        )}
        {battle.defending && (
          <span className="battle-debuff buff">Defending</span>
        )}
      </div>

      <div className="battle-log" ref={logRef}>
        {battleLog.map((entry, i) => (
          <div key={i} className={`log-${entry.type}`}>{entry.text}</div>
        ))}
      </div>

      {/* Skill submenu */}
      {showSkillMenu ? (
        <div className="battle-actions battle-skill-menu">
          {activeSkills.map(skill => (
            <button
              key={skill.id}
              className="btn btn-skill"
              disabled={disabled || player.mana < (skill.manaCost || 0)}
              onClick={() => {
                if (skill.isClassSkill) {
                  handlePlayerAction(onSkill);
                } else {
                  handleTreeSkill(skill.id);
                }
              }}
              title={skill.desc}
            >
              <span className="skill-btn-name">{skill.name}</span>
              <span className="skill-btn-cost">{skill.manaCost || 0}mp</span>
            </button>
          ))}
          <button className="btn btn-back btn-sm" disabled={disabled} onClick={onToggleSkillMenu}>
            Back
          </button>
        </div>
      ) : (
        <div className="battle-actions">
          <button className="btn" disabled={disabled} onClick={() => handlePlayerAction(onAttack)}>Attack</button>
          <button className="btn" disabled={disabled} onClick={handleDefend}>Defend</button>
          <button
            className="btn btn-skills-toggle"
            disabled={disabled}
            onClick={treeActives.length > 0 ? onToggleSkillMenu : () => handlePlayerAction(onSkill)}
          >
            {treeActives.length > 0 ? 'Skills' : (activeSkills[0]?.name || 'Skill')}
          </button>
          <button className="btn" disabled={disabled} onClick={() => handlePlayerAction(onPotion)}>Potion</button>
          <button className="btn btn-back" disabled={disabled} onClick={handleRun}>{isBoss ? 'No Escape' : 'Run'}</button>
        </div>
      )}

      {/* Mana display */}
      <div className="battle-mana-display">
        Mana: {player.mana}/{player.maxMana}
      </div>
    </div>
  );
}
