import { REGIONS } from '../../data/gameData';

export default function RegionsScreen({
  playerLevel,
  playerGold,
  onSelect,
  onBack,
}) {
  return (
    <div className="screen screen-regions">
      <div className="screen-header">Choose Region</div>
      <div className="region-list">
        {REGIONS.map(region => {
          const needsLevel = playerLevel < region.levelReq;
          const cost = region.travelCost || 0;
          const needsGold = cost > 0 && playerGold < cost;
          const locked = needsLevel || needsGold;
          const locationCount = region.locations.length;
          const unlocked = region.locations.filter(l => playerLevel >= l.levelReq).length;
          return (
            <button
              key={region.id}
              className={`region-item ${locked ? 'locked' : ''}`}
              onClick={() => !locked && onSelect(region)}
              disabled={locked}
            >
              <div className="region-item-left">
                <div className="region-name">{region.name}</div>
                <div className="region-desc">{region.description}</div>
                {needsLevel && (
                  <div className="region-req">Lv.{region.levelReq}+ required</div>
                )}
                {!needsLevel && needsGold && (
                  <div className="region-req">Need {cost}g for ticket</div>
                )}
                {!locked && (
                  <div className="region-progress">
                    {unlocked}/{locationCount} locations
                    {cost > 0 ? ` · Ticket: ${cost}g` : ' · Free travel'}
                  </div>
                )}
              </div>
              <div className="region-level">
                Lv.{region.levelReq}+
              </div>
            </button>
          );
        })}
      </div>
      <button className="btn btn-back" onClick={onBack}>Back to Town</button>
    </div>
  );
}
