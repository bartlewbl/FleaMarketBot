import CharacterDock from './CharacterDock';

export default function SidePanel({
  collapsed,
  onToggle,
  screen,
  currentLocation,
  energy,
  energyMax,
  energyCost,
  hp,
  maxHp,
  mana,
  maxMana,
  playerName,
  playerLevel,
  gold,
  onGoToTown,
  onExplore,
  onInventory,
  onShop,
  onMarket,
  onJournal,
  onRest,
  navLocked,
  onProfile,
  onSkills,
  canRest,
}) {
  const navItems = [
    {
      id: 'town',
      label: 'Town',
      description: 'Return to the main hub',
      onClick: onGoToTown,
      active: screen === 'town',
      disabled: navLocked,
    },
    {
      id: 'explore',
      label: 'Explore',
      description: 'Pick a destination',
      onClick: onExplore,
      active: screen === 'regions' || screen === 'locations' || screen === 'explore',
      disabled: navLocked,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Equip or use items',
      onClick: onInventory,
      active: screen === 'inventory',
      disabled: navLocked,
    },
    {
      id: 'shop',
      label: 'Shop',
      description: 'Buy gear and potions',
      onClick: onShop,
      active: screen === 'shop',
      disabled: navLocked,
    },
    {
      id: 'market',
      label: 'Market',
      description: 'Player trading hub',
      onClick: onMarket,
      active: screen === 'market',
      disabled: navLocked,
    },
    {
      id: 'journal',
      label: 'Journal',
      description: 'Stats and tasks',
      onClick: onJournal,
      active: screen === 'journal',
      disabled: navLocked,
    },
  ];

  return (
    <aside className={`side-panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="side-panel-toggle"
        type="button"
        aria-label="Toggle command board"
        onClick={onToggle}
      >
        {collapsed ? '>' : '<'}
      </button>

      <div className="side-panel-body">
        <div className="side-panel-content">
          <div className="side-panel-heading">
            <div className="side-panel-title">Command Board</div>
            <div className="side-panel-subtitle">Plan your next step</div>
          </div>

          {currentLocation && (
            <div className="side-panel-card">
              <div className="side-panel-card-label">Current Route</div>
              <div className="side-panel-card-value">{currentLocation.name}</div>
            </div>
          )}

          <div className="side-menu-buttons">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`side-menu-button ${item.active ? 'active' : ''}`}
                type="button"
                disabled={item.disabled}
                onClick={item.onClick}
              >
                <span className="side-menu-label">{item.label}</span>
                <span className="side-menu-desc">{item.description}</span>
              </button>
            ))}
          </div>

          <div className="side-panel-divider" />
        </div>

        <div className="side-panel-footer">
          <CharacterDock
            playerName={playerName}
            playerLevel={playerLevel}
            energy={energy}
            energyMax={energyMax}
            energyCost={energyCost}
            hp={hp}
            maxHp={maxHp}
            mana={mana}
            maxMana={maxMana}
            gold={gold}
            onInventory={onInventory}
            onProfile={onProfile}
            onSkills={onSkills}
            navLocked={navLocked}
            onRest={onRest}
            canRest={canRest}
          />

          {navLocked && (
            <div className="side-panel-note">
              Finish the current encounter to access navigation.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
