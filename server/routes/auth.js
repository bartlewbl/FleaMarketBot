import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

// Prepared statements
const findUser = db.prepare('SELECT * FROM users WHERE username = ?');
const createUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
const createSession = db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)');
const findSession = db.prepare('SELECT sessions.*, users.username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.id = ?');
const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 2-20 characters' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const existing = findUser.get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = createUser.run(username, hash);

  const sessionId = uuidv4();
  createSession.run(sessionId, result.lastInsertRowid);

  res.json({ sessionId, username, userId: result.lastInsertRowid });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = findUser.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const sessionId = uuidv4();
  createSession.run(sessionId, user.id);

  res.json({ sessionId, username: user.username, userId: user.id });
});

// Get current user from session
router.get('/me', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = findSession.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  res.json({ username: session.username, userId: session.user_id });
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    deleteSession.run(sessionId);
  }
  res.json({ ok: true });
});

export default router;
