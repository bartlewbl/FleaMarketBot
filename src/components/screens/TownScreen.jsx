import { CHARACTER_CLASSES } from '../../data/gameData';

const townNotices = [
  'Daily hunt: Defeat 5 forest goblins for 50 bonus XP.',
  'Blacksmith sale: Shields 15% off until midnight.',
  'Rumor: A dragon was spotted near the Obsidian Ridge.',
];

const travelerTips = [
  'Upgrade weapons before entering red-difficulty areas.',
  'Stock two potions per encounter for safety.',
  'Stagger skills and attacks to conserve stamina.',
];

const featuredVendors = [
  { name: 'Aurora Armory', specialty: 'Balanced armor sets' },
  { name: 'Moonshot Market', specialty: 'Rare consumables' },
  { name: 'Silent Stepper', specialty: 'Agile footwear' },
];

export default function TownScreen({ player }) {
  const equipment = player?.equipment || {};
  const atkBonus = Object.values(equipment).reduce((sum, item) => sum + (item?.atk || 0), 0);
  const defBonus = Object.values(equipment).reduce((sum, item) => sum + (item?.def || 0), 0);
  const cls = player?.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;

  const heroStats = [
    { label: 'HP', value: `${player?.hp ?? 0}/${player?.maxHp ?? 0}` },
    { label: 'ATK', value: `${player?.baseAtk ?? 0}${atkBonus ? ` (+${atkBonus})` : ''}` },
    { label: 'DEF', value: `${player?.baseDef ?? 0}${defBonus ? ` (+${defBonus})` : ''}` },
    { label: 'EXP', value: `${player?.exp ?? 0}/${player?.expToLevel ?? 0}` },
  ];

  return (
    <div className="screen screen-town">
      <div className="town-layout">
        <section className="town-hero-card">
          <div className="town-hero-title">Welcome back, {player?.name || 'Hero'}.</div>
          {cls && (
            <div className="town-hero-class" style={{ color: cls.color }}>{cls.name} — {cls.passive}</div>
          )}
          <div className="town-hero-subtitle">The town is abuzz with new opportunities.</div>
          <div className="town-hero-stats">
            {heroStats.map(stat => (
              <div className="town-stat" key={stat.label}>
                <div className="town-stat-label">{stat.label}</div>
                <div className="town-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="town-hero-bar">
            <div className="town-bar-label">Next level</div>
            <div className="town-bar-track">
              <div
                className="town-bar-fill"
                style={{
                  width: `${Math.min(100, ((player?.exp || 0) / (player?.expToLevel || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="town-panel">
          <div className="town-panel-title">Guild Board</div>
          <ul className="town-list">
            {townNotices.map(notice => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        </section>

        <section className="town-panel">
          <div className="town-panel-title">Traveler Tips</div>
          <ul className="town-list town-list-grid">
            {travelerTips.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="town-panel">
          <div className="town-panel-title">Featured Vendors</div>
          <div className="town-vendors">
            {featuredVendors.map(vendor => (
              <div className="town-vendor" key={vendor.name}>
                <div className="town-vendor-name">{vendor.name}</div>
                <div className="town-vendor-type">{vendor.specialty}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
