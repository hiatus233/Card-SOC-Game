import React from 'react';
import { Cpu, ShoppingBag, Trash2 } from 'lucide-react';
import { DataManager } from '../services/DataManager';

const CampView = ({ money, playerModules, onBuyItem, onRemoveCard, onStartRun }) => {
  // 修正：从 DataManager 获取所有卡牌和模块
  const allModules = DataManager.getAllModules();
  // 过滤掉前 5 张基础卡，只显示商店卡
  const allCards = DataManager.getAllCards().slice(5); 
  
  const hasModule = (id) => playerModules.some(m => m.id === id);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
       <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">后勤补给站</h2>
            <p className="text-zinc-500 text-sm">欢迎回来，干员。</p>
          </div>
          <div className="text-2xl font-mono text-amber-400">${money}</div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
             <h3 className="text-zinc-400 font-bold mb-4 flex items-center gap-2"><Cpu size={16}/> 战术模块</h3>
             <div className="grid grid-cols-1 gap-2">
                {allModules.map(mod => {
                   const owned = hasModule(mod.id);
                   return (
                     <button 
                       key={mod.id}
                       disabled={owned}
                       onClick={() => onBuyItem(mod, 'MODULE')}
                       className={`p-3 border rounded flex justify-between items-center transition-all text-left group
                         ${owned ? 'border-zinc-800 bg-zinc-900 opacity-50' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-cyan-500'}
                       `}
                     >
                        <div>
                           <div className={`font-bold text-sm ${owned ? 'text-zinc-500' : 'text-cyan-400'}`}>{mod.name}</div>
                           <div className="text-xs text-zinc-500">{mod.desc}</div>
                        </div>
                        <div className="text-sm font-mono text-amber-500">{owned ? '已拥有' : `$${mod.price}`}</div>
                     </button>
                   )
                })}
             </div>
          </div>

          <div>
             <h3 className="text-zinc-400 font-bold mb-4 flex items-center gap-2"><ShoppingBag size={16}/> 战斗卡牌</h3>
             <div className="grid grid-cols-2 gap-2">
                {allCards.map(card => (
                   <button 
                     key={card.id}
                     onClick={() => onBuyItem(card, 'CARD')}
                     className="p-3 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500 rounded text-left transition-all"
                   >
                      <div className="font-bold text-sm text-zinc-200">{card.name}</div>
                      <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{card.desc}</div>
                      <div className="text-sm font-mono text-amber-500 mt-2">${card.price}</div>
                   </button>
                ))}
             </div>
          </div>
       </div>
       
       <div className="flex gap-4 border-t border-zinc-800 pt-6">
          <button 
            onClick={onStartRun} 
            className="flex-1 py-4 bg-zinc-100 hover:bg-white text-black font-bold rounded text-lg tracking-widest shadow-lg hover:scale-[1.01] transition-transform"
          >
            部署至战区
          </button>
          <button 
             onClick={onRemoveCard}
             className="px-6 py-4 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-900 rounded font-bold"
             title="随机移除服务（原型）"
          >
             <Trash2 />
          </button>
       </div>
    </div>
  );
};

export default CampView;