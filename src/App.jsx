import React from 'react';
import { useGame } from './hooks/useGame';
import { GAME_STATE } from './constants/gameData';
import Sidebar from './components/Sidebar';
import ExplorationView from './views/ExplorationView';
import CombatView from './views/CombatView';
import CampView from './views/CampView';

export default function App() {
  const { state, actions } = useGame();
  const { gameState } = state;

  return (
    <div className="w-full h-screen bg-black text-zinc-200 font-sans flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-5xl bg-zinc-950 flex flex-col sm:flex-row relative overflow-hidden">
        
        {/* Model/View: Stats Sidebar */}
        <Sidebar stats={state} logs={state.logs} />

        {/* Views Container */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden flex flex-col">
          
          {gameState === GAME_STATE.MENU && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-50 space-y-8 bg-zinc-950/80 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">零号战区</h1>
                  <p className="text-zinc-500 font-mono tracking-widest text-sm">战术卡牌构筑</p>
                </div>
                <button 
                  onClick={() => actions.setGameState(GAME_STATE.CAMP)}
                  className="px-10 py-4 bg-white text-black font-bold tracking-widest hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  初始化系统
                </button>
             </div>
          )}

          {/* 同时处理 MAP_SELECT 和 EXPLORING */}
          {(gameState === GAME_STATE.EXPLORING || gameState === GAME_STATE.MAP_SELECT) && (
            <ExplorationView 
              gameState={gameState} 
              mapOptions={state.mapOptions} 
              explorationCard={state.explorationCard}
              onSelectNode={actions.selectMapNode}
              onCombatStart={actions.startCombat}
              onCollect={actions.collectLoot}
              onExtract={actions.extract}
            />
          )}

          {gameState === GAME_STATE.COMBAT && (
            <CombatView 
              enemy={state.enemy}
              enemyStatus={state.enemyStatus}
              hand={state.hand}
              combatDeck={state.combatDeck}
              discardPile={state.discardPile}
              energy={state.energy}
              block={state.block}
              onPlayCard={actions.playCard}
              onEndTurn={actions.endTurn}
            />
          )}

          {gameState === GAME_STATE.CAMP && (
            <CampView 
              money={state.money}
              playerModules={state.playerModules}
              onBuyItem={actions.buyItem}
              onRemoveCard={actions.removeCard}
              onStartRun={actions.startRun}
            />
          )}

          {gameState === GAME_STATE.VICTORY && (
            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
               <div className="text-center">
                  <h2 className="text-4xl font-bold text-yellow-400 mb-2">目标确认清除</h2>
                  <p className="text-zinc-400 mb-8">区域安全。物资已截获。</p>
                  <div className="flex gap-4 justify-center">
                     <button onClick={actions.resolveVictory} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold">搜刮并继续</button>
                     <button onClick={actions.extract} className="px-6 py-3 bg-green-900 hover:bg-green-800 text-green-100 rounded font-bold">立即撤离</button>
                  </div>
               </div>
            </div>
          )}

          {gameState === GAME_STATE.GAME_OVER && (
            <div className="absolute inset-0 bg-red-950/90 z-50 flex items-center justify-center p-4">
               <div className="text-center">
                  <h2 className="text-5xl font-black text-red-500 mb-4 tracking-tighter">任务失败</h2>
                  <p className="text-red-200/50 mb-8">生命体征消失。资产回收不可行。</p>
                  <button onClick={() => actions.setGameState(GAME_STATE.MENU)} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold">重启系统</button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}