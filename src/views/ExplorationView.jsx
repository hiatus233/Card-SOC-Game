import React from 'react';
import { Search, ChevronRight, Skull, ShoppingBag, BriefcaseMedical, Sword, LogOut } from 'lucide-react';

const ExplorationView = ({ explorationCard, onNextStep, onCombatStart, onCollect, onExtract }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {!explorationCard ? (
        <button 
          onClick={onNextStep}
          className="group relative px-8 py-6 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden hover:border-zinc-500 transition-all duration-300 w-64 flex flex-col items-center gap-4"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          <Search className="w-10 h-10 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10"/>
          <div className="relative z-10 text-center">
            <div className="font-bold text-lg text-zinc-200">扫描区域</div>
            <div className="text-xs text-zinc-500 mt-1">点击继续探索</div>
          </div>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 group-hover:translate-x-1 group-hover:text-white transition-all"/>
        </button>
      ) : (
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
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{explorationCard.desc || explorationCard.data?.desc || (explorationCard.data?.isElite ? "极其危险的目标。" : "普通的废土威胁。")}</p>

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