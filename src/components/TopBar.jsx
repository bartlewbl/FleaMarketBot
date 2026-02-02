export default function TopBar({ player }) {
  const hpPct = (player.hp / player.maxHp) * 100;
  const expPct = (player.exp / player.expToLevel) * 100;

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span className="player-name">{player.name}</span>
        <span className="player-level">Lv. {player.level}</span>
      </div>
      <div className="top-bar-bars">
        <div className="stat-bar">
          <span className="bar-label">HP</span>
          <div className="bar hp-bar">
            <div className="bar-fill" style={{ width: hpPct + '%' }} />
          </div>
          <span className="bar-text">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="stat-bar">
          <span className="bar-label">EXP</span>
          <div className="bar exp-bar">
            <div className="bar-fill" style={{ width: expPct + '%' }} />
          </div>
          <span className="bar-text">{player.exp}/{player.expToLevel}</span>
        </div>
      </div>
      <div className="top-bar-gold">
        Gold: {player.gold}
      </div>
    </div>
  );
}
