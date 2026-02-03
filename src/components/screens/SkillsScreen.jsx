import { SKILLS } from '../../data/gameData';

export default function SkillsScreen({ onBack }) {
  const entries = Object.entries(SKILLS).map(([id, skill]) => ({
    id,
    ...skill,
  }));

  return (
    <div className="screen screen-skills">
      <div className="screen-header">Skills Library</div>
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
