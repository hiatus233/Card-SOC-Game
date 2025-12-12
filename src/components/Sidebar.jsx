import React, { useEffect, useRef } from 'react';
import { Heart, Crosshair, ShoppingBag, Footprints, Cpu, Package } from 'lucide-react';
// 引入配置以显示稀有度颜色
import { RARITY_CONFIG } from '../constants/gameData';

const Sidebar = ({ stats, logs }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 新逻辑：计算当前背包内所有物品的总价值
  // 因为 currentLoot 现在是一个数组，不能直接显示
  const totalLootValue = stats.currentLoot ? stats.currentLoot.reduce((sum, item) => sum + item.value, 0) : 0;

  return (
    <div className="w-full sm:w-64 bg-zinc-900/80 border-b sm:border-r border-zinc-800 flex flex-col z-30 shrink-0 h-full max-h-screen">
      <div className="p-4 bg-zinc-900 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-100 tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="text-cyan-500"/> 协议：Z
        </h1>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-red-400"><Heart className="w-4 h-4"/> 结构值</span>
            <span className="group-hover:text-white transition-colors">{stats.hp}/{stats.maxHp}</span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-yellow-400"><Crosshair className="w-4 h-4"/> 弹药储备</span>
            <span className="group-hover:text-white transition-colors">{stats.globalAmmo}</span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-amber-400"><ShoppingBag className="w-4 h-4"/> 临时物资</span>
            {/* 这里的显示逻辑更新了 */}
            <span className="text-amber-200">+${totalLootValue}</span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-zinc-400"><Footprints className="w-4 h-4"/> 探索深度</span>
            <span>{stats.distance}km</span>
          </div>
        </div>
      </div>

      {/* 🔴 新增区域：战利品清单 */}
      <div className="p-4 border-b border-zinc-800 flex-1 overflow-y-auto min-h-[100px]">
         <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1">
               <ShoppingBag className="w-3 h-3"/> 背包详情
            </div>
         </div>
         
         <div className="space-y-1">
            {(!stats.currentLoot || stats.currentLoot.length === 0) && <div className="text-xs text-zinc-600 italic py-2 text-center">空空如也</div>}
            {stats.currentLoot && stats.currentLoot.map((item, i) => {
               // 根据稀有度获取颜色，如果没有配置则默认灰色
               const rarityStyle = RARITY_CONFIG ? RARITY_CONFIG[item.rarity] : { color: 'text-zinc-300' };
               return (
                  <div key={i} className="flex justify-between items-center bg-black/40 p-1.5 rounded border border-zinc-800/50 group hover:border-zinc-600 transition-colors">
                     <div className={`text-xs ${rarityStyle?.color || 'text-zinc-300'} flex items-center gap-2`}>
                        <Package className="w-3 h-3 opacity-70"/> {item.name}
                     </div>
                     <div className="text-[10px] text-zinc-500 font-mono">${item.value}</div>
                  </div>
               )
            })}
         </div>
      </div>

      {/* 模块列表 (UI微调) */}
      <div className="p-4 border-b border-zinc-800">
         <div className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-widest">模块</div>
         <div className="grid grid-cols-4 gap-2">
            {stats.playerModules.map((mod, i) => (
              <div key={i} className="w-8 h-8 bg-zinc-800 border border-zinc-600 rounded flex items-center justify-center group relative cursor-help hover:border-cyan-400 hover:bg-zinc-700 transition-colors">
                 <Cpu className="w-4 h-4 text-cyan-500/70" />
                 <div className="absolute left-10 top-0 w-48 bg-black border border-zinc-600 p-2 rounded shadow-xl z-50 hidden group-hover:block pointer-events-none">
                    <div className="text-xs font-bold text-cyan-300">{mod.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{mod.desc}</div>
                 </div>
              </div>
            ))}
            {stats.playerModules.length === 0 && <div className="col-span-4 text-xs text-zinc-600 italic">无</div>}
         </div>
      </div>

      {/* 日志区域 */}
      <div className="h-32 bg-black/40 p-3 overflow-y-auto text-[10px] sm:text-xs font-mono scrollbar-hide">
        {logs.map((log, i) => (
          <div key={i} className="text-zinc-500 mb-1">
            <span className="text-zinc-700 mr-1">{'>'}</span>{log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default Sidebar;