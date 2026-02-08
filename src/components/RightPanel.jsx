import { useState, useEffect, useCallback } from 'react';
import {
  sendInvite, getInvites, acceptInvite, declineInvite,
  sendTrade, getTrades, acceptTrade, declineTrade, cancelTrade,
} from '../api';

const RARITY_COLORS = {
  Common: '#b0b0b0',
  Uncommon: '#5fff5f',
  Rare: '#5fa8ff',
  Epic: '#c76dff',
  Legendary: '#ffd700',
};

function ItemBadge({ item, selected, onClick }) {
  const color = RARITY_COLORS[item.rarity] || '#b0b0b0';
  return (
    <button
      type="button"
      className={`barter-item-badge ${selected ? 'selected' : ''}`}
      style={{ borderColor: selected ? color : undefined }}
      onClick={onClick}
      title={`${item.name} (${item.rarity})${item.atk ? ` ATK+${item.atk}` : ''}${item.def ? ` DEF+${item.def}` : ''}`}
    >
      <span className="barter-item-name" style={{ color }}>{item.name}</span>
    </button>
  );
}

function TradeItemList({ items, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="barter-trade-items">
      <div className="barter-trade-items-label">{label}</div>
      {items.map(item => {
        const color = RARITY_COLORS[item.rarity] || '#b0b0b0';
        return (
          <div key={item.id} className="barter-trade-item" style={{ borderColor: color }}>
            <span style={{ color }}>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RightPanel({ collapsed, onToggle, player, onTradeComplete }) {
  const [tab, setTab] = useState('friends'); // 'friends' | 'barter'
  const [inviteUsername, setInviteUsername] = useState('');
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState({ received: [], sent: [], friends: [] });
  const [loading, setLoading] = useState(false);

  // Barter state
  const [trades, setTrades] = useState({ incoming: [], outgoing: [] });
  const [barterTarget, setBarterTarget] = useState(null); // friend to barter with
  const [selectedItems, setSelectedItems] = useState([]); // item ids to offer
  const [offerGold, setOfferGold] = useState(0);
  const [tradeError, setTradeError] = useState(null);
  const [tradeSuccess, setTradeSuccess] = useState(null);
  const [tradeSending, setTradeSending] = useState(false);

  // Accept trade state
  const [acceptingTrade, setAcceptingTrade] = useState(null); // trade id being accepted
  const [returnSelectedItems, setReturnSelectedItems] = useState([]);
  const [returnGold, setReturnGold] = useState(0);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInvites();
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const result = await getTrades();
      setTrades(result);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchInvites();
    fetchTrades();
    const interval = setInterval(() => {
      fetchInvites();
      fetchTrades();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchInvites, fetchTrades]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = inviteUsername.trim();
    if (!trimmed) return;
    setSendError(null);
    setSendSuccess(null);
    setSending(true);
    try {
      await sendInvite(trimmed);
      setSendSuccess(`Invite sent to ${trimmed}!`);
      setInviteUsername('');
      fetchInvites();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(id) {
    try {
      await acceptInvite(id);
      fetchInvites();
    } catch {
      // silent
    }
  }

  async function handleDecline(id) {
    try {
      await declineInvite(id);
      fetchInvites();
    } catch {
      // silent
    }
  }

  // Barter actions
  function toggleItemSelection(item) {
    setSelectedItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  }

  function toggleReturnItemSelection(item) {
    setReturnSelectedItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  }

  async function handleSendTrade() {
    if (!barterTarget) return;
    if (selectedItems.length === 0 && offerGold === 0) {
      setTradeError('Select items or gold to offer');
      return;
    }
    setTradeError(null);
    setTradeSuccess(null);
    setTradeSending(true);
    try {
      await sendTrade(barterTarget.user_id, selectedItems, offerGold);
      setTradeSuccess('Trade offer sent!');
      setSelectedItems([]);
      setOfferGold(0);
      setBarterTarget(null);
      fetchTrades();
    } catch (err) {
      setTradeError(err.message);
    } finally {
      setTradeSending(false);
    }
  }

  async function handleAcceptTrade(tradeId) {
    setTradeError(null);
    setTradeSending(true);
    try {
      const result = await acceptTrade(tradeId, returnSelectedItems, returnGold);
      setTradeSuccess('Trade completed!');
      setAcceptingTrade(null);
      setReturnSelectedItems([]);
      setReturnGold(0);
      fetchTrades();
      if (onTradeComplete && result) {
        onTradeComplete(result.receivedItems, result.receivedGold, returnSelectedItems, returnGold);
      }
    } catch (err) {
      setTradeError(err.message);
    } finally {
      setTradeSending(false);
    }
  }

  async function handleDeclineTrade(tradeId) {
    try {
      await declineTrade(tradeId);
      fetchTrades();
    } catch {
      // silent
    }
  }

  async function handleCancelTrade(tradeId) {
    try {
      await cancelTrade(tradeId);
      fetchTrades();
    } catch {
      // silent
    }
  }

  // Auto-clear messages
  useEffect(() => {
    if (sendSuccess) {
      const t = setTimeout(() => setSendSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [sendSuccess]);

  useEffect(() => {
    if (sendError) {
      const t = setTimeout(() => setSendError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [sendError]);

  useEffect(() => {
    if (tradeSuccess) {
      const t = setTimeout(() => setTradeSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [tradeSuccess]);

  useEffect(() => {
    if (tradeError) {
      const t = setTimeout(() => setTradeError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [tradeError]);

  const inventory = player?.inventory || [];
  const playerGold = player?.gold || 0;

  // Filter tradeable items (not equipped, no potions/energy-drinks)
  const tradeableItems = inventory.filter(
    i => i.type !== 'potion' && i.type !== 'energy-drink'
  );

  const totalIncomingTrades = trades.incoming.length;

  return (
    <aside className={`right-panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="right-panel-toggle"
        type="button"
        aria-label="Toggle friends panel"
        onClick={onToggle}
      >
        {collapsed ? '<' : '>'}
      </button>

      <div className="right-panel-body">
        {/* Tab Switcher */}
        <div className="barter-tabs">
          <button
            type="button"
            className={`barter-tab ${tab === 'friends' ? 'active' : ''}`}
            onClick={() => setTab('friends')}
          >
            Friends
          </button>
          <button
            type="button"
            className={`barter-tab ${tab === 'barter' ? 'active' : ''}`}
            onClick={() => setTab('barter')}
          >
            Barter{totalIncomingTrades > 0 ? ` (${totalIncomingTrades})` : ''}
          </button>
        </div>

        {/* ===== FRIENDS TAB ===== */}
        {tab === 'friends' && (
          <>
            <div className="right-panel-heading">
              <div className="right-panel-subtitle">Invite players to your party</div>
            </div>

            {/* Send Invite Form */}
            <form className="invite-form" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Username..."
                value={inviteUsername}
                onChange={e => { setInviteUsername(e.target.value); setSendError(null); }}
                className="invite-input"
                maxLength={20}
              />
              <button
                type="submit"
                className="invite-send-btn"
                disabled={sending || !inviteUsername.trim()}
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>

            {sendError && <div className="invite-error">{sendError}</div>}
            {sendSuccess && <div className="invite-success">{sendSuccess}</div>}

            {/* Received Invites */}
            {data.received.length > 0 && (
              <div className="invite-section">
                <div className="invite-section-title">Pending Requests</div>
                <div className="invite-list">
                  {data.received.map(inv => (
                    <div key={inv.id} className="invite-card invite-card-received">
                      <div className="invite-card-name">{inv.from_username}</div>
                      <div className="invite-card-actions">
                        <button
                          className="invite-accept-btn"
                          onClick={() => handleAccept(inv.id)}
                          title="Accept"
                        >
                          +
                        </button>
                        <button
                          className="invite-decline-btn"
                          onClick={() => handleDecline(inv.id)}
                          title="Decline"
                        >
                          x
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Invites */}
            {data.sent.length > 0 && (
              <div className="invite-section">
                <div className="invite-section-title">Sent Invites</div>
                <div className="invite-list">
                  {data.sent.map(inv => (
                    <div key={inv.id} className="invite-card invite-card-sent">
                      <div className="invite-card-name">{inv.to_username}</div>
                      <div className="invite-card-status">Pending</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="invite-section">
              <div className="invite-section-title">
                Friends{data.friends.length > 0 ? ` (${data.friends.length})` : ''}
              </div>
              {data.friends.length === 0 ? (
                <div className="invite-empty">
                  No friends yet. Send an invite!
                </div>
              ) : (
                <div className="invite-list">
                  {data.friends.map(f => (
                    <div key={f.user_id} className="invite-card invite-card-friend">
                      <div className="invite-friend-dot" />
                      <div className="invite-card-name">{f.username}</div>
                      <button
                        type="button"
                        className="barter-friend-btn"
                        onClick={() => {
                          setBarterTarget(f);
                          setSelectedItems([]);
                          setOfferGold(0);
                          setTab('barter');
                        }}
                        title={`Trade with ${f.username}`}
                      >
                        Trade
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== BARTER TAB ===== */}
        {tab === 'barter' && (
          <>
            {tradeError && <div className="invite-error">{tradeError}</div>}
            {tradeSuccess && <div className="invite-success">{tradeSuccess}</div>}

            {/* Create Trade Offer */}
            {barterTarget && (
              <div className="barter-create-section">
                <div className="barter-section-header">
                  <div className="invite-section-title">
                    Trade with {barterTarget.username}
                  </div>
                  <button
                    type="button"
                    className="barter-close-btn"
                    onClick={() => setBarterTarget(null)}
                  >
                    x
                  </button>
                </div>

                {/* Item selection */}
                <div className="barter-pick-label">Select items to offer:</div>
                {tradeableItems.length === 0 ? (
                  <div className="invite-empty">No tradeable items</div>
                ) : (
                  <div className="barter-item-grid">
                    {tradeableItems.map(item => (
                      <ItemBadge
                        key={item.id}
                        item={item}
                        selected={selectedItems.some(i => i.id === item.id)}
                        onClick={() => toggleItemSelection(item)}
                      />
                    ))}
                  </div>
                )}

                {/* Gold input */}
                <div className="barter-gold-row">
                  <label className="barter-gold-label">
                    Gold:
                    <input
                      type="number"
                      className="barter-gold-input"
                      min={0}
                      max={playerGold}
                      value={offerGold}
                      onChange={e => setOfferGold(Math.max(0, Math.min(playerGold, parseInt(e.target.value) || 0)))}
                    />
                  </label>
                  <span className="barter-gold-avail">/ {playerGold}g</span>
                </div>

                {/* Summary */}
                {(selectedItems.length > 0 || offerGold > 0) && (
                  <div className="barter-summary">
                    Offering: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                    {offerGold > 0 ? ` + ${offerGold}g` : ''}
                  </div>
                )}

                <button
                  type="button"
                  className="barter-send-btn"
                  disabled={tradeSending || (selectedItems.length === 0 && offerGold === 0)}
                  onClick={handleSendTrade}
                >
                  {tradeSending ? '...' : 'Send Offer'}
                </button>
              </div>
            )}

            {/* Incoming Trades */}
            {trades.incoming.length > 0 && (
              <div className="invite-section">
                <div className="invite-section-title">Incoming Trades</div>
                <div className="invite-list">
                  {trades.incoming.map(trade => (
                    <div key={trade.id} className="barter-trade-card">
                      <div className="barter-trade-from">
                        From: <strong>{trade.from_username}</strong>
                      </div>
                      <TradeItemList items={trade.offer_items} label="They offer:" />
                      {trade.offer_gold > 0 && (
                        <div className="barter-trade-gold">+ {trade.offer_gold}g</div>
                      )}

                      {acceptingTrade === trade.id ? (
                        <div className="barter-accept-section">
                          <div className="barter-pick-label">Your items in return:</div>
                          {tradeableItems.length === 0 ? (
                            <div className="invite-empty">No items to offer</div>
                          ) : (
                            <div className="barter-item-grid">
                              {tradeableItems.map(item => (
                                <ItemBadge
                                  key={item.id}
                                  item={item}
                                  selected={returnSelectedItems.some(i => i.id === item.id)}
                                  onClick={() => toggleReturnItemSelection(item)}
                                />
                              ))}
                            </div>
                          )}
                          <div className="barter-gold-row">
                            <label className="barter-gold-label">
                              Gold:
                              <input
                                type="number"
                                className="barter-gold-input"
                                min={0}
                                max={playerGold}
                                value={returnGold}
                                onChange={e => setReturnGold(Math.max(0, Math.min(playerGold, parseInt(e.target.value) || 0)))}
                              />
                            </label>
                            <span className="barter-gold-avail">/ {playerGold}g</span>
                          </div>
                          <div className="barter-accept-actions">
                            <button
                              type="button"
                              className="invite-accept-btn barter-confirm-btn"
                              disabled={tradeSending}
                              onClick={() => handleAcceptTrade(trade.id)}
                              title="Confirm trade"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              className="invite-decline-btn"
                              onClick={() => {
                                setAcceptingTrade(null);
                                setReturnSelectedItems([]);
                                setReturnGold(0);
                              }}
                              title="Cancel"
                            >
                              x
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="invite-card-actions">
                          <button
                            className="invite-accept-btn"
                            onClick={() => {
                              setAcceptingTrade(trade.id);
                              setReturnSelectedItems([]);
                              setReturnGold(0);
                            }}
                            title="Accept trade"
                          >
                            +
                          </button>
                          <button
                            className="invite-decline-btn"
                            onClick={() => handleDeclineTrade(trade.id)}
                            title="Decline trade"
                          >
                            x
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Trades */}
            {trades.outgoing.length > 0 && (
              <div className="invite-section">
                <div className="invite-section-title">Sent Trades</div>
                <div className="invite-list">
                  {trades.outgoing.map(trade => (
                    <div key={trade.id} className="barter-trade-card">
                      <div className="barter-trade-from">
                        To: <strong>{trade.to_username}</strong>
                      </div>
                      <TradeItemList items={trade.offer_items} label="You offer:" />
                      {trade.offer_gold > 0 && (
                        <div className="barter-trade-gold">+ {trade.offer_gold}g</div>
                      )}
                      <button
                        type="button"
                        className="barter-cancel-btn"
                        onClick={() => handleCancelTrade(trade.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!barterTarget && trades.incoming.length === 0 && trades.outgoing.length === 0 && (
              <div className="invite-empty">
                No active trades. Go to Friends tab and click Trade on a friend to start bartering!
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
