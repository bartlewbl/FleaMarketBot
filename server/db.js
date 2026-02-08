import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'game.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    save_data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_date TEXT NOT NULL,
    streak INTEGER NOT NULL DEFAULT 1,
    reward_day INTEGER NOT NULL DEFAULT 1,
    claimed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, login_date)
  );

  CREATE TABLE IF NOT EXISTS invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    UNIQUE(from_user_id, to_user_id)
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    offer_items TEXT NOT NULL DEFAULT '[]',
    offer_gold INTEGER NOT NULL DEFAULT 0,
    return_items TEXT NOT NULL DEFAULT '[]',
    return_gold INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS market_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_user_id INTEGER NOT NULL,
    item_data TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'Common',
    item_level INTEGER NOT NULL DEFAULT 1,
    item_name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    buyer_user_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    sold_at TEXT,
    FOREIGN KEY (seller_user_id) REFERENCES users(id),
    FOREIGN KEY (buyer_user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_market_status ON market_listings(status);
  CREATE INDEX IF NOT EXISTS idx_market_category ON market_listings(category, status);
  CREATE INDEX IF NOT EXISTS idx_market_seller ON market_listings(seller_user_id, status);
`);

export default db;
