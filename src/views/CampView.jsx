import React, { useState, useEffect } from 'react';
import { Skull, Sword, Shield, Zap, UserMinus, Flame, Radiation, Crosshair, AlertOctagon } from 'lucide-react';
import Card from '../components/Card';
import { ENEMY_INTENTS, STATUS_TYPES } from '../constants/gameData';

const CombatView = ({ enemy, enemyStatus, hand, combatDeck, discardPile, energy, block, onPlayCard, onEndTurn }) => {
  if (!enemy) return null;

  // --- 动效状态 ---
  const [shake, setShake] = useState(false);
  const [floatingText, setFloatingText] = useState(null); // { val: 12, isCrit: false, id: 1 }
  const [prevHp, setPrevHp] = useState(enemy.hp);

  // 监听敌人血量变化，触发特效
  useEffect(() => {
    if (enemy.hp < prevHp) {
      const dmg = prevHp - enemy.hp;
      const isCrit = dmg > 15; // 简单判定：大于15算暴击特效
      
      // 1. 触发震动
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // 2. 触发飘字
      const id = Date.now();
      setFloatingText({ val: dmg, isCrit, id });
      setTimeout(() => setFloatingText(null), 800); // 飘字消失
    }
    setPrevHp(enemy.hp);
  }, [enemy.hp]);

  // 视觉反馈：是否被锁定？
  const isLockedOn = enemyStatus && enemyStatus[STATUS_TYPES.LOCK_ON] > 0;
  // 视觉反馈：狙击手是否在瞄准？
  const isAiming = enemy.intent?.type === ENEMY_INTENTS.DEBUFF;

  return (
    <div className={`flex-1 flex flex-col relative h-full transition-colors duration-300 ${isAiming ? 'bg-red-950/10' : ''}`}>
       
       {/* 红色警报遮罩 (Vignette) */}
       {(isLockedOn || isAiming) && (
          <div className="absolute inset-0 z-0 pointer-events-none border-[2px] sm:border-[10px] border-red-500/20 animate-pulse shadow-[inset_0_0_50px_rgba(220,38,38,0.2)]"></div>
       )}

       {/* Enemy Area (增加 shake-effect 类) */}
       <div className={`flex-1 flex flex-col items-center justify-center relative z-10 ${shake ? 'shake-effect' : ''}`}>
          
          {/* 伤害飘字 */}
          {floatingText && (
             <div className={floatingText.isCrit ? 'damage-text crit-text' : 'damage-text'}>
                -{floatingText.val}
             </div>
          )}

          <div className="relative animate-bounce-slow">
             <Skull className={`w-24 h-24 ${enemy.isElite ? 'text-purple-500 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
             
             {/* 意图显示 */}
             <div className="absolute -right-16 top-0 flex flex-col items-center animate-in slide-in-from-left-4 fade-in duration-500">
                <div className={`w-12 h-12 bg-zinc-900 border-2 rounded-full flex items-center justify-center shadow-lg mb-1
                    ${isAiming ? 'border-red-500 animate-pulse shadow-red-500/50' : 'border-zinc-700'}
                `}>
                   {enemy.intent?.type === ENEMY_INTENTS.ATTACK && <Sword className="w-6 h-6 text-red-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.DEFEND && <Shield className="w-6 h-6 text-blue-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.BUFF && <Zap className="w-6 h-6 text-yellow-400" />}
                   {enemy.intent?.type === ENEMY_INTENTS.CHARGE && <Flame className="w-6 h-6 text-orange-500 animate-pulse" />}
                   {enemy.intent?.type === ENEMY_INTENTS.ESCAPE && <UserMinus className="w-6 h-6 text-zinc-400 animate-bounce" />}
                   {enemy.intent?.type === ENEMY_INTENTS.SLEEP && <span className="text-xs font-bold text-yellow-500">ZZZ</span>}
                   
                   {/* 🔴 修复：Crosshair 图标现在使用 animate-pulse (呼吸) 而不是 ping (消失) */}
                   {enemy.intent?.type === ENEMY_INTENTS.DEBUFF && <Crosshair className="w-6 h-6 text-red-500 animate-pulse" />}
                </div>
                
                <div className="bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 border border-zinc-800 whitespace-nowrap">
                   {enemy.intent?.type === ENEMY_INTENTS.ATTACK && `${enemy.intent.val} 伤`}
                   {enemy.intent?.type === ENEMY_INTENTS.DEFEND && `防御`}
                   {enemy.intent?.type === ENEMY_INTENTS.CHARGE && `蓄力`}
                   {enemy.intent?.type === ENEMY_INTENTS.ESCAPE && `逃跑`}
                   {enemy.intent?.type === ENEMY_INTENTS.SLEEP && `昏睡`}
                   {enemy.intent?.type === ENEMY_INTENTS.DEBUFF && `锁定中`}
                </div>
             </div>

             {/* 状态显示 */}
             <div className="absolute -left-20 top-0 flex flex-col gap-2 items-end">
                {enemyStatus && enemyStatus[STATUS_TYPES.RADIATION] > 0 && (
                   <div className="flex items-center gap-1 bg-green-900/80 border border-green-700 px-2 py-1 rounded-full animate-in zoom-in">
                      <Radiation className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-green-200">{enemyStatus[STATUS_TYPES.RADIATION]}</span>
                   </div>
                )}
                {enemyStatus && enemyStatus[STATUS_TYPES.LOCK_ON] > 0 && (
                   <div className="flex items-center gap-1 bg-red-900/80 border border-red-700 px-2 py-1 rounded-full animate-in zoom-in">
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-200">被锁定</span>
                   </div>
                )}
             </div>
          </div>

          <div className="mt-6 w-64 relative">
             <div className="flex justify-between text-xs font-bold mb-1 relative z-10">
                <span className={enemy.isElite ? "text-purple-400" : "text-red-400"}>{enemy.name}</span>
                <span className="text-zinc-500">{enemy.hp}/{enemy.maxHp}</span>
             </div>
             <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-800/50 relative shadow-inner">
                {/* 🔴 动效：增加宽度变化的 transition */}
                <div className="h-full bg-red-600 transition-all duration-300 ease-out relative" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}>
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-red-400 opacity-50"></div>
                </div>
             </div>
          </div>
       </div>

       {/* Player HUD */}
       <div className="h-16 flex items-center justify-center gap-8 pointer-events-none relative z-10">
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

       {/* Hand */}
       <div className="h-64 sm:h-72 flex items-end justify-center pb-6 px-4 gap-2 overflow-visible pointer-events-none z-20">
           <div className="flex items-end justify-center gap-2 pointer-events-auto perspective-1000">
             {hand.map((card, i) => (
               <Card key={card.uid || i} card={card} index={i} inHand={true} onClick={onPlayCard} />
             ))}
           </div>
       </div>

       {/* Footer */}
       <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none text-xs font-mono text-zinc-600 z-10">
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