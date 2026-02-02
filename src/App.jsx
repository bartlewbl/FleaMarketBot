import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import GameCanvas from './components/GameCanvas';
import TopBar from './components/TopBar';
import MenuScreen from './components/screens/MenuScreen';
import TownScreen from './components/screens/TownScreen';
import LocationsScreen from './components/screens/LocationsScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import BattleScreen from './components/screens/BattleScreen';
import BattleResultScreen from './components/screens/BattleResultScreen';
import InventoryScreen from './components/screens/InventoryScreen';
import ShopScreen from './components/screens/ShopScreen';

export default function App() {
  const { state, actions, playerAtk, playerDef } = useGameState();
  const [animTick, setAnimTick] = useState(0);

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

  const showTopBar = state.screen !== 'menu';

  return (
    <div className="game-container">
      <GameCanvas
        screen={state.screen}
        location={state.currentLocation}
        battle={state.battle}
        animTick={animTick}
      />

      <div className="ui-overlay">
        {showTopBar && <TopBar player={state.player} />}

        {state.screen === 'menu' && (
          <MenuScreen onStart={actions.startGame} />
        )}

        {state.screen === 'town' && (
          <TownScreen
            onExplore={() => actions.showScreen('locations')}
            onInventory={() => actions.showScreen('inventory')}
            onShop={() => actions.showScreen('shop')}
            onRest={actions.restAtInn}
          />
        )}

        {state.screen === 'locations' && (
          <LocationsScreen
            playerLevel={state.player.level}
            onSelect={actions.enterLocation}
            onBack={actions.goToTown}
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

        {state.screen === 'battle' && (
          <BattleScreen
            battle={state.battle}
            battleLog={state.battleLog}
            onAttack={actions.battleAttack}
            onSkill={actions.battleSkill}
            onDefend={actions.battleDefend}
            onPotion={actions.battlePotion}
            onRun={actions.battleRun}
            onMonsterTurn={actions.monsterTurn}
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
            onBack={actions.goToTown}
          />
        )}

        {state.screen === 'shop' && (
          <ShopScreen
            playerLevel={state.player.level}
            playerGold={state.player.gold}
            onBuy={actions.buyItem}
            onBack={actions.goToTown}
          />
        )}

        {state.message && (
          <div className="message-overlay">
            <div className="message-text">{state.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
