import { useState } from 'react';
import { shuffle } from '../utils/gameUtils';
import { DataManager } from '../services/DataManager';
// 修正 Import：添加 LOOT_TABLE
import { GAME_STATE, CARD_TYPES, ENEMY_INTENTS, STATUS_TYPES, LOOT_TABLE } from '../constants/gameData';

export const useGame = () => {
  // Global State
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [logs, setLogs] = useState(["系统启动... 连接至战术终端。"]);
  
  // Player Data
  const [money, setMoney] = useState(100);
  const [playerDeck, setPlayerDeck] = useState(DataManager.getInitialDeck());
  const [playerModules, setPlayerModules] = useState([]);
  const [maxHp, setMaxHp] = useState(80);
  const [hp, setHp] = useState(80);
  const [globalAmmo, setGlobalAmmo] = useState(10);
  
  // Exploration Data
  const [distance, setDistance] = useState(0);
  // 修正：战利品必须初始化为空数组，而非数字
  const [currentLoot, setCurrentLoot] = useState([]);
  const [explorationCard, setExplorationCard] = useState(null);
  const [mapOptions, setMapOptions] = useState([]);

  // Combat Data
  const [combatDeck, setCombatDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [energy, setEnergy] = useState(3);
  const [maxEnergy] = useState(3);
  const [block, setBlock] = useState(0);
  const [enemy, setEnemy] = useState(null);
  const [enemyStatus, setEnemyStatus] = useState({});
  const [turnCount, setTurnCount] = useState(0);

  // --- Helpers ---
  const addLog = (msg) => setLogs(prev => [...prev, msg]);
  const hasModule = (id) => playerModules.some(m => m.id === id);

  const applyEnemyStatus = (type, value) => {
    setEnemyStatus(prev => {
      const currentVal = prev[type] || 0;
      const newVal = (type === STATUS_TYPES.LOCK_ON || type === STATUS_TYPES.STUN) ? 1 : currentVal + value;
      return { ...prev, [type]: newVal };
    });
    const nameMap = { [STATUS_TYPES.RADIATION]: '辐射', [STATUS_TYPES.LOCK_ON]: '锁定', [STATUS_TYPES.STUN]: '眩晕' };
    addLog(`敌人获得 [${nameMap[type] || type}]`);
  };

  const triggerModules = (triggerType, payload = {}) => {
    let effects = {};
    playerModules.forEach(mod => {
      if (mod.trigger === triggerType) {
        switch (mod.id) {
          case 'auto_loader': setGlobalAmmo(prev => prev + 2); addLog(`[模块] 自动装填机生效。`); break;
          case 'nano_vest': setBlock(prev => prev + 3); addLog(`[模块] 纳米背心生效。`); break;
          case 'scavenger': if (payload.money) effects.moneyMultiplier = 1.25; break;
          case 'vampire': setHp(prev => Math.min(maxHp, prev + 1)); addLog(`[吸血] 回复 1 生命。`); break;
          default: break;
        }
      }
    });
    return effects;
  };

  // --- AI Logic ---
  const getEnemyIntent = (enemyState, turn) => {
    if (enemyStatus[STATUS_TYPES.STUN] > 0) return { type: ENEMY_INTENTS.SLEEP, val: 0 };

    switch (enemyState.id) {
      case 'sniper':
        if (turn % 2 === 0) return { type: ENEMY_INTENTS.DEBUFF, val: 0, desc: '瞄准' };
        return { type: ENEMY_INTENTS.ATTACK, val: 25 }; 
      case 'loot_goblin':
        if (turn >= 2) return { type: ENEMY_INTENTS.ESCAPE, val: 0 };
        return { type: ENEMY_INTENTS.ATTACK, val: 5, desc: '偷窃' };
      case 'rad_roach':
        return { type: ENEMY_INTENTS.ATTACK, val: 5 + (turn * 2) };
      default:
        const r = Math.random();
        if (r < 0.6) return { type: ENEMY_INTENTS.ATTACK, val: enemyState.baseDmg };
        if (r < 0.9) return { type: ENEMY_INTENTS.DEFEND, val: 5 + Math.floor(enemyState.maxHp * 0.1) };
        return { type: ENEMY_INTENTS.BUFF, val: 0 };
    }
  };

  // --- Map Logic ---
  const generateMapOptions = (dist) => {
    const opts = [];
    // 修正：使用 DataManager 获取地点类型列表
    const types = DataManager.getLocationTypeList();
    
    // 安全检查，防止数据未加载导致崩溃
    if (!types || types.length === 0) return [];

    const count = 2 + (dist > 3 ? 1 : 0);
    for(let i=0; i<count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      opts.push({ ...type, uid: Math.random() });
    }
    return opts;
  };

  const startRun = () => {
    setHp(maxHp); 
    setDistance(0);
    setCurrentLoot([]);
    setGlobalAmmo(10);
    const opts = generateMapOptions(1);
    setMapOptions(opts);
    setGameState(GAME_STATE.MAP_SELECT); 
    addLog("=== 任务开始 ===");
    addLog("请选择前进路线...");
  };

  const createEnemy = (dist, forceId = null, isElite = false) => {
    const difficulty = Math.floor(dist / 5);
    let id = forceId;
    if (!id) {
       const pool = ['scavenger', 'guard'];
       if (dist > 3) pool.push('sniper');
       if (dist > 5) pool.push('heavy');
       id = pool[Math.floor(Math.random() * pool.length)];
    }
    // 修正：使用 DataManager 获取敌人数据
    const templates = DataManager.getEnemyTemplates();
    const t = templates[id] || templates['scavenger'];
    
    return {
      type: 'ENEMY',
      data: {
        id: id,
        name: (isElite ? '精英·' : '') + t.name,
        maxHp: Math.floor(t.hp * (1 + difficulty * 0.2) * (isElite ? 1.5 : 1)),
        hp: Math.floor(t.hp * (1 + difficulty * 0.2) * (isElite ? 1.5 : 1)),
        baseDmg: t.dmg + difficulty,
        isElite: isElite,
        loot: t.loot * (isElite ? 2 : 1),
        intent: null
      }
    };
  };

  const selectMapNode = (nodeType) => {
    const newDist = distance + 1;
    setDistance(newDist);
    const r = Math.random();
    let card = null;

    // 战利品随机生成
    const getRandomLoot = (rarityBonus = 0) => {
       const r = Math.random() + rarityBonus;
       let pool = LOOT_TABLE.filter(i => i.rarity === 'COMMON');
       if (r > 0.6) pool = LOOT_TABLE.filter(i => i.rarity === 'RARE');
       if (r > 0.85) pool = LOOT_TABLE.filter(i => i.rarity === 'EPIC');
       if (r > 0.95) pool = LOOT_TABLE.filter(i => i.rarity === 'LEGENDARY');
       return pool[Math.floor(Math.random() * pool.length)] || pool[0];
    };

    if (nodeType.id === 'ARSENAL') {
      if (r < 0.6) card = { type: 'SUPPLY', name: '重型弹药箱', ammo: 8, desc: '军火库里的高级货。' };
      else card = createEnemy(newDist, 'sniper'); 
    }
    else if (nodeType.id === 'RAD_ZONE') {
      if (r < 0.7) card = createEnemy(newDist, 'rad_roach', true);
      else {
         const item = getRandomLoot(0.3);
         card = { type: 'LOOT', data: item };
      }
    }
    else if (nodeType.id === 'SUPPLY_DEPOT') {
       if (r < 0.5) card = createEnemy(newDist, 'loot_goblin');
       else {
         const item = getRandomLoot(0.1); 
         card = { type: 'LOOT', data: item };
       }
    }
    else {
      if (r < 0.5) card = createEnemy(newDist);
      else {
         const item = getRandomLoot(0);
         card = { type: 'LOOT', data: item };
      }
    }
    setExplorationCard(card);
    setGameState(GAME_STATE.EXPLORING);
  };

  const collectLoot = () => {
    if (!explorationCard) return;
    if (explorationCard.ammo) {
        setGlobalAmmo(p => p + explorationCard.ammo);
        addLog(`获得弹药 x${explorationCard.ammo}`);
    }
    if (explorationCard.type === 'LOOT' && explorationCard.data) {
        const item = explorationCard.data;
        setCurrentLoot(prev => [...prev, item]);
        addLog(`获得物品: ${item.name}`);
    }
    setExplorationCard(null);
    const opts = generateMapOptions(distance);
    setMapOptions(opts);
    setGameState(GAME_STATE.MAP_SELECT);
  };

  const startCombat = (enemyData) => {
    setEnemy(enemyData);
    setEnemyStatus({});
    setTurnCount(0);
    const shuffled = shuffle([...playerDeck]);
    setCombatDeck(shuffled);
    setDiscardPile([]);
    setHand([]);
    setBlock(0);
    setEnergy(maxEnergy);
    setGameState(GAME_STATE.COMBAT);
    addLog(`遭遇敌人：${enemyData.name}`);
    triggerModules('COMBAT_START');
    startTurn(shuffled, [], enemyData, 0);
  };

  const startTurn = (currentDraw, currentDiscard, currentEnemy, turn) => {
    setBlock(0); 
    setEnergy(maxEnergy);
    setTurnCount(turn);
    if (enemyStatus[STATUS_TYPES.STUN] > 0) {
       setEnemyStatus(prev => ({ ...prev, [STATUS_TYPES.STUN]: 0 }));
       addLog("敌人从眩晕中恢复了。");
    }
    triggerModules('TURN_START');
    const intent = getEnemyIntent(currentEnemy, turn);
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
    if (enemyStatus[STATUS_TYPES.LOCK_ON] > 0) damageMult *= 1.5;
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
      const extraMsg = enemyStatus[STATUS_TYPES.LOCK_ON] > 0 ? '(锁定)' : '';
      addLog(`使用 ${card.name}，造成 ${dmg}${hits > 1 ? `x${hits}` : ''} ${extraMsg} 伤害。`);
      if (newEnemyHp <= 0) {
         handleWinLogic(card, index);
         return;
      }
    }
    if (card.applyStatus) applyEnemyStatus(card.applyStatus.type, card.applyStatus.val);
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

  const handleWinLogic = (lastCard, lastIndex) => {
    const newHand = [...hand];
    newHand.splice(lastIndex, 1);
    setHand(newHand);
    setDiscardPile(prev => [...prev, lastCard]);
    setTimeout(() => {
       resolveVictory();
    }, 500);
  };

  const endTurn = () => {
    let currentEnemyHp = enemy.hp;
    if (enemyStatus[STATUS_TYPES.RADIATION] > 0) {
      const dmg = enemyStatus[STATUS_TYPES.RADIATION];
      currentEnemyHp -= dmg;
      addLog(`[辐射] 造成 ${dmg} 点伤害`);
      setEnemyStatus(prev => ({ ...prev, [STATUS_TYPES.RADIATION]: Math.max(0, prev[STATUS_TYPES.RADIATION] - 1) }));
    }
    if (enemyStatus[STATUS_TYPES.LOCK_ON]) setEnemyStatus(prev => ({ ...prev, [STATUS_TYPES.LOCK_ON]: 0 }));
    if (currentEnemyHp <= 0) {
       resolveVictory();
       return;
    }
    setEnemy(prev => ({...prev, hp: currentEnemyHp}));
    const intent = enemy.intent;
    let currentHp = hp;
    if (intent.type === ENEMY_INTENTS.ATTACK) {
       const dmg = intent.val;
       const unblocked = Math.max(0, dmg - block);
       if (enemy.id === 'loot_goblin' && unblocked > 0) {
          if (currentLoot.length > 0) {
             const lostItem = currentLoot[0];
             setCurrentLoot(prev => prev.slice(1));
             addLog(`窃贼偷走了你的 [${lostItem.name}]！`);
          } else {
             addLog(`窃贼没偷到东西，狠狠地踹了你一脚。`);
          }
       }
       if (unblocked > 0) {
         currentHp -= unblocked;
         setHp(currentHp);
         addLog(`受到 ${unblocked} 点伤害！`);
       } else {
         addLog("格挡了所有伤害。");
       }
    } 
    else if (intent.type === ENEMY_INTENTS.CHARGE) addLog("敌人正在蓄力！");
    else if (intent.type === ENEMY_INTENTS.DEBUFF) {
       addLog("危险！你被锁定了！下一发攻击将是致命的。");
    }
    else if (intent.type === ENEMY_INTENTS.ESCAPE) {
       addLog("敌人逃跑了！");
       const opts = generateMapOptions(distance);
       setMapOptions(opts);
       setGameState(GAME_STATE.MAP_SELECT);
       return;
    }
    else if (intent.type === ENEMY_INTENTS.SLEEP) addLog("敌人因眩晕无法行动。");

    if (currentHp <= 0) {
       setGameState(GAME_STATE.GAME_OVER);
       return;
    }
    const nextDiscard = [...discardPile, ...hand];
    startTurn(combatDeck, nextDiscard, enemy, turnCount + 1);
  };

  const resolveVictory = () => {
    let lootVal = enemy.loot;
    const modEffects = triggerModules('PASSIVE', { money: true });
    if (modEffects.moneyMultiplier) lootVal = Math.floor(lootVal * modEffects.moneyMultiplier);
    
    const scrapItem = { id: 'scrap_battle', name: '战斗残骸', rarity: 'COMMON', value: lootVal, desc: '战斗所得。', effect: null };
    setCurrentLoot(prev => [...prev, scrapItem]);
    
    addLog(`威胁消除。搜刮到 [${scrapItem.name}] (价值 $${lootVal})。`);
    setExplorationCard(null); 
    setGameState(GAME_STATE.VICTORY);
  };

  const handleVictoryContinue = () => {
    const opts = generateMapOptions(distance);
    setMapOptions(opts);
    setGameState(GAME_STATE.MAP_SELECT);
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

  const extract = () => {
    let totalValue = 0;
    currentLoot.forEach(item => {
        totalValue += item.value;
        if (item.effect) {
            if (item.effect.type === 'HEAL') {
                setHp(prev => Math.min(maxHp, prev + item.effect.val));
                addLog(`[${item.name}] 让你回复了 ${item.effect.val} 生命。`);
            }
            if (item.effect.type === 'MAX_HP') {
                setMaxHp(prev => prev + item.effect.val);
                setHp(prev => prev + item.effect.val);
                addLog(`[${item.name}] 提升了 ${item.effect.val} 点生命上限！`);
            }
        }
    });
    setMoney(prev => prev + totalValue);
    addLog(`撤离成功！物资折算价值 $${totalValue}。`);
    setCurrentLoot([]);
    setGameState(GAME_STATE.CAMP);
  };

  return {
    state: { gameState, logs, money, playerDeck, playerModules, maxHp, hp, globalAmmo, distance, currentLoot, explorationCard, combatDeck, hand, discardPile, energy, block, enemy, enemyStatus, mapOptions },
    actions: { setGameState, startRun, selectMapNode, collectLoot, extract, startCombat, playCard, endTurn, buyItem, removeCard, resolveVictory: handleVictoryContinue }
  };
};