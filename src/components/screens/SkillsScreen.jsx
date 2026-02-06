import { useState } from 'react';
import { CHARACTER_CLASSES } from '../../data/gameData';
import { SKILL_TREES, getPlayerPassiveSkills } from '../../data/skillTrees';

export default function SkillsScreen({ player, onBack, onUnlockSkill }) {
  const [confirmSkill, setConfirmSkill] = useState(null);
  const cls = player.characterClass ? CHARACTER_CLASSES[player.characterClass] : null;
  const tree = player.characterClass ? SKILL_TREES[player.characterClass] : null;
  const unlockedSkills = player.skillTree || [];
  const passives = getPlayerPassiveSkills(player);

  if (!cls || !tree) {
    return (
      <div className="screen screen-skills">
        <div className="screen-header">Skill Tree</div>
        <div style={{ fontSize: '8px', color: '#888' }}>No class selected</div>
        <button className="btn btn-back" onClick={onBack}>Back</button>
      </div>
    );
  }

  function getTierState(tier, tierIdx) {
    const choiceIds = tier.choices.map(c => c.id);
    const chosen = unlockedSkills.find(id => choiceIds.includes(id));
    if (chosen) return { state: 'chosen', chosenId: chosen };
    if (player.level < tier.level) return { state: 'locked' };
    // Check if all previous tiers are filled
    for (let i = 0; i < tierIdx; i++) {
      const prevIds = tree.tiers[i].choices.map(c => c.id);
      if (!unlockedSkills.some(id => prevIds.includes(id))) {
        return { state: 'locked' };
      }
    }
    return { state: 'available' };
  }

  function handleSelect(skill) {
    setConfirmSkill(skill);
  }

  function handleConfirm() {
    if (confirmSkill) {
      onUnlockSkill(confirmSkill.id);
      setConfirmSkill(null);
    }
  }

  return (
    <div className="screen screen-skills">
      <div className="screen-header" style={{ color: cls.color }}>
        {cls.name} Skill Tree
      </div>

      {/* Active passives summary */}
      {passives.length > 0 && (
        <div className="skill-passives-summary">
          <div className="skill-passives-label">Active Passives:</div>
          <div className="skill-passives-list">
            {passives.map(p => (
              <span key={p.id} className="skill-passive-tag">{p.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="skill-tree-container">
        {/* Class innate skills */}
        <div className="skill-tree-innate">
          <div className="skill-tree-node skill-tree-node-innate" style={{ borderColor: cls.color }}>
            <div className="skill-tree-node-header">
              <span className="skill-tree-node-type passive">PASSIVE</span>
              <span className="skill-tree-node-name" style={{ color: cls.color }}>{cls.passive}</span>
            </div>
            <div className="skill-tree-node-desc">{cls.passiveDesc}</div>
          </div>
          <div className="skill-tree-connector">|</div>
          <div className="skill-tree-node skill-tree-node-innate" style={{ borderColor: cls.color }}>
            <div className="skill-tree-node-header">
              <span className="skill-tree-node-type active">ACTIVE</span>
              <span className="skill-tree-node-name" style={{ color: cls.color }}>{cls.skillName}</span>
            </div>
            <div className="skill-tree-node-desc">{cls.skillDesc}</div>
            <div className="skill-tree-node-mana">{cls.skillManaCost} Mana</div>
          </div>
        </div>

        {/* Skill tree tiers */}
        {tree.tiers.map((tier, tierIdx) => {
          const tierInfo = getTierState(tier, tierIdx);
          const isLocked = tierInfo.state === 'locked';
          const isChosen = tierInfo.state === 'chosen';
          const isAvailable = tierInfo.state === 'available';

          return (
            <div key={tier.label} className="skill-tree-tier">
              <div className="skill-tree-connector">|</div>
              <div className={`skill-tree-tier-label ${isLocked ? 'locked' : ''}`}>
                {tier.label} — Lv.{tier.level}
                {isLocked && player.level < tier.level && (
                  <span className="skill-tree-tier-req"> (Requires Lv.{tier.level})</span>
                )}
                {isLocked && player.level >= tier.level && (
                  <span className="skill-tree-tier-req"> (Complete previous tier first)</span>
                )}
              </div>
              <div className="skill-tree-choices">
                {tier.choices.map(choice => {
                  const isSelected = tierInfo.chosenId === choice.id;
                  const isOtherSelected = isChosen && !isSelected;
                  const canSelect = isAvailable;

                  return (
                    <div
                      key={choice.id}
                      className={`skill-tree-node ${
                        isSelected ? 'skill-tree-node-selected' :
                        isOtherSelected ? 'skill-tree-node-rejected' :
                        isLocked ? 'skill-tree-node-locked' :
                        canSelect ? 'skill-tree-node-available' : ''
                      }`}
                      onClick={() => canSelect ? handleSelect(choice) : null}
                      style={isSelected ? { borderColor: cls.color } : undefined}
                    >
                      <div className="skill-tree-node-header">
                        <span className={`skill-tree-node-type ${choice.type}`}>
                          {choice.type === 'passive' ? 'PASSIVE' : 'ACTIVE'}
                        </span>
                        <span className="skill-tree-node-name">{choice.name}</span>
                      </div>
                      <div className="skill-tree-node-desc">{choice.desc}</div>
                      {choice.type === 'active' && (
                        <div className="skill-tree-node-mana">{choice.manaCost} Mana • {choice.multiplier}x DMG</div>
                      )}
                      {isSelected && <div className="skill-tree-node-badge">LEARNED</div>}
                      {isOtherSelected && <div className="skill-tree-node-badge rejected">SKIPPED</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      {confirmSkill && (
        <div className="skill-confirm-overlay">
          <div className="skill-confirm-dialog">
            <div className="skill-confirm-title">Learn {confirmSkill.name}?</div>
            <div className="skill-confirm-type">
              {confirmSkill.type === 'passive' ? 'PASSIVE SKILL' : 'ACTIVE SKILL'}
            </div>
            <div className="skill-confirm-desc">{confirmSkill.desc}</div>
            {confirmSkill.type === 'active' && (
              <div className="skill-confirm-cost">{confirmSkill.manaCost} Mana • {confirmSkill.multiplier}x DMG</div>
            )}
            <div className="skill-confirm-warning">
              This choice is permanent! You cannot undo this decision.
            </div>
            <div className="skill-confirm-actions">
              <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
              <button className="btn btn-back" onClick={() => setConfirmSkill(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-back" onClick={onBack}>Back</button>
    </div>
  );
}
