import React from 'react';
import { Skull, Sword, Shield, Zap, UserMinus, Flame, Radiation, Crosshair } from 'lucide-react';
import Card from '../components/Card';
import { ENEMY_INTENTS, STATUS_TYPES } from '../constants/gameData';

const CombatView = ({ enemy, enemyStatus, hand, combatDeck, discardPile, energy, block, onPlayCard, onEndTurn }) => {
  if (!enemy) return null;

  return (
    <div className="flex-1 flex flex-col relative h-full">
       <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative animate-bounce-slow">
             <Skull className={`w-24 h-24 ${enemy.isElite ? 'text-purple-500 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
             
             {/* 意图显示 */}
             <div className="absolute -right-12 top-0 flex flex-col items-center animate-in slide-in-from-left-4 fade-in duration-500">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-lg mb-1">
                   {enemy.intent?.type === ENEMY_INTENTS.ATTACK && <Sword className="w-5 h-5 text-red-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.DEFEND && <Shield className="w-5 h-5 text-blue-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.BUFF && <Zap className="w-5 h-5 text-yellow-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.CHARGE && <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
                   {enemy.intent?.type === ENEMY_INTENTS.ESCAPE && <UserMinus className="w-5 h-5 text-zinc-400 animate-bounce" />}
                   {enemy.intent?.type === ENEMY_INTENTS.SLEEP && <span className="text-xs font-bold text-yellow-500">ZZZ</span>}
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 border border-zinc-800">
                   {enemy.intent?.type === ENEMY_INTENTS.ATTACK && `${enemy.intent.val} 伤`}
                   {enemy.intent?.type === ENEMY_INTENTS.DEFEND && `防`}
                   {enemy.intent?.type === ENEMY_INTENTS.CHARGE && `蓄力`}
                   {enemy.intent?.type === ENEMY_INTENTS.ESCAPE && `逃跑`}
                   {enemy.intent?.type === ENEMY_INTENTS.SLEEP && `昏睡`}
                </div>
             </div>

             {/* 状态显示 */}
             <div className="absolute -left-16 top-0 flex flex-col gap-2">
                {enemyStatus && enemyStatus[STATUS_TYPES.RADIATION] > 0 && (
                   <div className="flex items-center gap-1 bg-green-900/80 border border-green-700 px-2 py-1 rounded-full animate-in zoom-in">
                      <Radiation className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-green-200">{enemyStatus[STATUS_TYPES.RADIATION]}</span>
                   </div>
                )}
                {enemyStatus && enemyStatus[STATUS_TYPES.LOCK_ON] > 0 && (
                   <div className="flex items-center gap-1 bg-red-900/80 border border-red-700 px-2 py-1 rounded-full animate-in zoom-in">
                      <Crosshair className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-200">锁定</span>
                   </div>
                )}
             </div>
          </div>

          <div className="mt-6 w-64">
             <div className="flex justify-between text-xs font-bold mb-1">
                <span className={enemy.isElite ? "text-purple-400" : "text-red-400"}>{enemy.name}</span>
                <span className="text-zinc-500">{enemy.hp}/{enemy.maxHp}</span>
             </div>
             <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-800/50">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
             </div>
          </div>
       </div>

       <div className="h-16 flex items-center justify-center gap-8 pointer-events-none">
          <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border-2 border-blue-400">
                {energy}
             </div>
             <span className="text-[10px] text-blue-300 mt-1 font-bold">能量</span>
          </div>
          
          {block > 0 && (
             <div className="flex flex-col items-center animate-in zoom-in duration-200">
                <Shield className="w-10 h-10 text-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="text-lg font-bold text-cyan-400 absolute mt-1">{block}</span>
             </div>
          )}
       </div>

       <div className="h-64 sm:h-72 flex items-end justify-center pb-6 px-4 gap-2 overflow-visible pointer-events-none z-20">
           <div className="flex items-end justify-center gap-2 pointer-events-auto perspective-1000">
             {hand.map((card, i) => (
               <Card key={card.uid || i} card={card} index={i} inHand={true} onClick={onPlayCard} />
             ))}
           </div>
       </div>

       <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none text-xs font-mono text-zinc-600">
          <div>
             <div>牌堆: {combatDeck.length}</div>
             <div>弃牌: {discardPile.length}</div>
          </div>
          <button 
            onClick={onEndTurn}
            className="pointer-events-auto px-6 py-3 bg-red-900/80 hover:bg-red-700 text-red-100 border border-red-800 rounded font-bold tracking-widest transition-colors shadow-lg"
          >
            结束回合
          </button>
       </div>
    </div>
  );
};

export default CombatView;