export default function BattleResultScreen({ result, onContinue }) {
  if (!result) return null;

  return (
    <div className="screen screen-result">
      <div className={`result-title ${result.victory ? 'victory' : 'defeat'}`}>
        {result.victory ? 'VICTORY!' : 'DEFEATED...'}
      </div>

      <div className="result-rewards">
        {result.victory ? (
          <>
            <div>+{result.expGain} EXP</div>
            <div>+{result.goldGain} Gold</div>
            {result.droppedItem && (
              <div className={result.droppedItem.rarityClass}>
                Got: {result.droppedItem.name} [{result.droppedItem.rarity}]
              </div>
            )}
            {!result.droppedItem && result.lostItemName && (
              <div className="rarity-common">
                Pack full: {result.lostItemName} slipped away.
              </div>
            )}
          </>
        ) : (
          <>
            <div>Lost {result.goldLost} gold...</div>
            <div>You barely escaped with your life.</div>
          </>
        )}
      </div>

      {result.levelUps?.length > 0 && (
        <div className="result-levelup">
          LEVEL UP! Lv.{result.newLevel}
          {result.levelUps.map((g, i) => (
            <div key={i}>HP+{g.hpGain} MP+{g.manaGain} ATK+{g.atkGain} DEF+{g.defGain}</div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={onContinue}>
        {result.defeated ? 'Return to Town' : 'Continue'}
      </button>
    </div>
  );
}
