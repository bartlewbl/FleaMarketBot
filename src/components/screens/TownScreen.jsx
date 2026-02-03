export default function TownScreen({ onExplore, onInventory, onShop, onRest }) {
  return (
    <div className="screen screen-town">
      <div className="town-actions">
        <button className="btn" onClick={onExplore}>Explore</button>
        <button className="btn" onClick={onInventory}>Inventory</button>
        <button className="btn" onClick={onShop}>Shop</button>
        <button className="btn" onClick={onRest}>Rest at Inn (10g)</button>
      </div>
    </div>
  );
}
