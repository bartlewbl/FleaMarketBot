import { useState, useEffect, useCallback } from 'react';
import { useGameState, ENERGY_COST_PER_TRIP, ENERGY_MAX } from './hooks/useGameState';
import { login, register, getMe, loadGame, hasSavedSession } from './api';
import GameCanvas from './components/GameCanvas';
import AuthScreen from './components/screens/AuthScreen';
import TownScreen from './components/screens/TownScreen';
import LocationsScreen from './components/screens/LocationsScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import BattleScreen from './components/screens/BattleScreen';
import BattleResultScreen from './components/screens/BattleResultScreen';
import InventoryScreen from './components/screens/InventoryScreen';
import ShopScreen from './components/screens/ShopScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SkillsScreen from './components/screens/SkillsScreen';
import ClassSelectScreen from './components/screens/ClassSelectScreen';
import BossConfirmScreen from './components/screens/BossConfirmScreen';
import UsernameScreen from './components/screens/UsernameScreen';
import RegionsScreen from './components/screens/RegionsScreen';
import JournalScreen from './components/screens/JournalScreen';
import MarketScreen from './components/screens/MarketScreen';
import BaseScreen from './components/screens/BaseScreen';
import SidePanel from './components/SidePanel';
import RightPanel from './components/RightPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const isLoggedIn = !!user;
  const { state, actions, playerAtk, playerDef } = useGameState(isLoggedIn);
  const [animTick, setAnimTick] = useState(0);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  const [battleAnim, setBattleAnim] = useState(null);

  // Check existing session on mount and go straight to game
  useEffect(() => {
    if (!hasSavedSession()) {
      setCheckingSession(false);
      return;
    }
    getMe()
      .then(data => {
        setUser({ username: data.username });
        return loadGame();
      })
      .then(data => {
        if (data?.hasSave) {
          actions.loadSave(data.saveData);
        } else {
          actions.startGame();
        }
      })
      .catch(() => {
        // Session expired
      })
      .finally(() => setCheckingSession(false));
  }, []);

  // Animation loop for canvas
  useEffect(() => {
    let frameId;
    let tick = 0;
    const loop = () => {
      tick++;
      if (tick % 2 === 0) setAnimTick(t => t + 1);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => actions.clearMessage(), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.message, actions]);

  const handleLogin = useCallback(async (username, password) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await login(username, password);
      setUser({ username: data.username });
      const save = await loadGame();
      if (save?.hasSave) {
        actions.loadSave(save.saveData);
      } else {
        actions.startGame();
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, [actions]);

  const handleRegister = useCallback(async (username, password) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await register(username, password);
      setUser({ username: data.username });
      actions.startGame();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }, [actions]);

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="game-container">
        <div className="ui-overlay">
          <div className="screen screen-loading">
            <div className="loading-title">PIXEL GRIND</div>
            <div className="loading-text">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <div className="game-container">
        <GameCanvas screen="town" location={null} battle={null} animTick={animTick} />
        <div className="ui-overlay">
          <AuthScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
            error={authError}
            loading={authLoading}
          />
        </div>
      </div>
    );
  }

  // Username entry screen (full-screen, no side panels)
  if (state.screen === 'username-entry') {
    return (
      <div className="game-container">
        <GameCanvas screen="town" location={null} battle={null} animTick={animTick} />
        <div className="ui-overlay">
          <UsernameScreen onSubmit={actions.setUsername} />
        </div>
      </div>
    );
  }

  // Class selection screen (full-screen, no side panel)
  if (state.screen === 'class-select') {
    return (
      <div className="game-container">
        <GameCanvas screen="town" location={null} battle={null} animTick={animTick} />
        <div className="ui-overlay">
          <ClassSelectScreen onSelectClass={actions.selectClass} />
        </div>
      </div>
    );
  }

  const navLocked = state.screen === 'battle' || state.screen === 'battle-result' || state.screen === 'boss-confirm';
  const canRest = !navLocked && (state.screen === 'town' || state.screen === 'locations' || state.screen === 'regions');

  return (
    <div className="game-container">
      <GameCanvas
        screen={state.screen}
        location={state.currentLocation}
        battle={state.battle}
        animTick={animTick}
        battleAnim={battleAnim}
      />

      <div className="ui-overlay">
        <div className="ui-main">
          <SidePanel
            collapsed={isMenuCollapsed}
            onToggle={() => setIsMenuCollapsed(v => !v)}
            screen={state.screen}
            currentLocation={state.currentLocation}
            energy={state.energy}
            energyMax={ENERGY_MAX}
            energyCost={ENERGY_COST_PER_TRIP}
            hp={state.player.hp}
            maxHp={state.player.maxHp}
            mana={state.player.mana}
            maxMana={state.player.maxMana}
            playerName={state.player.name}
            playerLevel={state.player.level}
            onGoToTown={actions.goToTown}
            onExplore={() => actions.showScreen('regions')}
            onInventory={() => actions.showScreen('inventory')}
            onShop={() => actions.showScreen('shop')}
            onMarket={() => actions.showScreen('market')}
            onBase={() => actions.showScreen('base')}
            onJournal={() => actions.showScreen('journal')}
            onRest={actions.restAtInn}
            navLocked={navLocked}
            gold={state.player.gold}
            onProfile={() => actions.showScreen('profile')}
            onSkills={() => actions.showScreen('skills')}
            canRest={canRest}
          />

          <div className="screen-stage">
            {state.screen === 'town' && (
              <TownScreen
                player={state.player}
                energy={state.energy}
                energyCost={ENERGY_COST_PER_TRIP}
                onRest={actions.restAtInn}
                onEnterLocation={actions.enterLocation}
                onBuy={actions.buyItem}
                canRest={canRest}
                onClaimDailyReward={actions.claimDailyReward}
                onGoToBase={() => actions.showScreen('base')}
              />
            )}

            {state.screen === 'regions' && (
              <RegionsScreen
                playerLevel={state.player.level}
                playerGold={state.player.gold}
                onSelect={actions.selectRegion}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'locations' && state.currentRegion && (
              <LocationsScreen
                playerLevel={state.player.level}
                energy={state.energy}
                energyMax={ENERGY_MAX}
                energyCost={ENERGY_COST_PER_TRIP}
                locations={state.currentRegion.locations}
                regionName={state.currentRegion.name}
                onSelect={actions.enterLocation}
                onBack={actions.backToRegions}
              />
            )}

            {state.screen === 'explore' && (
              <ExploreScreen
                location={state.currentLocation}
                text={state.exploreText}
                onContinue={actions.exploreStep}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'boss-confirm' && (
              <BossConfirmScreen
                boss={state.pendingBoss}
                onAccept={actions.bossAccept}
                onDecline={actions.bossDecline}
              />
            )}

            {state.screen === 'battle' && (
              <BattleScreen
                battle={state.battle}
                battleLog={state.battleLog}
                player={state.player}
                onAttack={actions.battleAttack}
                onSkill={actions.battleSkill}
                onDefend={actions.battleDefend}
                onPotion={actions.battlePotion}
                onRun={actions.battleRun}
                onMonsterTurn={actions.monsterTurn}
                onTreeSkill={actions.battleTreeSkill}
                onToggleSkillMenu={actions.toggleSkillMenu}
                setBattleAnim={setBattleAnim}
                animTick={animTick}
              />
            )}

            {state.screen === 'battle-result' && (
              <BattleResultScreen
                result={state.battleResult}
                onContinue={actions.continueAfterBattle}
              />
            )}

            {state.screen === 'inventory' && (
              <InventoryScreen
                player={state.player}
                playerAtk={playerAtk}
                playerDef={playerDef}
                onEquip={actions.equipItem}
                onUnequip={actions.unequipItem}
                onUse={actions.useItem}
                onSell={actions.sellItem}
                onReorder={actions.reorderInventory}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'profile' && (
              <ProfileScreen
                player={state.player}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'skills' && (
              <SkillsScreen
                player={state.player}
                onBack={actions.goToTown}
                onUnlockSkill={actions.unlockSkill}
              />
            )}

            {state.screen === 'shop' && (
              <ShopScreen
                player={state.player}
                onBuy={actions.buyItem}
                onSell={actions.sellItem}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'journal' && (
              <JournalScreen
                stats={state.stats}
                tasks={state.tasks}
                onClaim={actions.claimTask}
                onBack={actions.goToTown}
              />
            )}

            {state.screen === 'base' && (
              <BaseScreen
                player={state.player}
                base={state.base}
                onBack={actions.goToTown}
                onBuild={actions.baseBuild}
                onAddFuel={actions.baseAddFuel}
                onAddFuelFromStorage={actions.baseAddFuelFromStorage}
                onStoreMaterial={actions.baseStoreMaterial}
                onBrew={actions.baseBrew}
                onSmelt={actions.baseSmelt}
                onCraft={actions.baseCraft}
                onCollectCraft={actions.baseCollectCraft}
                onUpgradeInn={actions.baseUpgradeInn}
                onBuyInnBoost={actions.baseBuyInnBoost}
                onUpgradeChamber={actions.baseUpgradeChamber}
                onSendMission={actions.baseSendMission}
                onCollectMission={actions.baseCollectMission}
                onBankDeposit={actions.baseBankDeposit}
                onBankWithdraw={actions.baseBankWithdraw}
                onBankFreeze={actions.baseBankFreeze}
                onBankCollectFrozen={actions.baseBankCollectFrozen}
                onBankLoan={actions.baseBankLoan}
                onBankRepay={actions.baseBankRepay}
                onStartSpar={actions.baseStartSpar}
                onSparAttack={actions.baseSparAttack}
                onSparSkill={actions.baseSparSkill}
                onResetSpar={actions.baseResetSpar}
              />
            )}

            {state.screen === 'market' && (
              <MarketScreen
                player={state.player}
                onBack={actions.goToTown}
                onMarketTransaction={actions.applyMarketTransaction}
              />
            )}
          </div>

          <RightPanel
            collapsed={isRightPanelCollapsed}
            onToggle={() => setIsRightPanelCollapsed(v => !v)}
            player={state.player}
            onTradeComplete={actions.applyTrade}
          />
        </div>

        {state.message && (
          <div className="message-overlay">
            <div className="message-text">{state.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
