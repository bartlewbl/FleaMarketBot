import { useState } from 'react';
import { CHARACTER_CLASSES } from '../../data/gameData';

const classOrder = ['berserker', 'warrior', 'thief', 'mage', 'necromancer'];

export default function ClassSelectScreen({ onSelectClass }) {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (classId) => {
    setSelected(classId);
    setConfirming(false);
  };

  const handleConfirm = () => {
    if (!selected) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onSelectClass(selected);
  };

  const cls = selected ? CHARACTER_CLASSES[selected] : null;

  return (
    <div className="screen screen-class-select">
      <div className="class-select-header">Choose Your Path</div>
      <div className="class-select-subtitle">This choice shapes your combat style and abilities.</div>

      <div className="class-cards">
        {classOrder.map(id => {
          const c = CHARACTER_CLASSES[id];
          return (
            <button
              key={id}
              className={`class-card ${selected === id ? 'class-card-selected' : ''}`}
              style={{ '--class-color': c.color }}
              onClick={() => handleSelect(id)}
            >
              <div className="class-card-name" style={{ color: c.color }}>{c.name}</div>
              <div className="class-card-desc">{c.description}</div>
            </button>
          );
        })}
      </div>

      {cls && (
        <div className="class-detail-panel" style={{ '--class-color': cls.color }}>
          <div className="class-detail-name" style={{ color: cls.color }}>{cls.name}</div>

          <div className="class-detail-section">
            <div className="class-detail-label">Base Stats</div>
            <div className="class-detail-stats">
              <span>HP {cls.baseStats.maxHp}</span>
              <span>MP {cls.baseStats.maxMana}</span>
              <span>ATK {cls.baseStats.baseAtk}</span>
              <span>DEF {cls.baseStats.baseDef}</span>
            </div>
          </div>

          <div className="class-detail-section">
            <div className="class-detail-label">Passive: {cls.passive}</div>
            <div className="class-detail-value">{cls.passiveDesc}</div>
          </div>

          <div className="class-detail-section">
            <div className="class-detail-label">Skill: {cls.skillName}</div>
            <div className="class-detail-value">{cls.skillDesc}</div>
          </div>

          <button
            className={`btn btn-large class-confirm-btn ${confirming ? 'btn-confirm-pulse' : ''}`}
            style={{ borderColor: cls.color, color: cls.color }}
            onClick={handleConfirm}
          >
            {confirming ? `Confirm ${cls.name}?` : `Choose ${cls.name}`}
          </button>
        </div>
      )}
    </div>
  );
}
