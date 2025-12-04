import React, { useState, useEffect, useRef } from 'react';
import { 
  Skull, 
  Backpack, 
  Heart, 
  Crosshair, 
  Footprints, 
  LogOut, 
  ShoppingBag, 
  ShieldAlert, 
  Search,
  Zap,
  BriefcaseMedical,
  Shield,
  Sword,
  RefreshCcw,
  Trash2,
  Hammer
} from 'lucide-react';

// --- Constants & Data ---

const GAME_STATE = {
  MENU: 'MENU',
  EXPLORING: 'EXPLORING',
  COMBAT: 'COMBAT', // Now triggers the Card Battler
  LOOTING: 'LOOTING',
  CAMP: 'CAMP',     // Expanded Shop
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY' // Combat victory
};

const CARD_TYPES = {
  ATTACK: 'ATTACK',
  SKILL: 'SKILL',
  POWER: 'POWER'
};

const ENEMY_INTENTS = {
  ATTACK: 'ATTACK',
  DEFEND: 'DEFEND',
  BUFF: 'BUFF'
};

// --- Card Database ---
const CARD_LIBRARY = [
  { id: 'shoot', name: '点射', type: CARD_TYPES.ATTACK, cost: 1, damage: 6, ammoCost: 1, desc: '造成 6 点伤害。消耗 1 发弹药。' },
  { id: 'slash', name: '匕首挥砍', type: CARD_TYPES.ATTACK, cost: 1, damage: 5, ammoCost: 0, desc: '造成 5 点伤害。' },
  { id: 'defend', name: '寻找掩体', type: CARD_TYPES.SKILL, cost: 1, block: 5, desc: '获得 5 点格挡。' },
  { id: 'aim', name: '瞄准', type: CARD_TYPES.SKILL, cost: 0, draw: 2, desc: '抽 2 张牌。' },
  { id: 'reload', name: '快速装填', type: CARD_TYPES.SKILL, cost: 1, addAmmo: 3, block: 3, desc: '获得 3 发弹药和 3 点格挡。' },
  { id: 'burst', name: '全自动扫射', type: CARD_TYPES.ATTACK, cost: 2, damage: 4, times: 3, ammoCost: 3, desc: '造成 3 次 4 点伤害。消耗 3 发弹药。' },
  { id: 'stimpack', name: '兴奋剂', type: CARD_TYPES.SKILL, cost: 0, energy: 2, hpCost: 3, desc: '失去 3 点生命，获得 2 点能量。' },
  { id: 'smash', name: '枪托重击', type: CARD_TYPES.ATTACK, cost: 2, damage: 12, ammoCost: 0, desc: '造成 12 点伤害。' },
];

const INITIAL_DECK = [
  { ...CARD_LIBRARY.find(c => c.id === 'shoot'), uid: 1 },
  { ...CARD_LIBRARY.find(c => c.id === 'shoot'), uid: 2 },
  { ...CARD_LIBRARY.find(c => c.id === 'slash'), uid: 3 },
  { ...CARD_LIBRARY.find(c => c.id === 'slash'), uid: 4 },
  { ...CARD_LIBRARY.find(c => c.id === 'defend'), uid: 5 },
  { ...CARD_LIBRARY.find(c => c.id === 'defend'), uid: 6 },
  { ...CARD_LIBRARY.find(c => c.id === 'reload'), uid: 7 },
];

// --- Helper Functions ---

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// --- Main Component ---

export default function WastelandDeckbuilder() {
  // Global App State
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [logs, setLogs] = useState(["废土生存法则第一条：别把子弹浪费在死人身上。"]);
  
  // Persistent Player Data (Meta)
  const [money, setMoney] = useState(50);
  const [playerDeck, setPlayerDeck] = useState([...INITIAL_DECK]);
  const [maxHp] = useState(80);
  const [hp, setHp] = useState(80);
  const [globalAmmo, setGlobalAmmo] = useState(10); // Persistent ammo pool
  
  // Exploration State
  const [distance, setDistance] = useState(0);
  const [currentLoot, setCurrentLoot] = useState(0);
  const [explorationCard, setExplorationCard] = useState(null);

  // Combat State (Transient)
  const [combatDeck, setCombatDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [energy, setEnergy] = useState(3);
  const [maxEnergy] = useState(3);
  const [block, setBlock] = useState(0);
  const [enemy, setEnemy] = useState(null);
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  // --- Exploration Logic ---

  const startRun = () => {
    setHp(maxHp); // Full heal on new run (Simplified rogue-lite)
    setDistance(0);
    setCurrentLoot(0);
    setGlobalAmmo(10);
    setGameState(GAME_STATE.EXPLORING);
    addLog("=== 任务开始 ===");
  };

  const generateExplorationCard = () => {
    const r = Math.random();
    // 40% Enemy, 30% Loot, 20% Event/Trap, 10% Nothing
    if (r < 0.4) {
      // Enemy encounter
      const tier = Math.floor(distance / 5) + 1;
      const enemyHp = 20 + (tier * 10);
      const enemyDmg = 5 + (tier * 2);
      
      const newEnemy = {
        name: tier > 2 ? '装甲暴徒' : '变异拾荒者',
        maxHp: enemyHp,
        hp: enemyHp,
        baseDmg: enemyDmg,
        intent: null,
        nextMoveDmg: 0,
        loot: 15 + (tier * 10)
      };
      
      setExplorationCard({ type: 'ENEMY', data: newEnemy });
      addLog(`前方发现敌人：${newEnemy.name}`);
      // Auto enter combat setup, player needs to click "Start Fight"
    } else if (r < 0.7) {
      const val = Math.floor(Math.random() * 20) + 10;
      setExplorationCard({ 
        type: 'LOOT', 
        name: '废弃物资', 
        val: val, 
        desc: `一堆旧时代的电子垃圾。价值 $${val}` 
      });
      addLog("发现了一些值钱的东西。");
    } else if (r < 0.9) {
       setExplorationCard({ 
        type: 'SUPPLY', 
        name: '弹药箱', 
        ammo: 5, 
        desc: `在这个鬼地方，子弹比金子贵。获得 5 发弹药。` 
      });
      addLog("运气不错，是个补给箱。");
    } else {
      setExplorationCard({ type: 'EMPTY', name: '寂静之地', desc: '除了辐射尘埃，什么都没有。' });
      addLog("这片区域很安全...暂时。");
    }
  };

  const nextStep = () => {
    const newDist = distance + 1;
    setDistance(newDist);
    generateExplorationCard();
  };

  // --- Combat Logic (Slay the Spire Style) ---

  const startCombat = (enemyData) => {
    setEnemy(enemyData);
    // Initialize decks
    const shuffled = shuffle([...playerDeck]);
    // Setup initial state immediately
    const firstHand = [];
    const initialDeck = [...shuffled];
    
    // Initial draw logic (simplified for startCombat)
    for(let i=0; i<5; i++) {
        if(initialDeck.length > 0) firstHand.push(initialDeck.pop());
    }

    setCombatDeck(initialDeck);
    setDiscardPile([]);
    setHand(firstHand);
    setBlock(0);
    setEnergy(maxEnergy);
    
    // Set first enemy intent
    const intent = getEnemyIntent(enemyData);
    setEnemy(prev => ({ ...prev, intent: intent }));
    
    setGameState(GAME_STATE.COMBAT);
    addLog("进入战斗状态！");
  };

  const getEnemyIntent = (enemyState) => {
    const r = Math.random();
    if (r < 0.6) return { type: ENEMY_INTENTS.ATTACK, val: enemyState.baseDmg };
    if (r < 0.9) return { type: ENEMY_INTENTS.DEFEND, val: 5 };
    return { type: ENEMY_INTENTS.BUFF, val: 0 }; 
  };

  // This function now strictly handles the "Start of Turn" logic: 
  // 1. Reset energy/block 
  // 2. Set new enemy intent 
  // 3. Draw cards
  const startTurn = (currentDraw, currentDiscard, currentEnemy) => {
    setBlock(0); 
    setEnergy(maxEnergy);
    
    // Determine enemy intent for THIS turn
    const intent = getEnemyIntent(currentEnemy);
    setEnemy(prev => ({ ...prev, intent: intent }));

    // Draw 5 cards
    let newDraw = [...currentDraw];
    let newDiscard = [...currentDiscard];
    let newHand = [];

    for (let i = 0; i < 5; i++) {
      if (newDraw.length === 0) {
        if (newDiscard.length === 0) break; // No cards left
        newDraw = shuffle([...newDiscard]);
        newDiscard = [];
      }
      // Safety check for pop
      const card = newDraw.pop();
      if (card) newHand.push(card);
    }

    setCombatDeck(newDraw);
    setDiscardPile(newDiscard);
    setHand(newHand);
  };

  const playCard = (card, index) => {
    if (energy < card.cost) {
      addLog("能量不足！");
      return;
    }
    if (card.ammoCost && globalAmmo < card.ammoCost) {
      addLog("弹药不足！");
      return;
    }

    // Pay Costs
    setEnergy(prev => prev - card.cost);
    if (card.ammoCost) setGlobalAmmo(prev => prev - card.ammoCost);
    if (card.hpCost) setHp(prev => Math.max(1, prev - card.hpCost));

    // Resolve Effects
    if (card.type === CARD_TYPES.ATTACK) {
      let dmg = card.damage;
      if (card.times) dmg *= card.times; 
      
      const newEnemyHp = enemy.hp - dmg;
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      addLog(`你使用了 ${card.name}，造成 ${dmg} 点伤害。`);
      
      if (newEnemyHp <= 0) {
        setTimeout(() => winCombat(enemy.loot), 500);
        // Remove card from hand immediately to prevent double clicks
        const newHand = [...hand];
        newHand.splice(index, 1);
        setHand(newHand);
        setDiscardPile(prev => [...prev, card]);
        return;
      }
    }

    if (card.block) {
      setBlock(prev => prev + card.block);
    }

    if (card.addAmmo) {
      setGlobalAmmo(prev => prev + card.addAmmo);
    }

    if (card.draw) {
       let newDraw = [...combatDeck];
       let newDiscard = [...discardPile];
       let currentHand = [...hand]; 
       
       for(let i=0; i<card.draw; i++) {
          if(newDraw.length === 0) {
             if(newDiscard.length === 0) break;
             newDraw = shuffle([...newDiscard]);
             newDiscard = [];
          }
          currentHand.push(newDraw.pop());
       }
       setCombatDeck(newDraw);
       setDiscardPile(newDiscard);
       // We don't update hand here directly because we return below? 
       // No, we need to update state to reflect drawn cards.
       // However, the card PLAYED is still in 'hand' state index technically until end of function.
       // Let's rely on standard state update batching.
       // ACTUALLY: The safest way is to push to the local copy 'newHand' which we will set later.
    }

    // Move card from Hand to Discard
    // We re-fetch hand to ensure we have latest (though in this sync function it matches)
    // Important: If we drew cards, we need to be careful.
    // Simplification: Effects happen, then card moves to discard.
    
    const newHand = [...hand];
    newHand.splice(index, 1);
    
    // If draw happened, we should probably handle it more robustly, 
    // but for this prototype, simple separate updates are "okay" but might race.
    // Let's just update hand once.
    
    if (card.draw) {
        // Re-implement draw logic on the spliced hand
       let newDraw = [...combatDeck];
       let newDiscard = [...discardPile];
       
       for(let i=0; i<card.draw; i++) {
          if(newDraw.length === 0) {
             if(newDiscard.length === 0) break;
             newDraw = shuffle([...newDiscard]);
             newDiscard = [];
          }
          const drawn = newDraw.pop();
          if (drawn) newHand.push(drawn);
       }
       setCombatDeck(newDraw);
       setDiscardPile(newDiscard);
    }

    setHand(newHand);
    setDiscardPile(prev => [...prev, card]);
  };

  const endTurn = () => {
    // 1. Resolve Enemy Action
    let currentHp = hp;
    
    if (enemy.intent.type === ENEMY_INTENTS.ATTACK) {
      let dmg = enemy.intent.val;
      // Apply Block
      const unblocked = Math.max(0, dmg - block);
      if (unblocked > 0) {
        currentHp = currentHp - unblocked;
        setHp(currentHp);
        addLog(`敌人攻击！你的格挡抵消了 ${Math.min(dmg, block)} 点，受到 ${unblocked} 点伤害。`);
        
        if (currentHp <= 0) {
          setGameState(GAME_STATE.GAME_OVER);
          return; // Stop turn processing
        }
      } else {
        addLog("你完全格挡了敌人的攻击。");
      }
    } else if (enemy.intent.type === ENEMY_INTENTS.BUFF) {
      addLog("敌人正在咆哮，似乎变得更强了（未实装效果）。");
    } else {
      addLog("敌人正在防御。");
    }

    // 2. Prepare Next Turn State
    // Calculate new discard pile (current discard + current hand)
    const nextDiscard = [...discardPile, ...hand];
    
    // We do NOT set Hand to [] here separately, startTurn will overwrite it.
    // We do NOT set Discard here separately, startTurn will overwrite it.
    
    // 3. Start New Turn
    startTurn(combatDeck, nextDiscard, enemy);
  };

  const winCombat = (lootVal) => {
    // Use passed lootVal or fallback to state
    const val = lootVal || (enemy ? enemy.loot : 0);
    setCurrentLoot(prev => prev + val);
    addLog(`战斗胜利！获得价值 $${val} 的战利品。`);
    setExplorationCard(null); 
    setGameState(GAME_STATE.VICTORY); 
  };

  const resolveVictory = () => {
    setGameState(GAME_STATE.EXPLORING);
    nextStep(); 
  };

  // --- Camp / Shop Logic ---

  const buyCard = (card) => {
    if (money >= 50) {
      setMoney(prev => prev - 50);
      setPlayerDeck(prev => [...prev, { ...card, uid: Math.random() }]);
      addLog(`购买了卡牌: ${card.name}`);
    } else {
      addLog("资金不足。");
    }
  };

  const removeCard = (index) => {
    if (money >= 30) {
      setMoney(prev => prev - 30);
      const newDeck = [...playerDeck];
      const removed = newDeck.splice(index, 1)[0];
      setPlayerDeck(newDeck);
      addLog(`移除了卡牌: ${removed.name}`);
    } else {
      addLog("资金不足。需要 $30 来移除卡牌。");
    }
  };

  const extract = () => {
    setMoney(prev => prev + currentLoot);
    addLog("成功撤离。物资已兑换为信用点。");
    setGameState(GAME_STATE.CAMP);
  };

  // --- Rendering ---

  const renderCard = (card, index, inHand = false) => {
    if (!card) return null;
    let border = "border-zinc-600";
    let bg = "bg-zinc-800";
    if (card.type === CARD_TYPES.ATTACK) { border = "border-red-500"; bg = "bg-zinc-900"; }
    if (card.type === CARD_TYPES.SKILL) { border = "border-blue-500"; bg = "bg-zinc-900"; }

    return (
      <div 
        key={card.uid || index}
        onClick={() => inHand && playCard(card, index)}
        className={`
          relative w-32 h-48 rounded-lg border-2 ${border} ${bg} p-2 flex flex-col justify-between select-none
          ${inHand ? 'cursor-pointer hover:-translate-y-4 hover:shadow-xl transition-transform z-10 hover:z-20 bg-opacity-95' : ''}
        `}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-zinc-300">{card.name}</span>
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow">
            {card.cost}
          </div>
        </div>
        
        <div className="text-center my-2">
          {card.type === CARD_TYPES.ATTACK && <Sword className="w-8 h-8 mx-auto text-red-800 opacity-80" />}
          {card.type === CARD_TYPES.SKILL && <Shield className="w-8 h-8 mx-auto text-blue-800 opacity-80" />}
        </div>

        <div className="text-[10px] text-zinc-400 leading-tight">
          {card.desc}
        </div>

        {card.ammoCost > 0 && (
          <div className="absolute -top-2 -right-2 bg-yellow-600 text-black text-xs px-1.5 rounded font-bold border border-yellow-400">
            -{card.ammoCost} 弹
          </div>
        )}
      </div>
    );
  };

  const renderCombat = () => (
    <div className="w-full h-full flex flex-col relative">
      {/* Top: Enemy Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="text-center animate-bounce-slow">
           <Skull className="w-20 h-20 text-red-500 mb-2 filter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
           <div className="bg-zinc-900/80 px-4 py-1 rounded border border-zinc-700">
             <div className="text-xl font-bold text-red-200">{enemy.name}</div>
             <div className="flex items-center justify-center space-x-2 mt-1">
               <div className="h-2 w-32 bg-zinc-800 rounded overflow-hidden">
                 <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
               </div>
               <span className="text-sm font-mono">{enemy.hp}/{enemy.maxHp}</span>
             </div>
           </div>
        </div>

        {/* Enemy Intent Icon */}
        <div className="absolute top-10 right-10 flex flex-col items-center">
           <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-600 rounded-full flex items-center justify-center mb-1">
             {enemy.intent?.type === ENEMY_INTENTS.ATTACK && <Sword className="w-6 h-6 text-red-400" />}
             {enemy.intent?.type === ENEMY_INTENTS.DEFEND && <Shield className="w-6 h-6 text-blue-400" />}
             {enemy.intent?.type === ENEMY_INTENTS.BUFF && <Zap className="w-6 h-6 text-yellow-400" />}
           </div>
           <span className="text-xs font-bold text-red-400 bg-black/50 px-2 rounded">
             {enemy.intent?.type === ENEMY_INTENTS.ATTACK ? `${enemy.intent.val} 伤害` : '意图未知'}
           </span>
        </div>
      </div>

      {/* Middle: Player Status */}
      <div className="h-12 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(37,99,235,0.8)]">
            {energy}/{maxEnergy}
          </div>
          <span className="text-xs text-blue-300">能量</span>
        </div>
        
        {block > 0 && (
          <div className="flex items-center space-x-1 animate-in zoom-in">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold text-cyan-400">{block}</span>
          </div>
        )}
      </div>

      {/* Bottom: Hand */}
      {/* Added pointer-events-none to container and pointer-events-auto to cards to prevent container blocking clicks */}
      <div className="h-60 flex items-end justify-center space-x-2 pb-4 px-4 overflow-visible z-10 pointer-events-none">
        <div className="flex items-end justify-center space-x-2 pointer-events-auto">
           {hand.map((card, i) => renderCard(card, i, true))}
        </div>
      </div>

      {/* Decks Info */}
      <div className="absolute bottom-4 left-4 text-xs text-zinc-500 font-mono">
        <div className="flex items-center gap-1"><RefreshCcw className="w-3 h-3"/> 牌堆: {combatDeck.length}</div>
        <div className="flex items-center gap-1"><Trash2 className="w-3 h-3"/> 弃牌: {discardPile.length}</div>
      </div>

      <button 
        onClick={endTurn}
        className="absolute bottom-32 right-4 px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg border border-red-500 z-20"
      >
        结束回合
      </button>
    </div>
  );

  const renderCamp = () => (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">幸存者营地</h2>
        <div className="text-amber-400 font-mono text-xl">${money}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Market */}
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5"/> 黑市卡牌 ($50)
          </h3>
          <div className="grid grid-cols-2 gap-2">
             {CARD_LIBRARY.map(card => (
               <button 
                 key={card.id}
                 onClick={() => buyCard(card)}
                 className="p-2 bg-black border border-zinc-700 rounded text-left hover:bg-zinc-800 transition flex flex-col"
               >
                 <span className="font-bold text-zinc-200 text-sm">{card.name}</span>
                 <span className="text-[10px] text-zinc-500">{card.desc}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Deck Management */}
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <Hammer className="w-5 h-5"/> 卡组整备 (移除: $30)
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
             {playerDeck.map((card, i) => (
               <div key={i} className="flex justify-between items-center p-2 bg-black/50 rounded border border-zinc-800">
                 <span className="text-sm text-zinc-300">{card.name}</span>
                 <button 
                   onClick={() => removeCard(i)}
                   className="text-red-500 hover:text-red-400 text-xs px-2 py-1 bg-red-950/30 rounded border border-red-900/50"
                 >
                   移除
                 </button>
               </div>
             ))}
          </div>
          <div className="mt-4 text-xs text-zinc-500 text-center">当前卡组总数: {playerDeck.length}</div>
        </div>
      </div>

      <button 
        onClick={startRun}
        className="w-full mt-8 py-4 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg text-lg flex items-center justify-center gap-2 shadow-lg"
      >
        <Footprints /> 出发探索
      </button>
    </div>
  );

  return (
    <div className="w-full h-screen bg-black text-zinc-200 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex overflow-hidden">
        
        {/* Left Sidebar: Stats & Logs */}
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900">
            <h1 className="text-xl font-bold text-zinc-100 tracking-wider mb-4">WASTELAND</h1>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-red-400"><Heart className="w-4 h-4"/> HP</span>
                <span>{hp}/{maxHp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-yellow-400"><Crosshair className="w-4 h-4"/> 弹药</span>
                <span>{globalAmmo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-amber-400"><ShoppingBag className="w-4 h-4"/> 背包</span>
                <span>${currentLoot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-zinc-400"><Footprints className="w-4 h-4"/> 距离</span>
                <span>{distance}km</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-mono scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className="text-zinc-500 border-l border-zinc-700 pl-2 py-1">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 relative bg-black/50">
          {/* Menu */}
          {gameState === GAME_STATE.MENU && (
             <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <h1 className="text-5xl font-bold text-white mb-2">废土构筑</h1>
                <p className="text-zinc-400">搜寻物资 · 构筑卡组 · 活着回来</p>
                <button 
                  onClick={() => setGameState(GAME_STATE.CAMP)}
                  className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition"
                >
                  进入营地
                </button>
             </div>
          )}

          {/* Exploration */}
          {gameState === GAME_STATE.EXPLORING && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {!explorationCard ? (
                <button 
                  onClick={nextStep}
                  className="px-8 py-4 bg-zinc-800 border-2 border-zinc-600 rounded-lg hover:bg-zinc-700 transition flex flex-col items-center gap-2 group"
                >
                  <Search className="w-8 h-8 group-hover:scale-110 transition-transform"/>
                  <span className="font-bold">向前探索</span>
                </button>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className={`
                    w-64 h-80 rounded-xl border-4 flex flex-col items-center justify-between p-6 bg-zinc-900 shadow-2xl mb-6
                    ${explorationCard.type === 'ENEMY' ? 'border-red-600' : 'border-zinc-600'}
                  `}>
                    <div className="text-xl font-bold">{explorationCard.data?.name || explorationCard.name}</div>
                    <div className="text-center text-zinc-400 text-sm my-4">{explorationCard.desc || explorationCard.data?.desc}</div>
                    
                    {explorationCard.type === 'ENEMY' ? (
                       <Skull className="w-16 h-16 text-red-500 animate-pulse"/>
                    ) : (
                       <ShoppingBag className="w-16 h-16 text-amber-500"/>
                    )}

                    <div className="w-full">
                       {explorationCard.type === 'ENEMY' && (
                         <div className="text-center text-red-400 font-mono text-sm">HP: {explorationCard.data.hp}</div>
                       )}
                    </div>
                  </div>

                  {explorationCard.type === 'ENEMY' ? (
                    <button 
                      onClick={() => startCombat(explorationCard.data)}
                      className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg animate-pulse"
                    >
                      战斗开始
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                         onClick={() => {
                           if (explorationCard.val) setCurrentLoot(p => p + explorationCard.val);
                           if (explorationCard.ammo) setGlobalAmmo(p => p + explorationCard.ammo);
                           setExplorationCard(null);
                           addLog("资源已收集。");
                         }}
                         className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
                      >
                        收集并继续
                      </button>
                      <button 
                        onClick={extract}
                        className="px-6 py-2 bg-green-800 hover:bg-green-700 text-green-100 rounded border border-green-600"
                      >
                        撤离
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Combat */}
          {gameState === GAME_STATE.COMBAT && renderCombat()}

          {/* Victory Screen */}
          {gameState === GAME_STATE.VICTORY && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 z-50">
               <h2 className="text-4xl font-bold text-yellow-400 mb-4">胜利!</h2>
               <div className="text-zinc-300 mb-8">敌人已消灭，区域安全。</div>
               <div className="flex gap-4">
                 <button onClick={resolveVictory} className="px-6 py-3 bg-zinc-200 text-black font-bold rounded hover:bg-white">
                   搜刮并继续
                 </button>
                 <button onClick={extract} className="px-6 py-3 bg-green-700 text-white font-bold rounded hover:bg-green-600">
                   现在撤离
                 </button>
               </div>
            </div>
          )}

          {/* Game Over */}
          {gameState === GAME_STATE.GAME_OVER && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/20 z-50">
               <Skull className="w-24 h-24 text-red-600 mb-4"/>
               <h2 className="text-4xl font-bold text-red-500 mb-4">你死了</h2>
               <p className="text-zinc-400 mb-8">所有的努力都化为了废土上的尘埃。</p>
               <button 
                 onClick={() => setGameState(GAME_STATE.MENU)}
                 className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-white"
               >
                 重新开始
               </button>
            </div>
          )}

          {/* Camp */}
          {gameState === GAME_STATE.CAMP && renderCamp()}

        </div>
      </div>
    </div>
  );
}