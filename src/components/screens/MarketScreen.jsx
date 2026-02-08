import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getMarketListings,
  getMyMarketListings,
  listItemOnMarket,
  buyMarketListing,
  cancelMarketListing,
} from '../../api';

const MARKET_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '\u2606' },
  { id: 'weapons', label: 'Weapons', icon: '\u2694' },
  { id: 'shields', label: 'Shields', icon: '\u26E8' },
  { id: 'helmets', label: 'Helmets', icon: '\u2229' },
  { id: 'armor', label: 'Armor', icon: '\u26CA' },
  { id: 'boots', label: 'Boots', icon: '\u2319' },
  { id: 'accessories', label: 'Accessories', icon: '\u25C7' },
  { id: 'potions', label: 'Potions', icon: '\u2661' },
  { id: 'energy-drinks', label: 'Energy Drinks', icon: '\u26A1' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'level-high', label: 'Level: High to Low' },
  { id: 'level-low', label: 'Level: Low to High' },
  { id: 'rarity', label: 'Rarity' },
];

const RARITY_ORDER = { 'Legendary': 5, 'Epic': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };

const LISTING_FEE_PERCENT = 0.05;
const SALE_TAX_PERCENT = 0.10;

const statLine = (item) => {
  if (!item) return '';
  const stats = [];
  if (item.atk) stats.push('ATK+' + item.atk);
  if (item.def) stats.push('DEF+' + item.def);
  if (item.healAmount) stats.push('Heal ' + item.healAmount);
  if (item.energyAmount) stats.push('Energy +' + item.energyAmount);
  return stats.length ? stats.join('  ') : 'No bonuses';
};

function sortListings(listings, sortBy) {
  const sorted = [...listings];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'level-high':
      return sorted.sort((a, b) => b.itemLevel - a.itemLevel);
    case 'level-low':
      return sorted.sort((a, b) => a.itemLevel - b.itemLevel);
    case 'rarity':
      return sorted.sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0));
    case 'newest':
    default:
      return sorted;
  }
}

function getItemCategory(item) {
  if (item.type === 'potion') return 'potions';
  if (item.type === 'energy-drink') return 'energy-drinks';
  if (item.slot === 'weapon') return 'weapons';
  if (item.slot === 'shield') return 'shields';
  if (item.slot === 'helmet') return 'helmets';
  if (item.slot === 'armor') return 'armor';
  if (item.slot === 'boots') return 'boots';
  if (item.slot === 'accessory') return 'accessories';
  return 'misc';
}

const categoryLabel = (cat) => {
  const found = MARKET_CATEGORIES.find(c => c.id === cat);
  return found ? found.label : cat;
};

export default function MarketScreen({ player, onBack, onMarketTransaction }) {
  const [tab, setTab] = useState('browse');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [listings, setListings] = useState([]);
  const [myActive, setMyActive] = useState([]);
  const [mySold, setMySold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sellItem, setSellItem] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmBuy, setConfirmBuy] = useState(null);

  const levelOk = (player?.level || 1) >= 10;

  // Fetch market listings
  const fetchListings = useCallback(async () => {
    if (!levelOk) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketListings(category, search);
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, search, levelOk]);

  const fetchMyListings = useCallback(async () => {
    if (!levelOk) return;
    try {
      const data = await getMyMarketListings();
      setMyActive(data.active || []);
      setMySold(data.sold || []);
    } catch (err) {
      setError(err.message);
    }
  }, [levelOk]);

  useEffect(() => {
    if (tab === 'browse') fetchListings();
    if (tab === 'my-listings') fetchMyListings();
  }, [tab, fetchListings, fetchMyListings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
  };

  const handleBuy = async (listing) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await buyMarketListing(listing.id);
      setSuccess(`Purchased ${listing.itemName} for ${listing.price}g! (${Math.max(1, Math.floor(listing.price * SALE_TAX_PERCENT))}g market tax applied to seller)`);
      setConfirmBuy(null);
      if (onMarketTransaction) {
        onMarketTransaction({
          type: 'buy',
          item: result.item,
          goldSpent: listing.price,
          newGold: result.newGold,
        });
      }
      fetchListings();
    } catch (err) {
      setError(err.message);
      setConfirmBuy(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleListItem = async () => {
    if (!sellItem || !sellPrice) return;
    const price = Math.floor(Number(sellPrice));
    if (isNaN(price) || price < 10) {
      setError('Minimum price is 10 gold');
      return;
    }
    if (price > 999999) {
      setError('Maximum price is 999,999 gold');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await listItemOnMarket(sellItem.id, price);
      const fee = result.listingFee;
      setSuccess(`Listed ${sellItem.name} for ${price}g! Listing fee: ${fee}g`);
      setSellItem(null);
      setSellPrice('');
      if (onMarketTransaction) {
        onMarketTransaction({
          type: 'list',
          removedItemId: sellItem.id,
          listingFee: fee,
          newGold: result.newGold,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (listing) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await cancelMarketListing(listing.id);
      setSuccess(`Cancelled listing. ${listing.itemName} returned to inventory.`);
      if (onMarketTransaction) {
        onMarketTransaction({
          type: 'cancel',
          returnedItem: result.returnedItem,
        });
      }
      fetchMyListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const sortedListings = useMemo(() => sortListings(listings, sortBy), [listings, sortBy]);

  const listingFeePreview = sellPrice ? Math.max(1, Math.floor(Number(sellPrice) * LISTING_FEE_PERCENT)) : 0;
  const sellerReceivesPreview = sellPrice
    ? Math.floor(Number(sellPrice)) - Math.max(1, Math.floor(Number(sellPrice) * SALE_TAX_PERCENT))
    : 0;

  // Level gate
  if (!levelOk) {
    return (
      <div className="screen screen-market">
        <div className="market-header">
          <div className="market-title">Flea Market</div>
        </div>
        <div className="market-locked">
          <div className="market-locked-icon">&#128274;</div>
          <div className="market-locked-title">Market Locked</div>
          <div className="market-locked-desc">
            You must be <strong>Level 10</strong> or higher to access the Flea Market.
            <br />Your current level: <strong>{player?.level || 1}</strong>
          </div>
        </div>
        <div className="market-footer">
          <button className="btn btn-back" onClick={onBack}>Back to Town</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-market">
      {/* Header */}
      <div className="market-header">
        <div className="market-header-left">
          <div className="market-title">Flea Market</div>
          <div className="market-subtitle">Trade items with other players</div>
        </div>
        <div className="market-wallet">
          <span className="market-wallet-gold">{player?.gold ?? 0}g</span>
          <span className="market-wallet-inv">{player?.inventory?.length ?? 0}/{player?.maxInventory ?? 20}</span>
        </div>
      </div>

      {/* Fee Info Banner */}
      <div className="market-fee-info">
        <span>Listing fee: 5%</span>
        <span className="market-fee-divider">|</span>
        <span>Sale tax: 10%</span>
        <span className="market-fee-divider">|</span>
        <span>Max 8 active listings</span>
      </div>

      {/* Tabs */}
      <div className="market-tabs">
        <button
          className={`market-tab ${tab === 'browse' ? 'active' : ''}`}
          onClick={() => setTab('browse')}
        >
          Browse Market
        </button>
        <button
          className={`market-tab ${tab === 'sell' ? 'active' : ''}`}
          onClick={() => setTab('sell')}
        >
          Sell Items
        </button>
        <button
          className={`market-tab ${tab === 'my-listings' ? 'active' : ''}`}
          onClick={() => setTab('my-listings')}
        >
          My Listings
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="market-message market-error">{error}
          <button className="market-msg-dismiss" onClick={() => setError(null)}>x</button>
        </div>
      )}
      {success && (
        <div className="market-message market-success">{success}
          <button className="market-msg-dismiss" onClick={() => setSuccess(null)}>x</button>
        </div>
      )}

      {/* Browse Tab */}
      {tab === 'browse' && (
        <div className="market-browse">
          {/* Category Bar */}
          <div className="market-categories">
            {MARKET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`market-cat-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => { setCategory(cat.id); setSearch(''); setSearchInput(''); }}
              >
                <span className="market-cat-icon">{cat.icon}</span>
                <span className="market-cat-label">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div className="market-toolbar">
            <form className="market-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="market-search-input"
                placeholder="Search items by name, category, or rarity..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="market-search-btn">Search</button>
              {search && (
                <button type="button" className="market-clear-btn" onClick={clearSearch}>Clear</button>
              )}
            </form>
            <select
              className="market-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Listings */}
          <div className="market-listings">
            {loading && <div className="market-loading">Loading listings...</div>}
            {!loading && sortedListings.length === 0 && (
              <div className="market-empty">
                <div className="market-empty-text">No listings found</div>
                <div className="market-empty-hint">
                  {search ? 'Try a different search term' : 'Be the first to list an item!'}
                </div>
              </div>
            )}
            {!loading && sortedListings.map(listing => {
              const canAfford = (player?.gold ?? 0) >= listing.price;
              const isOwn = listing.sellerId === undefined; // shouldn't happen on browse
              const invFull = (player?.inventory?.length ?? 0) >= (player?.maxInventory ?? 20);
              return (
                <div
                  key={listing.id}
                  className={`market-card ${listing.item?.rarityClass || ''} ${!canAfford ? 'unaffordable' : ''}`}
                >
                  <div className="market-card-main">
                    <div className="market-card-top">
                      <span className="market-card-category">{categoryLabel(listing.category)}</span>
                      <span className="market-card-level">Lv.{listing.itemLevel}</span>
                    </div>
                    <div className={`market-card-name ${listing.item?.rarityClass || ''}`}>
                      {listing.itemName}
                    </div>
                    <div className="market-card-meta">
                      <span className={`market-rarity-badge ${listing.item?.rarityClass || ''}`}>
                        {listing.rarity}
                      </span>
                      <span className="market-card-stats">{statLine(listing.item)}</span>
                    </div>
                    <div className="market-card-seller">
                      Listed by <strong>{listing.sellerName}</strong>
                    </div>
                  </div>
                  <div className="market-card-actions">
                    <div className="market-card-price">{listing.price}g</div>
                    {confirmBuy?.id === listing.id ? (
                      <div className="market-confirm-row">
                        <button
                          className="market-confirm-btn"
                          onClick={() => handleBuy(listing)}
                          disabled={actionLoading}
                        >
                          Confirm
                        </button>
                        <button
                          className="market-cancel-confirm-btn"
                          onClick={() => setConfirmBuy(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="market-buy-btn"
                        onClick={() => setConfirmBuy(listing)}
                        disabled={!canAfford || isOwn || invFull || actionLoading}
                        title={invFull ? 'Inventory full' : !canAfford ? 'Not enough gold' : ''}
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && sortedListings.length > 0 && (
            <div className="market-results-count">
              {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {tab === 'sell' && (
        <div className="market-sell">
          {sellItem ? (
            <div className="market-sell-form">
              <div className="market-sell-item-preview">
                <div className="market-sell-preview-header">Listing Item</div>
                <div className={`market-sell-item-card ${sellItem.rarityClass || ''}`}>
                  <div className={`market-sell-item-name ${sellItem.rarityClass || ''}`}>
                    {sellItem.name}
                  </div>
                  <div className="market-sell-item-meta">
                    <span className={`market-rarity-badge ${sellItem.rarityClass || ''}`}>
                      {sellItem.rarity}
                    </span>
                    <span>Lv.{sellItem.level}</span>
                    <span>{statLine(sellItem)}</span>
                  </div>
                  <div className="market-sell-item-category">
                    Category: {categoryLabel(getItemCategory(sellItem))}
                  </div>
                  <div className="market-sell-item-suggested">
                    Sell to NPC: {sellItem.sellPrice}g
                  </div>
                </div>
              </div>

              <div className="market-sell-pricing">
                <label className="market-sell-label">Set Your Price</label>
                <div className="market-price-input-row">
                  <input
                    type="number"
                    className="market-price-input"
                    placeholder="Min 10 gold"
                    min={10}
                    max={999999}
                    value={sellPrice}
                    onChange={e => setSellPrice(e.target.value)}
                  />
                  <span className="market-price-suffix">gold</span>
                </div>
                {sellPrice && Number(sellPrice) >= 10 && (
                  <div className="market-price-breakdown">
                    <div className="market-price-row">
                      <span>Listing fee (5%)</span>
                      <span className="market-price-cost">-{listingFeePreview}g</span>
                    </div>
                    <div className="market-price-row">
                      <span>Sale tax (10%)</span>
                      <span className="market-price-cost">-{Math.max(1, Math.floor(Number(sellPrice) * SALE_TAX_PERCENT))}g</span>
                    </div>
                    <div className="market-price-row market-price-total">
                      <span>You receive on sale</span>
                      <span className="market-price-earn">{sellerReceivesPreview}g</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="market-sell-buttons">
                <button
                  className="market-list-btn"
                  onClick={handleListItem}
                  disabled={actionLoading || !sellPrice || Number(sellPrice) < 10 || (player?.gold ?? 0) < listingFeePreview}
                >
                  {actionLoading ? 'Listing...' : `List for ${sellPrice || '...'}g (Fee: ${listingFeePreview}g)`}
                </button>
                <button
                  className="market-sell-cancel-btn"
                  onClick={() => { setSellItem(null); setSellPrice(''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="market-sell-inventory">
              <div className="market-sell-header">
                <div className="market-sell-title">Select an item to list</div>
                <div className="market-sell-hint">Choose from your inventory to sell on the market</div>
              </div>
              {(!player?.inventory || player.inventory.length === 0) && (
                <div className="market-empty">
                  <div className="market-empty-text">Your inventory is empty</div>
                  <div className="market-empty-hint">Go explore and find items to sell!</div>
                </div>
              )}
              <div className="market-sell-list">
                {(player?.inventory || []).map(item => (
                  <div
                    key={item.id}
                    className={`market-sell-row ${item.rarityClass || ''}`}
                    onClick={() => setSellItem(item)}
                  >
                    <div className="market-sell-row-info">
                      <div className={`market-sell-row-name ${item.rarityClass || ''}`}>
                        {item.name}
                      </div>
                      <div className="market-sell-row-meta">
                        <span className={`market-rarity-badge ${item.rarityClass || ''}`}>
                          {item.rarity}
                        </span>
                        <span>Lv.{item.level}</span>
                        <span className="market-sell-row-stats">{statLine(item)}</span>
                      </div>
                    </div>
                    <div className="market-sell-row-action">
                      <span className="market-sell-row-npc">NPC: {item.sellPrice}g</span>
                      <span className="market-sell-row-arrow">&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Listings Tab */}
      {tab === 'my-listings' && (
        <div className="market-my-listings">
          <div className="market-section">
            <div className="market-section-title">Active Listings ({myActive.length}/8)</div>
            {myActive.length === 0 && (
              <div className="market-empty">
                <div className="market-empty-text">No active listings</div>
                <div className="market-empty-hint">Go to the Sell tab to list items</div>
              </div>
            )}
            {myActive.map(listing => (
              <div
                key={listing.id}
                className={`market-card market-my-card ${listing.item?.rarityClass || ''}`}
              >
                <div className="market-card-main">
                  <div className="market-card-top">
                    <span className="market-card-category">{categoryLabel(listing.category)}</span>
                    <span className="market-card-status active">Active</span>
                  </div>
                  <div className={`market-card-name ${listing.item?.rarityClass || ''}`}>
                    {listing.itemName}
                  </div>
                  <div className="market-card-meta">
                    <span className={`market-rarity-badge ${listing.item?.rarityClass || ''}`}>
                      {listing.rarity}
                    </span>
                    <span className="market-card-stats">{statLine(listing.item)}</span>
                  </div>
                </div>
                <div className="market-card-actions">
                  <div className="market-card-price">{listing.price}g</div>
                  <button
                    className="market-cancel-btn"
                    onClick={() => handleCancel(listing)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="market-section">
            <div className="market-section-title">Recent Sales</div>
            {mySold.length === 0 && (
              <div className="market-empty">
                <div className="market-empty-text">No sales yet</div>
              </div>
            )}
            {mySold.map(listing => (
              <div
                key={listing.id}
                className={`market-card market-sold-card ${listing.item?.rarityClass || ''}`}
              >
                <div className="market-card-main">
                  <div className="market-card-top">
                    <span className="market-card-category">{categoryLabel(listing.category)}</span>
                    <span className="market-card-status sold">Sold</span>
                  </div>
                  <div className={`market-card-name ${listing.item?.rarityClass || ''}`}>
                    {listing.itemName}
                  </div>
                  <div className="market-card-sold-info">
                    Bought by <strong>{listing.buyerName}</strong>
                  </div>
                </div>
                <div className="market-card-actions">
                  <div className="market-card-price">{listing.price}g</div>
                  <div className="market-card-proceeds">
                    Received: {listing.price - Math.max(1, Math.floor(listing.price * SALE_TAX_PERCENT))}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="market-footer">
        <button className="btn btn-back" onClick={onBack}>Back to Town</button>
        {tab === 'browse' && (
          <button className="btn market-refresh-btn" onClick={fetchListings} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>
    </div>
  );
}
