const SLOT_NAMES = {
  weapon: 'Weapon', shield: 'Shield', helmet: 'Helmet',
  armor: 'Armor', boots: 'Boots', accessory: 'Accessory',
};

export default function InventoryScreen({ player, playerAtk, playerDef, onEquip, onUnequip, onUse, onSell, onBack }) {
  return (
    <div className="screen screen-inventory">
      <div className="screen-header">Inventory</div>

      <div className="inv-content">
        <div className="section-title">Equipment</div>
        <div className="equipment-grid">
          {Object.entries(SLOT_NAMES).map(([slot, label]) => {
            const item = player.equipment[slot];
            return (
              <div key={slot} className="equip-slot">
                <div className="equip-label">{label}</div>
                <div className={`equip-item ${item ? item.rarityClass : ''}`}>
                  {item ? item.name : '-- Empty --'}
                </div>
                {item && (
                  <>
                    <div className="equip-stats">
                      {item.atk ? `ATK+${item.atk} ` : ''}{item.def ? `DEF+${item.def}` : ''}
                    </div>
                    <button className="btn btn-sm" onClick={() => onUnequip(slot)}>Unequip</button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="section-title">Items ({player.inventory.length}/{player.maxInventory})</div>
        <div className="inventory-list">
          {player.inventory.length === 0 && (
            <div className="empty-text">No items</div>
          )}
          {player.inventory.map(item => (
            <div key={item.id} className="inv-item">
              <div className="inv-item-info">
                <span className={`inv-item-name ${item.rarityClass}`}>
                  {item.name} [{item.rarity}]
                </span>
                <span className="inv-item-stats">
                  {item.slot
                    ? `${item.atk ? 'ATK+' + item.atk + ' ' : ''}${item.def ? 'DEF+' + item.def : ''}`
                    : `Heal ${item.healAmount} HP`
                  }
                </span>
              </div>
              <div className="inv-item-actions">
                {item.slot ? (
                  <button className="btn btn-sm" onClick={() => onEquip(item)}>Equip</button>
                ) : (
                  <button className="btn btn-sm" onClick={() => onUse(item)}>Use</button>
                )}
                <button className="btn btn-sm btn-back" onClick={() => onSell(item)}>
                  {item.sellPrice}g
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="player-stats-summary">
          ATK: {playerAtk} | DEF: {playerDef} | Max HP: {player.maxHp}
        </div>
      </div>

      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
