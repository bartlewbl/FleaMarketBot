import { useState, useEffect, useCallback } from 'react';
import { getDailyRewardStatus, claimDailyReward } from '../api';
import { DAILY_REWARDS } from '../data/dailyRewards';

// Classify a reward entry for icon/color display
function rewardIcon(r) {
  switch (r.kind) {
    case 'gold':   return { icon: 'G', cls: 'reward-icon-gold' };
    case 'energy': return { icon: 'E', cls: 'reward-icon-energy' };
    case 'potion': return { icon: '+', cls: 'reward-icon-potion' };
    case 'item': {
      const rarCls = r.rarity === 'Legendary' ? 'reward-icon-legendary'
        : r.rarity === 'Epic' ? 'reward-icon-epic'
        : r.rarity === 'Rare' ? 'reward-icon-rare'
        : 'reward-icon-uncommon';
      return { icon: r.type[0].toUpperCase(), cls: rarCls };
    }
    default: return { icon: '?', cls: '' };
  }
}

// Compact label for a single reward in calendar cells
function compactLabel(r) {
  switch (r.kind) {
    case 'gold':   return `${r.amount}g`;
    case 'energy': return `${r.amount}E`;
    case 'potion': return 'Potion';
    case 'item':   return r.type;
    default:       return '?';
  }
}

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
      // Look up the reward spec for this day and pass to game state
      const dayData = DAILY_REWARDS[(result.rewardDay - 1) % 30];
      if (dayData && onClaimReward) {
        onClaimReward(dayData.rewards, dayData.label);
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
            <div className="daily-claim-rewards-preview">
              {nextReward?.rewards.map((r, i) => {
                const { icon, cls } = rewardIcon(r);
                return (
                  <span key={i} className={`daily-reward-chip ${cls}`}>
                    <span className="daily-reward-chip-icon">{icon}</span>
                    <span className="daily-reward-chip-text">{compactLabel(r)}</span>
                  </span>
                );
              })}
            </div>
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
            Day {rewardDay} claimed! {rewardDay < 30 && `Day ${rewardDay + 1} tomorrow`}
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
          {DAILY_REWARDS.map((dayData) => {
            const isPast = rewardDay > 0 && dayData.day < (claimedToday ? rewardDay : nextDay) && claimedToday;
            const isCurrent = dayData.day === rewardDay && claimedToday;
            const isNext = dayData.day === nextDay && !claimedToday;

            let cellClass = 'daily-cell';
            if (isPast) cellClass += ' daily-cell-past';
            if (isCurrent) cellClass += ' daily-cell-current';
            if (isNext) cellClass += ' daily-cell-next';
            if (dayData.milestone) cellClass += ' daily-cell-milestone';

            return (
              <div key={dayData.day} className={cellClass}>
                <div className="daily-cell-day">D{dayData.day}</div>
                <div className="daily-cell-rewards">
                  {dayData.rewards.map((r, i) => {
                    const { icon, cls } = rewardIcon(r);
                    return (
                      <span key={i} className={`daily-cell-icon ${cls}`} title={compactLabel(r)}>
                        {icon}
                      </span>
                    );
                  })}
                </div>
                <div className="daily-cell-label">{dayData.label}</div>
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
