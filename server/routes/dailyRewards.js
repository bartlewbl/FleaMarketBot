import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Prepared statements
const findSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const getLatestLogin = db.prepare(
  'SELECT * FROM daily_logins WHERE user_id = ? ORDER BY login_date DESC LIMIT 1'
);
const insertLogin = db.prepare(
  'INSERT INTO daily_logins (user_id, login_date, streak, reward_day) VALUES (?, ?, ?, ?)'
);
const getLoginHistory = db.prepare(
  'SELECT login_date, streak, reward_day FROM daily_logins WHERE user_id = ? ORDER BY login_date DESC LIMIT 30'
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

function getTodayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// GET /api/daily-rewards - get current streak status
router.get('/', requireAuth, (req, res) => {
  const today = getTodayUTC();
  const latest = getLatestLogin.get(req.userId);

  if (!latest) {
    return res.json({
      streak: 0,
      rewardDay: 0,
      claimedToday: false,
      history: [],
    });
  }

  const claimedToday = latest.login_date === today;
  const yesterday = getYesterdayUTC();
  // Streak is still active if claimed today or yesterday
  const streakActive = latest.login_date === today || latest.login_date === yesterday;
  const currentStreak = streakActive ? latest.streak : 0;
  const currentRewardDay = streakActive ? latest.reward_day : 0;

  const history = getLoginHistory.all(req.userId);

  res.json({
    streak: currentStreak,
    rewardDay: currentRewardDay,
    claimedToday,
    history,
  });
});

// POST /api/daily-rewards/claim - claim today's reward
// Returns the rewardDay; the client resolves the actual rewards from DAILY_REWARDS
// and generates items scaled to the player's level.
router.post('/claim', requireAuth, (req, res) => {
  const today = getTodayUTC();
  const latest = getLatestLogin.get(req.userId);

  // Already claimed today
  if (latest && latest.login_date === today) {
    return res.status(400).json({ error: 'Already claimed today' });
  }

  let newStreak = 1;
  let newRewardDay = 1;

  if (latest) {
    const yesterday = getYesterdayUTC();
    if (latest.login_date === yesterday) {
      // Consecutive day - continue streak
      newStreak = latest.streak + 1;
      newRewardDay = latest.reward_day < 30 ? latest.reward_day + 1 : 1;
    }
    // If not yesterday, streak resets to 1, reward_day resets to 1
  }

  insertLogin.run(req.userId, today, newStreak, newRewardDay);

  res.json({
    streak: newStreak,
    rewardDay: newRewardDay,
    claimedToday: true,
  });
});

export default router;
