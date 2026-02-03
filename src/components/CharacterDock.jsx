export default function CharacterDock({
  playerName,
  playerLevel,
  energy,
  energyMax,
  energyCost,
  hp,
  maxHp,
  mana,
  maxMana,
  gold,
  onInventory,
  onProfile,
  onSkills,
  navLocked,
  onRest,
  canRest,
}) {
  const safeMax = energyMax ?? Math.max(energy ?? 0, 1);
  const current = Math.max(0, Math.min(energy ?? safeMax, safeMax));
  const pct = (current / safeMax) * 100;
  const strokeStyle = {
    background: `conic-gradient(#76ffdf ${pct}%, rgba(118, 255, 223, 0.15) ${pct}% 100%)`,
  };
  const heroName = playerName || 'Hero';
  const heroLevel = playerLevel ?? 1;
  const hpValue = `${Math.max(0, hp ?? 0)}/${Math.max(1, maxHp ?? 1)}`;
  const manaValue = `${Math.max(0, mana ?? 0)}/${Math.max(1, maxMana ?? 1)}`;
  const goldValue = gold ?? 0;

  const buttons = [
    { id: 'inventory', label: 'Inventory', action: onInventory },
    { id: 'profile', label: 'Profile', action: onProfile },
    { id: 'skills', label: 'Skills', action: onSkills },
  ];

  return (
    <div className="character-dock">
      <div className="dock-hero">
        <div className="dock-hero-name">{heroName}</div>
        <div className="dock-hero-meta">Lv. {heroLevel}</div>
        <div className="dock-hero-meta">Gold: {goldValue}</div>
      </div>

      <div className="energy-wheel">
        <div className="energy-ring" style={strokeStyle}>
          <div className="energy-core">
            <div className="energy-value">{current}</div>
            <div className="energy-max">/ {safeMax}</div>
          </div>
        </div>
        <div className="energy-meta">
          <div className="energy-label">Energy</div>
          <div className="energy-cost">-{energyCost ?? 0} per route</div>
        </div>
      </div>

      <div className="dock-stats">
        <div className="dock-stat">
          <div className="dock-stat-label">HP</div>
          <div className="dock-stat-value">{hpValue}</div>
        </div>
        <div className="dock-stat">
          <div className="dock-stat-label">Mana</div>
          <div className="dock-stat-value">{manaValue}</div>
        </div>
      </div>

      <div className="dock-footer">
        <div className="dock-actions">
          {buttons.map(btn => (
            <button
              key={btn.id}
              className="dock-action"
              type="button"
              disabled={navLocked}
              onClick={btn.action}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          className="dock-icon-button"
          type="button"
          disabled={!canRest}
          onClick={onRest}
          aria-label="Rest at Inn"
          title="Rest at Inn (-10g)"
        >
          <span className="heal-icon">✚</span>
        </button>
      </div>
    </div>
  );
}
