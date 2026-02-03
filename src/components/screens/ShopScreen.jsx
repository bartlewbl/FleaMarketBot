import { useMemo } from 'react';
import { getShopItems } from '../../data/gameData';

const statLine = (item) => {
  if (!item) return '';
  if (item.slot) {
    const stats = [];
    if (item.atk) stats.push('ATK+' + item.atk);
    if (item.def) stats.push('DEF+' + item.def);
    return stats.length ? stats.join(' ') : 'No bonuses';
  }
  return `Heal ${item.healAmount} HP`;
};

const metaTag = (item) => {
  if (!item) return '';
  const bits = [];
  if (item.rarity) bits.push(item.rarity);
  if (item.level) bits.push('Lv' + item.level);
  return bits.length ? `[${bits.join(' · ')}]` : '';
};

export default function ShopScreen({ player, onBuy, onSell, onBack }) {
  const stock = useMemo(() => getShopItems(player.level), [player.level]);
  const canSell = player.inventory.length > 0;

  return (
    <div className="screen screen-shop">
      <div className="screen-header">Neon Market</div>

      <div className="shop-panels">
        <div className="shop-panel">
          <div className="section-title">Buy Items</div>
          <div className="shop-list">
            {stock.map(item => (
              <div key={item.id} className="shop-item">
                <div className="shop-item-info">
                  <span className={`shop-item-name ${item.rarityClass || ''}`}>
                    {item.name} {metaTag(item)}
                  </span>
                  <span className="shop-item-desc">
                    {statLine(item)}
                  </span>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => onBuy(item)}
                  disabled={player.gold < item.buyPrice}
                >
                  Buy {item.buyPrice}g
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="shop-panel">
          <div className="section-title">Sell Items</div>
          <div className="shop-list">
            {!canSell && (
              <div className="empty-text">Nothing to sell</div>
            )}
            {player.inventory.map(item => (
              <div key={item.id} className="shop-item">
                <div className="shop-item-info">
                  <span className={`shop-item-name ${item.rarityClass}`}>
                    {item.name} {metaTag(item)}
                  </span>
                  <span className="shop-item-desc">
                    {statLine(item)}
                  </span>
                </div>
                <button className="btn btn-sm btn-back" onClick={() => onSell(item)}>
                  Sell {item.sellPrice}g
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shop-footer">
        <div className="shop-gold">Gold: {player.gold}g</div>
        <button className="btn btn-back" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
