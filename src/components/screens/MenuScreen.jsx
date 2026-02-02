export default function MenuScreen({ onStart, onContinue, hasSave, username, onLogout }) {
  return (
    <div className="screen screen-menu">
      <div className="menu-title">PIXEL GRIND</div>
      <div className="menu-subtitle">Monster Hunter</div>
      {username && <div className="menu-user">Logged in as {username}</div>}
      {hasSave && (
        <button className="btn btn-primary btn-large" onClick={onContinue}>
          Continue
        </button>
      )}
      <button className="btn btn-primary btn-large" onClick={onStart}>
        New Game
      </button>
      {username && (
        <button className="btn btn-small" onClick={onLogout}>
          Logout
        </button>
      )}
    </div>
  );
}
