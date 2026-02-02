export default function MenuScreen({ onStart }) {
  return (
    <div className="screen screen-menu">
      <div className="menu-title">PIXEL GRIND</div>
      <div className="menu-subtitle">Monster Hunter</div>
      <button className="btn btn-primary btn-large" onClick={onStart}>
        New Game
      </button>
    </div>
  );
}
