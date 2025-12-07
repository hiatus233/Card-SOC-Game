import React from 'react';
import { Search, ChevronRight, Skull, ShoppingBag, BriefcaseMedical, Sword, LogOut, MapPin, AlertTriangle, Radiation } from 'lucide-react';
import { GAME_STATE } from '../constants/gameData';

const ExplorationView = ({ gameState, explorationCard, mapOptions, onSelectNode, onCombatStart, onCollect, onExtract }) => {
  // 阶段 1：地图选择
  if (gameState === GAME_STATE.MAP_SELECT) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <MapPin className="text-cyan-400" /> 选择行进路线
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          {mapOptions.map((node) => {
             let borderColor = "border-zinc-600";
             let icon = <Search className="w-8 h-8 text-zinc-400"/>;
             let textColor = "text-zinc-300";

             if (node.id === 'ARSENAL') { 
                borderColor = "border-red-600"; 
                icon = <AlertTriangle className="w-8 h-8 text-red-500"/>;
                textColor = "text-red-400";
             }
             if (node.id === 'RAD_ZONE') { 
                borderColor = "border-green-600"; 
                icon = <Radiation className="w-8 h-8 text-green-500"/>;
                textColor = "text-green-400";
             }
             if (node.id === 'SUPPLY_DEPOT') { 
                borderColor = "border-amber-600"; 
                icon = <BriefcaseMedical className="w-8 h-8 text-amber-500"/>;
                textColor = "text-amber-400";
             }

             return (
               <button 
                 key={node.uid}
                 onClick={() => onSelectNode(node)}
                 className={`
                   w-48 h-64 bg-zinc-900 border-2 ${borderColor} rounded-xl p-4 flex flex-col items-center justify-between
                   hover:scale-105 transition-transform shadow-xl hover:bg-zinc-800 group
                 `}
               >
                 <div className="mt-4 group-hover:scale-110 transition-transform">{icon}</div>
                 <div className="text-center">
                    <div className={`font-bold text-lg ${textColor}`}>{node.name}</div>
                    <div className="text-xs text-zinc-500 mt-2">{node.desc}</div>
                 </div>
                 <div className="text-[10px] font-mono bg-black/50 px-2 py-1 rounded text-zinc-400">
                    危险等级: {'★'.repeat(node.risk)}
                 </div>
               </button>
             );
          })}
        </div>
      </div>
    );
  }

  // 阶段 2：事件卡结算
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
        {explorationCard && (
          <div className="w-full max-w-md animate-in zoom-in duration-300">
             <div className={`
                relative overflow-hidden rounded-2xl border bg-zinc-900 shadow-2xl p-8 flex flex-col items-center text-center
                ${explorationCard.type === 'ENEMY' ? (explorationCard.data.isElite ? 'border-purple-500/50 shadow-purple-900/20' : 'border-red-500/50 shadow-red-900/20') : 'border-zinc-700'}
             `}>
                {explorationCard.type === 'ENEMY' && <div className="absolute inset-0 bg-red-500/5 animate-pulse"/>}
                
                <div className="mb-6 relative">
                  {explorationCard.type === 'ENEMY' ? (
                    <div className="relative">
                      <Skull className={`w-20 h-20 ${explorationCard.data.isElite ? 'text-purple-500' : 'text-red-500'}`}/>
                      {explorationCard.data.isElite && <div className="absolute -top-2 -right-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">精英</div>}
                    </div>
                  ) : explorationCard.type === 'LOOT' ? (
                    <ShoppingBag className="w-20 h-20 text-amber-500"/>
                  ) : explorationCard.type === 'SUPPLY' ? (
                    <BriefcaseMedical className="w-20 h-20 text-green-500"/>
                  ) : (
                    <Search className="w-20 h-20 text-zinc-600"/>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{explorationCard.data?.name || explorationCard.name}</h2>
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{explorationCard.desc || explorationCard.data?.desc}</p>

                <div className="flex flex-col w-full gap-3 relative z-10">
                  {explorationCard.type === 'ENEMY' ? (
                    <button 
                      onClick={() => onCombatStart(explorationCard.data)}
                      className={`w-full py-4 font-bold text-white rounded-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform ${explorationCard.data.isElite ? 'bg-purple-700 hover:bg-purple-600' : 'bg-red-700 hover:bg-red-600'}`}
                    >
                      <Sword className="w-5 h-5"/> 战斗开始
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={onCollect} className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold border border-zinc-700">获取</button>
                       <button onClick={onExtract} className="py-3 bg-green-900/50 hover:bg-green-800 text-green-200 rounded-lg font-bold border border-green-800/50 flex items-center justify-center gap-2">
                         <LogOut className="w-4 h-4"/> 撤离
                       </button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}
    </div>
  );
};

export default ExplorationView;