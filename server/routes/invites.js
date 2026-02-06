import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Prepared statements
const findSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const findUserByUsername = db.prepare('SELECT id, username FROM users WHERE username = ?');
const findUserById = db.prepare('SELECT id, username FROM users WHERE id = ?');

const createInvite = db.prepare(
  'INSERT OR IGNORE INTO invites (from_user_id, to_user_id, status) VALUES (?, ?, \'pending\')'
);

const getReceivedInvites = db.prepare(`
  SELECT invites.id, invites.status, invites.created_at,
    users.username AS from_username, invites.from_user_id
  FROM invites
  JOIN users ON invites.from_user_id = users.id
  WHERE invites.to_user_id = ? AND invites.status = 'pending'
  ORDER BY invites.created_at DESC
`);

const getSentInvites = db.prepare(`
  SELECT invites.id, invites.status, invites.created_at,
    users.username AS to_username, invites.to_user_id
  FROM invites
  JOIN users ON invites.to_user_id = users.id
  WHERE invites.from_user_id = ? AND invites.status = 'pending'
  ORDER BY invites.created_at DESC
`);

const getFriends = db.prepare(`
  SELECT users.id AS user_id, users.username
  FROM invites
  JOIN users ON (
    CASE WHEN invites.from_user_id = ? THEN invites.to_user_id ELSE invites.from_user_id END
  ) = users.id
  WHERE invites.status = 'accepted'
    AND (invites.from_user_id = ? OR invites.to_user_id = ?)
  ORDER BY users.username
`);

const findInviteById = db.prepare('SELECT * FROM invites WHERE id = ?');

const updateInviteStatus = db.prepare(
  'UPDATE invites SET status = ? WHERE id = ?'
);

const findExistingInvite = db.prepare(
  'SELECT * FROM invites WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)) AND status = \'accepted\''
);

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

// Send an invite to a user by username
router.post('/send', requireAuth, (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const targetUser = findUserByUsername.get(username);
  if (!targetUser) {
    return res.status(404).json({ error: 'Player not found' });
  }

  if (targetUser.id === req.userId) {
    return res.status(400).json({ error: 'Cannot invite yourself' });
  }

  // Check if already friends
  const existing = findExistingInvite.get(req.userId, targetUser.id, targetUser.id, req.userId);
  if (existing) {
    return res.status(409).json({ error: 'Already friends with this player' });
  }

  const result = createInvite.run(req.userId, targetUser.id);
  if (result.changes === 0) {
    return res.status(409).json({ error: 'Invite already sent' });
  }

  res.json({ ok: true, toUsername: targetUser.username });
});

// Get all invites (received, sent, and friends)
router.get('/', requireAuth, (req, res) => {
  const received = getReceivedInvites.all(req.userId);
  const sent = getSentInvites.all(req.userId);
  const friends = getFriends.all(req.userId, req.userId, req.userId);

  res.json({ received, sent, friends });
});

// Accept an invite
router.post('/:id/accept', requireAuth, (req, res) => {
  const invite = findInviteById.get(req.params.id);
  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' });
  }
  if (invite.to_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your invite' });
  }
  if (invite.status !== 'pending') {
    return res.status(400).json({ error: 'Invite already handled' });
  }

  updateInviteStatus.run('accepted', invite.id);
  res.json({ ok: true });
});

// Decline an invite
router.post('/:id/decline', requireAuth, (req, res) => {
  const invite = findInviteById.get(req.params.id);
  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' });
  }
  if (invite.to_user_id !== req.userId) {
    return res.status(403).json({ error: 'Not your invite' });
  }
  if (invite.status !== 'pending') {
    return res.status(400).json({ error: 'Invite already handled' });
  }

  updateInviteStatus.run('declined', invite.id);
  res.json({ ok: true });
});

export default router;
