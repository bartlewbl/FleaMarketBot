export default function ExploreScreen({ location, text, onContinue, onBack }) {
  return (
    <div className="screen screen-explore">
      <div className="explore-location">{location?.name}</div>
      <div className="explore-text">{text}</div>
      <div className="explore-actions">
        <button className="btn btn-primary" onClick={onContinue}>Continue</button>
        <button className="btn btn-back" onClick={onBack}>Return to Town</button>
      </div>
    </div>
  );
}
