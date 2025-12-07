export const GAME_STATE = {
  MENU: 'MENU',
  MAP_SELECT: 'MAP_SELECT', // 新增：地图选择阶段
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

export const STATUS_TYPES = {
  RADIATION: 'RADIATION',
  LOCK_ON: 'LOCK_ON',
  STUN: 'STUN'
};

export const ENEMY_INTENTS = {
  ATTACK: 'ATTACK',
  DEFEND: 'DEFEND',
  BUFF: 'BUFF',
  DEBUFF: 'DEBUFF',
  CHARGE: 'CHARGE',
  ESCAPE: 'ESCAPE',
  SLEEP: 'SLEEP'
};

export const LOCATION_TYPES = {
  RUINS: { id: 'RUINS', name: '城市废墟', color: 'zinc', desc: '普通的探索区域。', risk: 1 },
  ARSENAL: { id: 'ARSENAL', name: '军火库', color: 'red', desc: '高危区域。大量弹药补给。', risk: 2 },
  SUPPLY_DEPOT: { id: 'SUPPLY_DEPOT', name: '物资站', color: 'amber', desc: '可能有大量物资，或被掠夺者占据。', risk: 1 },
  RAD_ZONE: { id: 'RAD_ZONE', name: '辐射区', color: 'green', desc: '持续辐射伤害。极其危险的敌人。', risk: 3 },
};

export const MODULE_LIBRARY = [
  { id: 'auto_loader', name: '自动装填机', price: 120, desc: '战斗开始时，获得 2 发弹药。', trigger: 'COMBAT_START' },
  { id: 'nano_vest', name: '纳米背心', price: 100, desc: '每回合开始时，获得 3 点格挡。', trigger: 'TURN_START' },
  { id: 'scavenger', name: '回收协议', price: 80, desc: '战斗胜利获得的金钱增加 25%。', trigger: 'PASSIVE' },
  { id: 'vampire', name: '吸血鬼芯片', price: 150, desc: '每打出一张耗血卡牌，回复 1 点生命。', trigger: 'ON_HP_COST' },
  { id: 'stim_injector', name: '肾上腺素', price: 110, desc: '当生命值低于 30% 时，造成伤害 +50%。', trigger: 'PASSIVE_DMG' },
];

export const CARD_LIBRARY = [
  { id: 'shoot', name: '点射', type: CARD_TYPES.ATTACK, cost: 1, damage: 6, ammoCost: 1, desc: '造成 6 点伤害。消耗 1 发弹药。', price: 50 },
  { id: 'slash', name: '匕首挥砍', type: CARD_TYPES.ATTACK, cost: 1, damage: 5, ammoCost: 0, desc: '造成 5 点伤害。', price: 50 },
  { id: 'defend', name: '寻找掩体', type: CARD_TYPES.SKILL, cost: 1, block: 5, desc: '获得 5 点格挡。', price: 50 },
  { id: 'aim', name: '瞄准', type: CARD_TYPES.SKILL, cost: 0, draw: 2, desc: '抽 2 张牌。', price: 50 },
  { id: 'reload', name: '快速装填', type: CARD_TYPES.SKILL, cost: 1, addAmmo: 3, block: 3, desc: '获得 3 发弹药和 3 点格挡。', price: 75 },
  { id: 'burst', name: '全自动扫射', type: CARD_TYPES.ATTACK, cost: 2, damage: 4, times: 3, ammoCost: 3, desc: '造成 3 次 4 点伤害。消耗 3 发弹药。', price: 75 },
  { id: 'stimpack', name: '兴奋剂', type: CARD_TYPES.SKILL, cost: 0, energy: 2, hpCost: 3, desc: '失去 3 点生命，获得 2 点能量。', price: 75 },
  { id: 'smash', name: '枪托重击', type: CARD_TYPES.ATTACK, cost: 2, damage: 12, ammoCost: 0, desc: '造成 12 点伤害。', price: 75 },
  { id: 'execute', name: '处决', type: CARD_TYPES.ATTACK, cost: 2, damage: 20, ammoCost: 2, desc: '造成 20 点伤害。如果在敌人半血以下使用，造成双倍伤害。', price: 75 },
  { id: 'flashbang', name: '闪光震撼弹', type: CARD_TYPES.SKILL, cost: 1, ammoCost: 1, applyStatus: { type: STATUS_TYPES.STUN, val: 1 }, desc: '消耗1弹药。使敌人下回合[眩晕]。', price: 120 },
  { id: 'suppress', name: '压制射击', type: CARD_TYPES.ATTACK, cost: 2, damage: 8, ammoCost: 2, block: 8, desc: '造成8伤害，获得8格挡。', price: 90 },
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