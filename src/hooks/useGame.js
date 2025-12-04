import { useState } from 'react';
import { shuffle } from '../utils/gameUtils';
import { GAME_STATE, CARD_TYPES, ENEMY_INTENTS, INITIAL_DECK } from '../constants/gameData';

export const useGame = () => {
  // Global State
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [logs, setLogs] = useState(["系统启动... 连接至战术终端。"]);
  
  // Player Data
  const [money, setMoney] = useState(100);
  const [playerDeck, setPlayerDeck] = useState([...INITIAL_DECK]);
  const [playerModules, setPlayerModules] = useState([]);
  const [maxHp] = useState(80);
  const [hp, setHp] = useState(80);
  const [globalAmmo, setGlobalAmmo] = useState(10);
  
  // Exploration Data
  const [distance, setDistance] = useState(0);
  const [currentLoot, setCurrentLoot] = useState(0);
  const [explorationCard, setExplorationCard] = useState(null);

  // Combat Data
  const [combatDeck, setCombatDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [energy, setEnergy] = useState(3);
  const [maxEnergy] = useState(3);
  const [block, setBlock] = useState(0);
  const [enemy, setEnemy] = useState(null);

  // --- Logic Helpers ---
  const addLog = (msg) => setLogs(prev => [...prev, msg]);
  const hasModule = (id) => playerModules.some(m => m.id === id);

  const triggerModules = (triggerType, payload = {}) => {
    let effects = {};
    playerModules.forEach(mod => {
      if (mod.trigger === triggerType) {
        switch (mod.id) {
          case 'auto_loader':
            setGlobalAmmo(prev => prev + 2);
            addLog(`[模块] 自动装填机：补充 2 发弹药。`);
            break;
          case 'nano_vest':
            setBlock(prev => prev + 3);
            addLog(`[模块] 纳米背心：获得 3 点格挡。`);
            break;
          case 'scavenger':
            if (payload.money) effects.moneyMultiplier = 1.25;
            break;
          case 'vampire':
             setHp(prev => Math.min(maxHp, prev + 1));
             addLog(`[模块] 吸血鬼芯片：回复 1 点生命。`);
             break;
          default: break;
        }
      }
    });
    return effects;
  };

  // --- Actions ---

  const startRun = () => {
    setHp(maxHp); 
    setDistance(0);
    setCurrentLoot(0);
    setGlobalAmmo(10);
    setGameState(GAME_STATE.EXPLORING);
    addLog("=== 任务开始 ===");
  };

  const nextStep = () => {
    const newDist = distance + 1;
    setDistance(newDist);
    
    const r = Math.random();
    const difficultyMod = Math.floor(newDist / 5);

    if (r < 0.45) {
      const isElite = newDist > 5 && Math.random() < 0.2;
      const baseHp = 20 + (difficultyMod * 10);
      const baseDmg = 5 + (difficultyMod * 2);
      
      const newEnemy = {
        name: isElite ? `精英·${difficultyMod > 2 ? '暴君' : '处刑者'}` : (difficultyMod > 2 ? '重装暴徒' : '变异拾荒者'),
        maxHp: isElite ? baseHp * 1.5 : baseHp,
        hp: isElite ? baseHp * 1.5 : baseHp,
        baseDmg: isElite ? baseDmg + 2 : baseDmg,
        isElite: isElite,
        intent: null,
        loot: (15 + (difficultyMod * 5)) * (isElite ? 2 : 1)
      };
      
      setExplorationCard({ type: 'ENEMY', data: newEnemy });
      addLog(`警告：发现${isElite ? '【精英】' : ''}敌对目标：${newEnemy.name}`);
    } else if (r < 0.75) {
      const val = Math.floor(Math.random() * 20) + 10 + (difficultyMod * 5);
      setExplorationCard({ 
        type: 'LOOT', 
        name: '物资箱', 
        val: val, 
        desc: `发现一个被遗弃的补给点。预估价值 $${val}` 
      });
      addLog("发现物资。");
    } else if (r < 0.9) {
       setExplorationCard({ 
        type: 'SUPPLY', 
        name: '弹药堆', 
        ammo: 4, 
        desc: `散落的弹药箱。获得 4 发弹药。` 
      });
      addLog("发现弹药补给。");
    } else {
      setExplorationCard({ type: 'EMPTY', name: '安全区', desc: '雷达显示这片区域暂时安全。' });
      addLog("区域安全。");
    }
  };

  const collectLoot = () => {
    if (!explorationCard) return;
    if (explorationCard.val) setCurrentLoot(p => p + explorationCard.val);
    if (explorationCard.ammo) setGlobalAmmo(p => p + explorationCard.ammo);
    setExplorationCard(null);
    addLog("资源已获取。");
  };

  const extract = () => {
    setMoney(prev => prev + currentLoot);
    addLog("撤离成功。物资已结算。");
    setGameState(GAME_STATE.CAMP);
  };

  // Combat Helpers
  const getEnemyIntent = (enemyState) => {
    const r = Math.random();
    if (r < 0.6) return { type: ENEMY_INTENTS.ATTACK, val: enemyState.baseDmg };
    if (r < 0.9) return { type: ENEMY_INTENTS.DEFEND, val: 5 + Math.floor(enemyState.maxHp * 0.1) };
    return { type: ENEMY_INTENTS.BUFF, val: 0 }; 
  };

  const startTurn = (currentDraw, currentDiscard, currentEnemy) => {
    setBlock(0); 
    setEnergy(maxEnergy);
    triggerModules('TURN_START');
    const intent = getEnemyIntent(currentEnemy);
    setEnemy(prev => ({ ...prev, intent: intent }));

    let newDraw = [...currentDraw];
    let newDiscard = [...currentDiscard];
    let newHand = [];

    for (let i = 0; i < 5; i++) {
      if (newDraw.length === 0) {
        if (newDiscard.length === 0) break;
        newDraw = shuffle([...newDiscard]);
        newDiscard = [];
      }
      const card = newDraw.pop();
      if (card) newHand.push(card);
    }
    setCombatDeck(newDraw);
    setDiscardPile(newDiscard);
    setHand(newHand);
  };

  const startCombat = (enemyData) => {
    setEnemy(enemyData);
    const shuffled = shuffle([...playerDeck]);
    setCombatDeck(shuffled);
    setDiscardPile([]);
    setHand([]);
    setBlock(0);
    setEnergy(maxEnergy);
    setGameState(GAME_STATE.COMBAT);
    addLog("--- 战斗模式启动 ---");
    triggerModules('COMBAT_START');
    startTurn(shuffled, [], enemyData);
  };

  const playCard = (card, index) => {
    if (energy < card.cost) return addLog("能量不足！");
    if (card.ammoCost && globalAmmo < card.ammoCost) return addLog("弹药不足！");

    setEnergy(prev => prev - card.cost);
    if (card.ammoCost) setGlobalAmmo(prev => prev - card.ammoCost);
    if (card.hpCost) {
       setHp(prev => Math.max(1, prev - card.hpCost));
       if (hasModule('vampire')) triggerModules('vampire');
    }

    let damageMult = 1;
    if (hasModule('stim_injector') && hp < maxHp * 0.3) damageMult = 1.5;

    // Resolve Effects
    if (card.type === CARD_TYPES.ATTACK) {
      let dmg = Math.floor(card.damage * damageMult);
      if (card.id === 'execute' && enemy.hp < enemy.maxHp * 0.5) {
        dmg *= 2;
        addLog("处决效果触发！双倍伤害！");
      }

      const hits = card.times || 1;
      let totalDmg = dmg * hits;
      const newEnemyHp = enemy.hp - totalDmg;
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      addLog(`你使用了 ${card.name}，造成 ${dmg}${hits > 1 ? `x${hits}` : ''} 伤害。`);
      
      if (newEnemyHp <= 0) {
         // Handle Win Flow
         const newHand = [...hand];
         newHand.splice(index, 1);
         setHand(newHand);
         setDiscardPile(prev => [...prev, card]);
         setTimeout(() => {
            let lootVal = enemy.loot;
            const modEffects = triggerModules('PASSIVE', { money: true });
            if (modEffects.moneyMultiplier) lootVal = Math.floor(lootVal * modEffects.moneyMultiplier);
            setCurrentLoot(prev => prev + lootVal);
            addLog(`威胁消除。获得 $${lootVal}。`);
            setExplorationCard(null); 
            setGameState(GAME_STATE.VICTORY); 
         }, 500);
         return;
      }
    }

    if (card.block) setBlock(prev => prev + card.block);
    if (card.addAmmo) setGlobalAmmo(prev => prev + card.addAmmo);

    if (card.draw) {
       let newDraw = [...combatDeck];
       let newDiscard = [...discardPile];
       for(let i=0; i<card.draw; i++) {
          if(newDraw.length === 0) {
             if(newDiscard.length === 0) break;
             newDraw = shuffle([...newDiscard]);
             newDiscard = [];
          }
          const drawn = newDraw.pop();
          if (drawn) setHand(prev => [...prev, drawn]);
       }
       setCombatDeck(newDraw);
       setDiscardPile(newDiscard);
    }

    const newHand = [...hand];
    newHand.splice(index, 1);
    setHand(newHand);
    setDiscardPile(prev => [...prev, card]);
  };

  const endTurn = () => {
    let currentHp = hp;
    if (enemy.intent.type === ENEMY_INTENTS.ATTACK) {
      let dmg = enemy.intent.val;
      const unblocked = Math.max(0, dmg - block);
      if (unblocked > 0) {
        currentHp = currentHp - unblocked;
        setHp(currentHp);
        addLog(`受到 ${unblocked} 点伤害！`);
        if (currentHp <= 0) return setGameState(GAME_STATE.GAME_OVER);
      } else {
        addLog("格挡了所有伤害。");
      }
    } else if (enemy.intent.type === ENEMY_INTENTS.DEFEND) {
        addLog("敌人正在调整防御架势。");
    } else {
      addLog("敌人正在咆哮。");
    }
    const nextDiscard = [...discardPile, ...hand];
    startTurn(combatDeck, nextDiscard, enemy);
  };

  const buyItem = (item, type) => {
    if (money >= item.price) {
      setMoney(prev => prev - item.price);
      if (type === 'CARD') {
          setPlayerDeck(prev => [...prev, { ...item, uid: Math.random() }]);
          addLog(`购买卡牌: ${item.name}`);
      } else if (type === 'MODULE') {
          setPlayerModules(prev => [...prev, item]);
          addLog(`安装模块: ${item.name}`);
      }
    } else {
      addLog("资金不足。");
    }
  };

  const removeCard = () => {
    if (money >= 50) {
      if (playerDeck.length <= 0) return;
      setMoney(prev => prev - 50);
      const index = Math.floor(Math.random() * playerDeck.length);
      const newDeck = [...playerDeck];
      const removed = newDeck.splice(index, 1)[0];
      setPlayerDeck(newDeck);
      addLog(`随机移除卡牌: ${removed.name}`);
    } else {
      addLog("需要 $50 来移除卡牌。");
    }
  };

  const resolveVictory = () => {
    setGameState(GAME_STATE.EXPLORING);
    nextStep();
  };

  return {
    state: { gameState, logs, money, playerDeck, playerModules, maxHp, hp, globalAmmo, distance, currentLoot, explorationCard, combatDeck, hand, discardPile, energy, block, enemy },
    actions: { setGameState, startRun, nextStep, collectLoot, extract, startCombat, playCard, endTurn, buyItem, removeCard, resolveVictory }
  };
};