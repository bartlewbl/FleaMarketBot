import { useState } from 'react';

const SLOT_NAMES = {
  weapon: 'Weapon', shield: 'Shield', helmet: 'Helmet',
  armor: 'Armor', boots: 'Boots', accessory: 'Accessory',
};

function itemMetaTag(item) {
  if (!item) return '';
  const parts = [];
  if (item.rarity) parts.push(item.rarity);
  if (item.level) parts.push('Lv' + item.level);
  return parts.length ? `[${parts.join(' · ')}]` : '';
}

function itemStatLine(item) {
  if (!item) return '';
  if (item.slot) {
    const stats = [];
    if (item.atk) stats.push('ATK+' + item.atk);
    if (item.def) stats.push('DEF+' + item.def);
    return stats.length ? stats.join(' ') : 'No bonuses';
  }
  if (item.type === 'energy-drink') return `Energy +${item.energyAmount}`;
  return `Heal ${item.healAmount} HP`;
}

export default function InventoryScreen({
  player, playerAtk, playerDef, onEquip, onUnequip, onUse, onSell, onReorder, onBack,
}) {
  const [dragInfo, setDragInfo] = useState(null);
  const [hoverState, setHoverState] = useState(null);
  const [slotHover, setSlotHover] = useState(null);

  const dragIndex = dragInfo?.source === 'inventory' ? dragInfo.index : null;
  const getDraggedItem = () => {
    if (dragIndex == null) return null;
    return player.inventory[dragIndex] || null;
  };

  const clearDragState = () => {
    setDragInfo(null);
    setHoverState(null);
    setSlotHover(null);
  };

  const handleDragStart = (index) => (event) => {
    const item = player.inventory[index];
    if (!item) return;
    setDragInfo({ source: 'inventory', index, itemId: item.id });
    setHoverState(null);
    setSlotHover(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOverItem = (index) => (event) => {
    if (dragIndex === null) return;
    event.preventDefault();
    if (index === dragIndex) {
      setHoverState(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const isAfter = (event.clientY - rect.top) > rect.height / 2;
    setHoverState({ index, position: isAfter ? 'after' : 'before' });
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnItem = (index) => (event) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const isAfter = (event.clientY - rect.top) > rect.height / 2;
    const insertIndex = isAfter ? index + 1 : index;
    onReorder?.(dragIndex, insertIndex);
    clearDragState();
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const handleListDragOver = (event) => {
    if (dragIndex === null) return;
    if (event.target !== event.currentTarget) return;
    if (player.inventory.length === 0) return;
    event.preventDefault();
    setHoverState({ index: player.inventory.length - 1, position: 'after' });
    event.dataTransfer.dropEffect = 'move';
  };

  const handleListDrop = (event) => {
    if (dragIndex === null) return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    onReorder?.(dragIndex, player.inventory.length);
    clearDragState();
  };

  const handleListDragLeave = (event) => {
    if (event.target !== event.currentTarget) return;
    setHoverState(null);
  };

  const handleSlotDragOver = (slot) => (event) => {
    if (dragIndex === null) return;
    const item = getDraggedItem();
    if (!item) return;
    event.preventDefault();
    const valid = item.slot === slot;
    event.dataTransfer.dropEffect = valid ? 'move' : 'none';
    setSlotHover({ slot, valid });
    setHoverState(null);
  };

  const handleSlotDrop = (slot) => (event) => {
    if (dragIndex === null) return;
    const item = getDraggedItem();
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    if (item.slot !== slot) {
      setSlotHover({ slot, valid: false });
      return;
    }
    onEquip(item);
    clearDragState();
  };

  const handleSlotDragLeave = (slot) => () => {
    if (slotHover?.slot !== slot) return;
    setSlotHover(null);
  };

  return (
    <div className="screen screen-inventory">
      <div className="screen-header">Inventory</div>

      <div className="inv-content">
        <div className="section-title">Equipment</div>
        <div className="equipment-grid">
          {Object.entries(SLOT_NAMES).map(([slot, label]) => {
            const item = player.equipment[slot];
            const slotState = slotHover?.slot === slot
              ? (slotHover.valid ? 'equip-slot-drop-valid' : 'equip-slot-drop-invalid')
              : '';
            return (
              <div
                key={slot}
                className={`equip-slot ${slotState}`}
                onDragOver={handleSlotDragOver(slot)}
                onDrop={handleSlotDrop(slot)}
                onDragLeave={handleSlotDragLeave(slot)}
              >
                <div className="equip-label">{label}</div>
                <div className={`equip-item ${item ? item.rarityClass : ''}`}>
                  {item ? `${item.name}${item.level ? ' (Lv' + item.level + ')' : ''}` : '-- Empty --'}
                </div>
                {item && (
                  <>
                    <div className="equip-stats">
                      {item.level ? `Lv${item.level} · ` : ''}
                      {itemStatLine(item)}
                    </div>
                    <button className="btn btn-sm" onClick={() => onUnequip(slot)}>Unequip</button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="section-title">Items ({player.inventory.length}/{player.maxInventory})</div>
        <div
          className="inventory-list"
          onDragOver={handleListDragOver}
          onDrop={handleListDrop}
          onDragLeave={handleListDragLeave}
        >
          {player.inventory.length === 0 && (
            <div className="empty-text">No items</div>
          )}
          {player.inventory.map((item, index) => {
            const isDragging = dragIndex === index;
            const isHoverBefore = hoverState && hoverState.index === index && hoverState.position === 'before';
            const isHoverAfter = hoverState && hoverState.index === index && hoverState.position === 'after';
            const itemClass = [
              'inv-item',
              isDragging ? 'dragging' : '',
              isHoverBefore ? 'drag-over-before' : '',
              isHoverAfter ? 'drag-over-after' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={item.id}
                className={itemClass}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOverItem(index)}
                onDrop={handleDropOnItem(index)}
                onDragEnd={handleDragEnd}
              >
                <div className="inv-item-info">
                  <span className={`inv-item-name ${item.rarityClass}`}>
                    {item.name} {itemMetaTag(item)}
                  </span>
                  <span className="inv-item-stats">
                    {itemStatLine(item)}
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
            );
          })}
        </div>

        <div className="player-stats-summary">
          ATK: {playerAtk} | DEF: {playerDef} | Max HP: {player.maxHp}
        </div>
      </div>

      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
