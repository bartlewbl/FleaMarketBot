export default function BattleResultScreen({ result, onContinue }) {
  if (!result) return null;

  const isBoss = result.isBoss;

  return (
    <div className="screen screen-result">
      <div className={`result-title ${result.victory ? 'victory' : 'defeat'} ${isBoss ? 'boss-result' : ''}`}>
        {result.victory
          ? (isBoss ? 'BOSS DEFEATED!' : 'VICTORY!')
          : 'DEFEATED...'}
      </div>

      <div className="result-rewards">
        {result.victory ? (
          <>
            {isBoss && <div className="boss-victory-text">You conquered {result.bossName}!</div>}
            <div>+{result.expGain} EXP{result.innBonus ? ` (Inn +${Math.round(result.innBonus * 100)}%)` : ''}</div>
            <div>+{result.goldGain} Gold</div>
            {result.droppedItem && (
              <div className={result.droppedItem.rarityClass}>
                Got: {result.droppedItem.name} [{result.droppedItem.rarity}]
              </div>
            )}
            {result.materialDrop && (
              <div className={`rarity-${(result.materialDrop.rarity || 'common').toLowerCase()}`}>
                Material: {result.materialDrop.name}
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
            <div>{isBoss ? 'The boss was too powerful...' : 'You barely escaped with your life.'}</div>
          </>
        )}
      </div>

      {result.levelUps?.length > 0 && (
        <div className="result-levelup">
          LEVEL UP! Lv.{result.newLevel}
          {result.levelUps.map((g, i) => (
            <div key={i}>HP+{g.hpGain} MP+{g.manaGain} ATK+{g.atkGain} DEF+{g.defGain}{g.charismaGain > 0 ? ` CHA+${g.charismaGain}` : ''}{g.wisdomGain > 0 ? ` WIS+${g.wisdomGain}` : ''}{g.athleticsGain > 0 ? ` ATH+${g.athleticsGain}` : ''}</div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={onContinue}>
        {result.defeated ? 'Return to Town' : 'Continue'}
      </button>
    </div>
  );
}
