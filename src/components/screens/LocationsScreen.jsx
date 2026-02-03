import { LOCATIONS } from '../../data/gameData';

export default function LocationsScreen({
  playerLevel,
  energy,
  energyMax,
  energyCost,
  onSelect,
  onBack,
}) {
  const requiredEnergy = energyCost ?? 0;
  const availableEnergy = energy ?? requiredEnergy;
  const maxEnergy = energyMax ?? Math.max(availableEnergy, requiredEnergy, 1);
  return (
    <div className="screen screen-locations">
      <div className="screen-header">Choose Location</div>
      <div className="location-energy-info">
        Energy {availableEnergy}/{maxEnergy} · -{requiredEnergy} per expedition
      </div>
      <div className="location-list">
        {LOCATIONS.map(loc => {
          const needsLevel = playerLevel < loc.levelReq;
          const needsEnergy = availableEnergy < requiredEnergy;
          const locked = needsLevel || needsEnergy;
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
                {(needsLevel || needsEnergy) && (
                  <div className="location-req">
                    {needsLevel ? `Lv.${loc.levelReq}+ required` : `Need ${requiredEnergy} energy`}
                  </div>
                )}
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
