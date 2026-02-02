import { LOCATIONS } from '../../data/gameData';

export default function LocationsScreen({ playerLevel, onSelect, onBack }) {
  return (
    <div className="screen screen-locations">
      <div className="screen-header">Choose Location</div>
      <div className="location-list">
        {LOCATIONS.map(loc => {
          const locked = playerLevel < loc.levelReq;
          return (
            <button
              key={loc.id}
              className={`location-item ${locked ? 'locked' : ''}`}
              onClick={() => !locked && onSelect(loc)}
              disabled={locked}
            >
              <div className="location-item-left">
                <div className="location-name">{loc.name}</div>
                <div className="location-desc">{loc.description}</div>
              </div>
              <div className="location-level">
                Lv.{loc.levelReq}+
              </div>
            </button>
          );
        })}
      </div>
      <button className="btn btn-back" onClick={onBack}>Back to Town</button>
    </div>
  );
}
