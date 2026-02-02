import { useMemo } from 'react';
import { getShopItems } from '../../data/gameData';

export default function ShopScreen({ playerLevel, playerGold, onBuy, onBack }) {
  const items = useMemo(() => getShopItems(playerLevel), [playerLevel]);

  return (
    <div className="screen screen-shop">
      <div className="screen-header">Shop</div>
      <div className="shop-list">
        {items.map(item => (
          <div key={item.id} className="shop-item">
            <div className="shop-item-info">
              <span className="shop-item-name">{item.name}</span>
              <span className="shop-item-desc">Heal {item.healAmount} HP</span>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => onBuy(item)}
              disabled={playerGold < item.buyPrice}
            >
              Buy {item.buyPrice}g
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
