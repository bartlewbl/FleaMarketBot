import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Prepared statements
const findSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const findUserById = db.prepare('SELECT id, username FROM users WHERE id = ?');
const getSave = db.prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
const upsertSave = db.prepare(`
  INSERT INTO game_saves (user_id, save_data, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id)
  DO UPDATE SET save_data = excluded.save_data, updated_at = datetime('now')
`);

const createTrade = db.prepare(
  'INSERT INTO trades (from_user_id, to_user_id, offer_items, offer_gold, status) VALUES (?, ?, ?, ?, \'pending\')'
);

const getIncomingTrades = db.prepare(`
  SELECT trades.id, trades.from_user_id, trades.offer_items, trades.offer_gold,
    trades.status, trades.created_at, users.username AS from_username
  FROM trades
  JOIN users ON trades.from_user_id = users.id
  WHERE trades.to_user_id = ? AND trades.status = 'pending'
  ORDER BY trades.created_at DESC
`);

const getOutgoingTrades = db.prepare(`
  SELECT trades.id, trades.to_user_id, trades.offer_items, trades.offer_gold,
    trades.status, trades.created_at, users.username AS to_username
  FROM trades
  JOIN users ON trades.to_user_id = users.id
  WHERE trades.from_user_id = ? AND trades.status = 'pending'
  ORDER BY trades.created_at DESC
`);

const getCompletedTrades = db.prepare(`
  SELECT trades.id, trades.from_user_id, trades.to_user_id,
    trades.offer_items, trades.offer_gold, trades.return_items, trades.return_gold,
    trades.status, trades.created_at,
    u1.username AS from_username, u2.username AS to_username
  FROM trades
  JOIN users u1 ON trades.from_user_id = u1.id
  JOIN users u2 ON trades.to_user_id = u2.id
  WHERE (trades.from_user_id = ? OR trades.to_user_id = ?)
    AND trades.status IN ('completed', 'declined')
  ORDER BY trades.created_at DESC
  LIMIT 10
`);

const findTradeById = db.prepare('SELECT * FROM trades WHERE id = ?');

const updateTradeStatus = db.prepare(
  'UPDATE trades SET status = ? WHERE id = ?'
);

const completeTrade = db.prepare(
  'UPDATE trades SET status = \'completed\', return_items = ?, return_gold = ? WHERE id = ?'
);

// Check if two users are friends
const checkFriendship = db.prepare(`
  SELECT id FROM invites
  WHERE status = 'accepted'
    AND ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?))
  LIMIT 1
`);

// Auth middleware
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const session = findSession.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  req.userId = session.user_id;
  next();
}

// Send a trade offer to a friend
router.post('/send', requireAuth, (req, res) => {
  const { toUserId, offerItems, offerGold } = req.body;

  if (!toUserId) {
    return res.status(400).json({ error: 'Recipient is required' });
  }
  if (toUserId === req.userId) {
    return res.status(400).json({ error: 'Cannot trade with yourself' });
  }

  const items = Array.isArray(offerItems) ? offerItems : [];
  const gold = Math.max(0, Math.floor(offerGold || 0));

  if (items.length === 0 && gold === 0) {
    return res.status(400).json({ error: 'Must offer at least one item or some gold' });
  }

  // Verify friendship
  const friendship = checkFriendship.get(req.userId, toUserId, toUserId, req.userId);
  if (!friendship) {
    return res.status(403).json({ error: 'You can only trade with friends' });
  }

  // Verify sender has the items and gold
  const senderSave = getSave.get(req.userId);
  if (!senderSave) {
    return res.status(400).json({ error: 'No save data found' });
  }
  const saveData = JSON.parse(senderSave.save_data);
  const playerGold = saveData.player?.gold ?? 0;
  const playerInventory = saveData.player?.inventory ?? [];

  if (gold > playerGold) {
    return res.status(400).json({ error: 'Not enough gold' });
  }

  // Verify all offered items exist in inventory
  const offerItemIds = items.map(i => i.id);
  const uniqueIds = new Set(offerItemIds);
  if (uniqueIds.size !== offerItemIds.length) {
    return res.status(400).json({ error: 'Duplicate items in offer' });
  }
  for (const itemId of offerItemIds) {
    if (!playerInventory.some(i => i.id === itemId)) {
      return res.status(400).json({ error: 'Item not found in inventory' });
    }
  }

  const result = createTrade.run(req.userId, toUserId, JSON.stringify(items), gold);
  res.json({ ok: true, tradeId: result.lastInsertRowid });
});

// Get all trades for current user
router.get('/', requireAuth, (req, res) => {
  const incoming = getIncomingTrades.all(req.userId).map(t => ({
    ...t,
    offer_items: JSON.parse(t.offer_items),
  }));
  const outgoing = getOutgoingTrades.all(req.userId).map(t => ({
    ...t,
    offer_items: JSON.parse(t.offer_items),
  }));

  res.json({ incoming, outgoing });
});

// Accept a trade (receiver provides their return items + gold)
router.post('/:id/accept', requireAuth, (req, res) => {
  const trade = findTradeById.get(req.params.id);
  if (!trade) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  if (trade.to_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your trade to accept' });
  }
  if (trade.status !== 'pending') {
    return res.status(400).json({ error: 'Trade already handled' });
  }

  const { returnItems, returnGold } = req.body;
  const rItems = Array.isArray(returnItems) ? returnItems : [];
  const rGold = Math.max(0, Math.floor(returnGold || 0));

  // Load both saves
  const senderSave = getSave.get(trade.from_user_id);
  const receiverSave = getSave.get(req.userId);
  if (!senderSave || !receiverSave) {
    return res.status(400).json({ error: 'Save data not found' });
  }

  const senderData = JSON.parse(senderSave.save_data);
  const receiverData = JSON.parse(receiverSave.save_data);

  const senderPlayer = senderData.player;
  const receiverPlayer = receiverData.player;

  const offerItems = JSON.parse(trade.offer_items);
  const offerGold = trade.offer_gold;

  // Validate sender still has the offered items and gold
  const senderInventory = senderPlayer.inventory || [];
  for (const item of offerItems) {
    if (!senderInventory.some(i => i.id === item.id)) {
      updateTradeStatus.run('cancelled', trade.id);
      return res.status(400).json({ error: 'Sender no longer has offered items. Trade cancelled.' });
    }
  }
  if (offerGold > (senderPlayer.gold ?? 0)) {
    updateTradeStatus.run('cancelled', trade.id);
    return res.status(400).json({ error: 'Sender no longer has enough gold. Trade cancelled.' });
  }

  // Validate receiver has the return items and gold
  const receiverInventory = receiverPlayer.inventory || [];
  const returnItemIds = rItems.map(i => i.id);
  const uniqueReturnIds = new Set(returnItemIds);
  if (uniqueReturnIds.size !== returnItemIds.length) {
    return res.status(400).json({ error: 'Duplicate items in return offer' });
  }
  for (const item of rItems) {
    if (!receiverInventory.some(i => i.id === item.id)) {
      return res.status(400).json({ error: 'Item not found in your inventory' });
    }
  }
  if (rGold > (receiverPlayer.gold ?? 0)) {
    return res.status(400).json({ error: 'Not enough gold' });
  }

  // Check inventory space
  const senderMaxInv = senderPlayer.maxInventory || 20;
  const receiverMaxInv = receiverPlayer.maxInventory || 20;

  const senderNewSize = senderInventory.length - offerItems.length + rItems.length;
  const receiverNewSize = receiverInventory.length - rItems.length + offerItems.length;

  if (senderNewSize > senderMaxInv) {
    return res.status(400).json({ error: 'Sender\'s inventory would be too full' });
  }
  if (receiverNewSize > receiverMaxInv) {
    return res.status(400).json({ error: 'Your inventory would be too full' });
  }

  // Execute the trade
  const offerItemIds = new Set(offerItems.map(i => i.id));
  const returnItemIdSet = new Set(returnItemIds);

  // Sender: remove offered items, add return items, adjust gold
  senderPlayer.inventory = senderInventory
    .filter(i => !offerItemIds.has(i.id))
    .concat(rItems);
  senderPlayer.gold = (senderPlayer.gold ?? 0) - offerGold + rGold;

  // Receiver: remove return items, add offered items, adjust gold
  receiverPlayer.inventory = receiverInventory
    .filter(i => !returnItemIdSet.has(i.id))
    .concat(offerItems);
  receiverPlayer.gold = (receiverPlayer.gold ?? 0) - rGold + offerGold;

  // Save both
  senderData.player = senderPlayer;
  receiverData.player = receiverPlayer;

  upsertSave.run(trade.from_user_id, JSON.stringify(senderData));
  upsertSave.run(req.userId, JSON.stringify(receiverData));

  // Mark trade as completed
  completeTrade.run(JSON.stringify(rItems), rGold, trade.id);

  res.json({ ok: true, receivedItems: offerItems, receivedGold: offerGold });
});

// Decline a trade
router.post('/:id/decline', requireAuth, (req, res) => {
  const trade = findTradeById.get(req.params.id);
  if (!trade) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  if (trade.to_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your trade to decline' });
  }
  if (trade.status !== 'pending') {
    return res.status(400).json({ error: 'Trade already handled' });
  }

  updateTradeStatus.run('declined', trade.id);
  res.json({ ok: true });
});

// Cancel own outgoing trade
router.post('/:id/cancel', requireAuth, (req, res) => {
  const trade = findTradeById.get(req.params.id);
  if (!trade) {
    return res.status(404).json({ error: 'Trade not found' });
  }
  if (trade.from_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your trade to cancel' });
  }
  if (trade.status !== 'pending') {
    return res.status(400).json({ error: 'Trade already handled' });
  }

  updateTradeStatus.run('cancelled', trade.id);
  res.json({ ok: true });
});

export default router;
