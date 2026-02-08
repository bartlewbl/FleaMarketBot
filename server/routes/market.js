import { Router } from 'express';
import db from '../db.js';

const router = Router();

const LISTING_FEE_PERCENT = 0.05; // 5% listing fee
const SALE_TAX_PERCENT = 0.10;    // 10% tax on sale proceeds
const MIN_PRICE = 10;
const MAX_PRICE = 999999;
const MAX_ACTIVE_LISTINGS = 8;
const MIN_LEVEL = 10;

// Prepared statements
const findSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const getSave = db.prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
const upsertSave = db.prepare(`
  INSERT INTO game_saves (user_id, save_data, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id)
  DO UPDATE SET save_data = excluded.save_data, updated_at = datetime('now')
`);
const findUserById = db.prepare('SELECT id, username FROM users WHERE id = ?');

const createListing = db.prepare(`
  INSERT INTO market_listings (seller_user_id, item_data, price, category, rarity, item_level, item_name, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
`);

const getActiveListings = db.prepare(`
  SELECT market_listings.*, users.username AS seller_name
  FROM market_listings
  JOIN users ON market_listings.seller_user_id = users.id
  WHERE market_listings.status = 'active'
  ORDER BY market_listings.created_at DESC
  LIMIT 200
`);

const getActiveListingsByCategory = db.prepare(`
  SELECT market_listings.*, users.username AS seller_name
  FROM market_listings
  JOIN users ON market_listings.seller_user_id = users.id
  WHERE market_listings.status = 'active' AND market_listings.category = ?
  ORDER BY market_listings.created_at DESC
  LIMIT 200
`);

const getMyListings = db.prepare(`
  SELECT market_listings.*, users.username AS seller_name
  FROM market_listings
  JOIN users ON market_listings.seller_user_id = users.id
  WHERE market_listings.seller_user_id = ? AND market_listings.status = 'active'
  ORDER BY market_listings.created_at DESC
`);

const getMySoldListings = db.prepare(`
  SELECT market_listings.*, users.username AS seller_name,
    u2.username AS buyer_name
  FROM market_listings
  JOIN users ON market_listings.seller_user_id = users.id
  LEFT JOIN users u2 ON market_listings.buyer_user_id = u2.id
  WHERE market_listings.seller_user_id = ? AND market_listings.status = 'sold'
  ORDER BY market_listings.sold_at DESC
  LIMIT 20
`);

const findListingById = db.prepare('SELECT * FROM market_listings WHERE id = ?');

const countActiveListings = db.prepare(
  'SELECT COUNT(*) as count FROM market_listings WHERE seller_user_id = ? AND status = \'active\''
);

const markAsSold = db.prepare(`
  UPDATE market_listings SET status = 'sold', buyer_user_id = ?, sold_at = datetime('now') WHERE id = ?
`);

const cancelListing = db.prepare(
  'UPDATE market_listings SET status = \'cancelled\' WHERE id = ?'
);

const searchListings = db.prepare(`
  SELECT market_listings.*, users.username AS seller_name
  FROM market_listings
  JOIN users ON market_listings.seller_user_id = users.id
  WHERE market_listings.status = 'active'
    AND (market_listings.item_name LIKE ? OR market_listings.category LIKE ? OR market_listings.rarity LIKE ?)
  ORDER BY market_listings.created_at DESC
  LIMIT 200
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

// List an item on the market
router.post('/list', requireAuth, (req, res) => {
  const { itemId, price } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'Item is required' });
  }
  if (!price || price < MIN_PRICE || price > MAX_PRICE) {
    return res.status(400).json({ error: `Price must be between ${MIN_PRICE} and ${MAX_PRICE} gold` });
  }

  const intPrice = Math.floor(price);

  // Load seller's save
  const sellerSave = getSave.get(req.userId);
  if (!sellerSave) {
    return res.status(400).json({ error: 'No save data found' });
  }
  const saveData = JSON.parse(sellerSave.save_data);
  const player = saveData.player;

  // Check level requirement
  if ((player.level || 1) < MIN_LEVEL) {
    return res.status(403).json({ error: `You must be level ${MIN_LEVEL} or higher to use the market` });
  }

  // Check active listing count
  const activeCount = countActiveListings.get(req.userId);
  if (activeCount.count >= MAX_ACTIVE_LISTINGS) {
    return res.status(400).json({ error: `You can only have ${MAX_ACTIVE_LISTINGS} active listings at a time` });
  }

  // Find the item in inventory
  const inventory = player.inventory || [];
  const itemIndex = inventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return res.status(400).json({ error: 'Item not found in your inventory' });
  }
  const item = inventory[itemIndex];

  // Calculate listing fee
  const listingFee = Math.max(1, Math.floor(intPrice * LISTING_FEE_PERCENT));
  if (player.gold < listingFee) {
    return res.status(400).json({ error: `Not enough gold for the listing fee (${listingFee}g)` });
  }

  // Remove item from inventory and deduct fee
  player.inventory = inventory.filter((_, i) => i !== itemIndex);
  player.gold -= listingFee;
  saveData.player = player;
  upsertSave.run(req.userId, JSON.stringify(saveData));

  // Create the listing
  const category = getItemCategory(item);
  const result = createListing.run(
    req.userId,
    JSON.stringify(item),
    intPrice,
    category,
    item.rarity || 'Common',
    item.level || 1,
    item.name || 'Unknown Item'
  );

  res.json({
    ok: true,
    listingId: result.lastInsertRowid,
    listingFee,
    newGold: player.gold,
    removedItemId: itemId,
  });
});

// Browse market listings
router.get('/listings', requireAuth, (req, res) => {
  const { category, search } = req.query;

  let listings;
  if (search) {
    const term = `%${search}%`;
    listings = searchListings.all(term, term, term);
  } else if (category && category !== 'all') {
    listings = getActiveListingsByCategory.all(category);
  } else {
    listings = getActiveListings.all();
  }

  const parsed = listings.map(l => ({
    id: l.id,
    sellerName: l.seller_name,
    sellerId: l.seller_user_id,
    item: JSON.parse(l.item_data),
    price: l.price,
    category: l.category,
    rarity: l.rarity,
    itemLevel: l.item_level,
    itemName: l.item_name,
    createdAt: l.created_at,
  }));

  res.json({ listings: parsed });
});

// Get my listings (active + recently sold)
router.get('/my-listings', requireAuth, (req, res) => {
  const active = getMyListings.all(req.userId).map(l => ({
    id: l.id,
    item: JSON.parse(l.item_data),
    price: l.price,
    category: l.category,
    rarity: l.rarity,
    itemName: l.item_name,
    status: l.status,
    createdAt: l.created_at,
  }));

  const sold = getMySoldListings.all(req.userId).map(l => ({
    id: l.id,
    item: JSON.parse(l.item_data),
    price: l.price,
    category: l.category,
    rarity: l.rarity,
    itemName: l.item_name,
    status: l.status,
    buyerName: l.buyer_name,
    soldAt: l.sold_at,
  }));

  res.json({ active, sold });
});

// Buy an item from the market
router.post('/:id/buy', requireAuth, (req, res) => {
  const listing = findListingById.get(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.status !== 'active') {
    return res.status(400).json({ error: 'This listing is no longer available' });
  }
  if (listing.seller_user_id === req.userId) {
    return res.status(400).json({ error: 'You cannot buy your own listing' });
  }

  // Load buyer's save
  const buyerSave = getSave.get(req.userId);
  if (!buyerSave) {
    return res.status(400).json({ error: 'No save data found' });
  }
  const buyerData = JSON.parse(buyerSave.save_data);
  const buyerPlayer = buyerData.player;

  // Check buyer level
  if ((buyerPlayer.level || 1) < MIN_LEVEL) {
    return res.status(403).json({ error: `You must be level ${MIN_LEVEL} or higher to use the market` });
  }

  // Check buyer has enough gold
  if (buyerPlayer.gold < listing.price) {
    return res.status(400).json({ error: 'Not enough gold' });
  }

  // Check buyer has inventory space
  const buyerInv = buyerPlayer.inventory || [];
  const buyerMaxInv = buyerPlayer.maxInventory || 20;
  if (buyerInv.length >= buyerMaxInv) {
    return res.status(400).json({ error: 'Your inventory is full' });
  }

  // Load seller's save to credit gold
  const sellerSave = getSave.get(listing.seller_user_id);
  if (!sellerSave) {
    return res.status(500).json({ error: 'Seller data not found' });
  }
  const sellerData = JSON.parse(sellerSave.save_data);
  const sellerPlayer = sellerData.player;

  const item = JSON.parse(listing.item_data);

  // Calculate sale tax
  const saleTax = Math.max(1, Math.floor(listing.price * SALE_TAX_PERCENT));
  const sellerProceeds = listing.price - saleTax;

  // Execute the purchase
  buyerPlayer.gold -= listing.price;
  buyerPlayer.inventory = [...buyerInv, item];
  buyerData.player = buyerPlayer;

  sellerPlayer.gold = (sellerPlayer.gold || 0) + sellerProceeds;
  sellerData.player = sellerPlayer;

  // Save both
  upsertSave.run(req.userId, JSON.stringify(buyerData));
  upsertSave.run(listing.seller_user_id, JSON.stringify(sellerData));

  // Mark listing as sold
  markAsSold.run(req.userId, listing.id);

  res.json({
    ok: true,
    item,
    price: listing.price,
    saleTax,
    newGold: buyerPlayer.gold,
  });
});

// Cancel own listing (item returned to inventory)
router.post('/:id/cancel', requireAuth, (req, res) => {
  const listing = findListingById.get(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.seller_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your listing to cancel' });
  }
  if (listing.status !== 'active') {
    return res.status(400).json({ error: 'Listing is no longer active' });
  }

  // Return item to seller's inventory
  const sellerSave = getSave.get(req.userId);
  if (!sellerSave) {
    return res.status(400).json({ error: 'No save data found' });
  }
  const saveData = JSON.parse(sellerSave.save_data);
  const player = saveData.player;
  const inventory = player.inventory || [];
  const maxInv = player.maxInventory || 20;

  if (inventory.length >= maxInv) {
    return res.status(400).json({ error: 'Your inventory is full. Make room before cancelling.' });
  }

  const item = JSON.parse(listing.item_data);
  player.inventory = [...inventory, item];
  saveData.player = player;
  upsertSave.run(req.userId, JSON.stringify(saveData));

  cancelListing.run(listing.id);

  res.json({
    ok: true,
    returnedItem: item,
  });
});

export default router;
