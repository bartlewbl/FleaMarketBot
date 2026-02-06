import { useState, useEffect, useCallback } from 'react';
import { getDailyRewardStatus, claimDailyReward } from '../api';
import { DAILY_REWARDS } from '../data/dailyRewards';

export default function DailyRewardPanel({ onClaimReward }) {
  const [status, setStatus] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [claimAnim, setClaimAnim] = useState(false);

  useEffect(() => {
    getDailyRewardStatus()
      .then(setStatus)
      .catch(() => {});
  }, []);

  const handleClaim = useCallback(async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const result = await claimDailyReward();
      setStatus(prev => ({
        ...prev,
        streak: result.streak,
        rewardDay: result.rewardDay,
        claimedToday: true,
      }));
      setClaimAnim(true);
      setTimeout(() => setClaimAnim(false), 600);
      if (result.reward && onClaimReward) {
        onClaimReward(result.reward);
      }
    } catch {
      // Already claimed or error
    } finally {
      setClaiming(false);
    }
  }, [claiming, onClaimReward]);

  if (!status) return null;

  const { streak, rewardDay, claimedToday } = status;
  const nextDay = claimedToday ? rewardDay : (streak > 0 ? rewardDay + 1 : 1);
  const nextReward = DAILY_REWARDS[(nextDay - 1) % 30];

  // Determine which days to show in the scrollable grid
  const startDay = claimedToday ? rewardDay : Math.max(1, nextDay);

  return (
    <section className="town-panel town-daily-panel">
      <div className="town-panel-title">
        Daily Login Rewards
        <span className="daily-streak-badge">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Claim area */}
      {!claimedToday ? (
        <div className="daily-claim-area">
          <div className="daily-claim-info">
            <div className="daily-claim-day">Day {nextDay}</div>
            <div className="daily-claim-reward">{nextReward?.label}</div>
          </div>
          <button
            className="btn btn-daily-claim"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? '...' : 'Claim'}
          </button>
        </div>
      ) : (
        <div className={`daily-claimed-area ${claimAnim ? 'daily-claim-flash' : ''}`}>
          <span className="daily-claimed-check">&#10003;</span>
          <span className="daily-claimed-text">
            Day {rewardDay} claimed! {nextDay <= 30 && `Day ${rewardDay + 1 > 30 ? 1 : rewardDay + 1} tomorrow`}
          </span>
        </div>
      )}

      {/* Toggle to show/hide full calendar */}
      <button
        className="daily-toggle-btn"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? 'Hide Calendar' : 'View 30-Day Calendar'}
      </button>

      {/* 30-day calendar grid */}
      {expanded && (
        <div className="daily-calendar">
          {DAILY_REWARDS.map((reward) => {
            const isPast = rewardDay > 0 && reward.day < startDay && claimedToday;
            const isCurrent = reward.day === rewardDay && claimedToday;
            const isNext = reward.day === nextDay && !claimedToday;

            let cellClass = 'daily-cell';
            if (isPast) cellClass += ' daily-cell-past';
            if (isCurrent) cellClass += ' daily-cell-current';
            if (isNext) cellClass += ' daily-cell-next';
            if (reward.milestone) cellClass += ' daily-cell-milestone';

            return (
              <div key={reward.day} className={cellClass}>
                <div className="daily-cell-day">D{reward.day}</div>
                <div className="daily-cell-reward">
                  {reward.gold}g
                  {reward.energy ? <span className="daily-cell-energy">+{reward.energy}E</span> : null}
                </div>
                {isPast && <span className="daily-cell-check">&#10003;</span>}
                {isCurrent && <span className="daily-cell-check current">&#10003;</span>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
