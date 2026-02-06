export default function BossConfirmScreen({ boss, onAccept, onDecline }) {
  if (!boss) return null;

  return (
    <div className="screen screen-boss-confirm">
      <div className="boss-warning">BOSS ENCOUNTERED!</div>
      <div className="boss-name">{boss.name}</div>
      <div className="boss-title">{boss.title}</div>
      <div className="boss-stats">
        <div>HP: {boss.maxHp}</div>
        <div>ATK: {boss.atk} / DEF: {boss.def}</div>
        <div>Level: {boss.level}</div>
      </div>
      <div className="boss-confirm-text">
        Are you sure you want to fight this boss? You cannot flee once the battle begins!
      </div>
      <div className="boss-confirm-actions">
        <button className="btn btn-danger" onClick={onAccept}>Fight the Boss</button>
        <button className="btn btn-back" onClick={onDecline}>Retreat</button>
      </div>
    </div>
  );
}
