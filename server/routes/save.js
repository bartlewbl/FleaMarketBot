import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Prepared statements
const findSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const getSave = db.prepare('SELECT save_data, updated_at FROM game_saves WHERE user_id = ?');
const upsertSave = db.prepare(`
  INSERT INTO game_saves (user_id, save_data, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id)
  DO UPDATE SET save_data = excluded.save_data, updated_at = datetime('now')
`);
const deleteSave = db.prepare('DELETE FROM game_saves WHERE user_id = ?');

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

// Load game save
router.get('/', requireAuth, (req, res) => {
  const save = getSave.get(req.userId);
  if (!save) {
    return res.json({ hasSave: false });
  }
  res.json({ hasSave: true, saveData: JSON.parse(save.save_data), updatedAt: save.updated_at });
});

// Save game
router.post('/', requireAuth, (req, res) => {
  const { saveData } = req.body;
  if (!saveData) {
    return res.status(400).json({ error: 'No save data provided' });
  }
  upsertSave.run(req.userId, JSON.stringify(saveData));
  res.json({ ok: true });
});

// Delete save (new game)
router.delete('/', requireAuth, (req, res) => {
  deleteSave.run(req.userId);
  res.json({ ok: true });
});

export default router;
