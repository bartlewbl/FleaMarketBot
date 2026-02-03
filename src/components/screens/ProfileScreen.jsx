export default function ProfileScreen({ player, onBack }) {
  const stats = [
    { label: 'Level', value: player.level },
    { label: 'HP', value: `${player.hp}/${player.maxHp}` },
    { label: 'ATK', value: player.baseAtk },
    { label: 'DEF', value: player.baseDef },
    { label: 'EXP', value: `${player.exp}/${player.expToLevel}` },
    { label: 'Gold', value: player.gold },
  ];

  const equipment = Object.entries(player.equipment || {}).map(([slot, item]) => ({
    slot,
    item,
  }));

  return (
    <div className="screen screen-profile">
      <div className="screen-header">Profile</div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-title">Core Stats</div>
          <div className="profile-stats">
            {stats.map(stat => (
              <div key={stat.label} className="profile-stat">
                <div className="profile-stat-label">{stat.label}</div>
                <div className="profile-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-title">Equipment</div>
          <div className="profile-equip-list">
            {equipment.map(({ slot, item }) => (
              <div key={slot} className="profile-equip-row">
                <div className="profile-equip-slot">{slot.toUpperCase()}</div>
                <div className="profile-equip-item">
                  {item ? (
                    <>
                      <div className="equip-name">{item.name}</div>
                      <div className="equip-stats">ATK +{item.atk || 0} / DEF +{item.def || 0}</div>
                    </>
                  ) : (
                    <span className="equip-empty">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
