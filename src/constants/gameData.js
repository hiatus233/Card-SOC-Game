export const GAME_STATE = {
  MENU: 'MENU',
  EXPLORING: 'EXPLORING',
  COMBAT: 'COMBAT',
  LOOTING: 'LOOTING',
  CAMP: 'CAMP',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

export const CARD_TYPES = {
  ATTACK: 'ATTACK',
  SKILL: 'SKILL',
  POWER: 'POWER'
};

export const ENEMY_INTENTS = {
  ATTACK: 'ATTACK',
  DEFEND: 'DEFEND',
  BUFF: 'BUFF',
  DEBUFF: 'DEBUFF'
};

export const MODULE_LIBRARY = [
  { id: 'auto_loader', name: '自动装填机', price: 120, desc: '战斗开始时，获得 2 发弹药。', trigger: 'COMBAT_START' },
  { id: 'nano_vest', name: '纳米背心', price: 100, desc: '每回合开始时，获得 3 点格挡。', trigger: 'TURN_START' },
  { id: 'scavenger', name: '回收协议', price: 80, desc: '战斗胜利获得的金钱增加 25%。', trigger: 'PASSIVE' },
  { id: 'vampire', name: '吸血鬼芯片', price: 150, desc: '每打出一张耗血卡牌，回复 1 点生命。', trigger: 'ON_HP_COST' },
  { id: 'stim_injector', name: '肾上腺素', price: 110, desc: '当生命值低于 30% 时，造成伤害 +50%。', trigger: 'PASSIVE_DMG' },
];

export const CARD_LIBRARY = [
  // 基础卡
  { id: 'shoot', name: '点射', type: CARD_TYPES.ATTACK, cost: 1, damage: 6, ammoCost: 1, desc: '造成 6 点伤害。消耗 1 发弹药。', price: 50 },
  { id: 'slash', name: '匕首挥砍', type: CARD_TYPES.ATTACK, cost: 1, damage: 5, ammoCost: 0, desc: '造成 5 点伤害。', price: 50 },
  { id: 'defend', name: '寻找掩体', type: CARD_TYPES.SKILL, cost: 1, block: 5, desc: '获得 5 点格挡。', price: 50 },
  { id: 'aim', name: '瞄准', type: CARD_TYPES.SKILL, cost: 0, draw: 2, desc: '抽 2 张牌。', price: 50 },
  { id: 'reload', name: '快速装填', type: CARD_TYPES.SKILL, cost: 1, addAmmo: 3, block: 3, desc: '获得 3 发弹药和 3 点格挡。', price: 75 },
  // 商店进阶卡
  { id: 'burst', name: '全自动扫射', type: CARD_TYPES.ATTACK, cost: 2, damage: 4, times: 3, ammoCost: 3, desc: '造成 3 次 4 点伤害。消耗 3 发弹药。', price: 75 },
  { id: 'stimpack', name: '兴奋剂', type: CARD_TYPES.SKILL, cost: 0, energy: 2, hpCost: 3, desc: '失去 3 点生命，获得 2 点能量。', price: 75 },
  { id: 'smash', name: '枪托重击', type: CARD_TYPES.ATTACK, cost: 2, damage: 12, ammoCost: 0, desc: '造成 12 点伤害。', price: 75 },
  { id: 'execute', name: '处决', type: CARD_TYPES.ATTACK, cost: 2, damage: 20, ammoCost: 2, desc: '造成 20 点伤害。如果在敌人半血以下使用，造成双倍伤害。', price: 75 },
];

export const INITIAL_DECK = [
  { ...CARD_LIBRARY.find(c => c.id === 'shoot'), uid: 1 },
  { ...CARD_LIBRARY.find(c => c.id === 'shoot'), uid: 2 },
  { ...CARD_LIBRARY.find(c => c.id === 'slash'), uid: 3 },
  { ...CARD_LIBRARY.find(c => c.id === 'slash'), uid: 4 },
  { ...CARD_LIBRARY.find(c => c.id === 'defend'), uid: 5 },
  { ...CARD_LIBRARY.find(c => c.id === 'defend'), uid: 6 },
  { ...CARD_LIBRARY.find(c => c.id === 'reload'), uid: 7 },
];