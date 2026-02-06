import { SKILLS, CHARACTER_CLASSES } from '../../data/gameData';

export default function SkillsScreen({ onBack, characterClass }) {
  const cls = characterClass ? CHARACTER_CLASSES[characterClass] : null;
  const entries = Object.entries(SKILLS).map(([id, skill]) => ({
    id,
    ...skill,
  }));

  return (
    <div className="screen screen-skills">
      <div className="screen-header">Skills Library</div>

      {cls && (
        <div className="skills-class-section">
          <div className="skill-card skill-card-class" style={{ borderColor: cls.color }}>
            <div className="skill-name" style={{ color: cls.color }}>{cls.skillName}</div>
            <div className="skill-detail">{cls.skillDesc}</div>
            <div className="skill-detail skill-effect">Passive: {cls.passive} — {cls.passiveDesc}</div>
          </div>
        </div>
      )}

      <div className="screen-header" style={{ fontSize: '10px', marginTop: '8px' }}>Monster Skills</div>
      <div className="skills-grid">
        {entries.map(entry => (
          <div key={entry.id} className="skill-card">
            <div className="skill-name">{entry.name}</div>
            <div className="skill-detail">Power x{entry.multiplier}</div>
            {entry.effect && (
              <div className="skill-detail skill-effect">Effect: {entry.effect.replace('_', ' ')}</div>
            )}
          </div>
        ))}
      </div>
      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
