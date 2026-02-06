import { useEffect, useRef, useCallback } from 'react';

export default function BattleScreen({ battle, battleLog, onAttack, onSkill, onDefend, onPotion, onRun, onMonsterTurn, skillName }) {
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
    // Schedule monster turn after player acts
    pendingTurnRef.current = true;
    setTimeout(() => {
      onMonsterTurn();
      pendingTurnRef.current = false;
    }, 500);
  }, [battle?.isPlayerTurn, onMonsterTurn]);

  // For run/defend the monster turn timing differs slightly
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

  if (!battle?.monster) return null;
  const m = battle.monster;
  const mHpPct = (m.hp / m.maxHp) * 100;
  const disabled = !battle.isPlayerTurn;

  return (
    <div className="screen screen-battle">
      <div className="monster-info">
        <span className="monster-name">{m.name} (Lv.{m.level})</span>
        <div className="stat-bar">
          <span className="bar-label">HP</span>
          <div className="bar hp-bar monster">
            <div className="bar-fill" style={{ width: mHpPct + '%' }} />
          </div>
          <span className="bar-text">{m.hp}/{m.maxHp}</span>
        </div>
      </div>

      <div className="battle-log" ref={logRef}>
        {battleLog.map((entry, i) => (
          <div key={i} className={`log-${entry.type}`}>{entry.text}</div>
        ))}
      </div>

      <div className="battle-actions">
        <button className="btn" disabled={disabled} onClick={() => handlePlayerAction(onAttack)}>Attack</button>
        <button className="btn" disabled={disabled} onClick={handleDefend}>Defend</button>
        <button className="btn" disabled={disabled} onClick={() => handlePlayerAction(onSkill)}>{skillName || 'Skill'}</button>
        <button className="btn" disabled={disabled} onClick={() => handlePlayerAction(onPotion)}>Potion</button>
        <button className="btn btn-back" disabled={disabled} onClick={handleRun}>Run</button>
      </div>
    </div>
  );
}
