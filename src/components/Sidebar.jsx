import React, { useEffect, useRef } from 'react';
import { Heart, Crosshair, ShoppingBag, Footprints, Cpu } from 'lucide-react';

const Sidebar = ({ stats, logs }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full sm:w-64 bg-zinc-900/80 border-b sm:border-r border-zinc-800 flex flex-col z-30 shrink-0">
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
            <span className="text-amber-200">+${stats.currentLoot}</span>
          </div>
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-zinc-400"><Footprints className="w-4 h-4"/> 探索深度</span>
            <span>{stats.distance}km</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="p-4 flex-1 overflow-y-auto">
         <div className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-widest">已装载模块</div>
         <div className="grid grid-cols-4 gap-2">
            {stats.playerModules.map((mod, i) => (
              <div key={i} className="w-10 h-10 bg-zinc-800 border border-zinc-600 rounded flex items-center justify-center group relative cursor-help hover:border-cyan-400 hover:bg-zinc-700 transition-colors">
                 <Cpu className="w-5 h-5 text-cyan-500/70" />
                 <div className="absolute left-10 top-0 w-48 bg-black border border-zinc-600 p-2 rounded shadow-xl z-50 hidden group-hover:block pointer-events-none">
                    <div className="text-xs font-bold text-cyan-300">{mod.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{mod.desc}</div>
                 </div>
              </div>
            ))}
            {stats.playerModules.length === 0 && <div className="col-span-4 text-xs text-zinc-600 italic">无战术模块</div>}
         </div>
      </div>

      {/* Logs */}
      <div className="h-32 sm:h-48 bg-black/40 border-t border-zinc-800 p-3 overflow-y-auto text-[10px] sm:text-xs font-mono scrollbar-hide">
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