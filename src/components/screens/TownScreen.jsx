export default function TownScreen({ onExplore, onInventory, onShop, onRest, onLogout }) {
  return (
    <div className="screen screen-town">
      <div className="town-actions">
        <button className="btn" onClick={onExplore}>Explore</button>
        <button className="btn" onClick={onInventory}>Inventory</button>
        <button className="btn" onClick={onShop}>Shop</button>
        <button className="btn" onClick={onRest}>Rest at Inn (10g)</button>
        <button className="btn btn-small" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
