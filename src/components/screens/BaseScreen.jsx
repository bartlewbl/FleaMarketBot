import { useState, useMemo } from 'react';
import {
  BUILDINGS, BUILDING_MATERIALS, FUEL_ITEMS, BREWERY_RECIPES, SMELTER_RECIPES,
  WORKSHOP_RECIPES, SPARRING_DUMMIES, getChamberBuffs, getInnExpBonus,
} from '../../data/baseData';

// ---- Sub-panels ----

function FuelPanel({ base, player, onAddFuel, onAddFuelFromStorage }) {
  const now = Date.now();
  let currentFuel = base.fuel || 0;
  if (base.fuelLastUpdate) {
    const elapsed = (now - base.fuelLastUpdate) / 60000;
    currentFuel = Math.max(0, currentFuel - elapsed);
  }
  const fuelPercent = Math.min(100, (currentFuel / 480) * 100);

  const fuelMats = Object.entries(base.materials || {}).filter(([id]) => FUEL_ITEMS[id] && base.materials[id] > 0);
  const invFuel = player.inventory.filter(i => i.type === 'material' && i.isFuel);

  return (
    <div className="base-fuel-panel">
      <div className="base-section-title">Furnace Fuel</div>
      <div className="base-fuel-bar-track">
        <div className="base-fuel-bar-fill" style={{ width: `${fuelPercent}%` }} />
      </div>
      <div className="base-fuel-label">{Math.floor(currentFuel)} min remaining</div>
      {currentFuel <= 0 && <div className="base-warning">No fuel! Buildings cannot operate.</div>}

      {fuelMats.length > 0 && (
        <div className="base-fuel-sources">
          <div className="base-sub-label">From Storage:</div>
          {fuelMats.map(([id, qty]) => (
            <button key={id} className="btn btn-sm base-fuel-btn" onClick={() => onAddFuelFromStorage(id)}>
              {FUEL_ITEMS[id].name} ({qty}) +{FUEL_ITEMS[id].burnTime}min
            </button>
          ))}
        </div>
      )}
      {invFuel.length > 0 && (
        <div className="base-fuel-sources">
          <div className="base-sub-label">From Inventory:</div>
          {invFuel.map(item => (
            <button key={item.id} className="btn btn-sm base-fuel-btn" onClick={() => onAddFuel(item)}>
              {item.name} +{FUEL_ITEMS[item.materialId]?.burnTime || 0}min
            </button>
          ))}
        </div>
      )}
      {fuelMats.length === 0 && invFuel.length === 0 && currentFuel <= 0 && (
        <div className="base-empty-text">No fuel materials. Find wood, charcoal, coal, or oil from exploring.</div>
      )}
    </div>
  );
}

function MaterialStoragePanel({ base, player, onStoreMaterial }) {
  const materials = base.materials || {};
  const invMaterials = player.inventory.filter(i => i.type === 'material');

  return (
    <div className="base-storage-panel">
      <div className="base-section-title">Material Storage</div>
      <div className="base-material-grid">
        {Object.entries(materials).filter(([, qty]) => qty > 0).map(([id, qty]) => {
          const mat = BUILDING_MATERIALS[id];
          return (
            <div key={id} className={`base-material-item rarity-${(mat?.rarity || 'common').toLowerCase()}`}>
              <span className="base-mat-name">{mat?.name || id}</span>
              <span className="base-mat-qty">x{qty}</span>
            </div>
          );
        })}
        {Object.entries(materials).filter(([, qty]) => qty > 0).length === 0 && (
          <div className="base-empty-text">No materials stored. Defeat monsters or explore to find materials.</div>
        )}
      </div>
      {invMaterials.length > 0 && (
        <div className="base-store-section">
          <div className="base-sub-label">Store from inventory:</div>
          <div className="base-store-list">
            {invMaterials.map(item => (
              <button key={item.id} className="btn btn-sm base-store-btn" onClick={() => onStoreMaterial(item)}>
                Store {item.name} {item.stackQuantity > 1 ? `x${item.stackQuantity}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CraftingQueuePanel({ base, onCollect }) {
  const queue = base.craftingQueue;
  if (!queue) return null;
  const now = Date.now();
  const elapsed = now - queue.startTime;
  const done = elapsed >= queue.craftTime;
  const progress = Math.min(100, (elapsed / queue.craftTime) * 100);

  return (
    <div className="base-crafting-queue">
      <div className="base-sub-label">Crafting in Progress</div>
      <div className="base-craft-bar-track">
        <div className="base-craft-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      {done ? (
        <button className="btn btn-sm base-collect-btn" onClick={onCollect}>Collect!</button>
      ) : (
        <div className="base-craft-time">{Math.ceil((queue.craftTime - elapsed) / 1000)}s remaining</div>
      )}
    </div>
  );
}

function BuildingConstructPanel({ buildingId, buildingDef, player, base, onBuild }) {
  const cost = buildingDef.buildCost;
  const canAffordGold = player.gold >= cost.gold;
  const matChecks = Object.entries(cost.materials || {}).map(([matId, qty]) => ({
    id: matId, name: BUILDING_MATERIALS[matId]?.name || matId, needed: qty, have: base.materials?.[matId] || 0,
  }));
  const canAffordMats = matChecks.every(m => m.have >= m.needed);
  const meetsLevel = player.level >= buildingDef.levelReq;

  return (
    <div className="base-build-panel">
      <div className="base-build-name">{buildingDef.name}</div>
      <div className="base-build-desc">{buildingDef.description}</div>
      <div className="base-build-req">Requires: Level {buildingDef.levelReq}</div>
      <div className="base-build-costs">
        <div className={`base-cost-item ${canAffordGold ? 'met' : 'unmet'}`}>
          {cost.gold}g {canAffordGold ? '' : `(have ${player.gold}g)`}
        </div>
        {matChecks.map(m => (
          <div key={m.id} className={`base-cost-item ${m.have >= m.needed ? 'met' : 'unmet'}`}>
            {m.needed}x {m.name} {m.have < m.needed ? `(have ${m.have})` : ''}
          </div>
        ))}
      </div>
      <button
        className="btn base-build-btn"
        disabled={!canAffordGold || !canAffordMats || !meetsLevel}
        onClick={() => onBuild(buildingId)}
      >
        {!meetsLevel ? `Unlock at Lv.${buildingDef.levelReq}` : 'Construct'}
      </button>
    </div>
  );
}

function BreweryPanel({ base, onBrew, onCollect }) {
  const mats = base.materials || {};
  return (
    <div className="base-building-content">
      <div className="base-section-title">Brewery</div>
      <div className="base-section-desc">Craft potions and energy drinks from gathered materials.</div>
      <CraftingQueuePanel base={base} onCollect={onCollect} />
      {!base.craftingQueue && (
        <div className="base-recipe-list">
          {BREWERY_RECIPES.map(recipe => {
            const canCraft = Object.entries(recipe.materials).every(([id, qty]) => (mats[id] || 0) >= qty);
            return (
              <div key={recipe.id} className="base-recipe-item">
                <div className="base-recipe-info">
                  <div className="base-recipe-name">{recipe.name}</div>
                  <div className="base-recipe-desc">{recipe.desc}</div>
                  <div className="base-recipe-mats">
                    {Object.entries(recipe.materials).map(([id, qty]) => (
                      <span key={id} className={`base-recipe-mat ${(mats[id] || 0) >= qty ? 'met' : 'unmet'}`}>
                        {qty}x {BUILDING_MATERIALS[id]?.name || id} ({mats[id] || 0})
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-sm" disabled={!canCraft} onClick={() => onBrew(recipe.id)}>Brew</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SmelterPanel({ base, player, onSmelt, onCollect }) {
  const mats = base.materials || {};
  return (
    <div className="base-building-content">
      <div className="base-section-title">Smelter</div>
      <div className="base-section-desc">Smelt raw materials into refined resources. Melt down gear for scraps.</div>
      <CraftingQueuePanel base={base} onCollect={onCollect} />
      {!base.craftingQueue && (
        <div className="base-recipe-list">
          {SMELTER_RECIPES.map(recipe => {
            const canCraft = recipe.materials
              ? Object.entries(recipe.materials).every(([id, qty]) => (mats[id] || 0) >= qty)
              : true;
            const hasGear = recipe.salvageGear ? player.inventory.some(i => i.slot) : true;
            return (
              <div key={recipe.id} className="base-recipe-item">
                <div className="base-recipe-info">
                  <div className="base-recipe-name">{recipe.name}</div>
                  <div className="base-recipe-desc">{recipe.desc}</div>
                  {recipe.materials && (
                    <div className="base-recipe-mats">
                      {Object.entries(recipe.materials).map(([id, qty]) => (
                        <span key={id} className={`base-recipe-mat ${(mats[id] || 0) >= qty ? 'met' : 'unmet'}`}>
                          {qty}x {BUILDING_MATERIALS[id]?.name || id} ({mats[id] || 0})
                        </span>
                      ))}
                    </div>
                  )}
                  {recipe.salvageGear && (
                    <div className="base-recipe-mats">
                      <span className={`base-recipe-mat ${hasGear ? 'met' : 'unmet'}`}>
                        1x Equipment from inventory
                      </span>
                    </div>
                  )}
                  <div className="base-recipe-fuel">Fuel: {recipe.fuelRequired} min</div>
                </div>
                <button
                  className="btn btn-sm"
                  disabled={!canCraft || !hasGear}
                  onClick={() => {
                    if (recipe.salvageGear) {
                      const gear = player.inventory.find(i => i.slot);
                      onSmelt(recipe.id, gear);
                    } else {
                      onSmelt(recipe.id, null);
                    }
                  }}
                >
                  Smelt
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkshopPanel({ base, onCraft, onCollect }) {
  const mats = base.materials || {};
  return (
    <div className="base-building-content">
      <div className="base-section-title">Workshop</div>
      <div className="base-section-desc">Forge weapons, armor, and accessories from refined materials.</div>
      <CraftingQueuePanel base={base} onCollect={onCollect} />
      {!base.craftingQueue && (
        <div className="base-recipe-list">
          {WORKSHOP_RECIPES.map(recipe => {
            const canCraft = Object.entries(recipe.materials).every(([id, qty]) => (mats[id] || 0) >= qty);
            return (
              <div key={recipe.id} className="base-recipe-item">
                <div className="base-recipe-info">
                  <div className="base-recipe-name">{recipe.name}</div>
                  <div className="base-recipe-desc">{recipe.desc}</div>
                  <div className="base-recipe-mats">
                    {Object.entries(recipe.materials).map(([id, qty]) => (
                      <span key={id} className={`base-recipe-mat ${(mats[id] || 0) >= qty ? 'met' : 'unmet'}`}>
                        {qty}x {BUILDING_MATERIALS[id]?.name || id} ({mats[id] || 0})
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-sm" disabled={!canCraft} onClick={() => onCraft(recipe.id)}>Craft</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InnPanel({ base, player, onUpgrade, onBuyBoost }) {
  const innLevel = base.innLevel || 1;
  const current = BUILDINGS.inn.upgrades.find(u => u.level === innLevel);
  const next = BUILDINGS.inn.upgrades.find(u => u.level === innLevel + 1);
  const boosts = current?.boosts || [];

  const boost = base.innBoost;
  const now = Date.now();
  const boostActive = boost && (now - boost.startTime < boost.duration);
  const boostRemaining = boostActive ? boost.duration - (now - boost.startTime) : 0;
  const boostMins = Math.ceil(boostRemaining / 60000);
  const boostHours = Math.floor(boostMins / 60);
  const boostMinsLeft = boostMins % 60;

  return (
    <div className="base-building-content">
      <div className="base-section-title">Inn</div>
      <div className="base-section-desc">Pay gold for timed EXP boosts. Upgrade the inn for stronger boosts.</div>
      <div className="base-inn-current">
        <div className="base-inn-level">{current?.name || 'Basic Inn'} (Tier {innLevel})</div>
        <div className="base-inn-bonus">Boost strength: +{Math.round((current?.expBonus || 0.10) * 100)}% EXP</div>
      </div>

      {boostActive && (
        <div className="base-inn-active-boost">
          <div className="base-sub-label">Active Boost</div>
          <div className="base-inn-boost-name">{boost.boostName}</div>
          <div className="base-inn-boost-info">
            +{Math.round(boost.expBonus * 100)}% EXP &middot; {boostHours > 0 ? `${boostHours}h ` : ''}{boostMinsLeft}m remaining
          </div>
        </div>
      )}

      <div className="base-inn-boosts">
        <div className="base-sub-label">{boostActive ? 'Replace Boost' : 'Buy EXP Boost'}</div>
        <div className="base-recipe-list">
          {boosts.map(b => (
            <div key={b.id} className="base-recipe-item">
              <div className="base-recipe-info">
                <div className="base-recipe-name">{b.name}</div>
                <div className="base-recipe-desc">{b.desc}</div>
              </div>
              <button
                className="btn btn-sm"
                disabled={player.gold < b.cost}
                onClick={() => onBuyBoost(b.id)}
              >
                {b.cost}g
              </button>
            </div>
          ))}
        </div>
      </div>

      {next ? (
        <div className="base-upgrade-section">
          <div className="base-sub-label">Upgrade to: {next.name}</div>
          <div className="base-upgrade-desc">{next.desc}</div>
          <div className="base-build-costs">
            <div className="base-cost-item">{next.upgradeCost.gold}g</div>
            {Object.entries(next.upgradeCost.materials || {}).map(([id, qty]) => (
              <div key={id} className="base-cost-item">
                {qty}x {BUILDING_MATERIALS[id]?.name || id} ({base.materials?.[id] || 0})
              </div>
            ))}
          </div>
          <button className="btn btn-sm" onClick={onUpgrade}>Upgrade</button>
        </div>
      ) : (
        <div className="base-max-level">Inn at max tier!</div>
      )}
    </div>
  );
}

function ChamberPanel({ base, onUpgrade }) {
  const upgrades = base.chamberUpgrades || {};
  const chamberDef = BUILDINGS.chamber;
  const buffs = getChamberBuffs(base);

  return (
    <div className="base-building-content">
      <div className="base-section-title">Chamber</div>
      <div className="base-section-desc">Your personal quarters. Upgrade furnishings for passive bonuses.</div>

      {(buffs.atkBuff > 0 || buffs.defBuff > 0 || buffs.hpBuff > 0 || buffs.manaBuff > 0 || buffs.healBonus > 0 || buffs.wisdomBuff > 0) && (
        <div className="base-buffs-summary">
          <div className="base-sub-label">Active Buffs:</div>
          {buffs.atkBuff > 0 && <span className="base-buff-tag">+{buffs.atkBuff} ATK</span>}
          {buffs.defBuff > 0 && <span className="base-buff-tag">+{buffs.defBuff} DEF</span>}
          {buffs.hpBuff > 0 && <span className="base-buff-tag">+{buffs.hpBuff} Max HP</span>}
          {buffs.manaBuff > 0 && <span className="base-buff-tag">+{buffs.manaBuff} Max Mana</span>}
          {buffs.healBonus > 0 && <span className="base-buff-tag">+{Math.round(buffs.healBonus * 100)}% Heal</span>}
          {buffs.wisdomBuff > 0 && <span className="base-buff-tag">+{buffs.wisdomBuff} Wisdom</span>}
        </div>
      )}

      <div className="base-chamber-upgrades">
        {Object.entries(chamberDef.subUpgrades).map(([subId, subDef]) => {
          const currentLevel = upgrades[subId] || 0;
          const currentData = currentLevel > 0 ? subDef.levels[currentLevel - 1] : null;
          const nextData = subDef.levels[currentLevel];

          return (
            <div key={subId} className="base-chamber-sub">
              <div className="base-chamber-sub-name">{subDef.name}</div>
              {currentData && (
                <div className="base-chamber-current">Lv.{currentLevel}: {currentData.name} - {currentData.desc}</div>
              )}
              {!currentData && <div className="base-chamber-current">Not yet installed</div>}
              {nextData ? (
                <div className="base-chamber-next">
                  <div className="base-upgrade-desc">Next: {nextData.name} - {nextData.desc}</div>
                  <div className="base-build-costs">
                    <span className="base-cost-item">{nextData.cost.gold}g</span>
                    {Object.entries(nextData.cost.materials || {}).map(([id, qty]) => (
                      <span key={id} className="base-cost-item">
                        {qty}x {BUILDING_MATERIALS[id]?.name || id}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-sm" onClick={() => onUpgrade(subId)}>Upgrade</button>
                </div>
              ) : (
                <div className="base-max-level">Maxed!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdventureCampPanel({ base, onSend, onCollect }) {
  const mission = base.activeMission;
  const now = Date.now();

  if (mission) {
    const elapsed = now - mission.startTime;
    const done = elapsed >= mission.duration;
    const remaining = mission.duration - elapsed;
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    const missionDef = BUILDINGS.adventureCamp.missions.find(m => m.id === mission.missionId);

    return (
      <div className="base-building-content">
        <div className="base-section-title">Adventure Camp</div>
        <div className="base-section-desc">Your squad is on a {missionDef?.name || 'mission'}!</div>
        <div className="base-mission-status">
          {done ? (
            <div>
              <div className="base-mission-done">Squad has returned!</div>
              <button className="btn base-collect-btn" onClick={onCollect}>Collect Loot</button>
            </div>
          ) : (
            <div className="base-mission-time">Returns in {hours}h {mins}m</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="base-building-content">
      <div className="base-section-title">Adventure Camp</div>
      <div className="base-section-desc">Send squads out to pillage and gather resources. Longer missions yield better rewards.</div>
      <div className="base-mission-list">
        {BUILDINGS.adventureCamp.missions.map(m => (
          <div key={m.id} className="base-mission-item">
            <div className="base-mission-info">
              <div className="base-mission-name">{m.name}</div>
              <div className="base-mission-desc">{m.desc}</div>
              <div className="base-mission-gold">Gold: {m.goldRange[0]}-{m.goldRange[1]}g</div>
            </div>
            <button className="btn btn-sm" onClick={() => onSend(m.id)}>Send</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparringPanel({ base, onStart, onAttack, onSkill, onReset }) {
  const dummy = base.sparringDummy;

  if (dummy) {
    const hp = base.sparringHp || 0;
    const hpPercent = Math.max(0, (hp / dummy.hp) * 100);
    return (
      <div className="base-building-content">
        <div className="base-section-title">Sparring Range</div>
        <div className="base-spar-active">
          <div className="base-spar-dummy-name">{dummy.name}</div>
          <div className="base-spar-desc">{dummy.desc}</div>
          <div className="base-spar-hp">HP: {hp}/{dummy.hp} (DEF: {dummy.def})</div>
          <div className="base-fuel-bar-track">
            <div className="base-spar-hp-fill" style={{ width: `${hpPercent}%` }} />
          </div>
          <div className="base-spar-actions">
            <button className="btn btn-sm" onClick={onAttack} disabled={hp <= 0}>Attack</button>
            <button className="btn btn-sm" onClick={onSkill} disabled={hp <= 0}>Skill</button>
            <button className="btn btn-sm base-spar-reset" onClick={onReset}>
              {hp <= 0 ? 'Back' : 'Stop'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="base-building-content">
      <div className="base-section-title">Sparring Range</div>
      <div className="base-section-desc">Test your damage against training dummies. No energy or HP cost.</div>
      <div className="base-dummy-list">
        {SPARRING_DUMMIES.map(d => (
          <div key={d.id} className="base-dummy-item">
            <div className="base-dummy-info">
              <div className="base-dummy-name">{d.name}</div>
              <div className="base-dummy-desc">{d.desc}</div>
              <div className="base-dummy-stats">HP: {d.hp} | DEF: {d.def}</div>
            </div>
            <button className="btn btn-sm" onClick={() => onStart(d.id)}>Fight</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankPanel({ base, player, onDeposit, onWithdraw, onFreeze, onCollectFrozen, onLoan, onRepay }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [freezeAmount, setFreezeAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  const bankDef = BUILDINGS.bank;
  const deposit = base.bankDeposit || 0;
  const frozen = base.frozenGold;
  const loan = base.loan;

  const now = Date.now();
  const frozenDone = frozen && (now - frozen.startTime >= frozen.duration);
  const frozenDaysLeft = frozen ? Math.ceil((frozen.duration - (now - frozen.startTime)) / (24 * 60 * 60 * 1000)) : 0;
  const loanOverdue = loan && now > loan.dueTime;
  const loanDaysLeft = loan ? Math.ceil((loan.dueTime - now) / (24 * 60 * 60 * 1000)) : 0;

  return (
    <div className="base-building-content">
      <div className="base-section-title">Bank</div>
      <div className="base-section-desc">
        Store gold safely (10% deposit fee). Freeze gold for interest. Borrow up to {bankDef.maxLoanAmount}g.
      </div>

      <div className="base-bank-balance">
        <div className="base-bank-stat">Wallet: <strong>{player.gold}g</strong></div>
        <div className="base-bank-stat">Safe Deposit: <strong>{deposit}g</strong></div>
      </div>

      {/* Deposit */}
      <div className="base-bank-section">
        <div className="base-sub-label">Deposit (10% fee)</div>
        <div className="base-bank-row">
          <input
            type="number" min="1" max={player.gold}
            value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
            placeholder="Amount" className="base-bank-input"
          />
          <button className="btn btn-sm" onClick={() => { onDeposit(parseInt(depositAmount) || 0); setDepositAmount(''); }}>
            Deposit
          </button>
        </div>
      </div>

      {/* Withdraw */}
      {deposit > 0 && (
        <div className="base-bank-section">
          <div className="base-sub-label">Withdraw (no fee)</div>
          <div className="base-bank-row">
            <input
              type="number" min="1" max={deposit}
              value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Amount" className="base-bank-input"
            />
            <button className="btn btn-sm" onClick={() => { onWithdraw(parseInt(withdrawAmount) || 0); setWithdrawAmount(''); }}>
              Withdraw
            </button>
          </div>
        </div>
      )}

      {/* Freeze Gold */}
      <div className="base-bank-section">
        <div className="base-sub-label">Freeze Gold for Interest (max {bankDef.maxFreezeAmount}g)</div>
        {frozen ? (
          <div className="base-bank-frozen">
            <div>{frozen.amount}g frozen - {frozen.optionDesc}</div>
            {frozenDone ? (
              <button className="btn btn-sm base-collect-btn" onClick={onCollectFrozen}>Collect + Interest</button>
            ) : (
              <div className="base-bank-frozen-time">{frozenDaysLeft} day(s) remaining</div>
            )}
          </div>
        ) : (
          <div>
            <div className="base-bank-row">
              <input
                type="number" min="1" max={Math.min(deposit, bankDef.maxFreezeAmount)}
                value={freezeAmount} onChange={e => setFreezeAmount(e.target.value)}
                placeholder="Amount" className="base-bank-input"
              />
            </div>
            <div className="base-freeze-options">
              {bankDef.freezeOptions.map(opt => (
                <button
                  key={opt.id} className="btn btn-sm"
                  disabled={!parseInt(freezeAmount) || parseInt(freezeAmount) > deposit}
                  onClick={() => { onFreeze(parseInt(freezeAmount) || 0, opt.id); setFreezeAmount(''); }}
                >
                  {opt.desc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loan */}
      <div className="base-bank-section">
        <div className="base-sub-label">Borrow Gold (max {bankDef.maxLoanAmount}g, 15% interest, 7 days)</div>
        {loan ? (
          <div className="base-bank-loan">
            <div className={loanOverdue ? 'base-warning' : ''}>
              Owe {loan.amount}g {loanOverdue ? '(OVERDUE!)' : `(${loanDaysLeft} day(s) left)`}
            </div>
            <button className="btn btn-sm" onClick={onRepay} disabled={player.gold < loan.amount}>
              Repay {loan.amount}g
            </button>
          </div>
        ) : (
          <div className="base-bank-row">
            <input
              type="number" min="1" max={bankDef.maxLoanAmount}
              value={loanAmount} onChange={e => setLoanAmount(e.target.value)}
              placeholder="Amount" className="base-bank-input"
            />
            <button className="btn btn-sm" onClick={() => { onLoan(parseInt(loanAmount) || 0); setLoanAmount(''); }}>
              Borrow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main Base Screen ----

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'brewery', label: 'Brewery' },
  { id: 'smelter', label: 'Smelter' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'inn', label: 'Inn' },
  { id: 'chamber', label: 'Chamber' },
  { id: 'adventureCamp', label: 'Camp' },
  { id: 'sparringRange', label: 'Spar' },
  { id: 'bank', label: 'Bank' },
];

export default function BaseScreen({
  player, base, onBack,
  onBuild, onAddFuel, onAddFuelFromStorage, onStoreMaterial,
  onBrew, onSmelt, onCraft, onCollectCraft,
  onUpgradeInn, onBuyInnBoost, onUpgradeChamber,
  onSendMission, onCollectMission,
  onBankDeposit, onBankWithdraw, onBankFreeze, onBankCollectFrozen, onBankLoan, onBankRepay,
  onStartSpar, onSparAttack, onSparSkill, onResetSpar,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const buildings = base.buildings || {};

  const builtTabs = useMemo(() => {
    return TABS.filter(tab => {
      if (tab.id === 'overview') return true;
      return buildings[tab.id]?.built;
    });
  }, [buildings]);

  const renderBuildingOrConstruct = (buildingId) => {
    const buildingDef = BUILDINGS[buildingId];
    if (!buildingDef) return null;
    if (!buildings[buildingId]?.built) {
      return (
        <BuildingConstructPanel
          buildingId={buildingId}
          buildingDef={buildingDef}
          player={player}
          base={base}
          onBuild={onBuild}
        />
      );
    }
    return null;
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="base-overview">
            <FuelPanel
              base={base} player={player}
              onAddFuel={onAddFuel} onAddFuelFromStorage={onAddFuelFromStorage}
            />
            <MaterialStoragePanel base={base} player={player} onStoreMaterial={onStoreMaterial} />

            <div className="base-section-title">Buildings</div>
            <div className="base-buildings-grid">
              {Object.entries(BUILDINGS).map(([id, def]) => {
                const built = buildings[id]?.built;
                return (
                  <div key={id} className={`base-building-card ${built ? 'built' : 'locked'}`}>
                    <div className="base-building-card-name">{def.name}</div>
                    <div className="base-building-card-status">
                      {built ? 'Active' : `Lv.${def.levelReq} | ${def.buildCost.gold}g`}
                    </div>
                    {built ? (
                      <button className="btn btn-sm" onClick={() => setActiveTab(id)}>Enter</button>
                    ) : (
                      <button
                        className="btn btn-sm"
                        disabled={player.level < def.levelReq}
                        onClick={() => onBuild(id)}
                      >
                        {player.level < def.levelReq ? 'Locked' : 'Build'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'brewery':
        if (!buildings.brewery?.built) return renderBuildingOrConstruct('brewery');
        return <BreweryPanel base={base} onBrew={onBrew} onCollect={onCollectCraft} />;

      case 'smelter':
        if (!buildings.smelter?.built) return renderBuildingOrConstruct('smelter');
        return <SmelterPanel base={base} player={player} onSmelt={onSmelt} onCollect={onCollectCraft} />;

      case 'workshop':
        if (!buildings.workshop?.built) return renderBuildingOrConstruct('workshop');
        return <WorkshopPanel base={base} onCraft={onCraft} onCollect={onCollectCraft} />;

      case 'inn':
        if (!buildings.inn?.built) return renderBuildingOrConstruct('inn');
        return <InnPanel base={base} player={player} onUpgrade={onUpgradeInn} onBuyBoost={onBuyInnBoost} />;

      case 'chamber':
        if (!buildings.chamber?.built) return renderBuildingOrConstruct('chamber');
        return <ChamberPanel base={base} onUpgrade={onUpgradeChamber} />;

      case 'adventureCamp':
        if (!buildings.adventureCamp?.built) return renderBuildingOrConstruct('adventureCamp');
        return <AdventureCampPanel base={base} onSend={onSendMission} onCollect={onCollectMission} />;

      case 'sparringRange':
        if (!buildings.sparringRange?.built) return renderBuildingOrConstruct('sparringRange');
        return (
          <SparringPanel
            base={base} onStart={onStartSpar}
            onAttack={onSparAttack} onSkill={onSparSkill} onReset={onResetSpar}
          />
        );

      case 'bank':
        if (!buildings.bank?.built) return renderBuildingOrConstruct('bank');
        return (
          <BankPanel
            base={base} player={player}
            onDeposit={onBankDeposit} onWithdraw={onBankWithdraw}
            onFreeze={onBankFreeze} onCollectFrozen={onBankCollectFrozen}
            onLoan={onBankLoan} onRepay={onBankRepay}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="screen screen-base">
      <div className="base-header">
        <button className="btn btn-sm base-back-btn" onClick={onBack}>Back to Town</button>
        <div className="base-title">Your Base</div>
        <div className="base-gold">Gold: {player.gold}g</div>
      </div>

      <div className="base-tabs">
        {builtTabs.map(tab => (
          <button
            key={tab.id}
            className={`base-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="base-content">
        {renderActiveTab()}
      </div>
    </div>
  );
}
