import { useMemo } from 'react';
import { CHARACTER_CLASSES, REGIONS } from '../../data/gameData';
import { getDailyFeaturedItems } from '../../engine/loot';
import DailyRewardPanel from '../DailyRewardPanel';
const townNotices = [
  'Daily hunt: Defeat 5 forest goblins for 50 bonus XP.',
  'Blacksmith sale: Shields 15% off until midnight.',
  'Rumor: A dragon was spotted near the Obsidian Ridge.',
];

const TOWN_EVENTS = [
  { title: 'Sewer Surge', desc: 'Slime activity spiking in Metro Underpass. Extra loot reported.', type: 'active' },
  { title: 'Blacksmith Discount', desc: 'Aurora Armory running 15% off shields until midnight.', type: 'active' },
  { title: 'Bounty Board', desc: 'Rogue Vagrant bounties doubled this cycle.', type: 'active' },
  { title: 'Neon Festival', desc: 'Street vendors gathering at Neon Mile this weekend.', type: 'upcoming' },
  { title: 'Supply Drop', desc: 'Cargo shipment expected at Ironworks Yard tomorrow.', type: 'upcoming' },
  { title: 'Arena Trials', desc: 'Combat trials opening next week. Train up.', type: 'upcoming' },
];

function getRotatingEvents() {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const active = TOWN_EVENTS.filter(e => e.type === 'active');
  const upcoming = TOWN_EVENTS.filter(e => e.type === 'upcoming');
  const pick = (arr, seed) => arr[(seed) % arr.length];
  return {
    current: [pick(active, daySeed), pick(active, daySeed + 1)],
    planned: [pick(upcoming, daySeed + 2)],
  };
}

const statLine = (item) => {
  if (!item) return '';
  const stats = [];
  if (item.atk) stats.push('ATK+' + item.atk);
  if (item.def) stats.push('DEF+' + item.def);
  return stats.length ? stats.join(' ') : 'No bonuses';
};

export default function TownScreen({ player, energy, energyCost, onRest, onEnterLocation, onBuy, canRest, onClaimDailyReward }) {
  const equipment = player?.equipment || {};
  const atkBonus = Object.values(equipment).reduce((sum, item) => sum + (item?.atk || 0), 0);
  const defBonus = Object.values(equipment).reduce((sum, item) => sum + (item?.def || 0), 0);
  const cls = player?.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;

  const exp = player?.exp ?? 0;
  const expToLevel = player?.expToLevel ?? 1;
  const expPercent = Math.min(100, (exp / expToLevel) * 100);
  const expRemaining = Math.max(0, expToLevel - exp);

  const events = useMemo(() => getRotatingEvents(), []);

  const latestLocation = useMemo(() => {
    const allLocations = REGIONS.flatMap(r => r.locations);
    const unlocked = allLocations.filter(loc => (player?.level ?? 1) >= loc.levelReq);
    return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
  }, [player?.level]);

  const canTravel = latestLocation && (energy ?? 0) >= (energyCost ?? 10);

  const featuredItems = useMemo(() => getDailyFeaturedItems(player?.level ?? 1), [player?.level]);

  const equippedSlots = Object.entries(equipment).filter(([, item]) => item);
  const emptySlots = Object.entries(equipment).filter(([, item]) => !item);

  const hpPercent = player?.maxHp ? Math.min(100, (player.hp / player.maxHp) * 100) : 100;
  const needsHealing = player?.hp < player?.maxHp;

  return (
    <div className="screen screen-town">
      <div className="town-layout">
        {/* Character Info Card */}
        <section className="town-hero-card">
          <div className="town-hero-header">
            <div className="town-hero-identity">
              <div className="town-hero-title">{player?.name || 'Hero'}</div>
              <div className="town-hero-subtitle">Level {player?.level ?? 1} Adventurer</div>
            </div>
            <div className="town-hero-level-badge">
              <span className="level-number">{player?.level ?? 1}</span>
            </div>
          </div>

          <div className="town-hero-stats">
            <div className="town-stat">
              <div className="town-stat-label">HP</div>
              <div className="town-stat-value">{player?.hp ?? 0}/{player?.maxHp ?? 0}</div>
              <div className="town-stat-bar">
                <div className="town-stat-bar-fill town-stat-bar-hp" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            <div className="town-stat">
              <div className="town-stat-label">ATK</div>
              <div className="town-stat-value">{player?.baseAtk ?? 0}{atkBonus ? ` (+${atkBonus})` : ''}</div>
            </div>
            <div className="town-stat">
              <div className="town-stat-label">DEF</div>
              <div className="town-stat-value">{player?.baseDef ?? 0}{defBonus ? ` (+${defBonus})` : ''}</div>
            </div>
            <div className="town-stat">
              <div className="town-stat-label">Gold</div>
              <div className="town-stat-value town-gold-value">{player?.gold ?? 0}g</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="town-xp-section">
            <div className="town-xp-header">
              <span className="town-xp-label">EXP to Level {(player?.level ?? 1) + 1}</span>
              <span className="town-xp-numbers">{exp} / {expToLevel} ({expRemaining} remaining)</span>
            </div>
            <div className="town-bar-track">
              <div className="town-bar-fill" style={{ width: `${expPercent}%` }} />
            </div>
          </div>

          {/* Equipped Gear Summary */}
          {equippedSlots.length > 0 && (
            <div className="town-gear-summary">
              <div className="town-gear-label">Equipped</div>
              <div className="town-gear-list">
                {equippedSlots.map(([slot, item]) => (
                  <span key={slot} className={`town-gear-tag ${item.rarityClass || ''}`}>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {emptySlots.length > 0 && (
            <div className="town-gear-empty">
              {emptySlots.length} empty slot{emptySlots.length !== 1 ? 's' : ''}
            </div>
          )}
        </section>

        {/* Quick Actions - Travel & Heal */}
        <section className="town-panel town-actions-panel">
          <div className="town-panel-title">Quick Actions</div>

          {/* Auto-start to latest location */}
          {latestLocation && (
            <button
              className="town-quick-action town-quick-travel"
              onClick={() => onEnterLocation(latestLocation)}
              disabled={!canTravel}
            >
              <div className="town-quick-icon">&#9758;</div>
              <div className="town-quick-info">
                <div className="town-quick-label">Explore {latestLocation.name}</div>
                <div className="town-quick-desc">
                  {canTravel
                    ? `Lv.${latestLocation.levelReq}+ \u00b7 -${energyCost ?? 10} energy`
                    : 'Not enough energy'}
                </div>
              </div>
            </button>
          )}

          {/* Healing option */}
          <button
            className={`town-quick-action town-quick-heal ${needsHealing ? '' : 'full-hp'}`}
            onClick={onRest}
            disabled={!canRest || !needsHealing}
          >
            <div className="town-quick-icon heal-icon">+</div>
            <div className="town-quick-info">
              <div className="town-quick-label">
                {needsHealing ? 'Rest at Inn' : 'HP Full'}
              </div>
              <div className="town-quick-desc">
                {needsHealing
                  ? `Restore HP & Mana \u00b7 10g`
                  : 'No healing needed'}
              </div>
            </div>
          </button>
        </section>

        {/* Daily Login Rewards */}
        <DailyRewardPanel onClaimReward={onClaimDailyReward} />

        {/* Events Board */}
        <section className="town-panel town-events-panel">
          <div className="town-panel-title">Events Board</div>
          <div className="town-events-list">
            {events.current.map((ev, i) => (
              <div key={`current-${i}`} className="town-event">
                <span className="town-event-badge active">Active</span>
                <div className="town-event-title">{ev.title}</div>
                <div className="town-event-desc">{ev.desc}</div>
              </div>
            ))}
            {events.planned.map((ev, i) => (
              <div key={`planned-${i}`} className="town-event">
                <span className="town-event-badge upcoming">Soon</span>
                <div className="town-event-title">{ev.title}</div>
                <div className="town-event-desc">{ev.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Extraordinary Shop Items */}
        <section className="town-panel town-shop-panel">
          <div className="town-panel-title">Today&apos;s Featured Gear</div>
          <div className="town-panel-subtitle-text">Extraordinary items - refreshes daily</div>
          <div className="town-featured-list">
            {featuredItems.map(item => (
              <div key={item.id} className="town-featured-item">
                <div className="town-featured-info">
                  <span className={`town-featured-name ${item.rarityClass || ''}`}>
                    {item.name}
                  </span>
                  <span className="town-featured-meta">
                    {item.rarity} \u00b7 Lv{item.level} \u00b7 {statLine(item)}
                  </span>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => onBuy(item)}
                  disabled={(player?.gold ?? 0) < item.buyPrice}
                >
                  {item.buyPrice}g
                </button>
              </div>
            ))}
            {featuredItems.length === 0 && (
              <div className="empty-text">No featured gear today</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
