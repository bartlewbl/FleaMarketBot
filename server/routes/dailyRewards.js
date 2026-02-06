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

  // Return the reward for this day
  const reward = DAILY_REWARDS[newRewardDay - 1];

  res.json({
    streak: newStreak,
    rewardDay: newRewardDay,
    reward,
    claimedToday: true,
  });
});

// 30-day reward schedule
const DAILY_REWARDS = [
  { day: 1,  gold: 25,  label: '25 Gold' },
  { day: 2,  gold: 35,  label: '35 Gold' },
  { day: 3,  gold: 50,  label: '50 Gold' },
  { day: 4,  gold: 50,  energy: 30,  label: '50 Gold + 30 Energy' },
  { day: 5,  gold: 75,  label: '75 Gold' },
  { day: 6,  gold: 60,  energy: 50,  label: '60 Gold + 50 Energy' },
  { day: 7,  gold: 150, label: '150 Gold (Weekly!)' },
  { day: 8,  gold: 40,  label: '40 Gold' },
  { day: 9,  gold: 50,  label: '50 Gold' },
  { day: 10, gold: 75,  energy: 30,  label: '75 Gold + 30 Energy' },
  { day: 11, gold: 60,  label: '60 Gold' },
  { day: 12, gold: 80,  label: '80 Gold' },
  { day: 13, gold: 75,  energy: 50,  label: '75 Gold + 50 Energy' },
  { day: 14, gold: 200, label: '200 Gold (2-Week!)' },
  { day: 15, gold: 60,  label: '60 Gold' },
  { day: 16, gold: 75,  label: '75 Gold' },
  { day: 17, gold: 80,  energy: 40,  label: '80 Gold + 40 Energy' },
  { day: 18, gold: 100, label: '100 Gold' },
  { day: 19, gold: 90,  label: '90 Gold' },
  { day: 20, gold: 100, energy: 50,  label: '100 Gold + 50 Energy' },
  { day: 21, gold: 300, label: '300 Gold (3-Week!)' },
  { day: 22, gold: 80,  label: '80 Gold' },
  { day: 23, gold: 100, label: '100 Gold' },
  { day: 24, gold: 100, energy: 50,  label: '100 Gold + 50 Energy' },
  { day: 25, gold: 120, label: '120 Gold' },
  { day: 26, gold: 120, energy: 60,  label: '120 Gold + 60 Energy' },
  { day: 27, gold: 150, label: '150 Gold' },
  { day: 28, gold: 200, energy: 80,  label: '200 Gold + 80 Energy' },
  { day: 29, gold: 250, label: '250 Gold' },
  { day: 30, gold: 500, energy: 100, label: '500 Gold + Full Energy (30-Day!)' },
];

export { DAILY_REWARDS };
export default router;
